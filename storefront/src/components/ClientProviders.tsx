'use client'

import { CartProvider } from '@/lib/cart-context'
import { CurrencyProvider } from '@/lib/currency-context'
import { AuthProvider } from '@/lib/auth-context'
import { RFQProvider } from '@/lib/rfq-context'
import { ReviewsProvider } from '@/lib/reviews-context'
import { OrderProvider } from '@/lib/order-context'
import { CompareProvider } from '@/lib/compare-context'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <RFQProvider>
              <ReviewsProvider>
                <CompareProvider>
                  {children}
                </CompareProvider>
              </ReviewsProvider>
            </RFQProvider>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </CurrencyProvider>
  )
}
