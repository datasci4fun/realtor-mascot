import { redirect } from 'next/navigation'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import type { Favorite, Property } from '@/types/portal'
import CompareClient from './CompareClient'

async function getFavorites(leadId: string): Promise<(Favorite & { property: Property })[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT f.*,
            p.id as property_id, p.slug, p.address, p.city, p.state, p.zip,
            p.list_price, p.beds, p.baths, p.sqft, p.year_built,
            p.property_type, p.status as property_status, p.image_url, p.images,
            p.headline, p.description
     FROM favorites f
     JOIN properties p ON f.property_id = p.id
     WHERE f.lead_id = $1
     ORDER BY f.created_at DESC`,
    [leadId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    lead_id: row.lead_id,
    property_id: row.property_id,
    notes: row.notes,
    created_at: row.created_at,
    property: {
      id: row.property_id,
      slug: row.slug,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      list_price: row.list_price,
      beds: row.beds,
      baths: row.baths,
      sqft: row.sqft,
      year_built: row.year_built,
      property_type: row.property_type,
      status: row.property_status,
      image_url: row.image_url,
      images: row.images || [],
      headline: row.headline,
      description: row.description,
    },
  }))
}

export default async function ComparePage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const favorites = await getFavorites(client.id)

  return <CompareClient favorites={favorites} />
}
