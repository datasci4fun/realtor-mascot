import pool from './db'

export interface Reminder {
  id: string
  leadId: string
  leadName?: string
  leadEmail?: string
  userId: string
  userName?: string
  remindAt: string
  message: string | null
  isSent: boolean
  createdAt: string
}

export interface CreateReminderData {
  leadId: string
  userId: string
  remindAt: Date
  message?: string
}

// Create a new reminder
export async function createReminder(data: CreateReminderData): Promise<Reminder> {
  const result = await pool.query(
    `
    INSERT INTO reminders (lead_id, user_id, remind_at, message)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
    [data.leadId, data.userId, data.remindAt, data.message || null]
  )

  return mapReminderRow(result.rows[0])
}

// Get reminders for a user
export async function getUserReminders(
  userId: string,
  options: {
    includeCompleted?: boolean
    limit?: number
  } = {}
): Promise<Reminder[]> {
  let query = `
    SELECT
      r.*,
      l.name as lead_name,
      l.email as lead_email,
      au.name as user_name
    FROM reminders r
    LEFT JOIN leads l ON r.lead_id = l.id
    LEFT JOIN admin_users au ON r.user_id = au.id
    WHERE r.user_id = $1
  `

  if (!options.includeCompleted) {
    query += ` AND r.is_sent = FALSE`
  }

  query += ` ORDER BY r.remind_at ASC`

  if (options.limit) {
    query += ` LIMIT ${options.limit}`
  }

  const result = await pool.query(query, [userId])

  return result.rows.map(mapReminderRow)
}

// Get upcoming reminders (within next hour)
export async function getUpcomingReminders(): Promise<Reminder[]> {
  const result = await pool.query(`
    SELECT
      r.*,
      l.name as lead_name,
      l.email as lead_email,
      au.name as user_name
    FROM reminders r
    LEFT JOIN leads l ON r.lead_id = l.id
    LEFT JOIN admin_users au ON r.user_id = au.id
    WHERE r.is_sent = FALSE
      AND r.remind_at <= NOW() + INTERVAL '1 hour'
    ORDER BY r.remind_at ASC
  `)

  return result.rows.map(mapReminderRow)
}

// Get reminders for a specific lead
export async function getLeadReminders(leadId: string): Promise<Reminder[]> {
  const result = await pool.query(
    `
    SELECT
      r.*,
      l.name as lead_name,
      l.email as lead_email,
      au.name as user_name
    FROM reminders r
    LEFT JOIN leads l ON r.lead_id = l.id
    LEFT JOIN admin_users au ON r.user_id = au.id
    WHERE r.lead_id = $1
    ORDER BY r.remind_at ASC
  `,
    [leadId]
  )

  return result.rows.map(mapReminderRow)
}

// Mark reminder as sent
export async function markReminderSent(id: string): Promise<void> {
  await pool.query(`UPDATE reminders SET is_sent = TRUE WHERE id = $1`, [id])
}

// Delete reminder
export async function deleteReminder(id: string): Promise<boolean> {
  const result = await pool.query(`DELETE FROM reminders WHERE id = $1`, [id])
  return (result.rowCount ?? 0) > 0
}

// Get reminder count for a user
export async function getReminderCount(userId: string): Promise<number> {
  const result = await pool.query(
    `
    SELECT COUNT(*) as count
    FROM reminders
    WHERE user_id = $1 AND is_sent = FALSE
  `,
    [userId]
  )

  return parseInt(result.rows[0].count)
}

// Get overdue reminders count
export async function getOverdueCount(userId: string): Promise<number> {
  const result = await pool.query(
    `
    SELECT COUNT(*) as count
    FROM reminders
    WHERE user_id = $1 AND is_sent = FALSE AND remind_at < NOW()
  `,
    [userId]
  )

  return parseInt(result.rows[0].count)
}

// Helper function to map database row to Reminder interface
function mapReminderRow(row: any): Reminder {
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name,
    leadEmail: row.lead_email,
    userId: row.user_id,
    userName: row.user_name,
    remindAt: row.remind_at,
    message: row.message,
    isSent: row.is_sent,
    createdAt: row.created_at,
  }
}

// Helper function to calculate reminder time from preset
export function calculateReminderTime(preset: string): Date {
  const now = new Date()

  switch (preset) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000)
    case '3h':
      return new Date(now.getTime() + 3 * 60 * 60 * 1000)
    case 'tomorrow':
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0) // 9 AM tomorrow
      return tomorrow
    case 'next_week':
      const nextWeek = new Date(now)
      nextWeek.setDate(nextWeek.getDate() + 7)
      nextWeek.setHours(9, 0, 0, 0) // 9 AM next week
      return nextWeek
    default:
      return now
  }
}
