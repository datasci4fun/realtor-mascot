'use client'

import { useSearchParams } from 'next/navigation'
import MortgageCalculator from '@/components/tools/MortgageCalculator'
import { useSiteSettings, formatPhoneForLink } from '@/components/providers/SiteSettingsProvider'

export default function MortgageCalculatorPage() {
  const searchParams = useSearchParams()
  const { settings } = useSiteSettings()
  const initialPrice = searchParams.get('price') ? parseInt(searchParams.get('price')!) : 400000

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-primary-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Mortgage Calculator</h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Estimate your monthly mortgage payment and see a breakdown of principal, interest,
            taxes, insurance, and more.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MortgageCalculator initialPrice={initialPrice} />

        {/* Info Section */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Understanding PMI</h3>
            <p className="text-sm text-gray-600">
              Private Mortgage Insurance (PMI) is required when your down payment is less than 20%.
              It typically costs 0.5% to 1% of the loan amount annually. PMI can be removed once you
              reach 20% equity in your home.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Texas Property Taxes</h3>
            <p className="text-sm text-gray-600">
              Texas has some of the highest property taxes in the nation, averaging around 2.2%.
              However, Texas has no state income tax, which can offset this cost. Rates vary by
              county and school district.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-2">Get Pre-Approved</h3>
            <p className="text-sm text-gray-600">
              This calculator provides estimates only. For accurate numbers, get pre-approved with a
              lender. I can recommend trusted mortgage professionals in the DFW area.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Ready to Start Your Home Search?</h3>
              <p className="text-primary-100">
                Let me help you find the perfect home within your budget.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="/listings"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-700 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                Browse Listings
              </a>
              <a
                href={`tel:${formatPhoneForLink(settings.realtor_phone)}`}
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
              >
                Call {settings.realtor_phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
