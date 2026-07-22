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
import { finalsSchedule, type FinalsMatch, type FinalsGameKey } from "@/lib/finals-schedule"
import { teams } from "@/lib/team-data"
import { useFinalsResults } from "@/lib/finals-results-context"

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

type GameResult = Record<FinalsGameKey, PlayerScore[]>

interface RoundLineup {
  [teamName: string]: string
}
interface MatchLineup {
  r1: RoundLineup
  r2: RoundLineup
  r3: RoundLineup
  r4: RoundLineup
  r5: RoundLineup
  r6: RoundLineup
  r7: RoundLineup
  r8: RoundLineup
}

const YAKUMAN_TYPES = [
  "國士無雙", "大三元", "四暗刻", "四暗刻單騎", "字一色", "綠一色",
  "小四喜", "大四喜", "清老頭", "九蓮寶燈", "四槓子", "天和", "地和", "萬和", "大車輪", "流局役滿", "累計役滿",
]

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
  r1: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r2: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r3: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r4: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r5: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r6: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r7: Object.fromEntries(teamNames.map((t) => [t, ""])),
  r8: Object.fromEntries(teamNames.map((t) => [t, ""])),
})

const emptyGameResult = (teamNames: string[], lineup: MatchLineup): GameResult => ({
  r1g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r1[t] || "")),
  r1g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r1[t] || "")),
  r1g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r1[t] || "")),
  r2g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r2[t] || "")),
  r2g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r2[t] || "")),
  r2g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r2[t] || "")),
  r3g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r3[t] || "")),
  r3g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r3[t] || "")),
  r3g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r3[t] || "")),
  r4g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r4[t] || "")),
  r4g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r4[t] || "")),
  r4g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r4[t] || "")),
  r5g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r5?.[t] || "")),
  r5g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r5?.[t] || "")),
  r5g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r5?.[t] || "")),
  r6g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r6?.[t] || "")),
  r6g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r6?.[t] || "")),
  r6g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r6?.[t] || "")),
  r7g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r7?.[t] || "")),
  r7g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r7?.[t] || "")),
  r7g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r7?.[t] || "")),
  r8g1: teamNames.map((t) => createEmptyPlayer(t, lineup.r8?.[t] || "")),
  r8g2: teamNames.map((t) => createEmptyPlayer(t, lineup.r8?.[t] || "")),
  r8g3: teamNames.map((t) => createEmptyPlayer(t, lineup.r8?.[t] || "")),
})

const GAME_LABELS: Record<FinalsGameKey, string> = {
  r1g1: "第1半莊",
  r1g2: "第2半莊",
  r1g3: "第3半莊",
  r2g1: "第1半莊",
  r2g2: "第2半莊",
  r2g3: "第3半莊",
  r3g1: "第1半莊",
  r3g2: "第2半莊",
  r3g3: "第3半莊",
  r4g1: "第1半莊",
  r4g2: "第2半莊",
  r4g3: "第3半莊",
}

interface FinalsScoreInputProps {
  onClose?: () => void
}

