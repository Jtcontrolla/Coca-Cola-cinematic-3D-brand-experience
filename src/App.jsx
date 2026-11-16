import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Nav from './components/Nav'
import Loader from './components/Loader'
import PageShell from './components/PageShell'
import { startLenis } from './lib/scroll'

const Home = lazy(() => import('./pages/Home'))
const VarietyRouter = lazy(() => import('./pages/VarietyRouter'))
const VarietiesIndex = lazy(() => import('./pages/VarietiesIndex'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const Story = lazy(() => import('./pages/Story'))
const NotFound = lazy(() => import('./pages/NotFound'))

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load("900 100px 'Archivo Variable'"),
      document.fonts.load("400 16px 'Archivo Variable'"),
    ])
    await document.fonts.ready
  } catch {
    /* fall back silently */
  }
}

export default function App() {
  const location = useLocation()
  const [fontsReady, setFontsReady] = useState(false)
  const [intro, setIntro] = useState(true)

  useEffect(() => {
    loadFonts().then(() => setFontsReady(true))
    startLenis()
  }, [])

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        {fontsReady && (
          <AnimatePresence mode="wait" initial={false}>
            <Suspense fallback={<div className="h-screen bg-ink" />} key={location.pathname}>
              <Routes location={location}>
                <Route path="/" element={<PageShell><Home /></PageShell>} />
                <Route path="/varieties" element={<PageShell><VarietiesIndex /></PageShell>} />
                <Route path="/varieties/:slug" element={<PageShell><VarietyRouter /></PageShell>} />
                <Route path="/campaigns" element={<PageShell><Campaigns /></PageShell>} />
                <Route path="/our-story" element={<PageShell><Story /></PageShell>} />
                <Route path="*" element={<PageShell><NotFound /></PageShell>} />
              </Routes>
            </Suspense>
          </AnimatePresence>
        )}
      </main>
      <AnimatePresence>{intro && <Loader ready={fontsReady} onDone={() => setIntro(false)} />}</AnimatePresence>
    </>
  )
}
