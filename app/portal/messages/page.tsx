import { redirect } from 'next/navigation'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import { getSiteSettings } from '@/lib/site-settings'
import type { Message } from '@/types/portal'
import MessagesClient from './MessagesClient'

async function getMessages(leadId: string): Promise<Message[]> {
  await ensureInitialized()

  // Mark messages as read
  await query(
    `UPDATE messages SET read_at = NOW()
     WHERE lead_id = $1 AND sender_type != 'client' AND read_at IS NULL`,
    [leadId]
  )

  const result = await query(
    `SELECT * FROM messages
     WHERE lead_id = $1
     ORDER BY created_at ASC`,
    [leadId]
  )

  return result.rows.map((row) => ({
    ...row,
    attachments: row.attachments || [],
  })) as Message[]
}

export default async function MessagesPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const messages = await getMessages(client.id)
  const settings = await getSiteSettings()

  return <MessagesClient messages={messages} clientId={client.id} clientName={client.name} realtorName={settings.realtor_name} />
}
