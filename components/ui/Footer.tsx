import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-xl">Sarah Johnson Realty</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Helping families find their dream homes for over 15 years.
              Licensed real estate professional serving the Greater Metro Area.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/listings" className="hover:text-white">Browse Listings</Link></li>
              <li><Link href="/about" className="hover:text-white">About Sarah</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📞 (555) 123-4567</li>
              <li>✉️ sarah@johnsonrealty.com</li>
              <li>📍 123 Main Street, Suite 100</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sarah Johnson Realty. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
