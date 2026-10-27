'use client'
import { dimensionValidationMessages } from '@/lib/builder-validation'
import { LoadingState } from '@/components/ui/loading'

import { BuilderFooter } from '@/components/builder-footer'
import { AddItemButton } from '@/components/add-item-button'
import { StepProgress } from '@/components/step-progress'
import { DimensionSymbol } from '@/components/entity-identity'
import { DimensionEndpointIconEditor } from '@/components/dimension-endpoint-icon-editor'
import { DimensionScale } from '@/components/dimension-scale'
import { DimensionDisplayScale } from '@prisma/client'
import { DimensionDisplayScaleSelector } from '@/components/dimension-display-scale-selector'
import { ItemEditorActions } from '@/components/item-editor-actions'
import { useItemEditor } from '@/hooks/use-item-editor'
import { useBuilderDraft } from '@/hooks/use-builder-draft'
import { BuilderSaveActions } from '@/components/builder-save-actions'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StyleEditors } from '@/components/style-editors'
import { ErrorBanner } from '@/components/ui/error-banner'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { getColorTheme, getColorThemeByIndex } from '@/lib/colors'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Edit2, FileText, Tag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { use, useState } from 'react'

interface Dimension {
  id: string
  name: string
  description: string
  minEmoji?: string | null
  maxEmoji?: string | null
  minLabel: string
  maxLabel: string
  order: number
  displayScale: DimensionDisplayScale
  emoji?: string
  color?: string
}

