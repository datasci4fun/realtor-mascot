import { NextRequest, NextResponse } from 'next/server'
import {
  generateLeadSummaryReport,
  generateAgentPerformanceReport,
  generateSourceAttributionReport,
  generatePipelineReport,
  ReportFilters,
} from '@/lib/reports'
import { validateSession } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await validateSession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary'

    const filters: ReportFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
      source: searchParams.get('source') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
    }

    let report

    switch (reportType) {
      case 'summary':
        report = await generateLeadSummaryReport(filters)
        break
      case 'agent':
        report = await generateAgentPerformanceReport(filters)
        break
      case 'source':
        report = await generateSourceAttributionReport(filters)
        break
      case 'pipeline':
        report = await generatePipelineReport(filters)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({ type: reportType, filters, data: report })
  } catch (error) {
    console.error('Error generating report:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
