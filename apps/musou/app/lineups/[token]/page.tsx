import { notFound } from "next/navigation"
import { query } from "@/lib/db/neon"
import { LineupForm } from "@/components/summer-selection/lineup-form"

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function LineupSubmissionPage({ params }: PageProps) {
  const { token } = await params

  // Verify the token and get the team name
  let teamName: string | null = null

  try {
    const result = await query(
      "SELECT team_name FROM summer_team_access WHERE access_token = $1",
      [token]
    )
    if (result.rows.length > 0) {
      teamName = result.rows[0].team_name
    }
  } catch (error) {
    console.error("[v0] Error fetching team:", error)
  }

  if (!teamName) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/5 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">隊伍選手申報</h1>
            <p className="text-muted-foreground">
              為 <span className="font-bold text-yellow-300">{teamName}</span> 申報各場次的參賽選手
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <LineupForm teamName={teamName} token={token} />
      </div>
    </main>
  )
}
