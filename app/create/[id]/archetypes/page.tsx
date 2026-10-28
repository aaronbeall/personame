'use client'
import { archetypeValidationMessages } from '@/lib/builder-validation'
import { LoadingState } from '@/components/ui/loading'

import { useItemEditor } from '@/hooks/use-item-editor'
import { useBuilderDraft } from '@/hooks/use-builder-draft'
import { BuilderSaveActions } from '@/components/builder-save-actions'
import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useProtectedPage } from '@/hooks/use-protected-page'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ErrorBanner } from '@/components/ui/error-banner'
import { AppLayoutBackground } from '@/components/app-layout-background'
import { BuilderFooter } from '@/components/builder-footer'
import { AddItemButton } from '@/components/add-item-button'
import { StepProgress } from '@/components/step-progress'
import { ArchetypeRow } from './archetype-row'
import { Dimension, Archetype, ArchetypeDimension } from '@prisma/client'
import { getTempId } from '@/lib/utils'
import { getUnusedColorTheme } from '@/lib/colors'
import { EntityIcon } from '@/components/entity-icon'
import { DimensionTag } from '@/components/entity-identity'
import { DimensionTooltip } from './dimension-tooltip'

type ArchetypeWithDimensions = Archetype & { dimensions: ArchetypeDimension[] }

