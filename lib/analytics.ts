import { query, ensureInitialized } from './db'

export interface DateRange {
  start: Date
  end: Date
}

export interface LeadTrendData {
  date: string
  leads: number
  qualified: number
  closed: number
}

export interface ConversionFunnelData {
  stage: string
  count: number
  percentage: number
}

export interface SourceData {
  source: string
  count: number
  percentage: number
}

export interface AgentPerformance {
  id: string
  name: string
  email: string
  totalLeads: number
  closedLeads: number
  conversionRate: number
}

/**
 * Get lead trend data over time
 */
export async function getLeadTrend(range: DateRange): Promise<LeadTrendData[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT
       DATE(created_at) as date,
       COUNT(*) as leads,
       COUNT(*) FILTER (WHERE status = 'qualified' OR status IN ('showing', 'offer', 'closed')) as qualified,
       COUNT(*) FILTER (WHERE status = 'closed') as closed
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [range.start, range.end]
  )

  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    leads: parseInt(row.leads),
    qualified: parseInt(row.qualified),
    closed: parseInt(row.closed),
  }))
}

/**
 * Get conversion funnel data
 */
export async function getConversionFunnel(range: DateRange): Promise<ConversionFunnelData[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT status, COUNT(*) as count
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY status`,
    [range.start, range.end]
  )

  const statusOrder = ['new', 'contacted', 'qualified', 'showing', 'offer', 'closed', 'lost']
  const statusCounts: Record<string, number> = {}
  let total = 0

  for (const row of result.rows) {
    statusCounts[row.status] = parseInt(row.count)
    total += parseInt(row.count)
  }

  return statusOrder.map((status) => ({
    stage: status,
    count: statusCounts[status] || 0,
    percentage: total > 0 ? Math.round(((statusCounts[status] || 0) / total) * 100) : 0,
  }))
}

/**
 * Get lead sources breakdown
 */
export async function getSourceBreakdown(range: DateRange): Promise<SourceData[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT source, COUNT(*) as count
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2
     GROUP BY source
     ORDER BY count DESC`,
    [range.start, range.end]
  )

  const total = result.rows.reduce((sum, row) => sum + parseInt(row.count), 0)

  return result.rows.map((row) => ({
    source: row.source,
    count: parseInt(row.count),
    percentage: total > 0 ? Math.round((parseInt(row.count) / total) * 100) : 0,
  }))
}

/**
 * Get agent performance leaderboard
 */
export async function getAgentLeaderboard(range: DateRange): Promise<AgentPerformance[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT
       u.id,
       u.name,
       u.email,
       COUNT(l.id) as total_leads,
       COUNT(l.id) FILTER (WHERE l.status = 'closed') as closed_leads
     FROM admin_users u
     LEFT JOIN leads l ON l.assigned_to = u.id::text
       AND l.created_at >= $1 AND l.created_at <= $2
     WHERE u.is_active = TRUE
     GROUP BY u.id, u.name, u.email
     ORDER BY closed_leads DESC, total_leads DESC`,
    [range.start, range.end]
  )

  return result.rows.map((row) => ({
    id: row.id,
    name: row.name || 'Unknown',
    email: row.email,
    totalLeads: parseInt(row.total_leads),
    closedLeads: parseInt(row.closed_leads),
    conversionRate: parseInt(row.total_leads) > 0
      ? Math.round((parseInt(row.closed_leads) / parseInt(row.total_leads)) * 100)
      : 0,
  }))
}

/**
 * Get key metrics
 */
export async function getKeyMetrics(range: DateRange): Promise<{
  totalLeads: number
  newLeads: number
  qualifiedLeads: number
  closedLeads: number
  conversionRate: number
  avgResponseTime: string | null
}> {
  await ensureInitialized()

  const result = await query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'new') as new_leads,
       COUNT(*) FILTER (WHERE status IN ('qualified', 'showing', 'offer', 'closed')) as qualified,
       COUNT(*) FILTER (WHERE status = 'closed') as closed
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2`,
    [range.start, range.end]
  )

  const row = result.rows[0]
  const total = parseInt(row.total)
  const closed = parseInt(row.closed)

  return {
    totalLeads: total,
    newLeads: parseInt(row.new_leads),
    qualifiedLeads: parseInt(row.qualified),
    closedLeads: closed,
    conversionRate: total > 0 ? Math.round((closed / total) * 100) : 0,
    avgResponseTime: null, // Would need to calculate from notes/activity
  }
}

/**
 * Get comparison metrics (current vs previous period)
 */
export async function getComparisonMetrics(range: DateRange): Promise<{
  leads: { current: number; previous: number; change: number }
  closed: { current: number; previous: number; change: number }
}> {
  await ensureInitialized()

  const periodLength = range.end.getTime() - range.start.getTime()
  const previousStart = new Date(range.start.getTime() - periodLength)
  const previousEnd = new Date(range.start.getTime() - 1)

  const currentResult = await query(
    `SELECT
       COUNT(*) as leads,
       COUNT(*) FILTER (WHERE status = 'closed') as closed
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2`,
    [range.start, range.end]
  )

  const previousResult = await query(
    `SELECT
       COUNT(*) as leads,
       COUNT(*) FILTER (WHERE status = 'closed') as closed
     FROM leads
     WHERE created_at >= $1 AND created_at <= $2`,
    [previousStart, previousEnd]
  )

  const current = {
    leads: parseInt(currentResult.rows[0].leads),
    closed: parseInt(currentResult.rows[0].closed),
  }

  const previous = {
    leads: parseInt(previousResult.rows[0].leads),
    closed: parseInt(previousResult.rows[0].closed),
  }

  const calcChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0
    return Math.round(((curr - prev) / prev) * 100)
  }

  return {
    leads: {
      current: current.leads,
      previous: previous.leads,
      change: calcChange(current.leads, previous.leads),
    },
    closed: {
      current: current.closed,
      previous: previous.closed,
      change: calcChange(current.closed, previous.closed),
    },
  }
}
