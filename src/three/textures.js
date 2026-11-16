import * as THREE from 'three'
import { LOGO_PATH } from '../lib/logoPath'

/*
  All product artwork is painted at runtime onto canvases and used as texture maps:
  the wordmark is the real vector path, typography uses the site's Archivo face,
  and condensation is painted droplet-by-droplet so labels read "ice cold" up close.
*/

const FONT = "'Archivo Variable', 'Archivo', Impact, sans-serif"
const texCache = new Map()
let logoPath2D = null
let logoBox = null

export function logoMetrics() {
  if (logoBox) return logoBox
  // measure the real path bounds once, using an off-screen SVG
  try {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.style.cssText = 'position:absolute;width:240px;height:240px;left:-9999px;top:-9999px'
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    p.setAttribute('d', LOGO_PATH)
    svg.appendChild(p)
    document.body.appendChild(svg)
    const b = p.getBBox()
    document.body.removeChild(svg)
    logoBox = { x: b.x, y: b.y, w: b.width, h: b.height }
  } catch {
    logoBox = { x: 0, y: 5.6, w: 24, h: 12.6 }
  }
  return logoBox
}

/** Draw the wordmark centred at (cx, cy), fitted to `width` px, optionally rotated. */
export function drawLogo(ctx, cx, cy, width, color = '#fff', rotation = 0) {
  if (!logoPath2D) logoPath2D = new Path2D(LOGO_PATH)
  const b = logoMetrics()
  const s = width / b.w
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rotation)
  ctx.scale(s, s)
  ctx.translate(-(b.x + b.w / 2), -(b.y + b.h / 2))
  ctx.fillStyle = color
  ctx.fill(logoPath2D)
  ctx.restore()
}

function canvas(w, h) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function finish(c, { repeatX = false } = {}) {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeatX) t.wrapS = THREE.RepeatWrapping
  t.needsUpdate = true
  return t
}

function cached(key, make) {
  if (!texCache.has(key)) texCache.set(key, make())
  return texCache.get(key)
}

/* seeded random so artwork is identical every load */
function rng(seed = 1) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

/** The "Dynamic Ribbon" – a white swoosh band across the label */
function ribbon(ctx, w, h, y, amp, thick, color) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, y)
  ctx.bezierCurveTo(w * 0.3, y - amp, w * 0.55, y + amp * 1.2, w, y - amp * 0.2)
  ctx.lineTo(w, y - amp * 0.2 + thick)
  ctx.bezierCurveTo(w * 0.55, y + amp * 1.2 + thick * 0.4, w * 0.3, y - amp + thick * 1.6, 0, y + thick)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/** Paint condensation: soft dark rim + bright specular, like photographed droplets. */
