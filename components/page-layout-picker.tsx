import type { PagePresentation } from '@/lib/quiz-presentation'

const layouts = [
  ['hero', 'Hero'],
  ['split', 'Split'],
  ['card', 'Card'],
  ['minimal', 'Minimal'],
] as const

export function PageLayoutPicker({ value, onChange }: {
  value: PagePresentation['layout']
  onChange: (value: PagePresentation['layout']) => void
}) {
  return <div className="page-layout-picker" role="group" aria-label="Page layout">
    {layouts.map(([layout, label]) => <button
      key={layout}
      type="button"
      aria-pressed={value === layout}
      data-layout={layout}
      onClick={() => onChange(layout)}
    >
      <span className="page-layout-diagram" aria-hidden="true"><i /><i /><i /></span>
      {label}
    </button>)}
  </div>
}
