"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useSemiFinalsResults } from "@/lib/semi-finals-results-context"
import { useFinalsResults } from "@/lib/finals-results-context"
import { teams, type Team } from "@/lib/team-data"
import { TeamDetailsModal } from "@/components/team-details-modal"
import { getTopNineTeamsForSemiFinals, getArchivedPhaseTeamStats } from "@/lib/archived-phase-data"
import { FINALIST_TEAMS, FINALS_STARTING_CHIPS, TOTAL_FINALS_HANCHANS } from "@/lib/finals-schedule"

interface LeaderboardSectionProps {
  preloadedResults?: any[]
  isLoading?: boolean
}

// Calculate team stats from semi-finals results stored in Blob
function calculateSemiFinalsStats(semiFinalsResults: Record<string, any>) {
  const teamStats: Record<string, {
    chips: number
    hanChanPlayed: number
    firstPlaces: number
    secondPlaces: number
    thirdPlaces: number
    highestSingleGame: number
  }> = {}

  // Initialize stats for all 9 teams
  const topNine = getTopNineTeamsForSemiFinals()
  topNine.forEach((t) => {
    teamStats[t.name] = {
      chips: 0,
      hanChanPlayed: 0,
      firstPlaces: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
      highestSingleGame: 0,
    }
  })

  // Process each match result - track processed games to avoid duplicates
  const processedGames = new Set<string>()
  
  Object.entries(semiFinalsResults).forEach(([matchKey, matchData]: [string, any]) => {
    if (!matchData?.results) return
    const results = matchData.results as Record<string, any[]>
    
    // Process each game (r1g1, r1g2, r1g3, r2g1, r2g2, r2g3)
    Object.entries(results).forEach(([gameKey, gameResults]: [string, any[]]) => {
      if (!Array.isArray(gameResults)) return
      
      gameResults.forEach((player: any) => {
        if (!player?.teamName || !teamStats[player.teamName]) return
        
        // Skip if no actual score entered (use typeof to allow 0 as valid score)
        if (typeof player.rawScore !== "number") return
        
        // Deduplicate by unique game identifier
        const gameId = `${matchKey}-${gameKey}-${player.teamName}`
        if (processedGames.has(gameId)) return
        processedGames.add(gameId)
        
        const stats = teamStats[player.teamName]
        const finalChips = player.finalChips || 0
        
        stats.chips += finalChips
        stats.hanChanPlayed += 1
        
        if (player.rank === 1) stats.firstPlaces += 1
        else if (player.rank === 2) stats.secondPlaces += 1
        else if (player.rank === 3) stats.thirdPlaces += 1
        
        if (finalChips > stats.highestSingleGame) {
          stats.highestSingleGame = finalChips
        }
      })
    })
  })

  return teamStats
}

// Calculate team stats from finals results stored in Blob
function calculateFinalsStats(finalsResults: Record<string, any>) {
  const teamStats: Record<string, {
    chips: number
    hanChanPlayed: number
    firstPlaces: number
    secondPlaces: number
    thirdPlaces: number
  }> = {}

  // Initialize stats for 3 finalist teams
  FINALIST_TEAMS.forEach((name) => {
    teamStats[name] = {
      chips: 0,
      hanChanPlayed: 0,
      firstPlaces: 0,
      secondPlaces: 0,
      thirdPlaces: 0,
    }
  })

  const processedGames = new Set<string>()
  
  Object.entries(finalsResults).forEach(([matchKey, matchData]: [string, any]) => {
    if (!matchData?.results) return
    const results = matchData.results as Record<string, any[]>
    
    // Process each game (g1, g2, g3)
    Object.entries(results).forEach(([gameKey, gameResults]: [string, any[]]) => {
      if (!Array.isArray(gameResults)) return
      
      gameResults.forEach((player: any) => {
        if (!player?.teamName || !teamStats[player.teamName]) return
        if (typeof player.rawScore !== "number") return
        
        const gameId = `${matchKey}-${gameKey}-${player.teamName}`
        if (processedGames.has(gameId)) return
        processedGames.add(gameId)
        
        const stats = teamStats[player.teamName]
        stats.chips += player.finalChips || 0
        stats.hanChanPlayed += 1
        
        if (player.rank === 1) stats.firstPlaces += 1
        else if (player.rank === 2) stats.secondPlaces += 1
        else if (player.rank === 3) stats.thirdPlaces += 1
      })
    })
  })

  return teamStats
}

