"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { X } from "lucide-react"
import { semiFinalsSchedule, type SemiFinalsMatch } from "@/lib/semi-finals-schedule"
import { teams } from "@/lib/team-data"

interface LineupPlayer {
  teamName: string
  playerName: string
  startingPosition: 1 | 2 | 3 | null
}

interface LineupData {
  matchId: string
  date: string
  table: string
  round1: LineupPlayer[]
  round2: LineupPlayer[]
}

interface LineupEntryFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LineupData) => void
}

export function LineupEntryForm({ isOpen, onClose, onSubmit }: LineupEntryFormProps) {
  const { t } = useLanguage()

  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedMatch, setSelectedMatch] = useState<SemiFinalsMatch | null>(null)
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [matchesForDate, setMatchesForDate] = useState<SemiFinalsMatch[]>([])

  const [round1Lineup, setRound1Lineup] = useState<LineupPlayer[]>([])
  const [round2Lineup, setRound2Lineup] = useState<LineupPlayer[]>([])

  useEffect(() => {
    const uniqueDates = Array.from(new Set(semiFinalsSchedule.map((m) => m.date))).sort()
    setAvailableDates(uniqueDates)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      const matches = semiFinalsSchedule.filter((m) => m.date === selectedDate)
      setMatchesForDate(matches)
      setSelectedMatch(null)
    } else {
      setMatchesForDate([])
      setSelectedMatch(null)
    }
  }, [selectedDate])

  useEffect(() => {
    if (selectedMatch) {
      const matchId = `${selectedMatch.date}-${selectedMatch.table}`
      const savedLineup = localStorage.getItem(`lineup-${matchId}`)

      if (savedLineup) {
        const parsed = JSON.parse(savedLineup)
        setRound1Lineup(parsed.round1)
        setRound2Lineup(parsed.round2)
      } else {
        const emptyLineup = selectedMatch.teams.map((teamName) => ({
          teamName,
          playerName: "",
          startingPosition: null as 1 | 2 | 3 | null,
        }))
        setRound1Lineup(emptyLineup)
        setRound2Lineup(emptyLineup.map((p) => ({ ...p })))
      }
    }
  }, [selectedMatch])

  const getTeamPlayers = (teamName: string) => {
    const team = teams.find((t) => t.name === teamName)
    return team ? team.players : []
  }

  const updateLineup = (
    round: "round1" | "round2",
    teamIndex: number,
    field: "playerName" | "startingPosition",
    value: any,
  ) => {
    const lineup = round === "round1" ? [...round1Lineup] : [...round2Lineup]
    lineup[teamIndex] = { ...lineup[teamIndex], [field]: value }
    round === "round1" ? setRound1Lineup(lineup) : setRound2Lineup(lineup)
  }

  const handleSubmit = () => {
    if (!selectedMatch) {
      alert("請選擇比賽")
      return
    }

    // Validate lineups
    const validateLineup = (lineup: LineupPlayer[], roundName: string) => {
      if (lineup.some((p) => !p.playerName || !p.startingPosition)) {
        alert(`${roundName}：請為所有隊伍選擇選手和起始位置`)
        return false
      }
      const positions = lineup.map((p) => p.startingPosition)
      if (new Set(positions).size !== 3 || !positions.includes(1) || !positions.includes(2) || !positions.includes(3)) {
        alert(`${roundName}：起始位置必須包含 1、2、3 且不重複`)
        return false
      }
      return true
    }

    if (!validateLineup(round1Lineup, "首輪") || !validateLineup(round2Lineup, "次輪")) {
      return
    }

    const matchId = `${selectedMatch.date}-${selectedMatch.table}`
    const lineupData: LineupData = {
      matchId,
      date: selectedMatch.date,
      table: selectedMatch.table,
      round1: round1Lineup,
      round2: round2Lineup,
    }

    localStorage.setItem(`lineup-${matchId}`, JSON.stringify(lineupData))

    console.log("[v0] Lineup submitted:", lineupData)
    onSubmit(lineupData)
    setTimeout(() => {
      onClose()
    }, 100)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[800px] bg-background shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-background border-b border-border p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold">選手陣容輸入</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Match Selection */}
          <div className="space-y-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold">選擇比賽</h3>
            <div>
              <label className="text-sm font-medium mb-2 block">日期</label>
              <select
                className="w-full px-3 py-2 bg-background border border-input rounded-md"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="">選擇日期</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            {matchesForDate.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">桌次</label>
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
          </div>

          {/* Lineup Entry */}
          {selectedMatch && (
            <>
              {/* Round 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">首輪陣容</h3>
                {round1Lineup.map((player, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <h4 className="font-bold text-primary">{player.teamName}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">選手</label>
                        <select
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={player.playerName}
                          onChange={(e) => updateLineup("round1", index, "playerName", e.target.value)}
                        >
                          <option value="">選擇選手</option>
                          {getTeamPlayers(player.teamName).map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">起始位置</label>
                        <select
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={player.startingPosition || ""}
                          onChange={(e) =>
                            updateLineup(
                              "round1",
                              index,
                              "startingPosition",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        >
                          <option value="">選擇位置</option>
                          <option value="1">1 (東→西→南)</option>
                          <option value="2">2 (南→東→西)</option>
                          <option value="3">3 (西→南→東)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Round 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">次輪陣容</h3>
                {round2Lineup.map((player, index) => (
                  <div key={index} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                    <h4 className="font-bold text-primary">{player.teamName}</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium mb-1 block">選手</label>
                        <select
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={player.playerName}
                          onChange={(e) => updateLineup("round2", index, "playerName", e.target.value)}
                        >
                          <option value="">選擇選手</option>
                          {getTeamPlayers(player.teamName).map((p) => (
                            <option key={p.name} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-1 block">起始位置</label>
                        <select
                          className="w-full px-3 py-2 bg-background border border-input rounded-md"
                          value={player.startingPosition || ""}
                          onChange={(e) =>
                            updateLineup(
                              "round2",
                              index,
                              "startingPosition",
                              e.target.value ? Number(e.target.value) : null,
                            )
                          }
                        >
                          <option value="">選擇位置</option>
                          <option value="1">1 (東→西→南)</option>
                          <option value="2">2 (南→東→西)</option>
                          <option value="3">3 (西→南→東)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                確認陣容並繼續輸入成績
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
