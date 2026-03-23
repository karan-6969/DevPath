// src/components/ui/Card.jsx
export function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`
        bg-surface-card border border-surface-border rounded-xl p-5
        ${hover ? 'hover:border-brand-500/40 transition-colors duration-200 cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
