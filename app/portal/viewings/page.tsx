import { redirect } from 'next/navigation'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import type { ViewingRequest, Property } from '@/types/portal'
import ViewingsClient from './ViewingsClient'

async function getViewings(leadId: string): Promise<(ViewingRequest & { property?: Property })[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT vr.*,
            p.id as prop_id, p.slug, p.address, p.city, p.state, p.zip,
            p.list_price, p.beds, p.baths, p.image_url
     FROM viewing_requests vr
     LEFT JOIN properties p ON vr.property_id = p.id
     WHERE vr.lead_id = $1
     ORDER BY
       CASE vr.status
         WHEN 'scheduled' THEN 1
         WHEN 'pending' THEN 2
         WHEN 'completed' THEN 3
         WHEN 'cancelled' THEN 4
       END,
       vr.scheduled_at ASC NULLS LAST,
       vr.created_at DESC`,
    [leadId]
  )

  return result.rows.map((row) => ({
    id: row.id,
    lead_id: row.lead_id,
    property_id: row.property_id,
    preferred_date: row.preferred_date,
    preferred_time: row.preferred_time,
    status: row.status,
    scheduled_at: row.scheduled_at,
    notes: row.notes,
    created_at: row.created_at,
    property: row.prop_id ? {
      id: row.prop_id,
      slug: row.slug,
      address: row.address,
      city: row.city,
      state: row.state,
      zip: row.zip,
      list_price: row.list_price,
      beds: row.beds,
      baths: row.baths,
      sqft: null,
      year_built: null,
      property_type: 'Single-Family',
      status: 'active',
      image_url: row.image_url,
      images: [],
      headline: null,
      description: null,
    } : undefined,
  }))
}

export default async function ViewingsPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const viewings = await getViewings(client.id)

  return <ViewingsClient viewings={viewings} />
}
