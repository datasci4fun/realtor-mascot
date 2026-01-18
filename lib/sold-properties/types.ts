// Greg Knapp's Sold Properties - Type definitions
// Artistic Real Estate Group

export interface SoldProperty {
  id: string
  address: string
  city: string
  state: string
  zip: string
  closeDate: string
  listPrice: number
  closePrice: number
  beds: number
  baths: number
  halfBaths?: number
  sqft: number | null
  lotSize?: number | null
  propertyType?: string
  imageUrl?: string
}
