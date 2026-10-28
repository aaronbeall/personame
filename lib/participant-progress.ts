export type ParticipantProgress = {
  quizId: string
  slug: string
  title: string
  description: string | null
  color: string | null
  emoji: string | null
  revision: string
  answered: number
  total: number
  updatedAt: string
}
export const progressEvent = 'personame-progress-changed'
export function progressKey(owner: string) {
  return `personame-progress:${owner}`
}
export function readProgress(raw: string | null): ParticipantProgress[] {
  try {
    const entries: unknown = JSON.parse(raw || '[]')
    if (!Array.isArray(entries)) return []
    return entries
      .filter((entry): entry is ParticipantProgress => {
        if (!entry || typeof entry !== 'object') return false
        const p = entry as ParticipantProgress
        return (
          ['quizId', 'slug', 'title', 'revision', 'updatedAt'].every(
            (key) => typeof p[key as keyof ParticipantProgress] === 'string',
          ) &&
          [p.description, p.color, p.emoji].every(
            (v) => v === null || typeof v === 'string',
          ) &&
          Number.isInteger(p.answered) &&
          Number.isInteger(p.total) &&
          p.answered >= 0 &&
          p.total > 0 &&
          p.answered <= p.total
        )
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } catch {
    return []
  }
}
export function saveProgress(owner: string, progress: ParticipantProgress) {
  try {
    const key = progressKey(owner)
    const existing = readProgress(sessionStorage.getItem(key))
    sessionStorage.setItem(
      key,
      JSON.stringify([
        progress,
        ...existing.filter((p) => p.quizId !== progress.quizId),
      ]),
    )
    window.dispatchEvent(new Event(progressEvent))
  } catch {}
}
export function removeProgress(owner: string, quizId: string) {
  try {
    const key = progressKey(owner)
    sessionStorage.setItem(
      key,
      JSON.stringify(
        readProgress(sessionStorage.getItem(key)).filter(
          (p) => p.quizId !== quizId,
        ),
      ),
    )
    window.dispatchEvent(new Event(progressEvent))
  } catch {}
}
