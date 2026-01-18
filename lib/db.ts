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
