import { AlertCircle } from 'lucide-react'

interface ErrorBannerProps {
  error?: Error | null
}

export function ErrorBanner({ error }: ErrorBannerProps) {
  if (!error) return null

  return (
    <div className="mb-4 bg-destructive-50 border border-destructive-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-destructive-600 shrink-0 mt-0.5" />
      <p className="text-sm text-destructive-800">{error.message}</p>
    </div>
  )
}
