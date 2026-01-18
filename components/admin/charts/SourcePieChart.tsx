'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface SourceData {
  source: string
  count: number
  percentage: number
}

interface Props {
  data: SourceData[]
}

const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6']

const formatSourceName = (source: string) => {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

export default function SourcePieChart({ data }: Props) {
  const formattedData = data.map((d) => ({
    ...d,
    name: formatSourceName(d.source),
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="count"
            nameKey="name"
            label={({ name, payload }: any) => `${name}: ${payload?.percentage || 0}%`}
            labelLine={false}
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [value, 'Leads']}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          />
          <Legend
            formatter={(value) => <span className="text-sm text-gray-600">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
