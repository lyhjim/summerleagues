import { query } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const { gameNumber, teamName, playerName, penaltyScore, reason } = await request.json()

    if (!gameNumber || !teamName || !playerName || penaltyScore === undefined) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    // Insert or update penalty
    await query(
      `INSERT INTO player_penalties (game_number, team_name, player_name, penalty_score, reason, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (game_number, team_name, player_name)
       DO UPDATE SET penalty_score = $4, reason = $5, updated_at = NOW()`,
      [gameNumber, teamName, playerName, penaltyScore, reason || null]
    )

    return Response.json({ success: true, message: "罰分已保存" })
  } catch (error) {
    console.error("[v0] Penalty submission error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ penalties: {} })
    }

    const url = new URL(request.url)
    const gameNumber = url.searchParams.get("gameNumber")

    let result
    if (gameNumber) {
      result = await query(
        `SELECT game_number, team_name, player_name, penalty_score, reason FROM player_penalties 
         WHERE game_number = $1 ORDER BY team_name, player_name`,
        [parseInt(gameNumber)]
      )
    } else {
      result = await query(
        "SELECT game_number, team_name, player_name, penalty_score, reason FROM player_penalties ORDER BY game_number, team_name, player_name"
      )
    }

    const penalties: Record<string, any> = {}
    
    result.rows.forEach((row: any) => {
      const key = `${row.game_number}-${row.team_name}-${row.player_name}`
      penalties[key] = {
        penaltyScore: row.penalty_score,
        reason: row.reason,
      }
    })

    return Response.json({ penalties })
  } catch (error) {
    console.error("[v0] Error fetching penalties:", error)
    return Response.json({ error: "Failed to fetch penalties", penalties: {} }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { gameNumber, teamName, playerName } = await request.json()

    if (!gameNumber || !teamName || !playerName) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    await query(
      "DELETE FROM player_penalties WHERE game_number = $1 AND team_name = $2 AND player_name = $3",
      [gameNumber, teamName, playerName]
    )

    return Response.json({ success: true, message: "罰分已刪除" })
  } catch (error) {
    console.error("[v0] Penalty deletion error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}
