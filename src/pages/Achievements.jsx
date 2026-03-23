// src/pages/Achievements.jsx
import { useState, useEffect } from 'react'
import { useAuth }   from '../context/AuthContext.jsx'
import { fetchAchievements, createAchievement } from '../lib/supabase.js'
import { fetchLogs, fetchTopics }               from '../lib/supabase.js'
import { getNewAchievements, ACHIEVEMENT_DEFINITIONS } from '../lib/achievements.js'
import { Card }      from '../components/ui/Card.jsx'
import { CardSkeleton } from '../components/ui/Skeleton.jsx'

export default function Achievements({ showToast }) {
  const { session, profile } = useAuth()
  const [unlocked, setUnlocked]   = useState([])  // achievement titles already unlocked
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    if (!session?.user?.id) return
    loadAndCheck()
  }, [session?.user?.id, profile?.xp])

  async function loadAndCheck() {
    const userId = session.user.id

    // Fetch existing achievements
    const { data: existingAch } = await fetchAchievements(userId)
    const alreadyUnlockedTitles = (existingAch ?? []).map((a) => a.title)
    setUnlocked(alreadyUnlockedTitles)

    // Build context for checking new achievements
    const [{ data: logs }, { data: topics }] = await Promise.all([
      fetchLogs(userId),
      fetchTopics(userId),
    ])

    const context = {
      xp:        profile?.xp ?? 0,
      streak:    profile?.streak ?? 0,
      totalLogs: (logs ?? []).length,
      logs:      logs ?? [],
      topics:    topics ?? [],
    }

    const newAchs = getNewAchievements(context, alreadyUnlockedTitles)
    for (const ach of newAchs) {
      await createAchievement(userId, { title: ach.title, description: ach.description, icon: ach.icon })
      showToast?.(`${ach.icon} Achievement unlocked: ${ach.title}!`, 'success', 5000)
    }

    if (newAchs.length > 0) {
      const newTitles = newAchs.map((a) => a.title)
      setUnlocked((prev) => [...prev, ...newTitles])
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Achievements</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {unlocked.length}/{ACHIEVEMENT_DEFINITIONS.length} unlocked
        </p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} lines={2} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENT_DEFINITIONS.map((def) => {
            const isUnlocked = unlocked.includes(def.title)
            return (
              <Card
                key={def.id}
                className={`transition-all duration-300 ${
                  isUnlocked
                    ? 'border-brand-500/30 bg-brand-500/5'
                    : 'opacity-50 grayscale'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className={`text-3xl shrink-0 ${isUnlocked ? '' : 'grayscale opacity-40'}`}>
                    {def.icon}
                  </span>
                  <div>
                    <p className={`font-display font-semibold text-sm ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                      {def.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.description}</p>
                    {isUnlocked && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-brand-400 font-medium">
                        ✓ Unlocked
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