export function paintCondensation(ctx, w, h, { count = 900, seed = 7, max = 14, alpha = 1 } = {}) {
  const rand = rng(seed)
  ctx.save()
  ctx.globalAlpha = alpha
  for (let i = 0; i < count; i++) {
    const x = rand() * w
    const y = rand() * h
    const r = 1.2 + Math.pow(rand(), 3) * max
    const sy = 1 + rand() * 0.35
    // body
    const g = ctx.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r)
    g.addColorStop(0, 'rgba(255,255,255,0.55)')
    g.addColorStop(0.45, 'rgba(255,255,255,0.08)')
    g.addColorStop(0.85, 'rgba(0,0,0,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * sy, 0, 0, Math.PI * 2)
    ctx.fill()
    // spec dot
    if (r > 3) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.beginPath()
      ctx.ellipse(x - r * 0.3, y - r * 0.35, r * 0.18, r * 0.14, -0.6, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function text(ctx, str, x, y, { size = 40, weight = 800, color = '#fff', align = 'center', stretch = 'normal', spacing = 0, rotate = 0 } = {}) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotate)
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.font = `${weight} ${size}px ${FONT}`
  try {
    ctx.fontStretch = stretch
    ctx.letterSpacing = `${spacing}px`
  } catch {
    /* older browsers */
  }
  ctx.fillText(str, 0, 0)
  ctx.restore()
}

/* ------------------------------------------------------------------ */
/*  Product label palettes                                             */
/* ------------------------------------------------------------------ */
export const FLAVOURS = {
  original: { bg: '#E8000D', logo: '#FFFFFF', ribbon: '#FFFFFF', sub: 'Original Taste', ink: '#FFFFFF', metal: '#E8000D' },
  zero: { bg: '#0A0A0A', logo: '#F40009', ribbon: '#F40009', sub: 'Zero Sugar', ink: '#FFFFFF', metal: '#111111' },
  light: { bg: '#C9CDD3', logo: '#E8000D', ribbon: '#1B1B1B', sub: 'Light Taste', ink: '#1B1B1B', metal: '#C9CDD3' },
  cherry: { bg: '#5C0F2E', logo: '#FFFFFF', ribbon: '#E21C5E', sub: 'Cherry', ink: '#FFFFFF', metal: '#5C0F2E' },
  vanilla: { bg: '#F2E6CF', logo: '#E8000D', ribbon: '#B98B4E', sub: 'Vanilla', ink: '#5A3A17', metal: '#F2E6CF' },
  lime: { bg: '#E8000D', logo: '#FFFFFF', ribbon: '#B8E04A', sub: 'Lime', ink: '#FFFFFF', metal: '#E8000D' },
}

/**
 * The vertical "dynamic ribbon" seen on cans: a white wave that runs top to
 * bottom beside the wordmark, hair-thin at the top and swelling towards the base.
 */
function verticalRibbon(ctx, x, H, color, W) {
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  const steps = 40
  const left = []
  const right = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const y = t * H
    const sway = Math.sin(t * Math.PI * 1.1 + 0.4) * W * 0.012
    const width = W * (0.003 + 0.022 * Math.pow(t, 1.6))
    left.push([x + sway, y])
    right.push([x + sway + width, y])
  }
  ctx.moveTo(left[0][0], left[0][1])
  left.forEach(([px, py]) => ctx.lineTo(px, py))
  right.reverse().forEach(([px, py]) => ctx.lineTo(px, py))
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

/**
 * Wrap-around can label. Canvas aspect follows the real circumference : height ratio
 * so the wordmark is not stretched on the cylinder. u = 0 faces the camera.
 * Matches the real cans: the script runs vertically (reading bottom to top) on the
 * front, the white ribbon runs down the right-hand side.
 */
export function canLabel({ flavour = 'original', r = 0.33, h = 0.95, volume = '330 ml', wet = true }) {
  const key = `can2-${flavour}-${r}-${h}-${volume}-${wet}`
  return cached(key, () => {
    const f = FLAVOURS[flavour]
    const W = 2048
    const H = Math.round((W * h) / (Math.PI * 2 * r))
    const c = canvas(W, H)
    const ctx = c.getContext('2d')
    ctx.fillStyle = f.bg
    ctx.fillRect(0, 0, W, H)
    // soft vertical shading baked in (deeper at the rims)
    const sheen = ctx.createLinearGradient(0, 0, 0, H)
    sheen.addColorStop(0, 'rgba(0,0,0,0.16)')
    sheen.addColorStop(0.08, 'rgba(255,255,255,0.04)')
    sheen.addColorStop(0.92, 'rgba(255,255,255,0)')
    sheen.addColorStop(1, 'rgba(0,0,0,0.2)')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, W, H)

    // the wordmark fills ~88% of the height and is centred on the front (u = 0, wraps to W)
    const logoLen = H * 0.88
    const front = (fx) => {
      drawLogo(ctx, fx, H * 0.5, logoLen, f.logo, -Math.PI / 2)
      // small vertical legal line to the right of the script
      text(ctx, f.sub.toUpperCase(), fx + logoLen * 0.3, H * 0.4, {
        size: H * 0.026,
        color: f.ink,
        rotate: -Math.PI / 2,
        spacing: 3,
        weight: 600,
      })
    }
    front(0)
    front(W)
    // ribbon on the right-hand side of the front face (~50° round the can)
    verticalRibbon(ctx, W * 0.135, H, f.ribbon, W)
    // back of the can: a second script, smaller
    drawLogo(ctx, W * 0.5, H * 0.5, H * 0.62, f.logo, -Math.PI / 2)
    // side panel: volume + nutrition-style badge
    text(ctx, volume.toUpperCase(), W * 0.3, H * 0.88, { size: H * 0.034, color: f.ink, weight: 700, spacing: 3, rotate: -Math.PI / 2 })
    if (wet) paintCondensation(ctx, W, H, { count: Math.round(W * H * 0.0008), max: 12, seed: 11 })
    return finish(c, { repeatX: true })
  })
}

