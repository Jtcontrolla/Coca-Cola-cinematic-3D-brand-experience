import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { nextOf } from '../lib/varieties'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product, DISPLAY_SCALE } from '../three/Products'
import Split from '../components/Split'

/** End-of-film hand-off: the next variety rises into frame, so pages chain like one reel. */
export default function NextVariety({ current }) {
  const v = nextOf(current)
  const root = useRef()
  const state = useRef({ spin: 0.6, rotY: 0, x: QUALITY.mobile ? 0 : 1.2, y: -3.2, scale: QUALITY.mobile ? 0.8 : 1, camZ: QUALITY.mobile ? 7.5 : 6.4, camY: 0.1, lookY: 0, core: v.core, edge: v.edge, floor: v.floor, glow: 1 })
  useGSAP(
    () => {
      if (QUALITY.reduced) {
        state.current.y = QUALITY.mobile ? 0.4 : 0
        return
      }
      gsap.to(state.current, { y: QUALITY.mobile ? 0.4 : 0, rotY: Math.PI * 2, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: 1 } })
      gsap.from('.nv-title .split-char', { yPercent: 120, stagger: 0.015, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 55%' } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[100svh] overflow-hidden" style={{ background: v.core, color: v.ink }} aria-labelledby="next-title">
      <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.1, 6.4], fov: 30 }}>
        <Backdrop state={state} />
        <CameraRig state={state} />
        <Studio accent={v.core} shadow={false} />
        <Rig state={state}>
          <group scale={DISPLAY_SCALE[v.kind] || 1}>
            <Product kind={v.kind} flavour={v.flavour || (v.kind === 'zero' ? 'zero' : 'original')} droplets={false} />
          </group>
        </Rig>
      </SceneCanvas>
      <div className="pointer-events-none relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-12 md:justify-center md:px-10 md:pb-0">
        <p className="mb-3 text-sm opacity-80">Next film</p>
        <h2 id="next-title" className="nv-title display max-w-[9ch] text-[clamp(3.6rem,10vw,11rem)]">
          <Split lines={v.name} />
        </h2>
        <Link to={`/varieties/${v.slug}`} className="pointer-events-auto mt-8 inline-flex min-h-12 w-fit items-center gap-3 rounded-full border-2 border-current px-6 text-lg font-semibold transition-colors hover:bg-paper hover:text-ink">
          Play next <ArrowRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
