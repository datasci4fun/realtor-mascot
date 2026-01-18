/**
 * Mascot behavior configuration for different pages
 * Controls greetings, timing, and conversation flows
 */

export interface PageMascotConfig {
  initialDelay: number // ms before mascot appears
  greeting: string
  followUpDelay: number // ms before follow-up message
  followUp?: string
  quickReplies: string[]
  intent: 'browse' | 'buy' | 'sell' | 'contact' | 'learn'
}

export const pageMascotConfigs: Record<string, PageMascotConfig> = {
  '/': {
    initialDelay: 3000,
    greeting: "Hi there! I'm Sarah. Looking for your dream home in the Metro Area?",
    followUpDelay: 8000,
    followUp: "I'd love to help you find the perfect place. What brings you here today?",
    quickReplies: [
      "I'm looking to buy",
      "I want to sell my home",
      "Just browsing",
    ],
    intent: 'browse',
  },

  '/listings': {
    initialDelay: 5000,
    greeting: "Finding anything you like? I can help narrow down your search!",
    followUpDelay: 15000,
    followUp: "Let me know if you'd like more details on any of these properties.",
    quickReplies: [
      "Help me search",
      "Schedule a viewing",
      "What's your favorite?",
    ],
    intent: 'buy',
  },

  '/listings/[id]': {
    initialDelay: 4000,
    greeting: "Great choice! This is one of my favorite listings. Would you like to schedule a viewing?",
    followUpDelay: 10000,
    followUp: "I can answer any questions you have about this property or the neighborhood.",
    quickReplies: [
      "Schedule a viewing",
      "Tell me about the area",
      "Is the price negotiable?",
    ],
    intent: 'buy',
  },

  '/about': {
    initialDelay: 4000,
    greeting: "Thanks for learning more about me! I'd love to hear about your real estate goals.",
    followUpDelay: 12000,
    followUp: "Whether buying or selling, I'm here to guide you every step of the way.",
    quickReplies: [
      "I'm buying",
      "I'm selling",
      "Just researching agents",
    ],
    intent: 'learn',
  },

  '/contact': {
    initialDelay: 2000,
    greeting: "I'm so glad you want to connect! Feel free to use the form, or we can chat right here.",
    followUpDelay: 10000,
    followUp: "I typically respond within a few hours. Is there anything urgent I can help with now?",
    quickReplies: [
      "Quick question",
      "Schedule a call",
      "I'll use the form",
    ],
    intent: 'contact',
  },
}

/**
 * Get mascot config for a given path
 */
export function getMascotConfig(path: string): PageMascotConfig {
  // Check for exact match first
  if (pageMascotConfigs[path]) {
    return pageMascotConfigs[path]
  }

  // Check for dynamic routes (e.g., /listings/123 -> /listings/[id])
  if (path.startsWith('/listings/') && path !== '/listings') {
    return pageMascotConfigs['/listings/[id]']
  }

  // Default config for unknown pages
  return {
    initialDelay: 5000,
    greeting: "Hi! Can I help you find what you're looking for?",
    followUpDelay: 15000,
    quickReplies: [
      "Browse listings",
      "Contact Sarah",
      "Just looking",
    ],
    intent: 'browse',
  }
}

/**
 * Conversation state machine
 */
export type ConversationState =
  | 'greeting'
  | 'asking_intent'
  | 'asking_timeline'
  | 'asking_budget'
  | 'asking_preapproval'
  | 'collecting_email'
  | 'collecting_name'
  | 'collecting_phone'
  | 'thank_you'
  | 'answering_question'

export interface ConversationPrompt {
  message: string
  quickReplies?: string[]
  inputType?: 'text' | 'email' | 'tel'
  inputPlaceholder?: string
  nextState: ConversationState | null
}

export const conversationFlows: Record<ConversationState, ConversationPrompt> = {
  greeting: {
    message: '', // Set dynamically from page config
    quickReplies: [], // Set dynamically
    nextState: 'asking_intent',
  },

  asking_intent: {
    message: "What brings you here today?",
    quickReplies: [
      "I'm looking to buy",
      "I want to sell my home",
      "Both - buy and sell",
      "Just exploring",
    ],
    nextState: 'asking_timeline',
  },

  asking_timeline: {
    message: "That's exciting! What's your timeline looking like?",
    quickReplies: [
      "ASAP - Ready now",
      "1-3 months",
      "3-6 months",
      "Just starting to look",
    ],
    nextState: 'asking_budget',
  },

  asking_budget: {
    message: "Do you have a budget range in mind?",
    quickReplies: [
      "Under $300k",
      "$300k - $500k",
      "$500k - $750k",
      "$750k+",
      "Not sure yet",
    ],
    nextState: 'collecting_email',
  },

  asking_preapproval: {
    message: "Have you been pre-approved for a mortgage?",
    quickReplies: [
      "Yes, I'm pre-approved",
      "Not yet",
      "Paying cash",
      "Need help with this",
    ],
    nextState: 'collecting_email',
  },

  collecting_email: {
    message: "I'd love to send you some personalized listings! What's your email?",
    inputType: 'email',
    inputPlaceholder: 'your@email.com',
    nextState: 'collecting_name',
  },

  collecting_name: {
    message: "Thanks! And what should I call you?",
    inputType: 'text',
    inputPlaceholder: 'Your name',
    nextState: 'thank_you',
  },

  collecting_phone: {
    message: "Would you like me to call or text you? (optional)",
    inputType: 'tel',
    inputPlaceholder: '(555) 123-4567',
    quickReplies: ["Skip for now"],
    nextState: 'thank_you',
  },

  thank_you: {
    message: "Perfect! I'll be in touch soon with some great options for you. In the meantime, feel free to browse the listings!",
    quickReplies: [
      "Browse listings",
      "Learn more about Sarah",
    ],
    nextState: null,
  },

  answering_question: {
    message: "Great question! Let me help you with that.",
    nextState: 'collecting_email',
  },
}

/**
 * Get response for common questions
 */
export function getQuickAnswer(question: string): string | null {
  const q = question.toLowerCase()

  if (q.includes('price') && q.includes('negotiable')) {
    return "Every listing is different, but I always work hard to get my clients the best possible deal. Would you like to discuss a specific property?"
  }

  if (q.includes('area') || q.includes('neighborhood')) {
    return "I know this area inside and out! The neighborhood has great schools, low crime rates, and property values have been steadily increasing. Want more specific details?"
  }

  if (q.includes('viewing') || q.includes('tour') || q.includes('see')) {
    return "I'd love to show you around! I have availability this week. What day works best for you?"
  }

  if (q.includes('sell') && q.includes('how long')) {
    return "In the current market, well-priced homes are selling in 2-4 weeks on average. I can give you a more specific estimate after seeing your property."
  }

  if (q.includes('commission') || q.includes('fee')) {
    return "My commission structure is competitive and straightforward. I'd be happy to discuss the details when we meet - it depends on the services you need."
  }

  return null
}
