import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { motion, AnimatePresence } from 'framer-motion'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop, CameraRig } from '../three/Stage'
import { Product } from '../three/Products'

function Item({ it, index, active, x }) {
  const g = useRef()
  useFrame((st, dt) => {
    const o = g.current
    if (!o) return
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 5)
    const on = active === index
    o.position.z += ((on ? 0.8 : 0) - o.position.z) * k
    o.position.y += ((on && !QUALITY.reduced ? Math.sin(st.clock.elapsedTime * 1.4) * 0.04 : 0) - o.position.y) * k
    o.rotation.y += on && !QUALITY.reduced ? dt * 0.8 : (0 - o.rotation.y) * k
  })
  return (
    <group ref={g} position-x={x}>
      <group scale={[it.sx || 1, it.sy || 1, it.sx || 1]}>
        <Product kind={it.kind} flavour={it.flavour} centered={false} droplets={false} bubbles={false} />
      </group>
    </group>
  )
}

/**
 * Interactive size line-up: real relative proportions side by side.
 * Pick a size (buttons or tap) and it steps forward and turns.
 */
export default function SizeLineup({ items, heading, intro, gap = 0.95, colors, bg = '#000', ink = '#fff', camZ = 9, camY = 1.3 }) {
  const root = useRef()
  const [active, setActive] = useState(Math.min(1, items.length - 1))
  const total = (items.length - 1) * gap
  const state = useRef({ camZ: QUALITY.mobile ? camZ * 1.35 : camZ, camY, lookY: camY * 0.75, glow: 1, ...colors })

  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.from('.sl-head > *', { y: 40, autoAlpha: 0, stagger: 0.1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
    },
    { scope: root },
  )

  const it = items[active]
  return (
    <section ref={root} className="relative overflow-hidden" style={{ background: bg, color: ink }} data-nav={ink === '#000000' ? 'dark' : undefined} aria-labelledby="sizes-title">
      <div className="sl-head mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-32">
        <h2 id="sizes-title" className="display text-[clamp(3rem,8vw,8.5rem)]">
          {heading}
        </h2>
        <p className="mt-3 max-w-[44ch] text-lg opacity-80">{intro}</p>
      </div>
      <div className="relative h-[62svh] md:h-[72svh]">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, camY, camZ], fov: 30 }}>
          <Backdrop state={state} />
          <CameraRig state={state} />
          <Studio accent={colors?.core || '#ff2a1a'} shadowY={0.001} />
          <group position-y={0}>
            {items.map((x, i) => (
              <Item key={i} it={x} index={i} active={active} x={-total / 2 + i * gap} />
            ))}
          </group>
        </SceneCanvas>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-col gap-8 px-5 pb-24 md:flex-row md:items-end md:justify-between md:px-10 md:pb-32">
        <div role="tablist" aria-label="Sizes" className="flex flex-wrap gap-2">
          {items.map((x, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={active === i}
              onClick={() => setActive(i)}
              className={`min-h-11 cursor-pointer rounded-full border-2 px-5 text-base font-semibold transition-colors duration-300 ${active === i ? 'border-current bg-current' : 'border-current/30 hover:border-current'}`}
            >
              <span style={active === i ? { color: bg } : undefined}>{x.label}</span>
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={active} initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -16, opacity: 0 }} transition={{ duration: 0.35 }} className="max-w-[40ch] md:text-right" aria-live="polite">
            <p className="display text-[clamp(2.6rem,5vw,4.5rem)]">{it.label}</p>
            <p className="mt-1 text-sm opacity-70">{it.dims}</p>
            <p className="mt-3 text-lg leading-snug opacity-90">{it.note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
