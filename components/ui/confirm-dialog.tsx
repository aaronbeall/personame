'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title?: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'destructive' | 'default'
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleCancel}
      />

      {/* Dialog */}
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] p-4">
        <div className="bg-white rounded-lg shadow-lg border border-muted-200">
          <div className="flex items-start justify-between p-6 pb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-primary-900">{title}</h2>
              {description && (
                <p className="mt-2 text-sm text-muted-600">{description}</p>
              )}
            </div>
            <button
              onClick={handleCancel}
              className="ml-4 rounded-lg p-1 hover:bg-muted-100 transition-colors"
            >
              <X className="h-4 w-4 text-muted-500" />
            </button>
          </div>

          <div className="flex justify-end gap-3 p-6 pt-4">
            <Button variant="outline" onClick={handleCancel}>
              {cancelLabel}
            </Button>
            <Button variant={variant} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

// Hook for managing confirm dialog state
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<{
    title?: string
    description?: string
    confirmLabel?: string
    onConfirm: () => void
  }>({
    onConfirm: () => { },
  })

  const confirm = React.useCallback(
    (options: {
      title?: string
      description?: string
      confirmLabel?: string
      onConfirm: () => void
    }) => {
      setConfig(options)
      setIsOpen(true)
    },
    []
  )

  const dialog = (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      onConfirm={config.onConfirm}
      title={config.title}
      description={config.description}
      confirmLabel={config.confirmLabel}
    />
  )

  return { confirm, dialog }
}
