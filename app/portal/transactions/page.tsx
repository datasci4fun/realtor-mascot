import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import type { Transaction, TransactionMilestone } from '@/types/portal'

async function getTransactions(leadId: string): Promise<(Transaction & { milestones: TransactionMilestone[] })[]> {
  await ensureInitialized()

  const txResult = await query(
    `SELECT * FROM transactions
     WHERE lead_id = $1
     ORDER BY
       CASE status
         WHEN 'active' THEN 1
         WHEN 'pending' THEN 2
         WHEN 'closed' THEN 3
         ELSE 4
       END,
       created_at DESC`,
    [leadId]
  )

  const transactions = txResult.rows

  // Get milestones for all transactions
  if (transactions.length > 0) {
    const txIds = transactions.map((t) => t.id)
    const milestonesResult = await query(
      `SELECT * FROM transaction_milestones
       WHERE transaction_id = ANY($1)
       ORDER BY order_index ASC`,
      [txIds]
    )

    const milestonesByTx: Record<string, TransactionMilestone[]> = {}
    for (const m of milestonesResult.rows as TransactionMilestone[]) {
      if (!milestonesByTx[m.transaction_id]) {
        milestonesByTx[m.transaction_id] = []
      }
      milestonesByTx[m.transaction_id].push(m)
    }

    return transactions.map((tx) => ({
      ...tx,
      milestones: milestonesByTx[tx.id] || [],
    })) as (Transaction & { milestones: TransactionMilestone[] })[]
  }

  return []
}

function formatPrice(price: number | null): string {
  if (!price) return 'TBD'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string | null): string {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-500',
  fell_through: 'bg-red-100 text-red-800',
}

const milestoneStatusIcons: Record<string, React.ReactNode> = {
  completed: (
    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ),
  in_progress: (
    <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-white"></div>
    </div>
  ),
  pending: (
    <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-gray-300"></div>
  ),
  skipped: (
    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    </div>
  ),
}

export default async function TransactionsPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const transactions = await getTransactions(client.id)

  const activeTransactions = transactions.filter((t) => t.status === 'active' || t.status === 'pending')
  const closedTransactions = transactions.filter((t) => t.status !== 'active' && t.status !== 'pending')

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Your Transactions
        </h1>
        <p className="text-gray-600 mt-1">
          Track the progress of your home buying or selling journey
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No active transactions</h3>
          <p className="text-gray-500 mb-6">
            When you&apos;re under contract on a property, you&apos;ll be able to track every step of the process here
          </p>
          <Link
            href="/portal/search"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Start Your Search
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Transactions */}
          {activeTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Deals</h2>
              <div className="space-y-6">
                {activeTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    {/* Transaction Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              tx.transaction_type === 'buying' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {tx.transaction_type === 'buying' ? 'Buying' : 'Selling'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[tx.status]}`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">{tx.property_address}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(tx.accepted_price || tx.offer_price)}
                          </p>
                          {tx.closing_date && (
                            <p className="text-sm text-gray-500">
                              Closing: {formatDate(tx.closing_date)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Key Dates */}
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Contract Date</p>
                          <p className="font-medium">{formatDate(tx.contract_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Option Period Ends</p>
                          <p className="font-medium">{formatDate(tx.option_period_ends)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Inspection</p>
                          <p className="font-medium">{formatDate(tx.inspection_date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Closing</p>
                          <p className="font-medium">{formatDate(tx.closing_date)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Milestones Timeline */}
                    {tx.milestones.length > 0 && (
                      <div className="p-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-4">Progress</h4>
                        <div className="space-y-4">
                          {tx.milestones.map((milestone, idx) => (
                            <div key={milestone.id} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                {milestoneStatusIcons[milestone.status]}
                                {idx < tx.milestones.length - 1 && (
                                  <div className={`w-0.5 h-8 mt-1 ${
                                    milestone.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                                  }`}></div>
                                )}
                              </div>
                              <div className="flex-1 pb-2">
                                <p className={`font-medium ${
                                  milestone.status === 'completed'
                                    ? 'text-gray-900'
                                    : milestone.status === 'in_progress'
                                    ? 'text-primary-600'
                                    : 'text-gray-500'
                                }`}>
                                  {milestone.title}
                                </p>
                                {milestone.due_date && milestone.status !== 'completed' && (
                                  <p className="text-sm text-gray-500">Due: {formatDate(milestone.due_date)}</p>
                                )}
                                {milestone.completed_at && (
                                  <p className="text-sm text-green-600">
                                    Completed {formatDate(milestone.completed_at.toString())}
                                  </p>
                                )}
                                {milestone.notes && (
                                  <p className="text-sm text-gray-500 mt-1">{milestone.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closed Transactions */}
          {closedTransactions.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Transactions</h2>
              <div className="space-y-4">
                {closedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            tx.transaction_type === 'buying' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {tx.transaction_type === 'buying' ? 'Bought' : 'Sold'}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[tx.status]}`}>
                            {tx.status === 'closed' ? 'Closed' : tx.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900">{tx.property_address}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                          {formatPrice(tx.accepted_price || tx.offer_price)}
                        </p>
                        {tx.closing_date && (
                          <p className="text-sm text-gray-500">
                            {tx.status === 'closed' ? 'Closed' : 'Was scheduled'}: {formatDate(tx.closing_date)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