// 決賽: 3 teams with semi-finals carry-over chips
function buildFinalsLeaderboard(finalsResults: Record<string, any> = {}) {
  const finalsStats = calculateFinalsStats(finalsResults)

  const leaderboard = FINALIST_TEAMS
    .map((teamName) => {
      const team = teams.find((t) => t.name === teamName)
      const semiFinalsCarryOver = FINALS_STARTING_CHIPS[teamName] || 0  // 準決賽帶分
      const stats = finalsStats[teamName] || { chips: 0, hanChanPlayed: 0, firstPlaces: 0, secondPlaces: 0, thirdPlaces: 0 }
      const finalsChips = stats.chips                                   // 決賽枚數
      const totalChips = semiFinalsCarryOver + finalsChips              // 總枚數

      return {
        rank: 0,
        teamId: team?.id || 0,
        name: teamName,
        semiFinalsCarryOver,  // 準決賽帶分
        finalsChips,          // 決賽枚數
        maisuu: totalChips,   // 總枚數
        hanChanPlayed: stats.hanChanPlayed,
        firstPlaces: stats.firstPlaces,
        secondPlaces: stats.secondPlaces,
        thirdPlaces: stats.thirdPlaces,
        hanChanTotal: TOTAL_FINALS_HANCHANS,
        championGap: 0,       // 冠軍差
      }
    })
    .sort((a, b) => b.maisuu - a.maisuu)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  // 冠軍差: 1st place = 0, others = negative diff from 1st
  if (leaderboard.length > 0) {
    const firstPlaceChips = leaderboard[0].maisuu
    return leaderboard.map((item) => ({
      ...item,
      championGap: item.maisuu - firstPlaceChips,
    }))
  }

  return leaderboard
}

// 準決賽: 9 teams with confirmed starting 枚數, track semi-finals chips separately
function buildSemiFinalsLeaderboard(semiFinalsResults: Record<string, any> = {}) {
  const topNine = getTopNineTeamsForSemiFinals()
  const semiFinalsStats = calculateSemiFinalsStats(semiFinalsResults)

  const leaderboard = topNine
    .map((teamData) => {
      const team = teams.find((t) => t.name === teamData.name)
      const startingChips = teamData.initialSemiFinalsScore  // 初賽帶分
      const stats = semiFinalsStats[teamData.name] || { chips: 0, hanChanPlayed: 0, firstPlaces: 0, secondPlaces: 0, thirdPlaces: 0, highestSingleGame: 0 }
      const semiFinalsChips = stats.chips                    // 準決賽枚數
      const totalChips = startingChips + semiFinalsChips     // 總枚數

      return {
        rank: 0,
        teamId: team?.id || 0,
        name: teamData.name,
        startingChips,       // 初賽帶分
        semiFinalsChips,     // 準決賽枚數
        maisuu: totalChips,  // 總枚數 (used for sorting/gap)
        shinkyu: totalChips,
        hanChanPlayed: stats.hanChanPlayed,
        firstPlaces: stats.firstPlaces,
        secondPlaces: stats.secondPlaces,
        thirdPlaces: stats.thirdPlaces,
        highestSingleGame: stats.highestSingleGame,
        hanChanTotal: 48,
        trend: "same" as const,
        advancementGap: 0,
      }
    })
    .sort((a, b) => b.maisuu - a.maisuu)
    .map((item, index) => ({ ...item, rank: index + 1 }))

  // 晉級差: rank 3 = 0, rank 1 & 2 = positive diff above rank 3, rank 4-9 = negative diff below rank 3
  if (leaderboard.length >= 3) {
    const thirdPlaceChips = leaderboard[2].maisuu
    return leaderboard.map((item) => ({
      ...item,
      advancementGap: item.rank === 3 ? 0 : item.maisuu - thirdPlaceChips,
    }))
  }

  return leaderboard
}

