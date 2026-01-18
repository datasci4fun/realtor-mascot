import Link from 'next/link'

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About Sarah Johnson</h1>
          <p className="text-primary-100 text-lg">
            Your trusted real estate partner for over 15 years
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Photo placeholder */}
            <div className="bg-gray-200 aspect-square rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <span className="text-8xl">👩‍💼</span>
                <p className="text-gray-500 mt-4">Sarah Johnson</p>
              </div>
            </div>

            {/* Bio */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Helping Families Find Home
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p>
                  With over 15 years of experience in the Greater Metro Area real estate market,
                  I've had the privilege of helping more than 200 families find their perfect home.
                </p>
                <p>
                  Real estate is more than just buying and selling properties—it's about understanding
                  your dreams, your lifestyle, and your future. I take the time to listen to what
                  matters most to you and work tirelessly to make it happen.
                </p>
                <p>
                  Whether you're a first-time homebuyer, looking to upgrade, or ready to downsize,
                  I'm here to guide you through every step of the process with honesty, expertise,
                  and a personal touch.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary-600">15+</p>
                  <p className="text-sm text-gray-600">Years Experience</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary-600">200+</p>
                  <p className="text-sm text-gray-600">Homes Sold</p>
                </div>
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-primary-600">98%</p>
                  <p className="text-sm text-gray-600">Client Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Credentials & Affiliations
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {credentials.map((cred, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm">
                <span className="text-4xl mb-4 block">{cred.icon}</span>
                <h3 className="font-semibold text-gray-900">{cred.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{cred.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Clients Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <div className="flex text-yellow-400 mb-4">
                  {'★'.repeat(5)}
                </div>
                <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Let's Work Together</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Ready to start your real estate journey? I'd love to hear from you.
          </p>
          <Link
            href="/contact"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  )
}

const credentials = [
  {
    icon: '🏅',
    title: 'Licensed Realtor',
    description: 'State Licensed Real Estate Agent',
  },
  {
    icon: '🏆',
    title: 'Top Producer',
    description: 'Award Winner 2020-2024',
  },
  {
    icon: '📚',
    title: 'NAR Member',
    description: 'National Association of Realtors',
  },
  {
    icon: '🎓',
    title: 'Certified',
    description: 'Accredited Buyer Representative',
  },
]

const testimonials = [
  {
    quote: "Sarah made our first home buying experience so smooth. She was patient, knowledgeable, and always available when we had questions.",
    name: "Michael & Jennifer T.",
    detail: "First-time homebuyers",
  },
  {
    quote: "We sold our house in just 2 weeks for above asking price! Sarah's marketing strategy and negotiation skills are top-notch.",
    name: "Robert S.",
    detail: "Home seller",
  },
  {
    quote: "After relocating from out of state, Sarah helped us find the perfect neighborhood for our family. Couldn't have done it without her!",
    name: "The Martinez Family",
    detail: "Relocation clients",
  },
]
