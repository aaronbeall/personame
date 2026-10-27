'use client'
import { Check, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export function ItemEditorActions({
  name,
  valid,
  onDone,
  onCancel,
  onDelete,
}: {
  name?: string
  valid: boolean
  onDone: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  return (
    <div className="item-editor-actions">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={name ? `Delete ${name}` : undefined}
        onClick={onDelete}
        className="text-destructive-600"
      >
        <Trash2 size={14} />
        Delete
      </Button>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label={name ? `Cancel ${name}` : undefined}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label={name ? `Done ${name}` : undefined}
          onClick={onDone}
          disabled={!valid}
        >
          <Check size={14} />
          Done
        </Button>
      </div>
    </div>
  )
}
