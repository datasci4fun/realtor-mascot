import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getPropertyBySlug,
  getAllPropertySlugs,
  formatPrice,
  formatFullDate,
  isSoldOverAsking as dbIsSoldOverAsking,
  getPriceDifference as dbGetPriceDifference,
  getTotalBaths as dbGetTotalBaths,
  getFullAddress,
  hasProperties,
  Property,
} from '@/lib/properties'
import { fillMockData, PlaceholderImageStyle, LayoutStyle } from '@/lib/mock-property'
import { PropertyDebugOverlay } from '@/components/debug/PropertyDebugOverlay'
import {
  FullWidthLayout,
  GalleryLayout,
  CompactLayout,
  MagazineLayout,
  DefaultLayout,
  getLayoutComponent,
} from '@/components/listings'
import { CheckIcon } from '@/components/icons'
import {
  findPropertyBySlug as findStaticProperty,
  getAllSlugs as getStaticSlugs,
  formatPrice as staticFormatPrice,
  isSoldOverAsking as staticIsSoldOverAsking,
  getPriceDifference as staticGetPriceDifference,
  getTotalBaths as staticGetTotalBaths,
  SoldProperty,
} from '@/lib/sold-properties'

// Convert static property to database format for unified rendering
function staticToDbFormat(prop: SoldProperty): Property {
  return {
    id: prop.id,
    slug: '',
    address: prop.address,
    city: prop.city,
    state: prop.state,
    zip: prop.zip,
    county: null,
    listPrice: prop.listPrice,
    originalPrice: null,
    closePrice: prop.closePrice,
    closeDate: prop.closeDate,
    beds: prop.beds,
    baths: prop.baths,
    halfBaths: prop.halfBaths || 0,
    sqft: prop.sqft,
    lotSize: prop.lotSize || null,
    lotSizeUnit: 'sqft',
    yearBuilt: null,
    stories: 1,
    propertyType: prop.propertyType || 'Single-Family',
    propertyStyle: null,
    garageSpaces: 0,
    garageType: null,
    hoaFee: null,
    hoaFrequency: 'monthly',
    taxAmount: null,
    taxYear: null,
    taxRate: null,
    status: 'sold',
    imageUrl: prop.imageUrl || null,
    images: prop.imageUrl ? [prop.imageUrl] : [],
    virtualTourUrl: null,
    headline: null,
    description: null,
    features: [],
    latitude: null,
    longitude: null,
    neighborhood: null,
    subdivision: null,
    schoolDistrict: null,
    schools: {},
    mlsNumber: null,
    mlsBoard: prop.id.startsWith('har-') ? 'HAR' : 'NTREIS',
    daysOnMarket: null,
    listingAgent: null,
    listingAgentPhone: null,
    listingOffice: null,
    source: prop.id.startsWith('har-') ? 'har.com' : 'manual',
    externalId: prop.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Helper to get property from DB or static fallback
async function getProperty(slug: string): Promise<Property | null> {
  // Try database first
  try {
    const dbHasData = await hasProperties()
    if (dbHasData) {
      const dbProperty = await getPropertyBySlug(slug)
      if (dbProperty) return dbProperty
    }
  } catch (e) {
    // Database not available, use static fallback
  }

  // Fallback to static data
  const staticProp = findStaticProperty(slug)
  if (staticProp) {
    return staticToDbFormat(staticProp)
  }

  return null
}

// Generate static params for all properties
export async function generateStaticParams() {
  // Try database first
  try {
    const dbHasData = await hasProperties()
    if (dbHasData) {
      const slugs = await getAllPropertySlugs()
      return slugs.map((slug) => ({ slug }))
    }
  } catch (e) {
    // Database not available
  }

  // Fallback to static data
  const slugs = getStaticSlugs()
  return slugs.map((slug) => ({ slug }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    return {
      title: 'Property Not Found | Greg Knapp Real Estate',
    }
  }

  const title = `${property.address}, ${property.city} | Greg Knapp Real Estate`
  const description = property.status === 'sold'
    ? `Sold for ${formatPrice(property.closePrice!)} - ${property.beds} bed, ${dbGetTotalBaths(property)} bath ${property.propertyType} in ${property.city}, TX`
    : `${formatPrice(property.listPrice)} - ${property.beds} bed, ${dbGetTotalBaths(property)} bath ${property.propertyType} in ${property.city}, TX`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.imageUrl ? [property.imageUrl] : [],
    },
  }
}

export default async function PropertyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; images?: string; layout?: string }>
}) {
  const { slug } = await params
  const { preview, images, layout } = await searchParams
  const isPreviewMode = preview === 'full'

  // Parse image style (default to 'modern' if in preview mode)
  const validImageStyles: PlaceholderImageStyle[] = ['modern', 'traditional', 'luxury', 'cottage', 'ranch', 'none']
  const imageStyle: PlaceholderImageStyle = validImageStyles.includes(images as PlaceholderImageStyle)
    ? (images as PlaceholderImageStyle)
    : 'modern'

  // Parse layout style (default to 'default')
  const validLayoutStyles: LayoutStyle[] = ['default', 'fullwidth', 'gallery', 'compact', 'magazine']
  const layoutStyle: LayoutStyle = validLayoutStyles.includes(layout as LayoutStyle)
    ? (layout as LayoutStyle)
    : 'default'

  let property = await getProperty(slug)

  if (!property) {
    notFound()
  }

  // Apply mock data for missing fields if in preview mode
  if (isPreviewMode) {
    property = fillMockData(property, imageStyle)
  }

  const overAsking = dbIsSoldOverAsking(property)
  const priceDiff = dbGetPriceDifference(property)
  const isSold = property.status === 'sold'

  // Shared content sections for all layouts
  const ContentSections = (
    <>
      {/* Property Details */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Property Type</span>
            <span className="font-medium text-gray-900">{property.propertyType}</span>
          </div>
          {property.propertyStyle && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Style</span>
              <span className="font-medium text-gray-900">{property.propertyStyle}</span>
            </div>
          )}
          {property.yearBuilt && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Year Built</span>
              <span className="font-medium text-gray-900">{property.yearBuilt}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-500">Stories</span>
            <span className="font-medium text-gray-900">{property.stories}</span>
          </div>
          {property.sqft && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Living Area</span>
              <span className="font-medium text-gray-900">{property.sqft.toLocaleString()} sq ft</span>
            </div>
          )}
          {property.lotSize && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Lot Size</span>
              <span className="font-medium text-gray-900">
                {property.lotSizeUnit === 'acres'
                  ? `${property.lotSize} acres`
                  : `${property.lotSize.toLocaleString()} sq ft`}
              </span>
            </div>
          )}
          {(property.garageSpaces > 0 || property.garageType) && (
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Garage</span>
              <span className="font-medium text-gray-900">
                {property.garageType ? `${property.garageType}, ` : ''}
                {property.garageSpaces}-car
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Financial Details */}
      {(property.hoaFee || property.taxAmount) && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {property.hoaFee && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">HOA Fee</span>
                <span className="font-medium text-gray-900">
                  ${property.hoaFee.toLocaleString()}/{property.hoaFrequency}
                </span>
              </div>
            )}
            {property.taxAmount && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Annual Taxes{property.taxYear ? ` (${property.taxYear})` : ''}</span>
                <span className="font-medium text-gray-900">${property.taxAmount.toLocaleString()}</span>
              </div>
            )}
            {property.taxRate && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Tax Rate</span>
                <span className="font-medium text-gray-900">{(property.taxRate * 100).toFixed(4)}%</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location & Schools */}
      {(property.county || property.neighborhood || property.subdivision || property.schoolDistrict || Object.keys(property.schools).length > 0) && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Location & Schools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {property.county && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">County</span>
                <span className="font-medium text-gray-900">{property.county}</span>
              </div>
            )}
            {property.neighborhood && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Neighborhood</span>
                <span className="font-medium text-gray-900">{property.neighborhood}</span>
              </div>
            )}
            {property.subdivision && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Subdivision</span>
                <span className="font-medium text-gray-900">{property.subdivision}</span>
              </div>
            )}
            {property.schoolDistrict && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">School District</span>
                <span className="font-medium text-gray-900">{property.schoolDistrict}</span>
              </div>
            )}
            {property.schools.elementary && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Elementary</span>
                <span className="font-medium text-gray-900">{property.schools.elementary}</span>
              </div>
            )}
            {property.schools.middle && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Middle School</span>
                <span className="font-medium text-gray-900">{property.schools.middle}</span>
              </div>
            )}
            {property.schools.high && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">High School</span>
                <span className="font-medium text-gray-900">{property.schools.high}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {property.description && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About This Property</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>
        </div>
      )}

      {/* Features */}
      {property.features && property.features.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {property.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-gray-700">
                <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MLS Information */}
      {(property.mlsNumber || property.listingAgent || property.daysOnMarket) && (
        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Listing Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
            {property.mlsNumber && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">MLS #</span>
                <span className="font-medium text-gray-900">{property.mlsNumber}</span>
              </div>
            )}
            {property.mlsBoard && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">MLS Board</span>
                <span className="font-medium text-gray-900">{property.mlsBoard}</span>
              </div>
            )}
            {property.daysOnMarket && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Days on Market</span>
                <span className="font-medium text-gray-900">{property.daysOnMarket}</span>
              </div>
            )}
            {property.listingAgent && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Listing Agent</span>
                <span className="font-medium text-gray-900">{property.listingAgent}</span>
              </div>
            )}
            {property.listingOffice && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500">Listing Office</span>
                <span className="font-medium text-gray-900">{property.listingOffice}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )

  // Render alternate layouts
  if (layoutStyle === 'fullwidth') {
    return (
      <>
        <FullWidthLayout property={property}>
          {ContentSections}
        </FullWidthLayout>
        <PropertyDebugOverlay
          property={property}
          isPreviewMode={isPreviewMode}
          imageStyle={imageStyle}
          layoutStyle={layoutStyle}
        />
      </>
    )
  }

  if (layoutStyle === 'gallery') {
    return (
      <>
        <GalleryLayout property={property}>
          {ContentSections}
        </GalleryLayout>
        <PropertyDebugOverlay
          property={property}
          isPreviewMode={isPreviewMode}
          imageStyle={imageStyle}
          layoutStyle={layoutStyle}
        />
      </>
    )
  }

  if (layoutStyle === 'compact') {
    return (
      <>
        <CompactLayout property={property}>
          {ContentSections}
        </CompactLayout>
        <PropertyDebugOverlay
          property={property}
          isPreviewMode={isPreviewMode}
          imageStyle={imageStyle}
          layoutStyle={layoutStyle}
        />
      </>
    )
  }

  if (layoutStyle === 'magazine') {
    return (
      <>
        <MagazineLayout property={property}>
          {ContentSections}
        </MagazineLayout>
        <PropertyDebugOverlay
          property={property}
          isPreviewMode={isPreviewMode}
          imageStyle={imageStyle}
          layoutStyle={layoutStyle}
        />
      </>
    )
  }

  // Default layout
  return (
    <>
      <DefaultLayout property={property}>
        {ContentSections}
      </DefaultLayout>
      <PropertyDebugOverlay
        property={property}
        isPreviewMode={isPreviewMode}
        imageStyle={imageStyle}
        layoutStyle={layoutStyle}
      />
    </>
  )
}
