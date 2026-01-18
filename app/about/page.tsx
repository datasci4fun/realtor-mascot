import Link from 'next/link'
import { getSoldStats, formatPrice } from '@/lib/sold-properties'

export default function AboutPage() {
  const stats = getSoldStats()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-primary-200 font-medium mb-3 tracking-wide uppercase text-sm">
            Artistic Real Estate Group
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Greg Knapp</h1>
          <p className="text-primary-100 text-xl max-w-2xl">
            Your dedicated buyer's agent in the Dallas-Fort Worth metroplex
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Photo placeholder */}
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-4 bg-primary-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-primary-700 font-semibold text-lg">Greg Knapp</p>
                <p className="text-primary-600/70">Artistic Real Estate Group</p>
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Call or Text</p>
                    <p className="font-semibold text-gray-900">(972) 333-4466</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
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

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary-50 rounded-xl p-5">
                  <p className="text-3xl font-bold text-primary-600">{stats.totalSold}+</p>
                  <p className="text-sm text-gray-600 mt-1">Homes Sold</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-5">
                  <p className="text-3xl font-bold text-primary-600">{stats.cities.length}</p>
                  <p className="text-sm text-gray-600 mt-1">Cities Served</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-5">
                  <p className="text-3xl font-bold text-primary-600">5★</p>
                  <p className="text-sm text-gray-600 mt-1">Client Rated</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="tel:469-485-7313"
                  className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
                <a
                  href="mailto:gregsmybroker@gmail.com"
                  className="border-2 border-primary-600 text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email Greg
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
            Service Areas
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
            Proudly serving buyers across the Dallas-Fort Worth metroplex
          </p>
          <div className="grid md:grid-cols-4 gap-4">
            {stats.cities.map((city) => (
              <div key={city} className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 mx-auto mb-2 bg-primary-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">{city}</p>
                <p className="text-sm text-gray-500">Texas</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Credentials & Affiliations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">{cred.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{cred.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cred.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex text-yellow-400 mb-4 text-lg">
                  {'★★★★★'}
                </div>
                <p className="text-gray-600 italic mb-4 leading-relaxed">"{testimonial.quote}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Home Search?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Let's find your perfect home in the DFW metroplex. Reach out today for a no-obligation consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block"
            >
              Contact Greg
            </Link>
            <a
              href="tel:469-485-7313"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
            >
              (972) 333-4466
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

const credentials = [
  {
    icon: '🏅',
    title: 'Licensed Realtor',
    description: 'Texas Real Estate Commission',
  },
  {
    icon: '🏠',
    title: 'Buyer Specialist',
    description: 'Dedicated Buyer Representation',
  },
  {
    icon: '📚',
    title: 'NAR Member',
    description: 'National Association of Realtors',
  },
  {
    icon: '🎯',
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