export function FinalsScoreInput({ onClose }: FinalsScoreInputProps = {}) {
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<FinalsMatch | null>(null)
  const [matchesForDate, setMatchesForDate] = useState<FinalsMatch[]>([])
  const [lineups, setLineups] = useState<MatchLineup>({ r1: {}, r2: {}, r3: {}, r4: {}, r5: {}, r6: {}, r7: {}, r8: {} })
  const [gameResults, setGameResults] = useState<GameResult>({
    r1g1: [], r1g2: [], r1g3: [],
    r2g1: [], r2g2: [], r2g3: [],
    r3g1: [], r3g2: [], r3g3: [],
    r4g1: [], r4g2: [], r4g3: [],
    r5g1: [], r5g2: [], r5g3: [],
    r6g1: [], r6g2: [], r6g3: [],
    r7g1: [], r7g2: [], r7g3: [],
    r8g1: [], r8g2: [], r8g3: [],
  })
  const [isSaving, setIsSaving] = useState(false)
  const [existingResults, setExistingResults] = useState<Record<string, any>>({})
  const [selectedRound, setSelectedRound] = useState<"r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8">("r1")
  const [showPreview, setShowPreview] = useState(false)

  const getAvailableRounds = (): ("r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8")[] => {
    if (!selectedMatch) return []
    const date = selectedMatch.date
    if (date === "2026-06-03") return ["r1", "r2"]
    if (date === "2026-06-05") return ["r3", "r4"]
    if (date === "2026-06-07") return ["r5", "r6", "r7", "r8"]
    return []
  }

  const availableRounds = getAvailableRounds()

  const availableDates = [...new Set(finalsSchedule.map((m) => m.date))].sort()

  // Use shared context for existing results
  const { results: sharedResults, refetch } = useFinalsResults()
  useEffect(() => {
    if (Object.keys(sharedResults).length > 0) {
      setExistingResults(sharedResults)
    }
  }, [sharedResults])

  useEffect(() => {
    if (selectedDate) {
      setMatchesForDate(finalsSchedule.filter((m) => m.date === selectedDate))
      setSelectedMatch(null)
    }
  }, [selectedDate])

  // Load lineup/results from shared context when match is selected
  useEffect(() => {
    if (!selectedMatch) return
    const existing = existingResults[selectedMatch.id]
    const lu = existing?.lineups || emptyLineup(selectedMatch.teams)
    setLineups(lu)
    
    // Always start with empty results for all 24 games (8 rounds * 3 games)
    const base = emptyGameResult(selectedMatch.teams, lu)
    
    if (existing?.results) {
      // Merge saved results over the empty base
      const merged = { ...base }
      Object.entries(existing.results).forEach(([gk, players]: [string, any]) => {
        if (Array.isArray(players) && players.length > 0) {
          const round = gk.substring(0, 2) as "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8"
          merged[gk as FinalsGameKey] = players.map((p: PlayerScore) => ({
            ...p,
            playerName: p.playerName || lu[round]?.[p.teamName] || "",
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

  // When lineup player changes, update player name across all 3 games in that round
  const handleLineupChange = (round: "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8", teamName: string, playerName: string) => {
    setLineups((prev) => ({
      ...prev,
      [round]: { ...prev[round], [teamName]: playerName },
    }))
    const gameKeys: FinalsGameKey[] = [
      `${round}g1` as FinalsGameKey,
      `${round}g2` as FinalsGameKey,
      `${round}g3` as FinalsGameKey,
    ]
    setGameResults((prev) => {
      const updated = { ...prev }
      gameKeys.forEach((gk) => {
        updated[gk] = (prev[gk] || []).map((p) =>
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

  const handleScoreChange = (gameKey: FinalsGameKey, playerIndex: number, field: keyof PlayerScore, value: any) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const numValue = ["rawScore", "rawChips", "penalty"].includes(field as string) ? Number(value) : value
      game[playerIndex] = { ...game[playerIndex], [field]: numValue }
      return { ...prev, [gameKey]: recalcGame(game) }
    })
  }

  const handleAddYakuman = (gameKey: FinalsGameKey, playerIndex: number) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const player = game[playerIndex]
      game[playerIndex] = { ...player, yakumans: [...player.yakumans, { types: [], photoUrl: "" }] }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleRemoveYakuman = (gameKey: FinalsGameKey, playerIndex: number, yakumanIndex: number) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const yakumans = [...game[playerIndex].yakumans]
      yakumans.splice(yakumanIndex, 1)
      game[playerIndex] = { ...game[playerIndex], yakumans }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleYakumanTypeChange = (gameKey: FinalsGameKey, playerIndex: number, yakumanIndex: number, type: string) => {
    setGameResults((prev) => {
      const game = [...(prev[gameKey] || [])]
      const yakumans = [...game[playerIndex].yakumans]
      yakumans[yakumanIndex] = { ...yakumans[yakumanIndex], types: [type] }
      game[playerIndex] = { ...game[playerIndex], yakumans }
      return { ...prev, [gameKey]: game }
    })
  }

  const handleYakumanPhotoUpload = (gameKey: FinalsGameKey, playerIndex: number, yakumanIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      // Save all 3 games from the selected round
      const gameKeys: FinalsGameKey[] = [
        `${selectedRound}g1` as FinalsGameKey,
        `${selectedRound}g2` as FinalsGameKey,
        `${selectedRound}g3` as FinalsGameKey,
      ]
      const roundResults: Partial<GameResult> = {}
      gameKeys.forEach((gk) => {
        roundResults[gk] = gameResults[gk]
      })

      const response = await fetch("/api/finals-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchKey, lineups, results: roundResults }),
      })
      const data = await response.json()
      if (data.success) {
        setShowPreview(false)
        alert(`成績已保存！`)
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

  // Inline player selector shown above the round's game inputs
  const renderLineupSelectors = (round: "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7" | "r8") => {
    if (!selectedMatch) return null
    return (
      <div className="p-3 bg-muted/40 rounded-lg space-y-2 mb-3">
        <p className="text-xs font-semibold text-muted-foreground">選手陣容 Lineup</p>
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

  const renderGameInput = (gameKey: FinalsGameKey) => {
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
            決賽 提交成績
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">選擇日期 Select Date</Label>
            <Select value={selectedDate} onValueChange={setSelectedDate}>
              <SelectTrigger>
                <SelectValue placeholder="選擇日期..." />
              </SelectTrigger>
              <SelectContent>
                {availableDates.map((date) => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">選擇場次 Select Match</Label>
            <Select value={selectedMatch?.id || ""} onValueChange={(id) => setSelectedMatch(matchesForDate.find((m) => m.id === id) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="選擇場次..." />
              </SelectTrigger>
              <SelectContent>
                {matchesForDate.map((match) => (
                  <SelectItem key={match.id} value={match.id}>{match.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedMatch && (
          <>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${availableRounds.length}, 1fr)` }}>
              {availableRounds.map((round) => (
                <Button
                  key={round}
                  variant={selectedRound === round ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRound(round)}
                  className="text-xs font-bold"
                >
                  {round.toUpperCase()}
                </Button>
              ))}
            </div>

            {renderLineupSelectors(selectedRound)}

            {/* Render all 3 games for the selected round */}
            {selectedMatch && (
              <>
                {renderGameInput(`${selectedRound}g1` as FinalsGameKey)}
                {renderGameInput(`${selectedRound}g2` as FinalsGameKey)}
                {renderGameInput(`${selectedRound}g3` as FinalsGameKey)}
              </>
            )}

            {showPreview && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-base">預覽 Preview</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>選擇的場次: {selectedMatch.id}</p>
                  <p>選擇的輪次: {selectedRound === "round1" ? "第1輪" : selectedRound === "round2" ? "第2輪" : selectedRound === "round3" ? "第3輪" : "第4輪"}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setShowPreview(!showPreview)} variant="outline" disabled={isSaving}>
                {showPreview ? "編輯" : "預覽"}
              </Button>
              <Button onClick={handleConfirmSave} disabled={isSaving || !showPreview}>
                {isSaving ? "保存中..." : "確認保存"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

