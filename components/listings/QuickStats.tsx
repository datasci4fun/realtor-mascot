'use client'

import { Property, formatFullDate, getTotalBaths } from '@/types/property'
import { BedIcon, BathIcon, SquareIcon, CalendarIcon } from '@/components/icons'

interface QuickStatsProps {
  property: Property
  compact?: boolean
}

export function QuickStats({ property, compact = false }: QuickStatsProps) {
  const isSold = property.status === 'sold'

  if (compact) {
    return (
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1">
          <BedIcon className="w-4 h-4 text-primary-600" />
          <strong>{property.beds}</strong> beds
        </span>
        <span className="flex items-center gap-1">
          <BathIcon className="w-4 h-4 text-primary-600" />
          <strong>{getTotalBaths(property)}</strong> baths
        </span>
        {property.sqft && (
          <span className="flex items-center gap-1">
            <SquareIcon className="w-4 h-4 text-primary-600" />
            <strong>{property.sqft.toLocaleString()}</strong> sqft
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
          <BedIcon className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
        <p className="text-sm text-gray-500">Bedrooms</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
          <BathIcon className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{getTotalBaths(property)}</p>
        <p className="text-sm text-gray-500">Bathrooms</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
          <SquareIcon className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {property.sqft ? property.sqft.toLocaleString() : 'N/A'}
        </p>
        <p className="text-sm text-gray-500">Sq. Ft.</p>
      </div>
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
          <CalendarIcon className="w-6 h-6 text-primary-600" />
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {property.closeDate ? formatFullDate(property.closeDate).split(',')[0] : 'N/A'}
        </p>
        <p className="text-sm text-gray-500">{isSold ? 'Sold Date' : 'Listed'}</p>
      </div>
    </div>
  )
}
