import { NextResponse } from 'next/server'
import { pool } from '@/lib/control-tower/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60,
}

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
    const { email, password, name, company, phone, country } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists
    const existing = await pool.query(
      'SELECT id FROM aegisky_customers WHERE email = $1',
      [normalizedEmail]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Parse name
    const nameParts = (name || '').trim().split(/\s+/)
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // Create customer
    const result = await pool.query(
      `INSERT INTO aegisky_customers (email, password_hash, first_name, last_name, company, phone, country, role, status, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'buyer', 'active', false)
       RETURNING id, email, first_name, last_name, company, phone, country, role, status, created_at`,
      [normalizedEmail, passwordHash, firstName, lastName, company || null, phone || null, country || null]
    )

    const customer = result.rows[0]
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
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
