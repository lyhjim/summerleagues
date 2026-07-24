import { neon } from "@neondatabase/serverless"
export const dynamic = "force-dynamic"

// const sql = neon(process.env.DATABASE_URL || "")

// Allowed finals teams
const FINALS_TEAMS = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ })
    }
    const sql = neon(process.env.DATABASE_URL)
    const { searchParams } = new URL(request.url)
    const teamName = searchParams.get("team")

    if (teamName) {
      // Get player photos for specific team
      const photos = await sql`
        SELECT * FROM finals_player_photos 
        WHERE team_name = ${teamName}
        ORDER BY player_name ASC
      `
      return Response.json({ photos })
    } else {
      // Get all player photos
      const photos = await sql`
        SELECT * FROM finals_player_photos
        ORDER BY team_name ASC, player_name ASC
      `
      return Response.json({ photos })
    }
  } catch (error) {
    console.error("[v0] Error fetching player photos:", error)
    return Response.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ })
    }
    const sql = neon(process.env.DATABASE_URL)
    const body = await request.json()
    const { team_name, player_name, photo_url } = body

    // Validate team is in finals
    if (!FINALS_TEAMS.includes(team_name)) {
      return Response.json(
        { error: "Team is not eligible for finals" },
        { status: 403 }
      )
    }

    // Validate player name exists
    if (!player_name || !player_name.trim()) {
      return Response.json(
        { error: "Player name is required" },
        { status: 400 }
      )
    }

    // Upsert the player photo
    const result = await sql`
      INSERT INTO finals_player_photos (team_name, player_name, photo_url, updated_at)
      VALUES (${team_name}, ${player_name}, ${photo_url}, NOW())
      ON CONFLICT (team_name, player_name) DO UPDATE SET
        photo_url = EXCLUDED.photo_url,
        updated_at = NOW()
      RETURNING *
    `

    return Response.json({
      success: true,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error submitting player photo:", error)
    return Response.json(
      { error: "Failed to submit photo" },
      { status: 500 }
    )
  }
}
