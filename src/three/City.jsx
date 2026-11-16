import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer, RenderTexture, PerspectiveCamera } from '@react-three/drei'
import { poster, facade } from './textures'
import { Product } from './Products'
import { QUALITY } from '../lib/quality'

/* ------------------------------------------------------------------ */
/*  Billboard – frame, bezel, glowing screen, posts and a lamp bar     */
/* ------------------------------------------------------------------ */
export function Billboard({ position, rotation = [0, 0, 0], w = 6, h = 3, art, posts = true, postH = 4, glow = '#ff2a1a', children, lamps = true }) {
  const map = useMemo(() => (art ? poster(art, 2048, Math.round(2048 * (h / w))) : null), [art, w, h])
  return (
    <group position={position} rotation={rotation}>
      {/* back frame */}
      <mesh position-z={-0.12}>
        <boxGeometry args={[w + 0.3, h + 0.3, 0.2]} />
        <meshStandardMaterial color="#141416" metalness={0.8} roughness={0.45} />
      </mesh>
      {/* bezel */}
      <mesh position-z={0.0}>
        <boxGeometry args={[w + 0.12, h + 0.12, 0.06]} />
        <meshStandardMaterial color="#050505" metalness={0.5} roughness={0.6} />
      </mesh>
      {/* screen */}
      <mesh position-z={0.035}>
        <planeGeometry args={[w, h]} />
        {children ? (
          <meshBasicMaterial toneMapped={false}>{children}</meshBasicMaterial>
        ) : (
          <meshBasicMaterial map={map} toneMapped={false} />
        )}
      </mesh>
      {/* lamp bar */}
      {lamps && (
        <group position={[0, h / 2 + 0.35, 0.4]}>
          <mesh>
            <boxGeometry args={[w, 0.06, 0.06]} />
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
          </mesh>
          {Array.from({ length: Math.max(2, Math.round(w / 1.5)) }, (_, i) => i).map((i, _, a) => (
            <mesh key={i} position={[-w / 2 + (w / (a.length - 1)) * i, -0.08, 0.05]} rotation-x={0.6}>
              <boxGeometry args={[0.22, 0.08, 0.14]} />
              <meshBasicMaterial color="#fff6e8" toneMapped={false} />
            </mesh>
          ))}
        </group>
      )}
      {posts && (
        <>
          {[-w / 3, w / 3].map((x) => (
            <mesh key={x} position={[x, -h / 2 - postH / 2, -0.15]}>
              <cylinderGeometry args={[0.12, 0.16, postH, 12]} />
              <meshStandardMaterial color="#1a1a1c" metalness={0.8} roughness={0.5} />
            </mesh>
          ))}
          {/* catwalk */}
          <mesh position={[0, -h / 2 - 0.25, 0.25]}>
            <boxGeometry args={[w + 0.4, 0.05, 0.7]} />
            <meshStandardMaterial color="#1a1a1c" metalness={0.7} roughness={0.5} />
          </mesh>
        </>
      )}
      <pointLight position={[0, 0, 2.5]} intensity={18} distance={12} color={glow} decay={1.6} />
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  A product spinning live inside a billboard screen                  */
/* ------------------------------------------------------------------ */
function LiveScreen({ kind = 'pet', bg = '#e8000d' }) {
  const g = useRef()
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.9
  })
  return (
    <RenderTexture attach="map" width={1024} height={512} frames={QUALITY.mobile ? 30 : Infinity}>
      <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={30} />
      <color attach="background" args={[bg]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 4, 5]} intensity={3} />
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={4} position={[0, 3, 3]} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-4, 0, 1]} rotation-y={Math.PI / 2} scale={[1, 8, 1]} />
        <Lightformer form="rect" intensity={2} position={[4, 0, 1]} rotation-y={-Math.PI / 2} scale={[1, 8, 1]} />
      </Environment>
      {/* opaque products only: transmission does not survive a render-to-texture pass */}
      <group ref={g} rotation-z={-0.2} scale={1.5}>
        <Product kind={kind} droplets={false} bubbles={false} />
      </group>
    </RenderTexture>
  )
}

/* ------------------------------------------------------------------ */
/*  Buildings – one instanced mesh, lit windows texture                */
/* ------------------------------------------------------------------ */
function Buildings() {
  const ref = useRef()
  const tex = facade(4)
  const blocks = useMemo(() => {
    const out = []
    let seed = 3
    const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const rows = QUALITY.mobile ? 9 : 14
    for (const side of [-1, 1]) {
      for (let i = 0; i < rows; i++) {
        const w = 2.5 + r() * 2.5
        const d = 2.5 + r() * 2
        const h = 6 + r() * 16
        out.push({ x: side * (7 + w / 2 + r() * 1.5), z: 6 - i * 5.2, w, d, h })
      }
      // back rows for skyline depth
      for (let i = 0; i < rows - 3; i++) {
        const w = 3 + r() * 3
        const h = 10 + r() * 22
        out.push({ x: side * (15 + r() * 8), z: 2 - i * 6.5, w, d: 4, h })
      }
    }
    return out
  }, [])
  useEffect(() => {
    const m = ref.current
    const o = new THREE.Object3D()
    blocks.forEach((b, i) => {
      o.position.set(b.x, b.h / 2, b.z)
      o.scale.set(b.w, b.h, b.d)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
    })
    m.instanceMatrix.needsUpdate = true
  }, [blocks])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, blocks.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#0c0b0e" roughness={0.8} metalness={0.2} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.9} map={tex} />
    </instancedMesh>
  )
}

