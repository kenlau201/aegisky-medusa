import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, company, phone } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Register auth identity
    const registerResponse = await fetch(`${API_BASE}/auth/customer/emailpass/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ email, password }),
    })

    if (!registerResponse.ok) {
      const errorData = await registerResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.message || 'Registration failed' },
        { status: registerResponse.status }
      )
    }

    const registerData = await registerResponse.json()

    // Create customer record
    const [firstName, ...lastNameParts] = (name || '').split(' ')
    await fetch(`${API_BASE}/store/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${registerData.token}`,
      },
      body: JSON.stringify({
        email,
        first_name: firstName || '',
        last_name: lastNameParts.join(' ') || '',
        company_name: company || '',
        phone: phone || '',
      }),
    }).catch(() => {})

    // Set HttpOnly cookie
    const response = NextResponse.json({
      success: true,
      customer: {
        id: registerData.actor_id,
        email,
        name: name || email,
        company,
        phone,
      },
    })

    response.cookies.set('aegisky_token', registerData.token, COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Register proxy error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
