// Property types - shared between client and server

export interface Schools {
  elementary?: string
  middle?: string
  high?: string
}

export interface Property {
  id: string
  slug: string

  // Address
  address: string
  city: string
  state: string
  zip: string
  county: string | null

  // Pricing
  listPrice: number
  originalPrice: number | null
  closePrice: number | null
  closeDate: string | null

  // Property details
  beds: number
  baths: number
  halfBaths: number
  sqft: number | null
  lotSize: number | null
  lotSizeUnit: string
  yearBuilt: number | null
  stories: number
  propertyType: string
  propertyStyle: string | null

  // Garage
  garageSpaces: number
  garageType: string | null

  // HOA
  hoaFee: number | null
  hoaFrequency: string

  // Taxes
  taxAmount: number | null
  taxYear: number | null
  taxRate: number | null

  // Status
  status: 'active' | 'pending' | 'sold' | 'off_market'

  // Media
  imageUrl: string | null
  images: string[]
  virtualTourUrl: string | null

  // Description
  headline: string | null
  description: string | null
  features: string[]

  // Location
  latitude: number | null
  longitude: number | null
  neighborhood: string | null
  subdivision: string | null
  schoolDistrict: string | null
  schools: Schools

  // MLS data
  mlsNumber: string | null
  mlsBoard: string | null
  daysOnMarket: number | null
  listingAgent: string | null
  listingAgentPhone: string | null
  listingOffice: string | null

  // Metadata
  source: string
  externalId: string | null
  createdAt: string
  updatedAt: string
}

// Formatting helpers (client-safe)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

export function formatFullDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function isSoldOverAsking(property: Property): boolean {
  return property.closePrice !== null && property.closePrice > property.listPrice
}

export function getPriceDifference(property: Property): number {
  return (property.closePrice || property.listPrice) - property.listPrice
}

export function getTotalBaths(property: Property): string {
  if (property.halfBaths > 0) {
    return `${property.baths}.${property.halfBaths}`
  }
  return property.baths.toString()
}

export function getFullAddress(property: Property): string {
  return `${property.address}, ${property.city}, ${property.state} ${property.zip}`
}
