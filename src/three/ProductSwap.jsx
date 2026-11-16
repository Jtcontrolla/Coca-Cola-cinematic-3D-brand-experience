import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Product, DISPLAY_SCALE } from './Products'
import { Rig, Backdrop, Studio, CameraRig } from './Stage'
import { QUALITY } from '../lib/quality'

/**
 * A spinning showcase that swaps products with a scale/whip transition.
 * Used by the varieties menu and the varieties index.
 */
export function ProductSwapScene({ variety, camZ = 5.2, scale = 1 }) {
  const state = useRef({ spin: 0.6, scale, rotY: 0, y: 0, camZ, camY: 0.2, lookY: 0, core: variety.core, edge: variety.edge, floor: variety.floor, glow: 1 })
  const [shown, setShown] = useState(variety)

  useEffect(() => {
    const s = state.current
    s.core = variety.core
    s.edge = variety.edge
    s.floor = variety.floor
    if (variety.slug === shown.slug) return
    const tl = gsap.timeline()
    tl.to(s, { scale: 0.001, rotY: s.rotY + Math.PI, duration: QUALITY.reduced ? 0 : 0.28, ease: 'power2.in' })
      .add(() => setShown(variety))
      .to(s, { scale, rotY: s.rotY + Math.PI * 2, duration: QUALITY.reduced ? 0 : 0.6, ease: 'back.out(1.6)' })
    return () => tl.kill()
  }, [variety, shown.slug, scale])

  return (
    <>
      <Backdrop state={state} />
      <CameraRig state={state} />
      <Studio accent={variety.core} shadowY={-1.2} state={state} />
      <Rig state={state}>
        <group scale={DISPLAY_SCALE[shown.kind] || 1}>
          <Product kind={shown.kind} flavour={shown.flavour || (shown.kind === 'zero' ? 'zero' : 'original')} droplets={!QUALITY.mobile} />
        </group>
      </Rig>
    </>
  )
}
