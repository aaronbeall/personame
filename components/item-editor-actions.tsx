'use client'
import { useId } from 'react'
import { EditorValidationFeedback } from './editor-validation-feedback'
import { Check, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

export function ItemEditorActions({
  name,
  valid,
  validationMessages,
  onDone,
  onCancel,
  onDelete,
}: {
  name?: string
  valid: boolean
  validationMessages?: string[]
  onDone: () => void
  onCancel: () => void
  onDelete: () => void
}) {
  const feedbackId = useId()
  const messages = valid
    ? []
    : (validationMessages ?? ['Complete the required fields to continue.'])
  return (
    <div className="item-editor-actions">
      <EditorValidationFeedback messages={messages} id={feedbackId} />
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
          aria-describedby={messages.length ? feedbackId : undefined}
          disabled={!valid}
        >
          <Check size={14} />
          Done
        </Button>
      </div>
    </div>
  )
}
