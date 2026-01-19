import { getPortalClient } from '@/lib/portal-auth'
import PortalLayoutClient from '@/components/portal/PortalLayoutClient'
import { query, ensureInitialized } from '@/lib/db'

async function getUnreadMessageCount(leadId: string): Promise<number> {
  try {
    await ensureInitialized()
    const result = await query(
      `SELECT COUNT(*) as count FROM messages WHERE lead_id = $1 AND sender_type != 'client' AND read_at IS NULL`,
      [leadId]
    )
    return parseInt(result.rows[0]?.count || '0')
  } catch {
    return 0
  }
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const client = await getPortalClient()

  // Get unread message count if client is logged in
  let unreadMessages = 0
  if (client) {
    unreadMessages = await getUnreadMessageCount(client.id)
  }

  return (
    <PortalLayoutClient client={client} unreadMessages={unreadMessages}>
      {children}
    </PortalLayoutClient>
  )
}
