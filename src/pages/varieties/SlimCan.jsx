import { useRef } from 'react'
import ProductFilm from '../../sections/ProductFilm'
import SizeLineup from '../../sections/SizeLineup'
import NextVariety from '../../sections/NextVariety'
import Split from '../../components/Split'
import { gsap, useGSAP } from '../../lib/scroll'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Art direction: fashion editorial. Pale grey seamless, black type,
  a turntable plinth. The can rises onto the plinth like a model taking the
  stage, the camera tilts up its full length, then the lights drop to
  "evening" and the tab is lifted.
*/
function build(tl, { s, r, M: m }) {
  tl.to(s, { y: 0, duration: 0.9, ease: 'power3.out' }, 0.1)
    .to(s, { rotY: Math.PI * 1.5, duration: 1.8, ease: 'sine.inOut' }, 0.3)
    // tilt up the length
    .to(s, { camY: -0.9, lookY: -0.6, camZ: m ? 4.4 : 3.2, duration: 0.6, ease: 'power2.inOut' }, 1.0)
    .to(s, { camY: 1.2, lookY: 0.75, duration: 1.1, ease: 'power1.inOut' }, 1.6)
    // evening: lights go down, the backdrop turns to charcoal
    .to(s, { core: '#3a3a3a', edge: '#050505', floor: '#0a0a0a', key: 0.55, duration: 0.8 }, 2.6)
    .to(s, { camZ: m ? 3 : 2.2, camY: 1.75, lookY: 0.8, duration: 0.7, ease: 'power2.inOut' }, 2.8)
    .to(r, { tab: 1, duration: 0.6, ease: 'power3.in' }, 3.4)
    .to(r, { fizz: 1, duration: 0.2 }, 3.9)
    .to(r, { fizz: 0.3, duration: 0.6 }, 4.2)
    .to(s, { camZ: m ? 7.8 : 6.4, camY: 0.2, lookY: 0, orbit: -0.5, rotY: '+=1', key: 1, duration: 1.2, ease: 'power2.inOut' }, 4.4)
}

function Plinth() {
  return (
    <mesh position-y={-0.73 - 1} receiveShadow>
      <cylinderGeometry args={[0.62, 0.66, 2, 64]} />
      <meshStandardMaterial color="#f4f4f4" roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

function Lookbook() {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.utils.toArray('.lb-img').forEach((el, i) => {
        gsap.fromTo(el, { yPercent: i % 2 ? 18 : -8 }, { yPercent: i % 2 ? -18 : 8, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
      gsap.fromTo('.lb-vert', { yPercent: 20 }, { yPercent: -30, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from('.lb-head .split-char', { yPercent: 120, stagger: 0.02, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 65%' } })
    },
    { scope: root },
  )
  return (
    <section ref={root} data-nav="dark" className="relative overflow-hidden bg-[#ececec] py-24 text-ink md:py-36" aria-labelledby="lb-title">
      <p className="lb-vert display pointer-events-none absolute right-[-2vw] top-0 text-[28vw] leading-none text-ink/[0.06] [writing-mode:vertical-rl]" aria-hidden="true">
        Slim
      </p>
      <div className="mx-auto max-w-[1600px] px-5 md:px-10">
        <h2 id="lb-title" className="lb-head display text-[clamp(3.2rem,9vw,9.5rem)]">
          <Split lines={['The evening', 'edit.']} />
        </h2>
        <div className="mt-16 grid grid-cols-12 gap-4 md:gap-8">
          <figure className="col-span-10 md:col-span-5">
            <div className="aspect-[3/4] overflow-hidden">
              <img src="/images/slim-red.jpg" alt="A slim Coca-Cola can floating against red" loading="lazy" className="lb-img h-[120%] w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-ink/60">Red on red: the slim can on its own.</figcaption>
          </figure>
          <figure className="col-span-8 col-start-5 md:col-span-4 md:col-start-9 md:mt-40">
            <div className="aspect-[3/4] overflow-hidden">
              <img src="/images/slim-studio.jpg" alt="A slim Coca-Cola can with its vertical script and white ribbon" loading="lazy" className="lb-img h-[120%] w-full object-cover" />
            </div>
            <figcaption className="mt-3 text-sm text-ink/60">Condensation is the only accessory.</figcaption>
          </figure>
          <div className="col-span-12 md:col-span-5 md:-mt-24">
            <p className="max-w-[36ch] text-xl leading-snug">
              Same 330 ml, recut. The slim can stands 146 mm tall and 58 mm across: easier to hold, easier to pour into a tall glass, made for dinner tables and rooftop bars.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SlimCan() {
  return (
    <>
      <ProductFilm
        kind="slim"
        title={['The slim', 'can.']}
        intro="Tall, sleek and dressed for the evening. Scroll to bring it on stage."
        bg="#e9e9e9"
        ink="#000000"
        accent="#ffffff"
        initial={{
          y: -0.8,
          x: 0, // stays on its plinth
          spin: 0,
          float: 0,
          camZ: M ? 7.4 : 6.2,
          camY: 0.3,
          lookY: 0.05,
          scale: M ? 1 : 1.05,
          core: '#ffffff',
          edge: '#bcbcbc',
          floor: '#d8d8d8',
          glow: 1,
          reducedState: { y: 0 },
        }}
        shadowY={-0.73}
        build={build}
        length="+=420%"
        beats={[
          { lines: ['Tall.'], at: 0.6, out: 1.3, className: 'left-5 top-[20%] md:left-10' },
          { lines: ['Slim.'], at: 1.4, out: 2.3, className: 'right-5 top-[30%] text-right md:right-10' },
          { lines: ['Dressed for', 'the evening.'], at: 2.75, out: 3.6, className: 'left-5 bottom-[14%] text-paper md:left-10' },
          { lines: ['Same taste.', 'New silhouette.'], at: 4.9, className: 'inset-x-5 bottom-[10%] text-center text-paper md:inset-x-10' },
        ]}
        extras={() => <Plinth />}
        fallback={<img src="/images/slim-red.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <Lookbook />
      <SizeLineup
        heading="Slim vs. classic"
        intro="The same 330 ml in two shapes, shown to scale."
        bg="#ececec"
        ink="#000000"
        colors={{ core: '#ffffff', edge: '#cfcfcf', floor: '#dcdcdc' }}
        gap={1.0}
        camZ={7.5}
        camY={0.9}
        items={[
          { kind: 'slim', label: 'Slim 330 ml', dims: '146 mm tall, 58 mm across', note: 'Taller and narrower, the script running up its full height.' },
          { kind: 'classic', label: 'Classic 330 ml', dims: '115 mm tall, 66 mm across', note: 'The everyday can, shorter and wider.' },
        ]}
      />
      <NextVariety current="slim-can" />
    </>
  )
}
