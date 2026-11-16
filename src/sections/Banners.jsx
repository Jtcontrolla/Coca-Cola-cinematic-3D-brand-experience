import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../lib/scroll'
import { QUALITY } from '../lib/quality'
import Split from '../components/Split'
import Logo from '../components/Logo'

/* ------------------------------------------------------------------ */
/*  Banner A · "Taste the feeling." – red block + photograph + marquee */
/* ------------------------------------------------------------------ */
export function FeelingBanner({ img = '/images/can-splash.jpg', alt = 'A Coca-Cola can bursting through a splash of water and ice', title = ['Taste', 'the feeling.'], body = 'Ice, fizz and that first cold sip. Some feelings arrive before the taste.' }) {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      gsap.fromTo('.fb-img', { yPercent: -12, scale: 1.18 }, { yPercent: 12, scale: 1.05, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true } })
      gsap.from('.fb-title .split-char', { yPercent: 120, stagger: 0.02, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.from('.fb-copy', { autoAlpha: 0, y: 30, duration: 1, delay: 0.3, scrollTrigger: { trigger: root.current, start: 'top 70%' } })
      gsap.fromTo('.fb-clip', { clipPath: 'inset(18% 12% 18% 12%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative overflow-hidden bg-coke text-paper" aria-label={title.join(' ')}>
      <div className="grid min-h-[100svh] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative z-10 flex flex-col justify-between px-5 pb-12 pt-28 md:px-10 md:pb-16">
          <Logo className="w-28 text-paper/90" />
          <div>
            <h2 className="fb-title display text-[clamp(4rem,11vw,12rem)]">
              <Split lines={title} />
            </h2>
            <p className="fb-copy mt-6 max-w-[34ch] text-lg leading-snug md:text-xl">{body}</p>
          </div>
        </div>
        <div className="fb-clip relative min-h-[60svh] overflow-hidden md:min-h-0">
          <img src={img} alt={alt} loading="lazy" className="fb-img absolute inset-0 h-full w-full object-cover" />
        </div>
      </div>
      <div className="relative overflow-hidden border-t border-paper/25 py-5" aria-hidden="true">
        <div className="marquee-track flex w-max whitespace-nowrap">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className="display flex items-center gap-10 pr-10 text-[clamp(2.4rem,5vw,5rem)]">
              Taste the feeling <Logo className="h-[0.8em] w-auto" /> Open happiness <Logo className="h-[0.8em] w-auto" /> Refresh your world <Logo className="h-[0.8em] w-auto" /> Real magic
              <Logo className="h-[0.8em] w-auto" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Banner B · "The real magic is in the moment." – layered parallax   */
/* ------------------------------------------------------------------ */
export function MomentBanner({ img = '/images/pet-2l-dark.jpg', alt = 'A 2 litre Coca-Cola bottle beaded with condensation on black' }) {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true }
      gsap.fromTo('.mb-bg', { yPercent: -15, scale: 1.25 }, { yPercent: 15, scale: 1.1, ease: 'none', scrollTrigger: st })
      gsap.fromTo('.mb-ghost', { xPercent: 10 }, { xPercent: -35, ease: 'none', scrollTrigger: st })
      gsap.fromTo('.mb-words .split-word', { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: root.current, start: 'top 65%', end: 'center 45%', scrub: true } })
    },
    { scope: root },
  )
  return (
    <section ref={root} className="relative h-[120svh] overflow-hidden bg-ink text-paper" aria-labelledby="moment-title">
      <img src={img} alt={alt} loading="lazy" className="mb-bg absolute inset-0 h-full w-full object-cover opacity-80" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/60" />
      <p className="mb-ghost display outline-type pointer-events-none absolute top-[12%] whitespace-nowrap text-[30vw] text-coke/80" aria-hidden="true">
        In the moment
      </p>
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-[14vh] md:px-10">
        <h2 id="moment-title" className="mb-words display max-w-[14ch] text-[clamp(3.4rem,9vw,10rem)]">
          <Split lines={['The real magic', 'is in the moment.']} mode="words" />
        </h2>
        <p className="mt-6 max-w-[38ch] text-lg text-paper/85 md:text-xl">A shared table, a late train, a full-time whistle. The drink is just how the moment gets remembered.</p>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Banner C · "A moment worth sharing." – two frames slide together   */
/* ------------------------------------------------------------------ */
export function ShareBanner({ left = '/images/glass-red-label.jpg', right = '/images/can-ice.jpg', to = '/campaigns', cta = 'See the full campaign' }) {
  const root = useRef()
  useGSAP(
    () => {
      if (QUALITY.reduced) return
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 85%', end: 'center center', scrub: 1 } })
      tl.fromTo('.sb-left', { xPercent: -40, rotate: -6 }, { xPercent: 0, rotate: -2, ease: 'power2.out' }, 0)
        .fromTo('.sb-right', { xPercent: 40, rotate: 6 }, { xPercent: 0, rotate: 3, ease: 'power2.out' }, 0)
        .fromTo('.sb-title .split-char', { yPercent: 120 }, { yPercent: 0, stagger: 0.01, ease: 'power3.out' }, 0.2)
    },
    { scope: root },
  )
  return (
    <section ref={root} data-nav="dark" className="relative overflow-hidden bg-paper py-24 text-ink md:py-36" aria-labelledby="share-title">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-3 px-5 md:gap-6 md:px-10">
        <figure className="sb-left aspect-[4/5] overflow-hidden md:aspect-[4/3]">
          <img src={left} alt="The contour glass bottle lit in deep red" loading="lazy" className="h-full w-full object-cover" />
        </figure>
        <figure className="sb-right mt-16 aspect-[4/5] overflow-hidden md:mt-28 md:aspect-[4/3]">
          <img src={right} alt="A Coca-Cola can resting in crushed ice" loading="lazy" className="h-full w-full object-cover" />
        </figure>
      </div>
      <h2 id="share-title" className="sb-title display pointer-events-none relative z-10 -mt-[12vw] text-center text-[clamp(3.6rem,13vw,15rem)] text-coke mix-blend-multiply md:-mt-[9vw]">
        <Split lines={['A moment', 'worth sharing.']} />
      </h2>
      <div className="mx-auto mt-10 flex max-w-[1600px] justify-center px-5">
        <Link to={to} className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current pb-1 text-lg font-semibold">
          {cta} <ArrowUpRight size={20} aria-hidden="true" />
        </Link>
      </div>
    </section>
  )
}
