"use client"

import { useEffect, useState } from "react"
import { summerSchedule } from "./schedule"
import { calculateFinalPoints, getRankings } from "./score-calculator"

// Only preliminary games count toward team / MVP standings.
// (Games 37-40 are the finals and use placeholder team names like "第一名".)
const PRELIM_MAX_GAME = 36

export interface TeamStanding {
  teamName: string
  points: number
  first: number
  second: number
  third: number
  fourth: number
  games: number
}

export interface PlayerStanding {
  name: string
  teamName: string
  points: number
  first: number
  second: number
  third: number
  fourth: number
  games: number
  highestRawScore: number
}

type ScoreMap = Record<number, { e: number; s: number; w: number; n: number }>
type LineupMap = Record<string, { player1: string; player2: string }>

const WIND_KEYS = ["e", "s", "w", "n"] as const
const WIND_LETTERS = ["E", "S", "W", "N"] as const

export function computeStandings(scores: ScoreMap, lineups: LineupMap) {
  const teamMap: Record<string, TeamStanding> = {}
  const playerMap: Record<string, PlayerStanding> = {}

  summerSchedule.forEach((game) => {
    if (game.gameNumber > PRELIM_MAX_GAME) return
    const sc = scores[game.gameNumber]
    if (!sc) return

    const rankings = getRankings(sc) // { E: 1, S: 2, W: 3, N: 4 }

    game.teams.forEach((slot, idx) => {
      const wind = WIND_LETTERS[idx]
      const rawScore = sc[WIND_KEYS[idx]]
      const rank = rankings[wind]
      const pts = calculateFinalPoints(rawScore, rank)

      // --- Team accumulation ---
      if (!teamMap[slot.teamName]) {
        teamMap[slot.teamName] = {
          teamName: slot.teamName,
          points: 0,
          first: 0,
          second: 0,
          third: 0,
          fourth: 0,
          games: 0,
        }
      }
      const t = teamMap[slot.teamName]
      t.points += pts
      t.games += 1
      if (rank === 1) t.first += 1
      else if (rank === 2) t.second += 1
      else if (rank === 3) t.third += 1
      else t.fourth += 1

      // --- Player (MVP) accumulation via lineup ---
      // The key (team_game_playerNum) already identifies the exact roster player;
      // the resolved name is always stored in player1 (player2 is unused/null).
      const key = `${slot.teamName}_${game.gameNumber}_${slot.playerNum}`
      const lu = lineups[key]
      const playerName = lu ? lu.player1 || lu.player2 || "" : ""
      if (playerName) {
        if (!playerMap[playerName]) {
          playerMap[playerName] = {
            name: playerName,
            teamName: slot.teamName,
            points: 0,
            first: 0,
            second: 0,
            third: 0,
            fourth: 0,
            games: 0,
            highestRawScore: Number.NEGATIVE_INFINITY,
          }
        }
        const p = playerMap[playerName]
        p.points += pts
        p.games += 1
        if (rank === 1) p.first += 1
        else if (rank === 2) p.second += 1
        else if (rank === 3) p.third += 1
        else p.fourth += 1
        const actualRaw = rawScore * 100
        if (actualRaw > p.highestRawScore) p.highestRawScore = actualRaw
      }
    })
  })

  const sortFn = (a: TeamStanding | PlayerStanding, b: TeamStanding | PlayerStanding) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.first !== a.first) return b.first - a.first
    return a.second + a.third + a.fourth - (b.second + b.third + b.fourth)
  }

  const teams = Object.values(teamMap)
    .map((t) => ({ ...t, points: Math.round(t.points * 10) / 10 }))
    .sort(sortFn)

  const players = Object.values(playerMap)
    .map((p) => ({
      ...p,
      points: Math.round(p.points * 10) / 10,
      highestRawScore: p.highestRawScore === Number.NEGATIVE_INFINITY ? 0 : p.highestRawScore,
    }))
    .sort(sortFn)

  return { teams, players }
}

// Live hook: fetches scores + lineups and recomputes, polling every 30s.
// Falls back to static archived data if API is unavailable.
export function useSummerStandings() {
  const [scores, setScores] = useState<ScoreMap>({})
  const [lineups, setLineups] = useState<LineupMap>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const [sRes, lRes] = await Promise.all([
          fetch("/api/admin/game-scores", { cache: "no-store" }).catch(() => null),
          fetch("/api/summer-selection/lineups-display", { cache: "no-store" }).catch(() => null),
        ])
        
        // Extract scores from finalResults in schedule if API is unavailable
        if (!sRes || !sRes.ok) {
          const staticScores = extractScoresFromSchedule()
          if (active) {
            setScores(staticScores)
            setLoading(false)
          }
          return
        }

        if (!lRes || !lRes.ok) {
          const sData = await sRes.json()
          if (active) {
            setScores(sData.scores || {})
            setLoading(false)
          }
          return
        }

        const sData = await sRes.json()
        const lData = await lRes.json()
        if (!active) return
        setScores(sData.scores || {})
        setLineups(lData || {})
        setLoading(false)
      } catch (error) {
        console.log("[v0] API fetch failed, using static data", error)
        // Fallback to static data from schedule
        const staticScores = extractScoresFromSchedule()
        if (active) {
          setScores(staticScores)
          setLoading(false)
        }
      }
    }

    load()
    const id = setInterval(load, 30000)
    return () => {
      active = false
      clearInterval(id)
    }
  }, [])

  const { teams, players } = computeStandings(scores, lineups)
  return { teams, players, loading }
}

// Extract scores from the schedule's finalResults field
function extractScoresFromSchedule(): ScoreMap {
  const scores: ScoreMap = {}
  
  summerSchedule.forEach((game) => {
    if (game.finalResults && game.finalResults.length > 0) {
      const windMap: Record<string, number> = {}
      game.finalResults.forEach((result) => {
        const windKey = result.wind.toLowerCase() as 'e' | 's' | 'w' | 'n'
        windMap[windKey] = result.finalScore
      })
      
      // Only add if we have all 4 winds
      if (Object.keys(windMap).length === 4) {
        scores[game.gameNumber] = {
          e: windMap.e || 0,
          s: windMap.s || 0,
          w: windMap.w || 0,
          n: windMap.n || 0,
        }
        console.log("[v0] Extracted game", game.gameNumber, "scores:", scores[game.gameNumber])
      }
    }
  })
  
  console.log("[v0] Total extracted scores:", scores)
  return scores
}
