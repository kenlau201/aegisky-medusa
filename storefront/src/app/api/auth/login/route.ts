import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

// Cookie settings - HttpOnly to prevent XSS token theft
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Authenticate with Medusa
    const authResponse = await fetch(`${API_BASE}/auth/customer/emailpass`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    if (!authResponse.ok) {
      const errorData = await authResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Invalid email or password' },
        { status: authResponse.status }
      )
    }

    const authData = await authResponse.json()

    // Get customer details
    let customer = null
    try {
      const customerResponse = await fetch(`${API_BASE}/store/customers/me`, {
        headers: {
          'x-publishable-api-key': PUBLISHABLE_KEY,
          'Authorization': `Bearer ${authData.token}`,
        },
      })
      if (customerResponse.ok) {
        const customerData = await customerResponse.json()
        customer = customerData.customer
      }
    } catch (e) {
      console.log('Could not fetch customer details')
    }

    const customerInfo = customer ? {
      id: customer.id,
      email: customer.email,
      name: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email,
      phone: customer.phone,
      company: customer.company_name,
      createdAt: customer.created_at,
    } : {
      id: authData.actor_id,
      email,
      name: email,
    }

    // Set JWT in HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      customer: customerInfo,
    })

    response.cookies.set('aegisky_token', authData.token, COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Login proxy error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
