'use client'
import { useId } from 'react'
import { EditorValidationFeedback } from './editor-validation-feedback'
import { ArrowRight, RotateCcw, Save } from 'lucide-react'
import { Button } from './ui/button'

export function BuilderSaveActions({
  dirty,
  valid,
  validationMessages,
  busy,
  busyAction = 'continue',
  onReset,
  onSave,
}: {
  dirty: boolean
  valid: boolean
  validationMessages?: string[]
  busy: boolean
  busyAction?: 'save' | 'continue'
  onReset: () => void
  onSave: (advance: boolean) => void
}) {
  const feedbackId = useId()
  const messages = valid
    ? []
    : (validationMessages ?? ['Complete the required fields to continue.'])
  return (
    <div className="builder-save-group">
      <EditorValidationFeedback messages={messages} id={feedbackId} />
      <div className="builder-save-actions">
        <Button
          type="button"
          variant="ghost"
          disabled={!dirty || busy}
          onClick={onReset}
        >
          <RotateCcw size={14} />
          Reset
        </Button>
        <Button
          type="button"
          variant="outline"
          aria-describedby={messages.length ? feedbackId : undefined}
          disabled={!dirty || !valid || busy}
          loading={busy && busyAction === 'save'}
          onClick={() => onSave(false)}
        >
          <Save size={14} />
          {busy && busyAction === 'save' ? 'Saving…' : 'Save'}
        </Button>
        <Button
          type="button"
          loading={busy && busyAction === 'continue'}
          className="builder-primary-action"
          aria-describedby={messages.length ? feedbackId : undefined}
          disabled={!valid || busy}
          onClick={() => onSave(true)}
        >
          {busy && busyAction === 'continue' ? 'Saving…' : 'Save & continue'}
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  )
}
