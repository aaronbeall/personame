import type { Archetype, ArchetypeMetric } from '@prisma/client'

export type { Metric, Archetype, ArchetypeMetric } from '@prisma/client'

export interface ArchetypeWithTargets extends Omit<Archetype, 'personaId' | 'imageUrl' | 'style' | 'icon' | 'createdAt' | 'updatedAt'> {
  metrics: ArchetypeMetric[]
}
