import Link from 'next/link'
import { getFeaturedSold, getSoldStats, formatPrice } from '@/lib/sold-properties'

export default function HomePage() {
  const stats = getSoldStats()
  const featuredSold = getFeaturedSold(6)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative">
          <div className="max-w-3xl">
            <p className="text-primary-200 font-medium mb-4 tracking-wide uppercase text-sm">
              Artistic Real Estate Group
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Your Trusted DFW Real Estate Expert
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed">
              Helping buyers find their dream homes across the Dallas-Fort Worth metroplex.
              {stats.totalSold}+ successful transactions and counting.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/listings"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                View Sold Properties
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/80 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Contact Greg
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">{stats.totalSold}+</p>
              <p className="text-gray-600 mt-1">Homes Sold</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">{formatPrice(stats.totalVolume)}</p>
              <p className="text-gray-600 mt-1">Total Volume</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">{stats.cities.length}</p>
              <p className="text-gray-600 mt-1">DFW Cities Served</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary-600">100%</p>
              <p className="text-gray-600 mt-1">Client Focused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Sales */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Recent Sales</h2>
              <p className="text-gray-600 mt-2">Successful transactions across the DFW metroplex</p>
            </div>
            <Link
              href="/listings"
              className="hidden md:inline-flex text-primary-600 font-semibold hover:text-primary-700 items-center gap-2"
            >
              View All
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSold.map((property) => (
              <div
                key={property.id}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:-translate-y-1 group"
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
                  <div className="absolute top-3 left-3 bg-green-600 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                    SOLD
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    {new Date(property.closeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(property.closePrice)}</p>
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
          <div className="text-center mt-10 md:hidden">
            <Link
              href="/listings"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              View All Sales →
            </Link>
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
            Serving the DFW Metroplex
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            From Plano to Fort Worth, Little Elm to Waxahachie — helping families find their perfect home across North Texas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {stats.cities.map((city) => (
              <span
                key={city}
                className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-100 transition-colors cursor-default"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Greg */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            Why Work With Greg?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-5">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
            Whether you're buying your first home or looking for your next investment property,
            I'm here to guide you through every step.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-all shadow-lg inline-block"
            >
              Schedule a Consultation
            </Link>
            <a
              href="tel:469-485-7313"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-all inline-block"
            >
              Call (469) 485-7313
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🏆',
    title: 'Proven Track Record',
    description: 'Consistent results with successful closings across the DFW metroplex. Your goals become my priority.',
  },
  {
    icon: '🎯',
    title: 'Buyer Specialist',
    description: 'Expert guidance through the home buying process, from search to closing. Making your dream home a reality.',
  },
  {
    icon: '🤝',
    title: 'Personal Attention',
    description: 'Direct access to your agent, not a team. You deserve personalized service for one of life\'s biggest decisions.',
  },
]
