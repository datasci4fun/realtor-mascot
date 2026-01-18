'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import DateRangePicker from '@/components/admin/DateRangePicker'
import AgentLeaderboard from '@/components/admin/charts/AgentLeaderboard'

// Dynamic imports for recharts components (they don't work well with SSR)
const LeadTrendChart = dynamic(() => import('@/components/admin/charts/LeadTrendChart'), { ssr: false })
const SourcePieChart = dynamic(() => import('@/components/admin/charts/SourcePieChart'), { ssr: false })
const ConversionFunnel = dynamic(() => import('@/components/admin/charts/ConversionFunnel'), { ssr: false })

interface AnalyticsData {
  range: { start: string; end: string }
  trend: Array<{ date: string; leads: number; qualified: number; closed: number }>
  funnel: Array<{ stage: string; count: number; percentage: number }>
  sources: Array<{ source: string; count: number; percentage: number }>
  agents: Array<{
    id: string
    name: string
    email: string
    totalLeads: number
    closedLeads: number
    conversionRate: number
  }>
  metrics: {
    totalLeads: number
    newLeads: number
    qualifiedLeads: number
    closedLeads: number
    conversionRate: number
  }
  comparison: {
    leads: { current: number; previous: number; change: number }
    closed: { current: number; previous: number; change: number }
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30d')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/analytics?range=${dateRange}`)

      if (res.status === 401) {
        window.location.href = '/admin/login'
        return
      }

      if (!res.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await res.json()
      setData(data)
    } catch (err) {
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  const ChangeIndicator = ({ change }: { change: number }) => {
    if (change === 0) return <span className="text-gray-500 text-sm">No change</span>
    const isPositive = change > 0
    return (
      <span className={`text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )}
        {Math.abs(change)}%
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Track your lead performance and conversions</p>
        </div>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{data.metrics.totalLeads}</p>
            </div>
            <ChangeIndicator change={data.comparison.leads.change} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            vs. {data.comparison.leads.previous} in previous period
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Qualified Leads</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{data.metrics.qualifiedLeads}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {data.metrics.totalLeads > 0
              ? Math.round((data.metrics.qualifiedLeads / data.metrics.totalLeads) * 100)
              : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Closed Deals</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{data.metrics.closedLeads}</p>
            </div>
            <ChangeIndicator change={data.comparison.closed.change} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            vs. {data.comparison.closed.previous} in previous period
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Conversion Rate</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{data.metrics.conversionRate}%</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            From lead to closed
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Lead Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Trend</h2>
          {data.trend.length > 0 ? (
            <LeadTrendChart data={data.trend} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for this period
            </div>
          )}
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversion Funnel</h2>
          {data.funnel.some((f) => f.count > 0) ? (
            <ConversionFunnel data={data.funnel} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for this period
            </div>
          )}
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lead Sources */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources</h2>
          {data.sources.length > 0 ? (
            <SourcePieChart data={data.sources} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No data available for this period
            </div>
          )}
        </div>

        {/* Agent Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Leaderboard</h2>
          <AgentLeaderboard data={data.agents} />
        </div>
      </div>
    </div>
  )
}
