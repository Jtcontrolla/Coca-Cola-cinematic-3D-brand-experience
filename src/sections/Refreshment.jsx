import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product } from '../three/Products'
import Ice from '../three/Ice'
import Split from '../components/Split'

const M = QUALITY.mobile

/**
 * The Refreshment Experience: a slow macro dolly over the contour bottle,
 * ice orbiting, carbonation rising, three short lines of copy.
 */
export default function Refreshment() {
  const root = useRef()
  const state = useRef({ spin: 0.25, rotY: 0.4, x: M ? 0 : -0.2, y: 0, scale: M ? 0.85 : 1, camZ: M ? 8 : 7, camY: 0.3, camX: 0, lookY: 0, core: '#5c0710', edge: '#0a0001', floor: '#000', glow: 1.1 })
  const rig = useRef({ fizz: 0.5, cap: 0 })

  useGSAP(
    () => {
      if (QUALITY.reduced) return
      const s = state.current
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=240%', scrub: 1, pin: '.refresh-pin' },
      })
      const beats = gsap.utils.toArray('.refresh-beat')
      beats.forEach((b) => gsap.set(b.querySelectorAll('.split-char'), { yPercent: 120 }))
      tl.to(s, { camZ: M ? 4.2 : 3.1, camY: 0.0, lookY: -0.15, camX: M ? 0 : 0.6, duration: 1, ease: 'power2.inOut' }, 0)
        .to(beats[0].querySelectorAll('.split-char'), { yPercent: 0, stagger: 0.015, duration: 0.3, ease: 'power3.out' }, 0.25)
        .to(beats[0].querySelectorAll('.split-char'), { yPercent: -120, stagger: 0.008, duration: 0.25, ease: 'power2.in' }, 0.9)
        .to(s, { camZ: M ? 3.2 : 2.1, camY: 0.75, lookY: 0.55, camX: M ? 0 : -0.4, rotY: '+=2', duration: 1, ease: 'power2.inOut' }, 1)
        .to(rig.current, { fizz: 1, duration: 0.6 }, 1.1)
        .to(beats[1].querySelectorAll('.split-char'), { yPercent: 0, stagger: 0.015, duration: 0.3, ease: 'power3.out' }, 1.25)
        .to(beats[1].querySelectorAll('.split-char'), { yPercent: -120, stagger: 0.008, duration: 0.25, ease: 'power2.in' }, 1.9)
        .to(s, { camZ: M ? 7.5 : 6, camY: 0.2, lookY: 0, camX: 0, core: '#b3000c', edge: '#2a0004', duration: 1, ease: 'power2.inOut' }, 2)
        .to(beats[2].querySelectorAll('.split-char'), { yPercent: 0, stagger: 0.015, duration: 0.3, ease: 'power3.out' }, 2.3)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative" aria-labelledby="refresh-title">
      <h2 id="refresh-title" className="sr-only">
        The refreshment experience
      </h2>
      <div className="refresh-pin relative h-[100svh] overflow-hidden bg-burgundy">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.3, 7], fov: 30 }} fallback={<img src="/images/glass-red-label.jpg" alt="" className="h-full w-full object-cover" />}>
          <Backdrop state={state} />
          <CameraRig state={state} />
          <Studio accent="#ff2a1a" shadowY={-1.0} state={state} />
          <Rig state={state}>
            <Product kind="glass" rig={rig} />
            <Ice radius={0.95} y={-0.5} spread={1.4} />
          </Rig>
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="refresh-beat motion-reduce:hidden display absolute bottom-[10%] left-5 text-[clamp(3rem,9vw,9rem)] md:left-10 md:top-[30%] md:bottom-auto">
            <Split lines={['Cold enough', 'to fog the glass.']} />
          </p>
          <p className="refresh-beat motion-reduce:hidden display absolute bottom-[10%] right-5 text-right text-[clamp(3rem,9vw,9rem)] md:right-10 md:top-[30%] md:bottom-auto">
            <Split lines={['Bubbles racing', 'for the top.']} />
          </p>
          <p className="refresh-beat display absolute inset-x-5 bottom-[8%] text-center text-[clamp(3rem,10vw,11rem)] md:inset-x-10">
            <Split lines="Then, the first sip." />
          </p>
        </div>
      </div>
    </section>
  )
}
