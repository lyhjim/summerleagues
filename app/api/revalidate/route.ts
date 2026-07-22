import { NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// POST - Revalidate cache when overlay site updates results
export async function POST(request: NextRequest) {
  try {
    // Clear all cached pages that display match results
    revalidatePath("/", "layout")
    revalidatePath("/results")
    revalidatePath("/schedule")
    
    return NextResponse.json({ success: true, message: "Cache revalidated" })
  } catch (error) {
    console.error("Error revalidating cache:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
