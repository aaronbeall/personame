/** Undefined optional fields mean leave existing values alone. */
export function fieldsChanged(before: object, after: object) {
  const original = before as Record<string, unknown>
  return Object.entries(after).some(([key, value]) => value !== undefined && original[key] !== value)
}
export function relationshipsChanged(before: object[], after: object[], fields: string[]) {
  const canonical = (rows: object[]) => rows.map(row => fields.map(field => (row as Record<string, unknown>)[field])).sort((a, b) => String(a[0]).localeCompare(String(b[0])))
  return JSON.stringify(canonical(before)) !== JSON.stringify(canonical(after))
}
export async function inBatches<T>(rows: T[], write: (batch: T[]) => Promise<unknown>) {
  for (let offset = 0; offset < rows.length; offset += 1000) await write(rows.slice(offset, offset + 1000))
}
