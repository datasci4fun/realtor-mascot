import Link from 'next/link'
import { soldProperties, getSoldStats, formatPrice, formatDate } from '@/lib/sold-properties'

export default function ListingsPage() {
  const stats = getSoldStats()

  // Sort by close date (newest first)
  const sortedProperties = [...soldProperties].sort(
    (a, b) => new Date(b.closeDate).getTime() - new Date(a.closeDate).getTime()
  )

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-primary-200 font-medium mb-2 tracking-wide uppercase text-sm">
            Artistic Real Estate Group
          </p>
          <h1 className="text-3xl md:text-4xl font-bold">Sold Properties</h1>
          <p className="text-primary-100 mt-2 max-w-2xl">
            A track record of successful transactions across the DFW metroplex.
            See how Greg has helped buyers find their perfect homes.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stats.totalSold}</p>
              <p className="text-gray-600 text-sm">Properties Sold</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.totalVolume)}</p>
              <p className="text-gray-600 text-sm">Total Volume</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{formatPrice(stats.avgPrice)}</p>
              <p className="text-gray-600 text-sm">Average Sale</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary-600">{stats.cities.length}</p>
              <p className="text-gray-600 text-sm">Cities Served</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by City */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 py-2 mr-2">Filter by city:</span>
            <button className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-full">
              All Cities
            </button>
            {stats.cities.map((city) => (
              <button
                key={city}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sold Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
            <div
              key={property.id}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-primary-600/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="text-primary-600/60 text-sm font-medium">{property.city}, TX</span>
                  </div>
                </div>
                <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  SOLD
                </div>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">
                  {formatDate(property.closeDate)}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(property.closePrice)}</p>
                    {property.closePrice !== property.listPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        List: {formatPrice(property.listPrice)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-gray-800 font-medium">{property.address}</p>
                <p className="text-gray-500 text-sm">{property.city}, {property.state} {property.zip}</p>
                <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    {property.beds} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                    </svg>
                    {property.baths} baths
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Be Our Next Success Story?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            As the Original Buyer Broker in Texas, Greg specializes in helping buyers
            save time, effort, and money. Let's find your perfect home.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Contact Greg
            </Link>
            <a
              href="tel:469-485-7313"
              className="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Call (469) 485-7313
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
