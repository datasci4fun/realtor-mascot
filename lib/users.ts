import { query, ensureInitialized } from './db'
import bcrypt from 'bcryptjs'
import { AdminUser, UserFilters, CreateUserInput, UpdateUserInput } from '@/types/user'

/**
 * Get all admin users with optional filters
 */
export async function getUsers(filters?: UserFilters): Promise<AdminUser[]> {
  await ensureInitialized()

  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  if (filters?.role) {
    whereClause += ` AND role = $${paramIndex++}`
    params.push(filters.role)
  }

  if (filters?.isActive !== undefined) {
    whereClause += ` AND is_active = $${paramIndex++}`
    params.push(filters.isActive)
  }

  if (filters?.search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  const result = await query(
    `SELECT * FROM admin_users ${whereClause} ORDER BY created_at DESC`,
    params
  )

  return result.rows.map(rowToUser)
}

/**
 * Get user by ID
 */
export async function getUserById(id: string): Promise<AdminUser | null> {
  await ensureInitialized()

  const result = await query('SELECT * FROM admin_users WHERE id = $1', [id])

  if (result.rows.length === 0) return null

  return rowToUser(result.rows[0])
}

/**
 * Create a new user
 */
export async function createUser(input: CreateUserInput): Promise<AdminUser | null> {
  await ensureInitialized()

  try {
    const passwordHash = bcrypt.hashSync(input.password, 10)

    const result = await query(
      `INSERT INTO admin_users (email, password_hash, name, role, phone, is_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [
        input.email.toLowerCase(),
        passwordHash,
        input.name || null,
        input.role || 'agent',
        input.phone || null,
      ]
    )

    return rowToUser(result.rows[0])
  } catch (error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      throw new Error('A user with this email already exists')
    }
    throw error
  }
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  updates: UpdateUserInput
): Promise<AdminUser | null> {
  await ensureInitialized()

  const setClauses: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`)
    params.push(updates.name)
  }

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`)
    params.push(updates.email.toLowerCase())
  }

  if (updates.role !== undefined) {
    setClauses.push(`role = $${paramIndex++}`)
    params.push(updates.role)
  }

  if (updates.phone !== undefined) {
    setClauses.push(`phone = $${paramIndex++}`)
    params.push(updates.phone)
  }

  if (updates.isActive !== undefined) {
    setClauses.push(`is_active = $${paramIndex++}`)
    params.push(updates.isActive)
  }

  if (updates.password !== undefined) {
    setClauses.push(`password_hash = $${paramIndex++}`)
    params.push(bcrypt.hashSync(updates.password, 10))
  }

  if (setClauses.length === 0) return null

  params.push(id)

  try {
    const result = await query(
      `UPDATE admin_users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    )

    if (result.rows.length === 0) return null

    return rowToUser(result.rows[0])
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('A user with this email already exists')
    }
    throw error
  }
}

/**
 * Delete user (only deactivate, never actually delete)
 */
export async function deactivateUser(id: string): Promise<boolean> {
  await ensureInitialized()

  const result = await query(
    'UPDATE admin_users SET is_active = FALSE WHERE id = $1',
    [id]
  )

  return (result.rowCount ?? 0) > 0
}

/**
 * Reactivate user
 */
export async function reactivateUser(id: string): Promise<boolean> {
  await ensureInitialized()

  const result = await query(
    'UPDATE admin_users SET is_active = TRUE WHERE id = $1',
    [id]
  )

  return (result.rowCount ?? 0) > 0
}

/**
 * Get user stats
 */
export async function getUserStats(): Promise<{
  total: number
  active: number
  admins: number
  agents: number
}> {
  await ensureInitialized()

  const result = await query(`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE is_active = TRUE) as active,
      COUNT(*) FILTER (WHERE role = 'admin') as admins,
      COUNT(*) FILTER (WHERE role = 'agent') as agents
    FROM admin_users
  `)

  const row = result.rows[0]
  return {
    total: parseInt(row.total),
    active: parseInt(row.active),
    admins: parseInt(row.admins),
    agents: parseInt(row.agents),
  }
}

/**
 * Convert database row to User object
 */
function rowToUser(row: any): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active !== false,
    createdAt: row.created_at,
    lastLogin: row.last_login,
  }
}
