"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { teamLogos } from "./schedule-data"
import { teamsData } from "@/lib/teams-data"
import { useGameLineups } from "@/lib/game-lineups"
import { teamBlurColors } from "@/lib/image-utils"

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-orange-500 text-white",
  4: "bg-zinc-600 text-white",
}

// Team colors for backgrounds
const teamColorSchemes: Record<string, { gradient: string }> = {
  "天月麻雀": { gradient: "from-purple-600 to-purple-800" },
  "狂戰士": { gradient: "from-red-600 to-red-800" },
  "壞拍子": { gradient: "from-yellow-500 to-yellow-700" },
  "Bad Beat": { gradient: "from-yellow-500 to-yellow-700" },
  "牌道": { gradient: "from-blue-600 to-blue-800" },
  "易和團": { gradient: "from-green-600 to-green-800" },
  "愚形上等": { gradient: "from-orange-500 to-orange-700" },
  "錦鯉咪好勁": { gradient: "from-pink-600 to-pink-800" },
  "御無礼": { gradient: "from-indigo-600 to-indigo-800" },
}

function SimpleGameCard({
  team,
  windChar,
}: {
  team: string
  windChar: string
}) {
  const colorScheme = teamColorSchemes[team] || teamColorSchemes["易和團"]
  const teamLogo = teamLogos[team]?.logo

  return (
    <div className={`relative bg-gradient-to-br ${colorScheme.gradient} rounded-lg overflow-hidden aspect-square flex flex-col items-center justify-center`}>
      {/* Wind Position Badge */}
      <div className="absolute bottom-2 left-2 z-10 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
        <span className="text-white font-black text-lg drop-shadow-lg">{windChar}</span>
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60" />

      {/* Team Name and Logo */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-3 h-full">
        {teamLogo && (
          <Image
            src={teamLogo}
            alt={team}
            width={48}
            height={48}
            className="w-12 h-12 object-contain drop-shadow-lg"
          />
        )}
        <span className="text-lg font-bold text-white text-center px-2">{team}</span>
      </div>
    </div>
  )
}

function PlayerCard({
  team,
  playerData,
  windChar,
  rank,
  assignedPlayer,
  isFirstGame,
  apiMatch,
}: {
  team: string
  playerData?: ApiPlayer
  windChar: string
  rank?: 1 | 2 | 3 | 4
  assignedPlayer?: string
  isFirstGame?: boolean
  apiMatch?: ApiMatch
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Get player data from teamsData
  let playerPhoto: string | undefined
  let playerName: string | undefined
  
  // First check if there's an assigned player for upcoming games
  if (assignedPlayer) {
    const teamEntry = Object.values(teamsData).find(t => 
      t.chineseName === team || 
      (team === "Bad Beat" && t.chineseName === "壞拍子")
    )
    if (teamEntry) {
      const player = teamEntry.players.find(p => p.name === assignedPlayer)
      if (player) {
        playerPhoto = player.photoUrl
        playerName = player.name
      }
    }
  } else if (playerData?.name) {
    // Otherwise use API data for completed games
    const teamEntry = Object.values(teamsData).find(t => 
      t.chineseName === team || 
      (team === "Bad Beat" && t.chineseName === "壞拍子")
    )
    
    if (teamEntry) {
      const player = teamEntry.players.find(p => p.name === playerData.name)
      if (player) {
        playerPhoto = player.photoUrl
        playerName = player.name
      }
    }
  }

  const colorScheme = teamColorSchemes[team] || teamColorSchemes["易和團"]
  const fallbackBg = Object.values(teamsData).find(t => 
    t.chineseName === team || 
    (team === "Bad Beat" && t.chineseName === "壞拍子")
  )?.teamPhoto
  
  // Get blur placeholder color for this team
  const blurColor = teamBlurColors[team] || "#1f2937"
  const blurSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="${blurColor}" width="200" height="200"/></svg>`
  const blurDataUrl = `data:image/svg+xml;base64,${btoa(blurSvg)}`

  return (
    <div className={`relative bg-gradient-to-br ${colorScheme.gradient} rounded-lg overflow-hidden aspect-square group`}>
      {/* Rank Badge - Top Right Corner */}
      {rank && (
        <div className="absolute top-2 right-2 z-10">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${rankColors[rank]}`}>
            {rank}位
          </span>
        </div>
      )}

      {/* Wind Position Badge */}
      <div className="absolute bottom-2 left-2 z-10 w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
        <span className="text-white font-black text-lg drop-shadow-lg">{windChar}</span>
      </div>

      {/* Player Photo or Team Photo Background */}
      {playerPhoto ? (
        <Image
          src={playerPhoto}
          alt={playerName || team}
          width={200}
          height={200}
          priority={isFirstGame}
          loading={isFirstGame ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={blurDataUrl}
          className="w-full h-full object-cover object-top"
          onLoad={() => setImageLoaded(true)}
        />
      ) : fallbackBg ? (
        <Image
          src={fallbackBg}
          alt={team}
          width={200}
          height={200}
          priority={isFirstGame}
          loading={isFirstGame ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={blurDataUrl}
          className="w-full h-full object-cover object-top opacity-50"
          onLoad={() => setImageLoaded(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800" />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-3 flex flex-col justify-end">
        {/* Bottom Left: Team and Player Info (above wind badge) */}
        <div className="space-y-1 pb-16">
          {/* Team and Player Info */}
          <div>
            <p className="text-xs text-gray-200 font-semibold">{team}</p>
            {playerName && (
              <p className="text-sm text-white font-bold leading-tight">{playerName}</p>
            )}
          </div>
        </div>

        {/* Bottom Right: Score with shadow background */}
        {playerData?.points !== undefined && (
          <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
            <div className="flex flex-col items-end gap-0.5">
              <span className={`text-sm font-bold ${playerData.points >= 0 ? "text-green-300" : "text-red-300"}`}>
                {playerData.points > 0 ? "+" : ""}{playerData.points.toFixed(1)}
              </span>
              {apiMatch && playerData && (
                (() => {
                  const penalty = apiMatch.penalties?.find(
                    p => p.playerName === playerData.name && p.teamName === normalizeTeamName(team)
                  )
                  return penalty ? (
                    <span className="text-[9px] text-red-300">({penalty.points > 0 ? "+" : ""}{penalty.points}, {penalty.reason})</span>
                  ) : null
                })()
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const windPositions = ["東", "南", "西", "北"]

interface ApiPlayer {
  name: string
  team: string
  seat: string
  finalScore: number
  rank: 1 | 2 | 3 | 4
  points: number
  penaltyPoints?: number
  penaltyReason?: string
}

interface ApiMatch {
  matchday: number
  round: string
  date: string
  players: ApiPlayer[]
}

interface ScheduleMatch {
  table: number
  teams: [string, string, string, string]
}

interface MatchDay {
  date: string
  day: string
  round: number
  matches: ScheduleMatch[]
  completed?: boolean
}

function normalizeTeamName(teamName: string): string {
  const teamNameMap: Record<string, string> = {
    "壞拍子": "Bad Beat",
    "Bad Beat": "Bad Beat",
  }
  return teamNameMap[teamName] || teamName
}

function FeaturedGameCard({ 
  scheduleDay, 
  scheduleMatch, 
  apiMatch,
  matchNumber,
  isCompleted,
  assignedPlayers,
  isFirstGame,
  canShowLineups,
}: {
  scheduleDay: MatchDay
  scheduleMatch: ScheduleMatch
  apiMatch?: ApiMatch
  matchNumber: number
  isCompleted: boolean
  assignedPlayers?: Record<string, string>
  isFirstGame?: boolean
  canShowLineups?: boolean
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCompleted ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"}`}>
            {isCompleted ? "已完成" : "即將進行"} Game {matchNumber}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{scheduleDay.date}（{scheduleDay.day}）</span>
        </div>
        {isCompleted && apiMatch && (
          <Link
            href={`/matches/${apiMatch?.matchday}`}
            className="text-[10px] text-primary hover:underline font-semibold"
          >
            詳情 →
          </Link>
        )}
      </div>

      {/* 2x2 Game Grid */}
      <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
        {scheduleMatch.teams.map((team, idx) => {
          const windChar = windPositions[idx]
          
          if (isCompleted) {
            // Show player card for completed games
            const playerData = apiMatch?.players.find(p => {
              const normalizedApiTeam = normalizeTeamName(p.team)
              const normalizedScheduleTeam = normalizeTeamName(team)
              return normalizedApiTeam === normalizedScheduleTeam
            })
            const rank = playerData?.rank

            return (
              <PlayerCard
                key={`${team}-${idx}`}
                team={team}
                playerData={playerData}
                windChar={windChar}
                rank={rank}
                isFirstGame={isFirstGame && idx === 0}
                apiMatch={apiMatch}
              />
            )
          } else {
            // Show card for upcoming games
            const normalizedTeam = normalizeTeamName(team)
            const assignedPlayer = canShowLineups ? (assignedPlayers?.[team] || assignedPlayers?.[normalizedTeam]) : undefined
            
            if (assignedPlayer) {
              // Show player card with assigned player (only if lineups can be shown)
              return (
                <PlayerCard
                  key={`${team}-${idx}`}
                  team={team}
                  windChar={windChar}
                  assignedPlayer={assignedPlayer}
                  isFirstGame={isFirstGame && idx === 0}
                />
              )
            } else {
              // Show simple team-only card
              return (
                <SimpleGameCard
                  key={`${team}-${idx}`}
                  team={team}
                  windChar={windChar}
                />
              )
            }
          }
        })}
      </div>
    </div>
  )
}

export function FeaturedGames({ schedule }: {
  schedule: MatchDay[]
}) {
  const [apiMatches, setApiMatches] = useState<ApiMatch[]>([])
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const gameLineups = useGameLineups()

  useEffect(() => {
    fetch("https://majhong-supreme.web.app/api/league/matches")
      .then(r => r.json())
      .then(d => setApiMatches(d.matches || []))
      .catch(() => {})
  }, [])

  // Update time every minute to handle 3am cutoff and Sunday 22:00 visibility
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  // Check if lineups should be visible (after Sunday 22:00 HKT)
  const canShowLineups = (() => {
    const hktTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }))
    const dayOfWeek = hktTime.getDay() // 0 = Sunday, 1 = Monday, etc.
    const hour = hktTime.getHours()
    const minute = hktTime.getMinutes()
    
    // Show lineups after Sunday 22:00 (10pm)
    // Sunday 22:00 or later
    const isSunday = dayOfWeek === 0
    const isSundayAfter22 = isSunday && (hour > 22 || (hour === 22 && minute >= 0))
    
    return isSundayAfter22
  })()

  // Calculate last completed index
  const daysWithResults = schedule.filter(day =>
    day.matches.some(m =>
      apiMatches.some(am =>
        m.teams.every(t => {
          const normalizedScheduleTeam = normalizeTeamName(t)
          return am.players.some(p => {
            const normalizedApiTeam = normalizeTeamName(p.team)
            return normalizedScheduleTeam === normalizedApiTeam
          })
        })
      )
    )
  )

  const lastCompletedIdx = daysWithResults.length > 0
    ? schedule.findLastIndex(day =>
        day.matches.some(m =>
          apiMatches.some(am =>
            m.teams.every(t => {
              const normalizedScheduleTeam = normalizeTeamName(t)
              return am.players.some(p => {
                const normalizedApiTeam = normalizeTeamName(p.team)
                return normalizedScheduleTeam === normalizedApiTeam
              })
            })
          )
        )
      )
    : -1

  // Check if it's after 3am HKT - if so, rotate games
  const hktTime = new Date(currentTime.toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }))
  const isAfter3amHKT = hktTime.getHours() >= 3

  // Determine which games to show in latest results and next matches
  let latestResultsIdx = lastCompletedIdx
  let nextMatchIdx = lastCompletedIdx + 1

  // If it's after 3am HKT and we have completed games, shift to show next set
  if (isAfter3amHKT && lastCompletedIdx >= 1) {
    latestResultsIdx = lastCompletedIdx
    nextMatchIdx = lastCompletedIdx + 1
  }

  // Get latest 2 completed games
  const latestTwoGames = []
  if (latestResultsIdx >= 0) {
    const day = schedule[latestResultsIdx]
    for (let j = Math.min(1, day.matches.length - 1); j >= 0 && latestTwoGames.length < 2; j--) {
      const match = day.matches[j]
      const matchday = latestResultsIdx * 2 + j + 1
      const apiMatch = apiMatches.find(m => m.matchday === matchday)
      if (apiMatch) {
        latestTwoGames.unshift({ day, match, matchday, apiMatch })
      }
    }
  }

  // Get next 2 games
  const nextTwoGames = []
  if (nextMatchIdx < schedule.length) {
    const day = schedule[nextMatchIdx]
    for (let j = 0; j < Math.min(2, day.matches.length) && nextTwoGames.length < 2; j++) {
      const match = day.matches[j]
      const matchday = nextMatchIdx * 2 + j + 1
      const apiMatch = apiMatches.find(m => m.matchday === matchday)
      const gameLineup = gameLineups.find(l => l.gameNumber === matchday)
      
      // Normalize lineup team names from Chinese to English for proper lookup
      let normalizedLineup = gameLineup
      if (gameLineup?.players) {
        const normalizedPlayers: Record<string, string> = {}
        Object.entries(gameLineup.players).forEach(([teamName, playerName]) => {
          // Only normalize Bad Beat from Chinese to English (it's the only team using English name)
          if (teamName === "壞拍子") {
            normalizedPlayers["Bad Beat"] = playerName
          } else {
            normalizedPlayers[teamName] = playerName
          }
        })
        normalizedLineup = { ...gameLineup, players: normalizedPlayers }
      }
      
      nextTwoGames.push({ day, match, matchday, apiMatch, gameLineup: normalizedLineup })
    }
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto max-w-6xl space-y-12">
        {/* Latest Results Section */}
        {latestTwoGames.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
                最近賽果
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {latestTwoGames.map((game, idx) => (
                <FeaturedGameCard
                  key={`${game.day.date}-${game.match.table}`}
                  scheduleDay={game.day}
                  scheduleMatch={game.match}
                  apiMatch={game.apiMatch}
                  matchNumber={game.matchday}
                  isCompleted={true}
                  isFirstGame={idx === 0}
                />
              ))}
            </div>
          </div>
        )}

        {/* Next Match Section */}
        {nextTwoGames.length > 0 && (
          <div>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
                下場賽事
              </h2>
              <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {nextTwoGames.map((game, idx) => (
                <FeaturedGameCard
                  key={`${game.day.date}-${game.match.table}`}
                  scheduleDay={game.day}
                  scheduleMatch={game.match}
                  apiMatch={game.apiMatch}
                  matchNumber={game.matchday}
                  isCompleted={false}
                  assignedPlayers={game.gameLineup?.players}
                  isFirstGame={idx === 0}
                  canShowLineups={canShowLineups}
                />
              ))}
            </div>

            {/* View Full Schedule Button */}
            <div className="text-center mt-8">
              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 border border-white/20 text-foreground hover:bg-white/10 font-bold px-6 py-3 rounded-lg transition-colors text-base"
              >
                查看賽程
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
