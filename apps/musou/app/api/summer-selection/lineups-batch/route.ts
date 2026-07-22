import { query } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const { token, teamName, lineups } = await request.json()

    if (!token || !teamName || !lineups || Object.keys(lineups).length === 0) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    // Verify token and team
    const teamResult = await query(
      "SELECT team_name FROM summer_team_access WHERE access_token = $1 AND team_name = $2",
      [token, teamName]
    )

    if (teamResult.rows.length === 0) {
      return Response.json({ error: "無效的訪問令牌或隊伍" }, { status: 401 })
    }

    // Submit all lineups in batch
    for (const [gameNumberStr, player] of Object.entries(lineups)) {
      const gameNumber = parseInt(gameNumberStr)
      if (!player) continue

      await query(
        `INSERT INTO summer_team_lineups (team_name, game_number, player_1, submitted_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (team_name, game_number) 
         DO UPDATE SET player_1 = $3, updated_at = NOW()`,
        [teamName, gameNumber, player]
      )
    }

    return Response.json({ 
      success: true, 
      message: `已提交 ${Object.keys(lineups).length} 場比賽的選手` 
    })
  } catch (error) {
    console.error("[v0] Batch lineup submission error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
