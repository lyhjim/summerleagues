import { query } from "@/lib/db/neon"

export async function POST(request: Request) {
  try {
    const { gameNumber, eScore, sScore, wScore, nScore } = await request.json()

    if (gameNumber === undefined || eScore === undefined || sScore === undefined || wScore === undefined || nScore === undefined) {
      return Response.json({ error: "缺少必要字段" }, { status: 400 })
    }

    // Verify total is 1000
    const total = eScore + sScore + wScore + nScore
    if (total !== 1000) {
      return Response.json({ error: `總和必須為 1000，目前為 ${total}` }, { status: 400 })
    }

    // Insert or update score
    await query(
      `INSERT INTO game_scores (game_number, e_score, s_score, w_score, n_score, submitted_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (game_number)
       DO UPDATE SET e_score = $2, s_score = $3, w_score = $4, n_score = $5, updated_at = NOW()`,
      [gameNumber, eScore, sScore, wScore, nScore]
    )

    return Response.json({ success: true, message: "成績已提交" })
  } catch (error) {
    console.error("[v0] Score submission error:", error)
    return Response.json({ error: "服務器錯誤" }, { status: 500 })
  }
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({ scores: {} })
    }

    const result = await query(
      "SELECT game_number, e_score, s_score, w_score, n_score FROM game_scores ORDER BY game_number"
    )

    const scores: Record<number, { e: number; s: number; w: number; n: number }> = {}
    
    result.rows.forEach((row: any) => {
      scores[row.game_number] = {
        e: row.e_score,
        s: row.s_score,
        w: row.w_score,
        n: row.n_score,
      }
    })

    return Response.json({ scores })
  } catch (error) {
    console.error("[v0] Error fetching scores:", error)
    return Response.json({ error: "Failed to fetch scores" }, { status: 500 })
  }
}
