"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { X, CheckCircle } from "lucide-react"

interface PlayerResult {
  playerName: string
  teamName: string
  seat: string
  score: number
  rawChips: number
  calculatedChips: number
  finalChips: number
  yakumans: any[]
  penaltyReason?: string
}

interface GameResults {
  game1: PlayerResult[]
  game2: PlayerResult[]
  game3: PlayerResult[]
}

interface TeamStats {
  teamName: string
  totalChips: number
  first: number
  second: number
  third: number
  games: number
}

interface ResultsConfirmationProps {
  isOpen: boolean
  matchId: string
  round: string
  results: GameResults
  onConfirm: () => void
  onCancel: () => void
}

function ResultsConfirmationDialog({ isOpen, matchId, round, results, onConfirm, onCancel }: ResultsConfirmationProps) {
  const { t } = useLanguage()
  const [teamStats, setTeamStats] = useState<TeamStats[]>([])
  const [currentRankings, setCurrentRankings] = useState<any[]>([])

  useEffect(() => {
    if (isOpen) {
      calculateTeamStats()
      loadCurrentRankings()
    }
  }, [isOpen, results])

  const calculateTeamStats = () => {
    const stats: { [key: string]: TeamStats } = {}

    // Initialize team stats
    const allPlayers = [...results.game1, ...results.game2, ...results.game3]
    allPlayers.forEach((player) => {
      if (!stats[player.teamName]) {
        stats[player.teamName] = {
          teamName: player.teamName,
          totalChips: 0,
          first: 0,
          second: 0,
          third: 0,
          games: 0,
        }
      }
    })

    // Calculate for each game
    ;[results.game1, results.game2, results.game3].forEach((game) => {
      if (!game || game.length === 0) return

      // Sort by score descending for ranking with East > South > West tiebreaker
      const seatOrder = { 東: 0, 南: 1, 西: 2 }
      const sorted = [...game].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return seatOrder[a.seat as keyof typeof seatOrder] - seatOrder[b.seat as keyof typeof seatOrder]
      })

      sorted.forEach((player, index) => {
        stats[player.teamName].totalChips += player.finalChips
        stats[player.teamName].games += 1
        if (index === 0) stats[player.teamName].first += 1
        else if (index === 1) stats[player.teamName].second += 1
        else stats[player.teamName].third += 1
      })
    })

    setTeamStats(Object.values(stats))
  }

  const loadCurrentRankings = () => {
    // Load current rankings from localStorage
    const rankings: any[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("results-")) {
        const data = localStorage.getItem(key)
        if (data) {
          rankings.push(JSON.parse(data))
        }
      }
    }
    setCurrentRankings(rankings)
  }

  if (!isOpen) return null

  const roundLabel = round === "round1" ? "首輪" : "次輪"

  return (
    <div className="fixed inset-0 bg-black/70 z-50 overflow-y-auto">
      <div className="min-h-full flex items-start justify-center p-4 py-8">
        <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full">
          <div className="sticky top-0 bg-card border-b p-4 sm:p-6 flex justify-between items-center rounded-t-lg z-10">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">確認比賽成績</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {matchId} - {roundLabel}
              </p>
            </div>
            <button onClick={onCancel} className="hover:bg-accent rounded-full p-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Game Results Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">比賽結果</h3>
              {["game1", "game2", "game3"].map((gameKey, gameIndex) => {
                const game = results[gameKey as keyof GameResults]
                if (!game || game.length === 0) return null

                return (
                  <div key={gameKey} className="border rounded-lg p-3 sm:p-4 bg-secondary/20">
                    <h4 className="font-medium mb-3">第 {gameIndex + 1} 局</h4>
                    <div className="space-y-2">
                      {game.map((player, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-background rounded gap-2">
                          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            <span className="font-bold text-base sm:text-lg shrink-0">{player.seat}</span>
                            <div className="min-w-0">
                              <div className="font-medium text-sm sm:text-base truncate">{player.playerName}</div>
                              <div className="text-xs text-muted-foreground truncate">{player.teamName}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">分數</div>
                              <div className="font-medium text-sm sm:text-base">{player.score}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-muted-foreground">枚數</div>
                              <div
                                className={`font-bold text-sm sm:text-base ${player.finalChips >= 0 ? "text-green-600" : "text-red-600"}`}
                              >
                                {player.finalChips > 0 ? "+" : ""}
                                {player.finalChips}
                              </div>
                              {player.penaltyReason && (
                                <div className="text-[10px] text-muted-foreground">{player.penaltyReason}</div>
                              )}
                            </div>
                            {player.yakumans && player.yakumans.length > 0 && (
                              <div className="text-xs bg-amber-500/20 text-amber-700 px-2 py-1 rounded">
                                役滿 ×{player.yakumans.length}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Team Stats Changes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">隊伍成績變化</h3>
              <div className="grid gap-3">
                {teamStats.map((team) => (
                  <div key={team.teamName} className="border rounded-lg p-3 sm:p-4 bg-secondary/20">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="font-semibold text-base sm:text-lg">{team.teamName}</div>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-muted-foreground">本輪枚數</div>
                          <div
                            className={`text-lg sm:text-xl font-bold ${team.totalChips >= 0 ? "text-green-600" : "text-red-600"}`}
                          >
                            {team.totalChips > 0 ? "+" : ""}
                            {team.totalChips}
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-xs text-muted-foreground">半莊數</div>
                          <div className="font-medium">{team.games}</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm">
                          <span className="text-green-600">1位:{team.first}</span>
                          <span className="text-blue-600">2位:{team.second}</span>
                          <span className="text-orange-600">3位:{team.third}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                onClick={onCancel}
                className="px-4 sm:px-6 py-2 border rounded-lg hover:bg-accent transition-colors"
              >
                取消
              </button>
              <button
                onClick={onConfirm}
                className="px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                確認送出
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsConfirmationDialog
