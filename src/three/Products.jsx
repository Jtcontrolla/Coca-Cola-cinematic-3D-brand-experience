import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { revolve, memo, insetProfile, radiusAt } from './geometry'
import {
  PET,
  GLASS,
  CAN_SPECS,
  petProfile,
  petGeometry,
  glassProfile,
  glassGeometry,
  canParts,
  screwCapGeometry,
  tamperRingGeometry,
  crownCapGeometry,
} from './profiles'
import { canLabel, bottleLabel, glassLabel, capTop, FLAVOURS } from './textures'
import { QUALITY } from '../lib/quality'

/*
  Product rigs read a mutable `rig` object every frame:
    rig.cap   0 → 1  cap unscrew / pop
    rig.tab   0 → 1  pull-tab lift and tongue push-in
    rig.fizz  0 → 1  carbonation intensity (bubbles + spray)
  GSAP timelines tween those numbers; nothing re-renders React.
*/

const EMPTY = { cap: 0, tab: 0, fizz: 0 }

/* ------------------------------------------------------------------ */
/*  Materials                                                          */
/* ------------------------------------------------------------------ */
function ClearPlastic({ tint = '#ffffff', ior = 1.46, thickness = 0.12, roughness = 0.05 }) {
  return QUALITY.transmission ? (
    <meshPhysicalMaterial
      color={tint}
      transmission={1}
      thickness={thickness}
      ior={ior}
      roughness={roughness}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.04}
      specularIntensity={1}
      envMapIntensity={1.6}
      attenuationColor={tint}
      attenuationDistance={2.5}
    />
  ) : (
    <meshPhysicalMaterial
      color={tint}
      transparent
      opacity={0.22}
      roughness={0.04}
      metalness={0.1}
      clearcoat={1}
      envMapIntensity={2.4}
      depthWrite={false}
    />
  )
}

function Cola({ fizzRef }) {
  return (
    <meshPhysicalMaterial
      ref={fizzRef}
      color="#2a0402"
      emissive="#4a0a02"
      emissiveIntensity={0.45}
      roughness={0.12}
      metalness={0}
      clearcoat={1}
      clearcoatRoughness={0.05}
      sheen={1}
      sheenColor="#c4230d"
      sheenRoughness={0.4}
      envMapIntensity={1.2}
    />
  )
}

const Aluminium = ({ color = '#d6dadf', roughness = 0.24 }) => (
  <meshStandardMaterial color={color} metalness={1} roughness={roughness} envMapIntensity={1.3} />
)

