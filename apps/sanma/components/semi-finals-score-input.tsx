"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Trash2, Users } from "lucide-react"
import { semiFinalsSchedule, type SemiFinalsMatch, type GameKey, GAME_LABELS } from "@/lib/semi-finals-schedule"
import { teams } from "@/lib/team-data"
import { useSemiFinalsResults } from "@/lib/semi-finals-results-context"

interface PlayerScore {
  playerName: string
  teamName: string
  rawScore: number
  rawChips: number
  calculatedChips: number
  penalty: number
  penaltyReason: string
  finalChips: number
  rank: number | null
  yakumans: Array<{ types: string[]; photoUrl?: string }>
}

type GameResult = Record<GameKey, PlayerScore[]>

interface RoundLineup {
  [teamName: string]: string
}
interface MatchLineup {
  round1: RoundLineup
  round2: RoundLineup
}

const YAKUMAN_TYPES = [
  "國士無雙", "大三元", "四暗刻", "四暗刻單騎", "字一色", "綠一色",
  "小四喜", "大四喜", "清老頭", "九蓮寶燈", "四槓子", "天和", "地和", "萬和", "大車輪", "流局役滿", "累計役滿",
]

const ROUND1_KEYS: GameKey[] = ["r1g1", "r1g2", "r1g3"]
const ROUND2_KEYS: GameKey[] = ["r2g1", "r2g2", "r2g3"]

const createEmptyPlayer = (teamName: string = "", playerName: string = ""): PlayerScore => ({
  playerName,
  teamName,
  rawScore: undefined as any,
  rawChips: undefined as any,
  calculatedChips: 0,
  penalty: undefined as any,
  penaltyReason: "",
  finalChips: 0,
  rank: null,
  yakumans: [],
})

const emptyLineup = (teamNames: string[] = []): MatchLineup => ({
  round1: Object.fromEntries(teamNames.map((t) => [t, ""])),
  round2: Object.fromEntries(teamNames.map((t) => [t, ""])),
})

const emptyGameResult = (teamNames: string[], lineup: MatchLineup): GameResult => ({
  r1g1: teamNames.map((t) => createEmptyPlayer(t, lineup.round1[t] || "")),
  r1g2: teamNames.map((t) => createEmptyPlayer(t, lineup.round1[t] || "")),
  r1g3: teamNames.map((t) => createEmptyPlayer(t, lineup.round1[t] || "")),
  r2g1: teamNames.map((t) => createEmptyPlayer(t, lineup.round2[t] || "")),
  r2g2: teamNames.map((t) => createEmptyPlayer(t, lineup.round2[t] || "")),
  r2g3: teamNames.map((t) => createEmptyPlayer(t, lineup.round2[t] || "")),
})

interface SemiFinalsScoreInputProps {
  onClose?: () => void
}

