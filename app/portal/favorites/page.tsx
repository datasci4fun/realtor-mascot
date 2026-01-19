import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import type { Favorite, Property } from '@/types/portal'

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

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export default async function FavoritesPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const favorites = await getFavorites(client.id)

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Saved Properties
        </h1>
        <p className="text-gray-600 mt-1">
          Properties you&apos;ve favorited for easy access
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">
            Start browsing properties and save your favorites here
          </p>
          <Link
            href="/portal/search"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Property Image */}
              <div className="aspect-video bg-gray-200 relative">
                {fav.property.image_url ? (
                  <img
                    src={fav.property.image_url}
                    alt={fav.property.address}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    fav.property.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : fav.property.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {fav.property.status === 'active' ? 'Active' : fav.property.status === 'pending' ? 'Pending' : 'Sold'}
                  </span>
                </div>
                {/* Heart icon */}
                <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-red-500">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {formatPrice(fav.property.list_price)}
                </p>
                <p className="text-gray-900 font-medium mb-1">
                  {fav.property.address}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  {fav.property.city}, {fav.property.state} {fav.property.zip}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    {fav.property.beds} bd
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    {fav.property.baths} ba
                  </span>
                  {fav.property.sqft && (
                    <span>{fav.property.sqft.toLocaleString()} sqft</span>
                  )}
                </div>

                {/* Notes */}
                {fav.notes && (
                  <p className="text-sm text-gray-500 italic mb-4 line-clamp-2">
                    &quot;{fav.notes}&quot;
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/listings/${fav.property.slug}`}
                    className="flex-1 text-center px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/portal/viewings?property=${fav.property.id}`}
                    className="flex-1 text-center px-3 py-2 border border-primary-600 text-primary-600 text-sm rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Schedule Viewing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
