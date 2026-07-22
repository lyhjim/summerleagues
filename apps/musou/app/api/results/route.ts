import { NextResponse } from "next/server"

const OVERLAY_API = "https://majhong-supreme.web.app/api/league/matches"

// GET - Fetch matches from overlay site API
export async function GET() {
  try {
    const response = await fetch(OVERLAY_API, {
      next: { revalidate: 300 }, // Cache for 5 minutes to match CDN
    })

    if (!response.ok) {
      throw new Error(`Overlay API returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching from overlay API:", error)
    return NextResponse.json(
      { error: "Failed to fetch match results from overlay API" },
      { status: 500 }
    )
  }
}
