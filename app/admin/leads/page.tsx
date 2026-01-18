'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Lead, LeadStatus, LeadSource } from '@/types/lead'
import Pagination from '@/components/admin/Pagination'
import BulkActionBar from '@/components/admin/BulkActionBar'

type SortField = 'name' | 'email' | 'status' | 'priority' | 'source' | 'created_at'
type SortOrder = 'asc' | 'desc'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set())
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
  })
  const [sort, setSort] = useState<{ field: SortField; order: SortOrder }>({
    field: 'created_at',
    order: 'desc',
  })

  const fetchLeads = useCallback(async () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.source) params.set('source', filters.source)
    if (filters.search) params.set('search', filters.search)
    params.set('limit', pagination.pageSize.toString())
    params.set('offset', ((pagination.page - 1) * pagination.pageSize).toString())
    params.set('sortBy', sort.field)
    params.set('sortOrder', sort.order)

    try {
      const res = await fetch(`/api/leads?${params}`)

      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      const data = await res.json()
      setLeads(data.leads || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters, pagination, sort])

  // Fetch user role on mount
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/admin/auth')
        const data = await res.json()
        setIsAdmin(data.user?.role === 'admin')
      } catch {
        // Ignore errors
      }
    }
    checkRole()
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }))
  }, [filters])

  // Clear selection when page changes
  useEffect(() => {
    setSelectedLeads(new Set())
  }, [pagination.page, filters, sort])

  const handleSort = (field: SortField) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'desc' ? 'asc' : 'desc',
    }))
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeads(new Set(leads.map((l) => l.id!)))
    } else {
      setSelectedLeads(new Set())
    }
  }

  const handleSelectLead = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedLeads)
    if (checked) {
      newSelection.add(id)
    } else {
      newSelection.delete(id)
    }
    setSelectedLeads(newSelection)
  }

  const handleBulkStatusChange = async (status: string) => {
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads), updates: { status } }),
      })

      if (res.ok) {
        setSelectedLeads(new Set())
        fetchLeads()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const handleBulkPriorityChange = async (priority: string) => {
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads), updates: { priority } }),
      })

      if (res.ok) {
        setSelectedLeads(new Set())
        fetchLeads()
      }
    } catch (error) {
      console.error('Bulk update failed:', error)
    }
  }

  const handleBulkDelete = async () => {
    try {
      const res = await fetch('/api/leads/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeads) }),
      })

      if (res.ok) {
        setSelectedLeads(new Set())
        fetchLeads()
      }
    } catch (error) {
      console.error('Bulk delete failed:', error)
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sort.field !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sort.order === 'asc' ? (
      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-700',
    contacted: 'bg-yellow-100 text-yellow-700',
    qualified: 'bg-purple-100 text-purple-700',
    showing: 'bg-indigo-100 text-indigo-700',
    offer: 'bg-orange-100 text-orange-700',
    closed: 'bg-green-100 text-green-700',
    lost: 'bg-gray-100 text-gray-700',
  }

  const priorityColors: Record<string, string> = {
    low: 'text-gray-400',
    normal: 'text-gray-600',
    high: 'text-orange-500',
    urgent: 'text-red-500',
  }

  const totalPages = Math.ceil(total / pagination.pageSize)
  const allSelected = leads.length > 0 && leads.every((l) => selectedLeads.has(l.id!))
  const someSelected = leads.some((l) => selectedLeads.has(l.id!))

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
        <p className="text-gray-600 mt-1">{total} total leads</p>
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedLeads.size}
        onStatusChange={handleBulkStatusChange}
        onPriorityChange={handleBulkPriorityChange}
        onDelete={handleBulkDelete}
        onClearSelection={() => setSelectedLeads(new Set())}
        isAdmin={isAdmin}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="showing">Showing</option>
            <option value="offer">Offer</option>
            <option value="closed">Closed</option>
            <option value="lost">Lost</option>
          </select>

          <select
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">All Sources</option>
            <option value="mascot_chat">Mascot Chat</option>
            <option value="contact_form">Contact Form</option>
            <option value="listing_inquiry">Listing Inquiry</option>
            <option value="home_valuation">Home Valuation</option>
            <option value="newsletter">Newsletter</option>
          </select>

          {(filters.status || filters.source || filters.search) && (
            <button
              onClick={() => setFilters({ status: '', source: '', search: '' })}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Loading leads...</p>
          </div>
        ) : leads.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        ref={(el) => {
                          if (el) el.indeterminate = someSelected && !allSelected
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                      />
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Contact
                        <SortIcon field="name" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('source')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Source
                        <SortIcon field="source" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Intent
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Status
                        <SortIcon field="status" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('priority')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Priority
                        <SortIcon field="priority" />
                      </div>
                    </th>
                    <th
                      onClick={() => handleSort('created_at')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <SortIcon field="created_at" />
                      </div>
                    </th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className={`hover:bg-gray-50 ${selectedLeads.has(lead.id!) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.has(lead.id!)}
                          onChange={(e) => handleSelectLead(lead.id!, e.target.checked)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.priority === 'urgent' && <span className="text-red-500">!! </span>}
                            {lead.priority === 'high' && <span className="text-orange-500">! </span>}
                            {lead.name || 'No name'}
                          </p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                          {lead.phone && (
                            <p className="text-sm text-gray-400">{lead.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {(lead.source || '').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">
                          {(lead.intent || '-').replace(/_/g, ' ')}
                        </span>
                        {lead.budget && (
                          <p className="text-xs text-gray-400">{lead.budget}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[lead.status || 'new']}`}>
                          {lead.status || 'new'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium capitalize ${priorityColors[lead.priority || 'normal']}`}>
                          {lead.priority || 'normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(lead.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={pagination.page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={pagination.pageSize}
              onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
              onPageSizeChange={(pageSize) => setPagination({ page: 1, pageSize })}
            />
          </>
        ) : (
          <div className="p-12 text-center">
            <p className="text-gray-500">No leads found</p>
            {(filters.status || filters.source || filters.search) && (
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your filters
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
