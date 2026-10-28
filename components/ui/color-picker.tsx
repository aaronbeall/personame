'use client'

import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import * as Popover from '@radix-ui/react-popover'
import {
  COLOR_THEME,
  COLOR_THEMES,
  getColorTheme,
  getColorSurface,
} from '@/lib/colors'
import { Check, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ColorPickerProps {
  value?: string
  showLabel?: boolean
  onSelect: (value: string) => void
}

export function ColorPicker({
  value,
  showLabel = true,
  onSelect,
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)
  const selected = getColorTheme(value)
  const [tab, setTab] = useState<'solid' | 'themes'>(
    selected.colors.length > 1 ? 'themes' : 'solid',
  )
  const id = useId()
  const surface = getColorSurface(value ? selected.value : '#e5e7eb')
  const options =
    tab === 'solid'
      ? COLOR_THEME.map((color) => ({ label: color.label, value: color.hex }))
      : COLOR_THEMES.map((theme) => ({
          label: theme.label,
          value: theme.colors.join(','),
        }))
  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setTab(selected.colors.length > 1 ? 'themes' : 'solid')
      }}
    >
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
          style={{ background: surface.background, color: surface.textColor }}
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
          className="z-[90] w-72 max-w-[calc(100vw-24px)] rounded-lg border border-border bg-white shadow-lg p-3"
          sideOffset={5}
          align="start"
        >
          <div
            className="color-picker-tabs"
            role="tablist"
            aria-label="Color type"
          >
            {(['solid', 'themes'] as const).map((kind) => (
              <button
                type="button"
                role="tab"
                key={kind}
                id={`${id}-${kind}`}
                aria-controls={`${id}-panel`}
                aria-selected={tab === kind}
                tabIndex={tab === kind ? 0 : -1}
                data-color-tab={kind}
                onClick={() => setTab(kind)}
                onKeyDown={(event) => {
                  if (
                    !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(
                      event.key,
                    )
                  )
                    return
                  event.preventDefault()
                  const next =
                    event.key === 'Home'
                      ? 'solid'
                      : event.key === 'End'
                        ? 'themes'
                        : kind === 'solid'
                          ? 'themes'
                          : 'solid'
                  setTab(next)
                  event.currentTarget.parentElement
                    ?.querySelector<HTMLButtonElement>(
                      `[data-color-tab="${next}"]`,
                    )
                    ?.focus()
                }}
              >
                {kind === 'solid' ? 'Solid colors' : 'Themes'}
              </button>
            ))}
          </div>
          <div
            role="tabpanel"
            id={`${id}-panel`}
            aria-labelledby={`${id}-${tab}`}
          >
            <div className="grid grid-cols-3 gap-2">
              {options.map((option) => {
                const appearance = getColorSurface(option.value)
                const active = !!value && selected.value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-label={option.label}
                    aria-pressed={active}
                    onClick={() => {
                      onSelect(option.value)
                      setOpen(false)
                    }}
                    className="relative group"
                  >
                    <div
                      className="h-16 rounded-lg transition-transform group-hover:scale-105 flex items-center justify-center"
                      style={{
                        background: appearance.background,
                        color: appearance.textColor,
                      }}
                    >
                      {active && <Check className="h-5 w-5" />}
                    </div>
                    {showLabel && (
                      <p className="text-[11px] leading-4 text-center mt-1 text-muted-700">
                        {option.label}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>
            {tab === 'solid' && (
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
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
