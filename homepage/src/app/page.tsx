'use client'

import dynamic from 'next/dynamic'
import HomepageNav from '@/components/HomepageNav'
import HeroSection from '@/components/HeroSection'
import FeaturesBento from '@/components/FeaturesBento'
import HomepageFooter from '@/components/HomepageFooter'

const CommunityHighlights = dynamic(() => import('@/components/CommunityHighlights'))
const DailyChallengePreview = dynamic(() => import('@/components/DailyChallengePreview'))
const LeaderboardTeaser = dynamic(() => import('@/components/LeaderboardTeaser'))
const TestimonialsCarousel = dynamic(() => import('@/components/TestimonialsCarousel'))

export default function Homepage() {
  return (
    <div className="min-h-screen bg-hp-cream">
      <HomepageNav />
      <HeroSection />
      <FeaturesBento />
      <CommunityHighlights />
      <DailyChallengePreview />
      <LeaderboardTeaser />
      <TestimonialsCarousel />
      <HomepageFooter />
    </div>
  )
}
