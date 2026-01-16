'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import * as Popover from '@radix-ui/react-popover'
import { COLOR_THEME } from '@/lib/colors'
import { Check } from 'lucide-react'

interface ColorPickerProps {
  value?: string
  onSelect: (colorName: string) => void
}

export function ColorPicker({ value, onSelect }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const selectedColor = COLOR_THEME.find((c) => c.name === value)

  const handleColorSelect = (colorName: string) => {
    onSelect(colorName)
    setOpen(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-16 p-0 relative overflow-hidden"
        >
          <div
            className={`absolute inset-0 ${selectedColor?.class ?? 'bg-linear-to-br from-gray-300 to-gray-400'}`}
          />
          <span className="relative z-10 text-white font-medium text-xs drop-shadow">
            {selectedColor?.label ?? 'Color'}
          </span>
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 rounded-lg border border-border bg-white shadow-lg p-3"
          sideOffset={5}
          align="start"
        >
          <div className="grid grid-cols-3 gap-2">
            {COLOR_THEME.map((color) => (
              <button
                key={color.name}
                type="button"
                onClick={() => handleColorSelect(color.name)}
                className="relative group"
              >
                <div
                  className={`h-16 rounded-lg ${color.class} transition-transform group-hover:scale-105 flex items-center justify-center`}
                >
                  {value === color.name && (
                    <Check className="h-5 w-5 text-white drop-shadow" />
                  )}
                </div>
                <p className="text-xs text-center mt-1 text-muted-700">
                  {color.label}
                </p>
              </button>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
