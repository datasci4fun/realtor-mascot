'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property, formatPrice } from '@/types/property'
import { ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from '@/components/icons'
import { PropertyPlaceholder } from '@/components/illustrations'
import { QuickStats } from '../QuickStats'
import { PhotoGalleryModal } from '../PhotoGalleryModal'

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

export function CompactLayout({ property, children }: LayoutProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const isSold = property.status === 'sold'
  const allImages = property.images.length > 0 ? property.images : (property.imageUrl ? [property.imageUrl] : [])

  const openGallery = (index: number = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Compact Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/listings"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 text-sm mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </Link>

          <div className="flex gap-4">
            {/* Small Image */}
            <div
              className="w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden relative cursor-pointer group"
              onClick={() => openGallery(0)}
            >
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.address}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <PropertyPlaceholder beds={property.beds} />
              )}
              <div className="absolute top-1 left-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isSold ? 'bg-green-600 text-white' : 'bg-primary-600 text-white'
                }`}>
                  {isSold ? 'SOLD' : 'FOR SALE'}
                </span>
              </div>
              {allImages.length > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                  +{allImages.length - 1}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">{property.address}</h1>
              <p className="text-sm text-gray-600">{property.city}, {property.state} {property.zip}</p>
              <div className="mt-2 flex items-center justify-between">
                <QuickStats property={property} compact />
                <p className={`text-xl font-bold ${isSold ? 'text-green-600' : 'text-primary-600'}`}>
                  {isSold ? formatPrice(property.closePrice!) : formatPrice(property.listPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Single Column Content */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {children}

        {/* Contact inline */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                GK
              </div>
              <div>
                <p className="font-semibold text-gray-900">Greg Knapp</p>
                <p className="text-xs text-gray-500">Artistic Real Estate Group</p>
              </div>
            </div>
            <div className="flex gap-2">
              <a href="tel:+14694857313" className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                <PhoneIcon className="w-5 h-5" />
              </a>
              <a href="mailto:angela@artisticrealestate.com" className="p-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50">
                <EnvelopeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        property={property}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />
    </div>
  )
}
