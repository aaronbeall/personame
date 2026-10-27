'use client'

import { DimensionEndpointLabel } from '@/components/dimension-endpoint-label'
import { EntityIcon } from '@/components/entity-icon'
import { Button } from '@/components/ui/button'
import { Dimension, ArchetypeDimension, Archetype } from '@prisma/client'
import { Edit2 } from 'lucide-react'
import { getColorTheme } from '@/lib/colors'
import type { CSSProperties } from 'react'
import { useConfirmDialog } from '@/components/ui/confirm-dialog'
import { StyleEditors } from '@/components/style-editors'
import { ArchetypeEditor } from './archetype-editor'
import {
  ArchetypeBadge,
  DimensionTag,
  getArchetypeTheme,
} from '@/components/entity-identity'

interface ArchetypeRowProps {
  archetype: Archetype & { dimensions: ArchetypeDimension[] }
  dimensions: Dimension[]
  onChange: (archetype: Archetype & { dimensions: ArchetypeDimension[] }) => void
  onDelete: () => void
  isEditing: boolean
  onEdit: () => void
  onDone: () => void
  onCancel: () => void
}

export function ArchetypeRow({
  archetype,
  dimensions,
  onChange,
  onDelete,
  isEditing,
  onEdit,
  onDone,
  onCancel,
}: ArchetypeRowProps) {
  const colorInfo = getArchetypeTheme(archetype.color, archetype.name)
  const { confirm, dialog } = useConfirmDialog()

  const handleDelete = () => {
    confirm({
      title: 'Delete Archetype?',
      description: `Are you sure you want to delete "${archetype.name}"? You can restore it with Reset until you save.`,
      confirmLabel: 'Delete Archetype',
      onConfirm: onDelete,
    })
  }

  if (isEditing) {
    return (
      <>
        {dialog}
        <ArchetypeEditor
          archetype={archetype}
          dimensions={dimensions}
          onChange={onChange}
          onClose={onDone}
          onCancel={onCancel}
          onDelete={handleDelete}
        />
      </>
    )
  }

  return (
    <>
      {dialog}
      <article
        className="archetype-view"
        style={{ '--archetype-color': colorInfo.hex } as CSSProperties}
      >
        <header className="archetype-view-header">
          <StyleEditors
            emoji={archetype.emoji}
            color={archetype.color}
            onEmojiChange={(emoji) => onChange({ ...archetype, emoji })}
            onColorChange={(color) => onChange({ ...archetype, color })}
          >
            <ArchetypeBadge
              name={archetype.name}
              emoji={archetype.emoji}
              color={archetype.color}
            />
          </StyleEditors>
          <div className="archetype-view-identity">
            <h3>{archetype.name}</h3>
            {archetype.description && <p>{archetype.description}</p>}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="archetype-view-edit"
          >
            <Edit2 size={14} />
            Edit
          </Button>
        </header>
        <div className="archetype-view-profile">
          <h4 className="entity-heading">
            <EntityIcon kind="dimension" size={12} />
            Dimension profile
          </h4>
          <div className="archetype-dimensions">
            {dimensions
              .map((dimension) => ({
                dimension,
                target: archetype.dimensions.find((t) => t.dimensionId === dimension.id),
              }))
              .sort(
                (a, b) =>
                  (b.target?.relevance ?? 0) - (a.target?.relevance ?? 0),
              )
              .map(({ dimension, target }) => {
                const value = target?.targetValue ?? 50
                const importance = Math.round((target?.relevance ?? 0) * 100)
                const color = getColorTheme(dimension.color)
                return (
                  <div
                    className="archetype-dimension"
                    key={dimension.id}
                    style={{ '--dimension-color': color.hex } as CSSProperties}
                  >
                    <div className="archetype-dimension-heading">
                      <span className="archetype-dimension-name">
                        <DimensionTag
                          name={dimension.name}
                          emoji={dimension.emoji}
                          color={dimension.color}
                        />
                      </span>
                      <span className="archetype-dimension-stat">
                        Target{' '}
                        <strong>
                          {Math.round(value)}
                          <span>/100</span>
                        </strong>
                      </span>
                      <span className="archetype-dimension-stat archetype-dimension-importance">
                        Importance <strong>{importance}%</strong>
                      </span>
                    </div>
                    <div
                      className="archetype-target-track"
                      role="meter"
                      aria-label={`${dimension.name} target`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={value}
                    >
                      <span
                        className="archetype-target-fill"
                        style={{ width: `${value}%` }}
                      />
                      <span
                        className="archetype-target-point"
                        style={{ left: `${value}%` }}
                      />
                    </div>
                    <div className="archetype-target-ends">
                      <DimensionEndpointLabel
                        label={dimension.minLabel || '0'}
                        emoji={dimension.minEmoji}
                        end="low"
                      />
                      <DimensionEndpointLabel
                        label={dimension.maxLabel || '100'}
                        emoji={dimension.maxEmoji}
                        end="high"
                      />
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </article>
    </>
  )
}
