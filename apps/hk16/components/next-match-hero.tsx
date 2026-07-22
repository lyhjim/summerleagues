"use client"

import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getNextMatch, TEAMS, formatDateLabel } from "@/lib/schedule-data"

export function NextMatchHero() {
  const nextMatch = getNextMatch()

  if (!nextMatch) return null

  const { shortDate, dayEn } = formatDateLabel(nextMatch.date)

  return (
    <section className="relative border-b border-border bg-card overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, oklch(0.80 0.18 195) 0, oklch(0.80 0.18 195) 1px, transparent 0, transparent 50%)`,
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute inset-0 scanlines opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-5 bg-primary" />
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
            NEXT MATCH
          </h2>
          {nextMatch.status === "live" && (
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-2 py-1 bg-destructive text-white tracking-widest animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              LIVE NOW
            </span>
          )}
        </div>

        {/* Date display — day name inside brackets, no T1 badge */}
        <div className="flex items-baseline gap-2 mb-6">
          <span className="font-display text-5xl sm:text-6xl font-bold text-primary text-glow-cyan">
            {shortDate}
          </span>
          <span className="text-2xl sm:text-3xl font-mono text-muted-foreground">
            ({dayEn})
          </span>
        </div>

        {/* Teams row + Livestream button */}
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="grid grid-cols-4 gap-4 sm:gap-6">
            {nextMatch.teams.map((key, idx) => {
              const team = TEAMS[key]
              return (
                <Link
                  key={`${key}-${idx}`}
                  href={`/teams#${key}`}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div
                    className={cn(
                      "relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 transition-all",
                      "bg-card border-border group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10"
                    )}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 80px, 96px"
                      priority={idx === 0}
                    />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/60" />
                  </div>
                  <span className="text-sm font-sans font-medium text-foreground text-center leading-tight group-hover:text-primary transition-colors">
                    {team.name}
                  </span>
                </Link>
              )
            })}
          </div>

          {/* Livestream button */}
          <a
            href="https://www.youtube.com/@summermjhk"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm sm:text-base rounded-md transition-colors shadow-lg hover:shadow-amber-500/30"
          >
            {"觀看直播賽事"}
          </a>
        </div>

        {/* Match VOD banner */}
        <div className="mt-6">
          <a
            href="https://www.youtube.com/watch?v=DN8zkqYmu9A&t=11983s"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-sm overflow-hidden border border-border hover:border-primary/50 transition-colors group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/banners/2504-banner.png"
              alt="HKPM TWMJ 雲龍盃 25/04 SAT 19:00 - 點擊觀看直播回放"
              className="w-full object-cover transition-opacity group-hover:opacity-85"
            />
          </a>
        </div>
      </div>
    </section>
  )
}
