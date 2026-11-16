import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import ProductFilm from '../sections/ProductFilm'
import { ShareBanner } from '../sections/Banners'
import Closing from '../sections/Closing'
import Split from '../components/Split'

const M = QUALITY.mobile

const CHAPTERS = [
  { year: '1886', title: 'A glass at the soda fountain', body: "Pharmacist John Pemberton's new drink is first served at Jacobs' Pharmacy in Atlanta, five cents a glass. His bookkeeper Frank M. Robinson names it and writes the name in flowing Spencerian script.", img: '/images/caps.jpg', alt: 'Red Coca-Cola crown caps' },
  { year: '1894', title: 'Into a bottle', body: 'In Vicksburg, Mississippi, a candy-store owner starts bottling it so people can take it home, and it begins to travel.', img: '/images/glass-red-label.jpg', alt: 'A contour glass bottle with a red label' },
  { year: '1915', title: 'The contour', body: 'Glassmakers in Terre Haute, Indiana design a bottle you can recognise in the dark. Its fluted silhouette becomes as famous as the name.', img: '/images/pet-500.jpg', alt: 'A 500 ml bottle beaded with condensation' },
  { year: '1969', title: 'The ribbon', body: 'A white, wave-like ribbon joins the wordmark. It still wraps every can and bottle.', img: '/images/slim-red.jpg', alt: 'A slim can floating against red' },
  { year: '2005', title: 'Zero', body: 'Coca-Cola Zero arrives: the original taste with no sugar. Today it is Coca-Cola Zero Sugar, in black with a red ribbon.', img: '/images/can-ice.jpg', alt: 'A Coca-Cola can resting in crushed ice' },
  { year: 'Today', title: 'Every shape, one feeling', body: 'Glass, PET and aluminium in sizes from a mini can to a party bottle. The way the moment feels stays the same.', img: '/images/lineup.jpg', alt: 'The full line-up of cans and bottles' },
]

function Timeline() {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      const track = root.current.querySelector('.tl-track')
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const move = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: '.tl-pin', invalidateOnRefresh: true } })
      gsap.to('.tl-bar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: true } })
      gsap.utils.toArray('.tl-ch').forEach((el) => {
        gsap.from(el.querySelectorAll('.tl-in'), { yPercent: 60, opacity: 0, stagger: 0.08, ease: 'power3.out', scrollTrigger: { trigger: el, containerAnimation: move, start: 'left 85%', end: 'left 45%', scrub: true } })
        const img = el.querySelector('img')
        gsap.fromTo(img, { xPercent: -10 }, { xPercent: 10, ease: 'none', scrollTrigger: { trigger: el, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative bg-ink text-paper" aria-labelledby="tl-title">
      <div className="tl-pin relative flex h-[100svh] flex-col overflow-hidden motion-reduce:h-auto">
        <div className="mx-auto w-full max-w-[1600px] px-5 pt-[calc(var(--nav-h)+20px)] md:px-10">
          <h2 id="tl-title" className="display text-[clamp(3rem,7vw,7.5rem)]">
            How we got here
          </h2>
          <div className="mt-4 h-[2px] w-full bg-paper/15">
            <div className="tl-bar h-full origin-left scale-x-0 bg-coke motion-reduce:scale-x-100" />
          </div>
        </div>
        <ol className="tl-track flex w-max flex-1 items-center gap-[6vw] px-5 py-10 md:px-10 motion-reduce:w-full motion-reduce:flex-col">
          {CHAPTERS.map((c) => (
            <li key={c.year} className="tl-ch grid w-[86vw] shrink-0 gap-6 md:w-[64vw] md:grid-cols-[1fr_1fr] md:items-end">
              <div className="aspect-[4/3] overflow-hidden md:aspect-[4/5]">
                <img src={c.img} alt={c.alt} loading="lazy" className="h-full w-[120%] max-w-none object-cover" />
              </div>
              <div>
                <p className="tl-in display text-[clamp(4rem,10vw,10rem)] text-coke">{c.year}</p>
                <h3 className="tl-in mt-2 text-2xl font-semibold md:text-3xl">{c.title}</h3>
                <p className="tl-in mt-3 max-w-[40ch] text-lg leading-relaxed text-paper/80">{c.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Manifesto() {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.fromTo('.mf .split-word', { opacity: 0.12 }, { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 60%', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="bg-coke px-5 py-28 text-paper md:px-10 md:py-44" aria-label="What we believe">
      <p className="mf display mx-auto max-w-[1400px] text-[clamp(2.6rem,6.6vw,7.4rem)]">
        <Split lines="We don't sell a drink. We pour a pause into the busiest day, a toast into the quietest table, a little magic into ordinary moments, and then we pass it on." mode="words" />
      </p>
    </section>
  )
}

export default function Story() {
  return (
    <>
      <ProductFilm
        kind="glass"
        title={['Our', 'story.']}
        intro="It began with one glass in Atlanta. Scroll back through the moments that made the bottle."
        bg="#120002"
        initial={{ spin: 0.15, rotY: 0.6, camZ: M ? 7.6 : 6.2, camY: 0.1, lookY: 0, env: 0.15, key: 0.2, glow: 1.3, core: '#b3000c', edge: '#000', floor: '#000', scale: M ? 0.9 : 1, reducedState: { env: 1, key: 1 } }}
        build={(tl, { s, M: m }) => {
          tl.to(s, { env: 1, key: 1, glow: 1, core: '#6a0812', edge: '#0d0002', duration: 1 }, 0.3)
            .to(s, { camZ: m ? 4 : 3, camY: -0.1, lookY: -0.1, camX: m ? 0 : 0.5, rotY: '+=2', duration: 1.2, ease: 'power2.inOut' }, 0.8)
            .to(s, { camZ: m ? 7.8 : 6.4, camX: 0, camY: 0.2, lookY: 0, orbit: Math.PI * 2, duration: 1.4, ease: 'power2.inOut' }, 2.2)
        }}
        length="+=260%"
        beats={[
          { lines: ['Since', '1886.'], at: 0.9, out: 1.9, className: 'left-5 top-[20%] md:left-10' },
          { lines: ['Shared ever since.'], at: 2.6, className: 'inset-x-5 bottom-[10%] text-center md:inset-x-10' },
        ]}
        fallback={<img src="/images/glass-red-label.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <Timeline />
      <Manifesto />
      <ShareBanner />
      <Closing title="Pick up the story where you like." />
    </>
  )
}
