/** Qualitative display language only; does not change the normalized score. */
export function describeDimensionValue(
  value: number,
  minLabel: string,
  maxLabel: string,
) {
  const score = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 50
  if (score === 50)
    return {
      score,
      end: null,
      intensity: 'Balanced',
      label: `${minLabel} / ${maxLabel}`,
      description: `Balanced — ${minLabel} / ${maxLabel}`,
    } as const
  const strength = Math.abs(score - 50) * 2
  const intensity =
    strength <= 20
      ? 'Slightly'
      : strength <= 40
        ? 'Somewhat'
        : strength <= 60
          ? 'Moderately'
          : strength <= 80
            ? 'Very'
            : 'Extremely'
  const end = score < 50 ? 'low' : 'high'
  const label = end === 'low' ? minLabel : maxLabel
  return {
    score,
    end,
    intensity,
    label,
    description: `${intensity} ${label}`,
  } as const
}
