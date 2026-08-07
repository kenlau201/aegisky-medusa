'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  verified: boolean
  helpful: number
  createdAt: string
}

interface ReviewsContextType {
  reviews: Review[]
  getProductReviews: (productId: string) => Review[]
  getAverageRating: (productId: string) => { average: number; count: number }
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'helpful'>) => void
  markHelpful: (reviewId: string) => void
  hasUserReviewed: (productId: string, userId: string) => boolean
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

const REVIEWS_STORAGE_KEY = 'aegisky-reviews'

// Seed reviews for demo
const seedReviews: Review[] = [
  {
    id: 'rev_1',
    productId: 'jsi-d15-enterprise-28255',
    userId: 'seed_1',
    userName: 'Michael Chen',
    rating: 5,
    title: 'Excellent build quality',
    comment: 'The JSI D15 exceeded our expectations. Build quality is top-notch and the flight performance is stable even in windy conditions. Perfect for our surveying work.',
    verified: true,
    helpful: 12,
    createdAt: '2026-06-15T10:00:00Z',
  },
  {
    id: 'rev_2',
    productId: 'jsi-d15-enterprise-28255',
    userId: 'seed_2',
    userName: 'Dmitri Volkov',
    rating: 4,
    title: 'Good drone, minor setup issues',
    comment: 'Great drone overall. Took a bit of time to calibrate properly but once set up it flies perfectly. Customer support was helpful.',
    verified: true,
    helpful: 8,
    createdAt: '2026-05-22T14:30:00Z',
  },
  {
    id: 'rev_3',
    productId: 'jsi-d15-enterprise-28255',
    userId: 'seed_3',
    userName: 'Sarah Williams',
    rating: 5,
    title: 'Reliable for industrial inspections',
    comment: 'We use this for power line inspections. The thermal camera option works great and battery life is as advertised. Highly recommend for professional use.',
    verified: true,
    helpful: 15,
    createdAt: '2026-04-10T09:15:00Z',
  },
]

function loadReviews(): Review[] {
  try {
    const stored = localStorage.getItem(REVIEWS_STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    // First load - use seed
    saveReviews(seedReviews)
    return seedReviews
  } catch {
    return seedReviews
  }
}

function saveReviews(reviews: Review[]) {
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews))
}

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    setReviews(loadReviews())
  }, [])

  const getProductReviews = (productId: string) =>
    reviews.filter(r => r.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getAverageRating = (productId: string) => {
    const productReviews = reviews.filter(r => r.productId === productId)
    if (productReviews.length === 0) return { average: 0, count: 0 }
    const sum = productReviews.reduce((acc, r) => acc + r.rating, 0)
    return { average: sum / productReviews.length, count: productReviews.length }
  }

  const addReview = (review: Omit<Review, 'id' | 'createdAt' | 'helpful'>) => {
    const newReview: Review = {
      ...review,
      id: 'rev_' + Date.now().toString(36),
      helpful: 0,
      createdAt: new Date().toISOString(),
    }
    const updated = [newReview, ...reviews]
    setReviews(updated)
    saveReviews(updated)
  }

  const markHelpful = (reviewId: string) => {
    const updated = reviews.map(r =>
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    )
    setReviews(updated)
    saveReviews(updated)
  }

  const hasUserReviewed = (productId: string, userId: string) =>
    reviews.some(r => r.productId === productId && r.userId === userId)

  return (
    <ReviewsContext.Provider value={{ reviews, getProductReviews, getAverageRating, addReview, markHelpful, hasUserReviewed }}>
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (!context) {
    throw new Error('useReviews must be used within ReviewsProvider')
  }
  return context
}

export function StarRating({ rating, size = 16, showValue = false }: { rating: number; size?: number; showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= Math.round(rating) ? '#facc15' : 'none'}
          stroke={star <= Math.round(rating) ? '#facc15' : '#d1d5db'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      {showValue && <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  )
}
