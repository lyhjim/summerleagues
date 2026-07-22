import { query } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const { token, teamName, gameNumber, player } = await request.json()

    if (!token || !teamName || !gameNumber || !player) {
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

    // Insert or update lineup
    await query(
      `INSERT INTO summer_team_lineups (team_name, game_number, player_1, submitted_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (team_name, game_number) 
       DO UPDATE SET player_1 = $3, updated_at = NOW()`,
      [teamName, gameNumber, player]
    )

    return Response.json({ success: true, message: "選手已提交" })
  } catch (error) {
    console.error("[v0] Lineup submission error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
