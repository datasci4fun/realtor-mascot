'use client'

import { useState, useEffect } from 'react'

type ReportType = 'summary' | 'agent' | 'source' | 'pipeline'

interface ReportFilters {
  startDate: string
  endDate: string
  status: string
  source: string
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('summary')
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '',
    endDate: '',
    status: '',
    source: '',
  })
  const [report, setReport] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    generateReport()
  }, [reportType, filters])

  const generateReport = async () => {
    setIsLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()
      params.set('type', reportType)
      if (filters.startDate) params.set('startDate', filters.startDate)
      if (filters.endDate) params.set('endDate', filters.endDate)
      if (filters.status) params.set('status', filters.status)
      if (filters.source) params.set('source', filters.source)

      const res = await fetch(`/api/admin/reports?${params}`)

      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      if (!res.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await res.json()
      setReport(data)
    } catch (err) {
      setError('Failed to generate report')
    } finally {
      setIsLoading(false)
    }
  }

  const exportCSV = () => {
    if (!report?.data) return

    let csvContent = ''
    const data = report.data

    switch (reportType) {
      case 'summary':
        csvContent = 'Lead Summary Report\n\n'
        csvContent += `Total Leads,${data.totalLeads}\n\n`
        csvContent += 'By Status\nStatus,Count,Percentage\n'
        data.byStatus.forEach((row: any) => {
          csvContent += `${row.status},${row.count},${row.percentage}%\n`
        })
        csvContent += '\nBy Source\nSource,Count,Percentage\n'
        data.bySource.forEach((row: any) => {
          csvContent += `${formatSourceName(row.source)},${row.count},${row.percentage}%\n`
        })
        break

      case 'agent':
        csvContent = 'Agent Performance Report\n\n'
        csvContent +=
          'Agent,Email,Total Leads,New,Closed,Lost,Conversion Rate,Avg Days to Close\n'
        data.agents.forEach((agent: any) => {
          csvContent += `${agent.name},${agent.email},${agent.totalLeads},${agent.newLeads},${agent.closedLeads},${agent.lostLeads},${agent.conversionRate}%,${agent.avgDaysToClose || '-'}\n`
        })
        break

      case 'source':
        csvContent = 'Source Attribution Report\n\n'
        csvContent += 'Source,Total Leads,Closed Leads,Conversion Rate\n'
        data.sources.forEach((src: any) => {
          csvContent += `${formatSourceName(src.source)},${src.totalLeads},${src.closedLeads},${src.conversionRate}%\n`
        })
        break

      case 'pipeline':
        csvContent = 'Pipeline Report\n\n'
        csvContent += 'Stage,Count,Percentage\n'
        data.stages.forEach((stage: any) => {
          csvContent += `${formatStatusName(stage.status)},${stage.count},${stage.percentage}%\n`
        })
        break
    }

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const formatSourceName = (source: string): string => {
    const names: Record<string, string> = {
      mascot_chat: 'Mascot Chat',
      contact_form: 'Contact Form',
      listing_inquiry: 'Listing Inquiry',
      home_valuation: 'Home Valuation',
      newsletter: 'Newsletter',
      referral: 'Referral',
      website: 'Website',
      other: 'Other',
      unknown: 'Unknown',
    }
    return names[source] || source.replace(/_/g, ' ')
  }

  const formatStatusName = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-purple-500',
    showing: 'bg-indigo-500',
    offer: 'bg-orange-500',
    closed: 'bg-green-500',
    lost: 'bg-gray-500',
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export lead reports</p>
        </div>
        <button
          onClick={exportCSV}
          disabled={!report?.data || isLoading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'summary', label: 'Lead Summary' },
            { value: 'agent', label: 'Agent Performance' },
            { value: 'source', label: 'Source Attribution' },
            { value: 'pipeline', label: 'Pipeline' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value as ReportType)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                reportType === type.value
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {reportType === 'summary' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">All Sources</option>
                  <option value="mascot_chat">Mascot Chat</option>
                  <option value="contact_form">Contact Form</option>
                  <option value="listing_inquiry">Listing Inquiry</option>
                  <option value="home_valuation">Home Valuation</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>
            </>
          )}
          {(filters.startDate || filters.endDate || filters.status || filters.source) && (
            <button
              onClick={() => setFilters({ startDate: '', endDate: '', status: '', source: '' })}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>}

      {/* Report Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500">Generating report...</p>
        </div>
      ) : report?.data ? (
        <div className="space-y-6">
          {/* Lead Summary Report */}
          {reportType === 'summary' && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Total Leads: {report.data.totalLeads}
                </h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* By Status */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">By Status</h3>
                    <div className="space-y-3">
                      {report.data.byStatus.map((item: any) => (
                        <div key={item.status} className="flex items-center gap-3">
                          <div className="w-24 text-sm text-gray-600 capitalize">
                            {formatStatusName(item.status)}
                          </div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusColors[item.status] || 'bg-gray-500'}`}
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="w-20 text-sm text-gray-500 text-right">
                            {item.count} ({item.percentage}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* By Source */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4">By Source</h3>
                    <div className="space-y-3">
                      {report.data.bySource.map((item: any) => (
                        <div key={item.source} className="flex items-center gap-3">
                          <div className="w-32 text-sm text-gray-600">
                            {formatSourceName(item.source)}
                          </div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                          <div className="w-20 text-sm text-gray-500 text-right">
                            {item.count} ({item.percentage}%)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* By Intent */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">By Intent</h3>
                  <div className="space-y-3">
                    {report.data.byIntent.map((item: any) => (
                      <div key={item.intent} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 capitalize">{item.intent}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By Timeline */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-4">By Timeline</h3>
                  <div className="space-y-3">
                    {report.data.byTimeline.map((item: any) => (
                      <div key={item.timeline} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{item.timeline}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Agent Performance Report */}
          {reportType === 'agent' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Agent Performance</h2>
                  <div className="text-sm text-gray-500">
                    Team Conversion Rate:{' '}
                    <span className="font-medium text-gray-900">
                      {report.data.teamConversionRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        New
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Closed
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Lost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Conv. Rate
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Avg Days
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.data.agents.map((agent: any) => (
                      <tr key={agent.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{agent.name}</p>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {agent.totalLeads}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">{agent.newLeads}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-medium">
                          {agent.closedLeads}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-500">{agent.lostLeads}</td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-medium ${agent.conversionRate >= 20 ? 'text-green-600' : agent.conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}
                          >
                            {agent.conversionRate}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {agent.avgDaysToClose || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Source Attribution Report */}
          {reportType === 'source' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Source Attribution</h2>
                {report.data.bestPerformingSource && (
                  <p className="text-sm text-gray-500 mt-1">
                    Best performing source:{' '}
                    <span className="font-medium text-green-600">
                      {formatSourceName(report.data.bestPerformingSource)}
                    </span>
                  </p>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Source
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Total Leads
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Closed
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Conversion Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {report.data.sources.map((src: any) => (
                      <tr key={src.source} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {formatSourceName(src.source)}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">{src.totalLeads}</td>
                        <td className="px-6 py-4 text-right text-green-600 font-medium">
                          {src.closedLeads}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`font-medium ${src.conversionRate >= 20 ? 'text-green-600' : src.conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}
                          >
                            {src.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pipeline Report */}
          {reportType === 'pipeline' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pipeline Overview</h2>
              <div className="space-y-4">
                {report.data.stages.map((stage: any, index: number) => (
                  <div key={stage.status} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900 capitalize">
                            {formatStatusName(stage.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {stage.count} leads ({stage.percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${statusColors[stage.status] || 'bg-gray-500'}`}
                            style={{ width: `${stage.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    {index < report.data.stages.length - 1 && (
                      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 -mb-4" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
