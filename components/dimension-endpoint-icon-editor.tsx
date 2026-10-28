'use client'

import { ArrowDown, ArrowUp, Pencil } from 'lucide-react'
import { EmojiPicker } from './ui/emoji-picker'
import { Button } from './ui/button'

export function DimensionEndpointIconEditor({
  emoji,
  end,
  onChange,
}: {
  emoji?: string | null
  end: 'low' | 'high'
  onChange: (emoji: string | null) => void
}) {
  const Arrow = end === 'low' ? ArrowDown : ArrowUp
  return (
    <span className="style-portrait endpoint-icon-editor">
      <span className="endpoint-icon-editor-face" aria-hidden="true">
        {emoji || <Arrow size={18} />}
      </span>
      <EmojiPicker
        value={emoji}
        onSelect={onChange}
        trigger={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="style-editor-trigger"
            aria-label={`Choose ${end} end icon`}
            title={`Edit ${end} end icon`}
          >
            <Pencil size={11} aria-hidden="true" />
          </Button>
        }
      />
    </span>
  )
}
