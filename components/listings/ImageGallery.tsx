'use client'

import { Property, getFullAddress } from '@/types/property'
import { PropertyPlaceholder } from '@/components/illustrations'
import { ViewAllPhotosButton } from './PhotoGalleryModal'

interface ImageGalleryProps {
  property: Property
  showMain?: boolean
  onImageClick?: (index: number) => void
  showViewAll?: boolean
}

export function ImageGallery({
  property,
  showMain = true,
  onImageClick,
  showViewAll = true
}: ImageGalleryProps) {
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