/** PET wrap label: plain red band, large horizontal script, "Original Taste" and the volume. */
export function bottleLabel({ flavour = 'original', r = 0.335, h = 0.44, volume = '500 ml' } = {}) {
  const key = `bottle2-${flavour}-${r}-${h}-${volume}`
  return cached(key, () => {
    const f = FLAVOURS[flavour]
    const W = 2048
    const H = Math.round((W * h) / (Math.PI * 2 * r))
    const c = canvas(W, H)
    const ctx = c.getContext('2d')
    ctx.fillStyle = f.bg
    ctx.fillRect(0, 0, W, H)
    // the front lockup spans most of the visible half of the bottle
    const lock = (x) => {
      drawLogo(ctx, x, H * 0.43, W * 0.31, f.logo, -0.05)
      text(ctx, f.sub.toUpperCase(), x, H * 0.8, { size: H * 0.085, color: f.ink, spacing: 5, weight: 700 })
    }
    lock(0)
    lock(W)
    text(ctx, volume.toUpperCase().replace(' ', ''), W * 0.84, H * 0.8, { size: H * 0.12, color: f.ink, weight: 800 })
    text(ctx, 'SINCE 1886', W * 0.17, H * 0.8, { size: H * 0.06, color: f.ink, weight: 700, spacing: 3 })
    drawLogo(ctx, W * 0.5, H * 0.45, W * 0.2, f.logo, -0.05)
    paintCondensation(ctx, W, H, { count: 1100, max: 10, seed: 3, alpha: 0.85 })
    return finish(c, { repeatX: true })
  })
}

/** Red wrap label for the contour glass bottle (the modern glass bottle wears a paper band). */
export function glassLabel({ r = 0.291, h = 0.3 } = {}) {
  return cached('glass-label-' + r + h, () => {
    const W = 2048
    const H = Math.round((W * h) / (Math.PI * 2 * r)) // true circumference : height ratio
    const c = canvas(W, H)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#E8000D'
    ctx.fillRect(0, 0, W, H)
    const lock = (x, w) => drawLogo(ctx, x, H * 0.47, w, '#ffffff', -0.05)
    lock(0, W * 0.3)
    lock(W, W * 0.3)
    lock(W * 0.5, W * 0.22)
    paintCondensation(ctx, W, H, { count: 700, max: 11, seed: 5, alpha: 0.9 })
    return finish(c, { repeatX: true })
  })
}

