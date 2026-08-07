import { NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

// Cookie settings - HttpOnly to prevent XSS token theft
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60, // 7 days
}

// Simple JWT-like token generation (no external JWT dependency needed)
function generateToken(customerId: string, email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    sub: customerId,
    email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  })).toString('base64url')
  const secret = process.env.JWT_SECRET || 'aegisky-jwt-secret-2026'
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url')
  return `${header}.${payload}.${signature}`
}

export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Find customer by email in local database
    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, company, phone, country, role, status, email_verified, created_at FROM aegisky_customers WHERE email = $1',
      [email.toLowerCase().trim()]
    )

    const customer = result.rows[0]

    if (!customer) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (customer.status !== 'active') {
      return NextResponse.json({ error: 'Account is not active' }, { status: 403 })
    }

    // Verify password with bcrypt
    const passwordValid = await bcrypt.compare(password, customer.password_hash)
    if (!passwordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Update last login and login count
    await pool.query(
      'UPDATE aegisky_customers SET last_login = NOW(), login_count = login_count + 1 WHERE id = $1',
      [customer.id]
    )

    // Generate token
    const token = generateToken(customer.id, customer.email)

    const customerInfo = {
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
    }

    const response = NextResponse.json({
      success: true,
      customer: customerInfo,
      token,
    })

    response.cookies.set('aegisky_token', token, COOKIE_OPTIONS)

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
