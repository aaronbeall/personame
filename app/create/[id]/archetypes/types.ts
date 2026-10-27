import type { Archetype, ArchetypeDimension } from '@prisma/client'

export type { Dimension, Archetype, ArchetypeDimension } from '@prisma/client'

export interface ArchetypeWithTargets extends Omit<Archetype, 'personaId' | 'imageUrl' | 'style' | 'icon' | 'createdAt' | 'updatedAt'> {
  dimensions: ArchetypeDimension[]
}
