export interface Lead {
  id?: string
  name: string
  email: string
  phone?: string

  // Lead qualification
  intent?: 'buying' | 'selling' | 'both' | 'just_looking'
  timeline?: 'asap' | '1-3_months' | '3-6_months' | '6-12_months' | 'not_sure'
  budget?: string
  preApproved?: boolean

  // Context
  source: LeadSource
  page: string
  listingId?: string
  listingAddress?: string

  // Lead management
  status?: LeadStatus
  assignedTo?: string
  priority?: LeadPriority
  lastContactedAt?: string
  nextFollowUp?: string
  updatedAt?: string

  // Conversation data
  conversationHistory?: ConversationMessage[]

  // Metadata
  timestamp: string
  userAgent?: string
  referrer?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
}

export type LeadSource =
  | 'mascot_chat'
  | 'contact_form'
  | 'listing_inquiry'
  | 'home_valuation'
  | 'newsletter'

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'showing'
  | 'offer'
  | 'closed'
  | 'lost'

export type LeadPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface ConversationMessage {
  role: 'mascot' | 'user'
  content: string
  timestamp: string
  quickReply?: boolean
}

export interface LeadSubmissionResponse {
  success: boolean
  leadId?: string
  message?: string
  error?: string
}

export interface LeadNote {
  id: string
  leadId: string
  note: string
  noteType: 'note' | 'call' | 'email' | 'meeting' | 'showing' | 'system'
  createdBy?: string
  createdAt: string
}

export interface LeadStats {
  total: number
  byStatus: Record<string, number>
  bySource: Record<string, number>
  thisWeek: number
  thisMonth: number
}

export interface LeadFilters {
  status?: LeadStatus
  source?: LeadSource
  priority?: LeadPriority
  search?: string
  limit?: number
  offset?: number
}
