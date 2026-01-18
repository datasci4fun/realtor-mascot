'use client'

import { useState } from 'react'
import { format, subDays } from 'date-fns'

interface DateRangePickerProps {
  value: string
  onChange: (value: string) => void
}

const presets = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'Last year', value: '1y' },
]

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customStart, setCustomStart] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'))
  const [customEnd, setCustomEnd] = useState(format(new Date(), 'yyyy-MM-dd'))

  const handleCustomApply = () => {
    onChange(`${customStart},${customEnd}`)
    setShowCustom(false)
  }

  const isCustom = value.includes(',')
  const activeLabel = isCustom
    ? 'Custom'
    : presets.find((p) => p.value === value)?.label || 'Last 30 days'

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Preset buttons */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          {presets.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                value === preset.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowCustom(!showCustom)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              isCustom
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom date picker dropdown */}
      {showCustom && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-10">
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="pt-6">
              <button
                onClick={handleCustomApply}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
