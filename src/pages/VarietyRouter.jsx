import { lazy } from 'react'
import { useParams } from 'react-router-dom'
import NotFound from './NotFound'

const PAGES = {
  'plastic-bottle': lazy(() => import('./varieties/PlasticBottle')),
  'glass-bottle': lazy(() => import('./varieties/GlassBottle')),
  'classic-can': lazy(() => import('./varieties/ClassicCan')),
  'slim-can': lazy(() => import('./varieties/SlimCan')),
  'medium-can': lazy(() => import('./varieties/MediumCan')),
  'zero-sugar': lazy(() => import('./varieties/ZeroSugar')),
  more: lazy(() => import('./varieties/MoreVarieties')),
}

export default function VarietyRouter() {
  const { slug } = useParams()
  const Page = PAGES[slug]
  return Page ? <Page /> : <NotFound />
}
