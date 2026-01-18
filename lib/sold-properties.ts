// Greg Knapp's Sold Properties - Transaction History
// Artistic Real Estate Group | gregsmybroker@gmail.com | 972-333-4466

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
  sqft: number | null
  lotSize: number | null
  imageUrl?: string
}

export const soldProperties: SoldProperty[] = [
  {
    id: 'sold-1',
    address: '13713 Cortes de Pallas',
    city: 'Little Elm',
    state: 'Texas',
    zip: '75068',
    closeDate: '2019-02-01',
    listPrice: 379000,
    closePrice: 350000,
    beds: 4,
    baths: 3,
    sqft: null,
    lotSize: null,
  },
  {
    id: 'sold-2',
    address: '4405 Enfield Drive',
    city: 'Garland',
    state: 'Texas',
    zip: '75043',
    closeDate: '2019-05-22',
    listPrice: 364900,
    closePrice: 356000,
    beds: 5,
    baths: 4,
    sqft: 9801,
    lotSize: null,
  },
  {
    id: 'sold-3',
    address: '2621 Pine Trail Drive',
    city: 'Little Elm',
    state: 'Texas',
    zip: '75068',
    closeDate: '2019-11-21',
    listPrice: 308500,
    closePrice: 314500,
    beds: 5,
    baths: 4,
    sqft: 7405,
    lotSize: null,
  },
  {
    id: 'sold-4',
    address: '2002 Merrimac Trail',
    city: 'Garland',
    state: 'Texas',
    zip: '75043',
    closeDate: '2019-11-22',
    listPrice: 299000,
    closePrice: 295000,
    beds: 4,
    baths: 3,
    sqft: 12197,
    lotSize: null,
  },
  {
    id: 'sold-5',
    address: '2116 Stein Way',
    city: 'Carrollton',
    state: 'Texas',
    zip: '75007',
    closeDate: '2019-12-05',
    listPrice: 289990,
    closePrice: 275000,
    beds: 3,
    baths: 3,
    sqft: 7318,
    lotSize: null,
  },
  {
    id: 'sold-6',
    address: '1037 Hidden Lake Drive',
    city: 'Burleson',
    state: 'Texas',
    zip: '76028',
    closeDate: '2019-08-16',
    listPrice: 287499,
    closePrice: 282499,
    beds: 4,
    baths: 3,
    sqft: 7187,
    lotSize: null,
  },
  {
    id: 'sold-7',
    address: '1817 Valencia Drive',
    city: 'Allen',
    state: 'Texas',
    zip: '75013',
    closeDate: '2019-03-29',
    listPrice: 273000,
    closePrice: 270000,
    beds: 3,
    baths: 3,
    sqft: 3920,
    lotSize: null,
  },
  {
    id: 'sold-8',
    address: '4005 Silktree Drive',
    city: 'Garland',
    state: 'Texas',
    zip: '75043',
    closeDate: '2019-03-21',
    listPrice: 245000,
    closePrice: 250000,
    beds: 4,
    baths: 3,
    sqft: 7231,
    lotSize: null,
  },
  {
    id: 'sold-9',
    address: '7920 Iola Drive',
    city: 'Plano',
    state: 'Texas',
    zip: '75025',
    closeDate: '2019-02-22',
    listPrice: 245000,
    closePrice: 240000,
    beds: 3,
    baths: 2,
    sqft: 10019,
    lotSize: null,
  },
  {
    id: 'sold-10',
    address: '1248 Woodbine Cliff Drive',
    city: 'Fort Worth',
    state: 'Texas',
    zip: '76179',
    closeDate: '2019-11-08',
    listPrice: 235000,
    closePrice: 233500,
    beds: 4,
    baths: 2,
    sqft: 8276,
    lotSize: null,
  },
  {
    id: 'sold-11',
    address: '208 Chimney Rock Drive',
    city: 'Waxahachie',
    state: 'Texas',
    zip: '75167',
    closeDate: '2019-08-16',
    listPrice: 235000,
    closePrice: 232500,
    beds: 3,
    baths: 3,
    sqft: 5706,
    lotSize: null,
  },
  {
    id: 'sold-12',
    address: '4518 Jenkins Street',
    city: 'The Colony',
    state: 'Texas',
    zip: '75056',
    closeDate: '2019-11-20',
    listPrice: 205000,
    closePrice: 202000,
    beds: 3,
    baths: 2,
    sqft: 5619,
    lotSize: null,
  },
  {
    id: 'sold-13',
    address: '6811 Topaz Drive',
    city: 'Greenville',
    state: 'Texas',
    zip: '75401',
    closeDate: '2020-03-20',
    listPrice: 197075,
    closePrice: 197075,
    beds: 3,
    baths: 3,
    sqft: null,
    lotSize: null,
  },
  {
    id: 'sold-14',
    address: '1522 Limetree Lane',
    city: 'Duncanville',
    state: 'Texas',
    zip: '75137',
    closeDate: '2019-10-24',
    listPrice: 198000,
    closePrice: 197000,
    beds: 3,
    baths: 2,
    sqft: 8712,
    lotSize: null,
  },
  {
    id: 'sold-15',
    address: '8305 Hanon Drive',
    city: 'White Settlement',
    state: 'Texas',
    zip: '76108',
    closeDate: '2020-01-27',
    listPrice: 176500,
    closePrice: 176000,
    beds: 3,
    baths: 2,
    sqft: 11892,
    lotSize: null,
  },
  {
    id: 'sold-16',
    address: '13416 Shortleaf Drive',
    city: 'Dallas',
    state: 'Texas',
    zip: '75253',
    closeDate: '2019-03-01',
    listPrice: 174900,
    closePrice: 174900,
    beds: 3,
    baths: 2,
    sqft: 5750,
    lotSize: null,
  },
]

// Calculate stats
export function getSoldStats() {
  const totalSold = soldProperties.length
  const totalVolume = soldProperties.reduce((sum, p) => sum + p.closePrice, 0)
  const avgPrice = Math.round(totalVolume / totalSold)
  const cities = Array.from(new Set(soldProperties.map(p => p.city))).sort()

  return {
    totalSold,
    totalVolume,
    avgPrice,
    cities,
  }
}

// Get featured sold properties (highest value)
export function getFeaturedSold(limit = 6): SoldProperty[] {
  return [...soldProperties]
    .sort((a, b) => b.closePrice - a.closePrice)
    .slice(0, limit)
}

// Format price for display
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}
