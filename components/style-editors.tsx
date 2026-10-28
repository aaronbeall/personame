'use client'

import * as Popover from '@radix-ui/react-popover'
import { ImagePlus, Pencil } from 'lucide-react'
import type { ReactNode } from 'react'
import { ColorPicker } from './ui/color-picker'
import { EmojiPicker } from './ui/emoji-picker'
import { Button } from './ui/button'

/** One entry point for an extensible appearance editor. Future image support belongs here. */
export function StyleEditors({
  emoji,
  color,
  onEmojiChange,
  onColorChange,
  children,
}: {
  children: ReactNode
  emoji?: string | null
  color?: string | null
  onEmojiChange: (emoji: string | null) => void
  onColorChange: (color: string) => void
}) {
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
            title="Edit icon, color, or image"
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
            <div className="style-editor-options">
              <label>
                Icon
                <EmojiPicker value={emoji} onSelect={onEmojiChange} />
              </label>
              <label>
                Color
                <ColorPicker
                  value={color ?? undefined}
                  onSelect={onColorChange}
                />
              </label>
              <label>
                <span>
                  Image <span className="style-image-soon">Soon</span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled
                  aria-label="Choose image (coming soon)"
                  title="Image selection is coming soon"
                >
                  <ImagePlus size={18} aria-hidden="true" />
                </Button>
              </label>
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
