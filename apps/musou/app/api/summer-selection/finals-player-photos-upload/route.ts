import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL || "")

// Allowed finals teams
const FINALS_TEAMS = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const team_name = formData.get("team_name") as string
    const player_name = formData.get("player_name") as string
    const photo = formData.get("photo") as File

    // Validate inputs
    if (!team_name || !player_name || !photo) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate team is in finals
    if (!FINALS_TEAMS.includes(team_name)) {
      return Response.json(
        { error: "Team is not eligible for finals" },
        { status: 403 }
      )
    }

    // Validate file size (5MB)
    if (photo.size > 5 * 1024 * 1024) {
      return Response.json(
        { error: "Photo size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Convert file to base64 for storage (or you could use a blob storage service)
    const buffer = await photo.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const photoDataUrl = `data:${photo.type};base64,${base64}`

    // Store in database
    const result = await sql`
      INSERT INTO finals_player_photos (team_name, player_name, photo_url, updated_at)
      VALUES (${team_name}, ${player_name}, ${photoDataUrl}, NOW())
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
    console.error("[v0] Error uploading player photo:", error)
    return Response.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    )
  }
}
