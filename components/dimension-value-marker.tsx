import type { CSSProperties } from 'react'
import { describeDimensionValue } from '@/lib/dimension-value'
import {
  DimensionValueLabel,
  type DimensionValueLabelProps,
} from './dimension-value-label'

/** A persistent score callout attached to a decorative, read-only diamond. */
export function DimensionValueMarker({
  name,
  ...props
}: DimensionValueLabelProps & { name: string }) {
  const result = describeDimensionValue(
    props.value,
    props.minLabel,
    props.maxLabel,
  )
  return (
    <span
      className="dimension-value-marker"
      style={
        {
          '--value-position': `${result.score}%`,
          '--value-offset': `-${result.score}%`,
        } as CSSProperties
      }
      aria-label={`${name}: ${result.score} out of 100. ${result.description}`}
    >
      <span className="dimension-value-callout">
        <DimensionValueLabel {...props} />
      </span>
      <span className="dimension-value-diamond" aria-hidden="true" />
    </span>
  )
}
