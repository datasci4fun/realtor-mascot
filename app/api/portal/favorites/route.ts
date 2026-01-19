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
      `SELECT f.*, p.slug, p.address, p.city, p.state, p.zip, p.list_price,
              p.beds, p.baths, p.sqft, p.image_url, p.status as property_status
       FROM favorites f
       JOIN properties p ON f.property_id = p.id
       WHERE f.lead_id = $1
       ORDER BY f.created_at DESC`,
      [client.id]
    )

    return NextResponse.json({ favorites: result.rows })

  } catch (error) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
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

    const { propertyId, notes } = await request.json()

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID required' }, { status: 400 })
    }

    await ensureInitialized()

    // Check if already favorited
    const existing = await query(
      'SELECT id FROM favorites WHERE lead_id = $1 AND property_id = $2',
      [client.id, propertyId]
    )

    if (existing.rows.length > 0) {
      // Remove favorite (toggle off)
      await query(
        'DELETE FROM favorites WHERE lead_id = $1 AND property_id = $2',
        [client.id, propertyId]
      )
      return NextResponse.json({ favorited: false, message: 'Removed from favorites' })
    }

    // Add favorite
    const result = await query(
      `INSERT INTO favorites (lead_id, property_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [client.id, propertyId, notes || null]
    )

    return NextResponse.json({
      favorited: true,
      favorite: result.rows[0],
      message: 'Added to favorites'
    })

  } catch (error) {
    console.error('Error toggling favorite:', error)
    return NextResponse.json(
      { error: 'Failed to update favorite' },
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
    const favoriteId = searchParams.get('id')

    if (!favoriteId) {
      return NextResponse.json({ error: 'Favorite ID required' }, { status: 400 })
    }

    await ensureInitialized()

    await query(
      'DELETE FROM favorites WHERE id = $1 AND lead_id = $2',
      [favoriteId, client.id]
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting favorite:', error)
    return NextResponse.json(
      { error: 'Failed to delete favorite' },
      { status: 500 }
    )
  }
}
