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
      <div className="editor-validation-messages">
        {messages.map((message, index) => {
          const separator = message.indexOf(': ')
          return (
            <p key={`${index}-${message}`}>
              {separator < 0 ? (
                message
              ) : (
                <>
                  <strong>{message.slice(0, separator)}</strong>
                  {message.slice(separator)}
                </>
              )}
            </p>
          )
        })}
      </div>
    </div>
  )
}
