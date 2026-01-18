import Link from 'next/link'
import { PhoneIcon } from '@/components/icons'

export function CTASection() {
  return (
    <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-24 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/10 rounded-full"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to Find Your Dream Home?</h2>
        <p className="text-primary-100 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
          Whether you're buying your first home or looking for your next investment property,
          I'm here to guide you through every step of the journey.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="bg-white text-primary-600 px-10 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 inline-flex items-center justify-center gap-2"
          >
            Schedule a Consultation
          </Link>
          <a
            href="tel:469-485-7313"
            className="border-2 border-white text-white px-10 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all inline-flex items-center justify-center gap-2"
          >
            <PhoneIcon className="w-5 h-5" />
            (469) 485-7313
          </a>
        </div>
      </div>
    </section>
  )
}
