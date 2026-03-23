// src/components/charts/index.jsx
// All recharts-based chart components

import {
  LineChart as ReLineChart, Line, BarChart as ReBarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Shared tooltip style ────────────────────────────────────
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-card border border-surface-border rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.value}{unit}
        </p>
      ))}
    </div>
  )
}

// ─── Line Chart: minutes per day ─────────────────────────────
export function DailyLineChart({ data }) {
  // data: [{ date: 'Mar 01', minutes: 45 }, ...]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ReLineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip unit=" min" />} />
        <Line
          type="monotone" dataKey="minutes"
          stroke="#22c55e" strokeWidth={2} dot={false}
          activeDot={{ r: 4, fill: '#22c55e', stroke: '#161b27', strokeWidth: 2 }}
        />
      </ReLineChart>
    </ResponsiveContainer>
  )
}

// ─── Bar Chart: XP per week ───────────────────────────────────
export function WeeklyXPBarChart({ data }) {
  // data: [{ week: 'W1', xp: 220 }, ...]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <ReBarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2535" vertical={false} />
        <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip unit=" XP" />} />
        <Bar dataKey="xp" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </ReBarChart>
    </ResponsiveContainer>
  )
}

// ─── Donut Chart: time split by topic ────────────────────────
const PIE_COLORS = ['#22c55e', '#f97316', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6']

export function TopicDonutChart({ data }) {
  // data: [{ name: 'React', minutes: 340 }, ...]
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data} cx="50%" cy="50%"
          innerRadius={60} outerRadius={90}
          paddingAngle={3} dataKey="minutes"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(val) => [`${val} min`, '']}
          contentStyle={{
            background: '#161b27',
            border: '1px solid #1e2535',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(val) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{val}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
