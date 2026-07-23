// Bridge between client-side state and database
// This allows HK16 to continue using its existing localStorage pattern
// while syncing to the database for persistence

'use client'

import {
  saveHK16MatchResults,
  getHK16MatchResults,
  updateHK16Standings,
  initializeHK16Database,
} from './db-init'

export interface HK16Result {
  matchId: string
  round: number
  matchDate: string
  scores: Array<{
    playerName: string
    team: string
    rawPts: number
  }>
  submittedAt: number
}

let dbInitialized = false

// Initialize database on first use
async function ensureDBInitialized() {
  if (dbInitialized) return
  try {
    await initializeHK16Database()
    dbInitialized = true
  } catch (error) {
    console.warn('[v0] Could not initialize HK16 database:', error)
    // Continue with localStorage fallback
  }
}

// Sync results to database
export async function syncHK16ResultsToDB(results: HK16Result[]) {
  await ensureDBInitialized()
  
  try {
    for (const result of results) {
      await saveHK16MatchResults(
        result.matchId,
        result.round,
        result.matchDate,
        result.scores
      )
    }
    await updateHK16Standings()
  } catch (error) {
    console.warn('[v0] Could not sync HK16 results to database:', error)
    // Silently fail - localStorage is still available
  }
}

// Load results from database
export async function loadHK16ResultsFromDB(): Promise<HK16Result[]> {
  await ensureDBInitialized()
  
  try {
    return await getHK16MatchResults()
  } catch (error) {
    console.warn('[v0] Could not load HK16 results from database:', error)
    return []
  }
}
