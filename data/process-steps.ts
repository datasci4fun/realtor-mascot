// Home buying process steps for home page

export interface ProcessStep {
  step: number
  title: string
  description: string
}

export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Consultation",
    description: "We discuss your needs, budget, and ideal timeline"
  },
  {
    step: 2,
    title: "Property Search",
    description: "Personalized showings in your target neighborhoods"
  },
  {
    step: 3,
    title: "Negotiation",
    description: "Strategic offers to get you the best deal"
  },
  {
    step: 4,
    title: "Keys Day!",
    description: "Smooth closing and move into your new home"
  }
]
