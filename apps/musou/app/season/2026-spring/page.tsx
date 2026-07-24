import { Navigation } from "@/components/navigation"
import { TeamRankings } from "@/components/team-rankings"
import { MvpRankings } from "@/components/mvp-rankings"
import { Footer } from "@/components/footer"
import Link from "next/link"

export const metadata = {
  title: "2026 春季賽 成績 | League of Riichi Champions",
  description: "2026 Spring Season results for the League of Riichi Champions",
}

export default function SpringSeasonPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16 pb-8">
        {/* Header */}
        <section className="py-12 px-4 border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <Link href="/" className="text-primary hover:text-primary/80 text-sm font-medium mb-4 inline-block">
              ← 返回首頁
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">2026 春季賽</h1>
            <p className="text-muted-foreground text-lg">成績及排名</p>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <TeamRankings />
            <div className="mt-16" />
            <MvpRankings />
            
            {/* High Scores Section */}
            <div className="mt-16 pt-16 border-t border-border">
              <h2 className="text-3xl font-bold mb-8">單局最高分</h2>
              <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                <p>敬請期待...</p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}
