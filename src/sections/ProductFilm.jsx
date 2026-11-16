import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product } from '../three/Products'
import Split from '../components/Split'

const M = QUALITY.mobile

/**
 * Reusable pinned product film. Each variety page passes:
 *  - `initial` state for camera/product/backdrop, `rig` for cap/tab/fizz
 *  - `build(tl, { s, r, M })` to choreograph its own signature sequence
 *  - `beats`: copy lines with in/out times on the same timeline
 *  - `title`/`kicker`/`intro`: the page heading shown on arrival
 */
export default function ProductFilm({
  kind,
  flavour,
  initial,
  rig: rigInit = { cap: 0, tab: 0, fizz: 0.12 },
  build,
  beats = [],
  length = '+=320%',
  title,
  intro,
  accent = '#ff2a1a',
  ink = '#ffffff',
  bg = '#F40009',
  extras = null,
  fallback,
  shadowY = -1.25,
  children,
}) {
  const root = useRef()
  // desktop arrival frame: product stands right of the title, then slides to centre as the title exits
  const restX = initial?.x ?? (M ? 0 : 1.15)
  const state = useRef({ spin: 0.3, rotY: 0, y: 0, scale: 1, camZ: 6.2, camY: 0.1, lookY: 0, glow: 1, env: 1, key: 1, ...initial, x: restX })
  const rig = useRef({ ...rigInit })

  useGSAP(
    () => {
      // load-in animates words/inner nodes; the scroll timeline owns chars/.pf-intro, so they never fight
      gsap.from('.pf-title .split-word', { yPercent: 115, stagger: 0.07, duration: 1.2, ease: 'expo.out', delay: 0.5 })
      gsap.from('.pf-in', { autoAlpha: 0, y: 24, duration: 1, delay: 0.95 })
      if (QUALITY.reduced) {
        // still frame: land on the composed end state of the film
        if (initial?.reducedState) Object.assign(state.current, initial.reducedState)
        state.current.x = restX
        return
      }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: length, scrub: 1, pin: '.pf-pin' },
      })
      tl.to('.pf-title .split-char', { yPercent: -120, stagger: 0.01, duration: 0.35, ease: 'power2.in' }, 0.05).to('.pf-intro', { autoAlpha: 0, duration: 0.25 }, 0.05)
      if (restX !== 0) tl.to(state.current, { x: 0, duration: 0.7, ease: 'power2.inOut' }, 0.05)
      build?.(tl, { s: state.current, r: rig.current, M })
      gsap.utils.toArray('.pf-beat').forEach((el, i) => {
        const b = beats[i]
        const parts = el.querySelectorAll(b.words ? '.split-word' : '.split-char')
        gsap.set(parts, { yPercent: 120 })
        tl.to(parts, { yPercent: 0, stagger: b.words ? 0.05 : 0.014, duration: 0.3, ease: 'power3.out' }, b.at)
        if (b.out !== undefined) tl.to(parts, { yPercent: -120, stagger: 0.006, duration: 0.25, ease: 'power2.in' }, b.out)
      })
      // make sure the timeline is at least as long as the last beat
      tl.to({}, { duration: 0.3 })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative" aria-labelledby="pf-title">
      <div className="pf-pin relative h-[100svh] overflow-hidden" style={{ background: bg, color: ink }} data-nav={ink === '#000000' ? 'dark' : undefined}>
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, state.current.camY, state.current.camZ], fov: 30 }} fallback={fallback}>
          <Backdrop state={state} />
          <CameraRig state={state} />
          <Studio accent={accent} state={state} shadowY={shadowY} />
          {extras?.({ state, rig })}
          <Rig state={state}>
            <Product kind={kind} flavour={flavour} rig={rig} />
          </Rig>
        </SceneCanvas>

        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-5 pb-10 md:px-10 md:pb-14">
          <h1 id="pf-title" className="pf-title display text-[clamp(3.8rem,12vw,13.5rem)]">
            <Split lines={title} />
          </h1>
          {intro && (
            <p className="pf-intro mt-4 max-w-[38ch] text-lg leading-snug md:text-xl">
              <span className="pf-in block">{intro}</span>
            </p>
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1600px] px-5 md:px-10 motion-reduce:hidden">
          {beats.map((b, i) => (
            <p key={i} className={`pf-beat display absolute text-[clamp(2.6rem,7.5vw,8rem)] ${b.className || 'left-5 top-[22%] md:left-10'}`}>
              <Split lines={b.lines} mode={b.words ? 'words' : 'chars'} />
            </p>
          ))}
        </div>
        {children}
      </div>
    </section>
  )
}
