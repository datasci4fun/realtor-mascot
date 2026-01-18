import { pool } from './db'

export interface AuditLogEntry {
  id: string
  userId: string | null
  userName?: string | null
  userEmail?: string | null
  action: string
  entityType: string
  entityId: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

export interface LogAuditData {
  userId?: string | null
  action: string
  entityType: string
  entityId?: string | null
  oldValues?: Record<string, unknown> | null
  newValues?: Record<string, unknown> | null
  ipAddress?: string | null
}

// Log an action to the audit log
export async function logAudit(data: LogAuditData): Promise<void> {
  try {
    await pool.query(
      `
      INSERT INTO audit_log (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
      [
        data.userId || null,
        data.action,
        data.entityType,
        data.entityId || null,
        data.oldValues ? JSON.stringify(data.oldValues) : null,
        data.newValues ? JSON.stringify(data.newValues) : null,
        data.ipAddress || null,
      ]
    )
  } catch (error) {
    console.error('Failed to log audit entry:', error)
    // Don't throw - audit logging should not break the main operation
  }
}

// Get audit log entries with filters
export async function getAuditLog(options: {
  userId?: string
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ entries: AuditLogEntry[]; total: number }> {
  let countQuery = `
    SELECT COUNT(*) as total
    FROM audit_log al
    LEFT JOIN admin_users au ON al.user_id = au.id
    WHERE 1=1
  `

  let query = `
    SELECT
      al.*,
      au.name as user_name,
      au.email as user_email
    FROM audit_log al
    LEFT JOIN admin_users au ON al.user_id = au.id
    WHERE 1=1
  `

  const params: (string | Date | number)[] = []
  let paramIndex = 1

  if (options.userId) {
    const condition = ` AND al.user_id = $${paramIndex++}`
    query += condition
    countQuery += condition
    params.push(options.userId)
  }

  if (options.action) {
    const condition = ` AND al.action = $${paramIndex++}`
    query += condition
    countQuery += condition
    params.push(options.action)
  }

  if (options.entityType) {
    const condition = ` AND al.entity_type = $${paramIndex++}`
    query += condition
    countQuery += condition
    params.push(options.entityType)
  }

  if (options.startDate) {
    const condition = ` AND al.created_at >= $${paramIndex++}`
    query += condition
    countQuery += condition
    params.push(new Date(options.startDate))
  }

  if (options.endDate) {
    const condition = ` AND al.created_at <= $${paramIndex++}`
    query += condition
    countQuery += condition
    params.push(new Date(options.endDate + 'T23:59:59'))
  }

  if (options.search) {
    const condition = ` AND (au.name ILIKE $${paramIndex} OR au.email ILIKE $${paramIndex} OR al.action ILIKE $${paramIndex})`
    query += condition
    countQuery += condition
    params.push(`%${options.search}%`)
    paramIndex++
  }

  // Get total count
  const countResult = await pool.query(countQuery, params.slice(0, paramIndex - 1))
  const total = parseInt(countResult.rows[0].total)

  // Add sorting and pagination
  query += ` ORDER BY al.created_at DESC`

  const limit = options.limit || 50
  const offset = options.offset || 0
  query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)

  return {
    entries: result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      userName: row.user_name,
      userEmail: row.user_email,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      oldValues: row.old_values,
      newValues: row.new_values,
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    })),
    total,
  }
}

// Get unique actions for filtering
export async function getUniqueActions(): Promise<string[]> {
  const result = await pool.query(`
    SELECT DISTINCT action FROM audit_log ORDER BY action
  `)
  return result.rows.map((row) => row.action)
}

// Get unique entity types for filtering
export async function getUniqueEntityTypes(): Promise<string[]> {
  const result = await pool.query(`
    SELECT DISTINCT entity_type FROM audit_log ORDER BY entity_type
  `)
  return result.rows.map((row) => row.entity_type)
}

// Helper to create action labels
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted',
    login: 'Logged in',
    logout: 'Logged out',
    assign: 'Assigned',
    unassign: 'Unassigned',
    status_change: 'Status changed',
    bulk_update: 'Bulk updated',
    bulk_delete: 'Bulk deleted',
    export: 'Exported',
    import: 'Imported',
  }
  return labels[action] || action.replace(/_/g, ' ')
}

// Helper to create entity type labels
export function getEntityTypeLabel(entityType: string): string {
  const labels: Record<string, string> = {
    lead: 'Lead',
    leads: 'Leads',
    user: 'User',
    task: 'Task',
    template: 'Template',
    setting: 'Setting',
    session: 'Session',
  }
  return labels[entityType] || entityType.replace(/_/g, ' ')
}
