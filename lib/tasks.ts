import { query, ensureInitialized } from './db'
import { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, TaskStats } from '@/types/task'

/**
 * Get all tasks with optional filters
 */
export async function getTasks(filters?: TaskFilters): Promise<Task[]> {
  await ensureInitialized()

  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  if (filters?.status) {
    whereClause += ` AND t.status = $${paramIndex++}`
    params.push(filters.status)
  }

  if (filters?.priority) {
    whereClause += ` AND t.priority = $${paramIndex++}`
    params.push(filters.priority)
  }

  if (filters?.assignedTo) {
    whereClause += ` AND t.assigned_to = $${paramIndex++}`
    params.push(filters.assignedTo)
  }

  if (filters?.leadId) {
    whereClause += ` AND t.lead_id = $${paramIndex++}`
    params.push(filters.leadId)
  }

  if (filters?.dueDate === 'overdue') {
    whereClause += ` AND t.due_date < NOW() AND t.status NOT IN ('completed', 'cancelled')`
  } else if (filters?.dueDate === 'today') {
    whereClause += ` AND t.due_date::date = CURRENT_DATE`
  } else if (filters?.dueDate === 'week') {
    whereClause += ` AND t.due_date <= NOW() + INTERVAL '7 days' AND t.due_date >= NOW()`
  }

  if (filters?.search) {
    whereClause += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  const result = await query(
    `SELECT t.*,
            l.name as lead_name,
            l.email as lead_email,
            ua.name as assigned_to_name,
            uc.name as created_by_name
     FROM tasks t
     LEFT JOIN leads l ON t.lead_id = l.id
     LEFT JOIN admin_users ua ON t.assigned_to = ua.id
     LEFT JOIN admin_users uc ON t.created_by = uc.id
     ${whereClause}
     ORDER BY
       CASE WHEN t.status = 'completed' OR t.status = 'cancelled' THEN 1 ELSE 0 END,
       CASE t.priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
       t.due_date ASC NULLS LAST,
       t.created_at DESC`,
    params
  )

  return result.rows.map(rowToTask)
}

/**
 * Get task by ID
 */
export async function getTaskById(id: string): Promise<Task | null> {
  await ensureInitialized()

  const result = await query(
    `SELECT t.*,
            l.name as lead_name,
            l.email as lead_email,
            ua.name as assigned_to_name,
            uc.name as created_by_name
     FROM tasks t
     LEFT JOIN leads l ON t.lead_id = l.id
     LEFT JOIN admin_users ua ON t.assigned_to = ua.id
     LEFT JOIN admin_users uc ON t.created_by = uc.id
     WHERE t.id = $1`,
    [id]
  )

  if (result.rows.length === 0) return null

  return rowToTask(result.rows[0])
}

/**
 * Create a new task
 */
export async function createTask(
  input: CreateTaskInput,
  createdBy: string
): Promise<Task | null> {
  await ensureInitialized()

  const result = await query(
    `INSERT INTO tasks (title, description, lead_id, assigned_to, created_by, due_date, priority)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      input.title,
      input.description || null,
      input.leadId || null,
      input.assignedTo,
      createdBy,
      input.dueDate || null,
      input.priority || 'normal',
    ]
  )

  return getTaskById(result.rows[0].id)
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  updates: UpdateTaskInput
): Promise<Task | null> {
  await ensureInitialized()

  const setClauses: string[] = []
  const params: any[] = []
  let paramIndex = 1

  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramIndex++}`)
    params.push(updates.title)
  }

  if (updates.description !== undefined) {
    setClauses.push(`description = $${paramIndex++}`)
    params.push(updates.description)
  }

  if (updates.assignedTo !== undefined) {
    setClauses.push(`assigned_to = $${paramIndex++}`)
    params.push(updates.assignedTo)
  }

  if (updates.dueDate !== undefined) {
    setClauses.push(`due_date = $${paramIndex++}`)
    params.push(updates.dueDate || null)
  }

  if (updates.priority !== undefined) {
    setClauses.push(`priority = $${paramIndex++}`)
    params.push(updates.priority)
  }

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`)
    params.push(updates.status)

    if (updates.status === 'completed') {
      setClauses.push('completed_at = NOW()')
    } else {
      setClauses.push('completed_at = NULL')
    }
  }

  if (setClauses.length === 0) return null

  setClauses.push('updated_at = NOW()')
  params.push(id)

  const result = await query(
    `UPDATE tasks SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  )

  if (result.rows.length === 0) return null

  return getTaskById(id)
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<boolean> {
  await ensureInitialized()

  const result = await query('DELETE FROM tasks WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

/**
 * Get task stats
 */
export async function getTaskStats(userId?: string): Promise<TaskStats> {
  await ensureInitialized()

  const userFilter = userId ? 'WHERE assigned_to = $1' : ''
  const params = userId ? [userId] : []

  const result = await query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'pending') as pending,
       COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress,
       COUNT(*) FILTER (WHERE status = 'completed') as completed,
       COUNT(*) FILTER (WHERE due_date < NOW() AND status NOT IN ('completed', 'cancelled')) as overdue
     FROM tasks ${userFilter}`,
    params
  )

  const row = result.rows[0]
  return {
    total: parseInt(row.total),
    pending: parseInt(row.pending),
    inProgress: parseInt(row.in_progress),
    completed: parseInt(row.completed),
    overdue: parseInt(row.overdue),
  }
}

/**
 * Get tasks for a specific lead
 */
export async function getTasksForLead(leadId: string): Promise<Task[]> {
  return getTasks({ leadId })
}

/**
 * Convert database row to Task object
 */
function rowToTask(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    leadId: row.lead_id,
    leadName: row.lead_name,
    leadEmail: row.lead_email,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    dueDate: row.due_date,
    priority: row.priority,
    status: row.status,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
