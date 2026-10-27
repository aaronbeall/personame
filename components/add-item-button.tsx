import { Plus } from 'lucide-react'
import { EntityIcon, type EntityKind } from './entity-icon'

export function AddItemButton({
  label,
  description,
  onClick,
  disabled,
  entity,
}: {
  label: string
  description: string
  onClick: () => void
  disabled?: boolean
  entity?: EntityKind
}) {
  return (
    <button
      type="button"
      className="add-item-button"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="add-item-icon">
        {entity ? (
          <>
            <EntityIcon kind={entity} size={21} />
            <Plus size={10} className="add-item-plus" aria-hidden="true" />
          </>
        ) : (
          <Plus size={20} aria-hidden="true" />
        )}
      </span>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </button>
  )
}
