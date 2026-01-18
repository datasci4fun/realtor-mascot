import Link from 'next/link'
import { HomeIcon } from '@/components/icons'
import { HeroHouse } from '@/components/illustrations'
import { formatPrice } from '@/lib/sold-properties'

interface HeroSectionProps {
  totalSold: number
  totalVolume: number
}

export function HeroSection({ totalSold, totalVolume }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-900/30 to-transparent"></div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <p className="text-primary-200 font-semibold mb-4 tracking-wide uppercase text-sm inline-flex items-center gap-2">
              <span className="w-8 h-px bg-primary-300"></span>
              Artistic Real Estate Group
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Your Trusted DFW
              <span className="block text-primary-200">Real Estate Expert</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 leading-relaxed max-w-xl">
              Helping buyers find their dream homes across the Dallas-Fort Worth metroplex.
              Personalized service, expert negotiation, proven results.
            </p>

            {/* Floating stat badges */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-2xl font-bold">{totalSold}+</p>
                <p className="text-primary-200 text-sm">Homes Sold</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
                <p className="text-2xl font-bold">{formatPrice(totalVolume)}</p>
                <p className="text-primary-200 text-sm">Total Volume</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/listings"
                className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                <HomeIcon className="w-5 h-5" />
                View Sold Properties
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white/80 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Contact Greg
              </Link>
            </div>
          </div>

          {/* Right illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-transparent rounded-3xl blur-2xl"></div>
              <HeroHouse />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center text-primary-200/60">
            <span className="text-xs mb-2">Scroll</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
