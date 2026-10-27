'use client'
import { ArrowRight, RotateCcw, Save } from 'lucide-react'
import { Button } from './ui/button'

export function BuilderSaveActions({
  dirty,
  valid,
  busy,
  busyAction = 'continue',
  onReset,
  onSave,
}: {
  dirty: boolean
  valid: boolean
  busy: boolean
  busyAction?: 'save' | 'continue'
  onReset: () => void
  onSave: (advance: boolean) => void
}) {
  return (
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
        disabled={!valid || busy}
        onClick={() => onSave(true)}
      >
        {busy && busyAction === 'continue' ? 'Saving…' : 'Save & continue'}
        <ArrowRight size={16} />
      </Button>
    </div>
  )
}
