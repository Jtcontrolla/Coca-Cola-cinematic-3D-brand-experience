import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, ChevronDown } from 'lucide-react'
import Logo from './Logo'
import VarietiesMenu from './VarietiesMenu'
import { getLenis, lockScroll } from '../lib/scroll'

/** Text roll: two stacked copies; the second slides in on hover/focus */
function Roll({ children }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-[var(--ease-film)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">{children}</span>
      <span className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-film)] group-hover:translate-y-0 group-focus-visible:translate-y-0" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/our-story', label: 'Our Story' },
]

export default function Nav() {
  const [menu, setMenu] = useState(false) // varieties overlay
  const [mobile, setMobile] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)
  const [dark, setDark] = useState(false) // dark ink over light sections
  const location = useLocation()

  // read the section under the bar: any ancestor with data-nav="dark" flips the ink
  const sampleTheme = () => {
    const els = document.elementsFromPoint(window.innerWidth / 2, 38)
    const hit = els.find((el) => !el.closest('header'))
    setDark(!!hit?.closest('[data-nav="dark"]'))
  }

  // close overlays on navigation
  useEffect(() => {
    setMenu(false)
    setMobile(false)
    const ids = [300, 900, 1600].map((t) => setTimeout(sampleTheme, t))
    return () => ids.forEach(clearTimeout)
  }, [location.pathname])

  useEffect(() => {
    lockScroll(menu || mobile)
  }, [menu, mobile])

  // hide on scroll down, reveal on scroll up
  useEffect(() => {
    let last = 0
    const on = () => {
      const y = getLenis()?.scroll ?? window.scrollY
      setSolid(y > 40)
      setHidden(y > 300 && y > last + 2)
      if (y < last - 2) setHidden(false)
      last = y
      sampleTheme()
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenu(false)
        setMobile(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const linkCls = ({ isActive }) =>
    `group relative py-2 text-[15px] font-medium tracking-tight ${isActive ? 'after:absolute after:-bottom-0.5 after:left-0 after:h-[2px] after:w-full after:bg-current' : ''}`

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] ${dark && !menu && !mobile ? 'text-ink' : 'text-paper'} transition-[transform,background-color,color] duration-500 ease-[var(--ease-film)] ${hidden && !menu && !mobile ? '-translate-y-full' : 'translate-y-0'} ${solid && !menu && !mobile ? (dark ? 'bg-paper/70 backdrop-blur-md' : 'bg-ink/70 backdrop-blur-md') : 'bg-transparent'}`}
      >
        <nav className="mx-auto flex h-[var(--nav-h)] max-w-[1600px] items-center justify-between px-5 md:px-10" aria-label="Main">
          <Link to="/" className="relative z-[2] block w-[118px] md:w-[150px]" aria-label="Coca-Cola home">
            <Logo className="h-auto w-full" />
          </Link>

          <ul className="hidden items-center gap-9 md:flex">
            <li>
              <NavLink to="/" end className={linkCls}>
                <Roll>Home</Roll>
              </NavLink>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setMenu((m) => !m)}
                aria-expanded={menu}
                aria-controls="varieties-menu"
                className={`group flex cursor-pointer items-center gap-1.5 py-2 text-[15px] font-medium tracking-tight ${location.pathname.startsWith('/varieties') ? 'underline decoration-2 underline-offset-[9px]' : ''}`}
              >
                <Roll>Varieties</Roll>
                <ChevronDown size={16} className={`transition-transform duration-500 ${menu ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
            </li>
            {LINKS.slice(1).map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkCls}>
                  <Roll>{l.label}</Roll>
                </NavLink>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="relative z-[2] flex h-11 w-11 cursor-pointer items-center justify-center md:hidden"
            onClick={() => setMobile((m) => !m)}
            aria-expanded={mobile}
            aria-controls="mobile-menu"
            aria-label={mobile ? 'Close menu' : 'Open menu'}
          >
            {mobile ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>
      </header>

      <AnimatePresence>{menu && <VarietiesMenu onClose={() => setMenu(false)} />}</AnimatePresence>

      <AnimatePresence>
        {mobile && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-[79] flex flex-col bg-coke px-5 pb-8 pt-[calc(var(--nav-h)+16px)] text-paper"
            initial={{ clipPath: 'circle(0% at 100% 0%)' }}
            animate={{ clipPath: 'circle(150% at 100% 0%)' }}
            exit={{ clipPath: 'circle(0% at 100% 0%)' }}
            transition={{ duration: 0.7, ease: [0.77, 0, 0.18, 1] }}
          >
            <ul className="flex flex-col gap-1">
              {[
                { to: '/', label: 'Home' },
                { to: '/varieties', label: 'Varieties' },
                { to: '/campaigns', label: 'Campaigns' },
                { to: '/our-story', label: 'Our Story' },
              ].map((l, i) => (
                <motion.li key={l.to} initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                  <Link to={l.to} className="display block py-1 text-[19vw] leading-[0.9]">
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <p className="mt-auto max-w-[30ch] text-sm text-paper/80">An interactive campaign for the bottles and cans you already know by heart.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
