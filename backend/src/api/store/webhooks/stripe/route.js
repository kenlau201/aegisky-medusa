/**
 * POST /store/webhooks/stripe
 * Stripe webhook endpoint
 * IMPORTANT: Must receive raw body for signature verification
 */
const { handleWebhook } = require('../../../../lib/stripe')

export async function POST(req) {
  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return Response.json({ error: 'No signature' }, { status: 400 })
    }

    // Get raw body for signature verification
    const rawBody = await req.text()

    const result = await handleWebhook(rawBody, signature)

    return Response.json(result)
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}
