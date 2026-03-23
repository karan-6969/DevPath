// src/components/ui/Skeleton.jsx

/** Animated shimmer skeleton block */
export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`
        rounded-lg bg-gradient-to-r from-surface-muted via-surface-border to-surface-muted
        bg-[length:200%_100%] animate-shimmer ${className}
      `}
      {...props}
    />
  )
}

/** A full card-shaped skeleton */
export function CardSkeleton({ lines = 3 }) {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  )
}

/** A stat-card skeleton (number + label) */
export function StatSkeleton() {
  return (
    <div className="bg-surface-card border border-surface-border rounded-xl p-5">
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}
