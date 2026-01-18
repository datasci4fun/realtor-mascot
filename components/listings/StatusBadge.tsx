'use client'

import { Property, isSoldOverAsking } from '@/types/property'
import { CheckIcon } from '@/components/icons'

interface StatusBadgeProps {
  property: Property
}

export function StatusBadge({ property }: StatusBadgeProps) {
  const isSold = property.status === 'sold'
  const overAsking = isSoldOverAsking(property)

  return (
    <>
      <div className="absolute top-4 left-4">
        {isSold ? (
          <span className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            <CheckIcon className="w-4 h-4" />
            SOLD
          </span>
        ) : property.status === 'pending' ? (
          <span className="bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            PENDING
          </span>
        ) : (
          <span className="bg-primary-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg">
            FOR SALE
          </span>
        )}
      </div>
      {isSold && overAsking && (
        <div className="absolute top-4 right-4 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          Sold Over Asking!
        </div>
      )}
    </>
  )
}
