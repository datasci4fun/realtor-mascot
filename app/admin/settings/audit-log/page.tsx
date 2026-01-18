'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AuditLogEntry {
  id: string
  userId: string | null
  userName?: string | null
  userEmail?: string | null
  action: string
  entityType: string
  entityId: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
}

const actionLabels: Record<string, string> = {
  create: 'Created',
  update: 'Updated',
  delete: 'Deleted',
  login: 'Logged in',
  logout: 'Logged out',
  assign: 'Assigned',
  unassign: 'Unassigned',
  status_change: 'Status changed',
  bulk_update: 'Bulk updated',
  bulk_delete: 'Bulk deleted',
  export: 'Exported',
  import: 'Imported',
}

const entityLabels: Record<string, string> = {
  lead: 'Lead',
  leads: 'Leads',
  user: 'User',
  task: 'Task',
  template: 'Template',
  setting: 'Setting',
  session: 'Session',
}

const actionColors: Record<string, string> = {
  create: 'bg-green-100 text-green-700',
  update: 'bg-blue-100 text-blue-700',
  delete: 'bg-red-100 text-red-700',
  login: 'bg-purple-100 text-purple-700',
  logout: 'bg-gray-100 text-gray-700',
  bulk_update: 'bg-blue-100 text-blue-700',
  bulk_delete: 'bg-red-100 text-red-700',
  assign: 'bg-yellow-100 text-yellow-700',
  status_change: 'bg-orange-100 text-orange-700',
  export: 'bg-indigo-100 text-indigo-700',
  import: 'bg-teal-100 text-teal-700',
}

export default function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    action: '',
    entityType: '',
    search: '',
    startDate: '',
    endDate: '',
  })
  const [filterOptions, setFilterOptions] = useState<{
    actions: string[]
    entityTypes: string[]
  }>({ actions: [], entityTypes: [] })

  const [page, setPage] = useState(1)
  const pageSize = 50

  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  useEffect(() => {
    // Fetch filter options
    const fetchFilters = async () => {
      try {
        const res = await fetch('/api/admin/audit-log?filters=true')
        if (res.ok) {
          const data = await res.json()
          setFilterOptions(data)
        }
      } catch {
        // Ignore errors
      }
    }
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchAuditLog()
  }, [page, filters])

  const fetchAuditLog = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      if (filters.action) params.set('action', filters.action)
      if (filters.entityType) params.set('entityType', filters.entityType)
      if (filters.search) params.set('search', filters.search)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      params.set('limit', pageSize.toString())
      params.set('offset', ((page - 1) * pageSize).toString())

      const res = await fetch(`/api/admin/audit-log?${params}`)

      if (res.status === 403) {
        setError('Admin access required to view audit log')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch audit log')
      }

      const data = await res.json()
      setEntries(data.entries)
      setTotal(data.total)
    } catch (err) {
      setError('Failed to load audit log')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-600 mt-1">Track all admin actions and changes</p>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/admin/settings"
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          General
        </Link>
        <Link
          href="/admin/settings/templates"
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          Email Templates
        </Link>
        <Link
          href="/admin/settings/audit-log"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          Audit Log
        </Link>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={filters.search}
            onChange={(e) => {
              setFilters({ ...filters, search: e.target.value })
              setPage(1)
            }}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={filters.action}
            onChange={(e) => {
              setFilters({ ...filters, action: e.target.value })
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Actions</option>
            {filterOptions.actions.map((action) => (
              <option key={action} value={action}>
                {actionLabels[action] || action}
              </option>
            ))}
          </select>

          <select
            value={filters.entityType}
            onChange={(e) => {
              setFilters({ ...filters, entityType: e.target.value })
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Entities</option>
            {filterOptions.entityTypes.map((type) => (
              <option key={type} value={type}>
                {entityLabels[type] || type}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters({ ...filters, startDate: e.target.value })
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Start date"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters({ ...filters, endDate: e.target.value })
              setPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="End date"
          />

          {(filters.action ||
            filters.entityType ||
            filters.search ||
            filters.startDate ||
            filters.endDate) && (
            <button
              onClick={() => {
                setFilters({
                  action: '',
                  entityType: '',
                  search: '',
                  startDate: '',
                  endDate: '',
                })
                setPage(1)
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading audit log...</p>
          </div>
        ) : entries.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <>
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm text-gray-900">{formatRelativeTime(entry.createdAt)}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.createdAt)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {entry.userName || entry.userEmail ? (
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {entry.userName || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500">{entry.userEmail}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              actionColors[entry.action] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {actionLabels[entry.action] || entry.action}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm text-gray-900">
                              {entityLabels[entry.entityType] || entry.entityType}
                            </p>
                            {entry.entityId && (
                              <p className="text-xs text-gray-500 font-mono">
                                {entry.entityId.substring(0, 8)}...
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {(entry.oldValues || entry.newValues) && (
                            <button
                              onClick={() =>
                                setExpandedEntry(expandedEntry === entry.id ? null : entry.id)
                              }
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              {expandedEntry === entry.id ? 'Hide' : 'View'}
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expandedEntry === entry.id ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </button>
                          )}
                          {entry.ipAddress && (
                            <p className="text-xs text-gray-400 mt-1">IP: {entry.ipAddress}</p>
                          )}
                        </td>
                      </tr>
                      {expandedEntry === entry.id && (entry.oldValues || entry.newValues) && (
                        <tr key={`${entry.id}-details`}>
                          <td colSpan={5} className="px-6 py-4 bg-gray-50">
                            <div className="grid md:grid-cols-2 gap-4">
                              {entry.oldValues && (
                                <div>
                                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                    Previous Values
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                    {JSON.stringify(entry.oldValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {entry.newValues && (
                                <div>
                                  <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
                                    New Values
                                  </h4>
                                  <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
                                    {JSON.stringify(entry.newValues, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total}{' '}
                entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No audit entries</h3>
            <p className="mt-2 text-gray-500">
              {filters.action || filters.entityType || filters.search
                ? 'No entries match your filters.'
                : 'Actions will be logged here as they occur.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
