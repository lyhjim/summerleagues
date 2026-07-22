import { query } from "@/lib/db/neon"

export async function GET(request: Request) {
  try {
    // Skip during build if DATABASE_URL is not set
    if (!process.env.DATABASE_URL) {
      return Response.json({ teams: [] })
    }

    const result = await query(
      "SELECT team_name, access_token FROM summer_team_access ORDER BY team_name"
    )

    return Response.json({
      teams: result.rows,
    })
  } catch (error) {
    console.error("[v0] Error fetching teams:", error)
    return Response.json({ error: "Failed to fetch teams" }, { status: 500 })
  }
}
