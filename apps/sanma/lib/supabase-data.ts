import { querySanma, SANMA } from "./neon-client"
import { getStaticMatchResults } from "./static-match-results"

// Use static data for preliminary round (ends 2026-04-27)
// Semi-finals start 2026-04-28
const PRELIMINARY_ROUND_END_DATE = "2026-04-27"
const USE_STATIC_DATA_FOR_PRELIMINARY = true

export interface MatchLineup {
  matchId: string
  matchDate: string
  round: string
  players: any[]
}

export interface MatchResults {
  matchId: string
  round: string
  date: string
  results: {
    game1: any[]
    game2: any[]
    game3: any[]
    teamTotals: any[]
  }
}

export interface NewsItem {
  id: number
  content: string
  created_at?: string
  updated_at?: string
}

// Save lineup to Neon
export async function saveLineup(lineup: MatchLineup) {
  try {
    await querySanma(
      `INSERT INTO sanma_match_lineups (league_id, season, match_id, match_date, round, players)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (season, match_id) DO UPDATE SET
         match_date = EXCLUDED.match_date,
         players = EXCLUDED.players,
         updated_at = NOW()`,
      [SANMA.LEAGUE_ID, SANMA.CURRENT_SEASON, lineup.matchId, lineup.matchDate, lineup.round, JSON.stringify(lineup.players)]
    )
    return { match_id: lineup.matchId, match_date: lineup.matchDate, round: lineup.round, players: lineup.players }
  } catch (error) {
    console.error("[v0] Error saving lineup:", error)
    throw error
  }
}

// Get lineup from Neon
export async function getLineup(matchId: string) {
  try {
    const result = await querySanma(
      `SELECT * FROM sanma_match_lineups WHERE match_id = $1`,
      [matchId]
    )

    if (result.rows.length === 0) return null

    const data = result.rows[0]
    return {
      matchId: data.match_id,
      matchDate: data.match_date,
      round: data.round,
      players: data.players,
    }
  } catch (error) {
    console.error("[v0] Error getting lineup:", error)
    throw error
  }
}

// Save results to Neon
export async function saveResults(results: MatchResults) {
  try {
    await querySanma(
      `INSERT INTO sanma_match_results (league_id, season, match_id, round, date, results)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (season, match_id, round) DO UPDATE SET
         date = EXCLUDED.date,
         results = EXCLUDED.results,
         updated_at = NOW()`,
      [SANMA.LEAGUE_ID, SANMA.CURRENT_SEASON, results.matchId, results.round, results.date, JSON.stringify(results.results)]
    )
    
    clearMatchResultsCache()
    
    return { match_id: results.matchId, round: results.round, date: results.date, results: results.results }
  } catch (error) {
    console.error("[v0] Error saving results:", error)
    throw error
  }
}

// Get all results from Neon (uses same caching as getAllMatchResults)
export async function getAllResults() {
  // Use the cached getAllMatchResults to avoid duplicate Neon calls
  const results = await getAllMatchResults()
  
  // Convert to raw database format for compatibility
  return results.map(r => ({
    match_id: r.matchId,
    round: r.round,
    date: r.date,
    results: r.results
  })).sort((a, b) => b.date.localeCompare(a.date)) // descending order
}

// Get results for a specific match
export async function getMatchResults(matchId: string, round: string) {
  try {
    const result = await querySanma(
      `SELECT * FROM sanma_match_results WHERE match_id = $1 AND round = $2`,
      [matchId, round]
    )

    if (result.rows.length === 0) return null

    const data = result.rows[0]
    return {
      matchId: data.match_id,
      round: data.round,
      date: data.date,
      results: data.results,
    }
  } catch (error) {
    console.error("[v0] Error getting match results:", error)
    throw error
  }
}

