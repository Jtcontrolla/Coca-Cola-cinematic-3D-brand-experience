import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { drawLogo } from './textures'

/**
 * In-scene typography / wordmark painted to a cut-out texture.
 * alphaTest (not transparency) keeps it in the opaque pass, so transmissive
 * PET and glass refract it: the script bends through the bottle.
 */
export default function TypePlane({ kind = 'logo', lines = [], color = '#ffffff', width = 8, aspect = 2.4, position = [0, 0, -2], opacity = 1, innerRef }) {
  const tex = useMemo(() => {
    const W = 2048
    const H = Math.round(W / aspect)
    const c = document.createElement('canvas')
    c.width = W
    c.height = H
    const ctx = c.getContext('2d')
    if (kind === 'logo') {
      drawLogo(ctx, W / 2, H / 2, W * 0.96, color, -0.04)
    } else {
      ctx.fillStyle = color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const size = H / (lines.length * 0.86)
      ctx.font = `900 ${size}px 'Archivo Variable', Impact, sans-serif`
      try {
        ctx.fontStretch = 'extra-condensed'
      } catch {
        /* noop */
      }
      lines.forEach((l, i) => ctx.fillText(l, W / 2, (H / lines.length) * (i + 0.53)))
    }
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    return t
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, lines.join('|'), color, aspect])
  useEffect(() => () => tex.dispose(), [tex])

  // keep the plane behind the contact-shadow volume (|z| ≤ 3) so it never casts onto the floor;
  // grow it to keep the same apparent size from a camera ~6 units away
  const z = Math.min(position[2], -3.6)
  const w = width * ((6.2 - z) / (6.2 - position[2]))
  return (
    <mesh ref={innerRef} position={[position[0], position[1], z]}>
      <planeGeometry args={[w, w / aspect]} />
      <meshBasicMaterial map={tex} alphaTest={0.5} toneMapped={false} opacity={opacity} />
    </mesh>
  )
}