/** Cap tops (screw cap & crown) */
export function capTop(color = '#E8000D', logo = '#FFFFFF') {
  return cached('cap-' + color + logo, () => {
    const S = 512
    const c = canvas(S, S)
    const ctx = c.getContext('2d')
    ctx.fillStyle = color
    ctx.fillRect(0, 0, S, S)
    const g = ctx.createRadialGradient(S * 0.4, S * 0.35, 10, S / 2, S / 2, S / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.25)')
    g.addColorStop(1, 'rgba(0,0,0,0.15)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, S, S)
    drawLogo(ctx, S / 2, S / 2, S * 0.78, logo, -0.12)
    return finish(c)
  })
}

/* ------------------------------------------------------------------ */
/*  Campaign artwork for billboards                                    */
/* ------------------------------------------------------------------ */
export function poster(kind, W = 2048, H = 1024) {
  return cached(`poster-${kind}-${W}x${H}`, () => {
    const c = canvas(W, H)
    const ctx = c.getContext('2d')
    // headline that shrinks to fit 90% of the poster width (tall and wide boards share artwork)
    const big = (str, x, y, size, color, align = 'left') => {
      ctx.save()
      ctx.font = `900 ${size}px ${FONT}`
      try {
        ctx.fontStretch = 'extra-condensed'
      } catch {
        /* noop */
      }
      const w = ctx.measureText(str).width
      ctx.restore()
      const fit = Math.min(size, size * ((W * 0.9) / (w || 1)))
      text(ctx, str, x, y, { size: fit, color, align, weight: 900, stretch: 'extra-condensed', spacing: -2 })
    }

    if (kind === 'feeling') {
      ctx.fillStyle = '#F40009'
      ctx.fillRect(0, 0, W, H)
      ribbon(ctx, W, H, H * 0.62, H * 0.16, H * 0.06, '#fff')
      big('TASTE THE', W * 0.05, H * 0.22, H * 0.26, '#fff')
      big('FEELING.', W * 0.05, H * 0.46, H * 0.26, '#fff')
      drawLogo(ctx, W * 0.78, H * 0.82, W * 0.3, '#fff', -0.06)
    } else if (kind === 'magic') {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      const g = ctx.createRadialGradient(W * 0.7, H * 0.5, 10, W * 0.7, H * 0.5, H)
      g.addColorStop(0, '#B3000C')
      g.addColorStop(1, '#000')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      big('REAL', W * 0.06, H * 0.3, H * 0.34, '#fff')
      big('MAGIC.', W * 0.06, H * 0.64, H * 0.34, '#F40009')
      drawLogo(ctx, W * 0.74, H * 0.5, W * 0.4, '#fff', -0.06)
    } else if (kind === 'share') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, W, H)
      big('A MOMENT', W * 0.5, H * 0.3, H * 0.28, '#F40009', 'center')
      big('WORTH SHARING.', W * 0.5, H * 0.58, H * 0.28, '#000', 'center')
      drawLogo(ctx, W * 0.5, H * 0.84, W * 0.2, '#F40009', -0.05)
    } else if (kind === 'zero') {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)
      ribbon(ctx, W, H, H * 0.7, H * 0.1, H * 0.04, '#F40009')
      big('ZERO SUGAR.', W * 0.05, H * 0.3, H * 0.3, '#fff')
      big('ALL TASTE.', W * 0.05, H * 0.58, H * 0.3, '#F40009')
    } else if (kind === 'refresh') {
      const g = ctx.createLinearGradient(0, 0, W, H)
      g.addColorStop(0, '#F40009')
      g.addColorStop(1, '#7A0A14')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
      paintCondensation(ctx, W, H, { count: 1400, max: 18, seed: 21, alpha: 0.6 })
      big('REFRESH', W * 0.95, H * 0.36, H * 0.3, '#fff', 'right')
      big('YOUR WORLD.', W * 0.95, H * 0.66, H * 0.3, '#fff', 'right')
      drawLogo(ctx, W * 0.22, H * 0.5, W * 0.3, '#fff', -0.08)
    } else if (kind === 'logo') {
      ctx.fillStyle = '#F40009'
      ctx.fillRect(0, 0, W, H)
      drawLogo(ctx, W / 2, H / 2, W * 0.78, '#fff', -0.05)
    }
    return finish(c)
  })
}

/** Lit-window facade texture for the city buildings */
export function facade(seed = 1) {
  return cached('facade-' + seed, () => {
    const W = 256
    const H = 512
    const c = canvas(W, H)
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#07070a'
    ctx.fillRect(0, 0, W, H)
    const rand = rng(seed)
    for (let y = 8; y < H; y += 18) {
      for (let x = 8; x < W; x += 16) {
        const on = rand()
        if (on > 0.62) {
          ctx.fillStyle = on > 0.93 ? 'rgba(255,90,80,0.9)' : `rgba(255,${200 + Math.floor(rand() * 40)},${150 + Math.floor(rand() * 60)},${0.35 + rand() * 0.5})`
          ctx.fillRect(x, y, 9, 11)
        }
      }
    }
    const t = finish(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    return t
  })
}