let cachedResults: MatchResults[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes (increased to reduce Supabase usage)
const LOCAL_STORAGE_CACHE_KEY = "supabase_match_results_cache"
const LOCAL_STORAGE_TIMESTAMP_KEY = "supabase_match_results_timestamp"
const SUPABASE_OFFLINE_KEY = "supabase_offline_mode"

// Check if Supabase is in offline mode (restricted/unavailable)
function isSupabaseOffline(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(SUPABASE_OFFLINE_KEY) === "true"
}

// Set Supabase offline mode
function setSupabaseOffline(offline: boolean) {
  if (typeof window === "undefined") return
  if (offline) {
    localStorage.setItem(SUPABASE_OFFLINE_KEY, "true")
  } else {
    localStorage.removeItem(SUPABASE_OFFLINE_KEY)
  }
}

// Get all match results - uses static data for preliminary round
export async function getAllMatchResults(): Promise<MatchResults[]> {
  // For preliminary round, use static data files (no Supabase calls needed)
  if (USE_STATIC_DATA_FOR_PRELIMINARY) {
    const staticResults = getStaticMatchResults()
    return staticResults.map((r) => ({
      matchId: r.match_id,
      round: r.round,
      date: r.date,
      results: r.results as any,
    }))
  }

  // Below code is kept for semi-finals phase when we need live data from Supabase
  const now = Date.now()
  
  // Layer 1: Check in-memory cache first (fastest)
  if (cachedResults && now - cacheTimestamp < CACHE_DURATION) {
    return cachedResults
  }
  
  // Layer 2: Check localStorage cache (persists across page loads)
  if (typeof window !== "undefined") {
    try {
      const localTimestamp = localStorage.getItem(LOCAL_STORAGE_TIMESTAMP_KEY)
      const localData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
      
      if (localTimestamp && localData) {
        const timestamp = parseInt(localTimestamp, 10)
        // Use longer cache duration (2 hours) if we have cached data
        const effectiveCacheDuration = isSupabaseOffline() ? 24 * 60 * 60 * 1000 : CACHE_DURATION
        if (now - timestamp < effectiveCacheDuration) {
          cachedResults = JSON.parse(localData)
          cacheTimestamp = timestamp
          return cachedResults
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // If Supabase is in offline mode, use localStorage data even if stale
  if (isSupabaseOffline()) {
    if (typeof window !== "undefined") {
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
        if (localData) {
          cachedResults = JSON.parse(localData)
          return cachedResults
        }
      } catch (e) {
        // Ignore
      }
    }
    return cachedResults || []
  }

  // Layer 3: Fetch from Neon (only if caches are stale/empty)
  try {
    const result = await querySanma(
      `SELECT * FROM sanma_match_results WHERE league_id = $1 AND season = $2 ORDER BY date ASC`,
      [SANMA.LEAGUE_ID, SANMA.CURRENT_SEASON]
    )

    const data = result.rows || []

    cachedResults = (data || []).map((row: any) => ({
      matchId: row.match_id,
      round: row.round,
      date: row.date,
      results: row.results,
    }))
    cacheTimestamp = now
    
    // Save to localStorage for persistence
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(LOCAL_STORAGE_CACHE_KEY, JSON.stringify(cachedResults))
        localStorage.setItem(LOCAL_STORAGE_TIMESTAMP_KEY, now.toString())
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    return cachedResults
  } catch (e) {
    // Network error or other issue - use cached data
    console.error("[v0] Error fetching match results from Neon:", e)
    if (cachedResults) return cachedResults
    if (typeof window !== "undefined") {
      try {
        const localData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
        if (localData) return JSON.parse(localData)
      } catch (err) {
        // Ignore
      }
    }
    return []
  }
}

export function clearMatchResultsCache() {
  cachedResults = null
  cacheTimestamp = 0
  
  // Also clear localStorage cache
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(LOCAL_STORAGE_CACHE_KEY)
      localStorage.removeItem(LOCAL_STORAGE_TIMESTAMP_KEY)
    } catch (e) {
      console.error("[v0] Error clearing localStorage cache:", e)
    }
  }
}

// Get all news items from Neon
export async function getAllNews() {
  try {
    const result = await querySanma(
      `SELECT * FROM news_items WHERE league_id = $1 ORDER BY created_at DESC`,
      [SANMA.LEAGUE_ID]
    )
    return result.rows || []
  } catch (error) {
    console.error("[v0] Error getting news:", error)
    return []
  }
}

// Save news item to Neon
export async function saveNews(content: string) {
  try {
    const result = await querySanma(
      `INSERT INTO news_items (league_id, content, created_at)
       VALUES ($1, $2, NOW())
       RETURNING *`,
      [SANMA.LEAGUE_ID, content]
    )
    return result.rows[0]
  } catch (error) {
    console.error("[v0] Error saving news:", error)
    throw error
  }
}

// Update news item in Neon
export async function updateNews(id: number, content: string) {
  try {
    const result = await querySanma(
      `UPDATE news_items SET content = $1, updated_at = NOW()
       WHERE id = $2 AND league_id = $3
       RETURNING *`,
      [content, id, SANMA.LEAGUE_ID]
    )
    return result.rows[0]
  } catch (error) {
    console.error("[v0] Error updating news:", error)
    throw error
  }
}

// Delete news item from Neon
export async function deleteNews(id: number) {
  try {
    await querySanma(
      `DELETE FROM news_items WHERE id = $1 AND league_id = $2`,
      [id, SANMA.LEAGUE_ID]
    )
  } catch (error) {
    console.error("[v0] Error deleting news:", error)
    throw error
  }
}

// Migrate data from localStorage to Neon (optional, mainly for backward compatibility)
export async function migrateLocalStorageToSupabase(): Promise<{ results: number; lineups: number }> {
  // Since we're starting fresh in 2026 with no past data, this function can be skipped
  // It's kept for compatibility only
  return { results: 0, lineups: 0 }
}
