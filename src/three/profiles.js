import { smooth, revolve, memo, smoothstep } from './geometry'

/* ------------------------------------------------------------------ */
/*  PET BOTTLE – scaled per size. Base geometry ≈ 500 ml (23 cm tall)  */
/* ------------------------------------------------------------------ */
export const PET = {
  labelBottom: 1.06, // the wrap label sits in the upper-middle of the body, as on real 500 ml bottles
  labelTop: 1.5,
  bodyR: 0.33,
  neckY: 2.06,
  topY: 2.24,
}

export function petProfile() {
  return memo('pet-profile-v2', () => {
    const body = smooth(
      [
        [0.0, 0.04],
        [0.1, 0.035],
        [0.2, 0.0], // feet touch down
        [0.285, 0.03],
        [0.322, 0.1],
        [0.332, 0.22], // lower bulge above the petaloid base
        [0.33, 0.38],
        [0.312, 0.52],
        [0.302, 0.62], // the waist
        [0.31, 0.74],
        [0.326, 0.86],
        [0.332, 0.98],
        [0.332, 1.06],
        [0.332, 1.5], // straight label band
        [0.328, 1.57],
        [0.31, 1.66],
        [0.272, 1.76],
        [0.22, 1.85], // domed shoulder
        [0.168, 1.93],
        [0.135, 1.99],
        [0.126, 2.04],
      ],
      150,
    )
    // finish: support ledge, threads region, top lip (kept crisp)
    const finish = [
      [0.125, 2.05],
      [0.158, 2.055],
      [0.16, 2.07],
      [0.13, 2.075],
      [0.127, 2.1],
      [0.127, 2.235],
      [0.118, 2.24],
      [0.11, 2.235],
    ]
    return [...body, ...finish]
  })
}

/** Petaloid feet + grip rings carved into the PET surface */
const petMod = (theta, y) => {
  let d = 0
  // five petaloid feet at the base
  if (y < 0.2) {
    const k = 1 - smoothstep(0.02, 0.2, y)
    const lobes = Math.pow(0.5 + 0.5 * Math.cos(theta * 5), 1.6)
    d -= 0.055 * k * (1 - lobes)
  }
  // shallow horizontal grip rings through the waist
  if (y > 0.44 && y < 0.92) {
    const w = smoothstep(0.44, 0.52, y) * (1 - smoothstep(0.84, 0.92, y))
    d -= 0.005 * w * Math.pow(Math.sin((y - 0.44) * 52), 10)
  }
  // soft vertical panels on the lower bulge
  if (y > 0.12 && y < 0.42) {
    const w = smoothstep(0.12, 0.2, y) * (1 - smoothstep(0.34, 0.42, y))
    d -= 0.006 * w * Math.pow(Math.abs(Math.cos(theta * 5)), 8)
  }
  return d
}

export function petGeometry(segments = 112) {
  return memo('pet-geo-' + segments, () => revolve(petProfile(), { segments, mod: petMod }))
}

/* ------------------------------------------------------------------ */
/*  CONTOUR GLASS BOTTLE ≈ 8 oz / 237 ml (19.5 cm)                     */
/* ------------------------------------------------------------------ */
export const GLASS = { labelBottom: 0.72, labelTop: 1.02, topY: 1.98 }

export function glassProfile() {
  return memo('glass-profile-v2', () => {
    const body = smooth(
      [
        [0.0, 0.03],
        [0.18, 0.02],
        [0.27, 0.0],
        [0.3, 0.04],
        [0.312, 0.14],
        [0.33, 0.33],
        [0.334, 0.42], // lower bulge – the "hips"
        [0.322, 0.56],
        [0.294, 0.66],
        [0.287, 0.71], // straight waist carrying the red wrap label
        [0.287, 1.03],
        [0.298, 1.1],
        [0.302, 1.14], // upper bulge
        [0.292, 1.24],
        [0.255, 1.38],
        [0.2, 1.54],
        [0.152, 1.7],
        [0.127, 1.82],
        [0.12, 1.9],
      ],
      150,
    )
    const lip = [
      [0.121, 1.92],
      [0.137, 1.935],
      [0.139, 1.955],
      [0.128, 1.965],
      [0.132, 1.975],
      [0.12, 1.98],
      [0.1, 1.978],
    ]
    return [...body, ...lip]
  })
}

