'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Property {
  id: string
  slug: string
  address: string
  city: string
  state: string
  zip: string
  list_price: number
  beds: number
  baths: number
  sqft: number | null
  property_type: string
  status: string
  image_url: string | null
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    beds: '',
    baths: '',
    city: '',
  })

  useEffect(() => {
    fetchProperties()
  }, [])

  async function fetchProperties() {
    setLoading(true)
    try {
      const res = await fetch('/api/portal/properties?' + new URLSearchParams({
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.beds && { beds: filters.beds }),
        ...(filters.baths && { baths: filters.baths }),
        ...(filters.city && { city: filters.city }),
      }))

      if (res.ok) {
        const data = await res.json()
        setProperties(data.properties || [])
      }
    } catch (error) {
      console.error('Failed to fetch properties:', error)
    } finally {
      setLoading(false)
    }
  }

  async function toggleFavorite(propertyId: string) {
    try {
      const res = await fetch('/api/portal/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })
      if (res.ok) {
        // Could update UI to show favorited state
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Search Properties
        </h1>
        <p className="text-gray-600 mt-1">
          Find your perfect home in the DFW area
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min Price</label>
            <select
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No Min</option>
              <option value="100000">$100k</option>
              <option value="200000">$200k</option>
              <option value="300000">$300k</option>
              <option value="400000">$400k</option>
              <option value="500000">$500k</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Price</label>
            <select
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">No Max</option>
              <option value="300000">$300k</option>
              <option value="400000">$400k</option>
              <option value="500000">$500k</option>
              <option value="750000">$750k</option>
              <option value="1000000">$1M</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Beds</label>
            <select
              value={filters.beds}
              onChange={(e) => setFilters({ ...filters, beds: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Baths</label>
            <select
              value={filters.baths}
              onChange={(e) => setFilters({ ...filters, baths: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
            <input
              type="text"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              placeholder="Any city"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={fetchProperties}
            className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-500">
            Try adjusting your search filters or contact us for help finding your perfect home
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Property Image */}
              <div className="aspect-video bg-gray-200 relative">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.address}
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
                    property.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : property.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {property.status === 'active' ? 'Active' : property.status === 'pending' ? 'Pending' : 'Sold'}
                  </span>
                </div>
                {/* Favorite button */}
                <button
                  onClick={() => toggleFavorite(property.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              {/* Property Details */}
              <div className="p-4">
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {formatPrice(property.list_price)}
                </p>
                <p className="text-gray-900 font-medium mb-1">
                  {property.address}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  {property.city}, {property.state} {property.zip}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <span>{property.beds} bd</span>
                  <span>{property.baths} ba</span>
                  {property.sqft && <span>{property.sqft.toLocaleString()} sqft</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/listings/${property.slug}`}
                    className="flex-1 text-center px-3 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/portal/viewings?property=${property.id}`}
                    className="flex-1 text-center px-3 py-2 border border-primary-600 text-primary-600 text-sm rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    Schedule Tour
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
