"use client"

import { useSummerStandings } from "@/lib/summer-selection/standings"

export function MVPStandings() {
  const { players, loading } = useSummerStandings()

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-blue-400"></span>
          初賽個人 MVP 排名
        </h2>
      </div>

      {players.length === 0 ? (
        <div className="rounded-lg border border-blue-300/15 bg-blue-500/5 px-6 py-12 text-center">
          <p className="text-blue-200/60">{loading ? "加載中..." : "賽事進行中，敬請期待..."}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table — shows ~6 rows, scroll for the rest */}
          <div className="hidden md:block overflow-y-auto rounded-lg border border-blue-300/15 bg-blue-500/5 max-h-[340px]">
            <table className="w-full">
              <thead className="sticky top-0 z-10 border-b border-blue-300/15 bg-[#0b1f3a]">
                <tr>
                  <th className="text-left py-3 px-5 text-xs font-bold text-blue-200/70 tracking-wider uppercase w-14">排名</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-blue-200/70 tracking-wider uppercase">選手</th>
                  <th className="text-left py-3 px-5 text-xs font-bold text-blue-200/70 tracking-wider uppercase">隊伍</th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-blue-200/70 tracking-wider uppercase">成績</th>
                  <th className="text-center py-3 px-3 text-xs font-bold text-blue-200/70 tracking-wider uppercase">場次</th>
                  <th className="text-right py-3 px-5 text-xs font-bold text-blue-300 tracking-wider uppercase">積分</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, index) => (
                  <tr
                    key={player.name}
                    className={`border-b border-blue-300/10 ${index < 4 ? "bg-emerald-400/[0.04]" : ""}`}
                  >
                    <td className="py-3 px-5">
                      <span className="text-2xl font-bold text-blue-300">{index + 1}</span>
                    </td>
                    <td className="py-3 px-5 font-bold text-white">{player.name}</td>
                    <td className="py-3 px-5 text-sm text-blue-200/70">{player.teamName}</td>
                    <td className="py-3 px-3 text-center font-mono text-white text-sm">
                      {player.first}/{player.second}/{player.third}/{player.fourth}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-blue-200/70 text-sm">{player.games}</td>
                    <td className="py-3 px-5 text-right">
                      <span className={`text-xl font-bold font-mono ${player.points >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                        {player.points > 0 ? "+" : ""}{player.points.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards — shows ~6 rows, scroll for the rest */}
          <div className="md:hidden space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {players.map((player, index) => (
              <div
                key={player.name}
                className={`flex items-center gap-3 p-3 rounded-lg border border-blue-300/15 ${index < 4 ? "bg-emerald-400/5" : "bg-blue-500/5"}`}
              >
                <span className="text-xl font-bold text-blue-300 w-7 text-center flex-shrink-0">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white truncate">{player.name}</div>
                  <div className="text-xs text-blue-200/60 truncate">{player.teamName}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-lg font-bold font-mono ${player.points >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {player.points > 0 ? "+" : ""}{player.points.toFixed(1)}
                  </div>
                  <div className="text-xs text-blue-200/60 font-mono">
                    {player.first}/{player.second}/{player.third}/{player.fourth} · {player.games}場
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
