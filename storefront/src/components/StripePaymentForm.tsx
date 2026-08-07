'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Loader2, Lock, AlertCircle } from 'lucide-react'

// Test publishable key - in production this comes from API
const stripePromise = loadStripe('pk_test_51PlaceholderReplaceWithRealKey')

interface StripePaymentFormProps {
  clientSecret: string | null
  amount: number
  currency: string
  onSuccess: (paymentIntentId: string) => void
  onError: (message: string) => void
}

function CheckoutForm({ clientSecret, amount, currency, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system not ready')
      return
    }

    setProcessing(true)
    setError(null)

    try {
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }

      // In test mode without real Stripe key, simulate success
      if (clientSecret.startsWith('pi_test_')) {
        await new Promise(r => setTimeout(r, 2000))
        onSuccess(`pi_simulated_${Date.now()}`)
        return
      }

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (result.error) {
        setError(result.error.message || 'Payment failed')
        onError(result.error.message || 'Payment failed')
      } else if (result.paymentIntent?.status === 'succeeded') {
        onSuccess(result.paymentIntent.id)
      } else {
        setError('Payment processing failed')
        onError('Payment processing failed')
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed')
      onError(err.message || 'Payment failed')
    } finally {
      setProcessing(false)
    }
  }

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg bg-white">
        <CardElement options={cardStyle} />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {processing ? (
          <><Loader2 size={20} className="animate-spin" /> Processing...</>
        ) : (
          <><Lock size={18} /> Pay {currency.toUpperCase()} {amount.toFixed(2)}</>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
        <Lock size={12} /> Secured by Stripe · 256-bit SSL encryption
      </p>
    </form>
  )
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret: props.clientSecret || undefined }}>
      <CheckoutForm {...props} />
    </Elements>
  )
}
