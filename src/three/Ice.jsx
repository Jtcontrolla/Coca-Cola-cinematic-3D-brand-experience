import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { QUALITY } from '../lib/quality'

/** Procedural ice cubes orbiting a product: rounded boxes with clear, slightly frosted material. */
export default function Ice({ count = 7, radius = 1.1, y = 0, spread = 1.6, size = 0.28 }) {
  const group = useRef()
  const cubes = useMemo(
    () =>
      Array.from({ length: QUALITY.mobile ? Math.ceil(count / 2) : count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4
        return {
          a,
          r: radius + Math.random() * 0.5,
          y: y + (Math.random() - 0.5) * spread,
          s: size * (0.7 + Math.random() * 0.6),
          rx: Math.random() * Math.PI,
          ry: Math.random() * Math.PI,
          sp: 0.2 + Math.random() * 0.4,
        }
      }),
    [count, radius, y, spread, size],
  )
  const refs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime * (QUALITY.reduced ? 0 : 1)
    cubes.forEach((c, i) => {
      const m = refs.current[i]
      if (!m) return
      const a = c.a + t * 0.08
      m.position.set(Math.sin(a) * c.r, c.y + Math.sin(t * c.sp + i) * 0.08, Math.cos(a) * c.r)
      m.rotation.set(c.rx + t * c.sp * 0.3, c.ry + t * c.sp * 0.2, 0)
    })
  })
  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <RoundedBox key={i} ref={(el) => (refs.current[i] = el)} args={[c.s, c.s * 0.95, c.s * 1.05]} radius={c.s * 0.16} smoothness={3}>
          {QUALITY.transmission ? (
            <meshPhysicalMaterial color="#eef8ff" transmission={1} roughness={0.12} thickness={0.6} ior={1.31} clearcoat={1} clearcoatRoughness={0.3} envMapIntensity={1.5} />
          ) : (
            <meshPhysicalMaterial color="#eef8ff" transparent opacity={0.45} roughness={0.1} clearcoat={1} envMapIntensity={2.5} depthWrite={false} />
          )}
        </RoundedBox>
      ))}
    </group>
  )
}
