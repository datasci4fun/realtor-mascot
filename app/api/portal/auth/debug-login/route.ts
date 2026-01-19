import { NextResponse } from 'next/server'
import { query, ensureInitialized } from '@/lib/db'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// DEBUG ONLY - Remove in production
// This endpoint allows direct login without magic link for testing

const PORTAL_COOKIE = 'portal_session'
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function POST(request: Request) {
  // Only allow in development or with debug flag
  const isDev = process.env.NODE_ENV === 'development'
  const debugEnabled = process.env.PORTAL_DEBUG_LOGIN === 'true'

  if (!isDev && !debugEnabled) {
    return NextResponse.json(
      { error: 'Debug login disabled' },
      { status: 403 }
    )
  }

  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      )
    }

    await ensureInitialized()

    // Find the lead
    const leadResult = await query(
      'SELECT id, name, email FROM leads WHERE LOWER(email) = LOWER($1)',
      [email]
    )

    if (leadResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'No account found with this email' },
        { status: 404 }
      )
    }

    const lead = leadResult.rows[0]

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString('hex')
    const sessionExpires = new Date(Date.now() + SESSION_DURATION)

    // Remove any existing sessions for this lead
    await query(
      `DELETE FROM client_sessions WHERE lead_id = $1 AND token_type = 'session'`,
      [lead.id]
    )

    // Create new session
    await query(
      `INSERT INTO client_sessions (lead_id, token, token_type, expires_at)
       VALUES ($1, $2, 'session', $3)`,
      [lead.id, sessionToken, sessionExpires]
    )

    // Set session cookie
    const cookieStore = await cookies()
    cookieStore.set(PORTAL_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION / 1000,
      path: '/',
    })

    console.log(`[DEBUG LOGIN] Created session for ${lead.email}`)

    return NextResponse.json({
      success: true,
      message: 'Debug login successful',
      user: { name: lead.name, email: lead.email }
    })

  } catch (error) {
    console.error('Debug login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
