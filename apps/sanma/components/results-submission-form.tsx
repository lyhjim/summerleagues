"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { X, Plus, Trash2, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import ResultsConfirmationDialog from "@/components/results-confirmation-dialog"
import { saveResults } from "@/lib/supabase-data"

type PenaltyReason = "遲到" | "暴露張" | "錯和" | "錯鳴" | "其他" | ""

interface LineupPlayer {
  teamName: string
  playerName: string
  startingPosition: 1 | 2 | 3
}

interface GameScore {
  playerName: string
  teamName: string
  seat: "東" | "南" | "西"
  score: number
  rawChips: number
  calculatedChips: number
  finalChips: number
  yakumans: YakumanEntry[]
  penalty: number
  penaltyReason: PenaltyReason
}

interface YakumanEntry {
  types: string[]
  photoUrl?: string
}

interface RoundResults {
  game1: GameScore[]
  game2: GameScore[]
  game3: GameScore[]
}

interface ResultsSubmissionFormProps {
  isOpen: boolean
  onClose: () => void
  lineup: {
    matchId: string
    date: string
    table: string
    round1: LineupPlayer[]
    round2: LineupPlayer[]
  } | null
  onSubmit: (data: any) => void
}

const YAKUMAN_TYPES = [
  "國士無雙",
  "大三元",
  "四暗刻",
  "四暗刻單騎",
  "字一色",
  "綠一色",
  "小四喜",
  "大四喜",
  "清老頭",
  "九蓮寶燈",
  "四槓子",
  "天和",
  "地和",
  "萬和",
  "大車輪",
  "流局役滿",
  "累計役滿", // Added new yakuman type
]

const getSeat = (startingPosition: 1 | 2 | 3, gameNumber: 1 | 2 | 3): "東" | "南" | "西" => {
  const seatMap = {
    1: ["東", "西", "南"],
    2: ["南", "東", "西"],
    3: ["西", "南", "東"],
  }
  return seatMap[startingPosition][gameNumber - 1] as "東" | "南" | "西"
}

// Formula: 0 to -3000 = 0 chips, -4000 to -7000 = -1 chip, etc.
const calculateChipsForGame = (gamePlayers: GameScore[]): number[] => {
  if (!gamePlayers || gamePlayers.length !== 3) return [0, 0, 0]

  const validPlayers = gamePlayers.filter((p) => p && typeof p.score === "number")
  if (validPlayers.length !== 3) return [0, 0, 0]

  const sortedByScore = [...gamePlayers]
    .map((p, idx) => ({ ...p, originalIndex: idx }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const seatOrder = { 東: 0, 南: 1, 西: 2 }
      return seatOrder[a.seat as keyof typeof seatOrder] - seatOrder[b.seat as keyof typeof seatOrder]
    })

  const calculatedChips = [0, 0, 0]
  const thirdScore = sortedByScore[2].score
  const secondScore = sortedByScore[1].score

  const thirdScoreDiff = thirdScore - 50
  const secondScoreDiff = secondScore - 50

  // This ensures -5000 becomes -1 chip (not -2), and +5000 becomes +1 chip
  calculatedChips[2] = Math.trunc(thirdScoreDiff / 4) - 5
  calculatedChips[1] = Math.trunc(secondScoreDiff / 4)
  calculatedChips[0] = -(calculatedChips[1] + calculatedChips[2])

  const resultChips = new Array(3).fill(0)
  sortedByScore.forEach((player, sortedIndex) => {
    resultChips[player.originalIndex] = calculatedChips[sortedIndex]
  })

  return resultChips
}

const createEmptyPlayer = (player: any, seat: string): GameScore => ({
  teamName: player.teamName || "",
  playerName: player.playerName,
  seat,
  score: 0,
  rawChips: 0,
  calculatedChips: 0,
  finalChips: 0,
  yakumans: [],
  penalty: 0,
  penaltyReason: "", // Initialize empty penalty reason
})

