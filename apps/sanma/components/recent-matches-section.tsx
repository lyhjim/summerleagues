"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"

const recentMatches = [
  {
    id: 1,
    date: "2026年1月10日",
    round: "第2週 星期五",
    status: "completed" as const,
    isLive: true,
    players: [
      { name: "玩家 A (Team 天鳳)", position: 1, score: 42500, points: "+32" },
      { name: "玩家 D (Team 雀聖)", position: 2, score: 28700, points: "+8" },
      { name: "玩家 G (Team 東風)", position: 3, score: 18900, points: "-40" },
    ],
  },
  {
    id: 2,
    date: "2026年1月10日",
    round: "第2週 星期五",
    status: "completed" as const,
    isLive: false,
    players: [
      { name: "玩家 J (Team 白鳥)", position: 1, score: 45200, points: "+35" },
      { name: "玩家 M (Team 赤龍)", position: 2, score: 26300, points: "+6" },
      { name: "玩家 P (Team 青索)", position: 3, score: 8600, points: "-41" },
    ],
  },
  {
    id: 3,
    date: "2026年1月9日",
    round: "第2週 星期四",
    status: "completed" as const,
    isLive: false,
    players: [
      { name: "玩家 S (Team 綠發)", position: 1, score: 39800, points: "+28" },
      { name: "玩家 V (Team 中鋒)", position: 2, score: 31200, points: "+12" },
      { name: "玩家 Y (Team 南風)", position: 3, score: 19100, points: "-40" },
    ],
  },
  {
    id: 4,
    date: "2026年1月9日",
    round: "第2週 星期四",
    status: "completed" as const,
    isLive: false,
    players: [
      { name: "玩家 AB (Team 西家)", position: 1, score: 44100, points: "+31" },
      { name: "玩家 AE (Team 北斗)", position: 2, score: 27500, points: "+9" },
      { name: "玩家 AH (Team 一索)", position: 3, score: 18500, points: "-40" },
    ],
  },
  {
    id: 5,
    date: "2026年1月8日",
    round: "第2週 星期三",
    status: "completed" as const,
    isLive: true,
    players: [
      { name: "玩家 B (Team 天鳳)", position: 1, score: 41300, points: "+30" },
      { name: "玩家 E (Team 雀聖)", position: 2, score: 29800, points: "+10" },
      { name: "玩家 AK (Team 九筒)", position: 3, score: 18900, points: "-40" },
    ],
  },
  {
    id: 6,
    date: "2026年1月8日",
    round: "第2週 星期三",
    status: "completed" as const,
    isLive: false,
    players: [
      { name: "玩家 H (Team 東風)", position: 1, score: 43700, points: "+33" },
      { name: "玩家 K (Team 白鳥)", position: 2, score: 28100, points: "+8" },
      { name: "玩家 AN (Team 五萬)", position: 3, score: 18200, points: "-41" },
    ],
  },
]

export function RecentMatchesSection() {
  const { t } = useLanguage()

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t.recentMatches}</h2>
          <p className="text-sm text-muted-foreground">{t.firstStage}</p>
        </div>
        <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          {t.viewAll} →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {recentMatches.map((match) => (
          <Card key={match.id} className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base font-semibold text-foreground">{match.round}</CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">{match.date}</CardDescription>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge variant="secondary" className="text-xs">
                    {t.completed}
                  </Badge>
                  {match.isLive && (
                    <Badge variant="default" className="text-xs bg-chart-2 hover:bg-chart-2">
                      直播桌
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {match.players.map((player, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-md ${
                      player.position === 1 ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          player.position === 1
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {player.position}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">{player.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-muted-foreground hidden sm:inline">{player.score}</span>
                      <span
                        className={`text-xs font-bold ${
                          player.points.startsWith("+") ? "text-chart-2" : "text-destructive"
                        }`}
                      >
                        {player.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
