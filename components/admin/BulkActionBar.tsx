'use client'

import { useState } from 'react'

interface BulkActionBarProps {
  selectedCount: number
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  onDelete: () => void
  onClearSelection: () => void
  isAdmin?: boolean
}

export default function BulkActionBar({
  selectedCount,
  onStatusChange,
  onPriorityChange,
  onDelete,
  onClearSelection,
  isAdmin = false,
}: BulkActionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (selectedCount === 0) {
    return null
  }

  return (
    <>
      <div className="bg-gray-900 text-white p-4 rounded-xl shadow-lg mb-6 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <span className="font-medium">
            {selectedCount} lead{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear selection
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Status dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onStatusChange(e.target.value)
                  e.target.value = ''
                }
              }}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-gray-500 focus:outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Change status...
              </option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="showing">Showing</option>
              <option value="offer">Offer</option>
              <option value="closed">Closed</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          {/* Priority dropdown */}
          <div className="relative">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  onPriorityChange(e.target.value)
                  e.target.value = ''
                }
              }}
              className="bg-gray-800 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-gray-500 focus:outline-none cursor-pointer"
              defaultValue=""
            >
              <option value="" disabled>
                Change priority...
              </option>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Delete button (admin only) */}
          {isAdmin && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete {selectedCount} lead{selectedCount !== 1 ? 's' : ''}?
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All data associated with these
                  leads will be permanently deleted.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  onDelete()
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Delete leads
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
