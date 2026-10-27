'use client'

import { useId, type CSSProperties } from 'react'
import { DimensionDisplayScale } from '@prisma/client'

const options = [
  {
    value: DimensionDisplayScale.PERCENT_ASCENDING,
    name: 'Ascending',
    labels: ['0%', '50%', '100%'],
  },
  {
    value: DimensionDisplayScale.PERCENT_DESCENDING,
    name: 'Descending',
    labels: ['100%', '50%', '0%'],
  },
  {
    value: DimensionDisplayScale.BIPOLAR,
    name: 'Bipolar',
    labels: ['−100%', '0%', '100%'],
  },
] as const

/** Saved presentation preference only; does not transform dimension values. */
export function DimensionDisplayScaleSelector({
  value,
  color,
  onChange,
}: {
  value: DimensionDisplayScale
  color: string
  onChange: (value: DimensionDisplayScale) => void
}) {
  const groupId = useId()
  return (
    <fieldset className="space-y-1.5" title="Display preview only. Saved scores stay 0–100.">
      <legend className="text-sm font-medium text-slate-700">
        Scale display
      </legend>
      <div className="scale-choice-bar" style={{ '--dimension-color': color } as CSSProperties}>
        {options.map((option) => (
          <label key={option.value} className="scale-choice">
            <input
              type="radio"
              name={groupId}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-label={`${option.name}: ${option.labels[0]} to ${option.labels[2]}`}
              className="scale-choice-input"
            />
            <span className="scale-choice-content">
              <span className="scale-choice-name">
                {option.labels[0]} → {option.labels[2]}
              </span>
              <span
                className={`scale-choice-preview scale-choice-preview-${option.value.toLowerCase()}`}
                aria-hidden="true"
              />
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
