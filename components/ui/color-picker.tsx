'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import * as Popover from '@radix-ui/react-popover'
import { COLOR_THEME, getColorTheme, getColorSurface } from '@/lib/colors'
import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value?: string
  showLabel?: boolean
  onSelect: (hex: string) => void
}

export function ColorPicker({
  value,
  showLabel = true,
  onSelect,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = getColorTheme(value)
  const surface = getColorSurface(value ? selected.hex : '#e5e7eb')
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          aria-label={`Choose color${value ? `: ${selected.label}` : ''}`}
          title="Choose color"
          variant="outline"
          className={cn(
            'h-10 px-2 relative overflow-hidden',
            showLabel ? 'min-w-24 justify-center' : 'w-10',
          )}
          style={{
            background: surface.background,
            color: surface.textColor,
          }}
        >
          <span className="relative z-10 font-medium text-xs">
            {showLabel ? (
              value ? (
                selected.label
              ) : (
                'Color'
              )
            ) : (
              <Palette aria-hidden="true" className="h-4 w-4" />
            )}
          </span>
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="z-[90] w-64 rounded-lg border border-border bg-white shadow-lg p-3"
          sideOffset={5}
          align="start"
        >
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEME.map((color) => (
              <button
                key={color.hex}
                type="button"
                aria-label={color.label}
                aria-pressed={value?.toLowerCase() === color.hex}
                onClick={() => {
                  onSelect(color.hex)
                  setOpen(false)
                }}
                className="relative group"
              >
                <div
                  className="h-16 rounded-lg transition-transform group-hover:scale-105 flex items-center justify-center"
                  style={{
                    background: getColorSurface(color.hex).background,
                    color: getColorSurface(color.hex).textColor,
                  }}
                >
                  {value?.toLowerCase() === color.hex && (
                    <Check className="h-5 w-5" />
                  )}
                </div>
                {showLabel && (
                  <p className="text-xs text-center mt-1 text-muted-700">
                    {color.label}
                  </p>
                )}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-700">
            Custom color
            <input
              type="color"
              aria-label="Custom color"
              value={selected.hex}
              onChange={(event) => onSelect(event.target.value)}
              className="w-9 h-8 cursor-pointer"
            />
          </label>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
