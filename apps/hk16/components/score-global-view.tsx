"use client"

import { useState, useEffect } from "react"
import { Trash2, Save, Edit2, X, Database } from "lucide-react"
import { cn } from "@/lib/utils"
import { readResults, writeResult, deleteResult, SCORES_KEY, type RoundResult } from "@/lib/scores-store"
import { formatDateLabel } from "@/lib/schedule-data"

export function ScoreGlobalView() {
  const [results, setResults] = useState<RoundResult[]>([])
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editScores, setEditScores] = useState<Record<string, number>>({})

  // Load results and listen for changes
  useEffect(() => {
    const refresh = () => {
      const data = readResults()
      // Sort by date then round
      data.sort((a, b) => {
        const dateCompare = a.matchDate.localeCompare(b.matchDate)
        if (dateCompare !== 0) return dateCompare
        return a.round - b.round
      })
      setResults(data)
    }
    refresh()
    window.addEventListener("storage", refresh)
    return () => window.removeEventListener("storage", refresh)
  }, [])

  const getKey = (r: RoundResult) => `${r.matchId}-R${r.round}`

  const startEdit = (r: RoundResult) => {
    const key = getKey(r)
    setEditingKey(key)
    const scores: Record<string, number> = {}
    r.scores.forEach((s) => {
      scores[s.playerName] = s.rawPts
    })
    setEditScores(scores)
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditScores({})
  }

  const saveEdit = (r: RoundResult) => {
    const updatedResult: RoundResult = {
      ...r,
      scores: r.scores.map((s) => ({
        ...s,
        rawPts: editScores[s.playerName] ?? s.rawPts,
      })),
      submittedAt: Date.now(),
    }
    writeResult(updatedResult)
    cancelEdit()
  }

  const handleDelete = (r: RoundResult) => {
    if (confirm(`Delete scores for ${r.matchId.toUpperCase()}-R${r.round}?`)) {
      deleteResult(r.matchId, r.round)
    }
  }

  if (results.length === 0) {
    return (
      <section className="scroll-mt-20">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-3 h-px bg-primary" />
            <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">
              DATA OVERVIEW
            </p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {"所有成績"}
            <span className="ml-3 text-sm font-mono text-muted-foreground font-normal">
              / ALL SCORES
            </span>
          </h2>
        </div>

        <div className="border border-border p-8 text-center">
          <Database className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-mono text-muted-foreground">{"暫無數據 / NO DATA YET"}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="scroll-mt-20">
      {/* Section header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-3 h-px bg-primary" />
          <p className="text-[10px] font-mono tracking-[0.3em] text-primary/70 uppercase">
            DATA OVERVIEW
          </p>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {"所有成績"}
          <span className="ml-3 text-sm font-mono text-muted-foreground font-normal">
            / ALL SCORES
          </span>
        </h2>
      </div>

      {/* Results table */}
      <div
        className="border border-border relative overflow-hidden"
        style={{ boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.4)" }}
      >
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 pointer-events-none z-10" />
        <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 pointer-events-none z-10" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/80 border-b border-border text-[10px] font-mono tracking-widest text-muted-foreground">
                <th className="px-4 py-3 text-left">MATCH</th>
                <th className="px-4 py-3 text-left">DATE</th>
                <th className="px-4 py-3 text-center">ROUND</th>
                <th className="px-4 py-3 text-left">PLAYER 1</th>
                <th className="px-4 py-3 text-left">PLAYER 2</th>
                <th className="px-4 py-3 text-left">PLAYER 3</th>
                <th className="px-4 py-3 text-left">PLAYER 4</th>
                <th className="px-4 py-3 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {results.map((r) => {
                const key = getKey(r)
                const isEditing = editingKey === key
                const { shortDate, dayEn } = formatDateLabel(r.matchDate)

                return (
                  <tr key={key} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">
                      {r.matchId.toUpperCase()}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {shortDate} ({dayEn})
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500 text-black rounded-sm">
                        R{r.round}
                      </span>
                    </td>
                    {r.scores.map((s, idx) => (
                      <td key={idx} className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {s.playerName}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 truncate">
                            {s.team}
                          </span>
                          {isEditing ? (
                            <input
                              type="number"
                              value={editScores[s.playerName] ?? s.rawPts}
                              onChange={(e) =>
                                setEditScores((prev) => ({
                                  ...prev,
                                  [s.playerName]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className={cn(
                                "w-20 h-7 bg-secondary border text-xs font-mono text-right px-2 focus:outline-none transition-colors tabular-nums mt-1",
                                (editScores[s.playerName] ?? s.rawPts) >= 0
                                  ? "text-green-400 border-green-500/40"
                                  : "text-red-400 border-red-500/40"
                              )}
                            />
                          ) : (
                            <span
                              className={cn(
                                "text-sm font-mono font-bold tabular-nums",
                                s.rawPts >= 0 ? "text-green-400" : "text-red-400"
                              )}
                            >
                              {s.rawPts >= 0 ? `+${s.rawPts}` : s.rawPts}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                    {/* Pad empty cells if less than 4 players */}
                    {Array.from({ length: 4 - r.scores.length }).map((_, idx) => (
                      <td key={`empty-${idx}`} className="px-4 py-3">
                        <span className="text-muted-foreground/30">-</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(r)}
                              className="p-1.5 text-green-400 hover:bg-green-500/10 transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-muted-foreground hover:bg-secondary transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(r)}
                              className="p-1.5 text-primary hover:bg-primary/10 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(r)}
                              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Footer with count */}
        <div className="px-4 py-2 bg-secondary/50 border-t border-border text-[10px] font-mono text-muted-foreground">
          {results.length} {"record(s)"}
        </div>
      </div>
    </section>
  )
}
