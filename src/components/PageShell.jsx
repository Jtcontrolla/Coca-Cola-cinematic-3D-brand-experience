import { useLayoutEffect, useEffect } from 'react'
import { motion } from 'framer-motion'
import Logo from './Logo'
import Footer from './Footer'
import { scrollToTop, ScrollTrigger } from '../lib/scroll'
import { QUALITY } from '../lib/quality'

const ease = [0.77, 0, 0.18, 1]

/**
 * Wraps every route: resets scroll, refreshes ScrollTrigger, and plays the
 * red "curtain" between pages so route changes read as one continuous film.
 */
export default function PageShell({ children, footer = true }) {
  useLayoutEffect(() => {
    scrollToTop()
  }, [])
  useEffect(() => {
    const id = setTimeout(() => ScrollTrigger.refresh(), 450)
    return () => clearTimeout(id)
  }, [])

  const dur = QUALITY.reduced ? 0.01 : 0.75
  return (
    <motion.div initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 1, transition: { duration: dur } }}>
      {children}
      {footer && <Footer />}
      {/* reveal: curtain lifts off the new page */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-coke"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: dur, ease, delay: 0.1 } }}
        exit={{ clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'], transition: { duration: dur, ease } }}
      >
        <Logo className="w-[min(46vw,420px)] text-paper" />
      </motion.div>
    </motion.div>
  )
}
