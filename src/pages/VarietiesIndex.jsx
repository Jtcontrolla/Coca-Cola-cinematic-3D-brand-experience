import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { VARIETIES } from '../lib/varieties'
import { SceneCanvas } from '../three/Stage'
import { ProductSwapScene } from '../three/ProductSwap'

/**
 * /varieties – the deep-linkable version of the varieties menu.
 * On phones the live preview sits on top and follows the item you tap or focus.
 */
export default function VarietiesIndex() {
  const [active, setActive] = useState(VARIETIES[0])
  return (
    <section className="relative min-h-[100svh] bg-ink text-paper" aria-labelledby="vi-title">
      <div className="grid md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <div className="sticky top-0 order-1 h-[44svh] md:order-2 md:h-[100svh]">
          <SceneCanvas className="absolute inset-0" camera={{ position: [0, 0.2, 5.2], fov: 30 }}>
            <ProductSwapScene variety={active} camZ={5.4} />
          </SceneCanvas>
        </div>
        <div className="order-2 px-5 pb-24 pt-10 md:order-1 md:px-10 md:pt-[calc(var(--nav-h)+48px)]">
          <h1 id="vi-title" className="display text-[clamp(3.6rem,9vw,9rem)]">
            Varieties
          </h1>
          <p className="mt-3 max-w-[40ch] text-paper/70">Seven formats, seven short films. Pick one to watch it.</p>
          <ul className="mt-10">
            {VARIETIES.map((v, i) => (
              <motion.li key={v.slug} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.06, duration: 0.7 }} className="border-t border-paper/15 last:border-b">
                <Link to={`/varieties/${v.slug}`} onMouseEnter={() => setActive(v)} onFocus={() => setActive(v)} onTouchStart={() => setActive(v)} className="group block py-4">
                  <span className={`display block text-[clamp(2.2rem,5vw,4.8rem)] transition-colors duration-500 ${active.slug === v.slug ? 'text-coke' : ''}`}>{v.name}</span>
                  <span className="mt-1 block text-paper/60">{v.line}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
