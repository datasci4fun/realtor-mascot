'use client'

import { Property, formatPrice, getPriceDifference } from '@/types/property'

interface PriceDisplayProps {
  property: Property
  size?: 'large' | 'small'
}

export function PriceDisplay({ property, size = 'large' }: PriceDisplayProps) {
  const isSold = property.status === 'sold'
  const priceDiff = getPriceDifference(property)
  const textSize = size === 'large' ? 'text-3xl md:text-4xl' : 'text-2xl'

  if (isSold) {
    return (
      <div className="text-right">
        <p className={`${textSize} font-bold text-green-600`}>
          {formatPrice(property.closePrice!)}
        </p>
        <p className="text-sm text-gray-500">
          List: {formatPrice(property.listPrice)}
          {priceDiff !== 0 && (
            <span className={priceDiff > 0 ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
              ({priceDiff > 0 ? '+' : ''}{formatPrice(priceDiff)})
            </span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="text-right">
      <p className={`${textSize} font-bold text-primary-600`}>
        {formatPrice(property.listPrice)}
      </p>
      {property.originalPrice && property.originalPrice > property.listPrice && (
        <p className="text-sm text-gray-500">
          <span className="line-through">{formatPrice(property.originalPrice)}</span>
          <span className="text-green-600 ml-2">Price Reduced!</span>
        </p>
      )}
    </div>
  )
}