export default function DimensionsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  useProtectedPage()
  const { id } = use(params)
  const [message, setMessage] = useState('')

  const { data: fetchedDimensions, error: loadError } = useQuery({
    queryKey: ['dimensions', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/dimensions`)
      if (!res.ok) throw new Error('Failed to fetch dimensions')
      const data = (await res.json()) as Dimension[]
      return data.map((m) => ({
        ...m,
        description: m.description ?? '',
        minLabel: m.minLabel ?? '',
        maxLabel: m.maxLabel ?? '',
        emoji: m.emoji ?? '',
        color: m.color ?? '',
      }))
    },
  })

  const draft = useBuilderDraft<Dimension[]>(fetchedDimensions, id)
  const dimensions = draft.value ?? []
  const setDimensions = (items: Dimension[]) => {
    draft.update(items)
    setMessage('')
  }

  const itemEditor = useItemEditor(dimensions, setDimensions)
  const { editing } = itemEditor

  const saveDimensionsMutation = useMutation({
    mutationFn: async ({
      items: dimensionsToSave,
      advance,
    }: {
      items: Dimension[]
      advance: boolean
    }) => {
      const res = await fetch(`/api/personames/${id}/dimensions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dimensions: dimensionsToSave }),
      })

      if (!res.ok) {
        throw new Error((await res.json()).error ?? 'Failed to save dimensions')
      }

      const data = (await res.json()) as Dimension[]
      return {
        data: data.map((m) => ({
          ...m,
          description: m.description ?? '',
          minLabel: m.minLabel ?? '',
          maxLabel: m.maxLabel ?? '',
          emoji: m.emoji ?? '',
          color: m.color ?? '',
        })),
        advance,
      }
    },
    onSuccess: async ({ data, advance }) => {
      draft.accept(data)
      itemEditor.closeAll()
      setMessage('Changes saved.')
      queryClient.setQueryData(['dimensions', id], data)
      queryClient.invalidateQueries({ queryKey: ['archetypes', id] })
      queryClient.invalidateQueries({ queryKey: ['questions', id] })
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      if (advance) router.push(`/create/${id}/archetypes`)
    },
  })

  const addDimension = () => {
    const newDimension: Dimension = {
      id: `temp-${Date.now()}`,
      name: '',
      description: '',
      minEmoji: null,
      maxEmoji: null,
      minLabel: '',
      maxLabel: '',
      order: dimensions.length,
      displayScale: DimensionDisplayScale.PERCENT_ASCENDING,
      emoji: '',
      color: getColorThemeByIndex(dimensions.length).hex,
    }
    setDimensions([...dimensions, newDimension])
    itemEditor.startNew(newDimension.id)
  }

  const updateDimension = <K extends keyof Dimension>(
    id: string,
    field: K,
    value: Dimension[K],
  ) => {
    setDimensions(
      dimensions.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    )
  }

  const removeDimension = (id: string) => {
    setDimensions(dimensions.filter((m) => m.id !== id))
  }

  const saveDimensions = (advance: boolean) => {
    if (dimensions.length === 0) {
      return
    }

    if (
      dimensions.some(
        (m) => !m.name.trim() || !m.minLabel.trim() || !m.maxLabel.trim(),
      )
    ) {
      return
    }

    if (!draft.dirty) {
      if (advance) router.push(`/create/${id}/archetypes`)
      return
    }
    saveDimensionsMutation.mutate({ items: dimensions, advance })
  }

  const validationMessages = dimensions.length
    ? dimensions.flatMap((dimension, index) =>
        dimensionValidationMessages(dimension).map(
          (message) =>
            `${dimension.name.trim() || `Dimension ${index + 1}`}: ${message}`,
        ),
      )
    : ['Add a dimension to continue.']
  const isValid = validationMessages.length === 0

  if (!draft.ready && !loadError)
    return (
      <AppLayoutBackground>
        <div className="max-w-4xl mx-auto">
          <LoadingState label="Loading your dimensions…" />
        </div>
      </AppLayoutBackground>
    )

  return (
    <AppLayoutBackground>
      <div className="max-w-4xl mx-auto">
        <StepProgress
          steps={[]}
          title="Define your dimensions"
          description="Choose the personality dimensions your quiz will measure. Start with one or aim for three to five."
        />

        <Card className="builder-panel">
          <CardContent className="builder-panel-body">
            <fieldset
              disabled={saveDimensionsMutation.isPending}
              className="space-y-5 min-w-0"
            >
              <ErrorBanner error={saveDimensionsMutation.error || loadError} />
              {dimensions.map((dimension, index) => {
                const colorInfo = getColorTheme(
                  dimension.color ?? undefined,
                  index,
                )
                const name = dimension.name || `Dimension ${index + 1}`
                const min = dimension.minLabel || 'Min'
                const max = dimension.maxLabel || 'Max'

                return (
                  <div
                    key={dimension.id}
                    className="builder-record dimension-record space-y-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="flex shrink-0 flex-col items-center">
                          <StyleEditors
                            emoji={dimension.emoji}
                            color={dimension.color}
                            onEmojiChange={(emoji) =>
                              updateDimension(
                                dimension.id,
                                'emoji',
                                emoji ?? '',
                              )
                            }
                            onColorChange={(color) =>
                              updateDimension(dimension.id, 'color', color)
                            }
                          >
                            <DimensionSymbol
                              name={name}
                              emoji={dimension.emoji}
                              color={dimension.color}
                            />
                          </StyleEditors>
                        </div>
                        {(dimension.name || dimension.description) && (
                          <div className="min-w-0">
                            {dimension.name && (
                              <h3 className="font-semibold text-primary-900 truncate">
                                {dimension.name}
                              </h3>
                            )}
                            {dimension.description && (
                              <p className="text-xs text-muted-500 whitespace-pre-wrap break-words">
                                {dimension.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {!editing.includes(dimension.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Edit ${name}`}
                          onClick={() => itemEditor.edit(dimension)}
                        >
                          <Edit2 size={14} />
                          Edit
                        </Button>
                      )}
                    </div>

                    {!editing.includes(dimension.id) && (
                      <DimensionScale
                        minLabel={min}
                        maxLabel={max}
                        minEmoji={dimension.minEmoji}
                        maxEmoji={dimension.maxEmoji}
                        color={colorInfo.hex}
                      />
                    )}

                    {editing.includes(dimension.id) && (
                      <fieldset
                        disabled={saveDimensionsMutation.isPending}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor={`dimension-name-${dimension.id}`}
                              className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700"
                            >
                              <Tag className="h-4 w-4 text-primary" />
                              Name
                            </label>
                            <Input
                              id={`dimension-name-${dimension.id}`}
                              placeholder="e.g., Extraversion"
                              value={dimension.name}
                              onChange={(e) =>
                                updateDimension(
                                  dimension.id,
                                  'name',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label
                              htmlFor={`dimension-description-${dimension.id}`}
                              className="flex items-center gap-2 text-sm font-medium mb-2 text-slate-700"
                            >
                              <FileText className="h-4 w-4 text-secondary" />
                              Description{' '}
                              <span className="field-optional">(optional)</span>
                            </label>
                            <Textarea
                              rows={3}
                              id={`dimension-description-${dimension.id}`}
                              placeholder="What this measures..."
                              value={dimension.description}
                              onChange={(e) =>
                                updateDimension(
                                  dimension.id,
                                  'description',
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <DimensionEndpointIconEditor
                                emoji={dimension.minEmoji}
                                end="low"
                                onChange={(emoji) =>
                                  updateDimension(
                                    dimension.id,
                                    'minEmoji',
                                    emoji,
                                  )
                                }
                              />
                              <label
                                htmlFor={`dimension-min-${dimension.id}`}
                                className="flex items-center gap-2 text-sm font-medium text-slate-700"
                              >
                                Low End Label
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`dimension-min-${dimension.id}`}
                                placeholder="e.g., Introverted"
                                value={dimension.minLabel}
                                onChange={(e) =>
                                  updateDimension(
                                    dimension.id,
                                    'minLabel',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <DimensionEndpointIconEditor
                                emoji={dimension.maxEmoji}
                                end="high"
                                onChange={(emoji) =>
                                  updateDimension(
                                    dimension.id,
                                    'maxEmoji',
                                    emoji,
                                  )
                                }
                              />
                              <label
                                htmlFor={`dimension-max-${dimension.id}`}
                                className="flex items-center gap-2 text-sm font-medium text-slate-700"
                              >
                                High End Label
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                id={`dimension-max-${dimension.id}`}
                                placeholder="e.g., Extraverted"
                                value={dimension.maxLabel}
                                onChange={(e) =>
                                  updateDimension(
                                    dimension.id,
                                    'maxLabel',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <DimensionDisplayScaleSelector
                          color={colorInfo.hex}
                          value={dimension.displayScale}
                          onChange={(value) =>
                            updateDimension(dimension.id, 'displayScale', value)
                          }
                        />
                        <ItemEditorActions
                          name={name}
                          valid={
                            dimensionValidationMessages(dimension).length === 0
                          }
                          validationMessages={dimensionValidationMessages(
                            dimension,
                          )}
                          onDone={() => itemEditor.done(dimension.id)}
                          onCancel={() => itemEditor.cancel(dimension.id)}
                          onDelete={() => {
                            removeDimension(dimension.id)
                            itemEditor.done(dimension.id)
                          }}
                        />
                      </fieldset>
                    )}
                  </div>
                )
              })}

              <AddItemButton
                entity="dimension"
                label="Add Dimension"
                description="Add a personality dimension to measure."
                onClick={addDimension}
                disabled={
                  !draft.ready ||
                  saveDimensionsMutation.isPending ||
                  dimensions.length >= 8
                }
              />
            </fieldset>
          </CardContent>

          <BuilderFooter
            note={
              message ||
              'One dimension required. Three to five is a good starting point.'
            }
            back={
              <Link href={`/create/${id}/name`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </Link>
            }
          >
            <BuilderSaveActions
              dirty={draft.dirty}
              valid={draft.ready && isValid}
              validationMessages={draft.ready ? validationMessages : []}
              busy={saveDimensionsMutation.isPending}
              busyAction={
                saveDimensionsMutation.variables?.advance ? 'continue' : 'save'
              }
              onReset={() => {
                draft.reset()
                itemEditor.closeAll()
                setMessage('')
                saveDimensionsMutation.reset()
              }}
              onSave={saveDimensions}
            />
          </BuilderFooter>
        </Card>
      </div>
    </AppLayoutBackground>
  )
}
