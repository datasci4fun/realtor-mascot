import { query, ensureInitialized, getClient } from './db'
import { v4 as uuidv4 } from 'uuid'
import { Lead, LeadSubmissionResponse, ConversationMessage } from '@/types/lead'

// ============================================
// Lead CRUD Operations
// ============================================

/**
 * Create a new lead
 */
export async function createLead(lead: Lead): Promise<LeadSubmissionResponse> {
  try {
    await ensureInitialized()

    const result = await query(
      `INSERT INTO leads (
        name, email, phone,
        intent, timeline, budget, pre_approved,
        source, page, listing_id, listing_address,
        user_agent, referrer, utm_source, utm_medium, utm_campaign
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id`,
      [
        lead.name || null,
        lead.email,
        lead.phone || null,
        lead.intent || null,
        lead.timeline || null,
        lead.budget || null,
        lead.preApproved || false,
        lead.source,
        lead.page || null,
        lead.listingId || null,
        lead.listingAddress || null,
        lead.userAgent || null,
        lead.referrer || null,
        lead.utmSource || null,
        lead.utmMedium || null,
        lead.utmCampaign || null,
      ]
    )

    const id = result.rows[0].id

    // Save conversation history if present
    if (lead.conversationHistory && lead.conversationHistory.length > 0) {
      await saveConversationHistory(id, lead.conversationHistory)
    }

    // Add system note for lead creation
    await addLeadNote(id, `Lead created from ${lead.source} on ${lead.page}`, 'system')

    console.log(`Lead created: ${id}`)
    return { success: true, leadId: id }
  } catch (error) {
    console.error('Failed to create lead:', error)
    return { success: false, error: 'Failed to save lead' }
  }
}

/**
 * Get lead by ID
 */
export async function getLeadById(id: string): Promise<Lead | null> {
  await ensureInitialized()

  const result = await query('SELECT * FROM leads WHERE id = $1', [id])

  if (result.rows.length === 0) return null

  return rowToLead(result.rows[0])
}

/**
 * Get lead by email
 */
export async function getLeadByEmail(email: string): Promise<Lead | null> {
  await ensureInitialized()

  const result = await query(
    'SELECT * FROM leads WHERE email = $1 ORDER BY created_at DESC LIMIT 1',
    [email]
  )

  if (result.rows.length === 0) return null

  return rowToLead(result.rows[0])
}

/**
 * Get all leads with optional filters
 */
export async function getLeads(filters?: {
  status?: string
  source?: string
  priority?: string
  search?: string
  limit?: number
  offset?: number
}): Promise<{ leads: Lead[]; total: number }> {
  await ensureInitialized()

  let whereClause = 'WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  if (filters?.status) {
    whereClause += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }

  if (filters?.source) {
    whereClause += ` AND source = $${paramIndex++}`
    params.push(filters.source)
  }

  if (filters?.priority) {
    whereClause += ` AND priority = $${paramIndex++}`
    params.push(filters.priority)
  }

  if (filters?.search) {
    whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  // Get total count
  const countResult = await query(`SELECT COUNT(*) as total FROM leads ${whereClause}`, params)
  const total = parseInt(countResult.rows[0].total)

  // Get leads with pagination
  let queryText = `SELECT * FROM leads ${whereClause} ORDER BY created_at DESC`

  if (filters?.limit) {
    queryText += ` LIMIT $${paramIndex++}`
    params.push(filters.limit)
  }

  if (filters?.offset) {
    queryText += ` OFFSET $${paramIndex++}`
    params.push(filters.offset)
  }

  const result = await query(queryText, params)

  return {
    leads: result.rows.map(rowToLead),
    total,
  }
}

/**
 * Update lead
 */
export async function updateLead(id: string, updates: Partial<Lead>): Promise<boolean> {
  await ensureInitialized()

  const allowedFields: Record<string, string> = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    intent: 'intent',
    timeline: 'timeline',
    budget: 'budget',
    preApproved: 'pre_approved',
    status: 'status',
    assignedTo: 'assigned_to',
    priority: 'priority',
    lastContactedAt: 'last_contacted_at',
    nextFollowUp: 'next_follow_up',
  }

  const setClauses: string[] = []
  const params: any[] = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(updates)) {
    const dbField = allowedFields[key]
    if (dbField) {
      setClauses.push(`${dbField} = $${paramIndex++}`)
      params.push(value)
    }
  }

  if (setClauses.length === 0) return false

  setClauses.push('updated_at = NOW()')
  params.push(id)

  const result = await query(
    `UPDATE leads SET ${setClauses.join(', ')} WHERE id = $${paramIndex}`,
    params
  )

  return (result.rowCount ?? 0) > 0
}

/**
 * Delete lead
 */
