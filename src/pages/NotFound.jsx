import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col items-start justify-center bg-coke px-5 text-paper md:px-10">
      <Logo className="w-40" />
      <h1 className="display mt-8 text-[clamp(4rem,14vw,14rem)]">Empty bottle.</h1>
      <p className="mt-4 max-w-[40ch] text-lg">There's nothing at this address. The page may have moved, or the link has a typo.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center rounded-full border-2 border-paper px-6 text-lg font-semibold transition-colors hover:bg-paper hover:text-coke">
        Back to the homepage
      </Link>
    </section>
  )
}
