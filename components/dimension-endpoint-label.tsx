/** Display selected endpoint emoji; absent icons take no space. */
export function DimensionEndpointLabel({
  label,
  emoji,
}: {
  label: string
  emoji?: string | null
  end: 'low' | 'high'
}) {
  return (
    <span className="dimension-endpoint-label">
      {emoji && (
        <span className="dimension-endpoint-icon" aria-hidden="true">
          {emoji}
        </span>
      )}
      <span>{label}</span>
    </span>
  )
}
