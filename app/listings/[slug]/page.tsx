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
    schoolDistrict: null,
    mlsNumber: null,
    daysOnMarket: null,
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

// SVG Icons
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  )
}

function BedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function BathIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 10H7V7a2 2 0 012-2h.5a.5.5 0 01.5.5v.5a1 1 0 001 1h2a1 1 0 001-1V5a2 2 0 00-2-2H9a4 4 0 00-4 4v3H3a1 1 0 00-1 1v5a4 4 0 004 4h12a4 4 0 004-4v-5a1 1 0 00-1-1z" />
    </svg>
  )
}

function SquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  )
}

// House illustration placeholder
function PropertyPlaceholder({ beds, className }: { beds: number; className?: string }) {
  const baseClass = className || "w-full h-full"

  if (beds >= 5) {
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="50" y="120" width="300" height="150" className="fill-primary-200" rx="4" />
        <path d="M30 140 L200 40 L370 140" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="160" y="170" width="80" height="100" className="fill-primary-300" rx="2" />
        <rect x="70" y="160" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="270" y="160" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="70" y="220" width="60" height="50" className="fill-primary-300" rx="2" />
        <rect x="270" y="220" width="60" height="50" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Large Estate</text>
      </svg>
    )
  } else if (beds >= 4) {
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="80" y="100" width="240" height="170" className="fill-primary-200" rx="4" />
        <path d="M60 120 L200 30 L340 120" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="160" y="180" width="80" height="90" className="fill-primary-300" rx="2" />
        <rect x="100" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="250" y="130" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="100" y="200" width="50" height="40" className="fill-primary-300" rx="2" />
        <rect x="250" y="200" width="50" height="40" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Family Home</text>
      </svg>
    )
  } else {
    return (
      <svg className={baseClass} viewBox="0 0 400 300" fill="none">
        <rect width="400" height="300" className="fill-primary-50" />
        <rect x="100" y="130" width="200" height="140" className="fill-primary-200" rx="4" />
        <path d="M80 150 L200 60 L320 150" className="stroke-primary-400" strokeWidth="8" strokeLinecap="round" fill="none" />
        <rect x="165" y="190" width="70" height="80" className="fill-primary-300" rx="2" />
        <rect x="120" y="160" width="40" height="35" className="fill-primary-300" rx="2" />
        <rect x="240" y="160" width="40" height="35" className="fill-primary-300" rx="2" />
        <text x="200" y="290" textAnchor="middle" className="fill-primary-500 text-sm font-medium">Cozy Home</text>
      </svg>
    )
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const property = await getProperty(slug)

  if (!property) {
    notFound()
  }

  const overAsking = dbIsSoldOverAsking(property)
  const priceDiff = dbGetPriceDifference(property)
  const isSold = property.status === 'sold'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/listings"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors group"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to All Properties
          </Link>
        </div>
      </div>

      {/* Hero Image Section */}
      <div className="relative bg-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="aspect-[16/9] md:aspect-[21/9] relative overflow-hidden">
            {property.imageUrl ? (
              <img
                src={property.imageUrl}
                alt={getFullAddress(property)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <PropertyPlaceholder beds={property.beds} className="w-full h-full" />
            )}

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {isSold ? (
                <span className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  <CheckIcon className="w-4 h-4" />
                  SOLD
                </span>
              ) : property.status === 'pending' ? (
                <span className="bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  PENDING
                </span>
              ) : (
                <span className="bg-primary-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
                  FOR SALE
                </span>
              )}
            </div>

            {/* Over Asking Badge */}
            {isSold && overAsking && (
              <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                </svg>
                Sold Over Asking!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Property Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address & Price */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {property.address}
                  </h1>
                  <p className="text-lg text-gray-600 flex items-center gap-2">
                    <MapPinIcon className="w-5 h-5 text-primary-600" />
                    {property.city}, {property.state} {property.zip}
                  </p>
                </div>
                <div className="text-right">
                  {isSold ? (
                    <>
                      <p className="text-3xl md:text-4xl font-bold text-green-600">
                        {formatPrice(property.closePrice!)}
                      </p>
                      <p className="text-sm text-gray-500">
                        List: {formatPrice(property.listPrice)}
                        {priceDiff !== 0 && (
                          <span className={priceDiff > 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                            ({priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)})
                          </span>
                        )}
                      </p>
                    </>
                  ) : (
                    <p className="text-3xl md:text-4xl font-bold text-primary-600">
                      {formatPrice(property.listPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Key Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
                    <BedIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{property.beds}</p>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
                    <BathIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{dbGetTotalBaths(property)}</p>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
                    <SquareIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {property.sqft ? property.sqft.toLocaleString() : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">Sq. Ft.</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {property.closeDate ? formatFullDate(property.closeDate).split(',')[0] : 'N/A'}
                  </p>
                  <p className="text-sm text-gray-500">{isSold ? 'Sold Date' : 'Listed'}</p>
                </div>
              </div>

              {/* Property Type & Additional Info */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Property Type</p>
                  <p className="font-semibold text-gray-900">{property.propertyType}</p>
                </div>
                {property.yearBuilt && (
                  <div>
                    <p className="text-sm text-gray-500">Year Built</p>
                    <p className="font-semibold text-gray-900">{property.yearBuilt}</p>
                  </div>
                )}
                {property.lotSize && (
                  <div>
                    <p className="text-sm text-gray-500">Lot Size</p>
                    <p className="font-semibold text-gray-900">{property.lotSize.toLocaleString()} sq. ft.</p>
                  </div>
                )}
                {property.neighborhood && (
                  <div>
                    <p className="text-sm text-gray-500">Neighborhood</p>
                    <p className="font-semibold text-gray-900">{property.neighborhood}</p>
                  </div>
                )}
                {property.schoolDistrict && (
                  <div>
                    <p className="text-sm text-gray-500">School District</p>
                    <p className="font-semibold text-gray-900">{property.schoolDistrict}</p>
                  </div>
                )}
                {property.mlsNumber && (
                  <div>
                    <p className="text-sm text-gray-500">MLS #</p>
                    <p className="font-semibold text-gray-900">{property.mlsNumber}</p>
                  </div>
                )}
              </div>
            </div>

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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {isSold ? 'Interested in Similar Properties?' : 'Schedule a Showing'}
              </h3>
              <p className="text-gray-600 mb-6">
                {isSold
                  ? "This property has sold, but I can help you find similar homes in the area."
                  : "Contact me to schedule a private showing of this property."}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    GK
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Greg Knapp</p>
                    <p className="text-sm text-gray-500">Broker & Owner</p>
                  </div>
                </div>

                <a
                  href="tel:+14694857313"
                  className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
                >
                  <PhoneIcon className="w-5 h-5" />
                  (469) 485-7313
                </a>

                <a
                  href="mailto:angela@artisticrealestate.com"
                  className="flex items-center justify-center gap-2 w-full border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
                >
                  <EnvelopeIcon className="w-5 h-5" />
                  Send Email
                </a>

                <Link
                  href="/contact"
                  className="block text-center w-full text-primary-600 py-2 font-medium hover:underline"
                >
                  Send a Message
                </Link>
              </div>
            </div>

            {/* Share Card */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Share This Property</h3>
              <div className="flex gap-3">
                <button className="flex-1 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button className="flex-1 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                <button className="flex-1 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                </button>
                <button className="flex-1 p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                  <svg className="w-5 h-5 mx-auto text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
