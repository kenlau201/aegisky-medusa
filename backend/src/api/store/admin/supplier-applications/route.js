/**
 * GET /store/admin/supplier-applications - List supplier applications
 * PATCH /store/admin/supplier-applications/:id - Approve/reject
 */

const { getDbClient } = require('../../../../lib/db')
const { hashPassword, generateTemporaryPassword } = require('../../../../lib/auth')
const { safeHandler, AppError } = require('../../../../lib/security')

module.exports = {
  GET: safeHandler(async (req, res) => {
    const db = getDbClient()
    const { status, page = 1, limit = 20 } = req.query
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM aegisky_supplier_applications'
    const params = []
    if (status) {
      query += ' WHERE status = $1'
      params.push(status)
    }
    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2)
    params.push(limit, offset)

    const result = await db.query(query, params)
    res.json({ applications: result.rows, page: Number(page), limit: Number(limit) })
  })
}
