import * as React from 'react'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        {
          'border-transparent bg-primary text-white hover:bg-primary-600':
            variant === 'default',
          'border-transparent bg-secondary text-white hover:bg-secondary-600':
            variant === 'secondary',
          'border-transparent bg-destructive text-white hover:bg-destructive-600':
            variant === 'destructive',
          'border-border text-muted-900 bg-muted-50': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }
