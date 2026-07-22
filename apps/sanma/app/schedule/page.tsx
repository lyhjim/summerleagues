"use client"

import { useState, useEffect } from "react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileMenu } from "@/components/mobile-menu"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MatchCard } from "@/components/match-card"
import { getMatchesByMonth } from "@/lib/match-data"
import { getAllMatchResults } from "@/lib/supabase-data"

export default function SchedulePage() {
  const { t } = useLanguage()
  const [selectedMonth, setSelectedMonth] = useState(1) // January by default
  const [isLoading, setIsLoading] = useState(true)
  const [matchResults, setMatchResults] = useState<any[]>([])
  const matches = getMatchesByMonth(selectedMonth)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const results = await getAllMatchResults()
        setMatchResults(results || [])
      } catch (error) {
        console.error("[v0] Error loading match results:", error)
        setMatchResults([])
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [selectedMonth])

  const months = [
    { value: 1, label: "一月" },
    { value: 2, label: "二月" },
    { value: 3, label: "三月" },
    { value: 4, label: "四月" },
  ]

  const matchesByDate = matches.reduce(
    (acc, match) => {
      if (!acc[match.date]) {
        acc[match.date] = []
      }
      acc[match.date].push(match)
      return acc
    },
    {} as Record<string, typeof matches>,
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 min-w-0">
            <img
              src="/images/summer-desktop-logo.png"
              alt="Summer Logo"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            <div className="md:hidden">
              <MobileMenu isAdmin={false} onAdminClick={() => {}} onLoginClick={() => {}} onLogout={() => {}} />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.home}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">賽程表</h1>
          <p className="text-muted-foreground">{t.leagueTitle}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(matchesByDate).map(([date, matches]) => (
              <Card key={date} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    {matches[0].dayOfWeek} - {date}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match, index) => (
                      <MatchCard
                        key={`${match.date}-${match.table}-${index}`}
                        match={match}
                        preloadedResults={matchResults}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Month filter buttons at bottom */}
        <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-primary/20">
          <p className="text-sm text-muted-foreground mb-3 text-center">選擇月份查看賽程</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {months.map((month) => (
              <Button
                key={month.value}
                variant={selectedMonth === month.value ? "default" : "outline"}
                onClick={() => setSelectedMonth(month.value)}
                className="min-w-20"
              >
                {month.label}
              </Button>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
