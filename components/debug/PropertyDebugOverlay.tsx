'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Property } from '@/lib/properties'
import { PlaceholderImageStyle, LayoutStyle, PLACEHOLDER_IMAGES } from '@/lib/mock-property'

interface PropertyDebugOverlayProps {
  property: Property
  isPreviewMode: boolean
  imageStyle?: PlaceholderImageStyle
  layoutStyle?: LayoutStyle
}

const IMAGE_STYLE_OPTIONS: { value: PlaceholderImageStyle; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern', description: 'Contemporary architecture' },
  { value: 'traditional', label: 'Traditional', description: 'Classic home styles' },
  { value: 'luxury', label: 'Luxury', description: 'High-end estates' },
  { value: 'cottage', label: 'Cottage', description: 'Cozy & charming' },
  { value: 'ranch', label: 'Ranch', description: 'Single-story homes' },
  { value: 'none', label: 'None', description: 'Use SVG placeholders' },
]

const LAYOUT_STYLE_OPTIONS: { value: LayoutStyle; label: string; description: string }[] = [
  { value: 'default', label: 'Default', description: 'Standard 2-column layout' },
  { value: 'fullwidth', label: 'Full Width', description: 'Hero image spans full width' },
  { value: 'gallery', label: 'Gallery First', description: 'Image gallery at top' },
  { value: 'compact', label: 'Compact', description: 'Condensed single column' },
  { value: 'magazine', label: 'Magazine', description: 'Editorial style layout' },
]

