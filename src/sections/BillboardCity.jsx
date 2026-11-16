import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas } from '../three/Stage'
import { CityScene } from '../three/City'
import Split from '../components/Split'

const LINES = [
  { lines: ['Refresh', 'your world.'], align: 'left' },
  { lines: ['Live on', 'every screen.'], align: 'right' },
  { lines: ['Real magic', 'at street level.'], align: 'left' },
  { lines: ['One red', 'skyline.'], align: 'center' },
]

/** The 3D billboard district: scroll flies the camera past the campaign at night. */
export default function BillboardCity({ id = 'billboards', heading = 'The campaign, after dark' }) {
  const root = useRef()
  const state = useRef({ t: QUALITY.reduced ? 0.62 : 0 })

  useGSAP(
    () => {
      if (QUALITY.reduced) return
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=360%', scrub: 1.2, pin: '.city-pin' },
      })
      tl.to(state.current, { t: 1, duration: 4 }, 0)
      gsap.utils.toArray('.city-line').forEach((el, i) => {
        const chars = el.querySelectorAll('.split-char')
        gsap.set(chars, { yPercent: 120 })
        const at = i * 1 + 0.15
        tl.to(chars, { yPercent: 0, stagger: 0.012, duration: 0.3, ease: 'power3.out' }, at)
        if (i < LINES.length - 1) tl.to(chars, { yPercent: -120, stagger: 0.006, duration: 0.25, ease: 'power2.in' }, at + 0.65)
      })
      tl.fromTo('.city-intro', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.2 }, 0.05)
    },
    { scope: root },
  )

  return (
    <section ref={root} id={id} className="relative" aria-labelledby={`${id}-title`}>
      <div className="city-pin grain relative h-[100svh] overflow-hidden bg-ink">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 1.4, 9], fov: 48 }} fallback={<img src="/images/pet-2l-dark.jpg" alt="" className="h-full w-full object-cover" />}>
          <CityScene state={state} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.65))]" />
        <div className="city-intro pointer-events-none absolute left-5 top-[calc(var(--nav-h)+20px)] max-w-[36ch] md:left-10">
          <h2 id={`${id}-title`} className="text-xl font-semibold">
            {heading}
          </h2>
          <p className="mt-2 text-paper/70">Keep scrolling to drive through the campaign district.</p>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[8%] mx-auto max-w-[1600px] px-5 md:px-10">
          {LINES.map((l, i) => (
            <p
              key={i}
              className={`city-line display absolute inset-x-5 bottom-0 text-[clamp(3rem,9.5vw,10rem)] md:inset-x-10 ${i < LINES.length - 1 ? 'motion-reduce:hidden' : ''} ${l.align === 'right' ? 'text-right' : l.align === 'center' ? 'text-center' : ''}`}
            >
              <Split lines={l.lines} />
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
