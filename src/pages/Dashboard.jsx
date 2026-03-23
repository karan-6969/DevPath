// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Zap, Flame, BookOpen, Clock, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'

import { useAuth }    from '../context/AuthContext.jsx'
import { useTopics }  from '../hooks/useTopics.js'
import { useLogs }    from '../hooks/useLogs.js'
import { subscribeToDailyLogs } from '../lib/supabase.js'
import { getLevelProgress, getLevelName, formatMinutes, daysAgoISO } from '../lib/xp.js'

import { Card }           from '../components/ui/Card.jsx'
import { ProgressBar }    from '../components/ui/ProgressBar.jsx'
import { Badge }          from '../components/ui/Badge.jsx'
import { Modal }          from '../components/ui/Modal.jsx'
import { Skeleton, StatSkeleton, CardSkeleton } from '../components/ui/Skeleton.jsx'
import { WeeklyHeatmap }  from '../components/charts/WeeklyHeatmap.jsx'
import { LogForm }        from '../components/forms/LogForm.jsx'

const MOOD_EMOJI = { great: '😄', okay: '😐', tough: '😓' }

export default function Dashboard({ showToast }) {
  const { profile, loading: authLoading, session } = useAuth()
  const { topics, loading: topicsLoading } = useTopics()
  const { logs, loading: logsLoading, addLog } = useLogs(20)

  const [showLogModal, setShowLogModal] = useState(false)
  const [successMsg, setSuccessMsg]     = useState(null)

  // ── Realtime subscription ────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return
    const channel = subscribeToDailyLogs(session.user.id, (newLog) => {
      addLog(newLog)
    })
    return () => channel.unsubscribe()
  }, [session?.user?.id])

  // ── Compute this-week hours ──────────────────────────────
  const weekStart = daysAgoISO(6)
  const weekLogs  = logs.filter((l) => l.date >= weekStart)
  const weekMins  = weekLogs.reduce((s, l) => s + l.minutes_studied, 0)

  // ── Level info ───────────────────────────────────────────
  const lvl = profile ? getLevelProgress(profile.xp) : null

  function handleLogSuccess({ xpEarned, newStreak, newAchievements, log }) {
    setShowLogModal(false)

    const streakMsg = newStreak > 1 ? ` Streak: ${newStreak} 🔥` : ''
    setSuccessMsg(`⚡ +${xpEarned} XP earned!${streakMsg}`)
    setTimeout(() => setSuccessMsg(null), 4000)

    showToast?.(`+${xpEarned} XP earned! Keep going!`, 'xp')

    // Confetti on level up — check if level changed
    const prevLevel = Math.floor(((profile?.xp ?? 0)) / 500) + 1
    const newLevel  = Math.floor(((profile?.xp ?? 0) + xpEarned) / 500) + 1
    if (newLevel > prevLevel) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } })
      showToast?.(`🎉 Level Up! You're now Level ${newLevel}!`, 'success', 6000)
    }

    newAchievements?.forEach((a) => {
      showToast?.(`${a.icon} Achievement unlocked: ${a.title}`, 'success', 6000)
    })
  }

  const loading = authLoading || topicsLoading || logsLoading

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">
            {profile?.full_name ? `Hey, ${profile.full_name.split(' ')[0]} 👋` : 'Dashboard'}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => setShowLogModal(true)}
          className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl
            font-medium text-sm transition-all shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30"
        >
          <Plus size={16} /> Log Session
        </button>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="bg-brand-500/15 border border-brand-500/30 rounded-xl px-4 py-3 text-brand-300 text-sm font-medium animate-bounce-in">
          {successMsg}
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={<Zap size={18} className="text-accent-400" />}    value={profile?.xp ?? 0}      label="Total XP"          />
            <StatCard icon={<Flame size={18} className="text-orange-400" />}  value={profile?.streak ?? 0}  label="Day Streak"  suffix="🔥" />
            <StatCard icon={<BookOpen size={18} className="text-blue-400" />} value={topics.length}         label="Topics"            />
            <StatCard icon={<Clock size={18} className="text-purple-400" />}  value={formatMinutes(weekMins)} label="This Week"       />
          </>
        )}
      </div>

      {/* ── Level progress ───────────────────────────────────── */}
      {loading ? (
        <CardSkeleton lines={2} />
      ) : lvl && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Level {lvl.level}</span>
              <h3 className="font-display font-semibold text-white mt-0.5">{lvl.name}</h3>
            </div>
            <span className="text-xs font-mono text-slate-500">{lvl.current} / {lvl.needed} XP</span>
          </div>
          <ProgressBar value={lvl.progress * 100} size="lg" animated />
          <p className="text-xs text-slate-500 mt-2">
            {lvl.level < 10
              ? `${lvl.needed - lvl.current} XP to Level ${lvl.level + 1} — ${getLevelName(lvl.level + 1)}`
              : '🏆 Max Level Reached!'
            }
          </p>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* ── Weekly heatmap ─────────────────────────────────── */}
        <Card>
          <h3 className="font-display font-medium text-white mb-4 text-sm">Last 7 Days</h3>
          {loading ? <Skeleton className="h-16 w-full" /> : <WeeklyHeatmap logs={logs} />}
        </Card>

        {/* ── Recent activity ────────────────────────────────── */}
        <Card>
          <h3 className="font-display font-medium text-white mb-3 text-sm">Recent Activity</h3>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : logs.length === 0 ? (
            <EmptyState message="No sessions yet. Log your first one!" />
          ) : (
            <div className="space-y-2">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                  <span className="text-lg">{MOOD_EMOJI[log.mood]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {log.topics?.name ?? 'Unknown Topic'}
                    </p>
                    <p className="text-xs text-slate-500">{log.date} · {log.minutes_studied} min</p>
                  </div>
                  <span className="text-xs font-mono text-brand-400">+{log.xp_earned} XP</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Topic progress cards ─────────────────────────────── */}
      <div>
        <h3 className="font-display font-medium text-white mb-3 text-sm">Topic Progress</h3>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
          </div>
        ) : topics.length === 0 ? (
          <Card className="text-center py-10">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-slate-400 text-sm mb-3">No topics yet. Add your first to get started!</p>
            <a href="/topics" className="text-brand-400 text-sm font-medium hover:text-brand-300 transition-colors">
              + Add a topic →
            </a>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((topic) => {
              const pct = topic.total_lessons > 0
                ? Math.round((topic.completed_lessons / topic.total_lessons) * 100)
                : 0
              return (
                <Card key={topic.id}>
                  <div className="flex items-start justify-between mb-3">
                    <p className="font-medium text-white text-sm">{topic.name}</p>
                    <Badge label={topic.category} variant={topic.category} />
                  </div>
                  <ProgressBar value={pct} size="sm" />
                  <p className="text-xs text-slate-500 mt-1.5">
                    {topic.completed_lessons}/{topic.total_lessons} lessons · {pct}%
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Quick Log Modal */}
      <Modal isOpen={showLogModal} onClose={() => setShowLogModal(false)} title="Log Study Session">
        <LogForm onSuccess={handleLogSuccess} onCancel={() => setShowLogModal(false)} />
      </Modal>
    </div>
  )
}

function StatCard({ icon, value, label, suffix = '' }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">{icon}</div>
      <p className="font-display font-bold text-2xl text-white">{value}{suffix}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </Card>
  )
}

function EmptyState({ message }) {
  return (
    <div className="text-center py-6">
      <p className="text-slate-500 text-sm">{message}</p>
    </div>
  )
}
