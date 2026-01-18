import pool from './db'

export interface ReportFilters {
  startDate?: string
  endDate?: string
  status?: string
  source?: string
  assignedTo?: string
}

export interface LeadSummaryReport {
  totalLeads: number
  byStatus: Array<{ status: string; count: number; percentage: number }>
  bySource: Array<{ source: string; count: number; percentage: number }>
  byIntent: Array<{ intent: string; count: number; percentage: number }>
  byTimeline: Array<{ timeline: string; count: number; percentage: number }>
  avgResponseTime?: number
}

export interface AgentPerformanceReport {
  agents: Array<{
    id: string
    name: string
    email: string
    totalLeads: number
    newLeads: number
    closedLeads: number
    lostLeads: number
    conversionRate: number
    avgDaysToClose: number | null
  }>
  topPerformer: string | null
  teamConversionRate: number
}

export interface SourceAttributionReport {
  sources: Array<{
    source: string
    totalLeads: number
    closedLeads: number
    conversionRate: number
    avgBudget: string | null
  }>
  bestPerformingSource: string | null
}

export interface PipelineReport {
  stages: Array<{
    status: string
    count: number
    percentage: number
    avgDaysInStage: number | null
  }>
  totalValue: number
  avgDealValue: number | null
}

// Generate Lead Summary Report
export async function generateLeadSummaryReport(
  filters: ReportFilters
): Promise<LeadSummaryReport> {
  let whereClause = 'WHERE 1=1'
  const params: (string | Date)[] = []
  let paramIndex = 1

  if (filters.startDate) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    params.push(new Date(filters.startDate))
  }

  if (filters.endDate) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    params.push(new Date(filters.endDate + 'T23:59:59'))
  }

  if (filters.status) {
    whereClause += ` AND status = $${paramIndex++}`
    params.push(filters.status)
  }

  if (filters.source) {
    whereClause += ` AND source = $${paramIndex++}`
    params.push(filters.source)
  }

  if (filters.assignedTo) {
    whereClause += ` AND assigned_to = $${paramIndex++}`
    params.push(filters.assignedTo)
  }

  // Total leads
  const totalResult = await pool.query(
    `SELECT COUNT(*) as total FROM leads ${whereClause}`,
    params
  )
  const totalLeads = parseInt(totalResult.rows[0].total)

  // By status
  const statusResult = await pool.query(
    `SELECT status, COUNT(*) as count FROM leads ${whereClause} GROUP BY status ORDER BY count DESC`,
    params
  )
  const byStatus = statusResult.rows.map((row) => ({
    status: row.status || 'new',
    count: parseInt(row.count),
    percentage: totalLeads > 0 ? Math.round((parseInt(row.count) / totalLeads) * 100) : 0,
  }))

  // By source
  const sourceResult = await pool.query(
    `SELECT source, COUNT(*) as count FROM leads ${whereClause} GROUP BY source ORDER BY count DESC`,
    params
  )
  const bySource = sourceResult.rows.map((row) => ({
    source: row.source || 'unknown',
    count: parseInt(row.count),
    percentage: totalLeads > 0 ? Math.round((parseInt(row.count) / totalLeads) * 100) : 0,
  }))

  // By intent
  const intentResult = await pool.query(
    `SELECT intent, COUNT(*) as count FROM leads ${whereClause} GROUP BY intent ORDER BY count DESC`,
    params
  )
  const byIntent = intentResult.rows.map((row) => ({
    intent: row.intent || 'not specified',
    count: parseInt(row.count),
    percentage: totalLeads > 0 ? Math.round((parseInt(row.count) / totalLeads) * 100) : 0,
  }))

  // By timeline
  const timelineResult = await pool.query(
    `SELECT timeline, COUNT(*) as count FROM leads ${whereClause} GROUP BY timeline ORDER BY count DESC`,
    params
  )
  const byTimeline = timelineResult.rows.map((row) => ({
    timeline: row.timeline || 'not specified',
    count: parseInt(row.count),
    percentage: totalLeads > 0 ? Math.round((parseInt(row.count) / totalLeads) * 100) : 0,
  }))

  return {
    totalLeads,
    byStatus,
    bySource,
    byIntent,
    byTimeline,
  }
}

