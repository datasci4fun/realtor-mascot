import Link from 'next/link'
import { notFound } from 'next/navigation'

// Mock data - replace with CMS fetch
const listingsData: Record<string, any> = {
  '1': {
    id: '1',
    price: '$450,000',
    address: '123 Oak Street',
    neighborhood: 'Downtown',
    city: 'Metro City',
    beds: 3,
    baths: 2,
    sqft: '1,850',
    yearBuilt: 2015,
    lotSize: '0.25 acres',
    status: 'For Sale',
    type: 'Single Family',
    description: `Welcome to this stunning 3-bedroom home in the heart of Downtown! This beautifully maintained property features an open floor plan, modern kitchen with stainless steel appliances, and a spacious primary suite. The backyard is perfect for entertaining with a covered patio and mature landscaping.

Located within walking distance to shops, restaurants, and parks, this home offers the perfect blend of urban convenience and suburban comfort.`,
    features: [
      'Open floor plan',
      'Modern kitchen',
      'Stainless steel appliances',
      'Granite countertops',
      'Hardwood floors',
      'Primary suite with walk-in closet',
      'Covered patio',
      'Two-car garage',
      'Central A/C',
    ],
  },
  '2': {
    id: '2',
    price: '$625,000',
    address: '456 Maple Avenue',
    neighborhood: 'Riverside',
    city: 'Metro City',
    beds: 4,
    baths: 3,
    sqft: '2,400',
    yearBuilt: 2018,
    lotSize: '0.35 acres',
    status: 'For Sale',
    type: 'Single Family',
    description: `Gorgeous 4-bedroom home in the desirable Riverside neighborhood! This property boasts high ceilings, an abundance of natural light, and premium finishes throughout. The chef's kitchen features a large island, gas range, and custom cabinetry.

Enjoy peaceful mornings on the covered front porch or entertain guests in the expansive backyard with a fire pit area. Top-rated schools nearby!`,
    features: [
      'High ceilings',
      'Chef\'s kitchen',
      'Gas range',
      'Large island',
      'Custom cabinetry',
      'Fireplace',
      'Covered front porch',
      'Fire pit area',
      'Smart home features',
    ],
  },
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = listingsData[params.id]

  if (!listing) {
    notFound()
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/listings" className="hover:text-primary-600">Listings</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{listing.address}</span>
          </nav>
        </div>
      </div>

      {/* Image Gallery Placeholder */}
      <div className="bg-gray-200 aspect-[21/9] max-h-[500px] flex items-center justify-center">
        <div className="text-center">
          <span className="text-8xl">🏠</span>
          <p className="text-gray-500 mt-4">Property Photos</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{listing.address}</h1>
                  <p className="text-lg text-gray-600">{listing.neighborhood}, {listing.city}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary-600">{listing.price}</p>
                  <span className={`inline-block mt-1 text-sm px-3 py-1 rounded-full ${
                    listing.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex gap-6 mt-6 text-gray-600">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{listing.beds}</p>
                  <p className="text-sm">Beds</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{listing.baths}</p>
                  <p className="text-sm">Baths</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{listing.sqft}</p>
                  <p className="text-sm">Sq Ft</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{listing.yearBuilt}</p>
                  <p className="text-sm">Year Built</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About This Property</h2>
              <div className="text-gray-600 whitespace-pre-line">{listing.description}</div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Features</h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {listing.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <span className="text-primary-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Interested in this property?
              </h2>
              <p className="text-gray-600 text-sm mb-6">
                Schedule a viewing or ask Sarah any questions about this listing.
              </p>

              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
                <textarea
                  placeholder="I'm interested in scheduling a viewing..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                  defaultValue={`I'm interested in ${listing.address}. Please contact me to schedule a viewing.`}
                />
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Request Information
                </button>
              </form>

              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-sm text-gray-500 mb-2">Or call directly</p>
                <a href="tel:5551234567" className="text-lg font-semibold text-primary-600">
                  (555) 123-4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
