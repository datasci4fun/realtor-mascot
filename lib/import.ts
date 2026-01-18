import { pool } from './db'
import { Lead } from '@/types/lead'

export interface ImportRow {
  name?: string
  email?: string
  phone?: string
  intent?: string
  timeline?: string
  budget?: string
  message?: string
  source?: string
  status?: string
  priority?: string
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{ row: number; error: string }>
  duplicates: number
}

export interface ValidationError {
  row: number
  field: string
  message: string
}

// Validate a single import row
export function validateRow(row: ImportRow, rowIndex: number): ValidationError[] {
  const errors: ValidationError[] = []

  // Email is required and must be valid
  if (!row.email) {
    errors.push({ row: rowIndex, field: 'email', message: 'Email is required' })
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push({ row: rowIndex, field: 'email', message: 'Invalid email format' })
  }

  // Validate intent if provided
  const validIntents = ['buying', 'selling', 'renting', 'other']
  if (row.intent && !validIntents.includes(row.intent.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'intent',
      message: `Invalid intent. Must be one of: ${validIntents.join(', ')}`,
    })
  }

  // Validate status if provided
  const validStatuses = ['new', 'contacted', 'qualified', 'showing', 'offer', 'closed', 'lost']
  if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'status',
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    })
  }

  // Validate priority if provided
  const validPriorities = ['low', 'normal', 'high', 'urgent']
  if (row.priority && !validPriorities.includes(row.priority.toLowerCase())) {
    errors.push({
      row: rowIndex,
      field: 'priority',
      message: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`,
    })
  }

  // Validate source if provided
  const validSources = [
    'mascot_chat',
    'contact_form',
    'listing_inquiry',
    'home_valuation',
    'newsletter',
    'referral',
    'website',
    'other',
  ]
  if (row.source && !validSources.includes(row.source.toLowerCase().replace(/ /g, '_'))) {
    errors.push({
      row: rowIndex,
      field: 'source',
      message: `Invalid source. Must be one of: ${validSources.join(', ')}`,
    })
  }

  return errors
}

// Check for duplicates by email
export async function findDuplicateEmails(emails: string[]): Promise<Set<string>> {
  if (emails.length === 0) return new Set()

  const result = await pool.query(
    `SELECT LOWER(email) as email FROM leads WHERE LOWER(email) = ANY($1)`,
    [emails.map((e) => e.toLowerCase())]
  )

  return new Set(result.rows.map((r) => r.email))
}

// Import leads from validated rows
export async function importLeads(
  rows: ImportRow[],
  options: {
    skipDuplicates?: boolean
    defaultSource?: string
    importedBy?: string
  }
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    imported: 0,
    skipped: 0,
    errors: [],
    duplicates: 0,
  }

  // Get existing emails to detect duplicates
  const emails = rows.filter((r) => r.email).map((r) => r.email!.toLowerCase())
  const existingEmails = await findDuplicateEmails(emails)

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 1

    // Skip empty rows
    if (!row.email && !row.name && !row.phone) {
      result.skipped++
      continue
    }

    // Validate row
    const validationErrors = validateRow(row, rowNum)
    if (validationErrors.length > 0) {
      result.errors.push({ row: rowNum, error: validationErrors[0].message })
      continue
    }

    // Check for duplicates
    if (existingEmails.has(row.email!.toLowerCase())) {
      result.duplicates++
      if (options.skipDuplicates) {
        result.skipped++
        continue
      }
    }

    try {
      // Insert lead
      await pool.query(
        `
        INSERT INTO leads (name, email, phone, intent, timeline, budget, message, source, status, priority)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          row.name || null,
          row.email,
          row.phone || null,
          row.intent?.toLowerCase() || null,
          row.timeline || null,
          row.budget || null,
          row.message || null,
          row.source?.toLowerCase().replace(/ /g, '_') || options.defaultSource || 'other',
          row.status?.toLowerCase() || 'new',
          row.priority?.toLowerCase() || 'normal',
        ]
      )

      result.imported++

      // Add to existing emails to prevent duplicates within the same import
      existingEmails.add(row.email!.toLowerCase())
    } catch (error: any) {
      result.errors.push({ row: rowNum, error: error.message || 'Failed to insert lead' })
    }
  }

  result.success = result.errors.length === 0

  return result
}

// Map CSV headers to our field names
export function mapHeaders(headers: string[]): Record<string, string> {
  const headerMap: Record<string, string[]> = {
    name: ['name', 'full name', 'fullname', 'contact name', 'lead name'],
    email: ['email', 'email address', 'e-mail', 'emailaddress'],
    phone: ['phone', 'phone number', 'telephone', 'mobile', 'cell', 'phonenumber'],
    intent: ['intent', 'interest', 'type', 'lead type', 'property interest'],
    timeline: ['timeline', 'timeframe', 'time frame', 'when', 'purchase timeline'],
    budget: ['budget', 'price range', 'price', 'budget range'],
    message: ['message', 'notes', 'comments', 'description', 'details'],
    source: ['source', 'lead source', 'origin', 'channel'],
    status: ['status', 'lead status', 'stage'],
    priority: ['priority', 'urgency', 'importance'],
  }

  const mapping: Record<string, string> = {}

  for (const header of headers) {
    const normalizedHeader = header.toLowerCase().trim()

    for (const [field, aliases] of Object.entries(headerMap)) {
      if (aliases.includes(normalizedHeader)) {
        mapping[header] = field
        break
      }
    }
  }

  return mapping
}

// Parse CSV content using PapaParse (client-side) or manual parsing (server-side)
export function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  result.push(current.trim())
  return result
}

export function parseCSV(content: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = content.split(/\r?\n/).filter((line) => line.trim())

  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const headers = parseCSVLine(lines[0])
  const rows: Record<string, string>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || ''
    }

    rows.push(row)
  }

  return { headers, rows }
}
