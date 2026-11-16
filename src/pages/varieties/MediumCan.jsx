import ProductFilm from '../../sections/ProductFilm'
import SizeLineup from '../../sections/SizeLineup'
import NextVariety from '../../sections/NextVariety'
import { FeelingBanner } from '../../sections/Banners'
import TypePlane from '../../three/TypePlane'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Signature: short and sweet. The 250 ml can bounces into frame,
  does a quick double spin and pops open at the top of a little hop.
*/
function build(tl, { s, r, M: m }) {
  tl.to(s, { y: 0, duration: 0.7, ease: 'back.out(2.2)' }, 0.1)
    .to(s, { rotY: Math.PI * 4, duration: 1.4, ease: 'power3.inOut' }, 0.6)
    .to(s, { camZ: m ? 5.6 : 4.2, camY: 0.6, lookY: 0.2, duration: 1, ease: 'power2.inOut' }, 1.2)
    // the hop
    .to(s, { y: 0.6, tiltZ: -0.15, duration: 0.35, ease: 'power2.out' }, 2.2)
    .to(r, { tab: 1, duration: 0.3, ease: 'power3.in' }, 2.3)
    .to(r, { fizz: 1, duration: 0.15 }, 2.55)
    .to(s, { y: 0, tiltZ: 0, duration: 0.45, ease: 'bounce.out' }, 2.6)
    .to(s, { core: '#ffb02a', glow: 1.6, duration: 0.2 }, 2.55)
    .to(s, { core: '#ff5a2a', glow: 1, duration: 0.6 }, 2.8)
    .to(r, { fizz: 0.3, duration: 0.6 }, 3.1)
    .to(s, { camZ: m ? 7 : 5.6, camY: 0.2, lookY: 0, orbit: Math.PI * 0.4, duration: 1, ease: 'power2.inOut' }, 3.3)
}

export default function MediumCan() {
  return (
    <>
      <ProductFilm
        kind="medium"
        title={['The medium', 'can.']}
        intro="250 ml: the classic diameter with a shorter body. Scroll for a quick one."
        bg="#ff5a2a"
        initial={{
          y: -3.5,
          spin: 0.2,
          camZ: M ? 7.2 : 6,
          camY: 0.2,
          lookY: 0,
          scale: M ? 1.15 : 1.45,
          core: '#ff5a2a',
          edge: '#c2000f',
          floor: '#4a0008',
          reducedState: { y: 0 },
        }}
        build={build}
        length="+=320%"
        beats={[
          { lines: ['Short.'], at: 0.5, out: 1.1, className: 'left-5 top-[20%] md:left-10' },
          { lines: ['Sweet.'], at: 1.2, out: 1.9, className: 'right-5 top-[26%] text-right md:right-10' },
          { lines: ['Right-sized', 'refreshment.'], at: 3.4, className: 'inset-x-5 bottom-[10%] text-center md:inset-x-10' },
        ]}
        extras={() => <TypePlane kind="text" lines={['250', 'ML']} width={M ? 4.4 : 7} aspect={1.25} position={[0, 0.1, -2.6]} color="#ff7a4a" />}
        fallback={<img src="/images/lineup.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <SizeLineup
        heading="Every can, to scale"
        intro="From the 150 ml mini to the slim 330 ml, shown at their real relative sizes. The medium can is the one in the middle."
        bg="#2a0004"
        colors={{ core: '#b3000c', edge: '#2a0004', floor: '#120002' }}
        gap={0.9}
        camZ={8}
        camY={0.95}
        items={[
          { kind: 'mini', label: 'Mini 150 ml', dims: '89 mm tall, 53 mm across', note: 'A few cold sips, perfect with lunch.' },
          { kind: 'medium', label: 'Medium 250 ml', dims: '92 mm tall, 66 mm across', note: 'The classic diameter, a shorter body. Big enough to share a moment, small enough to finish it.' },
          { kind: 'classic', label: 'Classic 330 ml', dims: '115 mm tall, 66 mm across', note: 'The can most people picture first.' },
          { kind: 'slim', label: 'Slim 330 ml', dims: '146 mm tall, 58 mm across', note: 'The same volume as the classic in a taller shape.' },
        ]}
      />
      <FeelingBanner img="/images/can-ice.jpg" alt="A Coca-Cola can resting in crushed ice" title={['Small can.', 'Big feeling.']} body="Sometimes the best moment is a short one." />
      <NextVariety current="medium-can" />
    </>
  )
}
