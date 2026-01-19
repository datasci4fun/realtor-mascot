import { NextResponse } from 'next/server'
import { getSiteSettings } from '@/lib/site-settings'

// Public endpoint - no auth required
// Returns site settings for client-side rendering
export async function GET() {
  try {
    const settings = await getSiteSettings()

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching public settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
