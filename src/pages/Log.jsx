// src/pages/Log.jsx
import { useState } from 'react'
import confetti from 'canvas-confetti'
import { useAuth } from '../context/AuthContext.jsx'
import { Card }    from '../components/ui/Card.jsx'
import { LogForm } from '../components/forms/LogForm.jsx'

export default function Log({ showToast }) {
  const { profile } = useAuth()
  const [result, setResult] = useState(null)

  function handleSuccess({ xpEarned, newStreak, streakContinued, newAchievements }) {
    setResult({ xpEarned, newStreak, streakContinued })

    showToast?.(`+${xpEarned} XP earned!`, 'xp')

    // Level-up check
    const prevLevel = Math.floor((profile?.xp ?? 0) / 500) + 1
    const newLevel  = Math.floor(((profile?.xp ?? 0) + xpEarned) / 500) + 1
    if (newLevel > prevLevel) {
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.55 } })
      showToast?.(`🎉 Level Up! You're now Level ${newLevel}!`, 'success', 6000)
    }

    newAchievements?.forEach((a) => {
      showToast?.(`${a.icon} ${a.title} unlocked!`, 'success', 6000)
    })
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">Log Session</h1>
        <p className="text-slate-400 text-sm mt-0.5">Record what you studied today and earn XP.</p>
      </div>

      {/* Success card */}
      {result && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-5 text-center animate-bounce-in">
          <p className="text-3xl mb-2">🔥</p>
          <p className="font-display font-semibold text-white text-lg">
            +{result.xpEarned} XP earned!
          </p>
          {result.newStreak > 1 && (
            <p className="text-brand-400 text-sm mt-1">
              {result.streakContinued ? '🔥' : '✅'} Streak: {result.newStreak} day{result.newStreak !== 1 ? 's' : ''}
            </p>
          )}
          <button
            onClick={() => setResult(null)}
            className="mt-3 text-xs text-slate-500 hover:text-slate-400 underline transition-colors"
          >
            Log another session
          </button>
        </div>
      )}

      {!result && (
        <Card>
          <LogForm onSuccess={handleSuccess} />
        </Card>
      )}
    </div>
  )
}
