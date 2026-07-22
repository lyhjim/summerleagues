import { Users, Radio, Trophy } from "lucide-react"

export function LeagueOverview() {
  const features = [
    {
      icon: Users,
      title: "8支頂尖隊伍",
      description: "由贊助隊伍、培訓隊伍及自組隊伍組成，展開為期四個月的激烈角逐。",
    },
    {
      icon: Radio,
      title: "賽事全程直播",
      description: "3月9日 - 6月11日，逢星期一及四，每晚1930起打兩個半莊，全程直播。",
    },
    {
      icon: Trophy,
      title: "培訓隊伍",
      description: "參考日本M聯盟隊伍指名機制，透過培訓隊伍選拔，監督將選出最適合該隊的選手參戰無雙聯賽。",
    },
  ]

  return (
    <section className="py-16 px-4 bg-white/5 border-t border-b border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">聯賽特色</h2>
          <p className="text-muted-foreground">香港立直無雙聯賽的核心特色與賽制安排</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-4">
                  <Icon className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
