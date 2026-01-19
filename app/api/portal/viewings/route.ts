import { NextResponse } from 'next/server'
import { query, ensureInitialized } from '@/lib/db'
import { getPortalClient } from '@/lib/portal-auth'

export async function GET() {
  try {
    const client = await getPortalClient()
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureInitialized()

    const result = await query(
      `SELECT vr.*, p.slug, p.address, p.city, p.state, p.zip,
              p.list_price, p.beds, p.baths, p.image_url
       FROM viewing_requests vr
       LEFT JOIN properties p ON vr.property_id = p.id
       WHERE vr.lead_id = $1
       ORDER BY vr.created_at DESC`,
      [client.id]
    )

    return NextResponse.json({ viewings: result.rows })

  } catch (error) {
    console.error('Error fetching viewings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch viewings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await getPortalClient()
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { propertyId, preferredDate, preferredTime, notes } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    await ensureInitialized()

    // Verify property exists
    const property = await query(
      'SELECT id, address FROM properties WHERE id = $1',
      [propertyId]
    )

    if (property.rows.length === 0) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check for existing pending/scheduled viewing for this property
    const existing = await query(
      `SELECT id FROM viewing_requests
       WHERE lead_id = $1 AND property_id = $2 AND status IN ('pending', 'scheduled')`,
      [client.id, propertyId]
    )

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'You already have a viewing request for this property' },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO viewing_requests (lead_id, property_id, preferred_date, preferred_time, notes, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING *`,
      [client.id, propertyId, preferredDate || null, preferredTime || null, notes || null]
    )

    // TODO: Send notification to agent about new viewing request
    console.log(`New viewing request from client ${client.id} for property ${propertyId}`)

    return NextResponse.json({
      viewing: result.rows[0],
      message: 'Viewing request submitted successfully'
    })

  } catch (error) {
    console.error('Error creating viewing request:', error)
    return NextResponse.json(
      { error: 'Failed to submit viewing request' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await getPortalClient()
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const viewingId = searchParams.get('id')

    if (!viewingId) {
      return NextResponse.json({ error: 'Viewing ID required' }, { status: 400 })
    }

    await ensureInitialized()

    // Only allow cancelling pending viewings
    const result = await query(
      `UPDATE viewing_requests SET status = 'cancelled'
       WHERE id = $1 AND lead_id = $2 AND status = 'pending'
       RETURNING *`,
      [viewingId, client.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Viewing not found or cannot be cancelled' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, message: 'Viewing request cancelled' })

  } catch (error) {
    console.error('Error cancelling viewing:', error)
    return NextResponse.json(
      { error: 'Failed to cancel viewing' },
      { status: 500 }
    )
  }
}
