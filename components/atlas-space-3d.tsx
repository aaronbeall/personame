'use client'

import { AtlasSizeKey } from './atlas-size-key'

import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SVGRenderer } from 'three/addons/renderers/SVGRenderer.js'
import { Minus, Plus, RotateCcw } from 'lucide-react'
import type { FullQuiz } from '@/lib/personas'
import { createAtlasCamera, targetPosition } from '@/lib/atlas-camera'
import { atlasMarkerRadius } from '@/lib/archetype-map'
import { getColorTheme } from '@/lib/colors'
import { getArchetypeTheme } from './entity-identity'

type Dimension = FullQuiz['dimensions'][number]
type Props = Pick<FullQuiz, 'dimensions' | 'archetypes'> & { sizeDimension?: Dimension; selectedId?: string; onSelect: (id: string) => void }
export default function AtlasSpace3D({ dimensions, archetypes, sizeDimension, selectedId, onSelect }: Props) {
  const viewport = useRef<HTMLDivElement>(null)
  const labels = useRef(new Map<string, HTMLElement>())
  const runtime = useRef<{ zoom: (factor: number) => void; rotate: (azimuth: number, polar: number) => void; reset: () => void; select: (id?: string) => void; size: (dimension?: Dimension) => void } | null>(null)
  const sizing = useRef(sizeDimension)
  const choose = useRef(onSelect)
  const selected = useRef(selectedId)
  useEffect(() => { choose.current = onSelect; selected.current = selectedId; runtime.current?.select(selectedId) }, [onSelect, selectedId])
  useEffect(() => { sizing.current = sizeDimension; runtime.current?.size(sizeDimension) }, [sizeDimension])
  const axes = useMemo(() => {
    const layout = [
      { start: [-1, -1, 1], end: [1, -1, 1], name: [0, -1.3, 1.15], low: [-1.2, -1.12, 1], high: [1.2, -1.12, 1] },
      { start: [1, -1, -1], end: [1, 1, -1], name: [1.4, 0, -1.12], low: [1.18, -1.2, -1], high: [1.18, 1.2, -1] },
      { start: [-1, 1, -1], end: [-1, 1, 1], name: [-1.3, 1.18, 0], low: [-1.15, 1, -1.2], high: [-1.15, 1, 1.2] },
    ]
    return dimensions.map((dimension, index) => ({ dimension, layout: layout[index] }))
  }, [dimensions])
  const annotations = useMemo(() => axes.flatMap(({ dimension: d, layout }, index) => [
    { id: `axis-${index}-name`, kind: 'name', text: d.name, position: new THREE.Vector3(...layout.name as [number, number, number]) },
    { id: `axis-${index}-low`, kind: 'end', text: `${d.minEmoji || ''} ${d.minLabel || 'Low'}`.trim(), position: new THREE.Vector3(...layout.low as [number, number, number]) },
    { id: `axis-${index}-high`, kind: 'end', text: `${d.maxEmoji || ''} ${d.maxLabel || 'High'}`.trim(), position: new THREE.Vector3(...layout.high as [number, number, number]) },
  ]), [axes])
  const points = useMemo(() => archetypes.flatMap(a => {
    const targets = dimensions.map(d => a.dimensions.find(t => t.dimensionId === d.id))
    return targets.every(Boolean) ? [{ id: a.id, name: a.name, color: getArchetypeTheme(a.color, a.name).hex, position: targetPosition(targets.map(t => t!.targetValue)) }] : []
  }), [dimensions, archetypes])

  useEffect(() => {
    const host = viewport.current
    if (!host) return
    let renderer: THREE.WebGLRenderer | SVGRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setClearColor(0xffffff, 0)
      host.dataset.renderer = 'webgl'
    } catch {
      // A real perspective scene still renders on devices without WebGL2.
      renderer = new SVGRenderer()
      renderer.setClearColor(new THREE.Color('#ffffff'), 0)
      host.dataset.renderer = 'svg'
    }
    const element = renderer.domElement
    element.setAttribute('aria-hidden', 'true')
    host.prepend(element)
    const scene = new THREE.Scene()
    const camera = createAtlasCamera()
    const controls = new OrbitControls(camera, element as unknown as HTMLElement)
    controls.enablePan = false
    controls.minDistance = 3.8
    controls.maxDistance = 12
    controls.minPolarAngle = 0.15
    controls.maxPolarAngle = Math.PI - 0.15
    controls.saveState()
    const box = new THREE.BoxGeometry(2, 2, 2)
    const edges = new THREE.EdgesGeometry(box)
    box.dispose()
    scene.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: '#c9c1d8' })))
    const floor = new THREE.GridHelper(2, 4, '#c9c1d8', '#e7e2ee')
    floor.position.y = -1
    scene.add(floor)
    axes.forEach(({ dimension, layout }) => scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...layout.start as [number, number, number]), new THREE.Vector3(...layout.end as [number, number, number])]), new THREE.LineBasicMaterial({ color: getColorTheme(dimension.color).hex }))))
    const circle = new THREE.CircleGeometry(1, 40)
    const radii = new Map(points.map(point => [point.id, atlasMarkerRadius()]))
    const meshes = points.map(point => {
      const mesh = new THREE.Mesh(circle, new THREE.MeshBasicMaterial({ color: point.color, side: THREE.DoubleSide }))
      mesh.position.copy(point.position)
      mesh.userData.id = point.id
      scene.add(mesh)
      return mesh
    })
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.25, 1.4, 40), new THREE.MeshBasicMaterial({ color: '#554183', side: THREE.DoubleSide }))
    scene.add(ring)
    let frame = 0, width = 1, height = 1
    const render = () => {
      frame = 0
      meshes.forEach(mesh => mesh.quaternion.copy(camera.quaternion))
      ring.quaternion.copy(camera.quaternion)
      ring.scale.setScalar(radii.get(selected.current || '') ?? atlasMarkerRadius())
      renderer.render(scene, camera)
      const place = (id: string, position: THREE.Vector3, radius?: number) => {
        const label = labels.current.get(id)
        if (!label) return
        const p = position.clone().project(camera)
        label.style.left = `${radius ? (p.x + 1) * width / 2 : THREE.MathUtils.clamp((p.x + 1) * width / 2, 55, width - 55)}px`
        label.style.top = `${radius ? (1 - p.y) * height / 2 : THREE.MathUtils.clamp((1 - p.y) * height / 2, 16, height - 16)}px`
        if (radius) {
          const edge = position.clone().add(new THREE.Vector3(radius, 0, 0).applyQuaternion(camera.quaternion)).project(camera)
          const diameter = Math.max(12, Math.abs(edge.x - p.x) * width)
          label.style.width = `${diameter}px`; label.style.height = `${diameter}px`
        }
        label.style.visibility = p.z < -1 || p.z > 1 || Math.abs(p.x) > 1 || Math.abs(p.y) > 1 ? 'hidden' : 'visible'
      }
      points.forEach(point => place(point.id, point.position, radii.get(point.id)))
      annotations.forEach(label => place(label.id, label.position))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(render) }
    const select = (id?: string) => {
      const point = points.find(point => point.id === id)
      ring.visible = !!point
      if (point) ring.position.copy(point.position)
      schedule()
    }
    const resize = () => {
      width = host.clientWidth; height = host.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      schedule()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    controls.addEventListener('change', schedule)
    const raycaster = new THREE.Raycaster()
    let start = { x: 0, y: 0 }
    const down = (event: PointerEvent) => { start = { x: event.clientX, y: event.clientY } }
    const up = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 5) return
      const rect = host.getBoundingClientRect()
      raycaster.setFromCamera(new THREE.Vector2((event.clientX - rect.left) / width * 2 - 1, -(event.clientY - rect.top) / height * 2 + 1), camera)
      const hit = raycaster.intersectObjects(meshes)[0]
      if (hit) choose.current(hit.object.userData.id)
    }
    element.addEventListener('pointerdown', down as EventListener)
    element.addEventListener('pointerup', up as EventListener)
    runtime.current = {
      select,
      size: dimension => {
        meshes.forEach((mesh, index) => {
          const target = dimension ? archetypes.find(a => a.id === points[index].id)?.dimensions.find(t => t.dimensionId === dimension.id) : undefined
          const radius = atlasMarkerRadius(dimension ? target?.targetValue : undefined)
          radii.set(points[index].id, radius)
          mesh.scale.setScalar(radius)
          mesh.visible = !dimension || !!target
        })
        schedule()
      },
      zoom: factor => {
        const offset = camera.position.clone().sub(controls.target)
        offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance))
        camera.position.copy(controls.target).add(offset); controls.update(); schedule()
      },
      rotate: (azimuth, polar) => {
        const spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target))
        spherical.theta += azimuth
        spherical.phi = THREE.MathUtils.clamp(spherical.phi + polar, controls.minPolarAngle, controls.maxPolarAngle)
        camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical)); controls.update(); schedule()
      },
      reset: () => { controls.reset(); schedule() },
    }
    runtime.current.size(sizing.current)
    select(selected.current)
    resize()
    return () => {
      runtime.current = null
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.removeEventListener('change', schedule)
      controls.dispose()
      element.removeEventListener('pointerdown', down as EventListener)
      element.removeEventListener('pointerup', up as EventListener)
      const geometries = new Set<THREE.BufferGeometry>(), materials = new Set<THREE.Material>()
      scene.traverse(object => {
        const drawable = object as THREE.Mesh
        if (drawable.geometry) geometries.add(drawable.geometry)
        if (drawable.material) (Array.isArray(drawable.material) ? drawable.material : [drawable.material]).forEach(material => materials.add(material))
      })
      geometries.forEach(geometry => geometry.dispose()); materials.forEach(material => material.dispose())
      if (renderer instanceof THREE.WebGLRenderer) renderer.dispose()
      element.remove()
    }
  }, [dimensions, points, archetypes, axes, annotations])

  return <div className="atlas-3d">
    <div ref={viewport} className="atlas-3d-viewport" role="group" aria-label="Three-dimensional archetype target map" tabIndex={0} aria-describedby="atlas-3d-help" onKeyDown={event => {
      if (event.target !== event.currentTarget) return
      const step = Math.PI / 16
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', 'Home'].includes(event.key)) {
        event.preventDefault()
        if (event.key === 'Home') runtime.current?.reset()
        else if (['+', '=', '-'].includes(event.key)) runtime.current?.zoom(event.key === '-' ? 1.2 : 0.8)
        else runtime.current?.rotate(event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0)
      }
    }}>
      {points.map(point => {
        const sizeTarget = sizeDimension ? archetypes.find(a => a.id === point.id)?.dimensions.find(t => t.dimensionId === sizeDimension.id) : undefined
        const detail = sizeDimension ? `, ${sizeDimension.name}: ${sizeTarget ? `${sizeTarget.targetValue} out of 100` : 'No target set'}` : ''
        return <button type="button" key={point.id} ref={node => { if (node) labels.current.set(point.id, node); else labels.current.delete(point.id) }} className="atlas-3d-point" data-missing={!!sizeDimension && !sizeTarget} aria-label={`Select ${point.name} in 3D${detail}`} title={sizeDimension ? `${sizeDimension.name}: ${sizeTarget ? `${sizeTarget.targetValue}/100` : 'No target set'}` : point.name} aria-pressed={point.id === selectedId} style={{ borderColor: point.color }} onClick={() => onSelect(point.id)} />
      })}
      {annotations.map(label => <span key={label.id} className="atlas-3d-axis" data-kind={label.kind} title={label.text} aria-hidden="true" ref={node => { if (node) labels.current.set(label.id, node); else labels.current.delete(label.id) }}>{label.text}</span>)}
    </div>
    {sizeDimension && <AtlasSizeKey dimension={sizeDimension} />}
    <div className="atlas-3d-tools"><span id="atlas-3d-help">Drag to orbit · Scroll to zoom · Arrow keys to rotate</span><div><button type="button" aria-label="Zoom in" onClick={() => runtime.current?.zoom(0.8)}><Plus size={14} /></button><button type="button" aria-label="Zoom out" onClick={() => runtime.current?.zoom(1.2)}><Minus size={14} /></button><button type="button" aria-label="Reset 3D view" onClick={() => runtime.current?.reset()}><RotateCcw size={14} /></button></div></div>
  </div>
}
