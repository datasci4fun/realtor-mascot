import Link from 'next/link'
import { getFeaturedSold, getSoldStats, formatPrice, isSoldOverAsking } from '@/lib/sold-properties'

// SVG Components
function HeroHouseIllustration() {
  return (
    <svg viewBox="0 0 400 350" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* House base */}
      <rect x="80" y="160" width="240" height="150" fill="white" fillOpacity="0.15" rx="4" />
      {/* Roof */}
      <path d="M60 170 L200 60 L340 170" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M80 170 L200 80 L320 170" fill="white" fillOpacity="0.2" />
      {/* Chimney */}
      <rect x="260" y="90" width="30" height="60" fill="white" fillOpacity="0.2" rx="2" />
      {/* Door */}
      <rect x="170" y="220" width="60" height="90" fill="white" fillOpacity="0.25" rx="4" />
      <circle cx="215" cy="270" r="5" fill="white" fillOpacity="0.4" />
      {/* Windows */}
      <rect x="100" y="200" width="50" height="40" fill="white" fillOpacity="0.3" rx="2" />
      <rect x="100" y="200" width="50" height="40" stroke="white" strokeOpacity="0.4" strokeWidth="2" rx="2" fill="none" />
      <line x1="125" y1="200" x2="125" y2="240" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="100" y1="220" x2="150" y2="220" stroke="white" strokeOpacity="0.4" strokeWidth="2" />

      <rect x="250" y="200" width="50" height="40" fill="white" fillOpacity="0.3" rx="2" />
      <rect x="250" y="200" width="50" height="40" stroke="white" strokeOpacity="0.4" strokeWidth="2" rx="2" fill="none" />
      <line x1="275" y1="200" x2="275" y2="240" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="250" y1="220" x2="300" y2="220" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
      {/* Ground */}
      <ellipse cx="200" cy="320" rx="160" ry="20" fill="white" fillOpacity="0.1" />
      {/* Decorative elements */}
      <circle cx="50" cy="100" r="20" fill="white" fillOpacity="0.1" />
      <circle cx="350" cy="80" r="15" fill="white" fillOpacity="0.1" />
      <circle cx="370" cy="200" r="25" fill="white" fillOpacity="0.08" />
    </svg>
  )
}

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

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  )
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3h14M5 3v4a7 7 0 007 7m-7-7H3m16 0h-2m2 0v4a7 7 0 01-7 7m0 0v3m0 0h-3m3 0h3M8 21h8" />
    </svg>
  )
}

function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="6" strokeWidth={1.5} />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  )
}

function HandshakeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 11l5-5m0 0l5 5m-5-5v12M3 21h18M5 21V10l7-7 7 7v11" />
    </svg>
  )
}

