"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Calendar, ArrowRight } from "lucide-react"
import { TEAMS, FULL_SCHEDULE, formatDateLabel, getUpcomingMatches, type MatchCard } from "@/lib/schedule-data"

// Seat order for R1: 東南西北 (indices 0,1,2,3)
// Seat order for R2: 南東北西 (swap 東↔南, 西↔北) => indices 1,0,3,2
const SEAT_LABELS_R1 = ["東", "南", "西", "北"]
const SEAT_ORDER_R1 = [0, 1, 2, 3]
const SEAT_LABELS_R2 = ["南", "東", "北", "西"]
const SEAT_ORDER_R2 = [1, 0, 3, 2]

function MatchCardItem({ match, round }: { match: MatchCard; round: 1 | 2 }) {
  const seatLabels = round === 1 ? SEAT_LABELS_R1 : SEAT_LABELS_R2
  const seatOrder = round === 1 ? SEAT_ORDER_R1 : SEAT_ORDER_R2

  return (
    <div className={cn(
      "relative bg-card border border-border rounded-sm p-5 flex flex-col gap-4 panel-corners flex-1",
      "hover:border-primary/30 transition-colors"
    )}>
      {/* Scanline */}
      <div className="absolute inset-0 scanlines opacity-20 rounded-sm pointer-events-none" />

      {/* Header row with round badge and live status */}
      <div className="flex items-center justify-between">
        {/* Round badge */}
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-amber-500 text-black tracking-widest">
          R{round}
        </span>

        {/* Live badge — only shown when live */}
        {match.status === "live" && (
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm bg-destructive text-white tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {"LIVE"}
          </span>
        )}
      </div>

      {/* Teams row — 4 seats */}
      <div className="grid grid-cols-4 gap-2">
        {seatOrder.map((teamIdx, displayIdx) => {
          const key = match.teams[teamIdx]
          const team = TEAMS[key]
          const isWinner = match.status === "completed" && match.winner === key
          const isFaded = match.status === "completed" && match.winner && match.winner !== key

          return (
            <div key={`${key}-${displayIdx}`} className="flex flex-col items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-mono tracking-widest text-primary font-bold uppercase">
                {seatLabels[displayIdx]}
              </span>
              <div className={cn(
                "relative w-14 h-14 rounded-full overflow-hidden border-2 transition-colors shrink-0",
                isWinner ? "border-rank-gold ring-2 ring-rank-gold/30" : "border-border",
                isFaded && "opacity-40 grayscale"
              )}>
                <Image
                  src={team.logo}
                  alt={team.name}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <span className={cn(
                "text-sm font-sans text-center leading-tight w-full truncate px-1 font-medium",
                isFaded ? "text-muted-foreground/50" : "text-foreground"
              )}>
                {team.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function WeeklySchedule() {
  // Get only 4 upcoming matches
  const upcomingMatches = getUpcomingMatches(4)
  
  // Group by date
  const groupedByDate = upcomingMatches.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = []
    acc[match.date].push(match)
    return acc
  }, {} as Record<string, MatchCard[]>)

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 bg-primary" />
          <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
            {"本周賽程"}
          </h2>
          <span className="text-xs font-mono text-muted-foreground">/ WEEKLY SCHEDULE</span>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {Object.entries(groupedByDate).map(([date, matches]) => {
          const { dateTimeFull } = formatDateLabel(date)
          return (
            <div key={date}>
              {/* Day header */}
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-sm font-mono font-bold tracking-widest text-primary">
                  {dateTimeFull}
                </span>
                <div className="flex-1 h-px bg-border ml-2" />
              </div>

              {/* R1 and R2 cards side by side */}
              <div className="flex flex-col gap-4">
                {matches.map((match) => (
                  <div key={match.id} className="flex flex-col sm:flex-row gap-4">
                    <MatchCardItem match={match} round={1} />
                    <MatchCardItem match={match} round={2} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* See All Schedule button */}
      <div className="mt-8 flex justify-center">
        <Link
          href="/schedule"
          className={cn(
            "group flex items-center gap-2 px-6 py-3",
            "text-sm font-mono font-semibold tracking-widest text-primary",
            "border border-primary/50 hover:border-primary hover:bg-primary/5",
            "transition-all duration-200"
          )}
        >
          SEE ALL SCHEDULE
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  )
}
