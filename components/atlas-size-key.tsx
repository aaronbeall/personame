import type { FullQuiz } from '@/lib/personas'
import { atlasMarkerRadius } from '@/lib/archetype-map'

export function AtlasSizeKey({ dimension }: { dimension: FullQuiz['dimensions'][number] }) {
  return <div className="atlas-fourth-key"><span>Circle size · <b>{dimension.name}</b></span><div>{[0, 100].map(value => <span key={value}><i aria-hidden="true" style={{ width: atlasMarkerRadius(value) / 0.17 * 20, height: atlasMarkerRadius(value) / 0.17 * 20 }} />{value === 0 ? dimension.minLabel || 'Low' : dimension.maxLabel || 'High'}</span>)}</div><span>Minimum stays visible · Outlined = not set</span></div>
}
