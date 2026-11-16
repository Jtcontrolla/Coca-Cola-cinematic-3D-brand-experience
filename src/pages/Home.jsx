import Hero from '../sections/Hero'
import ProductReel from '../sections/ProductReel'
import { FeelingBanner, MomentBanner, ShareBanner } from '../sections/Banners'
import Refreshment from '../sections/Refreshment'
import BillboardCity from '../sections/BillboardCity'
import Beyond from '../sections/Beyond'
import CampaignWall from '../sections/CampaignWall'
import Closing from '../sections/Closing'

/*
  Running order of the film:
  open → meet the family → feeling → refreshment → the city at night →
  the moment → beyond the bottle → the wall → sharing → choose yours
*/
export default function Home() {
  return (
    <>
      <Hero />
      <ProductReel />
      <FeelingBanner />
      <Refreshment />
      <BillboardCity />
      <MomentBanner />
      <Beyond />
      <CampaignWall />
      <ShareBanner />
      <Closing />
    </>
  )
}
