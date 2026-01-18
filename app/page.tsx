import { getFeaturedSold, getSoldStats } from '@/lib/sold-properties'
import { testimonials } from '@/data/testimonials'
import { processSteps } from '@/data/process-steps'
import {
  HeroSection,
  StatsBar,
  RecentSalesSection,
  TestimonialsSection,
  ProcessTimeline,
  AreasServed,
  WhyChooseSection,
  CTASection
} from '@/components/home'

export default function HomePage() {
  const stats = getSoldStats()
  const featuredSold = getFeaturedSold(6)

  return (
    <div>
      <HeroSection
        totalSold={stats.totalSold}
        totalVolume={stats.totalVolume}
      />

      <StatsBar
        totalSold={stats.totalSold}
        totalVolume={stats.totalVolume}
        citiesCount={stats.cities.length}
      />

      <RecentSalesSection properties={featuredSold} />

      <TestimonialsSection testimonials={testimonials} />

      <ProcessTimeline steps={processSteps} />

      <AreasServed cities={stats.cities} />

      <WhyChooseSection />

      <CTASection />
    </div>
  )
}
