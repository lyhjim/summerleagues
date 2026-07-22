import Image from "next/image"
import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { teamsData } from "@/lib/teams-data"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "天月麻雀 | 立直無雙聯賽",
  description: "天月兇萌戰隊閃亮登場！重磅來襲日麻直播賽！",
}

const TEAM_ID = "amatsuki"

export default function AmatsukiPage() {
  const team = teamsData[TEAM_ID]

  if (!team) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">隊伍未找到</h1>
          <Link href="/" className="text-primary hover:text-primary/80">返回主頁</Link>
        </div>
      </main>
    )
  }

  const playersList = team.players || []

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="border-b border-white/10 pt-16">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回主頁
          </Link>

          <div className="flex items-start gap-6 mb-8">
            {team.logo && (
              <Image
                src={team.logo}
                alt={team.chineseName}
                width={100}
                height={100}
                className="object-contain w-24 h-24 flex-shrink-0"
                priority
              />
            )}
            <div>
              <h1 className="text-5xl font-bold mb-4">{team.chineseName}</h1>
              <p className="text-lg text-foreground/80 leading-relaxed text-pretty">{team.teamIntro}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supervisor */}
      <section className="border-b border-white/10">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">監督</h2>
          <div className="bg-card rounded-lg border border-white/10 p-6">
            <h3 className="text-xl font-bold mb-2">{team.supervisor.name}</h3>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap text-sm">{team.supervisor.intro}</p>
          </div>
        </div>
      </section>

      {/* Players Grid */}
      <section className="border-b border-white/10">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">隊員</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {playersList.map((player) => (
              <div key={player.name} className="flex flex-col items-center text-center">
                {player.photoUrl ? (
                  <Image
                    src={player.photoUrl}
                    alt={player.name}
                    width={40}
                    height={40}
                    className="w-16 h-16 rounded-full object-cover mb-3 border border-white/10"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3 border border-white/10">
                    <span className="text-sm font-bold">{player.name[0]}</span>
                  </div>
                )}
                <h3 className="text-sm font-bold text-foreground">{player.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* League Stats */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="container mx-auto max-w-4xl px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">聯賽成績</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <span className="text-xs text-foreground/50 uppercase tracking-wider block mb-2">總排名</span>
              <span className="text-3xl font-bold">--</span>
            </div>
            <div>
              <span className="text-xs text-foreground/50 uppercase tracking-wider block mb-2">總分</span>
              <span className="text-3xl font-bold">--</span>
            </div>
            <div>
              <span className="text-xs text-foreground/50 uppercase tracking-wider block mb-2">平均分</span>
              <span className="text-3xl font-bold">--</span>
            </div>
            <div>
              <span className="text-xs text-foreground/50 uppercase tracking-wider block mb-2">比賽數</span>
              <span className="text-3xl font-bold">--</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
