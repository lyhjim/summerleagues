import { query } from "@/lib/db/neon"

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ status: {} })
    }

    // Get all teams
    const teamsResult = await query(
      "SELECT team_name FROM summer_team_access ORDER BY team_name"
    )

    const status: Record<string, Record<string, boolean>> = {}

    for (const row of teamsResult.rows) {
      const teamName = row.team_name
      
      // Get submitted lineups for this team
      const lineupsResult = await query(
        "SELECT DISTINCT game_number FROM summer_team_lineups WHERE team_name = $1 ORDER BY game_number",
        [teamName]
      )

      const submittedGames = new Set(lineupsResult.rows.map((r: any) => r.game_number))
      
      // Create status object for games 1-36 and 37-40 (finals)
      const teamStatus: Record<string, boolean> = {}
      for (let i = 1; i <= 40; i++) {
        teamStatus[i.toString()] = submittedGames.has(i)
      }
      
      status[teamName] = teamStatus
    }

    return Response.json({ status })
  } catch (error) {
    console.error("[v0] Error fetching submission status:", error)
    return Response.json({ error: "Failed to fetch status" }, { status: 500 })
  }
}
