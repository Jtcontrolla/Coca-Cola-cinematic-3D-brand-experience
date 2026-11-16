import { Link } from 'react-router-dom'
import Logo from './Logo'
import { VARIETIES } from '../lib/varieties'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-coke text-paper">
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-24 md:px-10 md:pt-32">
        <Logo className="w-full max-w-[1400px] text-paper" />
        <div className="mt-16 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <p className="max-w-[36ch] text-lg leading-snug">Thanks for watching. Pick a bottle, pick a can, and make the next moment one worth sharing.</p>
          <nav aria-label="Varieties">
            <h2 className="mb-3 text-sm text-paper/70">Varieties</h2>
            <ul className="space-y-1.5">
              {VARIETIES.map((v) => (
                <li key={v.slug}>
                  <Link className="underline-offset-4 hover:underline" to={`/varieties/${v.slug}`}>
                    {v.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Explore">
            <h2 className="mb-3 text-sm text-paper/70">Explore</h2>
            <ul className="space-y-1.5">
              <li><Link className="underline-offset-4 hover:underline" to="/">Home</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/campaigns">Campaigns</Link></li>
              <li><Link className="underline-offset-4 hover:underline" to="/our-story">Our Story</Link></li>
            </ul>
          </nav>
        </div>
        <p className="mt-20 border-t border-paper/30 pt-6 text-xs text-paper/75">
          Concept campaign experience. Coca-Cola, the contour bottle and the Spencerian script are trademarks of The Coca-Cola Company. Not affiliated with or endorsed by The Coca-Cola Company.
        </p>
      </div>
    </footer>
  )
}
