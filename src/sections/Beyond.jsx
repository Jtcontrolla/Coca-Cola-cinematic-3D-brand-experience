import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop } from '../three/Stage'
import { Product } from '../three/Products'

const KINDS = ['pet', 'classic', 'glass', 'slim', 'zero', 'medium', 'classic', 'pet', 'slim', 'glass', 'zero', 'mini', 'classic', 'medium']
const FLAV = ['original', 'original', null, 'original', 'zero', 'original', 'cherry', 'original', 'zero', null, 'zero', 'original', 'light', 'vanilla']

function Cloud({ state }) {
  const g = useRef()
  const items = useMemo(() => {
    const n = QUALITY.mobile ? 8 : KINDS.length
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2
      const r = 2.2 + (i % 3) * 1.1
      return {
        kind: KINDS[i],
        flavour: FLAV[i] || 'original',
        pos: [Math.cos(a) * r, ((i * 37) % 7) / 2.2 - 1.6, Math.sin(a) * r - 1.5],
        rot: [((i * 13) % 10) / 10, a, ((i * 7) % 10) / 6 - 0.8],
        s: 0.55 + ((i * 5) % 4) * 0.12,
      }
    })
  }, [])
  useFrame(({ pointer }, dt) => {
    if (!g.current) return
    const s = state.current
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3)
    g.current.rotation.y += (s.rot + pointer.x * 0.35 - g.current.rotation.y) * k
    g.current.rotation.x += (-pointer.y * 0.12 + s.tilt - g.current.rotation.x) * k
    g.current.position.y += (s.y - g.current.position.y) * k
  })
  return (
    <group ref={g}>
      {items.map((it, i) => (
        <Float key={i} speed={QUALITY.reduced ? 0 : 1.2 + (i % 3) * 0.4} rotationIntensity={QUALITY.reduced ? 0 : 1.2} floatIntensity={QUALITY.reduced ? 0 : 1.4}>
          <group position={it.pos} rotation={it.rot} scale={it.s}>
            <Product kind={it.kind} flavour={it.flavour} droplets={false} bubbles={false} />
          </group>
        </Float>
      ))}
    </group>
  )
}

/** Beyond the Bottle: an orbiting constellation of every format, with outline type you can see through. */
export default function Beyond() {
  const root = useRef()
  const state = useRef({ rot: 0, tilt: 0.1, y: 0, core: '#d4000f', edge: '#3a0006', floor: '#140002', glow: 1 })
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.to(state.current, { rot: Math.PI * 1.2, tilt: -0.15, y: 0.6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 } })
      gsap.fromTo('.by-row-a', { xPercent: 8 }, { xPercent: -22, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.fromTo('.by-row-b', { xPercent: -22 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[150svh] overflow-clip bg-oxblood" aria-labelledby="beyond-title">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.3, 9], fov: 40 }} fallback={<img src="/images/pet-500.jpg" alt="" className="h-full w-full object-cover" />}>
          <Backdrop state={state} />
          <Studio accent="#ff3020" shadow={false} />
          <Cloud state={state} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-center gap-[2vw] overflow-hidden text-paper" aria-hidden="true">
          <p className="by-row-a display outline-type whitespace-nowrap text-[22vw]">Beyond the bottle</p>
          <p className="by-row-b display outline-type whitespace-nowrap text-[22vw]">Beyond the can</p>
        </div>
        <div className="pointer-events-none absolute bottom-10 left-5 max-w-[38ch] md:left-10">
          <h2 id="beyond-title" className="text-2xl font-semibold leading-tight">Beyond the bottle</h2>
          <p className="mt-2 text-paper/85">Glass, PET, aluminium: every shape, one idea. Move your pointer and they turn to look.</p>
        </div>
      </div>
    </section>
  )
}
