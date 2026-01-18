import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import {
  getLeadTrend,
  getConversionFunnel,
  getSourceBreakdown,
  getAgentLeaderboard,
  getKeyMetrics,
  getComparisonMetrics,
} from '@/lib/analytics'
import { subDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rangeParam = searchParams.get('range') || '30d'

  // Parse date range
  let end = endOfDay(new Date())
  let start: Date

  switch (rangeParam) {
    case '7d':
      start = startOfDay(subDays(new Date(), 7))
      break
    case '30d':
      start = startOfDay(subDays(new Date(), 30))
      break
    case '90d':
      start = startOfDay(subDays(new Date(), 90))
      break
    case '1y':
      start = startOfDay(subDays(new Date(), 365))
      break
    default:
      // Check for custom range format: start_date,end_date
      if (rangeParam.includes(',')) {
        const [startStr, endStr] = rangeParam.split(',')
        start = startOfDay(new Date(startStr))
        end = endOfDay(new Date(endStr))
      } else {
        start = startOfDay(subDays(new Date(), 30))
      }
  }

  const range = { start, end }

  try {
    const [trend, funnel, sources, agents, metrics, comparison] = await Promise.all([
      getLeadTrend(range),
      getConversionFunnel(range),
      getSourceBreakdown(range),
      getAgentLeaderboard(range),
      getKeyMetrics(range),
      getComparisonMetrics(range),
    ])

    return NextResponse.json({
      range: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      trend,
      funnel,
      sources,
      agents,
      metrics,
      comparison,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
