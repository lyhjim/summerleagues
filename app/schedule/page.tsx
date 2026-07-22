import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FullSchedule } from "@/components/full-schedule"

export default function SchedulePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-16">
        <FullSchedule />
        <Footer />
      </div>
    </main>
  )
}
