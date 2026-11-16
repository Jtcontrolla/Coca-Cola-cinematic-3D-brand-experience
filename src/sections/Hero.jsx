import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas, Studio, Backdrop, Rig, CameraRig } from '../three/Stage'
import { Product } from '../three/Products'
import TypePlane from '../three/TypePlane'
import Split from '../components/Split'

const M = QUALITY.mobile
// desktop: the bottle stands right of the headline; phones: above it
const X = M ? 0 : 1.2

function HeroScene({ state, rig }) {
  const logo = useRef()
  useFrame((_, dt) => {
    const s = state.current
    const l = logo.current
    if (!l) return
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 4)
    l.position.y += ((s.logoY ?? 0.15) - l.position.y) * k
    l.position.z += ((s.logoZ ?? -3.6) - l.position.z) * k
    const sc = s.logoScale ?? 1
    l.scale.x += (sc - l.scale.x) * k
    l.scale.y = l.scale.x
  })
  return (
    <>
      <Backdrop state={state} />
      <CameraRig state={state} />
      <Studio accent="#ff3b2a" shadowY={-1.16} state={state} />
      <TypePlane kind="logo" width={M ? 4.6 : 6.4} aspect={1.9} position={[M ? 0 : 0.7, 0.62, -2.2]} innerRef={logo} />
      <Rig state={state}>
        <Product kind="pet" rig={rig} />
      </Rig>
    </>
  )
}

export default function Hero() {
  const root = useRef()
  const state = useRef({
    spin: 0.45,
    rotY: -0.4,
    x: X,
    y: M ? 0.35 : 0.02,
    scale: M ? 0.78 : 1.02,
    camZ: M ? 7.4 : 6.2,
    camY: 0.1,
    lookY: 0,
    core: '#ff2116',
    edge: '#9c0010',
    floor: '#2a0004',
    glow: 1,
    logoY: M ? 0.75 : 0.72,
    logoZ: -3.6,
    logoScale: 1,
  })
  const rig = useRef({ cap: 0, fizz: 0.12, tab: 0 })

  useGSAP(
    () => {
      // page-load beat: words rise out of their masks
      gsap.from('.hero-title .split-word', { yPercent: 115, duration: 1.3, stagger: 0.08, ease: 'expo.out', delay: 0.55 })
      gsap.from('.hero-in', { autoAlpha: 0, y: 24, duration: 1, stagger: 0.12, delay: 1.05 }) // inner nodes: the scroll timeline owns .hero-fade

      if (QUALITY.reduced) return
      const s = state.current
      const r = rig.current
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=280%', scrub: 1, pin: '.hero-pin' },
      })
      // 1 · the bottle wakes up: faster spin, camera begins to approach
      tl.to(s, { spin: 3.2, camZ: M ? 6 : 4.6, camY: 0.35, camX: X * 0.6, lookX: X * 0.6, logoScale: 1.15, duration: 1, ease: 'power1.in' }, 0)
        .to('.hero-title .split-char', { yPercent: -120, stagger: 0.012, duration: 0.45, ease: 'power2.in' }, 0.05)
        .to('.hero-fade', { autoAlpha: 0, y: -24, duration: 0.3 }, 0.05)
        // 2 · push in on the cap
        .to(s, { camZ: M ? 3.6 : 2.9, camY: M ? 1.25 : 1.25, lookY: M ? 1.2 : 1.15, camX: X, lookX: X, spin: 0.25, logoY: -0.6, duration: 1, ease: 'power2.inOut' }, 1)
        .fromTo('.hero-beat-1 .split-char', { yPercent: 120 }, { yPercent: 0, stagger: 0.02, duration: 0.35, ease: 'power3.out' }, 1.15)
        // 3 · the cap twists free, carbonation wakes
        .to(r, { cap: 1, duration: 0.9, ease: 'power2.inOut' }, 1.5)
        .to(r, { fizz: 1, duration: 0.5 }, 1.75)
        .fromTo('.hero-beat-2 .split-char', { yPercent: 120 }, { yPercent: 0, stagger: 0.02, duration: 0.35, ease: 'power3.out' }, 1.9)
        .to('.hero-beat-1 .split-char, .hero-beat-2 .split-char', { yPercent: -120, stagger: 0.008, duration: 0.3, ease: 'power2.in' }, 2.45)
        // 4 · the bottle falls through the floor into the next scene; studio light drains to black
        .to(s, { camZ: M ? 8 : 6.8, camY: 0.2, lookY: -0.8, y: -3.6, x: 0, camX: 0, lookX: 0, rotY: Math.PI * 2.2, spin: 0.15, logoY: 4.8, logoScale: 1.3, duration: 1.3, ease: 'power2.in' }, 2.5)
        .to(s, { core: '#2a0003', edge: '#000000', floor: '#000000', glow: 0.6, duration: 1.1 }, 2.6)
        .to(r, { fizz: 0.1, duration: 0.6 }, 3.2)
        .fromTo('.hero-beat-3 .split-word', { yPercent: 120 }, { yPercent: 0, stagger: 0.06, duration: 0.4, ease: 'power3.out' }, 3.05)
    },
    { scope: root },
  )

  return (
    <section ref={root} className="relative" aria-labelledby="hero-title">
      <div className="hero-pin relative h-[100svh] w-full overflow-hidden bg-coke">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.1, 6.2], fov: 30 }} fallback={<img src="/images/lineup.jpg" alt="" className="h-full w-full object-cover" />}>
          <HeroScene state={state} rig={rig} />
        </SceneCanvas>

        {/* foreground copy */}
        <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-5 pb-[calc(env(safe-area-inset-bottom)+28px)] md:px-10 md:pb-12">
          <h1 id="hero-title" className="hero-title display text-[clamp(4.2rem,11.5vw,13rem)] text-paper">
            <Split lines={['Open', 'Happiness.']} />
          </h1>
          <div className="mt-5 flex items-end justify-between gap-6">
            <p className="hero-fade max-w-[30ch] text-lg leading-snug text-paper md:text-xl">
              <span className="hero-in block">Every moment deserves a little refreshment.</span>
            </p>
            <div className="hero-fade hidden text-sm text-paper md:block">
              <div className="hero-in flex items-center gap-3">
              <span>Scroll to open</span>
              <span className="relative block h-12 w-px overflow-hidden bg-paper/25">
                <span className="scroll-cue absolute inset-0 bg-paper" />
              </span>
              </div>
            </div>
          </div>
        </div>

        {/* scroll beats */}
        <div className="pointer-events-none absolute inset-x-0 top-[16%] motion-reduce:hidden mx-auto max-w-[1600px] px-5 md:top-[22%] md:px-10">
          <p className="hero-beat-1 display text-[clamp(2.6rem,7vw,7rem)] text-paper">
            <Split lines="It starts with a twist" />
          </p>
          <p className="hero-beat-2 display mt-2 text-right text-[clamp(2.6rem,7vw,7rem)] text-paper">
            <Split lines="and a sound you can taste." />
          </p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[12%] motion-reduce:hidden mx-auto max-w-[1600px] px-5 md:px-10">
          <p className="hero-beat-3 display text-center text-[clamp(2.4rem,6vw,6rem)] text-paper">
            <Split lines="Now meet the family." mode="words" />
          </p>
        </div>
      </div>
    </section>
  )
}
