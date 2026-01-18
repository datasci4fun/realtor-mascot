'use client'

import { useState, useEffect } from 'react'
import { Property } from '@/lib/properties'

interface PropertyDebugOverlayProps {
  property: Property
}

export function PropertyDebugOverlay({ property }: PropertyDebugOverlayProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)

  // Check localStorage for debug mode on mount
  useEffect(() => {
    const debugEnabled = localStorage.getItem('propertyDebugMode') === 'true'
    setIsEnabled(debugEnabled)
  }, [])

  // Toggle debug mode
  const toggleDebugMode = () => {
    const newValue = !isEnabled
    setIsEnabled(newValue)
    localStorage.setItem('propertyDebugMode', String(newValue))
    if (!newValue) setIsOpen(false)
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
            <p className="text-sm text-gray-400 mt-1">
              {filledFields.length} / {allFields.length} fields populated
            </p>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${(filledFields.length / allFields.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="p-4 space-y-6">
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

          <div className="sticky bottom-0 bg-gray-800 p-4 border-t border-gray-700 text-xs text-gray-500">
            <p>Press <kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd> + <kbd className="bg-gray-700 px-1 rounded">Shift</kbd> + <kbd className="bg-gray-700 px-1 rounded">D</kbd> to toggle debug mode</p>
          </div>
        </div>
      )}
    </>
  )
}
