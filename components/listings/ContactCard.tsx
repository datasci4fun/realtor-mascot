'use client'

import Link from 'next/link'
import { Property } from '@/types/property'
import { PhoneIcon, EnvelopeIcon } from '@/components/icons'

interface ContactCardProps {
  property: Property
}

export function ContactCard({ property }: ContactCardProps) {
  const isSold = property.status === 'sold'

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {isSold ? 'Interested in Similar Properties?' : 'Schedule a Showing'}
      </h3>
      <p className="text-gray-600 mb-6">
        {isSold
          ? "This property has sold, but I can help you find similar homes in the area."
          : "Contact me to schedule a private showing of this property."}
      </p>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            GK
          </div>
          <div>
            <p className="font-semibold text-gray-900">Greg Knapp</p>
            <p className="text-sm text-gray-500">Broker & Owner</p>
          </div>
        </div>

        <a
          href="tel:+14694857313"
          className="flex items-center justify-center gap-2 w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors"
        >
          <PhoneIcon className="w-5 h-5" />
          (469) 485-7313
        </a>

        <a
          href="mailto:angela@artisticrealestate.com"
          className="flex items-center justify-center gap-2 w-full border-2 border-primary-600 text-primary-600 py-3 px-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
        >
          <EnvelopeIcon className="w-5 h-5" />
          Send Email
        </a>

        <Link
          href="/contact"
          className="block text-center w-full text-primary-600 py-2 font-medium hover:underline"
        >
          Send a Message
        </Link>
      </div>
    </div>
  )
}
