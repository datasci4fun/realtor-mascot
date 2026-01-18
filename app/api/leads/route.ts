import { NextRequest, NextResponse } from 'next/server'
import { Lead, LeadSubmissionResponse } from '@/types/lead'
import { createLead, getLeads, getLeadStats } from '@/lib/leads'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest): Promise<NextResponse<LeadSubmissionResponse>> {
  try {
    const lead: Lead = await request.json()

    // Validate required fields
    if (!lead.email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      )
    }

    // Add metadata
    const enrichedLead: Lead = {
      ...lead,
      timestamp: lead.timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent') || undefined,
      referrer: request.headers.get('referer') || undefined,
    }

    const result = await createLead(enrichedLead)

    if (result.success) {
      return NextResponse.json({
        success: true,
        leadId: result.leadId,
        message: 'Thank you! We will be in touch soon.',
      })
    }

    return NextResponse.json(
      { success: false, error: result.error || 'Failed to save lead' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Lead submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Require authentication for listing leads
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)

  const filters = {
    status: searchParams.get('status') || undefined,
    source: searchParams.get('source') || undefined,
    priority: searchParams.get('priority') || undefined,
    search: searchParams.get('search') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
    offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
  }

  const { leads, total } = await getLeads(filters)
  const stats = await getLeadStats()

  return NextResponse.json({
    leads,
    total,
    stats,
  })
}