export function SemiFinalsScoreInput({ onClose }: SemiFinalsScoreInputProps = {}) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<SemiFinalsMatch | null>(null)
  const [matchesForDate, setMatchesForDate] = useState<SemiFinalsMatch[]>([])
  const [lineups, setLineups] = useState<MatchLineup>({ round1: {}, round2: {} })
  const [gameResults, setGameResults] = useState<GameResult>({ r1g1: [], r1g2: [], r1g3: [], r2g1: [], r2g2: [], r2g3: [] })
  const [isSaving, setIsSaving] = useState(false)
  const [existingResults, setExistingResults] = useState<Record<string, any>>({})
  const [selectedRound, setSelectedRound] = useState<"round1" | "round2">("round1")
  const [showPreview, setShowPreview] = useState(false)

  const availableDates = [...new Set(semiFinalsSchedule.map((m) => m.date))].sort()

  // Use shared context for existing results
  const { results: sharedResults, refetch } = useSemiFinalsResults()
  useEffect(() => {
    if (Object.keys(sharedResults).length > 0) {
      setExistingResults(sharedResults)
    }
  }, [sharedResults])

  useEffect(() => {
    if (selectedDate) {
      setMatchesForDate(semiFinalsSchedule.filter((m) => m.date === selectedDate))
      setSelectedMatch(null)
    }
  }, [selectedDate])

  // Load lineup/results from shared context when match is selected
  useEffect(() => {
    if (!selectedMatch) return
    const existing = existingResults[selectedMatch.id]
    const lu = existing?.lineups || emptyLineup(selectedMatch.teams)
    setLineups(lu)
    
    // Always start with empty results for all 6 games
    const base = emptyGameResult(selectedMatch.teams, lu)
    
    if (existing?.results) {
      // Merge saved results over the empty base
      const merged = { ...base }
      Object.entries(existing.results).forEach(([gk, players]: [string, any]) => {
        if (Array.isArray(players) && players.length > 0) {
          merged[gk as GameKey] = players.map((p: PlayerScore) => ({
            ...p,
            playerName: p.playerName || lu[gk.startsWith("r1") ? "round1" : "round2"]?.[p.teamName] || "",
          }))
        }
      })
      setGameResults(merged)
    } else {
      setGameResults(base)
    }
  }, [selectedMatch, existingResults])

  const getTeamPlayers = (teamName: string) => {
    const team = teams.find((t) => t.name === teamName)
    return team?.players || []
  }

  // When lineup player changes, update player name across all games in that round
  const handleLineupChange = (round: "round1" | "round2", teamName: string, playerName: string) => {
    setLineups((prev) => ({
      ...prev,
      [round]: { ...prev[round], [teamName]: playerName },
    }))
    const roundKeys = round === "round1" ? ROUND1_KEYS : ROUND2_KEYS
    setGameResults((prev) => {
      const updated = { ...prev }
      roundKeys.forEach((gameKey) => {
        updated[gameKey] = (prev[gameKey] || []).map((p) =>
          p.teamName === teamName ? { ...p, playerName } : p
        )
      })
      return updated
    })
  }

  const recalcGame = (game: PlayerScore[]): PlayerScore[] => {
    // Check if all players have a valid score entered
    const allHaveScores = game.every((p) => typeof p.rawScore === "number")
    if (!allHaveScores) {
      // Not all scores entered yet, just return as-is
      return game
    }
    // Sort by rawScore only — penalty does NOT affect rank or chip calculation between players
    const sorted = [...game].sort((a, b) => (b.rawScore as number) - (a.rawScore as number))
    const chips: number[] = [0, 0, 0]
    const thirdScoreDiff = (sorted[2].rawScore as number) - 50
    chips[2] = Math.trunc(thirdScoreDiff / 4) - 5
    const secondScoreDiff = (sorted[1].rawScore as number) - 50
    chips[1] = Math.trunc(secondScoreDiff / 4)
    chips[0] = -(chips[1] + chips[2])
    return game.map((player) => {
      const sortedIdx = sorted.findIndex((p) => p.teamName === player.teamName)
      const calculatedChips = chips[sortedIdx]
      // penalty is added on top of finalChips only — does not affect calculatedChips or others
      const finalChips = calculatedChips + (player.rawChips ?? 0) + (player.penalty ?? 0)
      const rank = sortedIdx + 1
      return { ...player, calculatedChips, finalChips, rank }
    })
  }

  const handleScoreChange = (gameKey: GameKey, playerIndex: number, field: keyof PlayerScore, value: any) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const numValue = ["rawScore", "rawChips", "penalty"].includes(field as string) ? Number(value) : value
      game[playerIndex] = { ...game[playerIndex], [field]: numValue }
      return { ...prev, [gameKey]: recalcGame(game) }
    })
  }

  const handleAddYakuman = (gameKey: GameKey, playerIndex: number) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const player = game[playerIndex]
      game[playerIndex] = { ...player, yakumans: [...player.yakumans, { types: [], photoUrl: "" }] }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleRemoveYakuman = (gameKey: GameKey, playerIndex: number, yakumanIndex: number) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const yakumans = [...game[playerIndex].yakumans]
      yakumans.splice(yakumanIndex, 1)
      game[playerIndex] = { ...game[playerIndex], yakumans }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleYakumanTypeChange = (gameKey: GameKey, playerIndex: number, yakumanIndex: number, type: string) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const yakumans = [...game[playerIndex].yakumans]
      yakumans[yakumanIndex] = { ...yakumans[yakumanIndex], types: [type] }
      game[playerIndex] = { ...game[playerIndex], yakumans }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleYakumanPhotoUpload = (gameKey: GameKey, playerIndex: number, yakumanIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setGameResults((prev) => {
        const game = [...(prev[gameKey] || [])]
        const yakumans = [...game[playerIndex].yakumans]
        yakumans[yakumanIndex] = { ...yakumans[yakumanIndex], photoUrl: reader.result as string }
        game[playerIndex] = { ...game[playerIndex], yakumans }
        return { ...prev, [gameKey]: game }
      })
    }
    reader.readAsDataURL(file)
  }

  const handleConfirmSave = async () => {
    if (!selectedMatch) return
    setIsSaving(true)
    try {
      const matchKey = selectedMatch.id
      const roundKeys = selectedRound === "round1" ? ROUND1_KEYS : ROUND2_KEYS
      const roundResults: Partial<GameResult> = {}
      roundKeys.forEach((key) => { roundResults[key] = gameResults[key] })



      const response = await fetch("/api/semi-finals-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchKey, lineups, results: roundResults }),
      })
      const data = await response.json()
      if (data.success) {
        setShowPreview(false)
        alert(`${selectedRound === "round1" ? "首輪" : "次輪"}成績已保存！`)
        await refetch()
      } else {
        alert("保存失敗 Save failed: " + data.error)
      }
    } catch {
      alert("保存失敗，請重試")
    } finally {
      setIsSaving(false)
    }
  }

  // Copy lineup from round 1 to round 2
  const handleCopyLineupFromRound1 = () => {
    if (!selectedMatch) return
    const round1Lineup = lineups.round1
    // Update round 2 lineup
    setLineups((prev) => ({
      ...prev,
      round2: { ...round1Lineup },
    }))
    // Update player names in round 2 games
    setGameResults((prev) => {
      const updated = { ...prev }
      ROUND2_KEYS.forEach((key) => {
        updated[key] = (prev[key] || []).map((p) => ({
          ...p,
          playerName: round1Lineup[p.teamName] || "",
        }))
      })
      return updated
    })
  }

  // Inline player selector shown above the round's game inputs
  const renderLineupSelectors = (round: "round1" | "round2") => {
    if (!selectedMatch) return null
    const hasRound1Lineup = round === "round2" && Object.values(lineups.round1 || {}).some((v) => v)
    return (
      <div className="p-3 bg-muted/40 rounded-lg space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-muted-foreground">選手陣容 Lineup</p>
          {hasRound1Lineup && (
            <Button type="button" variant="outline" size="sm" onClick={handleCopyLineupFromRound1} className="h-6 text-xs">
              複製首輪陣容
            </Button>
          )}
        </div>
        {selectedMatch.teams.map((teamName) => {
          const teamPlayers = getTeamPlayers(teamName)
          return (
            <div key={`${round}-${teamName}`} className="flex items-center gap-3">
              <Badge variant="outline" className="w-28 shrink-0 justify-center text-xs">{teamName}</Badge>
              <Select
                value={lineups[round]?.[teamName] || ""}
                onValueChange={(playerName) => handleLineupChange(round, teamName, playerName)}
              >
                <SelectTrigger className="flex-1 h-8 text-sm">
                  <SelectValue placeholder="選擇選手..." />
                </SelectTrigger>
                <SelectContent>
                  {teamPlayers.map((player) => (
                    <SelectItem key={player.name} value={player.name}>
                      {player.name} {player.role ? `(${player.role})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        })}
      </div>
    )
  }

  const renderGameInput = (gameKey: GameKey) => {
    const game = gameResults[gameKey]
    if (!game || game.length === 0) return null
    return (
      <Card className="mt-3">
        <CardHeader className="py-2 px-4">
          <CardTitle className="text-sm">{GAME_LABELS[gameKey]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          {game.map((player, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted/50 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{player.teamName}</Badge>
                <span className="text-sm font-semibold text-foreground">
                  {player.playerName || <span className="text-muted-foreground italic">（請先選擇選手）</span>}
                </span>
                {player.rank && (
                  <Badge className={player.rank === 1 ? "bg-primary" : player.rank === 2 ? "bg-chart-2" : "bg-chart-3"}>
                    {player.rank}位
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">素點 Raw Score <span className="text-muted-foreground">(×1000)</span></Label>
                  <Input type="number" value={player.rawScore || ""} onChange={(e) => handleScoreChange(gameKey, index, "rawScore", e.target.value)} />
                </div>
                <div>
                  <Label className="text-xs">枚數調整 <span className="text-muted-foreground">(調整)</span></Label>
                  <Input type="number" value={player.rawChips || ""} onChange={(e) => handleScoreChange(gameKey, index, "rawChips", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">罰符 Penalty</Label>
                  <Input type="number" value={player.penalty || ""} onChange={(e) => handleScoreChange(gameKey, index, "penalty", e.target.value)} />
                </div>
                <div className="flex items-end">
                  <div className="w-full pt-2 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground text-xs">計算枚數: </span>
                        <span className={`font-medium ${player.calculatedChips >= 0 ? "text-chart-2" : "text-destructive"}`}>
                          {player.calculatedChips > 0 ? "+" : ""}{player.calculatedChips}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">最終枚數: </span>
                        <span className={`font-bold ${player.finalChips >= 0 ? "text-chart-2" : "text-destructive"}`}>
                          {player.finalChips > 0 ? "+" : ""}{player.finalChips}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {player.penalty !== 0 && (
                <div>
                  <Label className="text-xs">罰符原因</Label>
                  <Select value={player.penaltyReason || "none"} onValueChange={(v) => handleScoreChange(gameKey, index, "penaltyReason", v === "none" ? "" : v)}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="選擇原因" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">選擇原因</SelectItem>
                      <SelectItem value="遲到">遲到</SelectItem>
                      <SelectItem value="暴露張">暴露張</SelectItem>
                      <SelectItem value="錯和">錯和</SelectItem>
                      <SelectItem value="錯鳴">錯鳴</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">役滿 Yakuman</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => handleAddYakuman(gameKey, index)}>
                    <Plus className="w-3 h-3 mr-1" /> 添加役滿
                  </Button>
                </div>
                {player.yakumans.map((yakuman, yIdx) => (
                  <div key={yIdx} className="flex items-center gap-2 p-2 bg-background rounded">
                    <Select value={yakuman.types[0] || ""} onValueChange={(v) => handleYakumanTypeChange(gameKey, index, yIdx, v)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="選擇役滿" />
                      </SelectTrigger>
                      <SelectContent>
                        {YAKUMAN_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1">
                      <Input type="file" accept="image/*" onChange={(e) => handleYakumanPhotoUpload(gameKey, index, yIdx, e)} className="text-xs" />
                    </div>
                    {yakuman.photoUrl && <img src={yakuman.photoUrl} alt="Yakuman" className="w-10 h-10 object-cover rounded" />}
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveYakuman(gameKey, index, yIdx)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Validation summary */}
          {(() => {
            const totalRaw = game.reduce((s, p) => s + (p.rawScore || 0), 0)
            const totalFinal = game.reduce((s, p) => s + (p.finalChips || 0), 0)
            const rawOk = totalRaw === 150
            const finalOk = Math.abs(totalFinal) < 0.01
            return (
              <div className="px-4 pb-3 pt-1 bg-secondary/30 rounded-b-lg space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">素點總和:</span>
                  <span className={rawOk ? "text-chart-2 font-bold" : "text-destructive font-bold"}>
                    {totalRaw * 1000} {rawOk && "✓"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">最終枚數總和:</span>
                  <span className={finalOk ? "text-chart-2 font-bold" : "text-destructive font-bold"}>
                    {totalFinal.toFixed(1)} {finalOk && "✓"}
                  </span>
                </div>
                {!rawOk && <p className="text-xs text-destructive">素點總和必須為 150,000 (輸入150)</p>}
                {!finalOk && <p className="text-xs text-destructive">最終枚數總和必須為 0</p>}
              </div>
            )
          })()}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            準決賽 提交成績
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}><X className="w-4 h-4" /></Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Date Selection */}
        <div>
          <Label>選擇日期 Select Date</Label>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger>
              <SelectValue placeholder="選擇比賽日期..." />
            </SelectTrigger>
            <SelectContent>
              {availableDates.map((date) => {
                const match = semiFinalsSchedule.find((m) => m.date === date)
                const hasResults = Object.keys(existingResults).some((key) => key.startsWith(date))
                return (
                  <SelectItem key={date} value={date}>
                    {date} ({match?.dayOfWeek}) {hasResults ? "✓" : ""}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Match/Table Selection */}
        {matchesForDate.length > 0 && (
          <div>
            <Label>選擇桌次 Select Table</Label>
            <Select value={selectedMatch?.id || ""} onValueChange={(id) => setSelectedMatch(matchesForDate.find((m) => m.id === id) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇桌次..." />
              </SelectTrigger>
              <SelectContent>
                {matchesForDate.map((match) => {
                  const hasResults = !!existingResults[match.id]
                  return (
                    <SelectItem key={match.id} value={match.id}>
                      {match.table} {match.isLivestream ? "(直播桌)" : ""} — {match.teams.join(" vs ")} {hasResults ? "✓" : ""}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Round toggle + lineup selectors + game inputs */}
        {selectedMatch && !showPreview && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSelectedRound("round1")}
                className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${
                  selectedRound === "round1"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                首輪 (第1-3半莊)
              </button>
              <button
                onClick={() => setSelectedRound("round2")}
                className={`py-2 px-4 rounded-lg text-sm font-semibold border-2 transition-all ${
                  selectedRound === "round2"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                }`}
              >
                次輪 (第4-6半莊)
              </button>
            </div>

            {/* Inline lineup selectors for the selected round */}
            {renderLineupSelectors(selectedRound)}

            {/* Game inputs */}
            <div className="space-y-3">
              {(selectedRound === "round1" ? ROUND1_KEYS : ROUND2_KEYS).map((key) => renderGameInput(key))}
            </div>

            <Button onClick={() => setShowPreview(true)} className="w-full">
              預覽並提交 Preview &amp; Submit
            </Button>
          </div>
        )}

        {/* Preview Screen */}
        {selectedMatch && showPreview && (() => {
          const roundKeys = selectedRound === "round1" ? ROUND1_KEYS : ROUND2_KEYS
          const roundLabel = selectedRound === "round1" ? "首輪 (第1-3半莊)" : "次輪 (第4-6半莊)"
          const playerTotals: Record<string, number> = {}
          roundKeys.forEach((key) => {
            (gameResults[key] || []).forEach((p) => {
              const label = p.playerName || p.teamName
              playerTotals[label] = (playerTotals[label] || 0) + (p.finalChips || 0)
            })
          })
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-base font-bold">預覽成績 — {roundLabel}</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>返回修改</Button>
              </div>
              {roundKeys.map((key) => {
                const game = gameResults[key] || []
                // Rank by rawScore — penalty does not affect rank position
                const sorted = [...game].sort((a, b) => (b.rawScore ?? 0) - (a.rawScore ?? 0))
                return (
                  <div key={key} className="p-3 bg-muted/40 rounded-lg">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">{GAME_LABELS[key]}</p>
                    <div className="space-y-1">
                      {sorted.map((p, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${p.rank === 1 ? "bg-primary" : p.rank === 2 ? "bg-chart-2" : "bg-chart-3"}`}>{p.rank}</span>
                            <span>{p.playerName || p.teamName}</span>
                            <span className="text-muted-foreground text-xs">({p.teamName})</span>
                          </span>
                          <span className={`font-bold ${(p.finalChips || 0) >= 0 ? "text-chart-2" : "text-destructive"}`}>
                            {(p.finalChips || 0) > 0 ? "+" : ""}{p.finalChips || 0}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-xs font-semibold text-muted-foreground mb-2">本輪枚數合計 Round Total</p>
                <div className="space-y-1">
                  {Object.entries(playerTotals).sort(([, a], [, b]) => b - a).map(([name, total]) => (
                    <div key={name} className="flex justify-between text-sm font-medium">
                      <span>{name}</span>
                      <span className={total >= 0 ? "text-chart-2" : "text-destructive"}>
                        {total > 0 ? "+" : ""}{total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)} disabled={isSaving}>返回修改</Button>
                <Button onClick={handleConfirmSave} disabled={isSaving}>
                  {isSaving ? "保存中..." : "確認提交 Confirm"}
                </Button>
              </div>
            </div>
          )
        })()}
      </CardContent>
    </Card>
  )
}
