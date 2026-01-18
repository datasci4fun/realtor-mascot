'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property, getFullAddress, isSoldOverAsking, getPriceDifference } from '@/types/property'
import { ArrowLeftIcon, MapPinIcon } from '@/components/icons'
import { PropertyPlaceholder } from '@/components/illustrations'
import { StatusBadge } from '../StatusBadge'
import { ContactCard } from '../ContactCard'
import { QuickStats } from '../QuickStats'
import { PriceDisplay } from '../PriceDisplay'
import { PhotoGalleryModal, ViewAllPhotosButton } from '../PhotoGalleryModal'

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

export function DefaultLayout({ property, children }: LayoutProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const isSold = property.status === 'sold'
  const overAsking = isSoldOverAsking(property)
  const priceDiff = getPriceDifference(property)
  const allImages = property.images.length > 0 ? property.images : (property.imageUrl ? [property.imageUrl] : [])

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

      {/* Hero Image Section */}
      <div className="relative bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-[16/9] md:aspect-[21/9] relative overflow-hidden">
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

            {/* Status Badge */}
            <StatusBadge property={property} />

            {/* View All Photos Button */}
            {allImages.length > 0 && (
              <ViewAllPhotosButton
                count={allImages.length}
                onClick={() => openGallery(0)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address & Price */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {property.address}
                  </h1>
                  <p className="text-lg text-gray-600 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-600" />
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <PriceDisplay property={property} />
              </div>

              {/* Key Stats */}
              <QuickStats property={property} />
            </div>

            {children}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
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
