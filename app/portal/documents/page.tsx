import { redirect } from 'next/navigation'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import type { Document, Transaction } from '@/types/portal'
import DocumentsClient from './DocumentsClient'

async function getDocuments(leadId: string): Promise<Document[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT * FROM documents
     WHERE lead_id = $1
     ORDER BY created_at DESC`,
    [leadId]
  )

  return result.rows as Document[]
}

async function getTransactions(leadId: string): Promise<Transaction[]> {
  await ensureInitialized()

  const result = await query(
    `SELECT * FROM transactions
     WHERE lead_id = $1
     ORDER BY created_at DESC`,
    [leadId]
  )

  return result.rows as Transaction[]
}

export default async function DocumentsPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const [documents, transactions] = await Promise.all([
    getDocuments(client.id),
    getTransactions(client.id),
  ])

  return <DocumentsClient documents={documents} transactions={transactions} />
}
