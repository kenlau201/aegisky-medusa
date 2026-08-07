'use client'

import { useState } from 'react'
import { Star, ThumbsUp, MessageSquare, CheckCircle } from 'lucide-react'
import { useReviews, StarRating } from '@/lib/reviews-context'
import { useAuth } from '@/lib/auth-context'
import { LanguageCode } from '@/i18n'

export default function ProductReviews({ productId, lang }: { productId: string; lang: LanguageCode }) {
  const { getProductReviews, getAverageRating, addReview, markHelpful, hasUserReviewed } = useReviews()
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [newRating, setNewRating] = useState(5)
  const [newTitle, setNewTitle] = useState('')
  const [newComment, setNewComment] = useState('')
  const [hoverRating, setHoverRating] = useState(0)

  const reviews = getProductReviews(productId)
  const { average, count } = getAverageRating(productId)
  const alreadyReviewed = user ? hasUserReviewed(productId, user.id) : false

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    addReview({
      productId,
      userId: user.id,
      userName: user.name,
      rating: newRating,
      title: newTitle,
      comment: newComment,
      verified: true,
    })
    setShowForm(false)
    setNewTitle('')
    setNewComment('')
    setNewRating(5)
  }

  const labels = {
    reviews: lang === 'ru' ? 'Отзывы' : lang === 'zh' ? '评价' : 'Reviews',
    noReviews: lang === 'ru' ? 'Пока нет отзывов' : lang === 'zh' ? '暂无评价' : 'No reviews yet',
    writeReview: lang === 'ru' ? 'Написать отзыв' : lang === 'zh' ? '写评价' : 'Write a Review',
    loginToReview: lang === 'ru' ? 'Войдите, чтобы оставить отзыв' : lang === 'zh' ? '登录后写评价' : 'Sign in to write a review',
    alreadyReviewed: lang === 'ru' ? 'Вы уже оставили отзыв' : lang === 'zh' ? '您已评价过' : 'You already reviewed this product',
    yourRating: lang === 'ru' ? 'Ваша оценка' : lang === 'zh' ? '您的评分' : 'Your Rating',
    title: lang === 'ru' ? 'Заголовок' : lang === 'zh' ? '标题' : 'Title',
    comment: lang === 'ru' ? 'Комментарий' : lang === 'zh' ? '评论' : 'Comment',
    submit: lang === 'ru' ? 'Отправить' : lang === 'zh' ? '提交' : 'Submit Review',
    cancel: lang === 'ru' ? 'Отмена' : lang === 'zh' ? '取消' : 'Cancel',
    helpful: lang === 'ru' ? 'Полезно' : lang === 'zh' ? '有帮助' : 'Helpful',
    verified: lang === 'ru' ? 'Проверенная покупка' : lang === 'zh' ? '已验证购买' : 'Verified Purchase',
    basedOn: lang === 'ru' ? 'На основе' : lang === 'zh' ? '基于' : 'Based on',
  }

  // Rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percent: count > 0 ? (reviews.filter(r => r.rating === star).length / count) * 100 : 0,
  }))

  return (
    <div className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare size={24} className="text-blue-600" />
        {labels.reviews} ({count})
      </h2>

      {/* Summary */}
      {count > 0 && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center md:text-left">
              <div className="text-4xl font-bold text-gray-900 mb-2">{average.toFixed(1)}</div>
              <StarRating rating={average} size={20} />
              <p className="text-sm text-gray-500 mt-2">{labels.basedOn} {count} {labels.reviews.toLowerCase()}</p>
            </div>
            <div className="space-y-2">
              {ratingBreakdown.map(({ star, count: c, percent }) => (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-gray-600">{star}</span>
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="w-8 text-gray-500 text-right">{c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Write review button */}
      {!showForm && (
        <div className="mb-6">
          {user ? (
            alreadyReviewed ? (
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                {labels.alreadyReviewed}
              </p>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {labels.writeReview}
              </button>
            )
          ) : (
            <p className="text-sm text-gray-500">
              {labels.loginToReview}
            </p>
          )}
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">{labels.writeReview}</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.yourRating}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={star <= (hoverRating || newRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.title}</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">{labels.comment}</label>
            <textarea
              required
              rows={4}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
              {labels.submit}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              {labels.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.userName}</div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size={14} />
                      {review.verified && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle size={12} />
                          {labels.verified}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              {review.title && <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>}
              <p className="text-gray-600 text-sm mb-3">{review.comment}</p>
              <button
                onClick={() => markHelpful(review.id)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition"
              >
                <ThumbsUp size={14} />
                {labels.helpful} ({review.helpful})
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <MessageSquare className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">{labels.noReviews}</p>
          </div>
        )
      )}
    </div>
  )
}
