import { Navigation } from "@/components/navigation"
import { CompetitionRules } from "@/components/competition-rules"
import { Footer } from "@/components/footer"

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16">
        <CompetitionRules />
        <Footer />
      </div>
    </main>
  )
}
