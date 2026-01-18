import { Listing, ListingSummary, ListingFilters } from '@/types/listing'

// Mock data - replace with CMS/database fetch
const mockListings: Listing[] = [
  {
    id: '1',
    price: '$450,000',
    priceNumeric: 450000,
    address: '123 Oak Street',
    neighborhood: 'Downtown',
    city: 'Metro City',
    state: 'ST',
    zip: '12345',
    beds: 3,
    baths: 2,
    sqft: '1,850',
    sqftNumeric: 1850,
    yearBuilt: 2015,
    lotSize: '0.25 acres',
    status: 'For Sale',
    type: 'Single Family',
    description: `Welcome to this stunning 3-bedroom home in the heart of Downtown! This beautifully maintained property features an open floor plan, modern kitchen with stainless steel appliances, and a spacious primary suite. The backyard is perfect for entertaining with a covered patio and mature landscaping.

Located within walking distance to shops, restaurants, and parks, this home offers the perfect blend of urban convenience and suburban comfort.`,
    features: [
      'Open floor plan',
      'Modern kitchen',
      'Stainless steel appliances',
      'Granite countertops',
      'Hardwood floors',
      'Primary suite with walk-in closet',
      'Covered patio',
      'Two-car garage',
      'Central A/C',
    ],
    images: [],
    daysOnMarket: 14,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    price: '$625,000',
    priceNumeric: 625000,
    address: '456 Maple Avenue',
    neighborhood: 'Riverside',
    city: 'Metro City',
    state: 'ST',
    zip: '12345',
    beds: 4,
    baths: 3,
    sqft: '2,400',
    sqftNumeric: 2400,
    yearBuilt: 2018,
    lotSize: '0.35 acres',
    status: 'For Sale',
    type: 'Single Family',
    description: `Gorgeous 4-bedroom home in the desirable Riverside neighborhood! This property boasts high ceilings, an abundance of natural light, and premium finishes throughout. The chef's kitchen features a large island, gas range, and custom cabinetry.

Enjoy peaceful mornings on the covered front porch or entertain guests in the expansive backyard with a fire pit area. Top-rated schools nearby!`,
    features: [
      'High ceilings',
      "Chef's kitchen",
      'Gas range',
      'Large island',
      'Custom cabinetry',
      'Fireplace',
      'Covered front porch',
      'Fire pit area',
      'Smart home features',
    ],
    images: [],
    daysOnMarket: 7,
    createdAt: '2024-01-08T00:00:00Z',
    updatedAt: '2024-01-08T00:00:00Z',
  },
  {
    id: '3',
    price: '$385,000',
    priceNumeric: 385000,
    address: '789 Pine Lane',
    neighborhood: 'Westside',
    city: 'Metro City',
    state: 'ST',
    zip: '12346',
    beds: 2,
    baths: 2,
    sqft: '1,200',
    sqftNumeric: 1200,
    yearBuilt: 2020,
    lotSize: 'N/A',
    status: 'For Sale',
    type: 'Condo',
    description: `Modern 2-bedroom condo in the vibrant Westside district. Perfect for first-time buyers or investors. Features include contemporary finishes, in-unit laundry, and a private balcony with city views.

Building amenities include a fitness center, rooftop deck, and secure parking. Walk to restaurants, cafes, and public transit.`,
    features: [
      'Contemporary finishes',
      'In-unit laundry',
      'Private balcony',
      'City views',
      'Fitness center',
      'Rooftop deck',
      'Secure parking',
      'Pet friendly',
    ],
    images: [],
    daysOnMarket: 21,
    createdAt: '2023-12-25T00:00:00Z',
    updatedAt: '2023-12-25T00:00:00Z',
  },
  {
    id: '4',
    price: '$575,000',
    priceNumeric: 575000,
    address: '321 Cedar Court',
    neighborhood: 'Northgate',
    city: 'Metro City',
    state: 'ST',
    zip: '12347',
    beds: 4,
    baths: 2.5,
    sqft: '2,100',
    sqftNumeric: 2100,
    yearBuilt: 2010,
    lotSize: '0.30 acres',
    status: 'Pending',
    type: 'Single Family',
    description: `Charming family home in the sought-after Northgate neighborhood. This 4-bedroom home offers the perfect combination of comfort and functionality with an updated kitchen, cozy family room with fireplace, and private backyard.

Excellent school district and close to parks, shopping, and major highways.`,
    features: [
      'Updated kitchen',
      'Family room with fireplace',
      'Private backyard',
      'Excellent schools',
      'Near parks',
      'Easy highway access',
      'Two-car garage',
      'New roof (2022)',
    ],
    images: [],
    daysOnMarket: 5,
    createdAt: '2024-01-10T00:00:00Z',
    updatedAt: '2024-01-12T00:00:00Z',
  },
  {
    id: '5',
    price: '$299,000',
    priceNumeric: 299000,
    address: '555 Birch Street',
    neighborhood: 'Midtown',
    city: 'Metro City',
    state: 'ST',
    zip: '12348',
    beds: 1,
    baths: 1,
    sqft: '850',
    sqftNumeric: 850,
    yearBuilt: 2019,
    lotSize: 'N/A',
    status: 'For Sale',
    type: 'Condo',
    description: `Stylish 1-bedroom condo in the heart of Midtown. Ideal for young professionals or investors. Features high-end finishes, floor-to-ceiling windows, and an open concept layout that maximizes the space.

Prime location with walkability to entertainment, dining, and public transit.`,
    features: [
      'High-end finishes',
      'Floor-to-ceiling windows',
      'Open concept',
      'Walk-in closet',
      'Modern bathroom',
      'Concierge service',
      'Package room',
      'Bike storage',
    ],
    images: [],
    daysOnMarket: 30,
    createdAt: '2023-12-15T00:00:00Z',
    updatedAt: '2023-12-15T00:00:00Z',
  },
  {
    id: '6',
    price: '$725,000',
    priceNumeric: 725000,
    address: '888 Willow Drive',
    neighborhood: 'Lakeside',
    city: 'Metro City',
    state: 'ST',
    zip: '12349',
    beds: 5,
    baths: 3,
    sqft: '3,200',
    sqftNumeric: 3200,
    yearBuilt: 2008,
    lotSize: '0.5 acres',
    status: 'For Sale',
    type: 'Single Family',
    description: `Stunning 5-bedroom executive home in prestigious Lakeside community. This spacious property features a grand foyer, gourmet kitchen, formal dining room, and expansive primary suite with spa-like bathroom.

The professionally landscaped backyard includes a covered pavilion, built-in grill, and access to community lake and trails.`,
    features: [
      'Grand foyer',
      'Gourmet kitchen',
      'Formal dining room',
      'Spa-like primary bath',
      'Home office',
      'Three-car garage',
      'Covered pavilion',
      'Built-in grill',
      'Lake access',
      'Community trails',
    ],
    images: [],
    daysOnMarket: 45,
    createdAt: '2023-11-30T00:00:00Z',
    updatedAt: '2023-12-10T00:00:00Z',
  },
]

