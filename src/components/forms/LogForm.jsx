// src/components/forms/LogForm.jsx
// Used in /log page AND the quick-log modal on dashboard

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTopics } from '../../hooks/useTopics.js'
import {
  createLog, updateProfile, updateTopic,
  fetchAchievements, createAchievement,
} from '../../lib/supabase.js'
import {
  calcXpEarned, calcNewStreak, didStudyYesterday, todayISO,
} from '../../lib/xp.js'
import { getNewAchievements } from '../../lib/achievements.js'
import { Button } from '../ui/Button.jsx'

const MOODS = [
  { value: 'great', label: '😄 Great' },
  { value: 'okay',  label: '😐 Okay'  },
  { value: 'tough', label: '😓 Tough'  },
]

/**
 * @param {function} onSuccess  - called with { log, xpEarned, newStreak, newAchievements }
 * @param {function} onCancel   - optional cancel handler
 */
export function LogForm({ onSuccess, onCancel }) {
  const { session, profile, refreshProfile } = useAuth()
  const { topics } = useTopics()

  const [date, setDate]             = useState(todayISO())
  const [topicId, setTopicId]       = useState('')
  const [minutes, setMinutes]       = useState(30)
  const [notes, setNotes]           = useState('')
  const [mood, setMood]             = useState('okay')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    // Validation
    if (!topicId) return setError('Please select a topic.')
    if (minutes < 1 || minutes > 480) return setError('Minutes must be between 1 and 480.')

    setLoading(true)
    try {
      const userId = session.user.id

      // ── Calculate XP + streak ──────────────────────────────
      const streakContinued = didStudyYesterday(profile?.last_active, date)
      const xpEarned        = calcXpEarned(minutes, streakContinued)
      const newStreak       = calcNewStreak(profile?.last_active, date, profile?.streak ?? 0)
      const newXp           = (profile?.xp ?? 0) + xpEarned

      // ── Save log ───────────────────────────────────────────
      const { data: log, error: logErr } = await createLog(userId, {
        date, topicId, minutesStudied: minutes, notes, mood, xpEarned,
      })
      if (logErr) throw logErr

      // ── Update profile xp + streak + last_active ──────────
      await updateProfile(userId, {
        xp: newXp,
        streak: newStreak,
        last_active: date,
      })

      // ── Increment topic completed_lessons (1 session = 1 lesson) ──
      const topic = topics.find((t) => t.id === topicId)
      if (topic) {
        const newCompleted = Math.min(
          (topic.completed_lessons ?? 0) + 1,
          topic.total_lessons
        )
        await updateTopic(topicId, { completed_lessons: newCompleted })
      }

      // ── Check achievements ─────────────────────────────────
      const { data: existingAch } = await fetchAchievements(userId)
      const alreadyUnlocked       = (existingAch ?? []).map((a) => a.title)
      // Build context for achievement checks
      // Note: we reuse the topics array from hook here
      const allLogs = [log] // minimal — full check happens in Achievements page
      const newAchievements = getNewAchievements(
        { xp: newXp, streak: newStreak, totalLogs: 1, logs: [log], topics: topics },
        alreadyUnlocked
      )
      for (const ach of newAchievements) {
        await createAchievement(userId, { title: ach.title, description: ach.description, icon: ach.icon })
      }

      refreshProfile()
      onSuccess?.({ log, xpEarned, newStreak, streakContinued, newAchievements })
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Date */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Date</label>
        <input
          type="date"
          value={date}
          max={todayISO()}
          onChange={(e) => setDate(e.target.value)}
          className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-2 text-sm text-white
            focus:outline-none focus:border-brand-500/60 [color-scheme:dark]"
        />
      </div>

      {/* Topic */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Topic</label>
        <select
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
          className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-2 text-sm text-white
            focus:outline-none focus:border-brand-500/60"
        >
          <option value="">Select a topic…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Minutes */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Minutes studied
          <span className="ml-2 font-mono text-brand-400">{minutes} min</span>
        </label>
        <input
          type="range" min="5" max="480" step="5"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full accent-brand-500"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
          <span>5m</span><span>2h</span><span>4h</span><span>8h</span>
        </div>
      </div>

      {/* Mood */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">How was it?</label>
        <div className="flex gap-2">
          {MOODS.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setMood(value)}
              className={`flex-1 py-2 rounded-lg text-sm border transition-all
                ${mood === value
                  ? 'bg-brand-500/15 border-brand-500/40 text-white'
                  : 'bg-surface-muted border-surface-border text-slate-400 hover:border-slate-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Notes <span className="text-slate-600">(optional)</span></label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="What did you cover? Any blockers?"
          className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-2 text-sm text-white
            placeholder-slate-600 resize-none focus:outline-none focus:border-brand-500/60"
        />
      </div>

      {/* Error */}
      {error && <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          Log Session ⚡
        </Button>
      </div>
    </form>
  )
}
