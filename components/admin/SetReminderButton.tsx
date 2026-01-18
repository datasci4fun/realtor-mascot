'use client'

import { useState } from 'react'

interface SetReminderButtonProps {
  leadId: string
  onSuccess?: () => void
}

export default function SetReminderButton({ leadId, onSuccess }: SetReminderButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [customDate, setCustomDate] = useState('')
  const [customTime, setCustomTime] = useState('09:00')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const presets = [
    { label: 'In 1 hour', value: '1h' },
    { label: 'In 3 hours', value: '3h' },
    { label: 'Tomorrow 9 AM', value: 'tomorrow' },
    { label: 'Next week', value: 'next_week' },
  ]

  const handlePresetClick = async (preset: string) => {
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          preset,
          message: message || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set reminder')
      }

      setShowDropdown(false)
      setMessage('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCustomSubmit = async () => {
    if (!customDate || !customTime) {
      setError('Please select date and time')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const remindAt = new Date(`${customDate}T${customTime}`)

      if (remindAt <= new Date()) {
        throw new Error('Reminder time must be in the future')
      }

      const res = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          remindAt: remindAt.toISOString(),
          message: message || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to set reminder')
      }

      setShowDropdown(false)
      setShowCustom(false)
      setCustomDate('')
      setCustomTime('09:00')
      setMessage('')
      onSuccess?.()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Remind me
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setShowDropdown(false)
              setShowCustom(false)
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3">
              {error && (
                <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{error}</div>
              )}

              {!showCustom ? (
                <>
                  <div className="space-y-1 mb-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handlePresetClick(preset.value)}
                        disabled={isSubmitting}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div className="border-t pt-2">
                    <button
                      onClick={() => setShowCustom(true)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2"
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Custom date/time
                    </button>
                  </div>

                  <div className="border-t pt-3 mt-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a note (optional)"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={() => setShowCustom(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Back
                  </button>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Add a note"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg"
                    />
                  </div>

                  <button
                    onClick={handleCustomSubmit}
                    disabled={isSubmitting || !customDate}
                    className="w-full px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Setting...' : 'Set Reminder'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
