import { createClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"
import JSZip from "jszip"

export async function GET() {
  try {
    const supabase = createClient()

    const yakumans: Array<{
      fileName: string
      photoData: string
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

          game.forEach((player: any, playerIdx: number) => {
            if (player.yakumans && Array.isArray(player.yakumans)) {
              player.yakumans.forEach((yakuman: any, yakumanIdx: number) => {
                if (yakuman.photoUrl) {
                  // Create a unique filename
                  const playerName = player.playerName?.replace(/\s+/g, "-") || `player-${playerIdx}`
                  const yakumanType = yakuman.types?.[0]?.replace(/\s+/g, "-") || "yakuman"
                  const fileName = `${date}_${matchId}_${gameKey}_${playerName}_${yakumanType}_${yakumanIdx}.jpg`

                  yakumans.push({
                    fileName,
                    photoData: yakuman.photoUrl, // Can be data URL or HTTP URL
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

    // Create ZIP file
    const zip = new JSZip()
    const photosFolder = zip.folder("yakuman-photos")

    if (!photosFolder) {
      return NextResponse.json({ error: "Failed to create ZIP folder" }, { status: 500 })
    }

    // Add each photo to the ZIP
    for (const yakuman of yakumans) {
      try {
        // Check if it's a data URL or HTTP URL
        if (yakuman.photoData.startsWith("data:")) {
          // Data URL - convert to blob
          const base64Data = yakuman.photoData.split(",")[1]
          photosFolder.file(yakuman.fileName, Buffer.from(base64Data, "base64"))
        } else if (yakuman.photoData.startsWith("http")) {
          // HTTP URL - fetch the image
          const response = await fetch(yakuman.photoData)
          const arrayBuffer = await response.arrayBuffer()
          photosFolder.file(yakuman.fileName, arrayBuffer)
        }
      } catch (e) {
        console.error(`[v0] Error processing photo ${yakuman.fileName}:`, e)
      }
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="yakuman-photos-${new Date().toISOString().split("T")[0]}.zip"`,
      },
    })
  } catch (error) {
    console.error("[v0] Error in download-yakumans:", error)
    return NextResponse.json({ error: "Failed to download yakumans" }, { status: 500 })
  }
}
