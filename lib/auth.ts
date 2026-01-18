import { query, ensureInitialized } from './db'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'agent'
  createdAt: string
  lastLogin: string | null
}

// ============================================
// User Management
// ============================================

/**
 * Create a new admin user
 */
export async function createAdminUser(
  email: string,
  password: string,
  name?: string,
  role: 'admin' | 'agent' = 'agent'
): Promise<AdminUser | null> {
  try {
    await ensureInitialized()

    const passwordHash = bcrypt.hashSync(password, 10)

    const result = await query(
      `INSERT INTO admin_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, created_at, last_login`,
      [email.toLowerCase(), passwordHash, name || null, role]
    )

    const row = result.rows[0]
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
      lastLogin: row.last_login,
    }
  } catch (error) {
    console.error('Failed to create admin user:', error)
    return null
  }
}

/**
 * Get admin user by email
 */
export async function getAdminUserByEmail(
  email: string
): Promise<(AdminUser & { passwordHash: string }) | null> {
  await ensureInitialized()

  const result = await query('SELECT * FROM admin_users WHERE email = $1', [
    email.toLowerCase(),
  ])

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    lastLogin: row.last_login,
    passwordHash: row.password_hash,
  }
}

/**
 * Get admin user by ID
 */
export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  await ensureInitialized()

  const result = await query('SELECT * FROM admin_users WHERE id = $1', [id])

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  }
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

/**
 * Update last login time
 */
export async function updateLastLogin(userId: string): Promise<void> {
  await query('UPDATE admin_users SET last_login = NOW() WHERE id = $1', [userId])
}

// ============================================
// Session Management
// ============================================

/**
 * Create a new session
 */
export async function createSession(userId: string): Promise<string> {
  await ensureInitialized()

  const sessionId = uuidv4()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  // Clean up old sessions for this user
  await query('DELETE FROM sessions WHERE user_id = $1', [userId])

  // Create new session
  await query(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)',
    [sessionId, userId, expiresAt]
  )

  return sessionId
}

/**
 * Validate session and get user
 */
export async function validateSession(sessionId: string): Promise<AdminUser | null> {
  await ensureInitialized()

  const result = await query(
    `SELECT u.* FROM sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  }
}

/**
 * Delete session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await query('DELETE FROM sessions WHERE id = $1', [sessionId])
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query('DELETE FROM sessions WHERE expires_at <= NOW()')
  return result.rowCount ?? 0
}

// ============================================
// Auth Helpers for Server Components/Actions
// ============================================

/**
 * Get current user from session cookie
 */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) return null

  return validateSession(sessionId)
}

/**
 * Login user and set session cookie
 */
export async function login(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getAdminUserByEmail(email)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: 'Invalid email or password' }
  }

  const sessionId = await createSession(user.id)
  await updateLastLogin(user.id)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION / 1000,
    path: '/',
  })

  return { success: true }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await deleteSession(sessionId)
  }

  cookieStore.delete(SESSION_COOKIE)
}

/**
 * Check if any admin users exist (for initial setup)
 */
export async function hasAdminUsers(): Promise<boolean> {
  await ensureInitialized()

  const result = await query('SELECT COUNT(*) as count FROM admin_users')
  return parseInt(result.rows[0].count) > 0
}

/**
 * Initialize default admin if none exist
 */
export async function initializeDefaultAdmin(): Promise<void> {
  const hasUsers = await hasAdminUsers()
  if (!hasUsers) {
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'changeme123'
    await createAdminUser('admin@example.com', defaultPassword, 'Admin', 'admin')
    console.log('Default admin created: admin@example.com / ' + defaultPassword)
    console.log('PLEASE CHANGE THIS PASSWORD IMMEDIATELY!')
  }
}
