'use client'

import { archetypeValidationMessages } from '@/lib/builder-validation'
import { ItemEditorActions } from '@/components/item-editor-actions'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dimension, ArchetypeDimension, Archetype } from '@prisma/client'
import { StyleEditors } from '@/components/style-editors'
import { getTempId } from '@/lib/utils'
import { ArchetypeBadge } from '@/components/entity-identity'
import { DimensionTargetEditor } from './dimension-target-editor'

interface ArchetypeEditorProps {
  archetype: Archetype & { dimensions: ArchetypeDimension[] }
  dimensions: Dimension[]
  onChange: (
    archetype: Archetype & { dimensions: ArchetypeDimension[] },
  ) => void
  onClose: () => void
  onCancel: () => void
  onDelete: () => void
}

export function ArchetypeEditor({
  archetype,
  dimensions,
  onChange,
  onClose,
  onCancel,
  onDelete,
}: ArchetypeEditorProps) {
  const { name, description, emoji, color } = archetype
  const dimensionTargets = archetype.dimensions
  const update = (patch: Partial<typeof archetype>) =>
    onChange({ ...archetype, ...patch })
  const setName = (name: string) => update({ name })
  const setDescription = (description: string) => update({ description })
  const setEmoji = (emoji: string | null) => update({ emoji })
  const setColor = (color: string) => update({ color })
  const updateTarget = (
    dimensionId: string,
    patch: Partial<ArchetypeDimension>,
  ) => {
    const existing = dimensionTargets.find((t) => t.dimensionId === dimensionId)
    const target = existing ?? {
      id: getTempId(),
      archetypeId: archetype.id,
      dimensionId,
      targetValue: 50,
      relevance: 0.8,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    update({
      dimensions: [
        ...dimensionTargets.filter((t) => t.dimensionId !== dimensionId),
        { ...target, ...patch },
      ],
    })
  }
  const handleTargetValueChange = (dimensionId: string, targetValue: number) =>
    updateTarget(dimensionId, { targetValue })
  const handleRelevanceChange = (dimensionId: string, relevance: number) =>
    updateTarget(dimensionId, { relevance })

  return (
    <div className="archetype-editor space-y-6">
      {/* Header with Profile */}
      <div className="archetype-editor-header flex items-start gap-5">
        <div className="flex flex-col items-center flex-shrink-0">
          <StyleEditors
            emoji={emoji}
            color={color}
            onEmojiChange={setEmoji}
            onColorChange={setColor}
          >
            <ArchetypeBadge
              name={name}
              emoji={emoji}
              color={color}
              size={80}
              label={false}
            />
          </StyleEditors>
        </div>
        <div className="flex-1">
          <div className="mb-4">
            <label
              htmlFor={`archetype-name-${archetype.id}`}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Name
            </label>
            <Input
              id={`archetype-name-${archetype.id}`}
              placeholder="e.g., The Explorer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-semibold"
            />
          </div>
          <div>
            <label
              htmlFor={`archetype-description-${archetype.id}`}
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Description <span className="field-optional">(optional)</span>
            </label>
            <Textarea
              id={`archetype-description-${archetype.id}`}
              placeholder="Describe this archetype..."
              value={description ?? ''}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Dimension Targets */}
      <div className="border-t border-muted-300 pt-6 space-y-4">
        <h3 className="font-semibold text-slate-900 text-sm">
          Dimension Targets
        </h3>
        <div className="space-y-6">
          {dimensions.map((dimension) => {
            const target = dimensionTargets.find(
              (t) => t.dimensionId === dimension.id,
            )
            const targetValue = target?.targetValue ?? 50
            const relevance = target?.relevance ?? 0.8

            return (
              <DimensionTargetEditor
                key={dimension.id}
                dimension={dimension}
                targetValue={targetValue}
                relevance={relevance}
                onTargetChange={(val) =>
                  handleTargetValueChange(dimension.id, val)
                }
                onRelevanceChange={(val) =>
                  handleRelevanceChange(dimension.id, val)
                }
              />
            )
          })}
        </div>
      </div>

      <ItemEditorActions
        valid={archetypeValidationMessages(archetype).length === 0}
        validationMessages={archetypeValidationMessages(archetype)}
        onDone={onClose}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </div>
  )
}
