// src/components/ui/ProgressBar.jsx

/**
 * @param {number}  value     - 0 to 100
 * @param {string}  color     - Tailwind bg class, default brand-500
 * @param {string}  size      - 'sm' | 'md' | 'lg'
 * @param {boolean} animated  - glow pulse effect
 */
export function ProgressBar({ value = 0, color = 'bg-brand-500', size = 'md', animated = false, className = '' }) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }
  const clamped = Math.min(Math.max(value, 0), 100)

  return (
    <div className={`w-full bg-surface-muted rounded-full overflow-hidden ${heights[size]} ${className}`}>
      <div
        className={`${color} ${heights[size]} rounded-full transition-all duration-700 ease-out ${animated ? 'shadow-[0_0_8px_0_rgba(34,197,94,0.6)]' : ''}`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
