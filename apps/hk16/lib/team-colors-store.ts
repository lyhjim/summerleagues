"use client"

// Store for custom team colors (persisted to localStorage)

import { TEAMS, type TeamKey } from "@/lib/schedule-data"

export const TEAM_COLORS_KEY = "tw_mahjong_team_colors"

export type TeamColors = Record<string, string>

// Default colors from TEAMS
export function getDefaultColors(): TeamColors {
  const colors: TeamColors = {}
  for (const [key, team] of Object.entries(TEAMS)) {
    colors[team.name] = team.color
  }
  return colors
}

// Read custom colors from localStorage (merged with defaults)
export function readTeamColors(): TeamColors {
  const defaults = getDefaultColors()
  if (typeof window === "undefined") return defaults
  try {
    const stored = localStorage.getItem(TEAM_COLORS_KEY)
    if (!stored) return defaults
    const parsed = JSON.parse(stored) as TeamColors
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

// Write custom team colors to localStorage
export function writeTeamColors(colors: TeamColors): void {
  localStorage.setItem(TEAM_COLORS_KEY, JSON.stringify(colors))
  window.dispatchEvent(new StorageEvent("storage", { key: TEAM_COLORS_KEY }))
}

// Get color for a specific team by name
export function getTeamColor(teamName: string): string {
  const colors = readTeamColors()
  return colors[teamName] || "#888888"
}

// Get color for a specific team by key
export function getTeamColorByKey(key: TeamKey): string {
  const teamName = TEAMS[key].name
  return getTeamColor(teamName)
}