export default function ArchetypesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const queryClient = useQueryClient()
  useProtectedPage()
  const { id } = use(params)
  const [message, setMessage] = useState('')

  // Fetch dimensions
  const dimensionsQuery = useQuery({
    queryKey: ['dimensions', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/dimensions`)
      if (!res.ok) throw new Error('Failed to fetch dimensions')
      return res.json() as Promise<Dimension[]>
    },
  })

  // Fetch archetypes
  const archetypesQuery = useQuery({
    queryKey: ['archetypes', id],
    queryFn: async () => {
      const res = await fetch(`/api/personames/${id}/archetypes`)
      if (!res.ok) throw new Error('Failed to fetch archetypes')
      return res.json() as Promise<ArchetypeWithDimensions[]>
    },
  })

  const draft = useBuilderDraft(archetypesQuery.data, id)
  const archetypes = draft.value ?? []
  const setArchetypes = (items: ArchetypeWithDimensions[]) => {
    draft.update(items)
    setMessage('')
  }

  const itemEditor = useItemEditor(archetypes, setArchetypes)
  const { editing } = itemEditor

  const saveArchetypesMutation = useMutation({
    mutationFn: async ({
      items: archetypesToSave,
      advance,
    }: {
      items: ArchetypeWithDimensions[]
      advance: boolean
    }) => {
      const res = await fetch(`/api/personames/${id}/archetypes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archetypes: archetypesToSave }),
      })

      if (!res.ok) {
        throw new Error((await res.json()).error ?? 'Failed to save archetypes')
      }

      return { data: (await res.json()) as ArchetypeWithDimensions[], advance }
    },
    onSuccess: ({ data, advance }) => {
      draft.accept(data)
      itemEditor.closeAll()
      setMessage('Changes saved.')
      queryClient.setQueryData(['archetypes', id], data)
      queryClient.invalidateQueries({ queryKey: ['review', id] })
      queryClient.invalidateQueries({ queryKey: ['progress', id] })
      queryClient.invalidateQueries({ queryKey: ['personal'] })
      queryClient.invalidateQueries({ queryKey: ['discover'] })
      if (advance) router.push(`/create/${id}/questions`)
    },
  })

  const handleAddArchetype = () => {
    const archetypeId = getTempId()
    const color = getUnusedColorTheme(archetypes.map((a) => a.color)).hex
    const newArchetype: ArchetypeWithDimensions = {
      id: archetypeId,
      name: '',
      description: null,
      emoji: null,
      color,
      imageUrl: null,
      order: archetypes.length,
      style: null,
      icon: null,
      personaId: id,
      createdAt: new Date(),
      updatedAt: new Date(),
      dimensions: (dimensionsQuery.data ?? []).map((m) => ({
        id: getTempId(),
        archetypeId: archetypeId,
        dimensionId: m.id,
        targetValue: 50,
        relevance: 0.8,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    }
    setArchetypes([...archetypes, newArchetype])
    itemEditor.startNew(archetypeId)
  }

  const handleSaveArchetype = (updatedArchetype: ArchetypeWithDimensions) => {
    setArchetypes(
      archetypes.map((a) =>
        a.id === updatedArchetype.id ? updatedArchetype : a,
      ),
    )
  }

  const handleDeleteArchetype = (id: string) => {
    setArchetypes(archetypes.filter((a) => a.id !== id))
  }

  const saveArchetypes = (advance: boolean) => {
    if (archetypes.length === 0) {
      return
    }

    if (!draft.dirty) {
      if (advance) router.push(`/create/${id}/questions`)
      return
    }
    saveArchetypesMutation.mutate({ items: archetypes, advance })
  }

  const validationMessages = archetypes.length
    ? archetypes.flatMap((archetype, index) =>
        archetypeValidationMessages(archetype).map(
          (message) => `Archetype ${index + 1}: ${message}`,
        ),
      )
    : ['Add an archetype to continue.']
  const isValid = validationMessages.length === 0

  if (
    (!draft.ready || dimensionsQuery.isPending) &&
    !archetypesQuery.error &&
    !dimensionsQuery.error
  )
    return (
      <AppLayoutBackground>
        <div className="max-w-4xl mx-auto">
          <LoadingState label="Loading your archetypes…" />
        </div>
      </AppLayoutBackground>
    )

  return (
    <AppLayoutBackground>
      <div className="max-w-4xl mx-auto">
        <StepProgress
          title="Define your archetypes"
          description="Create the personality profiles your answers will point to. Give each one a distinct mix of your dimensions."
        />

        {dimensionsQuery.data && dimensionsQuery.data.length > 0 && (
          <Card className="builder-context mb-5">
            <CardContent className="pt-4">
              <p className="entity-heading text-xs font-semibold text-muted-600 mb-3 uppercase">
                <EntityIcon kind="dimension" size={13} />
                Your Dimensions
              </p>
              <div className="flex flex-wrap gap-2">
                {dimensionsQuery.data.map((dimension) => (
                  <DimensionTooltip key={dimension.id} dimension={dimension}>
                    <button className="dimension-tag-trigger" type="button">
                      <DimensionTag
                        name={dimension.name}
                        emoji={dimension.emoji}
                        color={dimension.color}
                      />
                    </button>
                  </DimensionTooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="builder-panel">
          <CardContent className="builder-panel-body">
            <fieldset
              disabled={saveArchetypesMutation.isPending}
              className="space-y-5 min-w-0"
            >
              <ErrorBanner
                error={
                  saveArchetypesMutation.error ||
                  archetypesQuery.error ||
                  dimensionsQuery.error
                }
              />

              <div className="space-y-6">
                {archetypes.map((archetype) => (
                  <div key={archetype.id}>
                    <ArchetypeRow
                      isEditing={editing.includes(archetype.id)}
                      onEdit={() => itemEditor.edit(archetype)}
                      onDone={() => itemEditor.done(archetype.id)}
                      onCancel={() => itemEditor.cancel(archetype.id)}
                      archetype={archetype}
                      dimensions={dimensionsQuery.data ?? []}
                      onChange={handleSaveArchetype}
                      onDelete={() => {
                        handleDeleteArchetype(archetype.id)
                        itemEditor.done(archetype.id)
                      }}
                    />
                  </div>
                ))}
              </div>

              <AddItemButton
                entity="archetype"
                label="Add Archetype"
                description="Create another personality profile."
                onClick={handleAddArchetype}
                disabled={
                  !draft.ready ||
                  saveArchetypesMutation.isPending ||
                  dimensionsQuery.isPending
                }
              />
            </fieldset>
          </CardContent>

          <BuilderFooter
            note={
              message ||
              'Give each archetype a distinct profile. At least two are needed to publish.'
            }
            back={
              <Link href={`/create/${id}/dimensions`}>
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
              busy={saveArchetypesMutation.isPending}
              busyAction={
                saveArchetypesMutation.variables?.advance ? 'continue' : 'save'
              }
              onReset={() => {
                draft.reset()
                itemEditor.closeAll()
                setMessage('')
                saveArchetypesMutation.reset()
              }}
              onSave={saveArchetypes}
            />
          </BuilderFooter>
        </Card>
      </div>
    </AppLayoutBackground>
  )
}
