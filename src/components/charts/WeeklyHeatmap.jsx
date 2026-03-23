// src/components/charts/WeeklyHeatmap.jsx
// Shows last 7 days as colored squares based on minutes studied

import { todayISO, daysAgoISO } from '../../lib/xp.js'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getColor(minutes) {
  if (!minutes || minutes === 0) return 'bg-surface-muted border-surface-border'
  if (minutes < 30)  return 'bg-brand-900  border-brand-800'
  if (minutes < 60)  return 'bg-brand-700  border-brand-600'
  if (minutes < 120) return 'bg-brand-500  border-brand-400'
  return 'bg-brand-400 border-brand-300 shadow-[0_0_8px_0_rgba(34,197,94,0.4)]'
}

export function WeeklyHeatmap({ logs = [] }) {
  // Build a map of date → total minutes
  const minutesByDate = {}
  logs.forEach((l) => {
    minutesByDate[l.date] = (minutesByDate[l.date] ?? 0) + l.minutes_studied
  })

  // Last 7 days newest-last
  const days = Array.from({ length: 7 }, (_, i) => {
    const dateStr = daysAgoISO(6 - i)
    const d       = new Date(dateStr + 'T00:00:00')
    return {
      date:    dateStr,
      label:   DAY_LABELS[d.getDay()],
      minutes: minutesByDate[dateStr] ?? 0,
      isToday: dateStr === todayISO(),
    }
  })

  return (
    <div className="flex items-end gap-2">
      {days.map(({ date, label, minutes, isToday }) => (
        <div key={date} className="flex flex-col items-center gap-1.5 flex-1">
          <div
            title={`${label}: ${minutes} min`}
            className={`
              w-full aspect-square rounded-lg border transition-all duration-300
              ${getColor(minutes)}
              ${isToday ? 'ring-2 ring-brand-400 ring-offset-1 ring-offset-surface-card' : ''}
            `}
          />
          <span className={`text-[10px] font-mono ${isToday ? 'text-brand-400 font-bold' : 'text-slate-500'}`}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
