import { Calendar, Users, Play, Trophy } from "lucide-react"

export function Timeline() {
  const events = [
    {
      icon: Calendar,
      title: "夏季隊際選拔賽截止報名",
      date: "6月4日",
      description: "",
    },
    {
      icon: Calendar,
      title: "夏季隊際選拔賽名單公佈",
      date: "6月11日前",
      description: "",
    },
    {
      icon: Trophy,
      title: "春季賽常規賽最後比賽日及頒獎儀式",
      date: "6月11日",
      description: "",
    },
    {
      icon: Users,
      title: "春季賽隊伍提交續約名單",
      date: "6月15日",
      description: "即使不需強制換人的隊伍仍然可選擇換人",
    },
    {
      icon: Play,
      title: "夏季隊際選拔賽",
      date: "6月15日 - 7月2日",
      description: "",
    },
    {
      icon: Users,
      title: "夏季賽指名會議",
      date: "7月8日",
      description: "各隊伍完成隊伍構成",
    },
    {
      icon: Play,
      title: "香港立直無雙聯賽夏季賽",
      date: "7月27日開始",
      description: "",
    },
    {
      icon: Trophy,
      title: "全年總決賽無雙盃",
      date: "12月",
      description: "",
    },
  ]

  return (
    <section id="schedule" className="py-20 px-4 bg-card/30">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-4xl md:text-5xl font-extrabold text-center mb-4 text-balance">
          賽季<span className="text-secondary">時間表</span>
        </h2>
        <p className="text-center text-muted-foreground mb-16 text-pretty">2026重要日期</p>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border md:left-1/2" />

          <div className="space-y-12">
            {events.map((event, index) => (
              <div key={index} className="relative">
                <div className="flex items-start gap-6 md:gap-0">
                  {/* Icon */}
                  <div className="relative z-10 size-12 rounded-full bg-card border-2 border-primary flex items-center justify-center md:absolute md:left-1/2 md:-translate-x-1/2">
                    <event.icon className="size-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div
                    className={`flex-1 break-words ${index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12 md:ml-auto"} md:w-1/2`}
                  >
                    <h3 className="text-2xl font-bold mb-2 break-words">{event.title}</h3>
                    <p className="text-primary font-semibold mb-3 break-words">{event.date}</p>
                    {event.description && (
                      <p className="text-muted-foreground text-pretty break-words whitespace-pre-line">
                        {event.youtubeLink ? (
                          <a
                            href={event.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline transition-colors"
                          >
                            {event.description}
                          </a>
                        ) : (
                          event.description
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
