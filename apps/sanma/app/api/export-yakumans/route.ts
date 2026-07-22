import { createClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    const yakumans: Array<{
      matchId: string
      date: string
      game: string
      playerName: string
      teamName: string
      types: string[]
      photoUrl: string
    }> = []

    // Fetch data in batches to avoid timeout
    const batchSize = 50
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data: results, error } = await supabase
        .from("match_results")
        .select("match_id, date, results")
        .order("date", { ascending: true })
        .range(offset, offset + batchSize - 1)

      if (error) {
        console.error("[v0] Error fetching batch:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!results || results.length === 0) {
        hasMore = false
        break
      }

      // Process this batch
      results.forEach((result) => {
        const matchId = result.match_id
        const date = result.date
        const games = ["game1", "game2", "game3"] as const

        games.forEach((gameKey) => {
          const game = result.results?.[gameKey]
          if (!game || !Array.isArray(game)) return

          game.forEach((player: any) => {
            if (player.yakumans && Array.isArray(player.yakumans)) {
              player.yakumans.forEach((yakuman: any) => {
                if (yakuman.photoUrl) {
                  yakumans.push({
                    matchId,
                    date,
                    game: gameKey,
                    playerName: player.playerName || "Unknown",
                    teamName: player.teamName || "Unknown",
                    types: yakuman.types || [],
                    photoUrl: yakuman.photoUrl,
                  })
                }
              })
            }
          })
        })
      })

      // Check if we got a full batch (more data might exist)
      if (results.length < batchSize) {
        hasMore = false
      } else {
        offset += batchSize
      }
    }

    return NextResponse.json({
      totalYakumans: yakumans.length,
      yakumans,
    })
  } catch (error) {
    console.error("[v0] Error in export-yakumans:", error)
    return NextResponse.json({ error: "Failed to export yakumans" }, { status: 500 })
  }
}
