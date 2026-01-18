'use client'

interface AgentPerformance {
  id: string
  name: string
  email: string
  totalLeads: number
  closedLeads: number
  conversionRate: number
}

interface Props {
  data: AgentPerformance[]
}

export default function AgentLeaderboard({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No agent data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Agent
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Leads
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Closed
            </th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conversion
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((agent, index) => (
            <tr key={agent.id} className="hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center justify-center w-8 h-8">
                  {index === 0 && (
                    <span className="text-2xl">🥇</span>
                  )}
                  {index === 1 && (
                    <span className="text-2xl">🥈</span>
                  )}
                  {index === 2 && (
                    <span className="text-2xl">🥉</span>
                  )}
                  {index > 2 && (
                    <span className="text-gray-500 font-medium">{index + 1}</span>
                  )}
                </div>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                    {agent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{agent.name}</p>
                    <p className="text-sm text-gray-500">{agent.email}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-right font-medium text-gray-900">
                {agent.totalLeads}
              </td>
              <td className="py-3 px-4 text-right">
                <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                  {agent.closedLeads}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(agent.conversionRate, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12 text-right">
                    {agent.conversionRate}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