// 初賽: all 15 teams with real static stats
function buildPreliminaryLeaderboard() {
  const stats = getArchivedPhaseTeamStats()
  return stats.map((stat, index) => {
    const team = teams.find((t) => t.name === stat.name)
    return {
      rank: index + 1,
      teamId: team?.id || 0,
      maisuu: stat.maisuu,
      hanChanPlayed: stat.hanChanPlayed,
      firstPlaces: stat.firstPlaces,
      secondPlaces: stat.secondPlaces,
      thirdPlaces: stat.thirdPlaces,
      highestSingleGame: stat.highestSingleGame,
      hanChanTotal: 126,
      trend: "same" as const,
    }
  })
}

export function LeaderboardSection({ preloadedResults }: LeaderboardSectionProps = {}) {
  const { t } = useLanguage()
  const [phase, setPhase] = useState<"preliminary" | "semifinal" | "finals">("finals")
  const [semiFinalsResults, setSemiFinalsResults] = useState<Record<string, any>>({})
  const [finalsResults, setFinalsResults] = useState<Record<string, any>>({})
  const [selectedTeam, setSelectedTeam] = useState<{
    team: Team
    rank: number
    maisuu: number
    shinkyu: number
    hanChanPlayed: number
    hanChanTotal: number
    firstPlaces: number
    secondPlaces: number
    thirdPlaces: number
    highestSingleGame: number
  } | null>(null)

  // Use shared semi-finals results from context
  const { results: sharedSemiFinalsResults } = useSemiFinalsResults()
  useEffect(() => {
    if (Object.keys(sharedSemiFinalsResults).length > 0) {
      setSemiFinalsResults(sharedSemiFinalsResults)
    }
  }, [sharedSemiFinalsResults])

  // Use shared finals results from context
  const { results: sharedFinalsResults } = useFinalsResults()
  useEffect(() => {
    if (Object.keys(sharedFinalsResults).length > 0) {
      setFinalsResults(sharedFinalsResults)
    }
  }, [sharedFinalsResults])

  const leaderboardData = phase === "preliminary" 
    ? buildPreliminaryLeaderboard() 
    : phase === "semifinal"
    ? buildSemiFinalsLeaderboard(semiFinalsResults)
    : buildFinalsLeaderboard(finalsResults)

  // For 初賽: highlight top 9 (qualified). For 準決賽: highlight top 3 (finals). For 決賽: highlight 1st (champion).
  const qualifiedCutoff = phase === "preliminary" ? 9 : phase === "semifinal" ? 3 : 1
  const thirdPlaceMaisuu = leaderboardData.find((d) => d.rank === qualifiedCutoff)?.maisuu || 0

  const handleTeamClick = (teamData: (typeof leaderboardData)[0]) => {
    const team = teams.find((t) => t.id === teamData.teamId)
    if (team) {
      setSelectedTeam({
        team,
        rank: teamData.rank,
        maisuu: teamData.maisuu,
        shinkyu: (teamData as any).shinkyu || teamData.maisuu,
        hanChanPlayed: teamData.hanChanPlayed,
        hanChanTotal: teamData.hanChanTotal,
        firstPlaces: teamData.firstPlaces,
        secondPlaces: teamData.secondPlaces,
        thirdPlaces: teamData.thirdPlaces,
        highestSingleGame: (teamData as any).highestSingleGame || 0,
      })
    }
  }

  const getRankBoxColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white"
    if (rank === 2) return "bg-gray-400 text-white"
    if (rank === 3) return "bg-amber-700 text-white"
    if (phase === "preliminary" && rank <= 9) return "bg-green-600 text-white"
    return "bg-gray-500 text-white"
  }

  return (
    <>
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-2xl font-bold text-foreground">{t.teamStandings}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {phase === "preliminary" ? (t.firstStage || "初賽階段") : phase === "semifinal" ? (t.stageTwo || "準決賽階段") : "決賽階段"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPhase("preliminary")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  phase === "preliminary"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                {t.preliminaryPhase || "初賽"}
              </button>
              <button
                onClick={() => setPhase("semifinal")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  phase === "semifinal"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                {t.semiFinals || "準決賽"}
              </button>
              <button
                onClick={() => setPhase("finals")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  phase === "finals"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:bg-accent/50"
                }`}
              >
                決賽
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            {/* Column headers — different for each phase */}
            {phase === "finals" ? (
              <div className="grid grid-cols-[40px_1fr_40px_40px_32px] sm:grid-cols-[45px_minmax(120px,1fr)_60px_60px_60px_55px_40px_40px_40px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <div>{t.rank}</div>
                <div>{t.team}</div>
                <div className="text-right">總枚數</div>
                <div className="text-right sm:hidden">決賽</div>
                <div className="text-right sm:hidden text-[10px]">半莊</div>
                <div className="text-right hidden sm:block">準決賽帶分</div>
                <div className="text-right hidden sm:block">決賽枚數</div>
                <div className="text-right hidden sm:block">{t.hanChan}</div>
                <div className="text-right hidden sm:block">{t.first}</div>
                <div className="text-right hidden sm:block">{t.second}</div>
                <div className="text-right hidden sm:block">{t.third}</div>
              </div>
            ) : phase === "semifinal" ? (
              <div className="grid grid-cols-[40px_1fr_55px] sm:grid-cols-[45px_minmax(120px,1fr)_60px_60px_60px_55px_60px_40px_40px_40px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <div>{t.rank}</div>
                <div>{t.team}</div>
                <div className="text-right">總枚數</div>
                <div className="text-right hidden sm:block">初賽帶分</div>
                <div className="text-right hidden sm:block">準決賽枚數</div>
                <div className="text-right hidden sm:block">晉級差</div>
                <div className="text-right hidden sm:block">{t.hanChan}</div>
                <div className="text-right hidden sm:block">{t.first}</div>
                <div className="text-right hidden sm:block">{t.second}</div>
                <div className="text-right hidden sm:block">{t.third}</div>
              </div>
            ) : (
              <div className="grid grid-cols-[40px_1fr_60px] sm:grid-cols-[45px_minmax(120px,1fr)_65px_60px_70px_45px_45px_45px] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                <div>{t.rank}</div>
                <div>{t.team}</div>
                <div className="text-right">{t.maisuu}</div>
                <div className="text-right hidden sm:block">{t.qualificationGap}</div>
                <div className="text-right hidden sm:block">{t.hanChan}</div>
                <div className="text-right hidden sm:block">{t.first}</div>
                <div className="text-right hidden sm:block">{t.second}</div>
                <div className="text-right hidden sm:block">{t.third}</div>
              </div>
            )}

            {leaderboardData.map((teamData) => {
              const team = teams.find((t) => t.id === teamData.teamId)
              if (!team) return null

              const qualificationGap = teamData.maisuu - thirdPlaceMaisuu
              const isFinals = phase === "finals"
              const isSemiFinal = phase === "semifinal"
              const data = teamData as any

              return isFinals ? (
                <div
                  key={teamData.teamId}
                  onClick={() => handleTeamClick(teamData)}
                  className="grid grid-cols-[40px_1fr_40px_40px_32px] sm:grid-cols-[45px_minmax(120px,1fr)_60px_60px_60px_55px_40px_40px_40px] gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className={`text-xs sm:text-sm font-bold px-1.5 py-0.5 rounded ${getRankBoxColor(teamData.rank)}`}>
                      {teamData.rank}
                    </span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    {team.logo ? (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden shrink-0 bg-background border border-border sm:border-2">
                        <img src={team.logo || "/placeholder.svg"} alt={team.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: team.color + "33" }}>
                        <span className="text-xs sm:text-sm font-bold" style={{ color: team.color }}>{team.name[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-[11px] sm:text-sm font-medium text-foreground truncate">{team.name}</p>
                    </div>
                  </div>

                  {/* 總枚數 */}
                  <div className="flex items-center justify-end">
                    <span className={`text-xs sm:text-sm font-bold ${teamData.maisuu >= 0 ? "text-chart-2" : "text-destructive"}`}>
                      {teamData.maisuu > 0 ? "+" : ""}{teamData.maisuu}
                    </span>
                  </div>

                  {/* 決賽 (finals chips - mobile) */}
                  <div className="flex sm:hidden items-center justify-end">
                    <span className={`text-xs font-medium ${data.finalsChips > 0 ? "text-chart-2" : data.finalsChips < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {data.finalsChips > 0 ? "+" : ""}{data.finalsChips}
                    </span>
                  </div>

                  {/* 半莊 (mobile) */}
                  <div className="flex sm:hidden items-center justify-end">
                    <span className="text-xs text-foreground">{teamData.hanChanPlayed}/{teamData.hanChanTotal}</span>
                  </div>

                  {/* 準決賽帶分 (desktop only) */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className={`text-xs font-medium ${data.semiFinalsCarryOver >= 0 ? "text-foreground" : "text-destructive"}`}>
                      {data.semiFinalsCarryOver > 0 ? "+" : ""}{data.semiFinalsCarryOver}
                    </span>
                  </div>

                  {/* 決賽枚數 (desktop only) */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className={`text-xs font-medium ${data.finalsChips > 0 ? "text-chart-2" : data.finalsChips < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {data.finalsChips === 0 ? "—" : (data.finalsChips > 0 ? "+" : "") + data.finalsChips}
                    </span>
                  </div>

                  {/* 半莊數 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs text-foreground">{teamData.hanChanPlayed}/{teamData.hanChanTotal}</span>
                  </div>

                  {/* 一位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.firstPlaces}</span>
                  </div>

                  {/* 二位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.secondPlaces}</span>
                  </div>

                  {/* 三位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.thirdPlaces}</span>
                  </div>
                </div>
              ) : isSemiFinal ? (
                <div
                  key={teamData.teamId}
                  onClick={() => handleTeamClick(teamData)}
                  className="grid grid-cols-[40px_1fr_55px] sm:grid-cols-[45px_minmax(120px,1fr)_60px_60px_60px_55px_60px_40px_40px_40px] gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  {/* Rank */}
                  <div className="flex items-center">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getRankBoxColor(teamData.rank)}`}>
                      {teamData.rank}
                    </span>
                  </div>

                  {/* Team */}
                  <div className="flex items-center gap-2 min-w-0">
                    {team.logo ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-background border-2 border-border">
                        <img src={team.logo || "/placeholder.svg"} alt={team.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: team.color + "33" }}>
                        <span className="text-xs sm:text-sm font-bold" style={{ color: team.color }}>{team.name[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{team.name}</p>
                    </div>
                  </div>

                  {/* 總枚數 */}
                  <div className="flex items-center justify-end">
                    <span className={`text-xs sm:text-sm font-bold ${teamData.maisuu >= 0 ? "text-chart-2" : "text-destructive"}`}>
                      {teamData.maisuu > 0 ? "+" : ""}{teamData.maisuu}
                    </span>
                  </div>

                  {/* 初賽帶分 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className={`text-xs font-medium ${data.startingChips >= 0 ? "text-foreground" : "text-destructive"}`}>
                      {data.startingChips > 0 ? "+" : ""}{data.startingChips}
                    </span>
                  </div>

                  {/* 準決賽枚數 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className={`text-xs font-medium ${data.semiFinalsChips > 0 ? "text-chart-2" : data.semiFinalsChips < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {data.semiFinalsChips === 0 ? "—" : (data.semiFinalsChips > 0 ? "+" : "") + data.semiFinalsChips}
                    </span>
                  </div>

                  {/* 晉級差 */}
                  <div className="hidden sm:flex items-center justify-end">
                    {data.advancementGap === 0 ? (
                      <span className="text-xs font-medium text-muted-foreground">0</span>
                    ) : data.advancementGap > 0 ? (
                      <span className="text-xs font-medium text-chart-2">+{data.advancementGap}</span>
                    ) : (
                      <span className="text-xs font-medium text-destructive">{data.advancementGap}</span>
                    )}
                  </div>

                  {/* 半莊數 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs text-foreground">{teamData.hanChanPlayed}/{teamData.hanChanTotal}</span>
                  </div>

                  {/* 一位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.firstPlaces}</span>
                  </div>

                  {/* 二位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.secondPlaces}</span>
                  </div>

                  {/* 三位 */}
                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-xs font-medium text-foreground">{teamData.thirdPlaces}</span>
                  </div>
                </div>
              ) : (
                <div
                  key={teamData.teamId}
                  onClick={() => handleTeamClick(teamData)}
                  className={`grid grid-cols-[40px_1fr_60px] sm:grid-cols-[45px_minmax(120px,1fr)_65px_60px_70px_45px_45px_45px] gap-2 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer ${
                    teamData.rank <= 9 ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className={`text-sm font-bold px-2 py-0.5 rounded ${getRankBoxColor(teamData.rank)}`}>
                      {teamData.rank}
                    </span>
                    <span className="hidden sm:inline">
                      {(teamData as any).trend === "up" && <TrendingUp className="w-3 h-3 text-chart-2" />}
                      {(teamData as any).trend === "down" && <TrendingDown className="w-3 h-3 text-destructive" />}
                      {(teamData as any).trend === "same" && <Minus className="w-3 h-3 text-muted-foreground" />}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 min-w-0">
                    {team.logo ? (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 bg-background border-2 border-border">
                        <img src={team.logo || "/placeholder.svg"} alt={team.name} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: team.color + "33" }}>
                        <span className="text-xs sm:text-sm font-bold" style={{ color: team.color }}>{team.name[0]}</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{team.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <span className={`text-xs sm:text-sm font-bold ${teamData.maisuu >= 0 ? "text-chart-2" : "text-destructive"}`}>
                      {teamData.maisuu > 0 ? "+" : ""}{teamData.maisuu}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className={`text-xs font-medium ${qualificationGap > 0 ? "text-chart-2" : qualificationGap < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {qualificationGap > 0 ? "+" : ""}{qualificationGap}
                    </span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm text-foreground">{teamData.hanChanPlayed}/{teamData.hanChanTotal}</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{teamData.firstPlaces}</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{teamData.secondPlaces}</span>
                  </div>

                  <div className="hidden sm:flex items-center justify-end">
                    <span className="text-sm font-medium text-foreground">{teamData.thirdPlaces}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <TeamDetailsModal
        team={selectedTeam?.team || null}
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        rank={selectedTeam?.rank}
        maisuu={selectedTeam?.maisuu}
        shinkyu={selectedTeam?.shinkyu}
        hanChanPlayed={selectedTeam?.hanChanPlayed}
        hanChanTotal={selectedTeam?.hanChanTotal}
        firstPlaces={selectedTeam?.firstPlaces}
        secondPlaces={selectedTeam?.secondPlaces}
        thirdPlaces={selectedTeam?.thirdPlaces}
        highestSingleGame={selectedTeam?.highestSingleGame}
      />
    </>
  )
}
