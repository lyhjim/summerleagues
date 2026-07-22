"use client"

import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { schedule, teamLogos, type MatchDay, type Match } from "@/components/schedule-data"

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
  rounds: unknown[]
}

// Rank badge colours
const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-orange-500 text-white",
  4: "bg-zinc-600 text-white",
}

// Normalize team names for matching
const teamNameMap: Record<string, string> = {
  "壞拍子": "Bad Beat",
  "Bad Beat": "Bad Beat",
}

function normalizeTeamName(teamName: string): string {
  return teamNameMap[teamName] || teamName
}

function LiveMatchCard({ scheduleMatch, apiMatches }: {
  scheduleMatch: Match
  apiMatches: ApiMatch[]
}) {
  // Find the api match whose players include all 4 teams
  const apiMatch = apiMatches.find(m =>
    scheduleMatch.teams.every(t => {
      const normalizedScheduleTeam = normalizeTeamName(t)
      return m.players.some(p => {
        const normalizedApiTeam = normalizeTeamName(p.team)
        return normalizedScheduleTeam === normalizedApiTeam
      })
    })
  )

  const winnerTeam = apiMatch?.players.find(p => p.rank === 1)?.team

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">
        第 {scheduleMatch.table} 桌
      </div>
      <div className="grid grid-cols-2 gap-2">
        {scheduleMatch.teams.map((team) => {
          const info = teamLogos[team]
          const isWinner = apiMatch && team === winnerTeam
          const playerResult = apiMatch?.players.find(p => p.team === team)
          const rank = playerResult?.rank
          const points = playerResult?.points
          const penaltyPoints = playerResult?.penaltyPoints
          const penaltyReason = playerResult?.penaltyReason

          return (
            <div
              key={team}
              className={`relative flex flex-col items-center gap-1.5 rounded-lg px-2 py-3 border transition-colors ${
                isWinner
                  ? "border-yellow-400/40 bg-yellow-400/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {/* Rank badge */}
              {rank && (
                <span className={`absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${rankColors[rank]}`}>
                  {rank}位
                </span>
              )}
              {info ? (
                  <Image
                    src={info.logo}
                    alt={team}
                    width={64}
                    height={64}
                    className="team-logo object-contain w-16 h-16"
                  />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                  {team[0]}
                </div>
              )}
              <span className={`text-[11px] font-bold text-center leading-tight ${isWinner ? "text-yellow-300" : !apiMatch ? "text-white" : "text-foreground/60"}`}>
                {team}
              </span>
              {points !== undefined && (
                <div className="flex flex-col items-center gap-0.5">
                  <span className={`text-[11px] font-bold ${points >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {points > 0 ? "+" : ""}{points.toFixed(1)}
                  </span>
                  {penaltyPoints && penaltyReason && (
                    <span className="text-[9px] text-red-400">({penaltyPoints > 0 ? "+" : ""}{penaltyPoints.toFixed(1)} +{penaltyReason})</span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      {apiMatch && (
        <div className="mt-1 text-right">
          <Link
            href={`/matches/${apiMatch.date}-${apiMatch.matchday}-t${scheduleMatch.table}`}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            查看詳情 →
          </Link>
        </div>
      )}
    </div>
  )
}

function MatchDayCard({ day, label, apiMatches }: {
  day: MatchDay
  label: string
  apiMatches: ApiMatch[]
}) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-card/60 backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${day.completed ? "bg-muted-foreground" : "bg-primary animate-pulse"}`} />
          <span className="text-xs font-bold text-primary tracking-widest uppercase">{label}</span>
          <span className="font-bold text-base">{day.date}（{day.day}）</span>
          <span className="text-xs text-muted-foreground font-mono border border-white/10 px-2 py-0.5 rounded-full">
            第 {day.round} 節
          </span>
        </div>
        <span className="text-sm text-muted-foreground font-mono">19:30</span>
      </div>

      <div className="px-5 py-4 grid md:grid-cols-2 gap-6">
        {day.matches.map((match, mi) => (
          <LiveMatchCard key={mi} scheduleMatch={match} apiMatches={apiMatches} />
        ))}
      </div>
    </div>
  )
}



export function MatchSchedule() {
  const [apiMatches, setApiMatches] = useState<ApiMatch[]>([])

  useEffect(() => {
    fetch("https://majhong-supreme.web.app/api/league/matches")
      .then(r => r.json())
      .then(d => setApiMatches(d.matches || []))
      .catch(() => {})
  }, [])

  // Determine which schedule days have results
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

  const completedCount = daysWithResults.length
  const lastCompleted = lastCompletedIdx >= 0 ? schedule[lastCompletedIdx] : null
  const nextUpcoming = schedule[lastCompletedIdx + 1] ?? null

  return (
    <section className="py-16 px-4" id="schedule">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-1 bg-primary rounded-full" />
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wider uppercase text-foreground">
            賽程表
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
          <span className="text-xs text-muted-foreground border border-primary/30 px-3 py-1 rounded-full font-mono">
            已完成 {completedCount * 2} / 56 半莊
          </span>
        </div>

        <div className="space-y-4">
          {lastCompleted && (
            <MatchDayCard day={lastCompleted} label="上輪賽果" apiMatches={apiMatches} />
          )}
          {nextUpcoming && (
            <MatchDayCard day={nextUpcoming} label="下輪賽事" apiMatches={apiMatches} />
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-semibold transition-colors border border-primary/30 px-5 py-2 rounded-full hover:bg-primary/10"
          >
            查看賽程 <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// Re-export for backward compatibility
export { teamLogos, schedule, type MatchDay, type Match } from "@/components/schedule-data"
