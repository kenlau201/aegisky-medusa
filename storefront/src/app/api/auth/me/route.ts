import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { pool } from '@/lib/control-tower/db'
import crypto from 'crypto'

function verifyToken(token: string): { sub: string; email: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const [header, payload, signature] = parts
    const secret = process.env.JWT_SECRET || 'aegisky-jwt-secret-2026'
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url')

    if (signature !== expectedSig) return null

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null

    return { sub: data.sub, email: data.email }
  } catch {
    return null
  }
}

export const runtime = 'nodejs'

export async function GET() {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get('aegisky_token')?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.delete('aegisky_token')
      return response
    }

    const result = await pool.query(
      'SELECT id, email, first_name, last_name, company, phone, country, role, email_verified, created_at FROM aegisky_customers WHERE id = $1',
      [decoded.sub]
    )

    const customer = result.rows[0]
    if (!customer) {
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.delete('aegisky_token')
      return response
    }

    return NextResponse.json({
      authenticated: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phone: customer.phone,
        company: customer.company,
        country: customer.country,
        role: customer.role,
        emailVerified: customer.email_verified,
        createdAt: customer.created_at,
      },
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('aegisky_token')
  return response
}
