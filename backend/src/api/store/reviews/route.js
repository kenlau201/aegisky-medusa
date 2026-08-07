/**
 * GET /store/reviews?productId=xxx
 * POST /store/reviews - Submit product review
 */

const { getDbClient } = require('../../../lib/db')
const { safeHandler, AppError } = require('../../../lib/security')

module.exports = {
  // Get approved reviews for a product
  GET: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { productId } = req.query

    if (!productId) throw new AppError('VALIDATION_ERROR', 'Product ID is required', 400)

    const reviews = await db.query(`
      SELECT r.id, r.rating, r.title, r.content, r.is_verified_purchase,
             r.helpful_count, r.images, r.created_at,
             c.first_name, c.last_name, c.company
      FROM aegisky_reviews r
      LEFT JOIN aegisky_customers c ON r.customer_id = c.id
      WHERE r.product_id = $1 AND r.is_approved = true
      ORDER BY r.created_at DESC
      LIMIT 50
    `, [productId])

    // Calculate average rating
    const stats = await db.query(`
      SELECT
        COUNT(*) as total,
        ROUND(AVG(rating)::numeric, 1) as average,
        COUNT(*) FILTER (WHERE rating = 5) as five_star,
        COUNT(*) FILTER (WHERE rating = 4) as four_star,
        COUNT(*) FILTER (WHERE rating = 3) as three_star,
        COUNT(*) FILTER (WHERE rating = 2) as two_star,
        COUNT(*) FILTER (WHERE rating = 1) as one_star
      FROM aegisky_reviews
      WHERE product_id = $1 AND is_approved = true
    `, [productId])

    res.json({
      reviews: reviews.rows.map(r => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isVerifiedPurchase: r.is_verified_purchase,
        helpfulCount: r.helpful_count,
        images: r.images,
        createdAt: r.created_at,
        author: {
          name: r.first_name ? `${r.first_name} ${r.last_name?.[0] || ''}.` : 'Anonymous',
          company: r.company,
        },
      })),
      stats: stats.rows[0],
    })
  }),

  // Submit a review
  POST: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { productId, orderId, rating, title, content, customerId } = req.body

    if (!productId || !rating) throw new AppError('VALIDATION_ERROR', 'Product ID and rating are required', 400)
    if (rating < 1 || rating > 5) throw new AppError('VALIDATION_ERROR', 'Rating must be between 1 and 5', 400)

    // Check if verified purchase
    let isVerified = false
    if (orderId) {
      const order = await db.query(
        'SELECT id FROM aegisky_orders WHERE id = $1 AND status = $2',
        [orderId, 'completed']
      )
      isVerified = order.rows.length > 0
    }

    const result = await db.query(`
      INSERT INTO aegisky_reviews (
        product_id, customer_id, order_id, rating, title, content,
        is_verified_purchase, is_approved, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, false, 'pending')
      RETURNING id
    `, [productId, customerId || null, orderId || null, rating, title, content, isVerified])

    res.status(201).json({
      success: true,
      reviewId: result.rows[0].id,
      isVerifiedPurchase: isVerified,
      message: 'Review submitted. It will appear after approval.',
    })
  })
}
