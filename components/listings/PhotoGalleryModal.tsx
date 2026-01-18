'use client'

import { useState, useEffect, useCallback } from 'react'
import { Property } from '@/types/property'

interface PhotoGalleryModalProps {
  property: Property
  isOpen: boolean
  onClose: () => void
  initialIndex?: number
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  )
}

export function PhotoGalleryModal({ property, isOpen, onClose, initialIndex = 0 }: PhotoGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [viewMode, setViewMode] = useState<'single' | 'grid'>('single')

  // Get all images
  const allImages = property.images.length > 0
    ? property.images
    : (property.imageUrl ? [property.imageUrl] : [])

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
      setViewMode('single')
    }
  }, [isOpen, initialIndex])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1))
        break
      case 'ArrowRight':
        setCurrentIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0))
        break
      case 'g':
        setViewMode(prev => prev === 'single' ? 'grid' : 'single')
        break
    }
  }, [isOpen, onClose, allImages.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || allImages.length === 0) return null

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : allImages.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev < allImages.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium">
            {property.address}
          </span>
          <span className="text-white/60">
            {currentIndex + 1} / {allImages.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <button
            onClick={() => setViewMode(prev => prev === 'single' ? 'grid' : 'single')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title={viewMode === 'single' ? 'Grid view (G)' : 'Single view (G)'}
          >
            {viewMode === 'single' ? (
              <GridIcon className="w-6 h-6" />
            ) : (
              <ExpandIcon className="w-6 h-6" />
            )}
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main content */}
      {viewMode === 'single' ? (
        <div className="flex-1 flex items-center justify-center relative px-16">
          {/* Previous button */}
          <button
            onClick={goToPrevious}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Previous (Left Arrow)"
          >
            <ChevronLeftIcon className="w-8 h-8 text-white" />
          </button>

          {/* Current image */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={allImages[currentIndex]}
              alt={`${property.address} - Photo ${currentIndex + 1}`}
              className="max-w-full max-h-[calc(100vh-160px)] object-contain rounded-lg"
            />
          </div>

          {/* Next button */}
          <button
            onClick={goToNext}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            title="Next (Right Arrow)"
          >
            <ChevronRightIcon className="w-8 h-8 text-white" />
          </button>
        </div>
      ) : (
        /* Grid view */
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx)
                  setViewMode('single')
                }}
                className={`aspect-[4/3] relative rounded-lg overflow-hidden group ${
                  idx === currentIndex ? 'ring-4 ring-primary-500' : ''
                }`}
              >
                <img
                  src={img}
                  alt={`${property.address} - Photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-sm px-2 py-1 rounded">
                  {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Thumbnail strip (single view only) */}
      {viewMode === 'single' && allImages.length > 1 && (
        <div className="p-4 bg-black/50">
          <div className="flex gap-2 justify-center overflow-x-auto max-w-full">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-16 h-12 rounded-md overflow-hidden transition-all ${
                  idx === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Button component to trigger the gallery
interface ViewAllPhotosButtonProps {
  count: number
  onClick: () => void
  variant?: 'overlay' | 'standalone' | 'icon'
  className?: string
}

export function ViewAllPhotosButton({ count, onClick, variant = 'overlay', className = '' }: ViewAllPhotosButtonProps) {
  if (variant === 'icon') {
    return (
      <button
        onClick={onClick}
        className={`p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-colors ${className}`}
        title="View all photos"
      >
        <GridIcon className="w-5 h-5" />
      </button>
    )
  }

  if (variant === 'standalone') {
    return (
      <button
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors ${className}`}
      >
        <GridIcon className="w-5 h-5" />
        View All {count} Photos
      </button>
    )
  }

  // Overlay variant (default)
  return (
    <button
      onClick={onClick}
      className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/70 hover:bg-black/90 text-white rounded-lg font-medium backdrop-blur-sm transition-colors ${className}`}
    >
      <GridIcon className="w-5 h-5" />
      View All {count} Photos
    </button>
  )
}
