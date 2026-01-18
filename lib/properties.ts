// Database-driven property management
import { query, ensureInitialized } from './db'

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

// Database row to Property object
function rowToProperty(row: any): Property {
  return {
    id: row.id,
    slug: row.slug,
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    county: row.county,
    listPrice: row.list_price,
    originalPrice: row.original_price,
    closePrice: row.close_price,
    closeDate: row.close_date ? row.close_date.toISOString().split('T')[0] : null,
    beds: row.beds,
    baths: row.baths,
    halfBaths: row.half_baths || 0,
    sqft: row.sqft,
    lotSize: row.lot_size ? parseFloat(row.lot_size) : null,
    lotSizeUnit: row.lot_size_unit || 'acres',
    yearBuilt: row.year_built,
    stories: row.stories || 1,
    propertyType: row.property_type,
    propertyStyle: row.property_style,
    garageSpaces: row.garage_spaces || 0,
    garageType: row.garage_type,
    hoaFee: row.hoa_fee ? parseFloat(row.hoa_fee) : null,
    hoaFrequency: row.hoa_frequency || 'monthly',
    taxAmount: row.tax_amount ? parseFloat(row.tax_amount) : null,
    taxYear: row.tax_year,
    taxRate: row.tax_rate ? parseFloat(row.tax_rate) : null,
    status: row.status,
    imageUrl: row.image_url,
    images: row.images || [],
    virtualTourUrl: row.virtual_tour_url,
    headline: row.headline,
    description: row.description,
    features: row.features || [],
    latitude: row.latitude ? parseFloat(row.latitude) : null,
    longitude: row.longitude ? parseFloat(row.longitude) : null,
    neighborhood: row.neighborhood,
    subdivision: row.subdivision,
    schoolDistrict: row.school_district,
    schools: row.schools || {},
    mlsNumber: row.mls_number,
    mlsBoard: row.mls_board,
    daysOnMarket: row.days_on_market,
    listingAgent: row.listing_agent,
    listingAgentPhone: row.listing_agent_phone,
    listingOffice: row.listing_office,
    source: row.source,
    externalId: row.external_id,
    createdAt: row.created_at?.toISOString() || new Date().toISOString(),
    updatedAt: row.updated_at?.toISOString() || new Date().toISOString(),
  }
}

// Generate URL-friendly slug from address and city
export function generateSlug(address: string, city: string): string {
  const combined = `${address}-${city}`
  return combined
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100)
}

// Get all properties with optional filters
export async function getProperties(options: {
  status?: Property['status']
  city?: string
  limit?: number
  offset?: number
  orderBy?: 'close_date' | 'list_price' | 'close_price' | 'created_at'
  orderDir?: 'ASC' | 'DESC'
} = {}): Promise<Property[]> {
  await ensureInitialized()

  const {
    status,
    city,
    limit = 100,
    offset = 0,
    orderBy = 'close_date',
    orderDir = 'DESC'
  } = options

  let sql = 'SELECT * FROM properties WHERE 1=1'
  const params: any[] = []
  let paramIndex = 1

  if (status) {
    sql += ` AND status = $${paramIndex++}`
    params.push(status)
  }

  if (city) {
    sql += ` AND city = $${paramIndex++}`
    params.push(city)
  }

  // Validate orderBy to prevent SQL injection
  const validOrderBy = ['close_date', 'list_price', 'close_price', 'created_at']
  const safeOrderBy = validOrderBy.includes(orderBy) ? orderBy : 'close_date'
  const safeOrderDir = orderDir === 'ASC' ? 'ASC' : 'DESC'

  sql += ` ORDER BY ${safeOrderBy} ${safeOrderDir} NULLS LAST`
  sql += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
  params.push(limit, offset)

  const result = await query(sql, params)
  return result.rows.map(rowToProperty)
}

// Get a single property by slug
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  await ensureInitialized()

  const result = await query(
    'SELECT * FROM properties WHERE slug = $1',
    [slug]
  )

  if (result.rows.length === 0) {
    return null
  }

  return rowToProperty(result.rows[0])
}

// Get a single property by ID
export async function getPropertyById(id: string): Promise<Property | null> {
  await ensureInitialized()

  const result = await query(
    'SELECT * FROM properties WHERE id = $1',
    [id]
  )

  if (result.rows.length === 0) {
    return null
  }

  return rowToProperty(result.rows[0])
}

// Get all unique cities
export async function getPropertyCities(): Promise<string[]> {
  await ensureInitialized()

  const result = await query(
    'SELECT DISTINCT city FROM properties ORDER BY city'
  )

  return result.rows.map(row => row.city)
}

// Get property stats
export async function getPropertyStats(): Promise<{
  totalSold: number
  totalVolume: number
  avgPrice: number
  cities: string[]
}> {
  await ensureInitialized()

  const statsResult = await query(`
    SELECT
      COUNT(*) as total,
      COALESCE(SUM(close_price), 0) as volume,
      COALESCE(AVG(close_price), 0) as avg_price
    FROM properties
    WHERE status = 'sold' AND close_price IS NOT NULL
  `)

  const citiesResult = await query(
    'SELECT DISTINCT city FROM properties WHERE status = $1 ORDER BY city',
    ['sold']
  )

  const stats = statsResult.rows[0]
  return {
    totalSold: parseInt(stats.total) || 0,
    totalVolume: parseInt(stats.volume) || 0,
    avgPrice: Math.round(parseFloat(stats.avg_price)) || 0,
    cities: citiesResult.rows.map(row => row.city),
  }
}

