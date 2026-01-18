import { pool } from './db'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: 'follow_up' | 'showing' | 'offer' | 'closing' | 'other'
  createdBy: string | null
  createdByName?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTemplateData {
  name: string
  subject: string
  body: string
  category: EmailTemplate['category']
  createdBy?: string
  isDefault?: boolean
}

export interface UpdateTemplateData {
  name?: string
  subject?: string
  body?: string
  category?: EmailTemplate['category']
  isDefault?: boolean
}

// Get all templates with optional category filter
export async function getTemplates(category?: string): Promise<EmailTemplate[]> {
  let query = `
    SELECT
      et.*,
      au.name as created_by_name
    FROM email_templates et
    LEFT JOIN admin_users au ON et.created_by = au.id
  `
  const params: string[] = []

  if (category && category !== 'all') {
    query += ' WHERE et.category = $1'
    params.push(category)
  }

  query += ' ORDER BY et.is_default DESC, et.name ASC'

  const result = await pool.query(query, params)

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    category: row.category,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

// Get single template by ID
export async function getTemplateById(id: string): Promise<EmailTemplate | null> {
  const result = await pool.query(
    `
    SELECT
      et.*,
      au.name as created_by_name
    FROM email_templates et
    LEFT JOIN admin_users au ON et.created_by = au.id
    WHERE et.id = $1
  `,
    [id]
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    category: row.category,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Create new template
export async function createTemplate(data: CreateTemplateData): Promise<EmailTemplate> {
  const result = await pool.query(
    `
    INSERT INTO email_templates (name, subject, body, category, created_by, is_default)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
    [
      data.name,
      data.subject,
      data.body,
      data.category,
      data.createdBy || null,
      data.isDefault || false,
    ]
  )

  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    category: row.category,
    createdBy: row.created_by,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Update template
export async function updateTemplate(
  id: string,
  data: UpdateTemplateData
): Promise<EmailTemplate | null> {
  const fields: string[] = []
  const values: (string | boolean)[] = []
  let paramIndex = 1

  if (data.name !== undefined) {
    fields.push(`name = $${paramIndex++}`)
    values.push(data.name)
  }
  if (data.subject !== undefined) {
    fields.push(`subject = $${paramIndex++}`)
    values.push(data.subject)
  }
  if (data.body !== undefined) {
    fields.push(`body = $${paramIndex++}`)
    values.push(data.body)
  }
  if (data.category !== undefined) {
    fields.push(`category = $${paramIndex++}`)
    values.push(data.category)
  }
  if (data.isDefault !== undefined) {
    fields.push(`is_default = $${paramIndex++}`)
    values.push(data.isDefault)
  }

  if (fields.length === 0) {
    return getTemplateById(id)
  }

  fields.push(`updated_at = NOW()`)
  values.push(id)

  const result = await pool.query(
    `
    UPDATE email_templates
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `,
    values
  )

  if (result.rows.length === 0) return null

  const row = result.rows[0]
  return {
    id: row.id,
    name: row.name,
    subject: row.subject,
    body: row.body,
    category: row.category,
    createdBy: row.created_by,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Delete template
export async function deleteTemplate(id: string): Promise<boolean> {
  const result = await pool.query('DELETE FROM email_templates WHERE id = $1', [id])
  return (result.rowCount ?? 0) > 0
}

// Merge fields replacement
export function applyMergeFields(
  text: string,
  data: {
    lead?: { name?: string; email?: string; phone?: string }
    agent?: { name?: string; email?: string; phone?: string }
  }
): string {
  let result = text

  // Lead fields
  if (data.lead) {
    result = result.replace(/\{\{lead\.name\}\}/g, data.lead.name || '[Lead Name]')
    result = result.replace(/\{\{lead\.email\}\}/g, data.lead.email || '[Lead Email]')
    result = result.replace(/\{\{lead\.phone\}\}/g, data.lead.phone || '[Lead Phone]')
  }

  // Agent fields
  if (data.agent) {
    result = result.replace(/\{\{agent\.name\}\}/g, data.agent.name || '[Agent Name]')
    result = result.replace(/\{\{agent\.email\}\}/g, data.agent.email || '[Agent Email]')
    result = result.replace(/\{\{agent\.phone\}\}/g, data.agent.phone || '[Agent Phone]')
  }

  return result
}

// Get category label
export function getCategoryLabel(category: EmailTemplate['category']): string {
  const labels: Record<EmailTemplate['category'], string> = {
    follow_up: 'Follow-up',
    showing: 'Showing',
    offer: 'Offer',
    closing: 'Closing',
    other: 'Other',
  }
  return labels[category] || category
}

// Get default templates (for seeding)
export function getDefaultTemplates(): Omit<CreateTemplateData, 'createdBy'>[] {
  return [
    {
      name: 'Initial Follow-up',
      subject: 'Thanks for reaching out, {{lead.name}}!',
      body: `Hi {{lead.name}},

Thank you for your interest in real estate services! I'm excited to help you with your property needs.

I noticed you're interested in [buying/selling/renting]. I'd love to learn more about what you're looking for and how I can best assist you.

Would you be available for a quick call this week? You can reach me at {{agent.phone}} or simply reply to this email.

Looking forward to connecting!

Best regards,
{{agent.name}}`,
      category: 'follow_up',
      isDefault: true,
    },
    {
      name: 'Showing Confirmation',
      subject: 'Property Showing Confirmed - {{lead.name}}',
      body: `Hi {{lead.name}},

I'm confirming our property showing scheduled for [DATE] at [TIME].

Property Address: [ADDRESS]

A few things to keep in mind:
- Please arrive 5 minutes early
- Feel free to take photos and notes
- I'll be there to answer any questions

If you need to reschedule, please let me know at least 24 hours in advance.

See you soon!

Best regards,
{{agent.name}}
{{agent.phone}}`,
      category: 'showing',
      isDefault: true,
    },
    {
      name: 'Offer Submitted',
      subject: 'Your Offer Has Been Submitted',
      body: `Hi {{lead.name}},

Great news! Your offer on [PROPERTY ADDRESS] has been submitted to the seller.

Offer Details:
- Offer Amount: [AMOUNT]
- Contingencies: [LIST]
- Proposed Closing Date: [DATE]

The seller typically has [X] days to respond. I'll keep you updated on any developments.

In the meantime, please ensure your financing is in order and let me know if you have any questions.

Best regards,
{{agent.name}}
{{agent.phone}}`,
      category: 'offer',
      isDefault: true,
    },
    {
      name: 'Closing Congratulations',
      subject: 'Congratulations on Your New Home!',
      body: `Dear {{lead.name}},

Congratulations! You are now the proud owner of [PROPERTY ADDRESS]!

It's been a pleasure working with you through this process. If you ever need anything related to your new home or real estate in general, please don't hesitate to reach out.

A few reminders:
- Keep all your closing documents in a safe place
- Transfer utilities to your name
- Update your address with important contacts

Thank you for trusting me with this important transaction. I'd be grateful if you could share your experience with friends and family who might need real estate services.

Warm regards,
{{agent.name}}
{{agent.phone}}`,
      category: 'closing',
      isDefault: true,
    },
  ]
}
