import { NextResponse } from 'next/server'
import { query, ensureInitialized } from '@/lib/db'
import { getPortalClient } from '@/lib/portal-auth'

export async function GET() {
  try {
    const client = await getPortalClient()
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureInitialized()

    const result = await query(
      `SELECT * FROM messages
       WHERE lead_id = $1
       ORDER BY created_at ASC`,
      [client.id]
    )

    return NextResponse.json({ messages: result.rows })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await getPortalClient()
    if (!client) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, attachments } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    await ensureInitialized()

    const result = await query(
      `INSERT INTO messages (lead_id, sender_type, content, attachments)
       VALUES ($1, 'client', $2, $3)
       RETURNING *`,
      [client.id, content.trim(), JSON.stringify(attachments || [])]
    )

    const message = result.rows[0]

    // TODO: Send notification to agent (email, push, etc.)
    console.log(`New message from client ${client.id}: ${content.substring(0, 50)}...`)

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
