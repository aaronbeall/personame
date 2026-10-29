import { PerspectiveCamera, Vector3 } from 'three'

export function createAtlasCamera(aspect = 600 / 440) {
  const camera = new PerspectiveCamera(38, aspect, 0.1, 100)
  camera.position.set(4.1, 3.1, 4.8)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  return camera
}
export const targetPosition = (values: number[]) => new Vector3(...values.map(value => value / 50 - 1) as [number, number, number])

/** Miniatures use the same perspective camera and coordinates as the full Three.js scene. */
export function projectAtlasPreview(values: number[]) {
  const camera = createAtlasCamera()
  const position = targetPosition(values)
  const projected = position.clone().project(camera)
  return { x: (projected.x + 1) * 300, y: (1 - projected.y) * 220, depth: position.distanceTo(camera.position) }
}
