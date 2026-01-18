'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface FunnelData {
  stage: string
  count: number
  percentage: number
}

interface Props {
  data: FunnelData[]
}

const stageColors: Record<string, string> = {
  new: '#3b82f6',
  contacted: '#f59e0b',
  qualified: '#8b5cf6',
  showing: '#6366f1',
  offer: '#f97316',
  closed: '#22c55e',
  lost: '#9ca3af',
}

const formatStageName = (stage: string) => {
  return stage.charAt(0).toUpperCase() + stage.slice(1)
}

export default function ConversionFunnel({ data }: Props) {
  // Filter out stages with 0 count for cleaner display
  const formattedData = data
    .filter((d) => d.stage !== 'lost')
    .map((d) => ({
      ...d,
      name: formatStageName(d.stage),
    }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            formatter={(value: number, name: string, props: any) => [
              `${value} (${props.payload.percentage}%)`,
              'Leads',
            ]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={stageColors[entry.stage] || '#3b82f6'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
