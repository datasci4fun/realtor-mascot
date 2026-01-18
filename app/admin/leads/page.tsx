'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lead, LeadStatus, LeadSource } from '@/types/lead'

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    source: '',
    search: '',
  })

  useEffect(() => {
    fetchLeads()
  }, [filters])

  const fetchLeads = async () => {
    setIsLoading(true)

    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.source) params.set('source', filters.source)
    if (filters.search) params.set('search', filters.search)

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Leads</h1>
        <p className="text-gray-600 mt-1">{total} total leads</p>
      </div>

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
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className={`font-medium text-gray-900 ${priorityColors[lead.priority || 'normal']}`}>
                        {lead.priority === 'urgent' && '!! '}
                        {lead.priority === 'high' && '! '}
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
