'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property } from '@/types/property'
import { ArrowLeftIcon } from '@/components/icons'
import { StatusBadge } from '../StatusBadge'
import { ContactCard } from '../ContactCard'
import { QuickStats } from '../QuickStats'
import { PriceDisplay } from '../PriceDisplay'
import { ImageGallery } from '../ImageGallery'
import { PhotoGalleryModal } from '../PhotoGalleryModal'

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

export function GalleryLayout({ property, children }: LayoutProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)

  const openGallery = (index: number = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/listings"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to All Properties
          </Link>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative">
          <ImageGallery property={property} onImageClick={openGallery} />
          <div className="absolute top-4 left-4 z-10">
            <StatusBadge property={property} />
          </div>
        </div>
      </div>

      {/* Property Info Bar */}
      <div className="bg-white border-y shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{property.address}</h1>
              <p className="text-gray-600">{property.city}, {property.state} {property.zip}</p>
            </div>
            <PriceDisplay property={property} size="small" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-md p-6">
              <QuickStats property={property} />
            </div>
            {children}
          </div>
          <div className="space-y-6">
            <div className="sticky top-24">
              <ContactCard property={property} />
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
