// src/components/forms/TopicForm.jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { createTopic, updateTopic } from '../../lib/supabase.js'
import { Button } from '../ui/Button.jsx'

const CATEGORIES = [
  { value: 'frontend', label: '🎨 Frontend' },
  { value: 'backend',  label: '⚙️ Backend'  },
  { value: 'dsa',      label: '🔢 DSA'      },
  { value: 'project',  label: '🚀 Project'  },
]

/**
 * @param {object|null} existing  - pass existing topic to enable edit mode
 * @param {function}    onSuccess - called with the created/updated topic row
 * @param {function}    onCancel  - cancel handler
 */
export function TopicForm({ existing = null, onSuccess, onCancel }) {
  const { session } = useAuth()
  const isEdit = !!existing

  const [name, setName]             = useState(existing?.name ?? '')
  const [category, setCategory]     = useState(existing?.category ?? 'frontend')
  const [totalLessons, setTotal]    = useState(existing?.total_lessons ?? 10)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Topic name is required.')
    if (totalLessons < 1) return setError('Total lessons must be at least 1.')

    setLoading(true)
    try {
      let result
      if (isEdit) {
        const { data, error: err } = await updateTopic(existing.id, {
          name: name.trim(), category, total_lessons: totalLessons,
        })
        if (err) throw err
        result = data
      } else {
        const { data, error: err } = await createTopic(session.user.id, {
          name: name.trim(), category, totalLessons,
        })
        if (err) throw err
        result = data
      }
      onSuccess?.(result)
    } catch (err) {
      setError(err?.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Topic Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. React Hooks, Binary Trees…"
          className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-2 text-sm text-white
            placeholder-slate-600 focus:outline-none focus:border-brand-500/60"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              onClick={() => setCategory(value)}
              className={`py-2 rounded-lg text-sm border transition-all
                ${category === value
                  ? 'bg-brand-500/15 border-brand-500/40 text-white'
                  : 'bg-surface-muted border-surface-border text-slate-400 hover:border-slate-600'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Total lessons */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Total Lessons / Sessions</label>
        <input
          type="number"
          min={1}
          max={500}
          value={totalLessons}
          onChange={(e) => setTotal(Number(e.target.value))}
          className="w-full bg-surface-muted border border-surface-border rounded-lg px-3 py-2 text-sm text-white
            focus:outline-none focus:border-brand-500/60"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? 'Save Changes' : 'Add Topic'}
        </Button>
      </div>
    </form>
  )
}
