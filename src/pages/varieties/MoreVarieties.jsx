import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import gsap from 'gsap'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../../three/Stage'
import { Product } from '../../three/Products'
import NextVariety from '../../sections/NextVariety'
import CampaignWall from '../../sections/CampaignWall'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

const FLAVOURS = [
  { id: 'cherry', name: 'Cherry', line: 'Classic Coca-Cola with a dark cherry finish.', core: '#9a1446', edge: '#2a0012', floor: '#12000a', ink: '#fff' },
  { id: 'vanilla', name: 'Vanilla', line: 'Smooth, creamy vanilla over the original taste.', core: '#f2e6cf', edge: '#b98b4e', floor: '#5a3a17', ink: '#2a1a08' },
  { id: 'light', name: 'Light', line: 'A lighter take in a silver can.', core: '#e8eaee', edge: '#9aa0a8', floor: '#5a5f66', ink: '#111' },
  { id: 'lime', name: 'Lime', line: 'A squeeze of lime, served ice cold.', core: '#c8ea5a', edge: '#4a7a10', floor: '#1a2a04', ink: '#0a1400' },
  { id: 'original', name: 'Original', line: 'Where every flavour starts.', core: '#ff2a1a', edge: '#9c0010', floor: '#2a0004', ink: '#fff' },
]

function Carousel({ index, state, rig }) {
  const f = FLAVOURS[index]
  const [shown, setShown] = useState(f.id)
  useEffect(() => {
    const s = state.current
    Object.assign(s, { core: f.core, edge: f.edge, floor: f.floor })
    if (shown === f.id) return
    const tl = gsap.timeline()
    tl.to(s, { x: -3, rotY: s.rotY - 2, duration: QUALITY.reduced ? 0 : 0.35, ease: 'power2.in' })
      .add(() => setShown(f.id))
      .set(s, { x: 3 })
      .to(s, { x: 0, rotY: s.rotY - 4, duration: QUALITY.reduced ? 0 : 0.7, ease: 'power3.out' })
    return () => tl.kill()
  }, [f, shown, state])
  return (
    <>
      <Backdrop state={state} />
      <CameraRig state={state} />
      <Studio accent={f.core} shadowY={-0.84} state={state} />
      <Rig state={state}>
        <Product kind="classic" flavour={shown} rig={rig} />
      </Rig>
    </>
  )
}

export default function MoreVarieties() {
  const [i, setI] = useState(0)
  const f = FLAVOURS[i]
  const state = useRef({ x: 0, y: 0, rotY: 0, spin: 0.4, scale: M ? 1.15 : 1.45, camZ: M ? 7 : 6, camY: 0.15, lookY: 0, core: f.core, edge: f.edge, floor: f.floor, glow: 1 })
  const rig = useRef({ tab: 0, fizz: 0 })
  const go = useCallback((d) => setI((v) => (v + d + FLAVOURS.length) % FLAVOURS.length), [])
  const touch = useRef(0)

  useEffect(() => {
    const on = (e) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [go])

  return (
    <>
      <section
        className="relative h-[100svh] overflow-hidden transition-colors duration-700"
        style={{ background: f.core, color: f.ink }}
        aria-labelledby="more-title"
        onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const d = e.changedTouches[0].clientX - touch.current
          if (Math.abs(d) > 50) go(d < 0 ? 1 : -1)
        }}
      >
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.15, 6], fov: 30 }} fallback={<img src="/images/can-ice.jpg" alt="" className="h-full w-full object-cover" />}>
          <Carousel index={i} state={state} rig={rig} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-between px-5 pb-10 pt-[calc(var(--nav-h)+20px)] md:px-10 md:pb-14">
          <h1 id="more-title" className="text-lg font-semibold">
            More varieties
          </h1>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={f.id} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.5, ease: [0.77, 0, 0.18, 1] }}>
                  <p className="display text-[clamp(4.5rem,16vw,17rem)]">{f.name}</p>
                  <p className="mt-2 max-w-[34ch] text-lg">{f.line}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <button type="button" onClick={() => go(-1)} aria-label="Previous flavour" className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-current transition-transform hover:scale-105">
                <ArrowLeft aria-hidden="true" />
              </button>
              <span className="display w-16 text-center text-3xl tabular-nums" aria-live="polite">
                {i + 1}/{FLAVOURS.length}
              </span>
              <button type="button" onClick={() => go(1)} aria-label="Next flavour" className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full border-2 border-current transition-transform hover:scale-105">
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>
      <CampaignWall title="The wider family" intro="Different flavours, same ribbon. Scroll sideways through the work." />
      <NextVariety current="more" />
    </>
  )
}
