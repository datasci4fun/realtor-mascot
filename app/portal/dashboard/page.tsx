import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPortalClient } from '@/lib/portal-auth'
import { query, ensureInitialized } from '@/lib/db'
import { getSiteSettings } from '@/lib/site-settings'
import type { PortalDashboardStats } from '@/types/portal'

async function getDashboardStats(leadId: string): Promise<PortalDashboardStats> {
  await ensureInitialized()

  // Run all queries in parallel
  const [favorites, transactions, viewings, messages] = await Promise.all([
    query('SELECT COUNT(*) as count FROM favorites WHERE lead_id = $1', [leadId]),
    query(`SELECT COUNT(*) as count FROM transactions WHERE lead_id = $1 AND status IN ('active', 'pending')`, [leadId]),
    query(`SELECT COUNT(*) as count FROM viewing_requests WHERE lead_id = $1 AND status = 'pending'`, [leadId]),
    query(`SELECT COUNT(*) as count FROM messages WHERE lead_id = $1 AND sender_type != 'client' AND read_at IS NULL`, [leadId]),
  ])

  return {
    favorites_count: parseInt(favorites.rows[0]?.count || '0'),
    active_transactions: parseInt(transactions.rows[0]?.count || '0'),
    pending_viewings: parseInt(viewings.rows[0]?.count || '0'),
    unread_messages: parseInt(messages.rows[0]?.count || '0'),
  }
}

export default async function PortalDashboardPage() {
  const client = await getPortalClient()

  if (!client) {
    redirect('/portal/login')
  }

  const stats = await getDashboardStats(client.id)
  const settings = await getSiteSettings()

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Welcome{client.name ? `, ${client.name.split(' ')[0]}` : ''}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your real estate journey and stay connected with {settings.realtor_name}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/portal/favorites"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.favorites_count}</p>
              <p className="text-sm text-gray-500">Favorites</p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/transactions"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.active_transactions}</p>
              <p className="text-sm text-gray-500">Active Deals</p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/viewings"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.pending_viewings}</p>
              <p className="text-sm text-gray-500">Pending Viewings</p>
            </div>
          </div>
        </Link>

        <Link
          href="/portal/messages"
          className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{stats.unread_messages}</p>
              <p className="text-sm text-gray-500">Unread Messages</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Getting Started */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h2>
          <div className="space-y-4">
            <Link
              href="/portal/search"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Browse Properties</p>
                <p className="text-sm text-gray-500">Search for your dream home</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/portal/messages"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">Send a Message</p>
                <p className="text-sm text-gray-500">Chat directly with {settings.realtor_name}</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <Link
              href="/portal/documents"
              className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-900">View Documents</p>
                <p className="text-sm text-gray-500">Access your contracts and files</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-sm p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Your Agent</h2>
          <div className="flex items-start">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
              {settings.realtor_name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div className="ml-4">
              <p className="text-xl font-semibold">{settings.realtor_name}</p>
              {settings.realtor_title && <p className="text-primary-100 text-sm">{settings.realtor_title}</p>}
              <p className="text-primary-100 text-sm">{settings.brokerage_name}</p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <a
              href={`tel:${settings.realtor_phone.replace(/[^0-9]/g, '')}`}
              className="flex items-center text-white hover:text-primary-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {settings.realtor_phone}
            </a>
            <Link
              href="/portal/messages"
              className="flex items-center text-white hover:text-primary-100 transition-colors"
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Send a message
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
