import { useRef, useState } from 'react'
import { PresentationControls } from '@react-three/drei'
import ProductFilm from '../../sections/ProductFilm'
import NextVariety from '../../sections/NextVariety'
import BillboardCity from '../../sections/BillboardCity'
import TypePlane from '../../three/TypePlane'
import { SceneCanvas, Studio, Backdrop } from '../../three/Stage'
import { Product } from '../../three/Products'
import Split from '../../components/Split'
import { gsap, useGSAP } from '../../lib/scroll'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Signature: out of the dark. Only a red rim light at first; the can turns
  until its black body catches the edge light, then the key light snaps on
  as the tab opens.
*/
function build(tl, { s, r, M: m }) {
  tl.to(s, { rotY: Math.PI * 1.25, glow: 0.9, duration: 1.4, ease: 'sine.inOut' }, 0.1)
    .to(s, { camZ: m ? 5.6 : 4.4, camY: 0.25, duration: 1.4 }, 0.1)
    .to(s, { env: 0.6, key: 0.5, duration: 0.8 }, 1.4)
    .to(s, { camZ: m ? 2.8 : 2.0, camY: 1.75, lookY: 0.5, duration: 0.8, ease: 'power2.inOut' }, 2.0)
    .to(r, { tab: 1, duration: 0.4, ease: 'power3.in' }, 2.8)
    .to(r, { fizz: 1, duration: 0.15 }, 3.15)
    .to(s, { env: 1, key: 1.1, core: '#c4000f', glow: 1.3, duration: 0.25 }, 3.15)
    .to(s, { core: '#3a0005', glow: 1, duration: 0.8 }, 3.5)
    .to(r, { fizz: 0.25, duration: 0.6 }, 3.7)
    .to(s, { camZ: m ? 7.4 : 6, camY: 0.2, lookY: 0, tiltZ: 0.15, rotY: '+=1.6', duration: 1.2, ease: 'power2.inOut' }, 3.9)
}

function Compare() {
  const root = useRef()
  const [side, setSide] = useState('both')
  const state = useRef({ core: '#2a0003', edge: '#000', floor: '#000', glow: 1 })
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.from('.cmp-title .split-char', { yPercent: 120, stagger: 0.02, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 65%' } })
    },
    { scope: root },
  )
  const opt = [
    { id: 'original', label: 'Original Taste' },
    { id: 'both', label: 'Side by side' },
    { id: 'zero', label: 'Zero Sugar' },
  ]
  const xo = side === 'original' ? 0 : side === 'zero' ? -1.6 : -0.8
  const xz = side === 'zero' ? 0 : side === 'original' ? 1.6 : 0.8
  return (
    <section ref={root} className="relative overflow-hidden bg-ink text-paper" aria-labelledby="cmp-title">
      <div className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-32">
        <h2 id="cmp-title" className="cmp-title display text-[clamp(3rem,8vw,8.5rem)]">
          <Split lines={['Same taste.', 'Different can.']} />
        </h2>
        <p className="mt-3 max-w-[42ch] text-paper/70">Drag to turn them. The red ribbon carries over; the black body is how you tell them apart.</p>
      </div>
      <div className="relative h-[60svh] cursor-grab active:cursor-grabbing md:h-[70svh]">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.2, M ? 7.5 : 6], fov: 30 }}>
          <Backdrop state={state} />
          <Studio accent="#ff1a1a" shadowY={-0.62} />
          <PresentationControls global={false} cursor={false} snap polar={[-0.3, 0.3]} azimuth={[-Math.PI, Math.PI]} speed={1.4}>
            <group position-x={xo} scale={side === 'zero' ? 0.001 : 1.05}>
              <Product kind="classic" flavour="original" droplets={!M} />
            </group>
            <group position-x={xz} scale={side === 'original' ? 0.001 : 1.05}>
              <Product kind="zero" droplets={!M} />
            </group>
          </PresentationControls>
        </SceneCanvas>
      </div>
      <div className="mx-auto flex max-w-[1600px] flex-wrap gap-2 px-5 pb-24 md:px-10 md:pb-32" role="radiogroup" aria-label="Choose cans to show">
        {opt.map((o) => (
          <button
            key={o.id}
            role="radio"
            aria-checked={side === o.id}
            onClick={() => setSide(o.id)}
            className={`min-h-11 cursor-pointer rounded-full border-2 px-5 font-semibold transition-colors ${side === o.id ? 'border-coke bg-coke text-paper' : 'border-paper/30 hover:border-paper'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default function ZeroSugar() {
  return (
    <>
      <ProductFilm
        kind="zero"
        title={['Zero', 'sugar.']}
        intro="Real Coca-Cola taste, zero sugar. Scroll to bring it out of the dark."
        bg="#000000"
        accent="#ff0a0a"
        initial={{
          spin: 0,
          rotY: -1.2,
          camZ: M ? 7.6 : 6.4,
          camY: 0.15,
          lookY: 0,
          scale: M ? 1.15 : 1.4,
          env: 0.08,
          key: 0,
          glow: 0.5,
          core: '#5a0008',
          edge: '#000000',
          floor: '#000000',
          reducedState: { env: 1, key: 1 },
        }}
        build={build}
        length="+=380%"
        beats={[
          { lines: ['Black', 'by design.'], at: 0.5, out: 1.4, className: 'left-5 top-[20%] md:left-10' },
          { lines: ['Zero', 'sugar.'], at: 1.6, out: 2.6, className: 'right-5 top-[24%] text-right text-coke md:right-10' },
          { lines: ['All', 'the taste.'], at: 4.3, className: 'inset-x-5 bottom-[10%] text-center md:inset-x-10' },
        ]}
        extras={() => <TypePlane kind="text" lines={['ZERO']} width={M ? 5.5 : 10} aspect={2.2} position={[0, 0.1, -2.8]} color="#e8000d" />}
        fallback={<img src="/images/can-ice.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <Compare />
      <BillboardCity id="zero-city" heading="Zero, after dark" />
      <NextVariety current="zero-sugar" />
    </>
  )
}
