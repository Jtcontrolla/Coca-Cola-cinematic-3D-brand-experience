import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { VARIETIES } from '../lib/varieties'
import { SceneCanvas } from '../three/Stage'
import { ProductSwapScene } from '../three/ProductSwap'

const ease = [0.77, 0, 0.18, 1]

/** Full-screen varieties navigator: huge type list + a live 3D preview of the hovered product. */
export default function VarietiesMenu({ onClose }) {
  const [active, setActive] = useState(VARIETIES[0])

  return (
    <motion.div
      id="varieties-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Coca-Cola varieties"
      className="fixed inset-0 z-[85] grid grid-cols-1 bg-ink text-paper md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]"
      initial={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      exit={{ clipPath: 'inset(0% 0% 100% 0%)' }}
      transition={{ duration: 0.8, ease }}
      data-lenis-prevent
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-5 top-4 z-10 flex h-11 cursor-pointer items-center gap-2 rounded-full bg-ink px-4 text-sm text-paper ring-1 ring-paper/30 transition-colors hover:bg-paper hover:text-ink md:right-10"
      >
        <X size={18} aria-hidden="true" /> Close
      </button>

      <div className="flex min-h-0 flex-col justify-end overflow-y-auto px-5 pb-10 pt-[calc(var(--nav-h)+24px)] md:px-10 md:pb-14">
        <p className="mb-6 max-w-[38ch] text-sm text-paper/60">Pick a format. Each one opens its own short film.</p>
        <ul className="flex flex-col">
          {VARIETIES.map((v, i) => (
            <motion.li
              key={v.slug}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-paper/15 last:border-b"
            >
              <Link
                to={`/varieties/${v.slug}`}
                onMouseEnter={() => setActive(v)}
                onFocus={() => setActive(v)}
                className="group flex items-baseline justify-between gap-6 py-2.5 md:py-3"
              >
                <span
                  className={`display text-[clamp(2.2rem,min(4.6vw,7.4vh),4.6rem)] transition-[color,transform] duration-500 ease-[var(--ease-film)] ${active.slug === v.slug ? 'translate-x-3 text-coke' : 'text-paper'}`}
                >
                  {v.name}
                </span>
                <span className="hidden shrink-0 text-sm text-paper/55 transition-colors group-hover:text-paper lg:block">{v.line}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative hidden min-h-0 md:block">
        <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.2, 5.2], fov: 30 }}>
          <ProductSwapScene variety={active} />
        </SceneCanvas>
        <div className="pointer-events-none absolute inset-x-10 bottom-12">
          <motion.p key={active.slug} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-[34ch] text-lg leading-snug" style={{ color: active.ink }}>
            {active.detail}
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
