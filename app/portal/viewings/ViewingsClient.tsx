'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ViewingRequest, Property } from '@/types/portal'

interface ViewingsClientProps {
  viewings: (ViewingRequest & { property?: Property })[]
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price)
}

function formatDate(date: string | Date | null): string {
  if (!date) return 'TBD'
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(time: string | null): string {
  if (!time) return ''
  return time
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-green-100 text-green-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

const statusLabels = {
  pending: 'Pending Confirmation',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function ViewingsClient({ viewings }: ViewingsClientProps) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  const upcomingViewings = viewings.filter(
    (v) => v.status === 'pending' || v.status === 'scheduled'
  )
  const pastViewings = viewings.filter(
    (v) => v.status === 'completed' || v.status === 'cancelled'
  )

  const displayedViewings = activeTab === 'upcoming' ? upcomingViewings : pastViewings

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Property Viewings
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your scheduled property tours
          </p>
        </div>
        <Link
          href="/portal/search"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Request New Viewing
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Upcoming ({upcomingViewings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'past'
              ? 'bg-primary-100 text-primary-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Past ({pastViewings.length})
        </button>
      </div>

      {/* Viewings List */}
      {displayedViewings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming viewings' : 'No past viewings'}
          </h3>
          <p className="text-gray-500 mb-6">
            {activeTab === 'upcoming'
              ? 'Browse properties and schedule a tour to see them in person'
              : 'Your completed viewings will appear here'}
          </p>
          {activeTab === 'upcoming' && (
            <Link
              href="/portal/search"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Properties
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedViewings.map((viewing) => (
            <div
              key={viewing.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                {viewing.property && (
                  <div className="md:w-48 h-32 md:h-auto bg-gray-200 flex-shrink-0">
                    {viewing.property.image_url ? (
                      <img
                        src={viewing.property.image_url}
                        alt={viewing.property.address}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      {viewing.property ? (
                        <>
                          <h3 className="font-semibold text-gray-900">
                            {viewing.property.address}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {viewing.property.city}, {viewing.property.state} {viewing.property.zip}
                          </p>
                          <p className="text-primary-600 font-medium mt-1">
                            {formatPrice(viewing.property.list_price)}
                          </p>
                        </>
                      ) : (
                        <h3 className="font-semibold text-gray-900">Property Viewing</h3>
                      )}
                    </div>

                    <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${statusColors[viewing.status]}`}>
                      {statusLabels[viewing.status]}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {viewing.status === 'scheduled' && viewing.scheduled_at
                        ? formatDate(viewing.scheduled_at)
                        : viewing.preferred_date
                        ? `Requested: ${formatDate(viewing.preferred_date)}`
                        : 'Date TBD'}
                    </div>
                    {(viewing.preferred_time || (viewing.status === 'scheduled' && viewing.scheduled_at)) && (
                      <div className="flex items-center text-gray-600">
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {viewing.preferred_time || formatTime(viewing.scheduled_at?.toString() || null)}
                      </div>
                    )}
                  </div>

                  {viewing.notes && (
                    <p className="mt-3 text-sm text-gray-500 italic">
                      Note: {viewing.notes}
                    </p>
                  )}

                  {viewing.property && viewing.status !== 'cancelled' && (
                    <div className="mt-4">
                      <Link
                        href={`/listings/${viewing.property.slug}`}
                        className="text-primary-600 text-sm font-medium hover:text-primary-700"
                      >
                        View Property Details →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
