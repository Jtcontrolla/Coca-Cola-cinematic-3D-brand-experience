import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import { VARIETIES } from '../lib/varieties'

/** Closing beat: a typographic index of every film; hovering a name tints the whole section. */
export default function Closing({ title = 'Choose your moment.' }) {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.from('.cl-row', { yPercent: 100, opacity: 0, stagger: 0.06, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 65%' } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="group/cl relative bg-ink px-5 py-28 text-paper md:px-10 md:py-40" aria-labelledby="closing-title">
      <div className="mx-auto max-w-[1600px]">
        <h2 id="closing-title" className="mb-12 max-w-[20ch] text-3xl font-semibold leading-tight md:text-4xl">
          {title}
        </h2>
        <ul>
          {VARIETIES.map((v) => (
            <li key={v.slug} className="overflow-hidden border-t border-paper/15 last:border-b">
              <Link to={`/varieties/${v.slug}`} className="cl-row group flex items-center justify-between gap-4 py-3 md:py-4">
                <span className="display text-[clamp(2.6rem,7.5vw,8rem)] text-paper/35 transition-colors duration-500 group-hover:text-coke group-focus-visible:text-coke">{v.name}</span>
                <ArrowUpRight className="shrink-0 -translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100" size={44} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
