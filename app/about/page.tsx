import { LeagueBanner } from "@/components/league-banner"
import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { ApplicationForm } from "@/components/application-form"
import { Timeline } from "@/components/timeline"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "關於聯賽 | 香港立直無雙聯賽",
  description: "香港立直無雙聯賽詳細資訊、賽制、報名方式及時間表",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16">
        <LeagueBanner />
        <HeroSection />
        <ApplicationForm />
        <Timeline />
        <Footer />
      </div>
    </main>
  )
}
