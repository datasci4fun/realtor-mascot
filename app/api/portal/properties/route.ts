import { NextResponse } from 'next/server'
import { query, ensureInitialized } from '@/lib/db'

export async function GET(request: Request) {
  try {
    await ensureInitialized()

    const { searchParams } = new URL(request.url)
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const beds = searchParams.get('beds')
    const baths = searchParams.get('baths')
    const city = searchParams.get('city')

    // Build query dynamically
    const conditions: string[] = ["status = 'active'"]
    const params: any[] = []
    let paramIndex = 1

    if (minPrice) {
      conditions.push(`list_price >= $${paramIndex}`)
      params.push(parseInt(minPrice))
      paramIndex++
    }

    if (maxPrice) {
      conditions.push(`list_price <= $${paramIndex}`)
      params.push(parseInt(maxPrice))
      paramIndex++
    }

    if (beds) {
      conditions.push(`beds >= $${paramIndex}`)
      params.push(parseInt(beds))
      paramIndex++
    }

    if (baths) {
      conditions.push(`baths >= $${paramIndex}`)
      params.push(parseInt(baths))
      paramIndex++
    }

    if (city) {
      conditions.push(`LOWER(city) LIKE $${paramIndex}`)
      params.push(`%${city.toLowerCase()}%`)
      paramIndex++
    }

    const result = await query(
      `SELECT id, slug, address, city, state, zip, list_price, beds, baths, sqft,
              property_type, status, image_url
       FROM properties
       WHERE ${conditions.join(' AND ')}
       ORDER BY list_price DESC
       LIMIT 50`,
      params
    )

    return NextResponse.json({ properties: result.rows })

  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}
