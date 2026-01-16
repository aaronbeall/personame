import { z } from 'zod'

// Generic mapping: require a Zod schema for EVERY key of T.
// Each key's Zod schema output type must match the Prisma field type exactly.
export type ZodPrismaSchema<T> = {
  [K in keyof T]-?: z.ZodType<T[K] | null | undefined>
} & {
  [key: string]: z.ZodType<unknown>
}
