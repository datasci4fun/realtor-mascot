import { Pool, QueryResult } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/realtor_leads',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
})

// Helper for running queries
export async function query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
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
      assigned_to TEXT,
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
      created_by TEXT,
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

    -- Create indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);
    CREATE INDEX IF NOT EXISTS idx_lead_notes_lead ON lead_notes(lead_id);
    CREATE INDEX IF NOT EXISTS idx_conversations_lead ON lead_conversations(lead_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
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