/* ------------------------------------------------------------------ */
/*  Camera flight path through the campaign district                   */
/* ------------------------------------------------------------------ */
const PATH = new THREE.CatmullRomCurve3(
  [
    [0, 1.4, 9],
    [0.6, 1.9, 2],
    [-0.8, 2.6, -5],
    [1.4, 3.6, -12],
    [-0.4, 4.6, -18],
    [0.6, 5.4, -27],
    [-1.2, 7, -35],
    [0, 13, -30],
  ].map((p) => new THREE.Vector3(...p)),
  false,
  'centripetal',
)
const LOOK = new THREE.CatmullRomCurve3(
  [
    [-2, 3.6, -6],
    [-4, 4, -8],
    [4, 4.2, -15],
    [3, 4.6, -18],
    [0, 7, -24],
    [-5, 5.5, -33],
    [4.5, 5, -41],
    [0, 12, -58],
  ].map((p) => new THREE.Vector3(...p)),
  false,
  'centripetal',
)

export function CityCamera({ state }) {
  const p = useMemo(() => new THREE.Vector3(), [])
  const l = useMemo(() => new THREE.Vector3(), [])
  const cur = useMemo(() => new THREE.Vector3(-2, 3.6, -6), [])
  useFrame(({ camera, pointer }, dt) => {
    const t = THREE.MathUtils.clamp(state.current.t, 0, 1)
    PATH.getPoint(t, p)
    LOOK.getPoint(t, l)
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3)
    camera.position.lerp(p.set(p.x + pointer.x * 0.3, p.y + pointer.y * 0.15, p.z), k)
    cur.lerp(l, k)
    camera.lookAt(cur)
  })
  return null
}

/* ------------------------------------------------------------------ */
/*  The whole district                                                 */
/* ------------------------------------------------------------------ */
export function CityScene({ state }) {
  return (
    <>
      <color attach="background" args={['#070103']} />
      <fog attach="fog" args={['#120205', 10, 62]} />
      <ambientLight intensity={0.25} color="#ffb3b3" />
      <hemisphereLight args={['#ff6a5a', '#050000', 0.35]} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2} color="#ff2a1a" position={[0, 4, -10]} scale={[20, 4, 1]} />
        <Lightformer form="rect" intensity={1.5} position={[0, 10, 0]} rotation-x={Math.PI / 2} scale={[20, 20, 1]} color="#ffe9e4" />
        <Lightformer form="rect" intensity={1} color="#ff5040" position={[-10, 2, 0]} rotation-y={Math.PI / 2} scale={[30, 4, 1]} />
      </Environment>
      <CityCamera state={state} />

      {/* wet asphalt */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -25]}>
        <planeGeometry args={[80, 120]} />
        <meshStandardMaterial color="#0a0405" metalness={0.75} roughness={0.32} />
      </mesh>
      {/* lane markings */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.01, 6 - i * 4.2]}>
          <planeGeometry args={[0.12, 1.6]} />
          <meshBasicMaterial color="#5a3a3a" />
        </mesh>
      ))}

      <Buildings />

      <Billboard position={[-4.6, 4.4, -6]} rotation={[0, 0.55, 0]} w={6} h={3} art="feeling" postH={2.9} />
      <Billboard position={[4.8, 4.6, -15]} rotation={[0, -0.6, 0]} w={6.4} h={3.2} postH={3} glow="#ff5a3a">
        <LiveScreen kind="classic" />
      </Billboard>
      {/* gantry over the street with a can bursting out of the screen */}
      <group>
        <Billboard position={[0, 7.2, -24]} w={9} h={3.6} art="magic" postH={5.4} glow="#ff2a1a" />
        <group position={[2.2, 7.3, -23.2]} rotation={[0.25, -0.5, -0.5]} scale={2.1}>
          <Product kind="classic" droplets={false} />
        </group>
      </group>
      <Billboard position={[-6.4, 6.2, -33]} rotation={[0, 0.7, 0]} w={4.2} h={6.4} art="zero" posts={false} glow="#ff1010" />
      <Billboard position={[6.3, 5.4, -41]} rotation={[0, -0.75, 0]} w={7} h={3.4} art="share" postH={3.7} glow="#ffffff" />
      {/* rooftop sign on the skyline */}
      <Billboard position={[0, 14, -58]} w={16} h={6} art="logo" postH={8} glow="#ff2a1a" lamps={false} />
    </>
  )
}
