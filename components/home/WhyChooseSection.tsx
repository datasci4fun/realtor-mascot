import { TrophyIcon, TargetIcon, HandshakeIcon } from '@/components/icons'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <TrophyIcon className="w-7 h-7 text-primary-600" />,
    title: 'Proven Track Record',
    description: 'Consistent results with successful closings across the DFW metroplex. Your goals become my priority from day one.',
  },
  {
    icon: <TargetIcon className="w-7 h-7 text-primary-600" />,
    title: 'Buyer Specialist',
    description: 'Expert guidance through the entire home buying process, from initial search to closing day. Making your dream home a reality.',
  },
  {
    icon: <HandshakeIcon className="w-7 h-7 text-primary-600" />,
    title: 'Personal Attention',
    description: "Direct access to your agent, not a team. You deserve personalized service for one of life's biggest decisions.",
  },
]

export function WhyChooseSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-primary-600 font-semibold mb-2 uppercase tracking-wide text-sm">Why Greg</p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Why Work With Greg?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
