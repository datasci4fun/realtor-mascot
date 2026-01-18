'use client'

import { useState } from 'react'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: {
    status?: string
    source?: string
    search?: string
    assignedTo?: string
  }
  totalCount: number
}

const availableFields = [
  { key: 'name', label: 'Name', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'phone', label: 'Phone', default: true },
  { key: 'intent', label: 'Intent', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'source', label: 'Source', default: true },
  { key: 'timeline', label: 'Timeline', default: false },
  { key: 'budget', label: 'Budget', default: false },
  { key: 'priority', label: 'Priority', default: false },
  { key: 'assignedToName', label: 'Assigned To', default: false },
  { key: 'message', label: 'Message', default: false },
  { key: 'createdAt', label: 'Created Date', default: true },
  { key: 'updatedAt', label: 'Last Updated', default: false },
]

export default function ExportModal({
  isOpen,
  onClose,
  currentFilters,
  totalCount,
}: ExportModalProps) {
  const [selectedFields, setSelectedFields] = useState<string[]>(
    availableFields.filter((f) => f.default).map((f) => f.key)
  )
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  })
  const [isExporting, setIsExporting] = useState(false)

  if (!isOpen) return null

  const toggleField = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    )
  }

  const selectAll = () => {
    setSelectedFields(availableFields.map((f) => f.key))
  }

  const selectNone = () => {
    setSelectedFields([])
  }

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      alert('Please select at least one field to export')
      return
    }

    setIsExporting(true)

    try {
      // Build query params
      const params = new URLSearchParams()
      params.set('export', 'true')
      params.set('fields', selectedFields.join(','))

      if (currentFilters.status) params.set('status', currentFilters.status)
      if (currentFilters.source) params.set('source', currentFilters.source)
      if (currentFilters.search) params.set('search', currentFilters.search)
      if (currentFilters.assignedTo) params.set('assignedTo', currentFilters.assignedTo)
      if (dateRange.start) params.set('startDate', dateRange.start)
      if (dateRange.end) params.set('endDate', dateRange.end)

      const res = await fetch(`/api/leads/export?${params.toString()}`)

      if (!res.ok) {
        throw new Error('Export failed')
      }

      // Get the CSV content
      const blob = await res.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      onClose()
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export leads. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Export Leads</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
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

          {/* Current Filters Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Exporting <span className="font-semibold">{totalCount}</span> leads based on current
              filters.
            </p>
            {(currentFilters.status ||
              currentFilters.source ||
              currentFilters.search ||
              currentFilters.assignedTo) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {currentFilters.status && (
                  <span className="px-2 py-1 bg-white rounded text-xs">
                    Status: {currentFilters.status}
                  </span>
                )}
                {currentFilters.source && (
                  <span className="px-2 py-1 bg-white rounded text-xs">
                    Source: {currentFilters.source}
                  </span>
                )}
                {currentFilters.assignedTo && (
                  <span className="px-2 py-1 bg-white rounded text-xs">Filtered by agent</span>
                )}
                {currentFilters.search && (
                  <span className="px-2 py-1 bg-white rounded text-xs">
                    Search: "{currentFilters.search}"
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range (optional)
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Field Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Fields to Export</label>
              <div className="flex gap-2">
                <button onClick={selectAll} className="text-xs text-blue-600 hover:text-blue-700">
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button onClick={selectNone} className="text-xs text-blue-600 hover:text-blue-700">
                  Select None
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
              {availableFields.map((field) => (
                <label key={field.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFields.includes(field.key)}
                    onChange={() => toggleField(field.key)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || selectedFields.length === 0}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
