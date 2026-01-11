'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import { Input } from './input'

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  iconClassName?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  value?: string
  placeholder?: string
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, iconClassName, placeholder, value, onChange, ...props }, ref) => (
    <div className="relative">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-500", iconClassName)} />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={cn('pl-9', className)}
        {...props}
        ref={ref}
      />
    </div>
  )
)

SearchInput.displayName = 'SearchInput'
