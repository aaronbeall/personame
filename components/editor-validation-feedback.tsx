import { CircleAlert } from 'lucide-react'

export function EditorValidationFeedback({
  messages,
  id,
}: {
  messages: string[]
  id?: string
}) {
  if (!messages.length) return null
  return (
    <div
      className="editor-validation-feedback"
      id={id}
      role="status"
      aria-live="polite"
    >
      <CircleAlert size={14} aria-hidden="true" />
      <div>
        {messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </div>
    </div>
  )
}
