import Link from 'next/link'
import { soldProperties, getSoldStats, formatPrice, formatDate, isSoldOverAsking, generateSlug } from '@/lib/sold-properties'

// SVG Icon Components
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function TrendingUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  )
}

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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

// House illustration for property cards - varies by bedroom count
function PropertyHouseIcon({ beds, className }: { beds: number; className?: string }) {
  const baseClass = className || "w-16 h-16"

  if (beds >= 5) {
    // Large estate
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="8" y="28" width="48" height="28" className="fill-primary-600/20" rx="2" />
        <path d="M4 32 L32 12 L60 32" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="38" width="12" height="18" className="fill-primary-600/30" rx="1" />
        <rect x="12" y="36" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="42" y="36" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="12" y="48" width="10" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="42" y="48" width="10" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  } else if (beds >= 4) {
    // Two-story family home
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="12" y="24" width="40" height="32" className="fill-primary-600/20" rx="2" />
        <path d="M8 28 L32 10 L56 28" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="40" width="12" height="16" className="fill-primary-600/30" rx="1" />
        <rect x="16" y="30" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="40" y="30" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="16" y="44" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="40" y="44" width="8" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  } else {
    // Cozy cottage
    return (
      <svg className={baseClass} viewBox="0 0 64 64" fill="none">
        <rect x="14" y="30" width="36" height="26" className="fill-primary-600/20" rx="2" />
        <path d="M10 34 L32 14 L54 34" className="stroke-primary-600" strokeWidth="3" strokeLinecap="round" fill="none" />
        <rect x="26" y="40" width="12" height="16" className="fill-primary-600/30" rx="1" />
        <rect x="18" y="36" width="8" height="8" className="fill-primary-600/40" rx="1" />
        <rect x="38" y="36" width="8" height="8" className="fill-primary-600/40" rx="1" />
      </svg>
    )
  }
}

export default function ListingsPage() {
  const stats = getSoldStats()

  // Sort by close date (newest first)
  const sortedProperties = [...soldProperties].sort(
    (a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/30 to-transparent"></div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 relative">
          <div className="max-w-3xl">
            <p className="text-primary-200 font-semibold mb-4 tracking-wide uppercase text-sm inline-flex items-center gap-2">
              <span className="w-8 h-px bg-primary-300"></span>
              Artistic Real Estate Group
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sold Properties</h1>
            <p className="text-xl text-primary-100 leading-relaxed max-w-2xl">
              A track record of successful transactions across the DFW metroplex.
              See how Greg has helped buyers find their perfect homes.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <HomeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">{stats.totalSold}</p>
              <p className="text-gray-600 text-sm font-medium">Properties Sold</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ChartIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.totalVolume)}</p>
              <p className="text-gray-600 text-sm font-medium">Total Volume</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <TrendingUpIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.avgPrice)}</p>
              <p className="text-gray-600 text-sm font-medium">Average Sale</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <MapIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-primary-600">{stats.cities.length}</p>
              <p className="text-gray-600 text-sm font-medium">Cities Served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter by City */}
      <div className="bg-white border-b sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-500 font-medium py-2 mr-2">Filter by city:</span>
            <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-full font-medium shadow-sm hover:bg-primary-700 transition-colors">
              All Cities
            </button>
            {stats.cities.map((city) => (
              <button
                key={city}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-full font-medium hover:bg-primary-50 hover:text-primary-700 transition-colors border border-transparent hover:border-primary-200"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sold Properties Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{sortedProperties.length}</span> sold properties
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProperties.map((property) => {
              const overAsking = isSoldOverAsking(property)
              const slug = generateSlug(property.address, property.city)
              return (
                <Link
                  href={`/listings/${slug}`}
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group card-glow block"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 relative overflow-hidden">
                    {property.imageUrl ? (
                      <img
                        src={property.imageUrl}
                        alt={`${property.address}, ${property.city}`}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                          <PropertyHouseIcon beds={property.beds} className="w-20 h-20 mx-auto mb-2" />
                          <span className="text-primary-600/70 text-sm font-medium">{property.city}, TX</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      SOLD
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow">
                      {formatDate(property.closeDate)}
                    </div>
                    {overAsking && (
                      <div className="absolute bottom-3 left-3 bg-amber-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        Over Asking!
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{formatPrice(property.closePrice)}</p>
                        {property.closePrice !== property.listPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            List: {formatPrice(property.listPrice)}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 font-medium text-lg">{property.address}</p>
                    <p className="text-gray-500">{property.city}, {property.state} {property.zip}</p>
                    <div className="flex gap-6 mt-5 pt-5 border-t border-gray-100 text-sm text-gray-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                        <span className="font-medium">{property.beds} beds</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                        </svg>
                        <span className="font-medium">{property.baths} baths</span>
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto text-lg leading-relaxed">
            As the Original Buyer Broker in Texas, Greg specializes in helping buyers
            save time, effort, and money. Let's find your perfect home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary-600 px-10 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              Contact Greg
            </Link>
            <a
              href="tel:469-485-7313"
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
            >
              <PhoneIcon className="w-5 h-5" />
              (469) 485-7313
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
