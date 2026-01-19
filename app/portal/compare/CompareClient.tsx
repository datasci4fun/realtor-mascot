'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Favorite, Property } from '@/types/portal'

interface CompareClientProps {
  favorites: (Favorite & { property: Property })[]
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatNumber(num: number | null): string {
  if (num === null) return 'N/A'
  return num.toLocaleString()
}

function calculatePricePerSqft(price: number, sqft: number | null): string {
  if (!sqft) return 'N/A'
  return formatPrice(Math.round(price / sqft))
}

// Determine which property has the best value for a metric
function getBestValue(
  properties: Property[],
  getValue: (p: Property) => number | null,
  preferLower: boolean = true
): string | null {
  const values = properties.map((p, i) => ({ id: p.id, value: getValue(p), index: i }))
  const validValues = values.filter((v) => v.value !== null)
  if (validValues.length === 0) return null

  const best = validValues.reduce((best, curr) => {
    if (best.value === null) return curr
    if (curr.value === null) return best
    if (preferLower) {
      return curr.value < best.value ? curr : best
    }
    return curr.value > best.value ? curr : best
  })

  return best.id
}

export default function CompareClient({ favorites }: CompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const maxComparison = 4

  const selectedProperties = favorites
    .filter((f) => selectedIds.includes(f.property.id))
    .map((f) => f.property)

  const toggleSelection = (propertyId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(propertyId)) {
        return prev.filter((id) => id !== propertyId)
      }
      if (prev.length >= maxComparison) {
        return prev
      }
      return [...prev, propertyId]
    })
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  // Calculate best values for highlighting
  const bestPrice = selectedProperties.length > 0
    ? getBestValue(selectedProperties, (p) => p.list_price, true)
    : null
  const bestSqft = selectedProperties.length > 0
    ? getBestValue(selectedProperties, (p) => p.sqft, false)
    : null
  const bestBeds = selectedProperties.length > 0
    ? getBestValue(selectedProperties, (p) => p.beds, false)
    : null
  const bestPricePerSqft = selectedProperties.length > 0
    ? getBestValue(selectedProperties, (p) => p.sqft ? p.list_price / p.sqft : null, true)
    : null
  const newestYear = selectedProperties.length > 0
    ? getBestValue(selectedProperties, (p) => p.year_built, false)
    : null

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Compare Properties
        </h1>
        <p className="text-gray-600 mt-1">
          Select up to {maxComparison} properties from your favorites to compare side by side
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No favorites to compare</h3>
          <p className="text-gray-500 mb-6">
            Save some properties to your favorites first, then come back to compare them
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
        <div className="space-y-8">
          {/* Property Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Select Properties ({selectedIds.length}/{maxComparison})
              </h2>
              {selectedIds.length > 0 && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear selection
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favorites.map((fav) => {
                const isSelected = selectedIds.includes(fav.property.id)
                const isDisabled = !isSelected && selectedIds.length >= maxComparison

                return (
                  <button
                    key={fav.id}
                    onClick={() => toggleSelection(fav.property.id)}
                    disabled={isDisabled}
                    className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary-600 bg-primary-50'
                        : isDisabled
                        ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}

                    {/* Property thumbnail */}
                    <div className="aspect-video bg-gray-200 rounded-md mb-2 overflow-hidden">
                      {fav.property.image_url ? (
                        <img
                          src={fav.property.image_url}
                          alt={fav.property.address}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <p className="font-medium text-gray-900 text-sm truncate">
                      {fav.property.address}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {fav.property.city}, {fav.property.state}
                    </p>
                    <p className="text-sm font-semibold text-primary-600 mt-1">
                      {formatPrice(fav.property.list_price)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Comparison Table */}
          {selectedProperties.length >= 2 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 font-semibold text-gray-700 w-40">
                        Property
                      </th>
                      {selectedProperties.map((property) => (
                        <th key={property.id} className="p-4 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-16 bg-gray-200 rounded-md mb-2 overflow-hidden">
                              {property.image_url ? (
                                <img
                                  src={property.image_url}
                                  alt={property.address}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-sm font-medium text-gray-900 max-w-[150px] truncate">
                              {property.address}
                            </p>
                            <p className="text-xs text-gray-500">
                              {property.city}, {property.state}
                            </p>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* Price */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Price</td>
                      {selectedProperties.map((property) => (
                        <td
                          key={property.id}
                          className={`p-4 text-center font-semibold ${
                            bestPrice === property.id
                              ? 'text-green-600 bg-green-50'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatPrice(property.list_price)}
                          {bestPrice === property.id && (
                            <span className="block text-xs font-normal text-green-600">Best Price</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Beds */}
                    <tr className="bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">Bedrooms</td>
                      {selectedProperties.map((property) => (
                        <td
                          key={property.id}
                          className={`p-4 text-center ${
                            bestBeds === property.id
                              ? 'text-green-600 bg-green-50 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {property.beds}
                          {bestBeds === property.id && (
                            <span className="block text-xs font-normal text-green-600">Most</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Baths */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Bathrooms</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="p-4 text-center text-gray-900">
                          {property.baths}
                        </td>
                      ))}
                    </tr>

                    {/* Sqft */}
                    <tr className="bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">Square Feet</td>
                      {selectedProperties.map((property) => (
                        <td
                          key={property.id}
                          className={`p-4 text-center ${
                            bestSqft === property.id
                              ? 'text-green-600 bg-green-50 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {formatNumber(property.sqft)}
                          {bestSqft === property.id && (
                            <span className="block text-xs font-normal text-green-600">Largest</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Price per Sqft */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Price/Sqft</td>
                      {selectedProperties.map((property) => (
                        <td
                          key={property.id}
                          className={`p-4 text-center ${
                            bestPricePerSqft === property.id
                              ? 'text-green-600 bg-green-50 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {calculatePricePerSqft(property.list_price, property.sqft)}
                          {bestPricePerSqft === property.id && (
                            <span className="block text-xs font-normal text-green-600">Best Value</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Year Built */}
                    <tr className="bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">Year Built</td>
                      {selectedProperties.map((property) => (
                        <td
                          key={property.id}
                          className={`p-4 text-center ${
                            newestYear === property.id
                              ? 'text-green-600 bg-green-50 font-semibold'
                              : 'text-gray-900'
                          }`}
                        >
                          {property.year_built || 'N/A'}
                          {newestYear === property.id && property.year_built && (
                            <span className="block text-xs font-normal text-green-600">Newest</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* Property Type */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Type</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="p-4 text-center text-gray-900 capitalize">
                          {property.property_type || 'N/A'}
                        </td>
                      ))}
                    </tr>

                    {/* Status */}
                    <tr className="bg-gray-50/50">
                      <td className="p-4 font-medium text-gray-700">Status</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="p-4 text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            property.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : property.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {property.status === 'active' ? 'Active' : property.status === 'pending' ? 'Pending' : 'Sold'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="p-4 font-medium text-gray-700">Actions</td>
                      {selectedProperties.map((property) => (
                        <td key={property.id} className="p-4 text-center">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/listings/${property.slug}`}
                              className="inline-flex items-center justify-center px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/portal/viewings?property=${property.id}`}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-primary-600 text-primary-600 text-sm rounded-lg hover:bg-primary-50 transition-colors"
                            >
                              Schedule Viewing
                            </Link>
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : selectedProperties.length === 1 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-blue-800 font-medium">Select at least one more property to compare</p>
              <p className="text-blue-600 text-sm mt-1">You can compare up to {maxComparison} properties</p>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 font-medium">Select properties above to compare them</p>
              <p className="text-gray-500 text-sm mt-1">Click on properties to add them to your comparison</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
