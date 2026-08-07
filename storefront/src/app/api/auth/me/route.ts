import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000'
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_PUBLISHABLE_KEY || 'pk_2f2350f9a72ea702a46d0a68566194d73ff4ef26a7ff20f4b60294beb8869a0a'

export async function GET(request: Request) {
  try {
    // Read token from HttpOnly cookie
    const cookieStore = cookies()
    const token = cookieStore.get('aegisky_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const customerResponse = await fetch(`${API_BASE}/store/customers/me`, {
      headers: {
        'x-publishable-api-key': PUBLISHABLE_KEY,
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    })

    if (!customerResponse.ok) {
      // Invalid token - clear cookie
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.delete('aegisky_token')
      return response
    }

    const customerData = await customerResponse.json()
    const customer = customerData.customer

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email,
        phone: customer.phone,
        company: customer.company_name || customer.metadata?.company,
        country: customer.metadata?.country,
        createdAt: customer.created_at,
      },
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE() {
  // Logout - clear the HttpOnly cookie
  const response = NextResponse.json({ success: true })
  response.cookies.delete('aegisky_token')
  return response
}