function StarIcon({ filled = false, className }: { filled?: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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

export default function HomePage() {
  const stats = getSoldStats()
  const featuredSold = getFeaturedSold(6)

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/30 to-transparent"></div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div>
              <p className="text-primary-200 font-semibold mb-4 tracking-wide uppercase text-sm inline-flex items-center gap-2">
                <span className="w-8 h-px bg-primary-300"></span>
                Artistic Real Estate Group
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Trusted DFW
                <span className="block text-primary-200">Real Estate Expert</span>
              </h1>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed max-w-xl">
                Helping buyers find their dream homes across the Dallas-Fort Worth metroplex.
                Personalized service, expert negotiation, proven results.
              </p>

              {/* Floating stat badges */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                  <p className="text-2xl font-bold">{stats.totalSold}+</p>
                  <p className="text-primary-200 text-sm">Homes Sold</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                  <p className="text-2xl font-bold">{formatPrice(stats.totalVolume)}</p>
                  <p className="text-primary-200 text-sm">Total Volume</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  href="/listings"
                  className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <HomeIcon className="w-5 h-5" />
                  View Sold Properties
                </Link>
                <Link
                  href="/contact"
                  className="border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                >
                  Contact Greg
                </Link>
              </div>
            </div>

            {/* Right illustration */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-transparent rounded-3xl blur-2xl"></div>
                <HeroHouseIllustration />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center text-primary-200/60">
              <span className="text-xs mb-2">Scroll</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <HomeIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-primary-600">{stats.totalSold}+</p>
              <p className="text-gray-600 mt-1 font-medium">Homes Sold</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <ChartIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-primary-600">{formatPrice(stats.totalVolume)}</p>
              <p className="text-gray-600 mt-1 font-medium">Total Volume</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <MapIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-primary-600">{stats.cities.length}</p>
              <p className="text-gray-600 mt-1 font-medium">DFW Cities Served</p>
            </div>
            <div className="text-center group">
              <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                <HeartIcon className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-4xl font-bold text-primary-600">100%</p>
              <p className="text-gray-600 mt-1 font-medium">Client Focused</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Sales */}
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
            {featuredSold.map((property) => {
              const overAsking = isSoldOverAsking(property)
              return (
                <div
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group card-glow"
                >
                  <div className="aspect-[4/3] bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center transform group-hover:scale-110 transition-transform duration-300">
                        <PropertyHouseIcon beds={property.beds} className="w-20 h-20 mx-auto mb-2" />
                        <span className="text-primary-600/70 text-sm font-medium">{property.city}, TX</span>
                      </div>
                    </div>
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

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Our Clients Say</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Real experiences from real homebuyers across the DFW metroplex</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 relative hover:shadow-lg transition-shadow"
              >
                <div className="absolute -top-3 left-8">
                  <div className="bg-primary-600 text-white w-8 h-8 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-1 mb-4 mt-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} filled className="w-5 h-5 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">{testimonial.author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">The Process</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Your Home Buying Journey</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">A simple, guided process from first consultation to getting your keys</p>
          </div>

          {/* Desktop Timeline */}
          <div className="hidden md:block relative">
            {/* Timeline line */}
            <div className="absolute top-12 left-0 right-0 h-1 timeline-line rounded-full"></div>

            <div className="grid grid-cols-4 gap-8 relative">
              {processSteps.map((step, index) => (
                <div key={step.step} className="text-center relative">
                  {/* Step circle */}
                  <div className="w-24 h-24 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center relative z-10 border-4 border-primary-100">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary-600">{step.step}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Timeline */}
          <div className="md:hidden space-y-8">
            {processSteps.map((step, index) => (
              <div key={step.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {step.step}
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-primary-200 mt-2"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 mt-1">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Served */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Texas outline background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <svg viewBox="0 0 800 800" className="w-full max-w-4xl h-auto">
            <path d="M200 100 L350 80 L400 100 L450 95 L550 120 L600 150 L650 200 L680 280 L700 350 L720 450 L700 550 L680 600 L620 680 L550 720 L450 700 L350 720 L250 700 L180 650 L150 550 L130 450 L100 350 L120 250 L150 180 Z"
              fill="currentColor"
              className="text-primary-600"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Service Area</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Serving the DFW Metroplex</h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              From Plano to Fort Worth, Little Elm to Waxahachie — helping families find their perfect home across North Texas.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {stats.cities.map((city, index) => (
              <span
                key={city}
                className="bg-primary-50 text-primary-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary-100 hover:shadow-md transition-all cursor-default border border-primary-100"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Greg */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Why Greg</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Work With Greg?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Find Your Dream Home?</h2>
          <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Whether you're buying your first home or looking for your next investment property,
            I'm here to guide you through every step of the journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary-600 px-10 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              Schedule a Consultation
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

// Data
const testimonials = [
  {
    text: "Greg made our first home purchase incredibly smooth. His expertise in the DFW market was invaluable, and he was always available to answer our questions.",
    author: "Sarah M.",
    location: "Little Elm",
    rating: 5
  },
  {
    text: "Professional, responsive, and always had our best interests in mind. Greg's negotiation skills helped us close in record time!",
    author: "John D.",
    location: "Plano",
    rating: 5
  },
  {
    text: "Highly recommend Greg to anyone looking to buy in DFW. His local knowledge and dedication made all the difference in our home search.",
    author: "Maria L.",
    location: "Garland",
    rating: 5
  }
]

const processSteps = [
  {
    step: 1,
    title: "Consultation",
    description: "We discuss your needs, budget, and ideal timeline"
  },
  {
    step: 2,
    title: "Property Search",
    description: "Personalized showings in your target neighborhoods"
  },
  {
    step: 3,
    title: "Negotiation",
    description: "Strategic offers to get you the best deal"
  },
  {
    step: 4,
    title: "Keys Day!",
    description: "Smooth closing and move into your new home"
  }
]

const features = [
  {
    icon: <TrophyIcon className="w-7 h-7 text-primary-600" />,
    title: 'Proven Track Record',
    description: 'Consistent results with successful closings across the DFW metroplex. Your goals become my priority from day one.',
  },
  {
    icon: <TargetIcon className="w-7 h-7 text-primary-600" />,
    title: 'Buyer Specialist',
    description: 'Expert guidance through the entire home buying process, from initial search to closing day. Making your dream home a reality.',
  },
  {
    icon: <HandshakeIcon className="w-7 h-7 text-primary-600" />,
    title: 'Personal Attention',
    description: "Direct access to your agent, not a team. You deserve personalized service for one of life's biggest decisions.",
  },
]
