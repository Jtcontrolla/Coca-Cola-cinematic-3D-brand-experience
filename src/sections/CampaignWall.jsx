import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import Logo from '../components/Logo'

/*
  The Campaign Wall: a pinned, horizontally travelling editorial wall.
  Photographs sit beside typographic posters; sizes and baselines vary
  so it reads like a wall of pasted-up campaign work, not a grid of cards.
*/
const WALL = [
  { type: 'img', src: '/images/slim-red.jpg', alt: 'A slim Coca-Cola can floating against red', w: 'w-[64vw] md:w-[24vw]', ratio: 'aspect-[3/4]', y: 'md:mt-[6vh]', cap: 'The slim can' },
  { type: 'poster', tone: 'red', lines: ['Taste', 'the', 'feeling.'], w: 'w-[64vw] md:w-[24vw]', ratio: 'aspect-[3/4]', y: 'md:mt-[12vh]', cap: 'Taste the Feeling, launched 2016' },
  { type: 'img', src: '/images/caps.jpg', alt: 'A pile of red Coca-Cola crown caps', w: 'w-[84vw] md:w-[44vw]', ratio: 'aspect-[16/9]', y: 'md:mt-[2vh]', cap: 'Crown caps, freshly popped' },
  { type: 'poster', tone: 'black', lines: ['Zero', 'sugar.', 'All', 'taste.'], w: 'w-[64vw] md:w-[22vw]', ratio: 'aspect-[3/4]', y: 'md:mt-[16vh]', cap: 'Coca-Cola Zero Sugar' },
  { type: 'img', src: '/images/slim-studio.jpg', alt: 'A slim Coca-Cola can with its vertical script and white ribbon', w: 'w-[64vw] md:w-[24vw]', ratio: 'aspect-[3/4]', y: 'md:mt-[8vh]', cap: 'Studio white' },
  { type: 'poster', tone: 'white', lines: ['Open', 'happiness.'], w: 'w-[78vw] md:w-[36vw]', ratio: 'aspect-[4/3]', y: 'md:mt-[14vh]', cap: 'Open Happiness, launched 2009' },
  { type: 'img', src: '/images/pet-500.jpg', alt: 'A 500 ml bottle beaded with condensation', w: 'w-[64vw] md:w-[24vw]', ratio: 'aspect-[3/4]', y: 'md:mt-[4vh]', cap: 'Straight from the cooler' },
  { type: 'poster', tone: 'red-outline', lines: ['Real', 'magic.'], w: 'w-[64vw] md:w-[26vw]', ratio: 'aspect-square', y: 'md:mt-[10vh]', cap: 'Real Magic, launched 2021' },
  { type: 'img', src: '/images/can-ice.jpg', alt: 'A Coca-Cola can resting in crushed ice', w: 'w-[84vw] md:w-[40vw]', ratio: 'aspect-[16/10]', y: 'md:mt-[12vh]', cap: 'On ice' },
]

function Poster({ tone, lines }) {
  const t = {
    red: 'bg-coke text-paper',
    black: 'bg-ink text-paper ring-1 ring-paper/15',
    white: 'bg-paper text-coke',
    'red-outline': 'bg-burgundy text-coke',
  }[tone]
  return (
    <div className={`flex h-full w-full flex-col justify-between p-[6%] ${t}`}>
      <p className={`display text-[clamp(2.6rem,6.5vw,7rem)] ${tone === 'red-outline' ? 'outline-type' : ''}`}>
        {lines.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </p>
      <Logo className="w-1/3 self-end" />
    </div>
  )
}

export default function CampaignWall({ title = 'The campaign wall', intro = 'Every headline, every frame. Scroll sideways through the work.' }) {
  const root = useRef()
  useGSAP(
    () => {
      const track = root.current.querySelector('.wall-track')
      if (QUALITY.reduced) return
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth)
      const move = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${dist()}`, scrub: 1, pin: '.wall-pin', invalidateOnRefresh: true },
      })
      gsap.utils.toArray('.wall-item img').forEach((img) => {
        gsap.fromTo(img, { xPercent: -8, scale: 1.18 }, { xPercent: 8, scale: 1.18, ease: 'none', scrollTrigger: { trigger: img.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } })
      })
      gsap.utils.toArray('.wall-item').forEach((el) => {
        gsap.from(el, { rotate: gsap.utils.random(-5, 5), yPercent: 12, ease: 'power2.out', scrollTrigger: { trigger: el, containerAnimation: move, start: 'left 95%', end: 'left 55%', scrub: true } })
      })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative bg-ink" aria-labelledby="wall-title">
      <div className="wall-pin relative flex h-[100svh] flex-col overflow-hidden motion-reduce:h-auto">
        <div className="mx-auto w-full max-w-[1600px] px-5 pt-[calc(var(--nav-h)+20px)] md:px-10">
          <h2 id="wall-title" className="display text-[clamp(3rem,7vw,7.5rem)]">
            {title}
          </h2>
          <p className="mt-2 max-w-[44ch] text-paper/70">{intro}</p>
        </div>
        <ul className="wall-track flex w-max flex-1 items-start gap-6 px-5 pb-10 pt-8 md:gap-10 md:px-10 motion-reduce:w-full motion-reduce:flex-col">
          {WALL.map((it, i) => (
            <li key={i} className={`wall-item shrink-0 ${it.w} ${it.y}`}>
              <figure>
                <div className={`relative overflow-hidden ${it.ratio}`}>
                  {it.type === 'img' ? <img src={it.src} alt={it.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" /> : <Poster tone={it.tone} lines={it.lines} />}
                </div>
                <figcaption className="mt-3 text-sm text-paper/65">{it.cap}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
