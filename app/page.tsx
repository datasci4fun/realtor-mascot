import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find Your Perfect Home in the Greater Metro Area
            </h1>
            <p className="text-xl text-primary-100 mb-8">
              With over 15 years of experience and 200+ happy families,
              Sarah Johnson is your trusted partner in finding your dream home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/listings"
                className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Listings</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="listing-card bg-white rounded-xl overflow-hidden shadow-md"
              >
                <div className="aspect-[4/3] bg-gray-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    🏠 {/* Placeholder for image */}
                  </div>
                  <div className="absolute top-3 left-3 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                    {listing.status}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-2xl font-bold text-gray-900">{listing.price}</p>
                  <p className="text-gray-600 mt-1">{listing.address}</p>
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>{listing.beds} beds</span>
                    <span>{listing.baths} baths</span>
                    <span>{listing.sqft} sqft</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/listings"
              className="text-primary-600 font-semibold hover:text-primary-700"
            >
              View All Listings →
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Sarah */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Why Choose Sarah Johnson?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Home?</h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Let's start the conversation. Whether you're buying, selling, or just exploring,
            I'm here to help every step of the way.
          </p>
          <Link
            href="/contact"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-block"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </div>
  )
}

const featuredListings = [
  {
    id: '1',
    price: '$450,000',
    address: '123 Oak Street, Downtown',
    beds: 3,
    baths: 2,
    sqft: '1,850',
    status: 'New',
  },
  {
    id: '2',
    price: '$625,000',
    address: '456 Maple Avenue, Riverside',
    beds: 4,
    baths: 3,
    sqft: '2,400',
    status: 'Featured',
  },
  {
    id: '3',
    price: '$385,000',
    address: '789 Pine Lane, Westside',
    beds: 2,
    baths: 2,
    sqft: '1,200',
    status: 'Open House',
  },
]

const features = [
  {
    icon: '🏆',
    title: '15+ Years Experience',
    description: 'Deep knowledge of the local market and neighborhoods.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: '200+ Happy Families',
    description: 'A track record of successful closings and satisfied clients.',
  },
  {
    icon: '🤝',
    title: 'Personalized Service',
    description: 'Dedicated attention to your unique needs and timeline.',
  },
]
