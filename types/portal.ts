// Client Portal TypeScript interfaces

// Client session for magic link auth
export interface ClientSession {
  id: string
  lead_id: string
  token: string
  token_type: 'magic_link' | 'session'
  expires_at: Date
  used_at: Date | null
  created_at: Date
}

// Property favorite
export interface Favorite {
  id: string
  lead_id: string
  property_id: string
  notes: string | null
  created_at: Date
  // Joined property data
  property?: Property
}

// Viewing request statuses
export type ViewingStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled'

// Viewing request
export interface ViewingRequest {
  id: string
  lead_id: string
  property_id: string
  preferred_date: string | null
  preferred_time: string | null
  status: ViewingStatus
  scheduled_at: Date | null
  notes: string | null
  created_at: Date
  // Joined property data
  property?: Property
}

// Transaction types
export type TransactionType = 'buying' | 'selling'
export type TransactionStatus = 'active' | 'pending' | 'closed' | 'cancelled' | 'fell_through'

// Transaction (active deal)
export interface Transaction {
  id: string
  lead_id: string
  property_id: string | null
  transaction_type: TransactionType
  property_address: string
  offer_price: number | null
  accepted_price: number | null
  status: TransactionStatus
  current_milestone: string | null
  contract_date: string | null
  option_period_ends: string | null
  inspection_date: string | null
  closing_date: string | null
  created_at: Date
  updated_at: Date
  // Joined data
  milestones?: TransactionMilestone[]
  property?: Property
}

// Milestone statuses
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

// Transaction milestone
export interface TransactionMilestone {
  id: string
  transaction_id: string
  milestone_type: string
  title: string
  due_date: string | null
  completed_at: Date | null
  status: MilestoneStatus
  notes: string | null
  order_index: number
}

// Document categories
export type DocumentCategory =
  | 'contract'
  | 'disclosure'
  | 'inspection'
  | 'appraisal'
  | 'title'
  | 'insurance'
  | 'financing'
  | 'closing'
  | 'other'

// Document uploader type
export type DocumentUploader = 'client' | 'agent'

// Document
export interface Document {
  id: string
  lead_id: string
  transaction_id: string | null
  name: string
  file_name: string
  file_type: string
  file_size: number | null
  file_path: string
  category: DocumentCategory
  uploaded_by: DocumentUploader
  created_at: Date
}

// Message sender types
export type MessageSender = 'client' | 'agent' | 'mascot'

// Message attachment
export interface MessageAttachment {
  name: string
  url: string
  type: string
  size?: number
}

// Message
export interface Message {
  id: string
  lead_id: string
  sender_type: MessageSender
  content: string
  attachments: MessageAttachment[]
  read_at: Date | null
  created_at: Date
}

// Property from existing schema (subset for portal)
export interface Property {
  id: string
  slug: string
  address: string
  city: string
  state: string
  zip: string
  list_price: number
  beds: number
  baths: number
  sqft: number | null
  year_built: number | null
  property_type: string
  status: 'active' | 'pending' | 'sold' | 'off_market'
  image_url: string | null
  images: string[]
  headline: string | null
  description: string | null
}

// Lead (subset for portal client context)
export interface PortalClient {
  id: string
  name: string | null
  email: string
  phone: string | null
  intent: 'buying' | 'selling' | 'both' | 'just_looking' | null
  timeline: string | null
  budget: string | null
  created_at: Date
}

// Dashboard stats for the portal
export interface PortalDashboardStats {
  favorites_count: number
  active_transactions: number
  pending_viewings: number
  unread_messages: number
}

// Default buying milestones
export const BUYING_MILESTONES = [
  { type: 'offer_submitted', title: 'Offer Submitted', order: 1 },
  { type: 'offer_accepted', title: 'Offer Accepted', order: 2 },
  { type: 'option_period', title: 'Option Period', order: 3 },
  { type: 'inspection', title: 'Home Inspection', order: 4 },
  { type: 'appraisal', title: 'Appraisal', order: 5 },
  { type: 'financing', title: 'Financing Approval', order: 6 },
  { type: 'title_work', title: 'Title Work', order: 7 },
  { type: 'final_walkthrough', title: 'Final Walk-Through', order: 8 },
  { type: 'closing', title: 'Closing Day', order: 9 },
]

// Default selling milestones
export const SELLING_MILESTONES = [
  { type: 'listing_prep', title: 'Listing Preparation', order: 1 },
  { type: 'listed', title: 'Listed on Market', order: 2 },
  { type: 'showings', title: 'Showings', order: 3 },
  { type: 'offer_received', title: 'Offer Received', order: 4 },
  { type: 'under_contract', title: 'Under Contract', order: 5 },
  { type: 'buyer_inspection', title: 'Buyer Inspection', order: 6 },
  { type: 'appraisal', title: 'Appraisal', order: 7 },
  { type: 'closing', title: 'Closing Day', order: 8 },
]
