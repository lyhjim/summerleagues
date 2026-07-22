import { clearAndRecalculateStandings } from "@/lib/redis"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    await clearAndRecalculateStandings()
    return NextResponse.json({ success: true, message: "Cache cleared and standings recalculated" })
  } catch (error) {
    console.error("Error clearing cache:", error)
    return NextResponse.json({ success: false, error: "Failed to clear cache" }, { status: 500 })
  }
}
