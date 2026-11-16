import { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { QUALITY } from '../lib/quality'

/* ------------------------------------------------------------------ */
/*  Error boundary – a broken WebGL context never takes the page down  */
/* ------------------------------------------------------------------ */
class SceneBoundary extends Component {
  constructor(p) {
    super(p)
    this.state = { failed: false }
  }
  static getDerivedStateFromError(err) {
    return { failed: true, msg: String(err?.message || err).slice(0, 400) }
  }
  componentDidCatch(err) {
    console.warn('[3D scene disabled]', err)
  }
  render() {
    if (this.state.failed) return <div data-scene-error={this.state.msg} className="contents">{this.props.fallback ?? null}</div>
    return this.props.children
  }
}

/** Feature-detect WebGL2 once, and immediately release the probe context. */
let webglOK = null
export function webglAvailable() {
  if (webglOK !== null) return webglOK
  try {
    const c = document.createElement('canvas')
    const gl = window.WebGL2RenderingContext && c.getContext('webgl2')
    webglOK = !!gl
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglOK = false
  }
  return webglOK
}

/* ------------------------------------------------------------------ */
/*  SceneCanvas – mounts lazily near the viewport, pauses offscreen    */
/* ------------------------------------------------------------------ */
export function SceneCanvas({ children, className = '', fallback, camera = { position: [0, 0, 6], fov: 30 }, eventSource, style }) {
  const wrap = useRef()
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [dpr, setDpr] = useState(QUALITY.mobile ? 1.25 : 1.6)
  const [ok] = useState(() => webglAvailable())

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ioNear = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '120% 0px' })
    const ioVis = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '10% 0px' })
    ioNear.observe(el)
    ioVis.observe(el)
    return () => {
      ioNear.disconnect()
      ioVis.disconnect()
    }
  }, [])

  const fb = fallback ?? null
  return (
    <div ref={wrap} className={`canvas-wrap ${className}`} style={style} aria-hidden="true">
      {!ok ? (
        fb
      ) : near ? (
        <SceneBoundary fallback={fb}>
          <Canvas
            frameloop={visible ? 'always' : 'never'}
            dpr={dpr}
            camera={camera}
            eventSource={eventSource}
            eventPrefix={eventSource ? 'client' : undefined}
            gl={{ antialias: !QUALITY.mobile, powerPreference: 'high-performance', alpha: false, stencil: false }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.05
              gl.outputColorSpace = THREE.SRGBColorSpace
            }}
          >
            <PerformanceMonitor
              onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
              onIncline={() => setDpr((d) => Math.min(QUALITY.dpr[1], d + 0.15))}
            />
            <AdaptiveDpr pixelated={false} />
            <Suspense fallback={null}>{children}</Suspense>
          </Canvas>
        </SceneBoundary>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Studio lighting – procedural softboxes, no HDR download            */
/* ------------------------------------------------------------------ */
/** Lets GSAP dim/raise the key light and the environment (state.key, state.env). */
function LightDriver({ state, keyRef }) {
  const { scene } = useThree()
  useFrame((_, dt) => {
    const s = state?.current
    if (!s) return
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 5)
    if (s.env !== undefined) scene.environmentIntensity += (s.env - (scene.environmentIntensity ?? 1)) * k
    if (keyRef.current && s.key !== undefined) keyRef.current.intensity += (60 * s.key - keyRef.current.intensity) * k
  })
  return null
}

export function Studio({ accent = '#ff1a1a', intensity = 1, shadow = true, shadowY = -1.3, rim = true, state }) {
  const keyRef = useRef()
  return (
    <>
      {state && <LightDriver state={state} keyRef={keyRef} />}
      <ambientLight intensity={0.15 * intensity} />
      <spotLight ref={keyRef} position={[3, 6, 5]} angle={0.4} penumbra={1} intensity={60 * intensity} color="#fff3ee" decay={2} />
      {rim && <pointLight position={[-3, 1.5, -2.5]} intensity={25 * intensity} color={accent} decay={2} />}
      {rim && <pointLight position={[3.5, -0.5, -2]} intensity={14 * intensity} color="#ffffff" decay={2} />}
      <Environment resolution={QUALITY.mobile ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={5} position={[0, 4, 3]} rotation-x={Math.PI / 2.4} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={3} position={[-4.5, 0.5, 1]} rotation-y={Math.PI / 2} scale={[1.2, 9, 1]} />
        <Lightformer form="rect" intensity={3} position={[4.5, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 9, 1]} />
        <Lightformer form="rect" intensity={2.5} color={accent} position={[0, 0, -5]} scale={[12, 3, 1]} />
        <Lightformer form="ring" intensity={2} position={[2, 3, 4]} scale={1.5} />
        <Lightformer form="rect" intensity={0.6} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} color="#300" />
      </Environment>
      {shadow && <FloorShadow y={shadowY} state={state} />}
    </>
  )
}

/* Soft studio floor shadow: a radial-gradient decal that follows the product
   and fades as it lifts. Far cheaper than a depth-rendered contact shadow. */
let shadowTex = null
function getShadowTex() {
  if (shadowTex) return shadowTex
  const c = document.createElement('canvas')
  c.width = c.height = 256
  const g = c.getContext('2d')
  const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128)
  grd.addColorStop(0, 'rgba(0,0,0,0.85)')
  grd.addColorStop(0.35, 'rgba(0,0,0,0.45)')
  grd.addColorStop(1, 'rgba(0,0,0,0)')
  g.fillStyle = grd
  g.fillRect(0, 0, 256, 256)
  shadowTex = new THREE.CanvasTexture(c)
  return shadowTex
}
export function FloorShadow({ y = -1.2, state, size = 1.6 }) {
  const m = useRef()
  const mat = useRef()
  useFrame((_, dt) => {
    const s = state?.current
    if (!m.current) return
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 5)
    const lift = Math.max(0, s?.y ?? 0)
    const sc = (s?.scale ?? 1) * (1 + lift * 0.5)
    m.current.position.x += ((s?.x ?? 0) - m.current.position.x) * k
    m.current.scale.x += (sc - m.current.scale.x) * k
    m.current.scale.y = m.current.scale.x
    const hidden = s && (s.visible === false || (s.y ?? 0) < -1.5)
    if (mat.current) mat.current.opacity = hidden ? 0 : Math.max(0, 0.9 - lift * 0.35)
  })
  return (
    <mesh ref={m} rotation-x={-Math.PI / 2} position-y={y} renderOrder={1}>
      <planeGeometry args={[size, size * 0.55]} />
      <meshBasicMaterial ref={mat} map={getShadowTex()} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Backdrop – an opaque studio sweep sphere with a radial glow.       */
/*  Opaque, so transmissive glass/PET refract it correctly.            */
/* ------------------------------------------------------------------ */
const backdropVert = /* glsl */ `
  varying vec3 vDir;
  void main(){
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }`
const backdropFrag = /* glsl */ `
  uniform vec3 uCore; uniform vec3 uEdge; uniform vec3 uFloor; uniform float uGlow; uniform vec2 uCenter;
  varying vec3 vDir;
  void main(){
    vec3 d = normalize(vDir);
    float face = clamp(-d.z, 0.0, 1.0);
    vec2 p = d.xy - uCenter;
    float r = length(p * vec2(0.8, 1.0));
    float glow = smoothstep(0.95, 0.0, r) * face;
    vec3 col = mix(uEdge, uCore, pow(glow, 1.4) * uGlow);
    // a soft studio cove rather than a hard horizon
    float floorMix = smoothstep(0.04, -0.55, d.y) * 0.9;
    col = mix(col, uFloor, floorMix);
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`

export function Backdrop({ state, core = '#ff1a1a', edge = '#5a0008', floor = '#140002', glow = 1, center = [0, 0.05] }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uCore: { value: new THREE.Color(core) },
      uEdge: { value: new THREE.Color(edge) },
      uFloor: { value: new THREE.Color(floor) },
      uGlow: { value: glow },
      uCenter: { value: new THREE.Vector2(...center) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const tmp = useMemo(() => new THREE.Color(), [])
  useFrame((_, dt) => {
    const s = state?.current
    if (!mat.current) return
    const u = mat.current.uniforms
    const k = 1 - Math.exp(-dt * 4)
    u.uCore.value.lerp(tmp.set(s?.core ?? core), k)
    u.uEdge.value.lerp(tmp.set(s?.edge ?? edge), k)
    u.uFloor.value.lerp(tmp.set(s?.floor ?? floor), k)
    u.uGlow.value += ((s?.glow ?? glow) - u.uGlow.value) * k
  })
  return (
    <mesh scale={40} renderOrder={-1}>
      <sphereGeometry args={[1, 48, 24]} />
      <shaderMaterial ref={mat} side={THREE.BackSide} depthWrite={false} uniforms={uniforms} vertexShader={backdropVert} fragmentShader={backdropFrag} />
    </mesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Rig – applies GSAP-driven state + pointer parallax + float         */
/* ------------------------------------------------------------------ */
export function Rig({ state, children, pointer = true, float = true, damping = 5 }) {
  const g = useRef()
  const spin = useRef(0)
  useFrame((three, dt) => {
    const s = state.current
    const o = g.current
    if (!o) return
    o.visible = s.visible !== false
    if (!o.visible) {
      // park hidden products exactly on their targets so they never streak in
      o.position.set(s.x ?? 0, s.y ?? 0, s.z ?? 0)
      o.scale.setScalar(s.scale ?? 1)
      return
    }
    const d = Math.min(dt, 0.05)
    const k = 1 - Math.exp(-d * damping)
    spin.current += d * (QUALITY.reduced ? 0 : s.spin ?? 0)
    const px = pointer && !QUALITY.reduced ? three.pointer.x : 0
    const py = pointer && !QUALITY.reduced ? three.pointer.y : 0
    const t = three.clock.elapsedTime
    const bob = float && !QUALITY.reduced ? Math.sin(t * 1.1) * 0.05 * (s.float ?? 1) : 0
    o.position.x += ((s.x ?? 0) + px * 0.12 - o.position.x) * k
    o.position.y += ((s.y ?? 0) + bob - o.position.y) * k
    o.position.z += ((s.z ?? 0) - o.position.z) * k
    o.rotation.y += ((s.rotY ?? 0) + spin.current + px * 0.35 - o.rotation.y) * k
    o.rotation.x += ((s.tiltX ?? 0) - py * 0.12 - o.rotation.x) * k
    o.rotation.z += ((s.tiltZ ?? 0) + (float && !QUALITY.reduced ? Math.sin(t * 0.7) * 0.03 : 0) - o.rotation.z) * k
    const sc = s.scale ?? 1
    o.scale.x += (sc - o.scale.x) * k
    o.scale.y = o.scale.z = o.scale.x
  })
  return <group ref={g}>{children}</group>
}

/** Camera driven by state: camX/camY/camZ + lookX/lookY, with optional FOV */
export function CameraRig({ state, damping = 4 }) {
  const { camera } = useThree()
  const look = useMemo(() => new THREE.Vector3(), [])
  useFrame((_, dt) => {
    const s = state.current
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * damping)
    // optional orbit: camZ becomes the orbit radius around the Y axis
    const orbit = s.orbit ?? 0
    const tx = (s.camX ?? 0) + Math.sin(orbit) * (s.camZ ?? 6)
    const tz = Math.cos(orbit) * (s.camZ ?? 6)
    camera.position.x += (tx - camera.position.x) * k
    camera.position.y += ((s.camY ?? 0) - camera.position.y) * k
    camera.position.z += (tz - camera.position.z) * k
    look.x += ((s.lookX ?? 0) - look.x) * k
    look.y += ((s.lookY ?? 0) - look.y) * k
    camera.lookAt(look)
    if (s.fov && Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov += (s.fov - camera.fov) * k
      camera.updateProjectionMatrix()
    }
  })
  return null
}
