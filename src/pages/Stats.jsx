// src/pages/Stats.jsx
import { useState, useEffect } from 'react'
import { useAuth }  from '../context/AuthContext.jsx'
import { fetchLogsInRange } from '../lib/supabase.js'
import { daysAgoISO, formatMinutes } from '../lib/xp.js'
import { Card }     from '../components/ui/Card.jsx'
import { Skeleton } from '../components/ui/Skeleton.jsx'
import { DailyLineChart, WeeklyXPBarChart, TopicDonutChart } from '../components/charts/index.jsx'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Stats() {
  const { session, profile } = useAuth()
  const [logs, setLogs]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    fetchLogsInRange(session.user.id, daysAgoISO(60), daysAgoISO(0)).then(({ data }) => {
      setLogs(data ?? [])
      setLoading(false)
    })
  }, [session?.user?.id])

  // ── Daily line chart data (last 30 days) ──────────────────
  const dailyData = Array.from({ length: 30 }, (_, i) => {
    const dateStr = daysAgoISO(29 - i)
    const d       = new Date(dateStr + 'T00:00:00')
    const label   = `${d.getMonth() + 1}/${d.getDate()}`
    const minutes = logs
      .filter((l) => l.date === dateStr)
      .reduce((s, l) => s + l.minutes_studied, 0)
    return { date: label, minutes }
  })

  // ── Weekly XP bar chart (last 8 weeks) ───────────────────
  const weeklyXP = Array.from({ length: 8 }, (_, i) => {
    const weekEnd   = daysAgoISO(i * 7)
    const weekStart = daysAgoISO((i + 1) * 7 - 1)
    const xp        = logs
      .filter((l) => l.date >= weekStart && l.date <= weekEnd)
      .reduce((s, l) => s + l.xp_earned, 0)
    return { week: `W-${i === 0 ? 'now' : i}`, xp }
  }).reverse()

  // ── Topic donut data ──────────────────────────────────────
  const topicMap = {}
  logs.forEach((l) => {
    const name = l.topics?.name ?? 'Other'
    topicMap[name] = (topicMap[name] ?? 0) + l.minutes_studied
  })
  const donutData = Object.entries(topicMap)
    .map(([name, minutes]) => ({ name, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 6)

  // ── Aggregate stats ───────────────────────────────────────
  const totalMins    = logs.reduce((s, l) => s + l.minutes_studied, 0)
  const totalHours   = (totalMins / 60).toFixed(1)

  // Most productive day of the week
  const dayTotals = Array(7).fill(0)
  logs.forEach((l) => {
    const d = new Date(l.date + 'T00:00:00')
    dayTotals[d.getDay()] += l.minutes_studied
  })
  const bestDayIdx = dayTotals.indexOf(Math.max(...dayTotals))
  const bestDay    = dayTotals[bestDayIdx] > 0 ? DAY_NAMES[bestDayIdx] : '—'

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Stats</h1>
        <p className="text-slate-400 text-sm mt-0.5">Your learning analytics at a glance.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Hours',       value: `${totalHours}h` },
          { label: 'Total XP',          value: profile?.xp ?? 0 },
          { label: 'Longest Streak',    value: `${profile?.streak ?? 0}d` },
          { label: 'Best Day',          value: bestDay },
        ].map(({ label, value }) => (
          <Card key={label}>
            <p className="font-display font-bold text-2xl text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {/* Line chart */}
      <Card>
        <h3 className="font-display font-medium text-white mb-4 text-sm">Daily Activity — Last 30 Days</h3>
        {loading
          ? <Skeleton className="h-[220px] w-full" />
          : <DailyLineChart data={dailyData} />
        }
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Bar chart */}
        <Card>
          <h3 className="font-display font-medium text-white mb-4 text-sm">XP per Week</h3>
          {loading
            ? <Skeleton className="h-[220px] w-full" />
            : <WeeklyXPBarChart data={weeklyXP} />
          }
        </Card>

        {/* Donut chart */}
        <Card>
          <h3 className="font-display font-medium text-white mb-4 text-sm">Time by Topic</h3>
          {loading
            ? <Skeleton className="h-[220px] w-full" />
            : donutData.length === 0
              ? <p className="text-slate-500 text-sm text-center py-16">No data yet.</p>
              : <TopicDonutChart data={donutData} />
          }
        </Card>
      </div>
    </div>
  )
}
