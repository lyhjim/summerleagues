// This script updates the localStorage to add the missing yakuman for ls2
// Run this once to fix the data

"use client"

export function fixYakumanData() {
  if (typeof window === "undefined") return

  const resultKey = "results-2026-01-06-T2-round1"
  const savedData = localStorage.getItem(resultKey)

  if (!savedData) {
    console.log("[v0] No saved data found for", resultKey)
    return
  }

  const data = JSON.parse(savedData)

  // Find ls2 in game3 and add the yakuman (字一色)
  if (data.results?.game3) {
    const ls2Player = data.results.game3.find((p: any) => p.playerName === "ls2")
    if (ls2Player) {
      ls2Player.yakumans = [
        {
          types: ["字一色"],
          photoUrl: "",
        },
      ]
      console.log("[v0] Added yakuman to ls2:", ls2Player)
    }
  }

  // Save the updated data
  localStorage.setItem(resultKey, JSON.stringify(data))
  console.log("[v0] Fixed yakuman data saved")

  // Dispatch event to refresh components
  window.dispatchEvent(new Event("resultsUpdated"))
  window.dispatchEvent(new Event("resultsSubmitted"))
}
