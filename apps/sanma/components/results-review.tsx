"use client"
import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { X, Edit2, Trash2 } from "lucide-react"
import { matchSchedule } from "@/lib/match-data"

interface SavedResult {
  matchId: string
  round: string
  timestamp: number
  results: any
}

interface ResultsReviewProps {
  isOpen: boolean
  onClose: () => void
  onEdit: (matchId: string, round: string) => void
}

export function ResultsReview({ isOpen, onClose, onEdit }: ResultsReviewProps) {
  const { t } = useLanguage()
  const [savedResults, setSavedResults] = useState<SavedResult[]>([])

  useEffect(() => {
    if (isOpen) {
      loadSavedResults()
    }
  }, [isOpen])

  const loadSavedResults = () => {
    const results: SavedResult[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith("results-")) {
        const data = localStorage.getItem(key)
        if (data) {
          const parsed = JSON.parse(data)
          results.push({
            matchId: parsed.matchId,
            round: parsed.round,
            timestamp: parsed.timestamp || Date.now(),
            results: parsed.results,
          })
        }
      }
    }
    results.sort((a, b) => b.timestamp - a.timestamp)
    setSavedResults(results)
  }

  const deleteResult = (matchId: string, round: string) => {
    if (confirm("確定要刪除此比賽成績嗎？")) {
      localStorage.removeItem(`results-${matchId}-${round}`)
      loadSavedResults()
    }
  }

  const getRoundLabel = (round: string) => {
    return round === "round1" ? "首輪" : "次輪"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">已輸入成績</h2>
          <button onClick={onClose} className="hover:bg-accent rounded-full p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {savedResults.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">尚無已輸入成績</p>
          ) : (
            savedResults.map((result, idx) => {
              const match = matchSchedule.find((m) => `${m.date}-${m.table}` === result.matchId)
              return (
                <div key={idx} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {match?.date} {match?.table}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getRoundLabel(result.round)} | {match?.teams.join(" vs ")}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(result.timestamp).toLocaleString("zh-TW")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(result.matchId, result.round)}
                        className="p-2 hover:bg-accent rounded-lg"
                        title="編輯"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteResult(result.matchId, result.round)}
                        className="p-2 hover:bg-destructive/10 text-destructive rounded-lg"
                        title="刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
