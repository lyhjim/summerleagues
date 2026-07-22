"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowRight, Trophy } from "lucide-react"
import { useLanguage } from "@/lib/language-context"
import { useState, useEffect } from "react"
import { getAllNews } from "@/lib/supabase-data"

interface NewsItem {
  id: number
  date: string
  title: string
  category: string
}

export function NewsSection() {
  const { t } = useLanguage()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])

  useEffect(() => {
    const loadNews = async () => {
      try {
        const supabaseNews = await getAllNews()
        if (supabaseNews && supabaseNews.length > 0) {
          const formattedNews = supabaseNews.map((item: any) => {
            const content = JSON.parse(item.content)
            return {
              id: item.id,
              date: content.date,
              title: content.title,
              category: content.category,
            }
          })
          setNewsItems(formattedNews)
          return
        }
      } catch (error) {
        console.error("Error loading news from Supabase:", error)
      }

      // Fallback to localStorage
      const savedNews = localStorage.getItem("newsItems")
      if (savedNews) {
        setNewsItems(JSON.parse(savedNews))
      } else {
        // Default news items
        const defaultNews = [
          {
            id: 1,
            date: "2026年1月10日",
            title: "Team 天鳳連續三週領先積分榜",
            category: "賽事動態",
          },
          {
            id: 2,
            date: "2026年1月9日",
            title: "第2週直播桌精彩回顧",
            category: "直播",
          },
          {
            id: 3,
            date: "2026年1月8日",
            title: "初賽階段進度更新：已完成14週中的2週",
            category: "賽程",
          },
          {
            id: 4,
            date: "2026年1月6日",
            title: "三麻邀金League 2026正式開賽",
            category: "聯賽新聞",
          },
          {
            id: 5,
            date: "2026年1月5日",
            title: "賽事規則與積分計算說明",
            category: "公告",
          },
        ]
        setNewsItems(defaultNews)
      }
    }

    loadNews()

    const handleNewsUpdate = () => {
      loadNews()
    }

    window.addEventListener("newsUpdated", handleNewsUpdate)
    return () => window.removeEventListener("newsUpdated", handleNewsUpdate)
  }, [])

  return (
    <Card className="bg-card border-border h-fit sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-foreground">{t.latestNews}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsItems.map((item, idx) => (
            <div
              key={item.id}
              className={`group cursor-pointer ${idx !== newsItems.length - 1 ? "pb-4 border-b border-border" : ""}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  {item.category === "公告" || item.title.includes("賽事規則") ? (
                    <Trophy className="w-5 h-5 text-primary" />
                  ) : (
                    <Calendar className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                  <h3 className="text-sm font-medium text-foreground leading-snug mb-1 group-hover:text-primary transition-colors text-balance">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </div>
          ))}
        </div>
        <button className="w-full mt-4 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">
          {t.viewAll}
        </button>
      </CardContent>
    </Card>
  )
}
