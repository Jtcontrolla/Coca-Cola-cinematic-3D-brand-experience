import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { QUALITY } from './quality'

gsap.registerPlugin(ScrollTrigger, useGSAP)
gsap.defaults({ ease: 'power3.out' })

let lenis = null

/** One Lenis instance, driven by GSAP's ticker so ScrollTrigger and smooth scroll share a clock. */
export function startLenis() {
  if (lenis || QUALITY.reduced) return lenis
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.4,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis && lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export const getLenis = () => lenis

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
  else window.scrollTo(0, 0)
}

export function scrollToEl(target, offset = 0) {
  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.6 })
  else el.scrollIntoView({ behavior: QUALITY.reduced ? 'auto' : 'smooth' })
}

export function lockScroll(lock) {
  if (lenis) lock ? lenis.stop() : lenis.start()
  document.documentElement.style.overflow = lock ? 'hidden' : ''
}

/** Split a string into masked lines → words → chars for GSAP. Returns JSX-ready parts. */
export function splitWords(str) {
  return str.split(' ').filter(Boolean)
}

export { gsap, ScrollTrigger, useGSAP }