export function ResultsSubmissionForm({ isOpen, onClose, lineup, onSubmit }: ResultsSubmissionFormProps) {
  const { t } = useLanguage()
  const [availableMatches, setAvailableMatches] = useState<any[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [currentLineup, setCurrentLineup] = useState<any>(null)
  const [selectedRound, setSelectedRound] = useState<"round1" | "round2" | null>(null)
  const [roundResults, setRoundResults] = useState<RoundResults>({
    game1: [],
    game2: [],
    game3: [],
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [showMatchSelection, setShowMatchSelection] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setShowMatchSelection(false)

      if (lineup && !showMatchSelection) {
        setCurrentLineup(lineup)
        setSelectedMatchId(lineup.matchId)
      }

      const matches: any[] = []
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith("lineup-")) {
            const data = localStorage.getItem(key)
            if (data) {
              matches.push(JSON.parse(data))
            }
          }
        }
      }
      setAvailableMatches(matches)
    }
  }, [isOpen, lineup])

  useEffect(() => {
    if (selectedMatchId && !lineup) {
      const savedLineup = localStorage.getItem(`lineup-${selectedMatchId}`)
      if (savedLineup) {
        setCurrentLineup(JSON.parse(savedLineup))
      }
    }
  }, [selectedMatchId, lineup])

  useEffect(() => {
    if (selectedRound && currentLineup) {
      const roundLineup = selectedRound === "round1" ? currentLineup.round1 : currentLineup.round2
      const initGames = (gameNum: 1 | 2 | 3) =>
        roundLineup.map((player: LineupPlayer) => createEmptyPlayer(player, getSeat(player.startingPosition!, gameNum)))

      setRoundResults({
        game1: initGames(1),
        game2: initGames(2),
        game3: initGames(3),
      })
    }
  }, [selectedRound, currentLineup])

  const updateGameScore = (gameKey: "game1" | "game2" | "game3", playerIndex: number, field: string, value: any) => {
    setRoundResults((prev) => {
      const updatedGame = prev[gameKey].map((p, i) => {
        if (i === playerIndex) {
          return { ...p, [field]: value }
        }
        return p
      })

      const allFieldsFilled = updatedGame.every((p) => typeof p.score === "number" && typeof p.rawChips === "number")

      if (allFieldsFilled) {
        // Calculate chips for all players together
        const calculatedChips = calculateChipsForGame(updatedGame)

        // Update all players with their calculated chips
        const finalGame = updatedGame.map((p, idx) => ({
          ...p,
          calculatedChips: calculatedChips[idx] || 0,
          finalChips: (calculatedChips[idx] || 0) + (p.rawChips || 0) + (p.penalty || 0),
        }))

        return { ...prev, [gameKey]: finalGame }
      }

      // If not all fields filled, keep chips at 0
      return { ...prev, [gameKey]: updatedGame }
    })
  }

  const addYakuman = (gameKey: "game1" | "game2" | "game3", playerIndex: number) => {
    setRoundResults((prev) => ({
      ...prev,
      [gameKey]: prev[gameKey].map((p, i) =>
        i === playerIndex ? { ...p, yakumans: [...p.yakumans, { types: [], photoUrl: null }] } : p,
      ),
    }))
  }

  const updateYakuman = (
    gameKey: "game1" | "game2" | "game3",
    playerIndex: number,
    yakumanIndex: number,
    field: "types" | "photoUrl",
    value: any,
  ) => {
    setRoundResults((prev) => ({
      ...prev,
      [gameKey]: prev[gameKey].map((p, i) =>
        i === playerIndex
          ? {
              ...p,
              yakumans: p.yakumans.map((y, yi) => (yi === yakumanIndex ? { ...y, [field]: value } : y)),
            }
          : p,
      ),
    }))
  }

  const removeYakuman = (gameKey: "game1" | "game2" | "game3", playerIndex: number, yakumanIndex: number) => {
    setRoundResults((prev) => ({
      ...prev,
      [gameKey]: prev[gameKey].map((p, i) =>
        i === playerIndex ? { ...p, yakumans: p.yakumans.filter((_, yi) => yi !== yakumanIndex) } : p,
      ),
    }))
  }

  const handlePhotoUpload = (
    gameKey: "game1" | "game2" | "game3",
    playerIndex: number,
    yakumanIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateYakuman(gameKey, playerIndex, yakumanIndex, "photoUrl", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    console.log("[v0] Submit button clicked")
    console.log("[v0] Round results:", roundResults)

    const game1Valid = roundResults.game1.every((p) => typeof p.score === "number")
    const game2Valid = roundResults.game2.every((p) => typeof p.score === "number")
    const game3Valid = roundResults.game3.every((p) => typeof p.score === "number")

    if (!game1Valid || !game2Valid || !game3Valid) {
      alert("請確保所有三場比賽的分數都已填寫")
      return
    }

    const preparedRoundResults = {
      game1: roundResults.game1.map((p) => ({
        ...p,
        calculatedChips: p.calculatedChips || 0,
        finalChips: (p.calculatedChips || 0) + (p.rawChips || 0) + (p.penalty || 0),
      })),
      game2: roundResults.game2.map((p) => ({
        ...p,
        calculatedChips: p.calculatedChips || 0,
        finalChips: (p.calculatedChips || 0) + (p.rawChips || 0) + (p.penalty || 0),
      })),
      game3: roundResults.game3.map((p) => ({
        ...p,
        calculatedChips: p.calculatedChips || 0,
        finalChips: (p.calculatedChips || 0) + (p.rawChips || 0) + (p.penalty || 0),
      })),
    }

    console.log("[v0] Prepared results:", preparedRoundResults)

    setConfirmationData({
      matchId: selectedMatchId!,
      round: selectedRound,
      roundResults: preparedRoundResults,
      lineup: currentLineup!,
    })
    setShowConfirmation(true)
  }

  const confirmSave = async () => {
    const matchIdToUse = selectedMatchId || currentLineup?.matchId
    console.log("[v0] confirmSave called with matchId:", matchIdToUse, "round:", selectedRound)
    console.log("[v0] currentLineup:", currentLineup)
    console.log("[v0] confirmationData:", confirmationData)

    if (!matchIdToUse || !selectedRound) {
      console.log("[v0] ERROR: Missing matchId or round!")
      alert("錯誤：缺少比賽ID或輪次")
      return
    }

    const resultsData = {
      matchId: matchIdToUse,
      round: selectedRound,
      timestamp: Date.now(),
      results: confirmationData.roundResults,
    }

    const storageKey = `results-${matchIdToUse}-${selectedRound}`
    console.log("[v0] Saving to localStorage key:", storageKey)
    console.log("[v0] Data being saved:", JSON.stringify(resultsData))

    localStorage.setItem(storageKey, JSON.stringify(resultsData))

    // Verify save worked
    const savedData = localStorage.getItem(storageKey)
    console.log("[v0] Verified saved data:", savedData ? "SUCCESS" : "FAILED")

    try {
      const parts = matchIdToUse.split("-")
      const date = parts.slice(0, 3).join("-")

      await saveResults({
        matchId: matchIdToUse,
        round: selectedRound,
        date: date,
        results: confirmationData.roundResults,
      })
      console.log("[v0] Successfully saved to Supabase")
    } catch (error) {
      console.error("[v0] Error saving to Supabase:", error)
      alert(
        "警告：數據已保存到本地，但同步到數據庫失敗。請聯繫管理員。\n\nWarning: Data saved locally but failed to sync to database.",
      )
    }

    window.dispatchEvent(new Event("resultsUpdated"))
    window.dispatchEvent(new Event("resultsSubmitted"))

    setShowConfirmation(false)
    alert("成績已成功提交！")

    setSelectedRound(null)
    setSelectedMatchId(null)
    setCurrentLineup(null)
    onClose?.()
  }

  const handleChangeMatch = () => {
    setShowMatchSelection(true)
    setCurrentLineup(null)
    setSelectedMatchId("")
    setSelectedRound(null)
    setRoundResults({ game1: [], game2: [], game3: [] })
  }

  if (!isOpen) return null

  if (!currentLineup || showMatchSelection) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto z-50">
        <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
          <div className="w-full max-w-md bg-background rounded-lg shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">選擇比賽</h2>
              <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {availableMatches.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">暫無已提交的陣容</p>
              ) : (
                availableMatches.map((match) => (
                  <button
                    key={match.matchId}
                    onClick={() => {
                      setSelectedMatchId(match.matchId)
                      setCurrentLineup(match)
                      setShowMatchSelection(false)
                    }}
                    className="w-full p-4 bg-secondary hover:bg-secondary/80 rounded-lg text-left transition-colors"
                  >
                    <div className="font-bold">
                      {match.date} {match.table}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      首輪: {match.round1.map((p: LineupPlayer) => p.playerName).join(", ")}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      次輪: {match.round2.map((p: LineupPlayer) => p.playerName).join(", ")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!currentLineup) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm overflow-y-auto z-50">
        <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-6xl mx-auto bg-background rounded-lg shadow-2xl">
            <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10 rounded-t-lg">
              <div>
                <h2 className="text-xl font-bold">成績輸入</h2>
                <p className="text-sm text-muted-foreground">
                  {currentLineup.date} {currentLineup.table}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleChangeMatch}
                  className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
                >
                  更換比賽
                </button>
                <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {!selectedRound && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">選擇輪次</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setSelectedRound("round1")}
                      className="p-6 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl font-bold">首輪</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {currentLineup.round1.map((p: LineupPlayer) => p.playerName).join(", ")}
                      </div>
                    </button>
                    <button
                      onClick={() => setSelectedRound("round2")}
                      className="p-6 bg-primary/10 hover:bg-primary/20 border-2 border-primary rounded-lg transition-colors text-left"
                    >
                      <div className="text-2xl font-bold">次輪</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {currentLineup.round2.map((p: LineupPlayer) => p.playerName).join(", ")}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {selectedRound && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedRound === "round1" ? "首輪" : "次輪"} - 三場比賽</h3>
                  <button
                    onClick={() => setSelectedRound(null)}
                    className="px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md"
                  >
                    返回選擇輪次
                  </button>
                </div>
              )}

              {selectedRound && (
                <div className="space-y-6">
                  {(["game1", "game2", "game3"] as const).map((gameKey, gameIndex) => {
                    const gameNum = gameIndex + 1
                    const gameScores = roundResults[gameKey]
                    const totalScore = gameScores.reduce((sum, p) => sum + p.score, 0)
                    const totalChips = gameScores.reduce((sum, p) => {
                      const finalChip = (p.calculatedChips || 0) + (p.rawChips || 0) + (p.penalty || 0)
                      return sum + finalChip
                    }, 0)

                    const seatOrder = { 東: 1, 南: 2, 西: 3 }
                    const sortedGameScores = [...gameScores].sort((a, b) => seatOrder[a.seat] - seatOrder[b.seat])

                    return (
                      <div key={gameKey} className="border-2 border-primary/30 rounded-lg p-6 space-y-4 bg-primary/5">
                        <h4 className="text-xl font-bold border-b pb-2">第 {gameNum} 場</h4>

                        {sortedGameScores.map((player) => {
                          const playerIndex = gameScores.findIndex((p) => p.playerName === player.playerName)
                          return (
                            <div
                              key={player.playerName}
                              className="p-4 bg-background rounded-lg space-y-3 border border-border"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-bold text-lg">{player.playerName}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    ({player.teamName}) - {player.seat}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    分數 <span className="text-xs text-muted-foreground">(×1000)</span>
                                  </label>
                                  <Input
                                    type="number"
                                    value={player.score || ""}
                                    onChange={(e) =>
                                      updateGameScore(gameKey, playerIndex, "score", Number(e.target.value))
                                    }
                                    placeholder="50"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    原始枚數 <span className="text-xs text-muted-foreground">(調整)</span>
                                  </label>
                                  <Input
                                    type="number"
                                    value={player.rawChips || ""}
                                    onChange={(e) =>
                                      updateGameScore(gameKey, playerIndex, "rawChips", Number(e.target.value))
                                    }
                                    placeholder="0"
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">懲罰枚數</label>
                                  <Input
                                    type="number"
                                    value={player.penalty || ""}
                                    onChange={(e) =>
                                      updateGameScore(gameKey, playerIndex, "penalty", Number(e.target.value))
                                    }
                                    placeholder="0"
                                  />
                                </div>
                                {player.penalty !== 0 && (
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">懲罰原因</label>
                                    <select
                                      value={player.penaltyReason || ""}
                                      onChange={(e) =>
                                        updateGameScore(gameKey, playerIndex, "penaltyReason", e.target.value)
                                      }
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    >
                                      <option value="">選擇原因</option>
                                      <option value="遲到">遲到</option>
                                      <option value="暴露張">暴露張</option>
                                      <option value="錯和">錯和</option>
                                      <option value="錯鳴">錯鳴</option>
                                      <option value="其他">其他</option>
                                    </select>
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t space-y-2">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">計算枚數: </span>
                                    <span
                                      className={`font-medium ${player.calculatedChips >= 0 ? "text-chart-2" : "text-destructive"}`}
                                    >
                                      {player.calculatedChips > 0 ? "+" : ""}
                                      {player.calculatedChips}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">最終枚數: </span>
                                    <span
                                      className={`font-bold ${player.finalChips >= 0 ? "text-chart-2" : "text-destructive"}`}
                                    >
                                      {player.finalChips > 0 ? "+" : ""}
                                      {player.finalChips}
                                    </span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      id={`yakuman-${gameKey}-${playerIndex}`}
                                      checked={player.yakumans.length > 0}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          addYakuman(gameKey, playerIndex)
                                        } else {
                                          setRoundResults((prev) => ({
                                            ...prev,
                                            [gameKey]: prev[gameKey].map((p, i) =>
                                              i === playerIndex ? { ...p, yakumans: [] } : p,
                                            ),
                                          }))
                                        }
                                      }}
                                      className="w-4 h-4"
                                    />
                                    <label
                                      htmlFor={`yakuman-${gameKey}-${playerIndex}`}
                                      className="text-sm font-medium cursor-pointer"
                                    >
                                      役滿
                                    </label>
                                  </div>

                                  {player.yakumans.map((yakuman, yakumanIndex) => (
                                    <div key={yakumanIndex} className="p-3 bg-secondary/50 rounded border space-y-2">
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">役滿 #{yakumanIndex + 1}</span>
                                        <button
                                          onClick={() => removeYakuman(gameKey, playerIndex, yakumanIndex)}
                                          className="p-1 hover:bg-destructive/10 rounded"
                                        >
                                          <Trash2 className="w-3 h-3 text-destructive" />
                                        </button>
                                      </div>

                                      <div>
                                        <label className="text-xs font-medium mb-1 block">役滿種類 (可多選)</label>
                                        <select
                                          multiple
                                          className="w-full px-2 py-1.5 text-sm bg-background border rounded h-24"
                                          value={yakuman.types}
                                          onChange={(e) => {
                                            const selected = Array.from(
                                              e.target.selectedOptions,
                                              (option) => option.value,
                                            )
                                            updateYakuman(gameKey, playerIndex, yakumanIndex, "types", selected)
                                          }}
                                        >
                                          {YAKUMAN_TYPES.map((type) => (
                                            <option key={type} value={type}>
                                              {type}
                                            </option>
                                          ))}
                                        </select>
                                        <p className="text-[10px] text-muted-foreground mt-1">按住 Ctrl/Cmd 可多選</p>
                                      </div>

                                      <div>
                                        <label className="text-xs font-medium mb-1 block">上傳照片</label>
                                        <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded cursor-pointer">
                                          <Upload className="w-3 h-3" />
                                          <span className="text-xs">選擇照片</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => handlePhotoUpload(gameKey, playerIndex, yakumanIndex, e)}
                                          />
                                        </label>
                                        {yakuman.photoUrl && (
                                          <div className="mt-2">
                                            <Image
                                              src={yakuman.photoUrl || "/placeholder.svg"}
                                              alt="Yakuman"
                                              width={60}
                                              height={60}
                                              className="rounded object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}

                                  {player.yakumans.length > 0 && (
                                    <button
                                      onClick={() => addYakuman(gameKey, playerIndex)}
                                      className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-primary/20 hover:bg-primary/30 rounded"
                                    >
                                      <Plus className="w-3 h-3" />
                                      新增另一個役滿
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}

                        <div className="p-3 bg-secondary/50 rounded space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>分數總和:</span>
                            <span
                              className={totalScore === 150 ? "text-chart-2 font-bold" : "text-destructive font-bold"}
                            >
                              {totalScore * 1000} {totalScore === 150 ? "✓" : ""}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>枚數總和:</span>
                            <span
                              className={
                                Math.abs(totalChips) < 0.01 ? "text-chart-2 font-bold" : "text-destructive font-bold"
                              }
                            >
                              {totalChips.toFixed(1)} {Math.abs(totalChips) < 0.01 ? "✓" : ""}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {selectedRound && (
                <button
                  onClick={handleSubmit}
                  className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-bold text-lg"
                >
                  提交成績
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && confirmationData && (
        <ResultsConfirmationDialog
          isOpen={showConfirmation}
          matchId={confirmationData.matchId}
          round={confirmationData.round}
          results={confirmationData.roundResults}
          onConfirm={confirmSave}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </>
  )
}
