'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { teamsData, type Team } from '@/lib/teams-data'

interface TeamDetailModalProps {
  teamId: string | null
  onClose: () => void
}

interface LeagueMatch {
  matchday: number
  round: string
  date: string
  players: Array<{
    name: string
    team: string
    seat: string
    finalScore: number
    rank: 1 | 2 | 3 | 4
    points: number
  }>
}

interface PlayerStats {
  name: string
  team: string
  points: number
  matches: number
  first: number
  second: number
  third: number
  fourth: number
  highestGameRawScore: number
  avgRank: number
  totalRank: number
  highestRank: number
  rankSum: number
}

async function fetchMatches(): Promise<LeagueMatch[]> {
  try {
    const response = await fetch("https://majhong-supreme.web.app/api/league/matches", {
      next: { revalidate: 60 },
    })
    if (!response.ok) return []
    const data = await response.json()
    return data.matches || []
  } catch {
    return []
  }
}

function calculatePlayerStats(matches: LeagueMatch[]): PlayerStats[] {
  const statsMap: Record<string, any> = {}

  matches.forEach(match => {
    match.players.forEach(player => {
      if (!statsMap[player.name]) {
        statsMap[player.name] = {
          name: player.name,
          team: player.team,
          points: 0,
          matches: 0,
          first: 0,
          second: 0,
          third: 0,
          fourth: 0,
          highestGameRawScore: 0,
          rankSum: 0,
        }
      }
      
      statsMap[player.name].points += player.points
      statsMap[player.name].matches += 1
      statsMap[player.name].rankSum += player.rank
      statsMap[player.name].highestGameRawScore = Math.max(statsMap[player.name].highestGameRawScore, player.finalScore || 0)
      
      switch (player.rank) {
        case 1: statsMap[player.name].first += 1; break
        case 2: statsMap[player.name].second += 1; break
        case 3: statsMap[player.name].third += 1; break
        case 4: statsMap[player.name].fourth += 1; break
      }
    })
  })

  const stats = Object.values(statsMap).map((s: any) => ({
    ...s,
    points: Math.round(s.points * 10) / 10,
    avgRank: s.matches > 0 ? Math.round((s.rankSum / s.matches) * 100) / 100 : 0,
    totalRank: 0,
    highestRank: 0,
  }))

  // Calculate global ranks across all players
  const sortedByTotal = [...stats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.first !== a.first) return b.first - a.first
    return (a.second + a.third + a.fourth) - (b.second + b.third + b.fourth)
  })

  const sortedByHighest = [...stats].sort((a, b) => {
    if (b.highestGameRawScore !== a.highestGameRawScore) return b.highestGameRawScore - a.highestGameRawScore
    return b.points - a.points
  })

  sortedByTotal.forEach((p, i) => {
    stats.find(s => s.name === p.name).totalRank = i + 1
  })

  sortedByHighest.forEach((p, i) => {
    stats.find(s => s.name === p.name).highestRank = i + 1
  })

  return stats
}

export function TeamDetailModal({ teamId, onClose }: TeamDetailModalProps) {
  const [playerStats, setPlayerStats] = useState<Record<string, PlayerStats>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!teamId) return

    const loadStats = async () => {
      try {
        const matches = await fetchMatches()
        const team = teamsData[teamId]
        if (team) {
          const allStats = calculatePlayerStats(matches)
          // Filter to only team members - check both chineseName and englishName
          const teamStats = allStats.filter(s => 
            s.team === team.chineseName || 
            s.team === team.englishName ||
            (team.chineseName === "壞拍子" && s.team === "Bad Beat") ||
            (team.englishName === "Bad Beat" && s.team === "壞拍子")
          )
          const statsMap = Object.fromEntries(teamStats.map(s => [s.name, s]))
          setPlayerStats(statsMap)
        }
      } catch (error) {
        console.error("Error loading player stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [teamId])

  if (!teamId || !teamsData[teamId]) return null

  const team = teamsData[teamId]

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-background border border-white/20 rounded-lg shadow-2xl max-w-4xl w-full my-8">
        {/* Header with Logo and Close Button */}
        <div className="flex items-start justify-between p-6 border-b border-white/10 sticky top-0 bg-background/95 backdrop-blur">
          <div className="flex items-center gap-4">
            {team.logo && (
              <div className="w-14 h-14 relative flex-shrink-0">
                <Image
                  src={team.logo}
                  alt={team.chineseName}
                  width={56}
                  height={56}
                  className="object-contain"
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">{team.chineseName}</h2>
              {team.englishName && (
                <p className="text-sm text-muted-foreground">{team.englishName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Team Description */}
          {team.teamIntro && (
            <div className="border border-white/10 rounded-lg p-6 bg-white/5">
              <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">{team.teamIntro}</p>
            </div>
          )}

          {/* Supervisor */}
          {team.supervisor && (
            <div className="border border-white/10 rounded-lg p-6 bg-white/5">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">監督</h3>
              <div className="flex gap-6">
                {team.supervisor.photoUrl && (
                  <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 bg-white/5">
                    <Image
                      src={team.supervisor.photoUrl}
                      alt={team.supervisor.name}
                      width={128}
                      height={160}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-lg text-white mb-3">{team.supervisor.name}</p>
                  <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">{team.supervisor.intro}</p>
                </div>
              </div>
            </div>
          )}

          {/* Players */}
          <div className="space-y-6">
            {team.players.map((player, idx) => {
              const stats = playerStats[player.name]
              return (
                <div key={idx} className="border border-white/10 rounded-lg p-6 bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Player Photo - Left */}
                    {player.photoUrl && (
                      <div className="w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden border border-white/20 bg-white/5 mx-auto md:mx-0">
                        <Image
                          src={player.photoUrl}
                          alt={player.name}
                          width={128}
                          height={160}
                          className="w-full h-full object-cover object-top"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Player Info - Right on desktop, full width on mobile */}
                    <div className="flex-1">
                      <div className="mb-4">
                        <p className="font-bold text-lg text-white mb-2">{player.name}</p>
                        <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-line">{player.intro}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid - Below photo on all sizes */}
                  {!loading && stats && (
                    <div className="grid grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
                      {/* Total Score */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">累計積分</div>
                        <div className="font-bold text-white text-lg">{stats.points}</div>
                        <div className="text-xs text-primary">#{stats.totalRank}</div>
                      </div>

                      {/* Games Played */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">場數</div>
                        <div className="font-bold text-white text-lg">{stats.matches}</div>
                      </div>

                      {/* Highest Score */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">最高分半莊</div>
                        <div className="font-bold text-white text-lg">{stats.highestGameRawScore.toLocaleString()}</div>
                        <div className="text-xs text-primary">#{stats.highestRank}</div>
                      </div>

                      {/* Average Rank */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">平均順位</div>
                        <div className="font-bold text-white text-lg">{stats.avgRank}</div>
                      </div>

                      {/* 1st Place */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">1位</div>
                        <div className="font-bold text-yellow-300 text-lg">{stats.first}</div>
                      </div>

                      {/* 2nd Place */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">2位</div>
                        <div className="font-bold text-slate-300 text-lg">{stats.second}</div>
                      </div>

                      {/* 3rd Place */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">3位</div>
                        <div className="font-bold text-orange-400 text-lg">{stats.third}</div>
                      </div>

                      {/* 4th Place */}
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">4位</div>
                        <div className="font-bold text-muted-foreground text-lg">{stats.fourth}</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
