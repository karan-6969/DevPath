// src/components/ui/Badge.jsx

const variants = {
  frontend: 'bg-blue-500/10   text-blue-400   border-blue-500/20',
  backend:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  dsa:      'bg-accent-500/10 text-accent-400 border-accent-500/20',
  project:  'bg-brand-500/10  text-brand-400  border-brand-500/20',
  default:  'bg-slate-500/10  text-slate-400  border-slate-500/20',
}

export function Badge({ label, variant = 'default', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 text-xs font-medium
        border rounded-full ${variants[variant] ?? variants.default} ${className}
      `}
    >
      {label}
    </span>
  )
}
