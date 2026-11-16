import ProductFilm from '../../sections/ProductFilm'
import AnatomyTour from '../../sections/AnatomyTour'
import NextVariety from '../../sections/NextVariety'
import { FeelingBanner } from '../../sections/Banners'
import Ice from '../../three/Ice'
import TypePlane from '../../three/TypePlane'
import { QUALITY } from '../../lib/quality'

const M = QUALITY.mobile

/*
  Signature: the opening. A full turn under the lights, the camera climbs
  over the lid, the pull tab lifts, the tongue drops and carbonation sprays
  out while the studio flashes hot.
*/
function build(tl, { s, r, M: m }) {
  tl.to(s, { rotY: Math.PI * 2, tiltZ: 0, tiltX: 0, spin: 0.1, duration: 1.4, ease: 'power2.inOut' }, 0.1)
    .to(s, { camZ: m ? 6.5 : 5, duration: 1.4 }, 0.1)
    // climb over the lid
    .to(s, { camZ: m ? 2.8 : 2.0, camY: 1.75, lookY: 0.5, rotY: '+=0.6', duration: 1, ease: 'power2.inOut' }, 1.5)
    // the tab lifts… pause… and the tongue gives
    .to(r, { tab: 0.35, duration: 0.4, ease: 'power2.out' }, 2.5)
    .to(r, { tab: 1, duration: 0.35, ease: 'power3.in' }, 3.0)
    .to(r, { fizz: 1, duration: 0.15 }, 3.3)
    .to(s, { core: '#ff7a3a', glow: 1.9, duration: 0.15 }, 3.3)
    .to(s, { core: '#ff2a1a', glow: 1, duration: 0.6 }, 3.5)
    .to(r, { fizz: 0.35, duration: 0.8 }, 3.9)
    // pull back to the hero shot
    .to(s, { camZ: m ? 7.2 : 5.8, camY: 0.25, lookY: 0.05, tiltZ: -0.18, rotY: '+=1.4', duration: 1.2, ease: 'power2.inOut' }, 4.3)
}

export default function ClassicCan() {
  return (
    <>
      <ProductFilm
        kind="classic"
        title={['The classic', 'can.']}
        intro="330 ml of ice-cold Coca-Cola in polished aluminium. Scroll to open it."
        bg="#F40009"
        initial={{
          spin: 0.4,
          tiltZ: 0.22,
          tiltX: 0.1,
          camZ: M ? 7.6 : 6.4,
          camY: 0.15,
          lookY: 0,
          scale: M ? 1.1 : 1.35,
          core: '#ff2a1a',
          edge: '#b3000c',
          floor: '#3b0006',
          reducedState: { tiltZ: -0.18 },
        }}
        build={build}
        length="+=400%"
        beats={[
          { lines: ['Ice cold,', 'all the way round.'], at: 0.5, out: 1.4, className: 'left-5 top-[18%] md:left-10' },
          { lines: ['Listen.'], at: 2.4, out: 3.0, className: 'right-5 top-[20%] text-right md:right-10' },
          { lines: ['Crack.'], at: 3.05, out: 3.6, className: 'left-5 top-[34%] md:left-10' },
          { lines: ['Pure', 'refreshment.'], at: 4.7, className: 'right-5 bottom-[10%] text-right md:right-10' },
        ]}
        extras={() => (
          <>
            <TypePlane kind="text" lines={['ICE', 'COLD']} width={M ? 5 : 8.5} aspect={1.35} position={[0, 0.1, -2.6]} color="#ff4a3a" />
            <Ice radius={1.0} y={-0.75} spread={0.3} size={0.3} count={8} />
          </>
        )}
        fallback={<img src="/images/can-splash.jpg" alt="" className="h-full w-full object-cover" />}
      />
      <AnatomyTour
        kind="classic"
        heading="Up close: the can"
        bg="#2a0004"
        colors={{ core: '#b3000c', edge: '#2a0004', floor: '#0a0001' }}
        stops={[
          { title: 'The whole can', body: 'Painted aluminium, 66 mm across, 115 mm tall. The script reads up the front of the can.', cam: { camZ: M ? 6.4 : 4.6, camY: 0.1, lookY: 0, camX: M ? 0 : -0.5 }, product: { rotY: 0, tiltX: 0 } },
          { title: 'The tab', body: 'One rivet, one lever. Lift the ring and the nose pushes the scored tongue down into the can.', cam: { camZ: M ? 1.9 : 1.3, camY: 1.35, lookY: 0.55, camX: M ? 0 : -0.15 }, product: { rotY: 0.3 }, rig: { tab: 1, fizz: 0.6 } },
          { title: 'The ribbon', body: 'The white wave that runs down the side, beside the script. A brand signature since 1969.', cam: { camZ: M ? 3.4 : 2.4, camY: -0.1, lookY: -0.1, camX: M ? 0 : -0.3 }, product: { rotY: -0.95 }, rig: { fizz: 0.1 } },
          { title: 'The dome', body: 'The domed base resists the pressure of the carbonation inside.', cam: { camZ: M ? 3 : 2.2, camY: -1.6, lookY: -0.4, camX: M ? 0 : -0.2 }, product: { rotY: 3.6 } },
        ]}
      />
      <FeelingBanner title={['Crack it', 'open.']} body="That half-second of hiss is the best sound in the fridge." />
      <NextVariety current="classic-can" />
    </>
  )
}
