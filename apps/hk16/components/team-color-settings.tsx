"use client"

import { useState, useEffect } from "react"
import { Palette, Check } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { TEAMS } from "@/lib/schedule-data"
import { readTeamColors, writeTeamColors, type TeamColors } from "@/lib/team-colors-store"

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
]

export function TeamColorSettings() {
  const [colors, setColors] = useState<TeamColors>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setColors(readTeamColors())
  }, [])

  const handleColorChange = (teamName: string, color: string) => {
    setColors((prev) => ({ ...prev, [teamName]: color }))
    setSaved(false)
  }

  const handleSave = () => {
    writeTeamColors(colors)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <section>
      {/* Section header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-3 h-px bg-primary" />
          <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">TEAM SETTINGS</p>
        </div>
      </div>
      <h2 className="font-display text-xl font-bold tracking-tight text-foreground mb-6">
        {"隊伍顏色"}
        <span className="ml-3 text-xs font-mono text-muted-foreground font-normal">/ TEAM COLORS</span>
      </h2>

      <div className="border border-border bg-card p-5 space-y-6">
        {Object.entries(TEAMS).map(([key, team]) => {
          const currentColor = colors[team.name] || team.color

          return (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Team info */}
              <div className="flex items-center gap-3 min-w-[180px]">
                <div
                  className="relative w-10 h-10 rounded-full overflow-hidden border-2 shrink-0"
                  style={{ borderColor: currentColor }}
                >
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <span className="font-sans font-medium text-foreground">{team.name}</span>
              </div>

              {/* Color picker */}
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Preset colors */}
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleColorChange(team.name, preset)}
                    className={cn(
                      "w-6 h-6 rounded-sm border-2 transition-all hover:scale-110",
                      currentColor === preset
                        ? "border-white ring-1 ring-white/50"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}

                {/* Custom color input */}
                <div className="flex items-center gap-1.5 ml-2">
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) => handleColorChange(team.name, e.target.value)}
                    className="w-8 h-8 rounded-sm border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={currentColor}
                    onChange={(e) => handleColorChange(team.name, e.target.value)}
                    className="w-20 h-8 text-[10px] font-mono px-2 bg-secondary border border-border text-foreground focus:outline-none focus:border-primary/60"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Color preview bar */}
              <div
                className="h-2 w-full sm:w-24 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          )
        })}

        {/* Save button */}
        <div className="flex items-center gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={handleSave}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-[11px] font-mono tracking-widest font-semibold border transition-all",
              saved
                ? "bg-green-500/20 text-green-400 border-green-500/50"
                : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
            )}
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                SAVED
              </>
            ) : (
              <>
                <Palette className="w-3.5 h-3.5" />
                SAVE COLORS
              </>
            )}
          </button>
          {saved && (
            <span className="text-[10px] font-mono text-green-400/70">
              {"顏色已更新 // Colors updated"}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
