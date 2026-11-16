import * as THREE from 'three'

/*
  Procedural geometry kernel.
  Every product is a surface of revolution built from a 2D profile [radius, height],
  with an optional angular modulation so we can carve the PET petaloid feet,
  the contour-bottle flutes, cap knurling and crown crimps into real vertices.
  Units: 1 unit ≈ 10 cm.
*/

const cache = new Map()
export function memo(key, build) {
  if (!cache.has(key)) cache.set(key, build())
  return cache.get(key)
}

/** Smooth a list of control points into a dense profile (centripetal Catmull–Rom). */
export function smooth(points, divisions = 64) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([r, y]) => new THREE.Vector3(r, y, 0)),
    false,
    'centripetal',
  )
  return curve.getPoints(divisions).map((p) => [Math.max(0, p.x), p.y])
}

/**
 * Build a revolved BufferGeometry.
 * @param {Array<[number,number]>} profile – bottom to top
 * @param {object} o
 *   segments – radial segments
 *   mod(theta, y, r) → radius offset (absolute units)
 *   arc – unwrap UVs by arc-length (true) or by height (false)
 */
export function revolve(profile, { segments = 96, mod = null, uvByHeight = false } = {}) {
  const rows = profile.length
  const cols = segments + 1
  const pos = new Float32Array(rows * cols * 3)
  const uv = new Float32Array(rows * cols * 2)

  // arc-length param for V
  const lengths = [0]
  for (let i = 1; i < rows; i++) {
    const [r0, y0] = profile[i - 1]
    const [r1, y1] = profile[i]
    lengths.push(lengths[i - 1] + Math.hypot(r1 - r0, y1 - y0))
  }
  const total = lengths[rows - 1] || 1
  const yMin = profile[0][1]
  const yMax = profile[rows - 1][1]

  for (let i = 0; i < rows; i++) {
    const [r, y] = profile[i]
    for (let j = 0; j < cols; j++) {
      const u = j / segments
      const theta = u * Math.PI * 2
      const rr = Math.max(0, r + (mod && r > 0.0001 ? mod(theta, y, r) : 0))
      const k = (i * cols + j) * 3
      // theta 0 faces +Z so texture seam sits at the back
      pos[k] = Math.sin(theta) * rr
      pos[k + 1] = y
      pos[k + 2] = Math.cos(theta) * rr
      const t = (i * cols + j) * 2
      uv[t] = u
      uv[t + 1] = uvByHeight ? (y - yMin) / (yMax - yMin || 1) : lengths[i] / total
    }
  }

  const index = []
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < segments; j++) {
      const a = i * cols + j
      const b = a + cols
      index.push(a, a + 1, b, b, a + 1, b + 1)
    }
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  g.setIndex(index)
  g.computeVertexNormals()

  // weld the UV seam normals so there is no visible crease
  const n = g.attributes.normal
  for (let i = 0; i < rows; i++) {
    const a = i * cols
    const b = a + segments
    const x = (n.getX(a) + n.getX(b)) / 2
    const y = (n.getY(a) + n.getY(b)) / 2
    const z = (n.getZ(a) + n.getZ(b)) / 2
    const l = Math.hypot(x, y, z) || 1
    n.setXYZ(a, x / l, y / l, z / l)
    n.setXYZ(b, x / l, y / l, z / l)
  }
  g.computeBoundingSphere()
  return g
}

/** Sample the radius of a profile at height y (linear). */
export function radiusAt(profile, y) {
  for (let i = 1; i < profile.length; i++) {
    const [r0, y0] = profile[i - 1]
    const [r1, y1] = profile[i]
    if ((y >= y0 && y <= y1) || (y <= y0 && y >= y1)) {
      const t = (y - y0) / (y1 - y0 || 1)
      return r0 + (r1 - r0) * t
    }
  }
  return 0
}

/** Inset a profile (for liquids / inner walls), clipped at a fill height and closed with a meniscus. */
export function insetProfile(profile, inset, fillY, bottomLift = 0.02) {
  const out = []
  for (const [r, y] of profile) {
    if (y < bottomLift) continue
    if (y > fillY) break
    out.push([Math.max(0, r - inset), y])
  }
  const rTop = Math.max(0, radiusAt(profile, fillY) - inset)
  out.unshift([0, bottomLift])
  out.push([rTop, fillY])
  // slight meniscus curve to the centre
  out.push([rTop * 0.92, fillY - 0.004])
  out.push([0, fillY - 0.006])
  return out
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
export { smoothstep }
