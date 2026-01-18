'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BackupStats {
  statistics: {
    leads: number
    notes: number
    conversations: number
    tasks: number
    templates: number
    users: number
  }
  estimatedSize: string
}

export default function BackupsPage() {
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/backups', {
        method: 'POST',
      })

      if (res.status === 403) {
        setError('Admin access required')
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch backup stats')
      }

      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load backup statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async (format: 'json' | 'sql') => {
    setIsDownloading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/backups?format=${format}`)

      if (res.status === 403) {
        throw new Error('Admin access required')
      }

      if (!res.ok) {
        throw new Error('Failed to create backup')
      }

      // Get the blob and download it
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url

      // Get filename from content-disposition header or use default
      const contentDisposition = res.headers.get('Content-Disposition')
      let filename = `backup-${new Date().toISOString().split('T')[0]}.${format}`
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match) filename = match[1]
      }

      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess(`Backup downloaded successfully (${filename})`)
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Data Backup</h1>
        <p className="text-gray-600 mt-1">Download a backup of your data</p>
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
          className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50"
        >
          Audit Log
        </Link>
        <Link
          href="/admin/settings/backups"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium"
        >
          Backups
        </Link>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      {success && <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-lg">{success}</div>}

      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Loading backup information...</p>
        </div>
      ) : stats ? (
        <div className="space-y-6">
          {/* Backup Summary */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Backup Summary</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Leads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.leads}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.notes}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Conversations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.conversations}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.tasks}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.templates}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statistics.users}</p>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Estimated backup size: <span className="font-medium">{stats.estimatedSize}</span>
            </p>
          </div>

          {/* Download Options */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Download Backup</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">JSON Format</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Complete backup with all data in JSON format. Best for data portability and
                      programmatic access.
                    </p>
                    <button
                      onClick={() => handleDownload('json')}
                      disabled={isDownloading}
                      className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isDownloading ? 'Downloading...' : 'Download JSON'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">SQL Format</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      SQL INSERT statements for leads and tasks. Best for database restoration.
                    </p>
                    <button
                      onClick={() => handleDownload('sql')}
                      disabled={isDownloading}
                      className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isDownloading ? 'Downloading...' : 'Download SQL'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Backup Info */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800">Backup Recommendations</h4>
                <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                  <li>- Download backups regularly (weekly recommended)</li>
                  <li>- Store backups in a secure location</li>
                  <li>- Test backup restoration periodically</li>
                  <li>- Keep multiple backup copies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