/** The famous vertical flutes, above and below the waist print */
const glassMod = (theta, y) => {
  const lower = smoothstep(0.08, 0.2, y) * (1 - smoothstep(0.58, 0.7, y))
  const upper = smoothstep(1.08, 1.15, y) * (1 - smoothstep(1.48, 1.62, y))
  const w = Math.max(lower, upper)
  if (w <= 0) return 0
  const flute = Math.pow(Math.abs(Math.sin(theta * 8)), 0.35) // wide ridges, sharp grooves
  return -0.011 * w * (1 - flute)
}

export function glassGeometry(segments = 128) {
  return memo('glass-geo-' + segments, () => revolve(glassProfile(), { segments, mod: glassMod }))
}

/* ------------------------------------------------------------------ */
/*  ALUMINIUM CANS – parametric                                         */
/* ------------------------------------------------------------------ */
export const CAN_SPECS = {
  classic: { r: 0.33, h: 1.15, label: '330 ml', name: 'Classic Can' }, // 66 × 115 mm
  slim: { r: 0.29, h: 1.46, label: '330 ml', name: 'Slim Can' }, // 58 × 146 mm
  medium: { r: 0.33, h: 0.92, label: '250 ml', name: 'Medium Can' }, // 66 × 92 mm
  mini: { r: 0.265, h: 0.89, label: '150 ml', name: 'Mini Can' },
}

/** Returns profiles for bottom dome, open body wall range, and top neck + lid */
export function canParts({ r, h }) {
  const key = `can-${r}-${h}`
  return memo(key, () => {
    const neckR = r * 0.8
    const bodyBottom = 0.11
    const bodyTop = h - 0.12
    const bottom = smooth(
      [
        [0.0, 0.07],
        [r * 0.45, 0.055],
        [r * 0.68, 0.012],
        [r * 0.74, 0.0],
        [r * 0.8, 0.004],
        [r * 0.9, 0.035],
        [r * 0.985, 0.085],
        [r, bodyBottom],
      ],
      36,
    )
    const top = smooth(
      [
        [r, bodyTop],
        [r * 0.995, bodyTop + 0.02],
        [r * 0.93, h - 0.07],
        [neckR + 0.012, h - 0.028],
        [neckR + 0.012, h - 0.012],
      ],
      30,
    )
    const rim = [
      [neckR + 0.014, h - 0.006],
      [neckR + 0.012, h],
      [neckR + 0.004, h + 0.002],
      [neckR - 0.004, h - 0.004],
      [neckR - 0.01, h - 0.022], // countersink wall
      [neckR - 0.016, h - 0.026],
      [neckR - 0.024, h - 0.022],
      [neckR - 0.03, h - 0.018],
      [neckR * 0.5, h - 0.017],
      [0.03, h - 0.016],
      [0.0, h - 0.016],
    ]
    return {
      bottom: revolve(bottom, { segments: 96 }),
      top: revolve([...top, ...rim], { segments: 96 }),
      bodyBottom,
      bodyTop,
      neckR,
      lidY: h - 0.016,
    }
  })
}

/* ------------------------------------------------------------------ */
/*  CAPS                                                               */
/* ------------------------------------------------------------------ */
export function screwCapGeometry() {
  return memo('screw-cap', () => {
    const R = 0.15
    const prof = [
      [0.0, 0.0],
      [0.13, 0.0],
      [R - 0.006, 0.002],
      [R, 0.012],
      [R, 0.17],
      [R - 0.004, 0.18],
      [R - 0.016, 0.186],
      [0.0, 0.186],
    ]
    const knurl = (theta, y) => (y > 0.02 && y < 0.165 ? -0.004 * Math.pow(Math.abs(Math.sin(theta * 32)), 0.6) : 0)
    return revolve(prof, { segments: 192, mod: knurl })
  })
}

export function tamperRingGeometry() {
  return memo('tamper-ring', () =>
    revolve(
      [
        [0.13, 0.0],
        [0.152, 0.0],
        [0.153, 0.035],
        [0.13, 0.035],
        [0.13, 0.0],
      ],
      { segments: 96 },
    ),
  )
}

export function crownCapGeometry() {
  return memo('crown-cap', () => {
    const prof = smooth(
      [
        [0.158, 0.0],
        [0.156, 0.02],
        [0.148, 0.05],
        [0.14, 0.066],
        [0.12, 0.074],
        [0.0, 0.076],
      ],
      24,
    )
    // 21 crimps on the skirt, the industry standard
    const crimp = (theta, y) => (y < 0.06 ? 0.011 * Math.cos(theta * 21) * (1 - y / 0.06) : 0)
    return revolve(prof, { segments: 168, mod: crimp })
  })
}
