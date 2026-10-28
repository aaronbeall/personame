import { setTimeout as delay } from 'node:timers/promises'

/** Retry entire serializable transactions, never individual writes within them. */
export async function retryTransaction<T>(
  work: () => Promise<T>,
  options: { attempts?: number; sleep?: (ms: number) => Promise<unknown> } = {},
): Promise<T> {
  const attempts = options.attempts ?? 5
  for (let attempt = 0; ; attempt++) {
    try { return await work() } catch (error) {
      if (!(error && typeof error === 'object' && 'code' in error && error.code === 'P2034') || attempt + 1 >= attempts) throw error
      await (options.sleep ?? delay)(Math.min(25 * 2 ** attempt, 300) + Math.random() * 25)
    }
  }
}
