import { Pool, QueryResult, QueryResultRow } from 'pg'

// Determine SSL mode: explicitly controlled via DATABASE_SSL env var
// Set DATABASE_SSL=true for external production DBs, false for local/Docker
const useSSL = process.env.DATABASE_SSL === 'true'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/realtor_leads',
  ssl: useSSL ? { rejectUnauthorized: false } : false,
})

// Helper for running queries
export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: any[]): Promise<QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query(text, params)
  const duration = Date.now() - start
  if (process.env.NODE_ENV === 'development') {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount })
  }
  return result
}

// Get a client for transactions
export async function getClient() {
  return pool.connect()
}

// Initialize database schema
export async function initializeDatabase() {
  await query(`
    -- Leads table
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT,
      email TEXT NOT NULL,
      phone TEXT,

      -- Qualification data
      intent TEXT CHECK(intent IN ('buying', 'selling', 'both', 'just_looking')),
      timeline TEXT CHECK(timeline IN ('asap', '1-3_months', '3-6_months', '6-12_months', 'not_sure')),
      budget TEXT,
      pre_approved BOOLEAN DEFAULT FALSE,

      -- Source tracking
      source TEXT NOT NULL,
      page TEXT,
      listing_id TEXT,
      listing_address TEXT,

      -- Lead management
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'showing', 'offer', 'closed', 'lost')),
      assigned_to UUID,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),

      -- Metadata
      user_agent TEXT,
      referrer TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      ip_address TEXT,

      -- Timestamps
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      last_contacted_at TIMESTAMPTZ,
      next_follow_up TIMESTAMPTZ
    );

    -- Lead notes/activity log
    CREATE TABLE IF NOT EXISTS lead_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      note TEXT NOT NULL,
      note_type TEXT DEFAULT 'note' CHECK(note_type IN ('note', 'call', 'email', 'meeting', 'showing', 'system')),
      created_by UUID,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Conversation history
    CREATE TABLE IF NOT EXISTS lead_conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK(role IN ('mascot', 'user')),
      content TEXT NOT NULL,
      quick_reply BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Admin users
    CREATE TABLE IF NOT EXISTS admin_users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'agent' CHECK(role IN ('admin', 'agent')),
      phone TEXT,
      avatar_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    );

    -- Sessions
    CREATE TABLE IF NOT EXISTS sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- User invitations
    CREATE TABLE IF NOT EXISTS user_invitations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      role TEXT DEFAULT 'agent',
      invited_by UUID REFERENCES admin_users(id),
      expires_at TIMESTAMPTZ NOT NULL,
      accepted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Lead assignments history
    CREATE TABLE IF NOT EXISTS lead_assignments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      assigned_to UUID NOT NULL REFERENCES admin_users(id),
      assigned_by UUID NOT NULL REFERENCES admin_users(id),
      assigned_at TIMESTAMPTZ DEFAULT NOW(),
      reason TEXT
    );

    -- Tasks
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
      assigned_to UUID NOT NULL REFERENCES admin_users(id),
      created_by UUID NOT NULL REFERENCES admin_users(id),
      due_date TIMESTAMPTZ,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Daily stats for analytics
    CREATE TABLE IF NOT EXISTS daily_stats (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      date DATE NOT NULL UNIQUE,
      new_leads INTEGER DEFAULT 0,
      qualified_leads INTEGER DEFAULT 0,
      closed_leads INTEGER DEFAULT 0,
      lost_leads INTEGER DEFAULT 0,
      by_source JSONB,
      by_agent JSONB,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Reminders
    CREATE TABLE IF NOT EXISTS reminders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES admin_users(id),
      remind_at TIMESTAMPTZ NOT NULL,
      message TEXT,
      is_sent BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Email templates
    CREATE TABLE IF NOT EXISTS email_templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT CHECK(category IN ('follow_up', 'showing', 'offer', 'closing', 'other')),
      created_by UUID REFERENCES admin_users(id),
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Settings key-value store
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_by UUID REFERENCES admin_users(id),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Notification preferences
    CREATE TABLE IF NOT EXISTS notification_preferences (
      user_id UUID PRIMARY KEY REFERENCES admin_users(id) ON DELETE CASCADE,
      new_lead_email BOOLEAN DEFAULT TRUE,
      new_lead_browser BOOLEAN DEFAULT TRUE,
      task_reminder_email BOOLEAN DEFAULT TRUE,
      lead_assigned_email BOOLEAN DEFAULT TRUE,
      daily_digest BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Audit log
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES admin_users(id),
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id UUID,
      old_values JSONB,
      new_values JSONB,
      ip_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Properties table for listings
    CREATE TABLE IF NOT EXISTS properties (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,

      -- Address
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL DEFAULT 'TX',
      zip TEXT NOT NULL,
      county TEXT,

      -- Pricing
      list_price INTEGER NOT NULL,
      original_price INTEGER,
      close_price INTEGER,
      close_date DATE,

      -- Property details
      beds INTEGER NOT NULL,
      baths INTEGER NOT NULL,
      half_baths INTEGER DEFAULT 0,
      sqft INTEGER,
      lot_size DECIMAL(10, 4),
      lot_size_unit TEXT DEFAULT 'acres',
      year_built INTEGER,
      stories INTEGER DEFAULT 1,
      property_type TEXT DEFAULT 'Single-Family',
      property_style TEXT,

      -- Garage
      garage_spaces INTEGER DEFAULT 0,
      garage_type TEXT,

      -- HOA
      hoa_fee DECIMAL(10, 2),
      hoa_frequency TEXT DEFAULT 'monthly',

      -- Taxes
      tax_amount DECIMAL(10, 2),
      tax_year INTEGER,
      tax_rate DECIMAL(5, 4),

      -- Status
      status TEXT DEFAULT 'sold' CHECK(status IN ('active', 'pending', 'sold', 'off_market')),

      -- Media
      image_url TEXT,
      images JSONB DEFAULT '[]',
      virtual_tour_url TEXT,

      -- Description
      headline TEXT,
      description TEXT,
      features JSONB DEFAULT '[]',

      -- Location
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      neighborhood TEXT,
      subdivision TEXT,
      school_district TEXT,
      schools JSONB DEFAULT '{}',

      -- MLS data
      mls_number TEXT,
      mls_board TEXT,
      days_on_market INTEGER,
      listing_agent TEXT,
      listing_agent_phone TEXT,
      listing_office TEXT,

      -- Metadata
      source TEXT DEFAULT 'manual',
      external_id TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- =============================================
    -- CLIENT PORTAL TABLES
    -- =============================================

    -- Client sessions (magic link auth)
    CREATE TABLE IF NOT EXISTS client_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      token_type TEXT NOT NULL CHECK(token_type IN ('magic_link', 'session')),
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Property favorites
    CREATE TABLE IF NOT EXISTS favorites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(lead_id, property_id)
    );

    -- Viewing requests
    CREATE TABLE IF NOT EXISTS viewing_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      preferred_date DATE,
      preferred_time TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'scheduled', 'completed', 'cancelled')),
      scheduled_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Transactions (active deals)
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      property_id UUID REFERENCES properties(id),
      transaction_type TEXT NOT NULL CHECK(transaction_type IN ('buying', 'selling')),
      property_address TEXT NOT NULL,
      offer_price INTEGER,
      accepted_price INTEGER,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'pending', 'closed', 'cancelled', 'fell_through')),
      current_milestone TEXT,
      contract_date DATE,
      option_period_ends DATE,
      inspection_date DATE,
      closing_date DATE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Transaction milestones
    CREATE TABLE IF NOT EXISTS transaction_milestones (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
      milestone_type TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date DATE,
      completed_at TIMESTAMPTZ,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'skipped')),
      notes TEXT,
      order_index INTEGER NOT NULL
    );

    -- Documents
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      transaction_id UUID REFERENCES transactions(id),
      name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      file_path TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('contract', 'disclosure', 'inspection', 'appraisal', 'title', 'insurance', 'financing', 'closing', 'other')),
      uploaded_by TEXT NOT NULL CHECK(uploaded_by IN ('client', 'agent')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Messages
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
      sender_type TEXT NOT NULL CHECK(sender_type IN ('client', 'agent', 'mascot')),
      content TEXT NOT NULL,
      attachments JSONB DEFAULT '[]',
      read_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_lead ON lead_conversations(lead_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON tasks(lead_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(remind_at) WHERE is_sent = FALSE;
    CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties(slug);
    CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
    CREATE INDEX IF NOT EXISTS idx_properties_close_date ON properties(close_date DESC);

    -- Portal indexes
    CREATE INDEX IF NOT EXISTS idx_client_sessions_lead ON client_sessions(lead_id);
    CREATE INDEX IF NOT EXISTS idx_client_sessions_token ON client_sessions(token);
    CREATE INDEX IF NOT EXISTS idx_client_sessions_expires ON client_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_favorites_lead ON favorites(lead_id);
    CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);
    CREATE INDEX IF NOT EXISTS idx_viewing_requests_lead ON viewing_requests(lead_id);
    CREATE INDEX IF NOT EXISTS idx_viewing_requests_status ON viewing_requests(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_lead ON transactions(lead_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transaction_milestones_transaction ON transaction_milestones(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_documents_lead ON documents(lead_id);
    CREATE INDEX IF NOT EXISTS idx_documents_transaction ON documents(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_messages_lead ON messages(lead_id);
    CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(lead_id) WHERE read_at IS NULL;
  `)

  console.log('Database schema initialized')
}

// Run initialization on module load
let initialized = false
export async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase()
    initialized = true
  }
}

export default pool
