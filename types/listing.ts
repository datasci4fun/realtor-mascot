export interface Listing {
  id: string
  price: string
  priceNumeric: number
  address: string
  neighborhood: string
  city: string
  state: string
  zip: string
  beds: number
  baths: number
  sqft: string
  sqftNumeric: number
  yearBuilt: number
  lotSize: string
  status: 'For Sale' | 'Pending' | 'Sold' | 'Coming Soon'
  type: 'Single Family' | 'Condo' | 'Townhouse' | 'Multi-Family'
  description: string
  features: string[]
  images: string[]
  virtualTourUrl?: string
  openHouseDate?: string
  mlsNumber?: string
  daysOnMarket: number
  createdAt: string
  updatedAt: string
}

export interface ListingFilters {
  minPrice?: number
  maxPrice?: number
  minBeds?: number
  maxBeds?: number
  minBaths?: number
  maxBaths?: number
  type?: Listing['type']
  status?: Listing['status']
  neighborhood?: string
  search?: string
}

export interface ListingSummary {
  id: string
  price: string
  address: string
  neighborhood: string
  beds: number
  baths: number
  sqft: string
  status: Listing['status']
  type: Listing['type']
  imageUrl?: string
}
