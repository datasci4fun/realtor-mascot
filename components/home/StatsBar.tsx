import { HomeIcon, ChartIcon, MapIcon, HeartIcon } from '@/components/icons'
import { formatPrice } from '@/lib/sold-properties'

interface StatsBarProps {
  totalSold: number
  totalVolume: number
  citiesCount: number
}

export function StatsBar({ totalSold, totalVolume, citiesCount }: StatsBarProps) {
  return (
    <section className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <HomeIcon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-4xl font-bold text-primary-600">{totalSold}+</p>
            <p className="text-gray-600 mt-1 font-medium">Homes Sold</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <ChartIcon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-4xl font-bold text-primary-600">{formatPrice(totalVolume)}</p>
            <p className="text-gray-600 mt-1 font-medium">Total Volume</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <MapIcon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-4xl font-bold text-primary-600">{citiesCount}</p>
            <p className="text-gray-600 mt-1 font-medium">DFW Cities Served</p>
          </div>
          <div className="text-center group">
            <div className="w-12 h-12 mx-auto mb-3 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
              <HeartIcon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-4xl font-bold text-primary-600">100%</p>
            <p className="text-gray-600 mt-1 font-medium">Client Focused</p>
          </div>
        </div>
      </div>
    </section>
  )
}
