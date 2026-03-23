// src/components/ui/Toast.jsx
import { useState, useCallback, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, Zap } from 'lucide-react'

const ICONS = {
  success: <CheckCircle size={18} className="text-brand-400" />,
  error:   <AlertCircle size={18} className="text-red-400" />,
  info:    <Info size={18} className="text-blue-400" />,
  xp:      <Zap size={18} className="text-accent-400" />,
}

const BORDERS = {
  success: 'border-brand-500/30',
  error:   'border-red-500/30',
  info:    'border-blue-500/30',
  xp:      'border-accent-500/30',
}

/** Individual toast item */
function ToastItem({ id, type = 'info', message, onRemove }) {
  return (
    <div
      className={`
        flex items-start gap-3 w-80 bg-surface-card border ${BORDERS[type]}
        rounded-xl px-4 py-3 shadow-2xl animate-slide-up
      `}
    >
      <div className="mt-0.5 shrink-0">{ICONS[type]}</div>
      <p className="text-sm text-slate-200 flex-1 leading-snug">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="shrink-0 text-slate-500 hover:text-white transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

/** Fixed container that renders all active toasts */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  )
}

/** Hook that manages toast state — use at app root, pass show() down via context or prop drilling */
export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const show = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
    return id
  }, [])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, show, remove }
}

// Re-export a singleton-style Toast component for direct use
export function Toast({ message, type }) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-card border ${BORDERS[type ?? 'info']}`}>
      {ICONS[type ?? 'info']}
      <span className="text-sm text-slate-200">{message}</span>
    </div>
  )
}
