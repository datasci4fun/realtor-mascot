import { query, ensureInitialized } from './db'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { sendMagicLinkEmail } from './email'
import type { PortalClient, ClientSession } from '@/types/portal'

// Configuration
const PORTAL_COOKIE = 'portal_session'
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000 // 15 minutes
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

// ============================================
// Token Generation
// ============================================

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// ============================================
// Magic Link Functions
// ============================================

/**
 * Request a magic link for email login
 * Creates a magic_link token and sends email
 */
export async function requestMagicLink(
  email: string
): Promise<{ success: boolean; error?: string }> {
  await ensureInitialized()

  // Check if email exists in leads table
  const leadResult = await query(
    'SELECT id, name, email FROM leads WHERE LOWER(email) = LOWER($1)',
    [email]
  )

  if (leadResult.rows.length === 0) {
    // Don't reveal whether email exists or not for security
    // But still return success to prevent email enumeration
    console.log(`Magic link requested for unknown email: ${email}`)
    return { success: true }
  }

  const lead = leadResult.rows[0]

  // Generate magic link token
  const token = generateToken()
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY)

  // Remove any existing magic link tokens for this lead
  await query(
    `DELETE FROM client_sessions WHERE lead_id = $1 AND token_type = 'magic_link'`,
    [lead.id]
  )

  // Create new magic link token
  await query(
    `INSERT INTO client_sessions (lead_id, token, token_type, expires_at)
     VALUES ($1, $2, 'magic_link', $3)`,
    [lead.id, token, expiresAt]
  )

  // Send magic link email
  const emailResult = await sendMagicLinkEmail(lead.email, token, lead.name)

  if (!emailResult.success) {
    console.error('Failed to send magic link email:', emailResult.error)
    return { success: false, error: 'Failed to send email. Please try again.' }
  }

  return { success: true }
}

/**
 * Verify a magic link token and create a session
 */
export async function verifyMagicLink(
  token: string
): Promise<{ success: boolean; error?: string }> {
  await ensureInitialized()

  // Find valid magic link token
  const tokenResult = await query(
    `SELECT cs.*, l.email, l.name
     FROM client_sessions cs
     JOIN leads l ON cs.lead_id = l.id
     WHERE cs.token = $1
       AND cs.token_type = 'magic_link'
       AND cs.expires_at > NOW()
       AND cs.used_at IS NULL`,
    [token]
  )

  if (tokenResult.rows.length === 0) {
    return { success: false, error: 'Invalid or expired link. Please request a new one.' }
  }

  const magicLinkSession = tokenResult.rows[0]

  // Mark magic link as used
  await query(
    `UPDATE client_sessions SET used_at = NOW() WHERE id = $1`,
    [magicLinkSession.id]
  )

  // Create session token
  const sessionToken = generateToken()
  const sessionExpires = new Date(Date.now() + SESSION_DURATION)

  // Remove any existing session tokens for this lead
  await query(
    `DELETE FROM client_sessions WHERE lead_id = $1 AND token_type = 'session'`,
    [magicLinkSession.lead_id]
  )

  // Create new session
  await query(
    `INSERT INTO client_sessions (lead_id, token, token_type, expires_at)
     VALUES ($1, $2, 'session', $3)`,
    [magicLinkSession.lead_id, sessionToken, sessionExpires]
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

  return { success: true }
}

// ============================================
// Session Management
// ============================================

/**
 * Validate session token and return client
 */
export async function validatePortalSession(
  sessionToken: string
): Promise<PortalClient | null> {
  await ensureInitialized()

  const result = await query(
    `SELECT l.id, l.name, l.email, l.phone, l.intent, l.timeline, l.budget, l.created_at
     FROM client_sessions cs
     JOIN leads l ON cs.lead_id = l.id
     WHERE cs.token = $1
       AND cs.token_type = 'session'
       AND cs.expires_at > NOW()`,
    [sessionToken]
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    intent: row.intent,
    timeline: row.timeline,
    budget: row.budget,
    created_at: row.created_at,
  }
}

/**
 * Get current portal client from session cookie
 */
export async function getPortalClient(): Promise<PortalClient | null> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(PORTAL_COOKIE)?.value

  if (!sessionToken) return null

  return validatePortalSession(sessionToken)
}

/**
 * Logout portal client
 */
export async function logoutPortalClient(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(PORTAL_COOKIE)?.value

  if (sessionToken) {
    await query(`DELETE FROM client_sessions WHERE token = $1`, [sessionToken])
  }

  cookieStore.delete(PORTAL_COOKIE)
}

/**
 * Extend session expiry (call on activity)
 */
export async function extendPortalSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(PORTAL_COOKIE)?.value

  if (!sessionToken) return

  const newExpiry = new Date(Date.now() + SESSION_DURATION)

  await query(
    `UPDATE client_sessions SET expires_at = $1 WHERE token = $2 AND token_type = 'session'`,
    [newExpiry, sessionToken]
  )

  // Update cookie expiry
  cookieStore.set(PORTAL_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })
}

// ============================================
// Cleanup
// ============================================

/**
 * Clean up expired tokens
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await query(
    `DELETE FROM client_sessions WHERE expires_at <= NOW()`
  )
  return result.rowCount ?? 0
}

/**
 * Require portal authentication (for server components/actions)
 * Returns client or throws redirect
 */
export async function requirePortalAuth(): Promise<PortalClient> {
  const client = await getPortalClient()
  if (!client) {
    throw new Error('UNAUTHORIZED')
  }
  return client
}
