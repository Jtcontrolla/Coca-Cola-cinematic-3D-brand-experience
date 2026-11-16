import { useEffect, useState } from 'react'

const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

/** Device tier, computed once at boot. Mobile gets cheaper materials & fewer instances. */
export const QUALITY = (() => {
  // phones: narrow screens, or touch-first devices that are also small (touch laptops stay desktop)
  const mobile = mq('(max-width: 767px)') || (mq('(pointer: coarse)') && mq('(max-width: 1024px)') && !mq('(hover: hover)'))
  const tablet = !mobile && mq('(max-width: 1100px)')
  const cores = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) || 4
  const low = mobile || cores <= 4
  return {
    mobile,
    tablet,
    low,
    reduced: mq('(prefers-reduced-motion: reduce)'),
    transmission: !mobile, // physical transmission costs an extra pass
    droplets: mobile ? 70 : low ? 160 : 260,
    dpr: mobile ? [1, 1.5] : [1, 2],
  }
})()

export function useMedia(query) {
  const [match, setMatch] = useState(() => mq(query))
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

export const useIsMobile = () => useMedia('(max-width: 767px)')
export const useReducedMotion = () => useMedia('(prefers-reduced-motion: reduce)')
