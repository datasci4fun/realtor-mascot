import Link from 'next/link'
import { getSoldStats, formatPrice } from '@/lib/sold-properties'
import { getSiteSettings } from '@/lib/site-settings'

// SVG Icon Components
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  )
}

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
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

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )
}

function BadgeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
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

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

function StarIcon({ filled = false, className }: { filled?: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  )
}

export default async function AboutPage() {
  const stats = getSoldStats()
  const settings = await getSiteSettings()

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
        {/* Background patterns */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/30 to-transparent"></div>

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 relative">
          <div className="max-w-3xl">
            <p className="text-primary-200 font-semibold mb-4 tracking-wide uppercase text-sm inline-flex items-center gap-2">
              <span className="w-8 h-px bg-primary-300"></span>
              {settings.brokerage_name}
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">About {settings.realtor_name}</h1>
            <p className="text-xl text-primary-100 leading-relaxed max-w-2xl">
              Your dedicated buyer's agent in the Dallas-Fort Worth metroplex.
              Personalized service and expert guidance for your home search.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Photo placeholder */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-100 via-primary-50 to-primary-200 aspect-square rounded-3xl flex items-center justify-center relative overflow-hidden shadow-2xl">
                {/* Decorative pattern */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

                <div className="text-center relative z-10">
                  <div className="w-40 h-40 mx-auto mb-6 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                    <UserIcon className="w-20 h-20 text-primary-600" />
                  </div>
                  <p className="text-primary-800 font-bold text-2xl">{settings.realtor_name}</p>
                  <p className="text-primary-600 font-medium">{settings.realtor_title || 'Real Estate Agent'}</p>
                </div>

                {/* Floating badges */}
                <div className="absolute top-6 right-6 bg-white rounded-xl px-4 py-2 shadow-lg">
                  <p className="text-sm font-bold text-primary-600">{stats.totalSold}+ Sold</p>
                </div>
                <div className="absolute bottom-24 left-6 bg-white rounded-xl px-4 py-2 shadow-lg">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} filled className="w-4 h-4 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact card */}
              <div className="absolute -bottom-6 left-6 right-6 bg-white rounded-2xl p-5 shadow-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <PhoneIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Call or Text Anytime</p>
                    <p className="font-bold text-gray-900 text-lg">{settings.realtor_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Meet Your Agent</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Helping Buyers Find Home
              </h2>
              <div className="prose prose-lg text-gray-600 space-y-4">
                <p>
                  As a dedicated buyer's agent with Artistic Real Estate Group, I specialize in
                  helping families and individuals find their perfect home across the Dallas-Fort Worth
                  metroplex.
                </p>
                <p>
                  With successful transactions spanning from Plano to Fort Worth, Little Elm to
                  Waxahachie, I bring deep local knowledge and a commitment to finding the right
                  property for your needs and budget.
                </p>
                <p>
                  Real estate is about more than just transactions—it's about understanding your
                  lifestyle, your priorities, and your future. I take pride in providing personalized
                  service and being available when you need me.
                </p>
              </div>

              {/* Stats */}
              <div className="mt-10 grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 text-center group hover:shadow-lg transition-shadow">
                  <p className="text-4xl font-bold text-primary-600">{stats.totalSold}+</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Homes Sold</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 text-center group hover:shadow-lg transition-shadow">
                  <p className="text-4xl font-bold text-primary-600">{stats.cities.length}</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Cities Served</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 text-center group hover:shadow-lg transition-shadow">
                  <p className="text-4xl font-bold text-primary-600">5★</p>
                  <p className="text-sm text-gray-600 mt-1 font-medium">Client Rated</p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={`tel:${settings.realtor_phone.replace(/[^0-9]/g, '')}`}
                  className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
                >
                  <PhoneIcon className="w-5 h-5" />
                  Call Now
                </a>
                <a
                  href={`mailto:${settings.realtor_email}`}
                  className="border-2 border-primary-600 text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all inline-flex items-center gap-2"
                >
                  <EmailIcon className="w-5 h-5" />
                  Email {settings.realtor_name.split(' ')[0]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Professional</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Credentials & Affiliations
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {cred.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{cred.title}</h3>
                <p className="text-gray-500 mt-2">{cred.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-primary-50/30 relative overflow-hidden">
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
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Coverage Area</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Service Areas
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Proudly serving buyers across the Dallas-Fort Worth metroplex
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.cities.map((city, index) => (
              <div
                key={city}
                className="bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                  <MapPinIcon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="font-semibold text-gray-900">{city}</p>
                <p className="text-sm text-gray-500">Texas</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Testimonials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              What Clients Say
            </h2>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Real experiences from homebuyers across the DFW metroplex
            </p>
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
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} filled className="w-5 h-5 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-sm">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Start Your Home Search?</h2>
          <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            Let's find your perfect home in the DFW metroplex. Reach out today for a no-obligation consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary-600 px-10 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
            >
              Contact {settings.realtor_name.split(' ')[0]}
            </Link>
            <a
              href={`tel:${settings.realtor_phone.replace(/[^0-9]/g, '')}`}
              className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
            >
              <PhoneIcon className="w-5 h-5" />
              {settings.realtor_phone}
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const credentials = [
  {
    icon: <BadgeIcon className="w-8 h-8 text-primary-600" />,
    title: 'Licensed Realtor',
    description: 'Texas Real Estate Commission',
  },
  {
    icon: <HomeIcon className="w-8 h-8 text-primary-600" />,
    title: 'Buyer Specialist',
    description: 'Dedicated Buyer Representation',
  },
  {
    icon: <BookIcon className="w-8 h-8 text-primary-600" />,
    title: 'NAR Member',
    description: 'National Association of Realtors',
  },
  {
    icon: <TargetIcon className="w-8 h-8 text-primary-600" />,
    title: 'Local Expert',
    description: 'DFW Metroplex Specialist',
  },
]

const testimonials = [
  {
    quote: "Greg made our first home buying experience so smooth. He was patient, knowledgeable, and always available when we had questions.",
    name: "Michael & Jennifer T.",
    detail: "First-time homebuyers, Garland",
  },
  {
    quote: "Found us the perfect home in Little Elm within our budget. His knowledge of the area was invaluable.",
    name: "The Rodriguez Family",
    detail: "Relocated from Houston",
  },
  {
    quote: "Professional, responsive, and genuinely cared about finding us the right home. Highly recommend!",
    name: "David & Sarah M.",
    detail: "Homebuyers, Plano",
  },
]
