'use client'

import { useState } from 'react'
import Link from 'next/link'

type Step = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete'

interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{ row: number; error: string }>
  duplicates: number
}

const fieldOptions = [
  { value: '', label: 'Skip this column' },
  { value: 'name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'intent', label: 'Intent' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'budget', label: 'Budget' },
  { value: 'message', label: 'Message' },
  { value: 'source', label: 'Source' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
]

export default function ImportLeadsPage() {
  const [step, setStep] = useState<Step>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvContent, setCsvContent] = useState('')
  const [error, setError] = useState('')

  // Preview data
  const [headers, setHeaders] = useState<string[]>([])
  const [headerMapping, setHeaderMapping] = useState<Record<string, string>>({})
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([])
  const [totalRows, setTotalRows] = useState(0)

  // Import options
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [defaultSource, setDefaultSource] = useState('other')

  // Results
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file')
      return
    }

    setFile(selectedFile)
    setError('')

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      setCsvContent(content)

      // Parse and preview
      try {
        const res = await fetch('/api/leads/import', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvContent: content }),
        })

        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Failed to parse CSV')
        }

        const data = await res.json()
        setHeaders(data.headers)
        setHeaderMapping(data.suggestedMapping)
        setPreviewRows(data.preview)
        setTotalRows(data.rowCount)
        setStep('mapping')
      } catch (err: any) {
        setError(err.message)
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleMappingChange = (header: string, field: string) => {
    setHeaderMapping((prev) => ({
      ...prev,
      [header]: field,
    }))
  }

  const validateMapping = () => {
    // Check if email is mapped
    const hasEmail = Object.values(headerMapping).includes('email')
    if (!hasEmail) {
      setError('Email field is required. Please map a column to Email.')
      return false
    }
    return true
  }

  const handleStartImport = async () => {
    if (!validateMapping()) return

    setStep('importing')
    setError('')

    try {
      const res = await fetch('/api/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent,
          headerMapping,
          skipDuplicates,
          defaultSource,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Import failed')
      }

      setResult(data)
      setStep('complete')
    } catch (err: any) {
      setError(err.message)
      setStep('preview')
    }
  }

  const resetImport = () => {
    setStep('upload')
    setFile(null)
    setCsvContent('')
    setHeaders([])
    setHeaderMapping({})
    setPreviewRows([])
    setTotalRows(0)
    setResult(null)
    setError('')
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
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
        <h1 className="text-3xl font-bold text-gray-900">Import Leads</h1>
        <p className="text-gray-600 mt-1">Import leads from a CSV file</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['upload', 'mapping', 'preview', 'complete'].map((s, i) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === s || ['upload', 'mapping', 'preview', 'complete'].indexOf(step) > i
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {['upload', 'mapping', 'preview', 'complete'].indexOf(step) > i ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < 3 && (
                <div
                  className={`w-24 h-1 mx-2 ${
                    ['upload', 'mapping', 'preview', 'complete'].indexOf(step) > i
                      ? 'bg-gray-900'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Upload</span>
          <span>Map Fields</span>
          <span>Preview</span>
          <span>Complete</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center">
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
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Upload CSV File</h3>
            <p className="mt-2 text-sm text-gray-500">
              Upload a CSV file containing your leads. The file should have headers in the first row.
            </p>

            <div className="mt-6">
              <label className="block">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium cursor-pointer hover:bg-gray-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Choose File
                </span>
              </label>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left text-sm">
              <h4 className="font-medium text-gray-900 mb-2">Expected CSV Format</h4>
              <p className="text-gray-600 mb-2">
                Your CSV should include columns for lead information. Common column names will be automatically detected:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><strong>Email</strong> (required)</li>
                <li>Name, Phone, Intent, Timeline, Budget</li>
                <li>Source, Status, Priority, Message</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Mapping */}
      {step === 'mapping' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Map CSV Columns to Lead Fields</h3>
          <p className="text-sm text-gray-500 mb-6">
            We've detected {headers.length} columns and {totalRows} rows. Please verify the field mapping below.
          </p>

          <div className="space-y-4 mb-6">
            {headers.map((header) => (
              <div key={header} className="flex items-center gap-4">
                <div className="w-1/3">
                  <span className="text-sm font-medium text-gray-700">{header}</span>
                  {previewRows[0]?.[header] && (
                    <span className="block text-xs text-gray-400 truncate">
                      e.g., {previewRows[0][header]}
                    </span>
                  )}
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <select
                  value={headerMapping[header] || ''}
                  onChange={(e) => handleMappingChange(header, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  {fieldOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button
              onClick={resetImport}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => {
                if (validateMapping()) setStep('preview')
              }}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preview & Import Options</h3>

          {/* Options */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={skipDuplicates}
                onChange={(e) => setSkipDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <div>
                <span className="text-sm font-medium text-gray-900">Skip duplicate emails</span>
                <p className="text-xs text-gray-500">
                  Leads with emails that already exist will be skipped
                </p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Source (for rows without source)
              </label>
              <select
                value={defaultSource}
                onChange={(e) => setDefaultSource(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="other">Other</option>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="contact_form">Contact Form</option>
              </select>
            </div>
          </div>

          {/* Preview Table */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Preview (first {previewRows.length} of {totalRows} rows)
            </h4>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.entries(headerMapping)
                      .filter(([, field]) => field)
                      .map(([header, field]) => (
                        <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {field}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewRows.map((row, i) => (
                    <tr key={i}>
                      {Object.entries(headerMapping)
                        .filter(([, field]) => field)
                        .map(([header]) => (
                          <td key={header} className="px-4 py-2 text-gray-600 truncate max-w-[200px]">
                            {row[header] || '-'}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('mapping')}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleStartImport}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              Import {totalRows} Leads
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="animate-spin mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Importing Leads...</h3>
          <p className="mt-2 text-sm text-gray-500">Please wait while we import your leads.</p>
        </div>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && result && (
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            {result.success ? (
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="mx-auto h-12 w-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            <h3 className="mt-4 text-lg font-medium text-gray-900">Import Complete</h3>
          </div>

          {/* Results Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{result.imported}</p>
              <p className="text-sm text-green-700">Imported</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-gray-600">{result.skipped}</p>
              <p className="text-sm text-gray-700">Skipped</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{result.duplicates}</p>
              <p className="text-sm text-yellow-700">Duplicates</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
              <p className="text-sm text-red-700">Errors</p>
            </div>
          </div>

          {/* Error Details */}
          {result.errors.length > 0 && (
            <div className="mb-8">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Error Details</h4>
              <div className="max-h-48 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.errors.map((err, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-gray-600">{err.row}</td>
                        <td className="px-4 py-2 text-red-600">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              onClick={resetImport}
              className="px-6 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Import More
            </button>
            <Link
              href="/admin/leads"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800"
            >
              View Leads
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
