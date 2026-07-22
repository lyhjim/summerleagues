import { query } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const { teamName, gameNumber, playerName } = await request.json()

    if (!teamName || gameNumber === undefined || playerName === undefined) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    // Update or insert lineup entry
    await query(
      `INSERT INTO summer_team_lineups (team_name, game_number, player_1, submitted_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT (team_name, game_number) 
       DO UPDATE SET player_1 = $3, updated_at = NOW()`,
      [teamName, gameNumber, playerName]
    )

    return Response.json({ success: true, message: `已更新 ${teamName} - Game ${gameNumber} 的選手` })
  } catch (error) {
    console.error("[v0] Admin lineup update error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
