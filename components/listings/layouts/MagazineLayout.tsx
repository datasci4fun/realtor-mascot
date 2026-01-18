'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property, formatPrice, getTotalBaths, isSoldOverAsking } from '@/types/property'
import { ArrowLeftIcon } from '@/components/icons'
import { PropertyPlaceholder } from '@/components/illustrations'
import { ContactCard } from '../ContactCard'
import { ImageGallery } from '../ImageGallery'
import { PhotoGalleryModal, ViewAllPhotosButton } from '../PhotoGalleryModal'

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

export function MagazineLayout({ property, children }: LayoutProps) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const isSold = property.status === 'sold'
  const allImages = property.images.length > 0 ? property.images : (property.imageUrl ? [property.imageUrl] : [])

  const openGallery = (index: number = 0) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Magazine Header */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/listings"
            className="inline-flex items-center text-gray-500 hover:text-primary-600 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            All Properties
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                isSold ? 'bg-green-100 text-green-800' : 'bg-primary-100 text-primary-800'
              }`}>
                {isSold ? 'Sold' : 'For Sale'}
              </span>
              {property.propertyType && (
                <span className="text-gray-500">{property.propertyType}</span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-4">
              {property.address}
            </h1>

            <p className="text-xl text-gray-600 mb-8">
              {property.city}, {property.state} {property.zip}
            </p>

            <div className="flex items-baseline gap-4 mb-8">
              <span className={`text-5xl font-bold ${isSold ? 'text-green-600' : 'text-primary-600'}`}>
                {isSold ? formatPrice(property.closePrice!) : formatPrice(property.listPrice)}
              </span>
              {isSold && (
                <span className="text-gray-500 line-through">{formatPrice(property.listPrice)}</span>
              )}
            </div>

            <div className="flex gap-8 text-lg">
              <div>
                <span className="font-bold text-gray-900">{property.beds}</span>
                <span className="text-gray-500 ml-1">Bedrooms</span>
              </div>
              <div>
                <span className="font-bold text-gray-900">{getTotalBaths(property)}</span>
                <span className="text-gray-500 ml-1">Bathrooms</span>
              </div>
              {property.sqft && (
                <div>
                  <span className="font-bold text-gray-900">{property.sqft.toLocaleString()}</span>
                  <span className="text-gray-500 ml-1">Sq Ft</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Image */}
          <div className="relative group">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={property.address}
                className="w-full aspect-[4/3] object-cover rounded-2xl shadow-2xl cursor-pointer transition-transform group-hover:scale-[1.02]"
                onClick={() => openGallery(0)}
              />
            ) : (
              <PropertyPlaceholder beds={property.beds} className="w-full aspect-[4/3] rounded-2xl" />
            )}
            {isSoldOverAsking(property) && (
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                Sold Over Asking!
              </div>
            )}
            {allImages.length > 0 && (
              <ViewAllPhotosButton
                count={allImages.length}
                onClick={() => openGallery(0)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t" />

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Gallery */}
            {allImages.length > 1 && (
              <div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Gallery</h2>
                <ImageGallery property={property} showMain={false} onImageClick={openGallery} showViewAll={false} />
              </div>
            )}

            {children}
          </div>

          <div>
            <div className="sticky top-8">
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
