'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Property, formatPrice, formatFullDate, getTotalBaths, getFullAddress, isSoldOverAsking, getPriceDifference } from '@/types/property'
import { LayoutStyle } from '@/lib/mock-property'
import { PhotoGalleryModal, ViewAllPhotosButton } from './PhotoGalleryModal'

// Shared Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 10H7V7a2 2 0 012-2h.5a.5.5 0 01.5.5v.5a1 1 0 001 1h2a1 1 0 001-1V5a2 2 0 00-2-2H9a4 4 0 00-4 4v3H3a1 1 0 00-1 1v5a4 4 0 004 4h12a4 4 0 004-4v-5a1 1 0 00-1-1z" />
    </svg>
  )
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

// Property placeholder SVG
function PropertyPlaceholder({ beds, className }: { beds: number; className?: string }) {
  const baseClass = className || "w-full h-full"
  return (
    <svg className={baseClass} viewBox="0 0 400 300" fill="none">
      <rect width="400" height="300" className="fill-primary-50" />
      <rect x="80" y="100" width="240" height="170" className="fill-primary-200" rx="4" />
      <path d="M60 120 L200 30 L340 120" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
      <rect x="160" y="180" width="80" height="90" className="fill-primary-300" rx="2" />
      <rect x="100" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
      <rect x="250" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
      <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">{beds}+ Bedroom Home</text>
    </svg>
  )
}

// Status Badge Component
function StatusBadge({ property }: { property: Property }) {
  const isSold = property.status === 'sold'
  const overAsking = isSoldOverAsking(property)

  return (
    <>
      <div className="absolute top-4 left-4">
        {isSold ? (
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            <CheckIcon className="w-4 h-4" />
            SOLD
          </span>
        ) : property.status === 'pending' ? (
          <span className="bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            PENDING
          </span>
        ) : (
          <span className="bg-primary-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            FOR SALE
          </span>
        )}
      </div>
      {isSold && overAsking && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          Sold Over Asking!
        </div>
      )}
    </>
  )
}

// Contact Card Component
function ContactCard({ property }: { property: Property }) {
  const isSold = property.status === 'sold'

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {isSold ? 'Interested in Similar Properties?' : 'Schedule a Showing'}
      </h3>
      <p className="text-gray-600 mb-6">
        {isSold
          ? "This property has sold, but I can help you find similar homes in the area."
          : "Contact me to schedule a private showing of this property."}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            GK
          </div>
          <div>
            <p className="font-semibold text-gray-900">Greg Knapp</p>
            <p className="text-sm text-gray-500">Broker & Owner</p>
          </div>
        </div>

        <a
          href="tel:+14694857313"
          className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          <PhoneIcon className="w-5 h-5" />
          (469) 485-7313
        </a>

        <a
          href="mailto:angela@artisticrealestate.com"
          className="flex items-center justify-center gap-2 w-full border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
        >
          <EnvelopeIcon className="w-5 h-5" />
          Send Email
        </a>

        <Link
          href="/contact"
          className="block text-center w-full text-primary-600 py-2 font-medium hover:underline"
        >
          Send a Message
        </Link>
      </div>
    </div>
  )
}

// Quick Stats Component
function QuickStats({ property, compact = false }: { property: Property; compact?: boolean }) {
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
          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-2xl font-bold text-gray-900">
          {property.closeDate ? formatFullDate(property.closeDate).split(',')[0] : 'N/A'}
        </p>
        <p className="text-sm text-gray-500">{isSold ? 'Sold Date' : 'Listed'}</p>
      </div>
    </div>
  )
}

// Price Display Component
function PriceDisplay({ property, size = 'large' }: { property: Property; size?: 'large' | 'small' }) {
  const isSold = property.status === 'sold'
  const priceDiff = getPriceDifference(property)
  const textSize = size === 'large' ? 'text-3xl md:text-4xl' : 'text-2xl'

  if (isSold) {
    return (
      <div className="text-right">
        <p className={`${textSize} font-bold text-green-600`}>
          {formatPrice(property.closePrice!)}
        </p>
        <p className="text-sm text-gray-500">
          List: {formatPrice(property.listPrice)}
          {priceDiff !== 0 && (
            <span className={priceDiff > 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
              ({priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)})
            </span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="text-right">
      <p className={`${textSize} font-bold text-primary-600`}>
        {formatPrice(property.listPrice)}
      </p>
      {property.originalPrice && property.originalPrice > property.listPrice && (
        <p className="text-sm text-gray-500">
          <span className="line-through">{formatPrice(property.originalPrice)}</span>
          <span className="text-green-600 ml-2">Price Reduced!</span>
        </p>
      )}
    </div>
  )
}

// Image Gallery Component
function ImageGallery({
  property,
  showMain = true,
  onImageClick,
  showViewAll = true
}: {
  property: Property
  showMain?: boolean
  onImageClick?: (index: number) => void
  showViewAll?: boolean
}) {
  const allImages = property.images.length > 0 ? property.images : (property.imageUrl ? [property.imageUrl] : [])

  if (allImages.length === 0) {
    return <PropertyPlaceholder beds={property.beds} className="w-full h-64 md:h-96" />
  }

  if (showMain && allImages.length === 1) {
    return (
      <div className="relative">
        <img
          src={allImages[0]}
          alt={getFullAddress(property)}
          className={`w-full h-64 md:h-96 object-cover rounded-xl ${onImageClick ? 'cursor-pointer' : ''}`}
          onClick={() => onImageClick?.(0)}
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {showMain && (
          <div className="col-span-2 row-span-2">
            <img
              src={allImages[0]}
              alt={getFullAddress(property)}
              className={`w-full h-full object-cover rounded-xl ${onImageClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
              onClick={() => onImageClick?.(0)}
            />
          </div>
        )}
        {allImages.slice(showMain ? 1 : 0, showMain ? 5 : 6).map((img, idx) => (
          <div key={idx} className="aspect-[4/3]">
            <img
              src={img}
              alt={`${property.address} - Image ${idx + 2}`}
              className={`w-full h-full object-cover rounded-lg ${onImageClick ? 'cursor-pointer hover:opacity-95 transition-opacity' : ''}`}
              onClick={() => onImageClick?.(showMain ? idx + 1 : idx)}
            />
          </div>
        ))}
      </div>
      {showViewAll && allImages.length > 1 && onImageClick && (
        <ViewAllPhotosButton
          count={allImages.length}
          onClick={() => onImageClick(0)}
        />
      )}
    </div>
  )
}

// ============ LAYOUT VARIANTS ============

interface LayoutProps {
  property: Property
  children?: React.ReactNode
}

// FULL WIDTH LAYOUT - Hero spans entire viewport width
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

// GALLERY LAYOUT - Large image gallery at top
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

// COMPACT LAYOUT - Single column, condensed
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

// MAGAZINE LAYOUT - Editorial style with large typography
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

// DEFAULT LAYOUT - Standard property page layout
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

// Export layout selector
export function getLayoutComponent(layout: LayoutStyle) {
  switch (layout) {
    case 'fullwidth':
      return FullWidthLayout
    case 'gallery':
      return GalleryLayout
    case 'compact':
      return CompactLayout
    case 'magazine':
      return MagazineLayout
    case 'default':
      return DefaultLayout
    default:
      return DefaultLayout
  }
}
