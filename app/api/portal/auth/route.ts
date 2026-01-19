import { NextResponse } from 'next/server'
import { getPortalClient, logoutPortalClient } from '@/lib/portal-auth'

// GET - Check if authenticated and return client info
export async function GET() {
  try {
    const client = await getPortalClient()

    if (!client) {
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        intent: client.intent,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    await logoutPortalClient()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    )
  }
}
