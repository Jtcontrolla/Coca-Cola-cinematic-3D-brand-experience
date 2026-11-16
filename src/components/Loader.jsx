import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'
import { lockScroll } from '../lib/scroll'
import { QUALITY } from '../lib/quality'

/** Intro: a bottle-shaped fill rises behind the wordmark while fonts & scenes warm up. */
export default function Loader({ ready, onDone }) {
  const [pct, setPct] = useState(0)
  const start = useRef(performance.now())

  useEffect(() => {
    lockScroll(true)
    let raf
    const min = QUALITY.reduced ? 300 : 1700
    const tick = () => {
      const t = Math.min(1, (performance.now() - start.current) / min)
      const target = ready ? t : Math.min(t, 0.86)
      setPct((p) => Math.max(p, Math.round(target * 100)))
      if (ready && t >= 1) {
        lockScroll(false)
        onDone()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [ready, onDone])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-ink"
      exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.9, ease: [0.77, 0, 0.18, 1] } }}
      initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      role="status"
      aria-live="polite"
      aria-label={`Loading ${pct}%`}
    >
      {/* rising cola */}
      <div className="absolute inset-x-0 bottom-0 bg-coke transition-[height] duration-300 ease-out" style={{ height: `${pct}%` }}>
        <svg className="absolute -top-[18px] left-0 h-5 w-[200%] fill-coke" viewBox="0 0 200 10" preserveAspectRatio="none" style={{ animation: QUALITY.reduced ? 'none' : 'marquee 3s linear infinite' }}>
          <path d="M0 10 Q 12.5 0 25 5 T 50 5 T 75 5 T 100 5 T 125 5 T 150 5 T 175 5 T 200 5 V10 Z" />
        </svg>
      </div>
      <Logo className="relative w-[min(70vw,560px)] text-paper" />
      <div className="relative mt-10 flex w-[min(70vw,560px)] items-end justify-between text-paper">
        <span className="text-sm">Pouring an ice-cold one</span>
        <span className="display text-6xl tabular-nums">{pct}</span>
      </div>
    </motion.div>
  )
}
