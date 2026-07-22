"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { X, Upload, Plus, Trash2 } from "lucide-react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { matchSchedule, type Match } from "@/lib/match-data"
import { teams } from "@/lib/team-data"

interface PlayerScore {
  name: string
  teamName: string
  rawScore: number
  rawChips: number
  calculatedChips: number
  penalty: number
  penaltyReason: string
  finalChips: number
  rank: number | null
}

interface YakumanRecord {
  playerName: string
  yakumanType: string
  photoUrl: string | null
}

interface ScoreInputFormProps {
  isOpen: boolean
  onClose: () => void
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
  "累計役滿",
]

export function ScoreInputForm({ isOpen, onClose, onSubmit }: ScoreInputFormProps) {
  const { t } = useLanguage()

  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [matchesForDate, setMatchesForDate] = useState<Match[]>([])

  const [players, setPlayers] = useState<PlayerScore[]>([
    {
      name: "",
      teamName: "",
      rawScore: 0,
      rawChips: 0,
      calculatedChips: 0,
      penalty: 0,
      penaltyReason: "",
      finalChips: 0,
      rank: null,
    },
    {
      name: "",
      teamName: "",
      rawScore: 0,
      rawChips: 0,
      calculatedChips: 0,
      penalty: 0,
      penaltyReason: "",
      finalChips: 0,
      rank: null,
    },
    {
      name: "",
      teamName: "",
      rawScore: 0,
      rawChips: 0,
      calculatedChips: 0,
      penalty: 0,
      penaltyReason: "",
      finalChips: 0,
      rank: null,
    },
  ])
  const [yakumanRecords, setYakumanRecords] = useState<YakumanRecord[]>([])

  useEffect(() => {
    const uniqueDates = Array.from(new Set(matchSchedule.map((m) => m.date))).sort()
    setAvailableDates(uniqueDates)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      const matches = matchSchedule.filter((m) => m.date === selectedDate)
      setMatchesForDate(matches)
      setSelectedMatch(null)
    } else {
      setMatchesForDate([])
      setSelectedMatch(null)
    }
  }, [selectedDate])

  const getAvailablePlayers = () => {
    if (!selectedMatch) return []

    const availablePlayers: { name: string; teamName: string; photo: string }[] = []
    selectedMatch.teams.forEach((teamName) => {
      const team = teams.find((t) => t.name === teamName)
      if (team) {
        team.players.forEach((player) => {
          availablePlayers.push({
            name: player.name,
            teamName: team.name,
            photo: player.photo || "",
          })
        })
      }
    })
    return availablePlayers
  }

  useEffect(() => {
    const sortedPlayers = [...players].sort((a, b) => b.rawScore - a.rawScore)

    if (sortedPlayers.every((p) => p.rawScore > 0)) {
      const calculatedChipsArray: number[] = []

      const thirdPlayer = sortedPlayers[2]
      const thirdScoreDiff = 50 - thirdPlayer.rawScore
      const thirdChipsFromScore = Math.trunc(thirdScoreDiff / 4)
      const thirdTotalChips = thirdChipsFromScore + 5
      calculatedChipsArray[2] = -thirdTotalChips

      const secondPlayer = sortedPlayers[1]
      const secondScoreDiff = secondPlayer.rawScore - 50
      const secondChipsFromScore = Math.trunc(secondScoreDiff / 4)
      calculatedChipsArray[1] = secondChipsFromScore

      calculatedChipsArray[0] = -(calculatedChipsArray[1] + calculatedChipsArray[2])

      const newPlayers = players.map((player) => {
        const sortedIndex = sortedPlayers.findIndex((p) => p === player)
        const calculatedChips = calculatedChipsArray[sortedIndex]
        const finalChips = calculatedChips + player.rawChips - player.penalty
        return {
          ...player,
          calculatedChips,
          finalChips,
        }
      })

      setPlayers(newPlayers)
    }
  }, [
    players.map((p) => p.rawScore).join(","),
    players.map((p) => p.rawChips).join(","),
    players.map((p) => p.penalty).join(","),
  ])

  if (!isOpen) return null

  const totalRawScore = players.reduce((sum, p) => sum + p.rawScore, 0)
  const totalFinalChips = players.reduce((sum, p) => sum + p.finalChips, 0)
  const isRawScoreValid = totalRawScore === 150
  const isFinalChipsValid = Math.abs(totalFinalChips) < 0.01

  const updatePlayer = (index: number, field: keyof PlayerScore, value: any) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: value }
    setPlayers(newPlayers)
  }

  const addYakuman = () => {
    setYakumanRecords([...yakumanRecords, { playerName: "", yakumanType: "", photoUrl: null }])
  }

  const removeYakuman = (index: number) => {
    setYakumanRecords(yakumanRecords.filter((_, i) => i !== index))
  }

  const updateYakuman = (index: number, field: keyof YakumanRecord, value: any) => {
    const newRecords = [...yakumanRecords]
    newRecords[index] = { ...newRecords[index], [field]: value }
    setYakumanRecords(newRecords)
  }

  const handlePhotoUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateYakuman(index, "photoUrl", reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = () => {
    if (!isRawScoreValid || !isFinalChipsValid) {
      alert(t.validationError)
      return
    }

    const hasRanks = players.some((p) => p.rank !== null)
    if (!hasRanks) {
      alert("請輸入名次")
      return
    }

    onSubmit({
      players,
      yakumanRecords,
      timestamp: new Date().toISOString(),
    })
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[700px] bg-background shadow-2xl transform transition-transform overflow-y-auto"
        style={{ transform: isOpen ? "translateX(0)" : "translateX(100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">{t.gameScoreEntry}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold">{t.selectMatch}</h3>

            <div>
              <label className="text-sm font-medium mb-2 block">{t.selectDate}</label>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">{t.selectDate}</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {matchesForDate.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t.selectTable}</label>
                <div className="grid grid-cols-2 gap-3">
                  {matchesForDate.map((match) => (
                    <button
                      key={`${match.date}-${match.table}`}
                      onClick={() => setSelectedMatch(match)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMatch === match
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-bold text-lg">{match.table}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {match.teams.map((team, idx) => (
                          <div key={idx}>{team}</div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedMatch && (
              <div className="p-3 bg-chart-2/10 rounded-md border border-chart-2/30">
                <div className="font-medium text-sm">
                  已選擇: {selectedMatch.date} {selectedMatch.table}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{selectedMatch.teams.join(" · ")}</div>
              </div>
            )}
          </div>

          {/* Player Scores */}
          {selectedMatch && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">{t.players}</h3>
              {players.map((player, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.playerName}</label>
                    <select
                      className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      value={player.name}
                      onChange={(e) => {
                        const selectedPlayer = getAvailablePlayers().find((p) => p.name === e.target.value)
                        if (selectedPlayer) {
                          updatePlayer(index, "name", selectedPlayer.name)
                          updatePlayer(index, "teamName", selectedPlayer.teamName)
                        }
                      }}
                    >
                      <option value="">{t.selectPlayer}</option>
                      {getAvailablePlayers().map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name} ({p.teamName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t.rawScore} <span className="text-xs text-muted-foreground">(×1000)</span>
                      </label>
                      <Input
                        type="number"
                        value={player.rawScore || ""}
                        onChange={(e) => updatePlayer(index, "rawScore", Number(e.target.value))}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {t.chips} <span className="text-xs text-muted-foreground">(調整)</span>
                      </label>
                      <Input
                        type="number"
                        value={player.rawChips || ""}
                        onChange={(e) => updatePlayer(index, "rawChips", Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.penalty}</label>
                      <Input
                        type="number"
                        value={player.penalty || ""}
                        onChange={(e) => updatePlayer(index, "penalty", Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.rankInTie}</label>
                      <Input
                        type="number"
                        min="1"
                        max="3"
                        value={player.rank || ""}
                        onChange={(e) => updatePlayer(index, "rank", Number(e.target.value) || null)}
                        placeholder="1-3"
                      />
                    </div>
                  </div>
                  {player.penalty !== 0 && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">{t.penaltyReason}</label>
                      <Input
                        value={player.penaltyReason}
                        onChange={(e) => updatePlayer(index, "penaltyReason", e.target.value)}
                        placeholder={t.enterPenaltyReason}
                      />
                    </div>
                  )}
                  <div className="pt-2 border-t border-border/50 space-y-1">
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
                        <span className={`font-bold ${player.finalChips >= 0 ? "text-chart-2" : "text-destructive"}`}>
                          {player.finalChips > 0 ? "+" : ""}
                          {player.finalChips}
                        </span>
                      </div>
                    </div>
                    {player.penalty !== 0 && (
                      <div className="text-xs text-muted-foreground">
                        顯示為: {player.calculatedChips + player.rawChips > 0 ? "+" : ""}
                        {player.calculatedChips + player.rawChips}
                        <span className="text-destructive">
                          {" "}
                          ({player.penalty > 0 ? "-" : "+"}
                          {Math.abs(player.penalty)})
                        </span>
                        {player.penaltyReason && (
                          <div className="mt-0.5 text-[10px] italic">原因: {player.penaltyReason}</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation Summary */}
          {selectedMatch && (
            <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t.totalScore}:</span>
                <span className={`font-bold ${isRawScoreValid ? "text-chart-2" : "text-destructive"}`}>
                  {totalRawScore * 1000} {isRawScoreValid && "✓"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">最終枚數總和:</span>
                <span className={`font-bold ${isFinalChipsValid ? "text-chart-2" : "text-destructive"}`}>
                  {totalFinalChips.toFixed(1)} {isFinalChipsValid && "✓"}
                </span>
              </div>
              {!isRawScoreValid && <p className="text-xs text-destructive">原始分數總和必須為 150,000 (輸入150)</p>}
              {!isFinalChipsValid && <p className="text-xs text-destructive">最終枚數總和必須為 0</p>}
            </div>
          )}

          {/* Yakuman Tracker */}
          {selectedMatch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">{t.yakumanTracker}</h3>
                <button
                  onClick={addYakuman}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.addYakuman}
                </button>
              </div>

              {yakumanRecords.map((record, index) => (
                <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {t.yakumanType} #{index + 1}
                    </span>
                    <button
                      onClick={() => removeYakuman(index)}
                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.playerName}</label>
                    <Input
                      value={record.playerName}
                      onChange={(e) => updateYakuman(index, "playerName", e.target.value)}
                      placeholder={t.playerName}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.yakumanType}</label>
                    <select
                      className="w-full px-3 py-2 bg-background border border-input rounded-md"
                      value={record.yakumanType}
                      onChange={(e) => updateYakuman(index, "yakumanType", e.target.value)}
                    >
                      <option value="">{t.selectYakuman}</option>
                      {YAKUMAN_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">{t.uploadPhoto}</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md cursor-pointer transition-colors">
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">{t.uploadPhoto}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handlePhotoUpload(index, e)}
                        />
                      </label>
                      {record.photoUrl && (
                        <div className="flex items-center gap-2">
                          <Image
                            src={record.photoUrl || "/placeholder.svg"}
                            alt="Yakuman"
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                          <span className="text-xs text-muted-foreground">{t.photoUploaded}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          {selectedMatch && (
            <button
              onClick={handleSubmit}
              disabled={!isRawScoreValid || !isFinalChipsValid}
              className="w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.submitScore}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
