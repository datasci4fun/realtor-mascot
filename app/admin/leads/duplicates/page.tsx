'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Lead } from '@/types/lead'

interface DuplicateGroup {
  key: string
  matchType: 'email' | 'phone' | 'both'
  leads: Lead[]
}

export default function DuplicatesPage() {
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Merge state
  const [mergingGroup, setMergingGroup] = useState<DuplicateGroup | null>(null)
  const [selectedPrimary, setSelectedPrimary] = useState<string | null>(null)
  const [isMerging, setIsMerging] = useState(false)

  useEffect(() => {
    fetchDuplicates()
  }, [])

  const fetchDuplicates = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch('/api/leads/duplicates')

      if (!res.ok) {
        throw new Error('Failed to fetch duplicates')
      }

      const data = await res.json()
      setDuplicates(data.duplicates)
    } catch (err) {
      setError('Failed to load duplicates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMerge = async () => {
    if (!mergingGroup || !selectedPrimary) return

    const secondaryIds = mergingGroup.leads
      .filter((l) => l.id !== selectedPrimary)
      .map((l) => l.id!)

    setIsMerging(true)
    setError('')

    try {
      const res = await fetch('/api/leads/duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          primaryId: selectedPrimary,
          secondaryIds,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to merge leads')
      }

      setSuccess(`Successfully merged ${secondaryIds.length + 1} leads into one`)
      setTimeout(() => setSuccess(''), 5000)

      // Refresh duplicates list
      fetchDuplicates()
      setMergingGroup(null)
      setSelectedPrimary(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsMerging(false)
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

  const matchTypeLabels: Record<string, string> = {
    email: 'Same Email',
    phone: 'Same Phone',
    both: 'Same Email & Phone',
  }

  const matchTypeColors: Record<string, string> = {
    email: 'bg-blue-100 text-blue-700',
    phone: 'bg-purple-100 text-purple-700',
    both: 'bg-red-100 text-red-700',
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
      <div className="mb-8">
        <Link
          href="/admin/leads"
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Leads
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Duplicate Detection</h1>
        <p className="text-gray-600 mt-1">
          Find and merge duplicate leads based on matching email or phone
        </p>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      {success && <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Scanning for duplicates...</p>
        </div>
      ) : duplicates.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Duplicates Found</h3>
          <p className="mt-2 text-gray-500">Your lead database is clean with no duplicate entries.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="font-medium text-yellow-800">
                Found {duplicates.length} potential duplicate{duplicates.length !== 1 ? ' groups' : ''}
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Review each group and merge duplicates to keep your database clean.
              </p>
            </div>
          </div>

          {duplicates.map((group, index) => (
            <div key={group.key} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">
                    Duplicate Group #{index + 1}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${matchTypeColors[group.matchType]}`}
                  >
                    {matchTypeLabels[group.matchType]}
                  </span>
                  <span className="text-sm text-gray-500">
                    {group.leads.length} leads
                  </span>
                </div>
                <button
                  onClick={() => {
                    setMergingGroup(group)
                    setSelectedPrimary(group.leads[0].id || null)
                  }}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
                >
                  Merge
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Intent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {group.leads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{lead.name || 'No name'}</p>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{lead.phone || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 capitalize">
                          {lead.intent || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${statusColors[lead.status || 'new']}`}
                          >
                            {lead.status || 'new'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(lead.timestamp).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/admin/leads/${lead.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Merge Modal */}
      {mergingGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Merge Duplicate Leads</h2>
                <button
                  onClick={() => {
                    setMergingGroup(null)
                    setSelectedPrimary(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select which lead to keep as the primary record. Notes, conversations, and tasks
                  from all other leads will be merged into the primary lead.
                </p>

                <div className="space-y-3">
                  {mergingGroup.leads.map((lead) => (
                    <label
                      key={lead.id}
                      className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPrimary === lead.id
                          ? 'border-gray-900 bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="primary"
                        checked={selectedPrimary === lead.id}
                        onChange={() => setSelectedPrimary(lead.id || null)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {lead.name || 'No name'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${statusColors[lead.status || 'new']}`}
                          >
                            {lead.status || 'new'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{lead.email}</p>
                        {lead.phone && (
                          <p className="text-sm text-gray-500">{lead.phone}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Created: {new Date(lead.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-yellow-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Warning: This action cannot be undone</p>
                    <p className="mt-1">
                      {mergingGroup.leads.length - 1} lead
                      {mergingGroup.leads.length - 1 !== 1 ? 's' : ''} will be deleted after merging.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setMergingGroup(null)
                    setSelectedPrimary(null)
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMerge}
                  disabled={isMerging || !selectedPrimary}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                >
                  {isMerging ? 'Merging...' : 'Merge Leads'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
