import pool from './db'
import { Lead } from '@/types/lead'

export interface DuplicateGroup {
  key: string
  matchType: 'email' | 'phone' | 'both'
  leads: Lead[]
}

// Find potential duplicates by email or phone
export async function findDuplicates(): Promise<DuplicateGroup[]> {
  const duplicates: DuplicateGroup[] = []

  // Find email duplicates
  const emailDuplicates = await pool.query(`
    SELECT
      LOWER(email) as match_key,
      array_agg(id) as lead_ids
    FROM leads
    WHERE email IS NOT NULL AND email != ''
    GROUP BY LOWER(email)
    HAVING COUNT(*) > 1
  `)

  for (const row of emailDuplicates.rows) {
    const leads = await getLeadsByIds(row.lead_ids)
    duplicates.push({
      key: row.match_key,
      matchType: 'email',
      leads,
    })
  }

  // Find phone duplicates (normalize phone numbers)
  const phoneDuplicates = await pool.query(`
    SELECT
      regexp_replace(phone, '[^0-9]', '', 'g') as match_key,
      array_agg(id) as lead_ids
    FROM leads
    WHERE phone IS NOT NULL AND phone != '' AND LENGTH(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10
    GROUP BY regexp_replace(phone, '[^0-9]', '', 'g')
    HAVING COUNT(*) > 1
  `)

  for (const row of phoneDuplicates.rows) {
    // Check if this group overlaps with email duplicates
    const leads = await getLeadsByIds(row.lead_ids)

    // Skip if all these leads are already in an email duplicate group
    const existingGroup = duplicates.find(
      (g) => g.matchType === 'email' && g.leads.some((l) => row.lead_ids.includes(l.id))
    )

    if (existingGroup) {
      // Upgrade to 'both' if there's overlap
      const allLeadsOverlap = leads.every((l) =>
        existingGroup.leads.some((el) => el.id === l.id)
      )
      if (allLeadsOverlap) {
        existingGroup.matchType = 'both'
        continue
      }
    }

    duplicates.push({
      key: row.match_key,
      matchType: 'phone',
      leads,
    })
  }

  return duplicates
}

// Get leads by IDs
async function getLeadsByIds(ids: string[]): Promise<Lead[]> {
  const result = await pool.query(
    `
    SELECT
      l.*,
      au.name as assigned_to_name
    FROM leads l
    LEFT JOIN admin_users au ON l.assigned_to = au.id::text
    WHERE l.id = ANY($1)
    ORDER BY l.created_at DESC
  `,
    [ids]
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    intent: row.intent,
    timeline: row.timeline,
    budget: row.budget,
    message: row.message,
    source: row.source,
    status: row.status,
    priority: row.priority,
    assignedTo: row.assigned_to,
    assignedToName: row.assigned_to_name,
    timestamp: row.created_at,
    updatedAt: row.updated_at,
  }))
}

// Merge leads - keep primary, merge data from secondary
export async function mergeLeads(
  primaryId: string,
  secondaryIds: string[],
  options: {
    mergeFields?: Record<string, 'primary' | 'secondary'>
    mergedBy?: string
  }
): Promise<Lead> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Get all leads
    const allIds = [primaryId, ...secondaryIds]
    const leadsResult = await client.query(
      `SELECT * FROM leads WHERE id = ANY($1)`,
      [allIds]
    )

    const leads = leadsResult.rows
    const primary = leads.find((l) => l.id === primaryId)
    const secondaries = leads.filter((l) => l.id !== primaryId)

    if (!primary) {
      throw new Error('Primary lead not found')
    }

    // Merge data if specified
    if (options.mergeFields) {
      const updates: Record<string, unknown> = {}

      for (const [field, source] of Object.entries(options.mergeFields)) {
        if (source === 'secondary' && secondaries.length > 0) {
          // Use the first non-null value from secondaries
          for (const secondary of secondaries) {
            if (secondary[field]) {
              updates[field] = secondary[field]
              break
            }
          }
        }
      }

      if (Object.keys(updates).length > 0) {
        const setClauses = Object.keys(updates)
          .map((key, i) => `${key} = $${i + 2}`)
          .join(', ')

        await client.query(
          `UPDATE leads SET ${setClauses}, updated_at = NOW() WHERE id = $1`,
          [primaryId, ...Object.values(updates)]
        )
      }
    }

    // Move notes from secondary leads to primary
    for (const secondary of secondaries) {
      await client.query(
        `UPDATE lead_notes SET lead_id = $1 WHERE lead_id = $2`,
        [primaryId, secondary.id]
      )

      // Move conversations
      await client.query(
        `UPDATE lead_conversations SET lead_id = $1 WHERE lead_id = $2`,
        [primaryId, secondary.id]
      )

      // Move tasks
      await client.query(
        `UPDATE tasks SET lead_id = $1 WHERE lead_id = $2`,
        [primaryId, secondary.id]
      )
    }

    // Add merge note to primary lead
    const mergedEmails = secondaries.map((s) => s.email).filter(Boolean).join(', ')
    await client.query(
      `
      INSERT INTO lead_notes (lead_id, content, author_id)
      VALUES ($1, $2, $3)
    `,
      [
        primaryId,
        `Merged with duplicate leads (${mergedEmails || secondaryIds.join(', ')})`,
        options.mergedBy || null,
      ]
    )

    // Delete secondary leads
    await client.query(
      `DELETE FROM leads WHERE id = ANY($1)`,
      [secondaryIds]
    )

    await client.query('COMMIT')

    // Return updated primary lead
    const updatedResult = await pool.query(
      `
      SELECT
        l.*,
        au.name as assigned_to_name
      FROM leads l
      LEFT JOIN admin_users au ON l.assigned_to = au.id::text
      WHERE l.id = $1
    `,
      [primaryId]
    )

    const row = updatedResult.rows[0]
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      intent: row.intent,
      timeline: row.timeline,
      budget: row.budget,
      message: row.message,
      source: row.source,
      status: row.status,
      priority: row.priority,
      assignedTo: row.assigned_to,
      assignedToName: row.assigned_to_name,
      timestamp: row.created_at,
      updatedAt: row.updated_at,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Get duplicate count for dashboard
export async function getDuplicateCount(): Promise<number> {
  const result = await pool.query(`
    SELECT COUNT(DISTINCT match_key) as count
    FROM (
      SELECT LOWER(email) as match_key
      FROM leads
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1

      UNION

      SELECT regexp_replace(phone, '[^0-9]', '', 'g') as match_key
      FROM leads
      WHERE phone IS NOT NULL AND phone != '' AND LENGTH(regexp_replace(phone, '[^0-9]', '', 'g')) >= 10
      GROUP BY regexp_replace(phone, '[^0-9]', '', 'g')
      HAVING COUNT(*) > 1
    ) duplicates
  `)

  return parseInt(result.rows[0].count) || 0
}