/**
 * Get all listings with optional filters
 */
export async function getListings(filters?: ListingFilters): Promise<ListingSummary[]> {
  // In production, this would fetch from a CMS or database
  let filtered = [...mockListings]

  if (filters) {
    if (filters.minPrice) {
      filtered = filtered.filter((l) => l.priceNumeric >= filters.minPrice!)
    }
    if (filters.maxPrice) {
      filtered = filtered.filter((l) => l.priceNumeric <= filters.maxPrice!)
    }
    if (filters.minBeds) {
      filtered = filtered.filter((l) => l.beds >= filters.minBeds!)
    }
    if (filters.type) {
      filtered = filtered.filter((l) => l.type === filters.type)
    }
    if (filters.status) {
      filtered = filtered.filter((l) => l.status === filters.status)
    }
    if (filters.neighborhood) {
      filtered = filtered.filter((l) => l.neighborhood === filters.neighborhood)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(
        (l) =>
          l.address.toLowerCase().includes(search) ||
          l.neighborhood.toLowerCase().includes(search) ||
          l.description.toLowerCase().includes(search)
      )
    }
  }

  return filtered.map(toSummary)
}

/**
 * Get a single listing by ID
 */
export async function getListingById(id: string): Promise<Listing | null> {
  // In production, this would fetch from a CMS or database
  return mockListings.find((l) => l.id === id) || null
}

/**
 * Get featured listings for homepage
 */
export async function getFeaturedListings(limit = 3): Promise<ListingSummary[]> {
  // In production, this would have a "featured" flag in the CMS
  const forSale = mockListings
    .filter((l) => l.status === 'For Sale')
    .sort((a, b) => a.daysOnMarket - b.daysOnMarket)
    .slice(0, limit)

  return forSale.map(toSummary)
}

/**
 * Get related listings (same neighborhood or similar price)
 */
export async function getRelatedListings(
  listingId: string,
  limit = 3
): Promise<ListingSummary[]> {
  const current = mockListings.find((l) => l.id === listingId)
  if (!current) return []

  const related = mockListings
    .filter((l) => l.id !== listingId)
    .filter(
      (l) =>
        l.neighborhood === current.neighborhood ||
        Math.abs(l.priceNumeric - current.priceNumeric) < 100000
    )
    .slice(0, limit)

  return related.map(toSummary)
}

/**
 * Get all unique neighborhoods
 */
export async function getNeighborhoods(): Promise<string[]> {
  const neighborhoods = new Set(mockListings.map((l) => l.neighborhood))
  return Array.from(neighborhoods).sort()
}

/**
 * Convert full listing to summary
 */
function toSummary(listing: Listing): ListingSummary {
  return {
    id: listing.id,
    price: listing.price,
    address: listing.address,
    neighborhood: listing.neighborhood,
    beds: listing.beds,
    baths: listing.baths,
    sqft: listing.sqft,
    status: listing.status,
    type: listing.type,
    imageUrl: listing.images[0],
  }
}
