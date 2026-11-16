import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { SceneCanvas } from '../three/Stage'
import { Billboard } from '../three/City'
import { Product } from '../three/Products'
import BillboardCity from '../sections/BillboardCity'
import CampaignWall from '../sections/CampaignWall'
import { FeelingBanner, MomentBanner, ShareBanner } from '../sections/Banners'
import Split from '../components/Split'

const M = QUALITY.mobile

/* A single monumental billboard, revealed from three angles as you scroll. */
function HeroBoard({ state }) {
  const bottle = useRef()
  useFrame(({ camera, clock }, dt) => {
    const s = state.current
    const k = 1 - Math.exp(-Math.min(dt, 0.05) * 3)
    const a = s.angle
    const r = s.radius
    camera.position.x += (Math.sin(a) * r - camera.position.x) * k
    camera.position.z += (Math.cos(a) * r - camera.position.z) * k
    camera.position.y += (s.camY - camera.position.y) * k
    camera.lookAt(0, s.lookY, 0)
    if (bottle.current) {
      bottle.current.rotation.y += dt * (QUALITY.reduced ? 0 : 0.6)
      bottle.current.position.z = 0.6 + s.emerge * 1.6
      bottle.current.position.y = 0.2 + Math.sin(clock.elapsedTime) * 0.05
    }
  })
  return (
    <>
      <color attach="background" args={['#0a0002']} />
      <fog attach="fog" args={['#0a0002', 12, 40]} />
      <ambientLight intensity={0.3} />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 5]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#ff2a1a" position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={2} position={[6, 1, 0]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
      </Environment>
      <spotLight position={[0, 8, 6]} angle={0.5} penumbra={1} intensity={120} color="#fff2ea" />
      <Billboard position={[0, 0, 0]} w={8} h={4} art="feeling" postH={6} />
      <group ref={bottle} scale={1.7}>
        <Product kind="pet" droplets={false} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position-y={-8}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#080203" metalness={0.7} roughness={0.35} />
      </mesh>
    </>
  )
}

const ERAS = [
  { year: '1929', line: 'The Pause That Refreshes', note: 'A cold drink as a small daily ritual.' },
  { year: '1971', line: "I'd Like to Buy the World a Coke", note: 'Sung on a hilltop by a crowd from everywhere.' },
  { year: '1979', line: 'Have a Coke and a Smile', note: 'Warmth, in thirty seconds.' },
  { year: '1982', line: 'Coke Is It!', note: 'Confident, loud, everywhere.' },
  { year: '1993', line: 'Always Coca-Cola', note: 'A jingle the world still hums.' },
  { year: '2009', line: 'Open Happiness', note: 'An invitation, not a slogan.' },
  { year: '2016', line: 'Taste the Feeling', note: 'One brand, every variety, one message.' },
  { year: '2021', line: 'Real Magic', note: 'The moments we share, together.' },
]

function Eras() {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.utils.toArray('.era').forEach((el) => {
        gsap.from(el.querySelectorAll('.era-in'), { yPercent: 100, opacity: 0, stagger: 0.08, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 82%' } })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} data-nav="dark" className="bg-paper px-5 py-24 text-ink md:px-10 md:py-36" aria-labelledby="eras-title">
      <div className="mx-auto max-w-[1600px]">
        <h2 id="eras-title" className="display text-[clamp(3rem,8vw,8.5rem)] text-coke">
          Nearly a century of headlines
        </h2>
        <ol className="mt-16">
          {ERAS.map((e) => (
            <li key={e.year} className="era grid grid-cols-[5.5rem_1fr] items-baseline gap-4 overflow-hidden border-t border-ink/15 py-5 md:grid-cols-[14rem_1fr_22rem] md:py-7">
              <span className="era-in display text-3xl text-coke md:text-6xl">{e.year}</span>
              <span className="era-in display text-[clamp(2rem,5vw,5rem)]">{e.line}</span>
              <span className="era-in col-start-2 text-ink/65 md:col-start-3 md:text-right">{e.note}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* Pinned hero lives in its own component so its ScrollTrigger is created
   before the sections below it (React runs child effects before the parent's). */
function CampaignHero() {
  const root = useRef()
  const state = useRef({ angle: -0.9, radius: M ? 17 : 13, camY: 1.2, lookY: 0.4, emerge: 0 })
  useGSAP(
    () => {
      gsap.from('.ch-title .split-word', { yPercent: 115, duration: 1.2, ease: 'expo.out', delay: 0.5 })
      if (QUALITY.reduced) {
        Object.assign(state.current, { angle: 0, emerge: 1 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' }, scrollTrigger: { trigger: root.current, start: 'top top', end: '+=260%', scrub: 1, pin: '.ch-pin' } })
      tl.to('.ch-title .split-char', { yPercent: -120, stagger: 0.01, duration: 0.4, ease: 'power2.in' }, 0)
        .to(state.current, { angle: 0.85, camY: -2.5, lookY: 1, duration: 1 }, 0)
        .to(state.current, { angle: 0.32, radius: M ? 15 : 11.5, camY: 0.6, lookY: 0.2, emerge: 1, duration: 1 }, 1)
        .fromTo('.ch-beat .split-char', { yPercent: 120 }, { yPercent: 0, stagger: 0.015, duration: 0.4, ease: 'power3.out' }, 1.5)
    },
    { scope: root },
  )
  return (
      <section ref={root} className="relative" aria-labelledby="ch-title">
        <div className="ch-pin relative h-[100svh] overflow-hidden bg-ink">
          <SceneCanvas className="absolute inset-0" camera={{ position: [0, 1.2, 13], fov: 35 }} fallback={<img src="/images/pet-2l-dark.jpg" alt="" className="h-full w-full object-cover" />}>
            <HeroBoard state={state} />
          </SceneCanvas>
          <div className="pointer-events-none absolute inset-0 mx-auto flex max-w-[1600px] flex-col justify-end px-5 pb-10 md:px-10 md:pb-14">
            <h1 id="ch-title" className="ch-title display text-[clamp(4.2rem,15vw,16rem)]">
              <Split lines="Campaigns" />
            </h1>
            <p className="ch-beat display absolute inset-x-5 bottom-[7%] text-right text-[clamp(2.6rem,6vw,6.5rem)] md:inset-x-10 motion-reduce:hidden">
              <Split lines={['Out of the screen,', 'into the street.']} />
            </p>
          </div>
        </div>
      </section>
  )
}

export default function Campaigns() {
  return (
    <>
      <CampaignHero />
      <Eras />
      <BillboardCity id="campaign-city" heading="One campaign, one city" />
      <FeelingBanner />
      <CampaignWall />
      <MomentBanner />
      <ShareBanner to="/varieties" cta="Explore the varieties" />
    </>
  )
}
