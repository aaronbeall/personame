import { cn } from '@/lib/utils'

/** Replace this graphic with the future illustrated animation; callers stay unchanged. */
export function LoadingIndicator({
  label = 'Loading…',
  decorative = false,
  className,
}: {
  label?: string
  decorative?: boolean
  className?: string
}) {
  return (
    <span
      className={cn('loading-indicator', className)}
      role={decorative ? undefined : 'status'}
    >
      <span className="loading-spinner" aria-hidden="true" />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <span className={cn('skeleton', className)} aria-hidden="true" />
}

/** Content-shaped placeholders for data loads. Never render interactive dummy controls. */
export function LoadingState({
  label = 'Loading…',
  variant = 'editor',
}: {
  label?: string
  variant?: 'cards' | 'editor' | 'quiz' | 'result'
}) {
  return (
    <section
      className={`loading-state loading-state-${variant}`}
      role="status"
      aria-label={label}
      aria-busy="true"
    >
      <div className="loading-intro">
        <div className="loading-caption">
          <LoadingIndicator decorative />
          <span>{label}</span>
        </div>
      </div>
      <div
        className={variant === 'cards' ? 'quiz-grid' : 'loading-panels'}
        aria-hidden="true"
      >
        {Array.from(
          { length: variant === 'cards' ? 3 : variant === 'editor' ? 2 : 1 },
          (_, i) => (
            <div className="loading-panel" key={i}>
              <div className="loading-heading">
                <Skeleton
                  className={
                    variant === 'result'
                      ? 'skeleton-avatar skeleton-avatar-large'
                      : 'skeleton-avatar'
                  }
                />
                <div className="loading-lines">
                  <Skeleton className="skeleton-title" />
                  <Skeleton className="skeleton-text" />
                </div>
              </div>
              <Skeleton className="skeleton-text" />
              <Skeleton className="skeleton-text skeleton-short" />
              {variant !== 'cards' && (
                <>
                  <Skeleton className="skeleton-field" />
                  <Skeleton className="skeleton-field" />
                </>
              )}
              <Skeleton className="skeleton-action" />
            </div>
          ),
        )}
      </div>
    </section>
  )
}
