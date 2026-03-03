import dynamic from "next/dynamic"

const HeroSection = dynamic(() => import("@/components/landing/HeroSection").then(m => ({ default: m.HeroSection })), {
  loading: () => <div className="pt-32 pb-20 md:pt-48 md:pb-32" />,
})

const FeaturesGrid = dynamic(() => import("@/components/landing/FeaturesGrid").then(m => ({ default: m.FeaturesGrid })), {
  loading: () => <div className="py-24" />,
})

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeaturesGrid />
    </>
  )
}
