import { NextRequest, NextResponse } from 'next/server'
import { findDuplicates, mergeLeads, getDuplicateCount } from '@/lib/duplicates'
import { verifySession } from '@/lib/auth'
import { logAudit } from '@/lib/audit'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifySession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    // Return just the count if requested
    if (searchParams.get('count') === 'true') {
      const count = await getDuplicateCount()
      return NextResponse.json({ count })
    }

    const duplicates = await findDuplicates()

    return NextResponse.json({ duplicates })
  } catch (error) {
    console.error('Error finding duplicates:', error)
    return NextResponse.json({ error: 'Failed to find duplicates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifySession(sessionToken)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate request
    if (!body.primaryId || !body.secondaryIds || !Array.isArray(body.secondaryIds)) {
      return NextResponse.json(
        { error: 'Primary ID and secondary IDs are required' },
        { status: 400 }
      )
    }

    if (body.secondaryIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one secondary ID is required' },
        { status: 400 }
      )
    }

    // Merge leads
    const mergedLead = await mergeLeads(body.primaryId, body.secondaryIds, {
      mergeFields: body.mergeFields,
      mergedBy: user.id,
    })

    // Log the merge action
    await logAudit({
      userId: user.id,
      action: 'merge',
      entityType: 'leads',
      entityId: body.primaryId,
      newValues: {
        primaryId: body.primaryId,
        secondaryIds: body.secondaryIds,
        mergeFields: body.mergeFields,
      },
    })

    return NextResponse.json({
      success: true,
      lead: mergedLead,
      mergedCount: body.secondaryIds.length,
    })
  } catch (error) {
    console.error('Error merging leads:', error)
    return NextResponse.json({ error: 'Failed to merge leads' }, { status: 500 })
  }
}
