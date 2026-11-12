'use client'
import { QuizSymbol } from '@/components/quiz-symbol'

import { ArrowDown, ArrowUp, Pencil } from 'lucide-react'
import { SymbolPicker } from './ui/emoji-picker'
import { Button } from './ui/button'

export function DimensionEndpointIconEditor({
  emoji,
  color,
  end,
  onChange,
}: {
  emoji?: string | null
  color?: string | null
  end: 'low' | 'high'
  onChange: (emoji: string | null) => void
}) {
  const Arrow = end === 'low' ? ArrowDown : ArrowUp
  return (
    <span className="style-portrait endpoint-icon-editor">
      <span className="endpoint-icon-editor-face" aria-hidden="true">
        <QuizSymbol value={emoji} color={color} fallback={<Arrow size={18} />} />
      </span>
      <SymbolPicker
        value={emoji}
        color={color}
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
