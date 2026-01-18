// Feature cards data for "Why Greg" section
import { TrophyIcon, TargetIcon, HandshakeIcon } from '@/components/icons'

export interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

// Note: Features with icons need to be created as a function to return JSX
export function getFeatures(): Feature[] {
  return [
    {
      icon: TrophyIcon({ className: "w-7 h-7 text-primary-600" }),
      title: 'Proven Track Record',
      description: 'Consistent results with successful closings across the DFW metroplex. Your goals become my priority from day one.',
    },
    {
      icon: TargetIcon({ className: "w-7 h-7 text-primary-600" }),
      title: 'Buyer Specialist',
      description: 'Expert guidance through the entire home buying process, from initial search to closing day. Making your dream home a reality.',
    },
    {
      icon: HandshakeIcon({ className: "w-7 h-7 text-primary-600" }),
      title: 'Personal Attention',
      description: "Direct access to your agent, not a team. You deserve personalized service for one of life's biggest decisions.",
    },
  ]
}
