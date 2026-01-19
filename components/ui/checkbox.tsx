import * as React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, id, disabled, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id || `checkbox-${generatedId}`

    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={checkboxId}
          ref={ref}
          disabled={disabled}
          className="sr-only"
          {...props}
        />
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-center justify-center h-5 w-5 rounded border-2 border-muted-400',
            'cursor-pointer transition-all',
            'hover:border-primary-500 hover:bg-primary-50',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'has-[:checked]:border-primary-600 has-[:checked]:bg-primary-600',
            className
          )}
        >
          <input
            type="checkbox"
            id={`${checkboxId}-hidden`}
            disabled={disabled}
            className="sr-only peer"
            {...props}
            ref={ref}
          />
          <Check className="h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
        </label>
        {label && (
          <label
            htmlFor={checkboxId}
            className={cn(
              'text-sm text-muted-700 cursor-pointer select-none',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