// Generate Agent Performance Report
export async function generateAgentPerformanceReport(
  filters: ReportFilters
): Promise<AgentPerformanceReport> {
  let whereClause = 'WHERE l.assigned_to IS NOT NULL'
  const params: (string | Date)[] = []
  let paramIndex = 1

  if (filters.startDate) {
    whereClause += ` AND l.created_at >= $${paramIndex++}`
    params.push(new Date(filters.startDate))
  }

  if (filters.endDate) {
    whereClause += ` AND l.created_at <= $${paramIndex++}`
    params.push(new Date(filters.endDate + 'T23:59:59'))
  }

  const result = await pool.query(
    `
    SELECT
      au.id,
      au.name,
      au.email,
      COUNT(*) as total_leads,
      COUNT(*) FILTER (WHERE l.status = 'new') as new_leads,
      COUNT(*) FILTER (WHERE l.status = 'closed') as closed_leads,
      COUNT(*) FILTER (WHERE l.status = 'lost') as lost_leads,
      ROUND(
        CASE
          WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE l.status = 'closed') * 100.0 / COUNT(*)
          ELSE 0
        END, 1
      ) as conversion_rate,
      AVG(
        CASE
          WHEN l.status = 'closed' THEN EXTRACT(DAY FROM l.updated_at - l.created_at)
          ELSE NULL
        END
      ) as avg_days_to_close
    FROM leads l
    JOIN admin_users au ON l.assigned_to = au.id::text
    ${whereClause}
    GROUP BY au.id, au.name, au.email
    ORDER BY closed_leads DESC, total_leads DESC
  `,
    params
  )

  const agents = result.rows.map((row) => ({
    id: row.id,
    name: row.name || 'Unknown',
    email: row.email,
    totalLeads: parseInt(row.total_leads),
    newLeads: parseInt(row.new_leads),
    closedLeads: parseInt(row.closed_leads),
    lostLeads: parseInt(row.lost_leads),
    conversionRate: parseFloat(row.conversion_rate),
    avgDaysToClose: row.avg_days_to_close ? Math.round(row.avg_days_to_close) : null,
  }))

  const topPerformer = agents.length > 0 ? agents[0].name : null
  const teamConversionRate =
    agents.length > 0
      ? Math.round(
          (agents.reduce((sum, a) => sum + a.closedLeads, 0) /
            agents.reduce((sum, a) => sum + a.totalLeads, 0)) *
            100
        )
      : 0

  return {
    agents,
    topPerformer,
    teamConversionRate,
  }
}

// Generate Source Attribution Report
export async function generateSourceAttributionReport(
  filters: ReportFilters
): Promise<SourceAttributionReport> {
  let whereClause = 'WHERE 1=1'
  const params: (string | Date)[] = []
  let paramIndex = 1

  if (filters.startDate) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    params.push(new Date(filters.startDate))
  }

  if (filters.endDate) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    params.push(new Date(filters.endDate + 'T23:59:59'))
  }

  const result = await pool.query(
    `
    SELECT
      COALESCE(source, 'unknown') as source,
      COUNT(*) as total_leads,
      COUNT(*) FILTER (WHERE status = 'closed') as closed_leads,
      ROUND(
        CASE
          WHEN COUNT(*) > 0 THEN COUNT(*) FILTER (WHERE status = 'closed') * 100.0 / COUNT(*)
          ELSE 0
        END, 1
      ) as conversion_rate,
      MODE() WITHIN GROUP (ORDER BY budget) as common_budget
    FROM leads
    ${whereClause}
    GROUP BY source
    ORDER BY total_leads DESC
  `,
    params
  )

  const sources = result.rows.map((row) => ({
    source: row.source,
    totalLeads: parseInt(row.total_leads),
    closedLeads: parseInt(row.closed_leads),
    conversionRate: parseFloat(row.conversion_rate),
    avgBudget: row.common_budget,
  }))

  // Find best performing source (by conversion rate, min 5 leads)
  const qualifiedSources = sources.filter((s) => s.totalLeads >= 5)
  const bestPerformingSource =
    qualifiedSources.length > 0
      ? qualifiedSources.sort((a, b) => b.conversionRate - a.conversionRate)[0].source
      : null

  return {
    sources,
    bestPerformingSource,
  }
}

// Generate Pipeline Report
export async function generatePipelineReport(filters: ReportFilters): Promise<PipelineReport> {
  let whereClause = 'WHERE 1=1'
  const params: (string | Date)[] = []
  let paramIndex = 1

  if (filters.startDate) {
    whereClause += ` AND created_at >= $${paramIndex++}`
    params.push(new Date(filters.startDate))
  }

  if (filters.endDate) {
    whereClause += ` AND created_at <= $${paramIndex++}`
    params.push(new Date(filters.endDate + 'T23:59:59'))
  }

  // Pipeline stages in order
  const stageOrder = ['new', 'contacted', 'qualified', 'showing', 'offer', 'closed', 'lost']

  const result = await pool.query(
    `
    SELECT
      COALESCE(status, 'new') as status,
      COUNT(*) as count
    FROM leads
    ${whereClause}
    GROUP BY status
  `,
    params
  )

  const totalLeads = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)

  const stages = stageOrder
    .map((stage) => {
      const row = result.rows.find((r) => r.status === stage)
      const count = row ? parseInt(row.count) : 0
      return {
        status: stage,
        count,
        percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0,
        avgDaysInStage: null, // Would need to track status change timestamps for this
      }
    })
    .filter((s) => s.count > 0 || ['new', 'closed', 'lost'].includes(s.status))

  return {
    stages,
    totalValue: 0, // Would need numeric budget field to calculate
    avgDealValue: null,
  }
}

// Format source name for display
export function formatSourceName(source: string): string {
  const names: Record<string, string> = {
    mascot_chat: 'Mascot Chat',
    contact_form: 'Contact Form',
    listing_inquiry: 'Listing Inquiry',
    home_valuation: 'Home Valuation',
    newsletter: 'Newsletter',
    referral: 'Referral',
    website: 'Website',
    other: 'Other',
    unknown: 'Unknown',
  }
  return names[source] || source.replace(/_/g, ' ')
}

// Format status name for display
export function formatStatusName(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}
