'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property, formatPrice, formatFullDate, getFullAddress } from '@/types/property'
import { ArrowLeftIcon, MapPinIcon } from '@/components/icons'
import { PropertyPlaceholder } from '@/components/illustrations'
import { StatusBadge } from '../StatusBadge'
import { ContactCard } from '../ContactCard'
import { QuickStats } from '../QuickStats'
import { PhotoGalleryModal, ViewAllPhotosButton } from '../PhotoGalleryModal'

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

export function FullWidthLayout({ property, children }: LayoutProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const isSold = property.status === 'sold'
  const allImages = property.images.length > 0 ? property.images : (property.imageUrl ? [property.imageUrl] : [])

  const openGallery = (index: number = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Full-width Hero */}
      <div className="relative h-[60vh] min-h-[400px] max-h-[600px]">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
            alt={getFullAddress(property)}
            className="absolute inset-0 w-full h-full object-cover cursor-pointer"
            onClick={() => openGallery(0)}
          />
        ) : (
          <PropertyPlaceholder beds={property.beds} className="w-full h-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/listings"
            className="inline-flex items-center bg-white/90 backdrop-blur-sm text-gray-800 px-4 py-2 rounded-full hover:bg-white transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back
          </Link>
        </div>

        <StatusBadge property={property} />

        {/* View All Photos Button */}
        {allImages.length > 0 && (
          <ViewAllPhotosButton
            count={allImages.length}
            onClick={() => openGallery(0)}
          />
        )}

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
              {property.address}
            </h1>
            <p className="text-xl text-white/90 flex items-center gap-2 mb-4">
              <MapPinIcon className="w-5 h-5" />
              {property.city}, {property.state} {property.zip}
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <QuickStats property={property} compact />
              <div className="text-right">
                <p className="text-4xl md:text-5xl font-bold text-white">
                  {isSold ? formatPrice(property.closePrice!) : formatPrice(property.listPrice)}
                </p>
                {isSold && (
                  <p className="text-white/80">Sold {formatFullDate(property.closeDate!)}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {children}
          </div>
          <div className="space-y-6">
            <ContactCard property={property} />
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