// Get featured properties (highest price)
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT * FROM properties
     WHERE status = 'sold' AND close_price IS NOT NULL
     ORDER BY close_price DESC
     LIMIT $1`,
    [limit]
  )

  return result.rows.map(rowToProperty)
}

// Get recent properties
export async function getRecentProperties(limit = 6): Promise<Property[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT * FROM properties
     WHERE status = 'sold' AND close_date IS NOT NULL
     ORDER BY close_date DESC
     LIMIT $1`,
    [limit]
  )

  return result.rows.map(rowToProperty)
}

// Get all property slugs (for static generation)
export async function getAllPropertySlugs(): Promise<string[]> {
  await ensureInitialized()

  const result = await query('SELECT slug FROM properties')
  return result.rows.map(row => row.slug)
}

// Create a new property
export async function createProperty(data: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> {
  await ensureInitialized()

  const result = await query(
    `INSERT INTO properties (
      slug, address, city, state, zip,
      list_price, close_price, close_date,
      beds, baths, half_baths, sqft, lot_size, year_built, property_type,
      status, image_url, images, virtual_tour_url,
      headline, description, features,
      latitude, longitude, neighborhood, school_district,
      mls_number, days_on_market, source, external_id
    ) VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19,
      $20, $21, $22,
      $23, $24, $25, $26,
      $27, $28, $29, $30
    ) RETURNING *`,
    [
      data.slug, data.address, data.city, data.state, data.zip,
      data.listPrice, data.closePrice, data.closeDate,
      data.beds, data.baths, data.halfBaths, data.sqft, data.lotSize, data.yearBuilt, data.propertyType,
      data.status, data.imageUrl, JSON.stringify(data.images), data.virtualTourUrl,
      data.headline, data.description, JSON.stringify(data.features),
      data.latitude, data.longitude, data.neighborhood, data.schoolDistrict,
      data.mlsNumber, data.daysOnMarket, data.source, data.externalId
    ]
  )

  return rowToProperty(result.rows[0])
}

// Update a property
export async function updateProperty(id: string, data: Partial<Property>): Promise<Property | null> {
  await ensureInitialized()

  // Build dynamic UPDATE query
  const updates: string[] = []
  const params: any[] = []
  let paramIndex = 1

  const fieldMap: Record<string, string> = {
    slug: 'slug',
    address: 'address',
    city: 'city',
    state: 'state',
    zip: 'zip',
    listPrice: 'list_price',
    closePrice: 'close_price',
    closeDate: 'close_date',
    beds: 'beds',
    baths: 'baths',
    halfBaths: 'half_baths',
    sqft: 'sqft',
    lotSize: 'lot_size',
    yearBuilt: 'year_built',
    propertyType: 'property_type',
    status: 'status',
    imageUrl: 'image_url',
    images: 'images',
    virtualTourUrl: 'virtual_tour_url',
    headline: 'headline',
    description: 'description',
    features: 'features',
    latitude: 'latitude',
    longitude: 'longitude',
    neighborhood: 'neighborhood',
    schoolDistrict: 'school_district',
    mlsNumber: 'mls_number',
    daysOnMarket: 'days_on_market',
    source: 'source',
    externalId: 'external_id',
  }

  for (const [key, dbField] of Object.entries(fieldMap)) {
    if (key in data) {
      let value = (data as any)[key]
      if (key === 'images' || key === 'features') {
        value = JSON.stringify(value)
      }
      updates.push(`${dbField} = $${paramIndex++}`)
      params.push(value)
    }
  }

  if (updates.length === 0) {
    return getPropertyById(id)
  }

  updates.push(`updated_at = NOW()`)
  params.push(id)

  const result = await query(
    `UPDATE properties SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  )

  if (result.rows.length === 0) {
    return null
  }

  return rowToProperty(result.rows[0])
}

// Delete a property
export async function deleteProperty(id: string): Promise<boolean> {
  await ensureInitialized()

  const result = await query(
    'DELETE FROM properties WHERE id = $1',
    [id]
  )

  return (result.rowCount ?? 0) > 0
}

// Bulk insert properties (for seeding)
export async function bulkInsertProperties(properties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
  await ensureInitialized()

  let inserted = 0
  for (const prop of properties) {
    try {
      await createProperty(prop)
      inserted++
    } catch (error: any) {
      // Skip duplicates (slug conflict)
      if (error.code !== '23505') {
        console.error(`Failed to insert property ${prop.address}:`, error.message)
      }
    }
  }

  return inserted
}

// Check if database has properties
export async function hasProperties(): Promise<boolean> {
  await ensureInitialized()

  const result = await query('SELECT COUNT(*) as count FROM properties')
  return parseInt(result.rows[0].count) > 0
}

// Formatting helpers
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
