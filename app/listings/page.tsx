import Link from 'next/link'

// Mock data - replace with CMS fetch
const listings = [
  {
    id: '1',
    price: '$450,000',
    address: '123 Oak Street',
    neighborhood: 'Downtown',
    beds: 3,
    baths: 2,
    sqft: '1,850',
    status: 'For Sale',
    type: 'Single Family',
  },
  {
    id: '2',
    price: '$625,000',
    address: '456 Maple Avenue',
    neighborhood: 'Riverside',
    beds: 4,
    baths: 3,
    sqft: '2,400',
    status: 'For Sale',
    type: 'Single Family',
  },
  {
    id: '3',
    price: '$385,000',
    address: '789 Pine Lane',
    neighborhood: 'Westside',
    beds: 2,
    baths: 2,
    sqft: '1,200',
    status: 'For Sale',
    type: 'Condo',
  },
  {
    id: '4',
    price: '$575,000',
    address: '321 Cedar Court',
    neighborhood: 'Northgate',
    beds: 4,
    baths: 2.5,
    sqft: '2,100',
    status: 'Pending',
    type: 'Single Family',
  },
  {
    id: '5',
    price: '$299,000',
    address: '555 Birch Street',
    neighborhood: 'Midtown',
    beds: 1,
    baths: 1,
    sqft: '850',
    status: 'For Sale',
    type: 'Condo',
  },
  {
    id: '6',
    price: '$725,000',
    address: '888 Willow Drive',
    neighborhood: 'Lakeside',
    beds: 5,
    baths: 3,
    sqft: '3,200',
    status: 'For Sale',
    type: 'Single Family',
  },
]

export default function ListingsPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Available Listings</h1>
          <p className="text-gray-600 mt-2">
            Showing {listings.length} properties in the Greater Metro Area
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-4">
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Any Price</option>
              <option>Under $300k</option>
              <option>$300k - $500k</option>
              <option>$500k - $750k</option>
              <option>$750k+</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Any Beds</option>
              <option>1+ beds</option>
              <option>2+ beds</option>
              <option>3+ beds</option>
              <option>4+ beds</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Any Type</option>
              <option>Single Family</option>
              <option>Condo</option>
              <option>Townhouse</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              <option>Any Neighborhood</option>
              <option>Downtown</option>
              <option>Riverside</option>
              <option>Westside</option>
              <option>Northgate</option>
              <option>Midtown</option>
              <option>Lakeside</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="listing-card bg-white rounded-xl overflow-hidden shadow-md"
            >
              <div className="aspect-[4/3] bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-6xl text-gray-300">
                  🏠
                </div>
                <div className={`absolute top-3 left-3 text-white text-xs px-2 py-1 rounded ${
                  listing.status === 'Pending' ? 'bg-yellow-500' : 'bg-primary-600'
                }`}>
                  {listing.status}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <p className="text-2xl font-bold text-gray-900">{listing.price}</p>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {listing.type}
                  </span>
                </div>
                <p className="text-gray-800 font-medium mt-1">{listing.address}</p>
                <p className="text-gray-500 text-sm">{listing.neighborhood}</p>
                <div className="flex gap-4 mt-3 text-sm text-gray-500">
                  <span>{listing.beds} beds</span>
                  <span>{listing.baths} baths</span>
                  <span>{listing.sqft} sqft</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