/* ------------------------------------------------------------------ */
/*  Condensation droplets – instanced, placed on the actual surface    */
/* ------------------------------------------------------------------ */
function Droplets({ profile, count = QUALITY.droplets, yMin, yMax, offset = 0.004, seed = 1, sizes = [0.006, 0.022] }) {
  const ref = useRef()
  const geo = useMemo(() => memo('droplet-geo', () => new THREE.SphereGeometry(1, 10, 8)), [])
  useEffect(() => {
    const m = ref.current
    if (!m) return
    let s = seed * 9301
    const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280)
    const o = new THREE.Object3D()
    const n = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      const y = yMin + rand() * (yMax - yMin)
      const th = rand() * Math.PI * 2
      const r = typeof profile === 'number' ? profile : radiusAt(profile, y)
      const dr = typeof profile === 'number' ? 0 : (radiusAt(profile, y + 0.01) - radiusAt(profile, y - 0.01)) / 0.02
      n.set(Math.sin(th), -dr, Math.cos(th)).normalize()
      o.position.set(Math.sin(th) * (r + offset), y, Math.cos(th) * (r + offset))
      o.lookAt(o.position.clone().add(n))
      const sz = sizes[0] + Math.pow(rand(), 2.6) * (sizes[1] - sizes[0])
      o.scale.set(sz, sz * (1 + rand() * 0.5), sz * 0.45)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
  }, [profile, count, yMin, yMax, offset, seed, sizes])

  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} dispose={null} frustumCulled={false}>
      {QUALITY.transmission ? (
        <meshPhysicalMaterial color="#ffffff" transmission={1} thickness={0.02} ior={1.33} roughness={0} clearcoat={1} envMapIntensity={2} />
      ) : (
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.35} roughness={0} clearcoat={1} envMapIntensity={3} depthWrite={false} />
      )}
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Rising carbonation inside a container                              */
/* ------------------------------------------------------------------ */
function Bubbles({ rig, radius = 0.26, y0 = 0.1, y1 = 1.7, count = QUALITY.mobile ? 40 : 110, base = 0.15 }) {
  const ref = useRef()
  const mat = useRef()
  const geo = useMemo(() => memo('bubble-geo', () => new THREE.SphereGeometry(1, 8, 6)), [])
  const data = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.sqrt(Math.random()) * radius,
        y: y0 + Math.random() * (y1 - y0),
        v: 0.15 + Math.random() * 0.4,
        s: 0.004 + Math.random() * 0.009,
        w: Math.random() * 10,
      })),
    [count, radius, y0, y1],
  )
  const o = useMemo(() => new THREE.Object3D(), [])
  useFrame((state, dt) => {
    const m = ref.current
    if (!m) return
    const f = Math.max(base, (rig?.current || rig || EMPTY).fizz || 0)
    const step = Math.min(dt, 0.05) * (0.4 + f * 2.2)
    for (let i = 0; i < data.length; i++) {
      const b = data[i]
      b.y += b.v * step
      if (b.y > y1) b.y = y0
      const wob = Math.sin(state.clock.elapsedTime * 3 + b.w) * 0.006
      o.position.set(Math.sin(b.a) * b.r + wob, b.y, Math.cos(b.a) * b.r)
      o.scale.setScalar(b.s * (0.6 + f))
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    if (mat.current) mat.current.opacity = 0.25 + f * 0.6
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} dispose={null} frustumCulled={false}>
      <meshStandardMaterial ref={mat} color="#ffd9cc" emissive="#ff8a6a" emissiveIntensity={0.25} roughness={0.1} transparent opacity={0.4} depthWrite={false} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Spray burst used when a can or bottle opens                        */
/* ------------------------------------------------------------------ */
export function Spray({ rig, origin = [0, 0, 0], count = QUALITY.mobile ? 40 : 120, spread = 0.18, height = 1.1 }) {
  const ref = useRef()
  const mat = useRef()
  const geo = useMemo(() => memo('bubble-geo', () => new THREE.SphereGeometry(1, 8, 6)), [])
  const o = useMemo(() => new THREE.Object3D(), [])
  const parts = useMemo(
    () => Array.from({ length: count }, () => ({ t: Math.random(), a: Math.random() * Math.PI * 2, s: 0.004 + Math.random() * 0.012, sp: 0.4 + Math.random() * 0.8 })),
    [count],
  )
  useFrame((_, dt) => {
    const m = ref.current
    if (!m) return
    const f = (rig?.current || rig || EMPTY).fizz || 0
    m.visible = f > 0.02
    if (!m.visible) return
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      p.t += Math.min(dt, 0.05) * p.sp * (0.6 + f)
      if (p.t > 1) p.t -= 1
      const t = p.t
      const r = spread * t * (0.4 + p.sp)
      o.position.set(origin[0] + Math.sin(p.a) * r, origin[1] + t * height * p.sp - t * t * 0.35, origin[2] + Math.cos(p.a) * r)
      o.scale.setScalar(p.s * (1 - t * 0.6) * f)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    }
    m.instanceMatrix.needsUpdate = true
    if (mat.current) mat.current.opacity = Math.min(1, f * 1.2)
  })
  return (
    <instancedMesh ref={ref} args={[geo, undefined, count]} dispose={null} frustumCulled={false}>
      <meshPhysicalMaterial ref={mat} color="#ffffff" roughness={0} clearcoat={1} transparent opacity={0.8} envMapIntensity={2.5} depthWrite={false} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/*  PET BOTTLE                                                         */
/* ------------------------------------------------------------------ */
export function PetBottle({ rig, flavour = 'original', volume = '500 ml', droplets = true, bubbles = true }) {
  const capGroup = useRef()
  const geo = petGeometry(QUALITY.mobile ? 72 : 112)
  const profile = petProfile()
  const liquidGeo = useMemo(() => memo('pet-liquid-v2', () => revolve(insetProfile(profile, 0.012, 1.86), { segments: 72 })), [profile])
  const labelGeo = useMemo(
    () => memo('pet-label-v2', () => revolve([[0.3345, PET.labelBottom], [0.3345, PET.labelTop]], { segments: 96, uvByHeight: true })),
    [],
  )
  const labelMap = useMemo(() => bottleLabel({ flavour, volume, h: PET.labelTop - PET.labelBottom }), [flavour, volume])
  const capMap = useMemo(() => capTop(flavour === 'zero' ? '#111111' : '#E8000D', '#fff'), [flavour])
  const capGeo = screwCapGeometry()
  const ringGeo = tamperRingGeometry()
  const capColor = flavour === 'zero' ? '#111111' : '#E8000D'

  useFrame(() => {
    const r = rig?.current || EMPTY
    const c = capGroup.current
    if (!c) return
    const cap = r.cap || 0
    const free = Math.max(0, (cap - 0.55) / 0.45)
    c.rotation.y = -cap * Math.PI * 3
    // unscrew in place, then lift off and hang just beside the neck
    c.position.y = 2.075 + cap * 0.08 + Math.pow(free, 1.4) * 0.42
    c.position.x = Math.pow(free, 1.2) * 0.38
    c.rotation.z = -free * 0.9
  })

  return (
    <group>
      <mesh geometry={geo} dispose={null} renderOrder={2}>
        <ClearPlastic tint={flavour === 'zero' ? '#e8e8e8' : '#f4fbff'} />
      </mesh>
      <mesh geometry={liquidGeo} dispose={null}>
        <Cola />
      </mesh>
      <mesh geometry={labelGeo} dispose={null}>
        <meshPhysicalMaterial map={labelMap} roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.1} side={THREE.DoubleSide} envMapIntensity={0.9} />
      </mesh>
      <mesh geometry={ringGeo} position-y={2.075} dispose={null}>
        <meshPhysicalMaterial color={capColor} roughness={0.38} clearcoat={0.4} />
      </mesh>
      <group ref={capGroup} position-y={2.075}>
        <mesh geometry={capGeo} position-y={0.04} dispose={null}>
          <meshPhysicalMaterial color={capColor} roughness={0.36} clearcoat={0.5} clearcoatRoughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        <mesh position-y={0.227} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.134, 48]} />
          <meshPhysicalMaterial map={capMap} roughness={0.35} clearcoat={0.5} />
        </mesh>
      </group>
      {bubbles && <Bubbles rig={rig} radius={0.25} y0={0.12} y1={1.76} />}
      {droplets && <Droplets profile={profile} yMin={0.12} yMax={1.78} seed={3} />}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  CONTOUR GLASS BOTTLE                                               */
/* ------------------------------------------------------------------ */
export function GlassBottle({ rig, droplets = true, bubbles = true }) {
  const capRef = useRef()
  const profile = glassProfile()
  const geo = glassGeometry(QUALITY.mobile ? 84 : 128)
  const liquidGeo = useMemo(() => memo('glass-liquid-v2', () => revolve(insetProfile(profile, 0.03, 1.56, 0.05), { segments: 72 })), [profile])
  // red paper wrap label on the straight waist, like the modern contour bottle
  const printGeo = useMemo(() => memo('glass-label-v2', () => revolve([[0.2915, 0.72], [0.2915, 1.02]], { segments: 96, uvByHeight: true })), [])
  const printMap = glassLabel({ r: 0.2915, h: 0.3 })
  const capGeo = crownCapGeometry()
  const capMap = capTop('#D8000C', '#fff')

  useFrame(() => {
    const r = rig?.current || EMPTY
    const c = capRef.current
    if (!c) return
    const cap = r.cap || 0
    // crown caps don't twist – they pop and flip
    const k = Math.pow(cap, 1.2)
    c.position.set(k * 0.35, 1.955 + k * 0.9 - k * k * 0.25, 0)
    c.rotation.set(k * 0.6, 0, -k * Math.PI * 1.6)
  })

  return (
    <group>
      <mesh geometry={geo} dispose={null} renderOrder={2}>
        <ClearPlastic tint="#eef9f1" ior={1.5} thickness={0.35} roughness={0.03} />
      </mesh>
      <mesh geometry={liquidGeo} dispose={null}>
        <Cola />
      </mesh>
      <mesh geometry={printGeo} dispose={null}>
        <meshPhysicalMaterial map={printMap} roughness={0.32} clearcoat={0.7} clearcoatRoughness={0.12} side={THREE.DoubleSide} envMapIntensity={0.9} />
      </mesh>
      <group ref={capRef} position-y={1.955}>
        <mesh geometry={capGeo} dispose={null}>
          <meshStandardMaterial color="#D8000C" metalness={0.55} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>
        <mesh position-y={0.077} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.12, 48]} />
          <meshStandardMaterial map={capMap} metalness={0.5} roughness={0.3} />
        </mesh>
      </group>
      {bubbles && <Bubbles rig={rig} radius={0.2} y0={0.1} y1={1.56} count={QUALITY.mobile ? 30 : 80} />}
      {droplets && <Droplets profile={profile} yMin={0.08} yMax={1.6} seed={9} />}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  PULL TAB + OPENING                                                 */
/* ------------------------------------------------------------------ */
function tabGeometry() {
  return memo('pull-tab', () => {
    const s = new THREE.Shape()
    s.moveTo(-0.042, 0.05)
    s.quadraticCurveTo(0, 0.072, 0.042, 0.05)
    s.lineTo(0.05, -0.02)
    s.quadraticCurveTo(0.066, -0.09, 0.054, -0.132)
    s.quadraticCurveTo(0, -0.176, -0.054, -0.132)
    s.quadraticCurveTo(-0.066, -0.09, -0.05, -0.02)
    s.closePath()
    const hole = new THREE.Path()
    hole.absellipse(0, -0.098, 0.034, 0.03, 0, Math.PI * 2, false, 0)
    s.holes.push(hole)
    const slot = new THREE.Path()
    slot.absarc(0, 0.0, 0.016, 0, Math.PI * 2, false)
    s.holes.push(slot)
    const g = new THREE.ExtrudeGeometry(s, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2, curveSegments: 24 })
    g.rotateX(Math.PI / 2) // shape-y → +z (nose toward the opening at the front)
    return g
  })
}

function tongueShape(scale = 1) {
  const s = new THREE.Shape()
  s.moveTo(-0.035, 0.0)
  s.bezierCurveTo(-0.07, 0.03, -0.07, 0.1, -0.03, 0.125)
  s.quadraticCurveTo(0, 0.14, 0.03, 0.125)
  s.bezierCurveTo(0.07, 0.1, 0.07, 0.03, 0.035, 0.0)
  s.closePath()
  return { s, scale }
}

function flatGeo(key, shape) {
  return memo(key, () => {
    const g = new THREE.ShapeGeometry(shape, 24)
    g.rotateX(Math.PI / 2) // shape-y → +z
    // flip faces up
    g.scale(1, 1, 1)
    const idx = g.index.array
    for (let i = 0; i < idx.length; i += 3) {
      const t = idx[i]
      idx[i] = idx[i + 2]
      idx[i + 2] = t
    }
    g.computeVertexNormals()
    return g
  })
}

function CanLid({ rig, neckR, lidY, metal }) {
  const tab = useRef()
  const tongue = useRef()
  const k = neckR / 0.264
  const tabGeo = tabGeometry()
  const holeGeo = flatGeo('hole', tongueShape().s)
  const tongueGeo = useMemo(() => {
    return memo('tongue-geo', () => {
      const g = new THREE.ExtrudeGeometry(tongueShape().s, { depth: 0.003, bevelEnabled: false, curveSegments: 24 })
      g.rotateX(Math.PI / 2)
      return g
    })
  }, [])

  useFrame(() => {
    const r = rig?.current || EMPTY
    const t = r.tab || 0
    if (tab.current) tab.current.rotation.x = Math.min(t, 1) * 0.95
    if (tongue.current) tongue.current.rotation.x = Math.max(0, (t - 0.15) / 0.85) * 1.35
  })

  return (
    <group position-y={lidY} scale={[k, 1, k]}>
      {/* the opening – visible once the tongue is pushed in */}
      <mesh geometry={holeGeo} position={[0, 0.0012, 0.03]} scale={[1.05, 1, 1.05]} dispose={null}>
        <meshBasicMaterial color="#050101" side={THREE.DoubleSide} />
      </mesh>
      {/* scored tongue, hinged at its back edge */}
      <group ref={tongue} position={[0, 0.0024, 0.032]}>
        <mesh geometry={tongueGeo} dispose={null}>
          <meshStandardMaterial color={metal} metalness={1} roughness={0.26} />
        </mesh>
      </group>
      {/* rivet */}
      <mesh position-y={0.006}>
        <cylinderGeometry args={[0.014, 0.016, 0.01, 20]} />
        <meshStandardMaterial color={metal} metalness={1} roughness={0.2} />
      </mesh>
      {/* tab, hinged at the rivet */}
      <group ref={tab} position-y={0.012}>
        <mesh geometry={tabGeo} dispose={null}>
          <meshStandardMaterial color={metal} metalness={1} roughness={0.18} envMapIntensity={1.6} />
        </mesh>
      </group>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  ALUMINIUM CAN – classic / slim / medium / mini                     */
/* ------------------------------------------------------------------ */
export function Can({ rig, kind = 'classic', flavour = 'original', droplets = true }) {
  const spec = CAN_SPECS[kind]
  const parts = canParts(spec)
  const bodyH = parts.bodyTop - parts.bodyBottom
  const bodyGeo = useMemo(
    () => memo(`can-body-${spec.r}-${spec.h}`, () => revolve([[spec.r, parts.bodyBottom], [spec.r, parts.bodyTop]], { segments: 128, uvByHeight: true })),
    [spec, parts],
  )
  const map = useMemo(() => canLabel({ flavour, r: spec.r, h: bodyH, volume: spec.label }), [flavour, spec, bodyH])
  const f = FLAVOURS[flavour]
  const silver = flavour === 'zero' ? '#9a9ea4' : '#d6dadf'

  return (
    <group>
      <mesh geometry={parts.bottom} dispose={null}>
        <Aluminium color={silver} roughness={0.3} />
      </mesh>
      <mesh geometry={bodyGeo} dispose={null}>
        <meshPhysicalMaterial
          map={map}
          metalness={flavour === 'light' ? 0.85 : 0.62}
          roughness={0.26}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.35}
        />
      </mesh>
      <mesh geometry={parts.top} dispose={null}>
        <Aluminium color={silver} />
      </mesh>
      <CanLid rig={rig} neckR={parts.neckR} lidY={parts.lidY} metal={silver} />
      <Spray rig={rig} origin={[0, parts.lidY + 0.02, 0.09 * (parts.neckR / 0.264)]} />
      {droplets && <Droplets profile={spec.r} yMin={parts.bodyBottom + 0.02} yMax={parts.bodyTop - 0.02} offset={0.003} seed={kind.length + 4} />}
      {f && null}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  Convenience: pick a product by key and centre it on its height     */
/* ------------------------------------------------------------------ */
export const PRODUCT_HEIGHT = {
  pet: PET.topY + 0.04,
  glass: GLASS.topY,
  classic: CAN_SPECS.classic.h,
  slim: CAN_SPECS.slim.h,
  medium: CAN_SPECS.medium.h,
  mini: CAN_SPECS.mini.h,
  zero: CAN_SPECS.classic.h,
}

/** Showcase scale so a can reads as large on screen as a bottle (used where one product is shown alone). */
export const DISPLAY_SCALE = { pet: 1, glass: 1.05, classic: 1.5, zero: 1.5, slim: 1.3, medium: 1.65, mini: 1.75 }

export function Product({ kind, rig, flavour, centered = true, ...rest }) {
  const h = PRODUCT_HEIGHT[kind] || 1
  let node
  if (kind === 'pet') node = <PetBottle rig={rig} flavour={flavour} {...rest} />
  else if (kind === 'glass') node = <GlassBottle rig={rig} {...rest} />
  else if (kind === 'zero') node = <Can rig={rig} kind="classic" flavour="zero" {...rest} />
  else node = <Can rig={rig} kind={kind} flavour={flavour} {...rest} />
  return <group position-y={centered ? -h / 2 : 0}>{node}</group>
}
