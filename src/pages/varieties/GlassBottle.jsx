import { useRef } from 'react'
import ProductFilm from '../../sections/ProductFilm'
import AnatomyTour from '../../sections/AnatomyTour'
import NextVariety from '../../sections/NextVariety'
import { MomentBanner } from '../../sections/Banners'
import Split from '../../components/Split'
import { gsap, useGSAP } from '../../lib/scroll'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Signature: the silhouette. The bottle falls into a dark studio and lands
  as pure outline against a red glow. Then the lights come up, the crown cap
  pops and the camera moves in on the flutes.
*/
function build(tl, { s, r, M: m }) {
  tl.to(s, { y: 0, camY: 0.1, lookY: 0, duration: 0.8, ease: 'power3.in' }, 0.1)
    .to(s, { tiltZ: 0.06, duration: 0.1, ease: 'power2.out' }, 0.9)
    .to(s, { tiltZ: 0, duration: 0.3, ease: 'elastic.out(1, 0.4)' }, 1.0)
    // hold the silhouette, then bring the lights up
    .to(s, { glow: 1.6, duration: 0.6 }, 1.1)
    .to(s, { env: 1, key: 1, core: '#a3000e', edge: '#1a0003', glow: 1, duration: 1, ease: 'power2.inOut' }, 2.0)
    // 360° turn
    .to(s, { rotY: Math.PI * 2, duration: 1.2, ease: 'power2.inOut' }, 2.4)
    // the pop
    .to(s, { camZ: m ? 4 : 3.1, camY: 0.95, lookY: 0.85, duration: 0.7, ease: 'power2.inOut' }, 3.4)
    .to(r, { cap: 1, duration: 0.6, ease: 'power2.out' }, 4.0)
    .to(r, { fizz: 1, duration: 0.4 }, 4.05)
    // macro on the flutes
    .to(s, { camZ: m ? 3 : 2.0, camY: -0.55, lookY: -0.55, camX: m ? 0 : 0.35, rotY: '+=1.2', duration: 1.1, ease: 'power2.inOut' }, 4.8)
    .to(s, { camZ: m ? 7.6 : 6.2, camY: 0.2, lookY: 0, camX: 0, orbit: Math.PI * 2, duration: 1.4, ease: 'power2.inOut' }, 6.0)
}

function Heritage() {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.fromTo('.her-year', { xPercent: -20 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from('.her-line .split-word', { yPercent: 110, stagger: 0.04, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 60%' } })
      gsap.fromTo('.her-img', { clipPath: 'inset(30% 0% 30% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.her-img', start: 'top bottom', end: 'center center', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative overflow-hidden bg-[#0d0002] py-24 text-paper md:py-36" aria-labelledby="her-title">
      <p className="her-year display outline-type pointer-events-none whitespace-nowrap text-[42vw] leading-none text-coke/70" aria-hidden="true">
        1915
      </p>
      <div className="mx-auto -mt-[14vw] grid max-w-[1600px] gap-12 px-5 md:grid-cols-[1fr_1fr] md:px-10">
        <div className="her-img aspect-[4/5] overflow-hidden md:aspect-[3/4]">
          <img src="/images/glass-red-label.jpg" alt="A contour glass bottle with a red Coca-Cola label, beaded with condensation" loading="lazy" className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-end">
          <h2 id="her-title" className="her-line display text-[clamp(2.8rem,6vw,6.5rem)]">
            <Split lines={['Recognisable', 'in the dark.']} mode="words" />
          </h2>
          <p className="mt-6 max-w-[42ch] text-lg leading-relaxed text-paper/85">
            In 1915 the brief to glassmakers was simple and strange: design a bottle so distinct that you could recognise it by touch in the dark, or from a shard on the ground. The Root Glass Company of Terre Haute, Indiana answered with the contour: fluted shoulders, a pinched waist, a heavy heel.
          </p>
          <p className="mt-4 max-w-[42ch] text-lg leading-relaxed text-paper/85">A century later it is still the shape most people draw when you ask them to draw a bottle.</p>
        </div>
      </div>
    </section>
  )
}

export default function GlassBottle() {
  return (
    <>
      <ProductFilm
        kind="glass"
        title={['The contour', 'bottle.']}
        intro="Fluted glass, a crown cap and a shape you know by touch. Scroll to switch on the lights."
        bg="#1a0003"
        accent="#ff2a1a"
        initial={{
          y: 1.7,
          spin: 0,
          rotY: 0.3,
          camZ: M ? 7.6 : 6.2,
          camY: 2,
          lookY: 1.5,
          env: 0.04,
          key: 0,
          glow: 1.2,
          core: '#d0000f',
          edge: '#000000',
          floor: '#000000',
          scale: M ? 0.9 : 1.05,
          reducedState: { y: 0, camY: 0.1, lookY: 0, env: 1, key: 1, core: '#a3000e', edge: '#1a0003' },
        }}
        build={build}
        length="+=480%"
        beats={[
          { lines: ['You know it', 'by its outline.'], at: 1.2, out: 2.1, className: 'left-5 top-[18%] md:left-10' },
          { lines: ['Pop.'], at: 4.0, out: 4.7, className: 'right-5 top-[22%] text-right md:right-10' },
          { lines: ['Fluted glass,', 'since 1915.'], at: 5.0, out: 5.9, className: 'left-5 bottom-[12%] md:left-10' },
          { lines: ['Elegant.', 'Ice cold.'], at: 6.6, className: 'inset-x-5 bottom-[10%] text-center md:inset-x-10' },
        ]}
        fallback={<img src="/images/glass-red-label.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <Heritage />
      <AnatomyTour
        kind="glass"
        heading="Up close: the contour"
        bg="#120002"
        colors={{ core: '#6a0812', edge: '#0a0001', floor: '#000' }}
        stops={[
          { title: 'The silhouette', body: 'Hips, waist, shoulders. Seen whole, the outline is the logo.', cam: { camZ: M ? 7.4 : 6, camY: 0.1, lookY: 0, camX: M ? 0 : -0.6 }, product: { rotY: 0.3 } },
          { title: 'The crown', body: 'A steel crown cap with 21 crimps, the same number used on bottles around the world.', cam: { camZ: M ? 2.6 : 1.8, camY: 1.05, lookY: 0.95, camX: M ? 0 : -0.25 }, product: { rotY: 1.2 } },
          { title: 'The flutes', body: 'Vertical ribs above and below the label give your fingers something to hold.', cam: { camZ: M ? 2.8 : 2.0, camY: 0.45, lookY: 0.4, camX: M ? 0 : -0.3 }, product: { rotY: 2.4 } },
          { title: 'The waist', body: 'The straight waist where the red label wraps, right where your hand closes.', cam: { camZ: M ? 3 : 2.2, camY: -0.15, lookY: -0.12, camX: M ? 0 : -0.35 }, product: { rotY: 3.4 } },
          { title: 'The heel', body: 'Thick glass at the base keeps it standing and keeps it cold a little longer.', cam: { camZ: M ? 3 : 2.3, camY: -0.95, lookY: -0.8, camX: M ? 0 : -0.3 }, product: { rotY: 4.4 } },
        ]}
      />
      <MomentBanner img="/images/pet-500.jpg" alt="A 500 ml Coca-Cola bottle beaded with condensation" />
      <NextVariety current="glass-bottle" />
    </>
  )
}