export async function deleteLead(id: string): Promise<boolean> {
  await ensureInitialized()

  const result = await query('DELETE FROM leads WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

// ============================================
// Lead Notes
// ============================================

/**
 * Add a note to a lead
 */
export async function addLeadNote(
  leadId: string,
  note: string,
  noteType: 'note' | 'call' | 'email' | 'meeting' | 'showing' | 'system' = 'note',
  createdBy?: string
): Promise<string> {
  await ensureInitialized()

  const result = await query(
    `INSERT INTO lead_notes (lead_id, note, note_type, created_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [leadId, note, noteType, createdBy || null]
  )

  // Update the lead's updated_at timestamp
  await query('UPDATE leads SET updated_at = NOW() WHERE id = $1', [leadId])

  return result.rows[0].id
}

/**
 * Get notes for a lead
 */
export async function getLeadNotes(leadId: string): Promise<Array<{
  id: string
  note: string
  noteType: string
  createdBy: string | null
  createdAt: string
}>> {
  await ensureInitialized()

  const result = await query(
    'SELECT * FROM lead_notes WHERE lead_id = $1 ORDER BY created_at DESC',
    [leadId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    note: row.note,
    noteType: row.note_type,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }))
}

// ============================================
// Conversation History
// ============================================

/**
 * Save conversation history for a lead
 */
export async function saveConversationHistory(
  leadId: string,
  messages: ConversationMessage[]
): Promise<void> {
  await ensureInitialized()

  const client = await getClient()

  try {
    await client.query('BEGIN')

    for (const msg of messages) {
      await client.query(
        `INSERT INTO lead_conversations (lead_id, role, content, quick_reply, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [leadId, msg.role, msg.content, msg.quickReply || false, msg.timestamp]
      )
    }

    await client.query('COMMIT')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Get conversation history for a lead
 */
export async function getConversationHistory(leadId: string): Promise<ConversationMessage[]> {
  await ensureInitialized()

  const result = await query(
    'SELECT * FROM lead_conversations WHERE lead_id = $1 ORDER BY created_at ASC',
    [leadId]
  )

  return result.rows.map((row) => ({
    role: row.role,
    content: row.content,
    timestamp: row.created_at,
    quickReply: row.quick_reply,
  }))
}

// ============================================
// Analytics
// ============================================

/**
 * Get lead statistics
 */
export async function getLeadStats(): Promise<{
  total: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  thisWeek: number
  thisMonth: number
}> {
  await ensureInitialized()

  const totalResult = await query('SELECT COUNT(*) as count FROM leads')
  const total = parseInt(totalResult.rows[0].count)

  const byStatusResult = await query(
    'SELECT status, COUNT(*) as count FROM leads GROUP BY status'
  )
  const byStatus: Record<string, number> = {}
  for (const row of byStatusResult.rows) {
    byStatus[row.status] = parseInt(row.count)
  }

  const bySourceResult = await query(
    'SELECT source, COUNT(*) as count FROM leads GROUP BY source'
  )
  const bySource: Record<string, number> = {}
  for (const row of bySourceResult.rows) {
    bySource[row.source] = parseInt(row.count)
  }

  const thisWeekResult = await query(
    "SELECT COUNT(*) as count FROM leads WHERE created_at >= NOW() - INTERVAL '7 days'"
  )
  const thisWeek = parseInt(thisWeekResult.rows[0].count)

  const thisMonthResult = await query(
    "SELECT COUNT(*) as count FROM leads WHERE created_at >= NOW() - INTERVAL '30 days'"
  )
  const thisMonth = parseInt(thisMonthResult.rows[0].count)

  return { total, byStatus, bySource, thisWeek, thisMonth }
}

// ============================================
// Helpers
// ============================================

/**
 * Convert database row to Lead object
 */
function rowToLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name || '',
    email: row.email,
    phone: row.phone || undefined,
    intent: row.intent || undefined,
    timeline: row.timeline || undefined,
    budget: row.budget || undefined,
    preApproved: row.pre_approved,
    source: row.source,
    page: row.page || '',
    listingId: row.listing_id || undefined,
    listingAddress: row.listing_address || undefined,
    timestamp: row.created_at,
    userAgent: row.user_agent || undefined,
    referrer: row.referrer || undefined,
    utmSource: row.utm_source || undefined,
    utmMedium: row.utm_medium || undefined,
    utmCampaign: row.utm_campaign || undefined,
    status: row.status,
    assignedTo: row.assigned_to || undefined,
    priority: row.priority,
    lastContactedAt: row.last_contacted_at || undefined,
    nextFollowUp: row.next_follow_up || undefined,
    updatedAt: row.updated_at,
  }
}

// For API route compatibility
export async function saveLeadLocally(lead: Lead): Promise<LeadSubmissionResponse> {
  return createLead(lead)
}
