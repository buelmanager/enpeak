'use client'

import HomepageNav from '@/components/HomepageNav'
import HeroSection from '@/components/HeroSection'
import FeaturesBento from '@/components/FeaturesBento'
import CommunityHighlights from '@/components/CommunityHighlights'
import DailyChallengePreview from '@/components/DailyChallengePreview'
import LeaderboardTeaser from '@/components/LeaderboardTeaser'
import TestimonialsCarousel from '@/components/TestimonialsCarousel'
import HomepageFooter from '@/components/HomepageFooter'

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
