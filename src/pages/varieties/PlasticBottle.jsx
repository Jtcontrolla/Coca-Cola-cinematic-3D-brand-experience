import ProductFilm from '../../sections/ProductFilm'
import SizeLineup from '../../sections/SizeLineup'
import { FeelingBanner } from '../../sections/Banners'
import NextVariety from '../../sections/NextVariety'
import TypePlane from '../../three/TypePlane'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Signature: the bottle drops in from above, the camera follows it down,
  it lands with a small squash-and-wobble, then the cap twists off and the
  cola wakes up. Finally the camera orbits round to the back of the label.
*/
function build(tl, { s, r, M: m }) {
  tl
    // 1 · drop: camera tracks the fall
    .to(s, { y: 0, camY: 0.1, lookY: 0, duration: 0.9, ease: 'power3.in' }, 0.1)
    .to(s, { spin: 0.2, duration: 0.9 }, 0.1)
    // 2 · impact: a quick wobble and camera bump
    .to(s, { tiltZ: 0.08, camY: -0.15, duration: 0.12, ease: 'power2.out' }, 1.0)
    .to(s, { tiltZ: -0.05, camY: 0.05, duration: 0.14, ease: 'sine.inOut' }, 1.12)
    .to(s, { tiltZ: 0, camY: 0.1, duration: 0.2, ease: 'sine.out' }, 1.26)
    .to(r, { fizz: 0.6, duration: 0.15 }, 1.0)
    .to(r, { fizz: 0.2, duration: 0.4 }, 1.15)
    // 3 · push in on the cap and unscrew it
    .to(s, { camZ: m ? 3.8 : 2.8, camY: 1.05, lookY: 0.9, core: '#ff3b2a', duration: 0.8, ease: 'power2.inOut' }, 1.5)
    .to(r, { cap: 1, duration: 1, ease: 'power1.inOut' }, 2.1)
    .to(r, { fizz: 1, duration: 0.5 }, 2.45)
    // 4 · dramatic light change + orbit
    .to(s, { camZ: m ? 7.2 : 5.6, camY: 0.3, lookY: 0.1, orbit: Math.PI * 0.85, key: 0.35, glow: 1.5, core: '#ff6a3a', edge: '#4a0008', duration: 1.4, ease: 'power2.inOut' }, 3.2)
    .to(s, { orbit: Math.PI * 2, key: 1, glow: 1, core: '#ff1d1d', edge: '#8a0010', duration: 1.2, ease: 'power2.inOut' }, 4.6)
}

export default function PlasticBottle() {
  return (
    <>
      <ProductFilm
        kind="pet"
        title={['The plastic', 'bottle.']}
        intro="Light, resealable and ready for the road. Scroll to drop it in."
        bg="#F40009"
        initial={{
          y: 1.9,
          spin: 2,
          camZ: M ? 7.6 : 6.2,
          camY: 2.2,
          lookY: 1.6,
          scale: M ? 0.85 : 1,
          core: '#ff1d1d',
          edge: '#8a0010',
          floor: '#2a0004',
          reducedState: { y: 0, camY: 0.1, lookY: 0 },
        }}
        build={build}
        length="+=420%"
        beats={[
          { lines: 'Dropped in.', at: 0.6, out: 1.4, className: 'left-5 top-[20%] md:left-10' },
          { lines: ['Twist.'], at: 2.05, out: 2.5, className: 'right-5 top-[24%] text-right md:right-10' },
          { lines: ['Hiss.'], at: 2.5, out: 3.1, className: 'left-5 top-[40%] md:left-10' },
          { lines: ['Built for', 'the journey.'], at: 4.2, className: 'inset-x-5 bottom-[10%] text-center md:inset-x-10' },
        ]}
        extras={() => <TypePlane kind="text" lines={['GO', 'ANYWHERE']} width={M ? 5 : 9} aspect={1.6} position={[0, 0.2, -2.4]} color="#ff4b40" />}
        fallback={<img src="/images/lineup.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <SizeLineup
        heading="Pick a size"
        intro="Four bottles, true to their relative proportions. Pick one to bring it forward."
        bg="#140002"
        colors={{ core: '#7a0a14', edge: '#140002', floor: '#0a0001' }}
        gap={1.0}
        camZ={10.5}
        camY={1.6}
        items={[
          { kind: 'pet', label: '500 ml', sx: 1, sy: 1, dims: 'About 23 cm tall, 6.6 cm wide', note: 'The one that fits a cup holder, a backpack pocket and a lunch break.' },
          { kind: 'pet', label: '1 L', sx: 1.2, sy: 1.26, dims: 'About 29 cm tall, 8 cm wide', note: 'For two, or for one very long afternoon.' },
          { kind: 'pet', label: '1.5 L', sx: 1.36, sy: 1.39, dims: 'About 32 cm tall, 9 cm wide', note: 'Dinner-table size. Pour, cap, come back later.' },
          { kind: 'pet', label: '2 L', sx: 1.58, sy: 1.48, dims: 'About 34 cm tall, 10.5 cm wide', note: 'Party size. Bring ice.' },
        ]}
      />
      <FeelingBanner img="/images/lineup.jpg" alt="Coca-Cola cans and bottles lined up from smallest to largest" title={['Take it', 'anywhere.']} body="Twist it shut, throw it in your bag and open it again when the moment arrives." />
      <NextVariety current="plastic-bottle" />
    </>
  )
}
