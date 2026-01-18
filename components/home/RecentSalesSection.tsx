import Link from 'next/link'
import { SoldProperty, formatPrice, isSoldOverAsking } from '@/lib/sold-properties'
import { PropertyHouseIcon } from '@/components/illustrations'

interface RecentSalesSectionProps {
  properties: SoldProperty[]
}

export function RecentSalesSection({ properties }: RecentSalesSectionProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Proven Results</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Recent Sales</h2>
            <p className="text-gray-600 mt-2 max-w-xl">Successful transactions across the Dallas-Fort Worth metroplex</p>
          </div>
          <Link
            href="/listings"
            className="hidden md:inline-flex text-primary-600 font-semibold hover:text-primary-700 items-center gap-2 group"
          >
            View All
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => {
            const overAsking = isSoldOverAsking(property)
            return (
              <div
                key={property.id}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group card-glow"
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
                  <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg">
                    SOLD
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium shadow">
                    {new Date(property.closeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(property.closePrice)}</p>
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
              </div>
            )
          })}
        </div>
        <div className="text-center mt-12 md:hidden">
          <Link
            href="/listings"
            className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2"
          >
            View All Sales
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
