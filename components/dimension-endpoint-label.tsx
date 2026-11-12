import { QuizSymbol } from '@/components/quiz-symbol'
/** Display selected endpoint emoji; absent icons take no space. */
export function DimensionEndpointLabel({
  label,
  emoji,
  color,
}: {
  label: string
  emoji?: string | null
  color?: string | null
  end: 'low' | 'high'
}) {
  return (
    <span className="dimension-endpoint-label">
      {emoji && (
        <span className="dimension-endpoint-icon" aria-hidden="true">
          <QuizSymbol value={emoji} color={color} />
        </span>
      )}
      <span>{label}</span>
    </span>
  )
}
