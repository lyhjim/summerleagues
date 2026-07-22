import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

// Allowed finals teams
const FINALS_TEAMS = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gameNumber = searchParams.get("game")

    if (gameNumber) {
      // Get lineups for specific game
      const lineups = await sql`
        SELECT * FROM finals_team_lineups 
        WHERE game_number = ${parseInt(gameNumber)}
        ORDER BY 
          CASE seat WHEN '東' THEN 1 WHEN '南' THEN 2 WHEN '西' THEN 3 WHEN '北' THEN 4 END
      `
      return Response.json({ lineups })
    } else {
      // Get all finals lineups
      const lineups = await sql`
        SELECT * FROM finals_team_lineups
        ORDER BY game_number ASC
      `
      return Response.json({ lineups })
    }
  } catch (error) {
    console.error("[v0] Error fetching finals lineups:", error)
    return Response.json({ error: "Failed to fetch lineups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { team_name, game_number, seat, player_name, photo_url } = body

    // Validate team is in finals
    if (!FINALS_TEAMS.includes(team_name)) {
      return Response.json(
        { error: "Team is not eligible for finals" },
        { status: 403 }
      )
    }

    // Validate game number is in finals range
    if (game_number < 37 || game_number > 40) {
      return Response.json(
        { error: "Invalid game number for finals" },
        { status: 400 }
      )
    }

    // Upsert the lineup entry
    const result = await sql`
      INSERT INTO finals_team_lineups (game_number, seat, team_name, player_name, photo_url, updated_at)
      VALUES (${game_number}, ${seat}, ${team_name}, ${player_name}, ${photo_url}, NOW())
      ON CONFLICT (game_number, seat) DO UPDATE SET
        player_name = EXCLUDED.player_name,
        photo_url = EXCLUDED.photo_url,
        updated_at = NOW()
      RETURNING *
    `

    return Response.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error submitting finals lineup:", error)
    return Response.json(
      { error: "Failed to submit lineup" },
      { status: 500 }
    )
  }
}
