import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getLeads, getLeadStats } from '@/lib/leads'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/admin/login')
  }

  const stats = await getLeadStats()
  const { leads: recentLeads } = await getLeads({ limit: 5 })

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    showing: 'bg-indigo-100 text-indigo-700',
    offer: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
    lost: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user.name || user.email}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">Total Leads</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">This Week</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisWeek}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">This Month</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.thisMonth}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-500 uppercase tracking-wide">New Leads</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.byStatus?.new || 0}</p>
        </div>
      </div>

      {/* Stats Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* By Status */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Status</h2>
          <div className="space-y-3">
            {Object.entries(stats.byStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100'}`}>
                    {status}
                  </span>
                </div>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.byStatus || {}).length === 0 && (
              <p className="text-gray-500 text-sm">No leads yet</p>
            )}
          </div>
        </div>

        {/* By Source */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Leads by Source</h2>
          <div className="space-y-3">
            {Object.entries(stats.bySource || {}).map(([source, count]) => (
              <div key={source} className="flex items-center justify-between">
                <span className="text-gray-600 capitalize">{source.replace(/_/g, ' ')}</span>
                <span className="font-medium text-gray-900">{count}</span>
              </div>
            ))}
            {Object.keys(stats.bySource || {}).length === 0 && (
              <p className="text-gray-500 text-sm">No leads yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          <Link href="/admin/leads" className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </Link>
        </div>

        {recentLeads.length > 0 ? (
          <div className="divide-y">
            {recentLeads.map((lead) => (
              <Link
                key={lead.id}
                href={`/admin/leads/${lead.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {lead.name || 'No name'}
                    </p>
                    <p className="text-sm text-gray-500">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[lead.status || 'new']}`}>
                      {lead.status || 'new'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(lead.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">No leads yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Leads from your website will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
