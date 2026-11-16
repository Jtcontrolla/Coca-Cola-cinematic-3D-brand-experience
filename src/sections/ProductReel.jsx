import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { VARIETIES } from '../lib/varieties'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product, DISPLAY_SCALE } from '../three/Products'
import Split from '../components/Split'

const M = QUALITY.mobile
// each product arrives from a different direction and leaves through another
const ENTER = [
  { x: 0, y: -4.5, rotY: -3 },
  { x: -6, y: 0.4, rotY: 3 },
  { x: 0, y: 4.5, rotY: -2 },
  { x: 6, y: 0, rotY: 4 },
  { x: 0, y: -4.5, rotY: 3 },
  { x: -6, y: -0.4, rotY: -3 },
  { x: 6, y: 0, rotY: 3 },
]
const EXIT = [
  { x: 6, y: 0.6, rotY: 3 },
  { x: 0, y: 4.5, rotY: -3 },
  { x: -6, y: -0.3, rotY: 3 },
  { x: 0, y: -4.5, rotY: -3 },
  { x: 6, y: 0.3, rotY: 3 },
  { x: 0, y: 4.5, rotY: 3 },
  { x: -6, y: 0, rotY: -3 },
]

function ReelScene({ cam, states, items }) {
  return (
    <>
      <Backdrop state={cam} />
      <CameraRig state={cam} />
      <Studio accent="#ff2a1a" shadow={false} />
      {items.map((v, i) => (
        <Rig key={v.slug} state={{ current: states[i] }} damping={7}>
          <group scale={DISPLAY_SCALE[v.kind] || 1}>
            <Product kind={v.kind} flavour={v.flavour || (v.kind === 'zero' ? 'zero' : 'original')} droplets={!M} bubbles={false} />
          </group>
        </Rig>
      ))}
    </>
  )
}

/**
 * The continuous "advertising film": a pinned scene where each variety
 * enters, takes the light, then hands over to the next one. One GSAP timeline,
 * scrubbed by scroll, drives every product, the camera and the backdrop.
 */
export default function ProductReel({ items = VARIETIES, title = 'The family' }) {
  const root = useRef()
  const restX = M ? 0 : 1.35
  const restY = M ? 0.55 : 0
  const cam = useRef({ camZ: M ? 8.2 : 6.6, camY: 0.2, camX: 0, lookY: 0, core: items[0].core, edge: items[0].edge, floor: items[0].floor, glow: 1 })
  const states = useRef(
    items.map((v, i) => ({
      visible: i === 0,
      x: i === 0 ? restX : ENTER[i % 7].x,
      y: i === 0 ? restY : ENTER[i % 7].y,
      rotY: 0,
      spin: 0.5,
      scale: M ? 0.78 : 1.15,
      tiltZ: 0,
    })),
  ).current

  useGSAP(
    () => {
      const panels = gsap.utils.toArray('.reel-panel')
      gsap.set(panels.slice(1), { autoAlpha: 0 })
      // reduced motion: a still frame of the first product; every variety stays reachable from the menu & footer
      if (QUALITY.reduced) return
      const c = cam.current
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${items.length * 95}%`, scrub: 1, pin: '.reel-pin' },
      })
      const SEG = 2
      items.forEach((v, i) => {
        const s = states[i]
        const t0 = i * SEG
        const panel = panels[i]
        const chars = panel.querySelectorAll('.split-char')
        const rest = panel.querySelectorAll('.reel-fade')
        if (i > 0) {
          const e = ENTER[i % 7]
          tl.set(s, { visible: true }, t0 - 0.05)
            .fromTo(s, { x: e.x, y: e.y, rotY: e.rotY, tiltZ: e.x ? -Math.sign(e.x) * 0.5 : 0 }, { x: restX, y: restY, rotY: 0, tiltZ: 0, duration: 0.8, ease: 'power3.out' }, t0)
            .to(c, { core: v.core, edge: v.edge, floor: v.floor, camX: (i % 2 ? -0.25 : 0.25), duration: 0.6 }, t0)
            .set(panel, { autoAlpha: 1 }, t0)
            .fromTo(chars, { yPercent: 120 }, { yPercent: 0, stagger: 0.012, duration: 0.45, ease: 'power3.out' }, t0 + 0.15)
            .fromTo(rest, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: 'power2.out' }, t0 + 0.35)
        }
        // hold: a slow turn under the light
        tl.to(s, { rotY: '+=1.4', duration: 0.9, ease: 'sine.inOut' }, t0 + 0.8)
        if (i < items.length - 1) {
          const x = EXIT[i % 7]
          tl.to(s, { x: x.x, y: x.y, rotY: `+=${x.rotY}`, tiltZ: x.x ? Math.sign(x.x) * 0.5 : 0, duration: 0.6, ease: 'power3.in' }, t0 + 1.55)
            .to(chars, { yPercent: -120, stagger: 0.006, duration: 0.3, ease: 'power2.in' }, t0 + 1.6)
            .to(rest, { autoAlpha: 0, duration: 0.2 }, t0 + 1.6)
            .set(panel, { autoAlpha: 0 }, t0 + 1.95)
            .set(s, { visible: false }, t0 + 2.15)
        }
      })
      // progress rail
      tl.fromTo('.reel-progress', { scaleX: 0 }, { scaleX: 1, duration: tl.duration(), ease: 'none' }, 0)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative" aria-label={title}>
      <div className="reel-pin relative h-[100svh] w-full overflow-hidden bg-ink">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.2, 6.6], fov: 30 }} fallback={<img src="/images/lineup.jpg" alt="" className="h-full w-full object-cover" />}>
          <ReelScene cam={cam} states={states} items={items} />
        </SceneCanvas>

        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1600px] px-5 md:px-10">
          {items.map((v, i) => (
            <article
              key={v.slug}
              className="reel-panel absolute inset-x-5 bottom-[max(6vh,28px)] md:inset-x-10 md:bottom-auto md:top-1/2 md:w-[46%] md:-translate-y-1/2"
              style={{ color: v.ink }}
            >
              <p className="reel-fade mb-3 text-sm opacity-80">{v.short === 'More' ? 'And beyond' : v.short}</p>
              <h3 className="display text-[clamp(3rem,6.6vw,7.5rem)]">
                <Split lines={v.name.split(' ').length > 2 ? [v.name.split(' ').slice(0, -2).join(' '), v.name.split(' ').slice(-2).join(' ')] : v.name} />
              </h3>
              <p className="reel-fade mt-4 max-w-[34ch] text-lg leading-snug md:text-xl">{v.line}</p>
              <Link
                to={`/varieties/${v.slug}`}
                className="reel-fade pointer-events-auto mt-6 inline-flex min-h-11 items-center gap-2 border-b-2 border-current pb-1 text-base font-semibold"
              >
                Play the {v.short === 'More' ? 'flavours' : 'full'} film <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>

        <div className="absolute inset-x-5 top-[calc(var(--nav-h)+8px)] h-[2px] bg-paper/15 md:inset-x-10">
          <div className="reel-progress h-full origin-left bg-paper" />
        </div>
      </div>
    </section>
  )
}
