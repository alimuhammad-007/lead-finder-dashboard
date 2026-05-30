/**
 * components/dashboard/DashboardCharts.jsx
 * ==========================================
 * Charts for lead status breakdown (donut) and lead score distribution (bar).
 * Uses Recharts — React charting library.
 */

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'

// Colors for each lead status
const STATUS_COLORS = {
  new:       '#00c8ff',
  contacted: '#8b5cf6',
  qualified: '#f59e0b',
  converted: '#10b981',
  lost:      '#ef4444',
}

const STATUS_LABELS = {
  new:       'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost:      'Lost',
}

export default function DashboardCharts({ stats }) {
  // Build pie chart data from leads_by_status object
  const pieData = Object.entries(stats.leads_by_status || {}).map(([status, count]) => ({
    name:  STATUS_LABELS[status] || status,
    value: count,
    color: STATUS_COLORS[status] || '#64748b',
  })).filter(d => d.value > 0)

  // Show placeholder when no data
  const hasData = pieData.length > 0

  // Bar chart — mock score distribution (in real app, compute from lead scores)
  const scoreData = [
    { range: '0-20',   count: 2 },
    { range: '21-40',  count: 5 },
    { range: '41-60',  count: 12 },
    { range: '61-80',  count: 18 },
    { range: '81-100', count: 8 },
  ]

  const customTooltipStyle = {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    color: '#e5e7eb',
    fontSize: '12px',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      {/* Lead Status Breakdown */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Lead Status</h3>
        <p className="text-xs text-gray-500 mb-4">Breakdown of your pipeline</p>

        {hasData ? (
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={160}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-2">
              {pieData.map((entry, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
                    <span className="text-xs text-gray-400">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-white">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-sm text-gray-500">No leads yet — start searching!</p>
          </div>
        )}
      </div>

      {/* Lead Score Distribution */}
      <div className="glass-card p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Score Distribution</h3>
        <p className="text-xs text-gray-500 mb-4">Quality of your leads (0-100)</p>

        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={scoreData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              cursor={{ fill: 'rgba(255,255,255,0.04)' }}
            />
            <Bar dataKey="count" fill="#00c8ff" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}