// Seed script to migrate sold properties from static file to database
// Run with: npx tsx scripts/seed-properties.ts

import { soldProperties } from '../lib/sold-properties'
import { generateSlug, bulkInsertProperties, hasProperties, Property } from '../lib/properties'

async function seedProperties() {
  console.log('Checking if database already has properties...')

  const alreadyHasData = await hasProperties()
  if (alreadyHasData) {
    console.log('Database already contains properties. Skipping seed.')
    console.log('To re-seed, first clear the properties table manually.')
    process.exit(0)
  }

  console.log(`Seeding ${soldProperties.length} properties to database...`)

  // Convert static data to database format
  const properties: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>[] = soldProperties.map((prop) => ({
    slug: generateSlug(prop.address, prop.city),
    address: prop.address,
    city: prop.city,
    state: prop.state,
    zip: prop.zip,
    listPrice: prop.listPrice,
    closePrice: prop.closePrice,
    closeDate: prop.closeDate,
    beds: prop.beds,
    baths: prop.baths,
    halfBaths: prop.halfBaths || 0,
    sqft: prop.sqft,
    lotSize: prop.lotSize || null,
    yearBuilt: null,
    propertyType: prop.propertyType || 'Single-Family',
    status: 'sold' as const,
    imageUrl: prop.imageUrl || null,
    images: prop.imageUrl ? [prop.imageUrl] : [],
    virtualTourUrl: null,
    headline: null,
    description: null,
    features: [],
    latitude: null,
    longitude: null,
    neighborhood: null,
    schoolDistrict: null,
    mlsNumber: null,
    daysOnMarket: null,
    source: prop.id.startsWith('har-') ? 'har.com' : 'manual',
    externalId: prop.id,
  }))

  const inserted = await bulkInsertProperties(properties)
  console.log(`Successfully inserted ${inserted} properties.`)

  if (inserted < properties.length) {
    console.log(`Note: ${properties.length - inserted} properties were skipped (likely duplicates).`)
  }

  console.log('Seed complete!')
  process.exit(0)
}

seedProperties().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
