'use client'

import * as Popover from '@radix-ui/react-popover'
import { Pencil, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { ColorPicker } from './ui/color-picker'
import { SymbolPicker } from './ui/emoji-picker'
import { Button } from './ui/button'
import { ArtworkPicker } from './artwork-picker'
import type { Artwork } from '@/lib/quiz-artwork'

type StyleFieldsProps = {
  emoji?: string | null
  color?: string | null
  onEmojiChange: (emoji: string | null) => void
  onColorChange: (color: string) => void
  onClearColor?: () => void
  background?: Artwork | null
  onBackgroundChange?: (artwork: Artwork | null) => void
  imageLabel?: string
}

export function StyleFields({
  emoji,
  color,
  onEmojiChange,
  onColorChange,
  onClearColor,
  background,
  onBackgroundChange,
  imageLabel = 'Background image',
}: StyleFieldsProps) {
  return <div className="style-editor-options">
    <SymbolPicker value={emoji} color={color} onSelect={onEmojiChange} />
    <div className="style-color-actions">
      <ColorPicker value={color ?? undefined} showLabel={false} onSelect={onColorChange} />
      {onClearColor && color && <Button type="button" variant="ghost" size="icon" onClick={onClearColor} aria-label="Remove custom color"><Trash2 size={15} /></Button>}
    </div>
    {onBackgroundChange && <ArtworkPicker label={imageLabel} value={background ?? null} onChange={onBackgroundChange} />}
  </div>
}

export function StyleEditors({
  children,
  ...fields
}: {
  children: ReactNode
} & StyleFieldsProps) {
  return (
    <div className="style-portrait">
      <div className="style-portrait-content">{children}</div>
      <Popover.Root>
        <Popover.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="style-editor-trigger"
            aria-label="Edit style"
            title="Edit style"
          >
            <Pencil size={12} aria-hidden="true" />
          </Button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            className="style-editor-popover"
            sideOffset={8}
            align="start"
            aria-label="Style options"
          >
            <StyleFields {...fields} />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