export function PropertyDebugOverlay({ property, isPreviewMode, imageStyle = 'modern', layoutStyle = 'default' }: PropertyDebugOverlayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [activeTab, setActiveTab] = useState<'fields' | 'design'>('design')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check localStorage for debug mode on mount
  useEffect(() => {
    const debugEnabled = localStorage.getItem('propertyDebugMode') === 'true'
    setIsEnabled(debugEnabled)
    // Auto-open panel if in preview mode
    if (isPreviewMode && debugEnabled) {
      setIsOpen(true)
    }
  }, [isPreviewMode])

  // Toggle debug mode
  const toggleDebugMode = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    localStorage.setItem('propertyDebugMode', String(newValue))
    if (!newValue) setIsOpen(false)
  }

  // Toggle preview mode (with mock data)
  const togglePreviewMode = () => {
    const currentUrl = new URL(window.location.href)
    if (isPreviewMode) {
      currentUrl.searchParams.delete('preview')
      currentUrl.searchParams.delete('images')
      currentUrl.searchParams.delete('layout')
    } else {
      currentUrl.searchParams.set('preview', 'full')
    }
    router.push(currentUrl.pathname + currentUrl.search)
  }

  // Change image style
  const setImageStyle = (style: PlaceholderImageStyle) => {
    const currentUrl = new URL(window.location.href)
    if (!isPreviewMode) {
      currentUrl.searchParams.set('preview', 'full')
    }
    if (style === 'modern') {
      currentUrl.searchParams.delete('images')
    } else {
      currentUrl.searchParams.set('images', style)
    }
    router.push(currentUrl.pathname + currentUrl.search)
  }

  // Change layout style
  const setLayoutStyle = (layout: LayoutStyle) => {
    const currentUrl = new URL(window.location.href)
    if (!isPreviewMode) {
      currentUrl.searchParams.set('preview', 'full')
    }
    if (layout === 'default') {
      currentUrl.searchParams.delete('layout')
    } else {
      currentUrl.searchParams.set('layout', layout)
    }
    router.push(currentUrl.pathname + currentUrl.search)
  }

  // Keyboard shortcut: Ctrl+Shift+D to toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault()
        toggleDebugMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled])

  if (!isEnabled) {
    return (
      <button
        onClick={toggleDebugMode}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 text-gray-400 p-2 rounded-lg text-xs opacity-30 hover:opacity-100 transition-opacity"
        title="Enable Debug Mode (Ctrl+Shift+D)"
      >
        DBG
      </button>
    )
  }

  // Group fields by category
  const fieldGroups = {
    'Address': {
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      county: property.county,
    },
    'Pricing': {
      listPrice: property.listPrice,
      originalPrice: property.originalPrice,
      closePrice: property.closePrice,
      closeDate: property.closeDate,
    },
    'Property Details': {
      beds: property.beds,
      baths: property.baths,
      halfBaths: property.halfBaths,
      sqft: property.sqft,
      lotSize: property.lotSize,
      lotSizeUnit: property.lotSizeUnit,
      yearBuilt: property.yearBuilt,
      stories: property.stories,
      propertyType: property.propertyType,
      propertyStyle: property.propertyStyle,
    },
    'Garage': {
      garageSpaces: property.garageSpaces,
      garageType: property.garageType,
    },
    'HOA & Taxes': {
      hoaFee: property.hoaFee,
      hoaFrequency: property.hoaFrequency,
      taxAmount: property.taxAmount,
      taxYear: property.taxYear,
      taxRate: property.taxRate,
    },
    'Location': {
      latitude: property.latitude,
      longitude: property.longitude,
      neighborhood: property.neighborhood,
      subdivision: property.subdivision,
      schoolDistrict: property.schoolDistrict,
      schools: property.schools,
    },
    'MLS Data': {
      mlsNumber: property.mlsNumber,
      mlsBoard: property.mlsBoard,
      daysOnMarket: property.daysOnMarket,
      listingAgent: property.listingAgent,
      listingAgentPhone: property.listingAgentPhone,
      listingOffice: property.listingOffice,
    },
    'Media': {
      imageUrl: property.imageUrl,
      images: property.images,
      virtualTourUrl: property.virtualTourUrl,
    },
    'Content': {
      headline: property.headline,
      description: property.description ? `${property.description.substring(0, 50)}...` : null,
      features: property.features,
    },
    'Metadata': {
      id: property.id,
      slug: property.slug,
      status: property.status,
      source: property.source,
      externalId: property.externalId,
    },
  }

  const getValueDisplay = (value: any): { display: string; hasValue: boolean } => {
    if (value === null || value === undefined) {
      return { display: 'null', hasValue: false }
    }
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return { display: `[${value.length} items]`, hasValue: value.length > 0 }
      }
      const keys = Object.keys(value)
      return { display: `{${keys.length} keys}`, hasValue: keys.length > 0 }
    }
    if (typeof value === 'string' && value === '') {
      return { display: '""', hasValue: false }
    }
    return { display: String(value), hasValue: true }
  }

  // Count filled vs total fields
  const allFields = Object.values(fieldGroups).flatMap(group => Object.values(group))
  const filledFields = allFields.filter(v => {
    if (v === null || v === undefined) return false
    if (typeof v === 'string' && v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false
    return true
  })

  return (
    <>
      {/* Preview Mode Banner */}
      {isPreviewMode && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
          <span className="inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            PREVIEW MODE - Showing template with placeholder data for missing fields
            <button
              onClick={togglePreviewMode}
              className="ml-4 bg-amber-600 hover:bg-amber-700 px-3 py-1 rounded text-xs"
            >
              Exit Preview
            </button>
          </span>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          isOpen ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
        }`}
        title={isOpen ? 'Close Debug Panel' : 'Open Debug Panel'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          )}
        </svg>
      </button>

      {/* Disable Debug Mode Button */}
      {isOpen && (
        <button
          onClick={toggleDebugMode}
          className="fixed bottom-4 right-16 z-50 bg-gray-700 text-white px-3 py-3 rounded-full shadow-lg text-xs"
          title="Disable Debug Mode"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        </button>
      )}

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-gray-900 text-white z-40 overflow-y-auto shadow-2xl">
          <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              Property Debug
            </h2>

            {/* Preview Mode Toggle */}
            <button
              onClick={togglePreviewMode}
              className={`mt-3 w-full py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                isPreviewMode
                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {isPreviewMode ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Preview Mode ON
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Enable Preview Mode
                </>
              )}
            </button>

            {/* Tabs */}
            <div className="flex mt-4 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('design')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'design'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Design
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'fields'
                    ? 'text-primary-400 border-b-2 border-primary-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Fields ({filledFields.length}/{allFields.length})
              </button>
            </div>
          </div>

          {/* Design Tab */}
          {activeTab === 'design' && (
            <div className="p-4 space-y-6">
              {/* Image Style Selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Placeholder Images
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {IMAGE_STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setImageStyle(option.value)}
                      className={`p-3 rounded-lg text-left transition-all ${
                        imageStyle === option.value
                          ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs opacity-70 mt-0.5">{option.description}</div>
                    </button>
                  ))}
                </div>
                {/* Image Preview */}
                {imageStyle !== 'none' && PLACEHOLDER_IMAGES[imageStyle] && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={PLACEHOLDER_IMAGES[imageStyle].main}
                      alt={`${imageStyle} style preview`}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Layout Style Selector */}
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Page Layout
                </h3>
                <div className="space-y-2">
                  {LAYOUT_STYLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLayoutStyle(option.value)}
                      className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                        layoutStyle === option.value
                          ? 'bg-primary-600 text-white ring-2 ring-primary-400'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div>
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs opacity-70 mt-0.5">{option.description}</div>
                      </div>
                      {layoutStyle === option.value && (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-4 border-t border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Quick Combinations
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setImageStyle('luxury')
                      setTimeout(() => setLayoutStyle('fullwidth'), 100)
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Luxury + Full Width
                  </button>
                  <button
                    onClick={() => {
                      setImageStyle('modern')
                      setTimeout(() => setLayoutStyle('gallery'), 100)
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Modern + Gallery
                  </button>
                  <button
                    onClick={() => {
                      setImageStyle('cottage')
                      setTimeout(() => setLayoutStyle('magazine'), 100)
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Cottage + Magazine
                  </button>
                  <button
                    onClick={() => {
                      setImageStyle('ranch')
                      setTimeout(() => setLayoutStyle('compact'), 100)
                    }}
                    className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm text-gray-300 transition-colors"
                  >
                    Ranch + Compact
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Fields Tab */}
          {activeTab === 'fields' && (
            <div className="p-4 space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Data Completeness</span>
                  <span className="text-gray-300">{Math.round((filledFields.length / allFields.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${(filledFields.length / allFields.length) * 100}%` }}
                  />
                </div>
              </div>

              {Object.entries(fieldGroups).map(([groupName, fields]) => {
                const groupFields = Object.entries(fields)
                const filledInGroup = groupFields.filter(([, v]) => getValueDisplay(v).hasValue).length

                return (
                  <div key={groupName}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                      <span>{groupName}</span>
                      <span className="text-xs font-normal">
                        {filledInGroup}/{groupFields.length}
                      </span>
                    </h3>
                    <div className="space-y-1">
                      {groupFields.map(([key, value]) => {
                        const { display, hasValue } = getValueDisplay(value)
                        return (
                          <div
                            key={key}
                            className={`flex justify-between text-sm py-1 px-2 rounded ${
                              hasValue ? 'bg-gray-800' : 'bg-gray-800/50'
                            }`}
                          >
                            <span className={hasValue ? 'text-gray-300' : 'text-gray-500'}>
                              {key}
                            </span>
                            <span
                              className={`font-mono text-xs ${
                                hasValue ? 'text-green-400' : 'text-red-400'
                              }`}
                              title={typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                            >
                              {display.length > 25 ? display.substring(0, 25) + '...' : display}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 text-xs text-gray-500">
            <p>Press <kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">Shift</kbd> + <kbd className="bg-gray-700 px-1 rounded">D</kbd> to toggle debug mode</p>
          </div>
        </div>
      )}
    </>
  )
}
