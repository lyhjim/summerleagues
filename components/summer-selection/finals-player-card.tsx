"use client"

import Image from "next/image"
import { useState } from "react"

interface FinalsPlayerCardProps {
  playerName: string
  teamName: string
  windChar: string // 東, 南, 西, 北
  rank: 1 | 2 | 3 | 4
  points: number
  rawScore: number
  photoUrl?: string
  penalty?: {
    score: number
    reason?: string
  }
  isFirstGame?: boolean
  hasScores?: boolean // Whether scores have been submitted
}

// Team color schemes for finals
const teamColorSchemes: Record<string, string> = {
  "鬼點子": "from-red-600 to-red-800",
  "層層疊": "from-orange-500 to-orange-700",
  "雙狙人": "from-emerald-600 to-emerald-800",
  "疾風勁草": "from-purple-600 to-purple-800",
}

const rankColors: Record<number, string> = {
  1: "bg-yellow-400 text-black font-bold",
  2: "bg-slate-300 text-black font-bold",
  3: "bg-orange-500 text-white font-bold",
  4: "bg-zinc-600 text-white font-bold",
}

const windPositions = {
  "東": "bottom-4 left-4",
  "南": "bottom-4 left-4",
  "西": "bottom-4 left-4",
  "北": "bottom-4 left-4",
}

export function FinalsPlayerCard({
  playerName,
  teamName,
  windChar,
  rank,
  points,
  rawScore,
  photoUrl,
  penalty,
  isFirstGame,
  hasScores = true,
}: FinalsPlayerCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Hide badges and scores when game hasn't been played: points === 0 AND no penalty AND rank is default 4
  const shouldShowStats = !(points === 0 && !penalty && rank === 4)

  const colorScheme = teamColorSchemes[teamName] || "from-slate-600 to-slate-800"
  const blurColor = {
    "鬼點子": "#7f1d1d",
    "層層疊": "#7c2d12",
    "雙狙人": "#064e3b",
    "疾風勁草": "#3f0f5c",
  }[teamName] || "#1f2937"

  const blurSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect fill="${blurColor}" width="300" height="300"/></svg>`
  const blurDataUrl = `data:image/svg+xml;base64,${btoa(blurSvg)}`

  return (
    <div
      className={`relative bg-gradient-to-br ${colorScheme} rounded-2xl overflow-hidden aspect-square group shadow-lg`}
    >
      {/* Rank Badge - Top Right Corner (only show if scores submitted) */}
      {shouldShowStats && (
        <div className="absolute top-3 right-3 z-20">
          <span
            className={`text-lg px-3 py-1 rounded-full ${rankColors[rank]}`}
          >
            {rank}位
          </span>
        </div>
      )}

      {/* Player Photo Background */}
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={playerName}
          width={300}
          height={300}
          priority={isFirstGame}
          loading={isFirstGame ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={blurDataUrl}
          className="w-full h-full object-cover object-[center_35%]"
          onLoad={() => setImageLoaded(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
      )}

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-75" />

      {/* Content Overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between">
        {/* Top-Left: Team Name and Player Name */}
        <div className="flex flex-col gap-1">
          {/* Team Name */}
          <p className="text-sm font-bold text-white/90 leading-tight">
            {teamName}
          </p>
          {/* Player Name */}
          <p className="text-lg font-bold text-white leading-tight">
            {playerName}
          </p>
        </div>

        {/* Bottom-Right: Score Display (only show if scores submitted) */}
        {shouldShowStats && (
          <div className="flex flex-col items-end gap-0.5">
            {/* Main Score - Large and Prominent */}
            <span
              className={`text-3xl font-black drop-shadow-lg ${
                points >= 0 ? "text-emerald-300" : "text-red-400"
              }`}
            >
              {points > 0 ? "+" : ""}{parseFloat(points.toFixed(1))}
            </span>

            {/* Penalty Info if exists - Below score */}
            {penalty && (
              <div className="text-right">
                <div className="text-xs font-bold text-red-300 drop-shadow-lg">
                  ({penalty.score > 0 ? "+" : ""}{penalty.score}
                  {penalty.reason && `, ${penalty.reason}`})
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wind Position Badge - Bottom Left */}
      <div className="absolute bottom-4 left-4 z-20 w-14 h-14 bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40 shadow-lg">
        <span className="text-white font-black text-xl drop-shadow-lg">
          {windChar}
        </span>
      </div>
    </div>
  )
}
