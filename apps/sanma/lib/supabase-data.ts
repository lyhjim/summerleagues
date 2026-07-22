"use client"

import { createClient } from "./supabase-client"
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

// Save lineup to Supabase
export async function saveLineup(lineup: MatchLineup) {
  const supabase = createClient()

  const { data, error } = await supabase.from("match_lineups").upsert(
    {
      match_id: lineup.matchId,
      match_date: lineup.matchDate,
      round: lineup.round,
      players: lineup.players,
    },
    {
      onConflict: "match_id",
    },
  )

  if (error) {
    console.error("[v0] Error saving lineup:", error)
    throw error
  }

  return data
}

// Get lineup from Supabase
export async function getLineup(matchId: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("match_lineups").select("*").eq("match_id", matchId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = not found
    console.error("[v0] Error getting lineup:", error)
    throw error
  }

  if (!data) return null

  return {
    matchId: data.match_id,
    matchDate: data.match_date,
    round: data.round,
    players: data.players,
  }
}

// Save results to Supabase
export async function saveResults(results: MatchResults) {
  const supabase = createClient()

  const { data, error } = await supabase.from("match_results").upsert(
    {
      match_id: results.matchId,
      round: results.round,
      date: results.date,
      results: results.results,
    },
    {
      onConflict: "match_id,round",
    },
  )

  if (error) {
    console.error("[v0] Error saving results:", error)
    throw error
  }

  clearMatchResultsCache()

  return data
}

// Get all results from Supabase (uses same caching as getAllMatchResults)
export async function getAllResults() {
  // Use the cached getAllMatchResults to avoid duplicate Supabase calls
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
  const supabase = createClient()

  const { data, error } = await supabase
    .from("match_results")
    .select("*")
    .eq("match_id", matchId)
    .eq("round", round)
    .single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error getting match results:", error)
    throw error
  }

  if (!data) return null

  return {
    matchId: data.match_id,
    round: data.round,
    date: data.date,
    results: data.results,
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

  // Layer 3: Fetch from Supabase (only if caches are stale/empty)
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("match_results").select("*").order("date", { ascending: true })

    if (error) {
      // Check if it's a restriction error
      if (error.message?.includes("restricted") || error.message?.includes("quota")) {
        console.warn("[v0] Supabase restricted, switching to offline mode")
        setSupabaseOffline(true)
      }
      // Return stale cache if available
      if (cachedResults) return cachedResults
      // Try localStorage as fallback
      if (typeof window !== "undefined") {
        const localData = localStorage.getItem(LOCAL_STORAGE_CACHE_KEY)
        if (localData) return JSON.parse(localData)
      }
      return []
    }

    // Supabase is working, clear offline mode
    setSupabaseOffline(false)

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

// Get all news items from Supabase
export async function getAllNews() {
  const supabase = createClient()

  const { data, error } = await supabase.from("news_items").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error getting news:", error)
    return []
  }

  return data || []
}

// Save news item to Supabase
export async function saveNews(content: string) {
  const supabase = createClient()

  const { data, error } = await supabase.from("news_items").insert({ content }).select().single()

  if (error) {
    console.error("Error saving news:", error)
    throw error
  }

  return data
}

// Update news item in Supabase
export async function updateNews(id: number, content: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("news_items")
    .update({ content, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating news:", error)
    throw error
  }

  return data
}

// Delete news item from Supabase
export async function deleteNews(id: number) {
  const supabase = createClient()

  const { error } = await supabase.from("news_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting news:", error)
    throw error
  }
}

// Migrate data from localStorage to Supabase
export async function migrateLocalStorageToSupabase(): Promise<{ results: number; lineups: number }> {
  if (typeof window === "undefined") return { results: 0, lineups: 0 }

  const supabase = createClient()
  const results = []
  const lineups = []

  // Get all localStorage keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    const value = localStorage.getItem(key)
    if (!value) continue

    try {
      // Migrate results
      if (key.startsWith("result-")) {
        const data = JSON.parse(value)
        const parts = key.replace("result-", "").split("-")
        const date = `${parts[0]}-${parts[1]}-${parts[2]}`
        const table = parts[3]
        const round = parts[4]

        results.push({
          match_id: `${date}-${table}`,
          round: round,
          date: date,
          results: data.results,
        })
      }

      // Migrate lineups
      if (key.startsWith("lineup-")) {
        const data = JSON.parse(value)
        let matchDate = data.matchDate

        // If matchDate is missing, try to extract it from matchId (format: YYYY-MM-DD-T1)
        if (!matchDate && data.matchId) {
          const parts = data.matchId.split("-")
          if (parts.length >= 3) {
            matchDate = `${parts[0]}-${parts[1]}-${parts[2]}`
          }
        }

        // Only add lineup if all required fields are present
        if (data.matchId && matchDate && data.round && data.players) {
          lineups.push({
            match_id: data.matchId,
            match_date: matchDate,
            round: data.round,
            players: data.players,
          })
        } else {
          console.warn("[v0] Skipping lineup with missing required fields:", key)
        }
      }
    } catch (e) {
      console.error("[v0] Error parsing localStorage data:", e)
    }
  }

  // Insert results
  if (results.length > 0) {
    const { error: resultsError } = await supabase
      .from("match_results")
      .upsert(results, { onConflict: "match_id,round" })

    if (resultsError) {
      console.error("[v0] Error migrating results:", resultsError)
    } else {
      console.log(`[v0] Migrated ${results.length} results to Supabase`)
    }
  }

  // Insert lineups
  if (lineups.length > 0) {
    const { error: lineupsError } = await supabase.from("match_lineups").upsert(lineups, { onConflict: "match_id" })

    if (lineupsError) {
      console.error("[v0] Error migrating lineups:", lineupsError)
    } else {
      console.log(`[v0] Migrated ${lineups.length} lineups to Supabase`)
    }
  }

  // Migrate news from localStorage to Supabase
  const newsData = localStorage.getItem("newsItems")

  if (newsData) {
    try {
      const newsItems = JSON.parse(newsData)
      const newsToInsert = newsItems.map((item: any) => ({
        content: JSON.stringify({
          date: item.date,
          title: item.title,
          category: item.category,
        }),
      }))

      const { error } = await supabase.from("news_items").insert(newsToInsert)

      if (error) {
        console.error("Error migrating news:", error)
        throw error
      }

      console.log(`[v0] Migrated ${newsItems.length} news items to Supabase`)
    } catch (e) {
      console.error("Error parsing news data:", e)
    }
  }

  const resultsCount = results.length
  const lineupsCount = lineups.length

  return { results: resultsCount, lineups: lineupsCount }
}
