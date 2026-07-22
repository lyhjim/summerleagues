import { getTeamStandings } from "@/lib/redis"
import { teamsData } from "@/lib/teams-data"

export default async function StandingsTable() {
  const standings = await getTeamStandings()
  
  // Convert to array and sort by total points (descending)
  const sortedStandings = Object.values(standings)
    .sort((a, b) => b.totalPoints - a.totalPoints)
  
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-foreground">總排名</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-foreground/20 bg-foreground/5">
              <th className="px-4 py-3 text-left text-sm font-semibold">排名</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">隊伍</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">總分</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">場數</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">一位</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">二位</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">三位</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">四位</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((standing, index) => {
              const team = teamsData[standing.teamId]
              if (!team) return null
              
              return (
                <tr key={standing.teamId} className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors">
                  <td className="px-4 py-3 font-semibold text-foreground">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{team.chineseName}</td>
                  <td className="px-4 py-3 text-center font-bold text-lg">{standing.totalPoints >= 0 ? <span className="text-green-400">{standing.totalPoints > 0 ? '+' : ''}{standing.totalPoints}</span> : <span className="text-red-400">{standing.totalPoints}</span>}</td>
                  <td className="px-4 py-3 text-center text-foreground/80">{standing.gamesPlayed}</td>
                  <td className="px-4 py-3 text-center text-foreground/80">{standing.positions.first}</td>
                  <td className="px-4 py-3 text-center text-foreground/80">{standing.positions.second}</td>
                  <td className="px-4 py-3 text-center text-foreground/80">{standing.positions.third}</td>
                  <td className="px-4 py-3 text-center text-foreground/80">{standing.positions.fourth}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      
      {sortedStandings.length === 0 && (
        <div className="text-center py-8 text-foreground/50">
          尚無比賽結果
        </div>
      )}
    </div>
  )
}
