import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product } from '../three/Products'

/**
 * Close-up tour: the camera travels to each detail of the model
 * (cap, flutes, tab, dome…) while a caption explains what you're looking at.
 * The stops are a real sequence, so they're numbered.
 */
export default function AnatomyTour({ kind, flavour, stops, heading, colors = {}, ink = '#fff', bg = '#000' }) {
  const root = useRef()
  const state = useRef({ spin: 0, rotY: 0, x: 0, y: 0, scale: 1, camZ: 6, camY: 0, lookY: 0, glow: 0.9, float: 0.3, core: colors.core || '#5a0008', edge: colors.edge || '#000', floor: colors.floor || '#000' })
  const rig = useRef({ cap: 0, tab: 0, fizz: 0.15 })

  useGSAP(
    () => {
      const caps = gsap.utils.toArray('.at-cap')
      gsap.set(caps.slice(1), { autoAlpha: 0, y: 30 })
      Object.assign(state.current, stops[0].cam, stops[0].product || {})
      if (QUALITY.reduced) return
      const s = state.current
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: root.current, start: 'top top', end: `+=${stops.length * 90}%`, scrub: 1, pin: '.at-pin' } })
      stops.forEach((st, i) => {
        if (i === 0) return
        tl.to(s, { ...st.cam, ...(st.product || {}), duration: 1 }, i - 1 + 0.2)
        if (st.rig) tl.to(rig.current, { ...st.rig, duration: 0.8 }, i - 1 + 0.4)
        tl.to(caps[i - 1], { autoAlpha: 0, y: -30, duration: 0.3 }, i - 1 + 0.2).to(caps[i], { autoAlpha: 1, y: 0, duration: 0.35 }, i - 1 + 0.6)
      })
      tl.to({}, { duration: 0.4 })
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative" aria-labelledby={`at-${kind}`}>
      <div className="at-pin relative h-[100svh] overflow-hidden" style={{ background: bg, color: ink }}>
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0, 6], fov: 30 }}>
          <Backdrop state={state} />
          <CameraRig state={state} damping={3} />
          <Studio accent={colors.core || '#ff2a1a'} shadow={false} />
          <Rig state={state} pointer={false}>
            <Product kind={kind} flavour={flavour} rig={rig} />
          </Rig>
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1600px] px-5 md:px-10">
          <h2 id={`at-${kind}`} className="absolute left-5 top-[calc(var(--nav-h)+16px)] text-lg font-semibold md:left-10">
            {heading}
          </h2>
          {stops.map((st, i) => (
            <div key={i} className="at-cap absolute bottom-10 left-5 max-w-[34ch] md:bottom-auto md:left-10 md:top-1/2 md:-translate-y-1/2">
              <p className="display text-[clamp(1.2rem,2vw,1.6rem)] opacity-60">
                {i + 1} / {stops.length}
              </p>
              <h3 className="display mt-2 text-[clamp(2.8rem,6vw,6.5rem)]">{st.title}</h3>
              <p className="mt-3 text-lg leading-snug opacity-85">{st.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
