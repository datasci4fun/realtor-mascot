import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { query, ensureInitialized } from '@/lib/db'
import { getSiteSettings, updateSiteSettings, clearSettingsCache } from '@/lib/site-settings'

// Verify admin session
async function verifyAdmin(): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('admin_session')?.value

  if (!sessionId) return null

  await ensureInitialized()

  const result = await query(
    `SELECT u.id, u.role FROM sessions s
     JOIN admin_users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  )

  return result.rows[0] as { id: string; role: string } || null
}

export async function GET() {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await getSiteSettings()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()

    const result = await updateSiteSettings(updates, admin.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    // Get updated settings
    clearSettingsCache()
    const settings = await getSiteSettings()

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
