"use client"

import { LeaderboardSection } from "@/components/leaderboard-section"

import { ScheduleSection } from "@/components/schedule-section"
import { LanguageSwitcher } from "@/components/language-switcher"
import { LineupEntryForm } from "@/components/lineup-entry-form"
import { ResultsSubmissionForm } from "@/components/results-submission-form"
import { SemiFinalsScoreInput } from "@/components/semi-finals-score-input"
import { FinalsScoreInput } from "@/components/finals-score-input"
import { ResultsReview } from "@/components/results-review"
import { AdminLogin } from "@/components/admin-login"
import { MobileMenu } from "@/components/mobile-menu"
import { SemiFinalsMVPRanking } from "@/components/semi-finals-mvp-ranking"
import { SemiFinalsIndividualMVP } from "@/components/semi-finals-individual-mvp"
import { ArchivedPhaseView } from "@/components/archived-phase-view"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { FileText, Scroll, Trophy, Youtube, Lock, Eye, Users } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getStaticMatchResults } from "@/lib/static-match-results"

const getAllMatches = () => {
  return []
}

export default function DashboardPage() {
  const { t, language } = useLanguage()
  const [isLineupFormOpen, setIsLineupFormOpen] = useState(false)
  const [isResultsFormOpen, setIsResultsFormOpen] = useState(false)
  const [isSemiFinalsResultsFormOpen, setIsSemiFinalsResultsFormOpen] = useState(false)
  const [isFinalsResultsFormOpen, setIsFinalsResultsFormOpen] = useState(false)
  const [isResultsReviewOpen, setIsResultsReviewOpen] = useState(false)
  const [currentLineup, setCurrentLineup] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  // Use static data — no Supabase fetch needed
  const matchResults = getStaticMatchResults()
  const isLoadingResults = false

  useEffect(() => {
    let isMounted = true
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    setIsAdmin(adminStatus)
  }, [])

  // Heavy localStorage migration removed - was causing memory issues

  const handleAdminClick = () => {
    if (isAdmin) {
      setIsLineupFormOpen(true)
    } else {
      setIsLoginOpen(true)
    }
  }

  const handleLineupFormOpen = () => {
    if (isAdmin) {
      setIsLineupFormOpen(true)
    } else {
      setIsLoginOpen(true)
    }
  }

  const handleResultsFormOpen = () => {
    if (isAdmin) {
      setIsResultsFormOpen(true)
    } else {
      setIsLoginOpen(true)
    }
  }

  const handleLineupSubmit = (lineupData: any) => {
    setIsLineupFormOpen(false)
    alert("陣容已保存！")
  }

  const handleResultsSubmit = (resultsData: any) => {
    const saveKey = `results-${resultsData.matchId}-${resultsData.round}`
    localStorage.setItem(
      saveKey,
      JSON.stringify({
        ...resultsData,
        timestamp: Date.now(),
      }),
    )
    setIsResultsFormOpen(false)
    setCurrentLineup(null)
    alert("成績已提交！")
  }

  const handleEditResult = (matchId: string, round: string) => {
    const savedLineup = localStorage.getItem(`lineup-${matchId}`)
    if (savedLineup) {
      const lineup = JSON.parse(savedLineup)
      setCurrentLineup(lineup)
      setIsResultsReviewOpen(false)
      setIsResultsFormOpen(true)
    }
  }

  const handleLoginSuccess = () => {
    setIsAdmin(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("isAdmin")
    setIsAdmin(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image
              src="/images/summer-desktop-logo.png"
              alt="Summer 森麻"
              width={120}
              height={40}
              className="object-contain md:w-[180px] md:h-[50px]"
            />
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {!isAdmin && language === "ja" && (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 border border-border rounded-lg hover:bg-accent/50"
                  title="管理員登入"
                >
                  <Lock className="w-4 h-4" />
                  <span className="hidden sm:inline">登入</span>
                </button>
              )}
              {isAdmin && (
                <>
                  <Link
                    href="/admin"
                    className="px-3 py-1.5 text-sm font-medium bg-accent text-accent-foreground hover:bg-accent/90 transition-colors rounded-lg flex items-center gap-1"
                  >
                    <Trophy className="w-4 h-4" />
                    <span className="hidden sm:inline">管理面板</span>
                  </Link>
                  <Button onClick={() => setIsSemiFinalsResultsFormOpen(true)} className="gap-2" size="sm" variant="secondary">
                    <FileText className="w-4 h-4" />
                    準決賽成績
                  </Button>
                  <Button onClick={() => setIsFinalsResultsFormOpen(true)} className="gap-2" size="sm" variant="default">
                    <Trophy className="w-4 h-4" />
                    決賽成績
                  </Button>
                  <Button onClick={() => setIsResultsReviewOpen(true)} className="gap-2" size="sm" variant="outline">
                    <Eye className="w-4 h-4" />
                    {t.adminPanel?.viewResults || "查看成績"}
                  </Button>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    title="登出管理員"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                </>
              )}
              <Link
                href="/about"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">{t.senmaIntroduction}</span>
              </Link>
              <Link
                href="/rules"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">{t.tournamentRules}</span>
              </Link>
              <Link
                href="/sanma-rules"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Scroll className="w-4 h-4" />
                <span className="hidden sm:inline">{t.sanmaRules}</span>
              </Link>
              <Link
                href="/schedule"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Youtube className="w-4 h-4" />
                <span className="hidden sm:inline">{t.matchSchedule}</span>
              </Link>
              <div className="hidden md:block">
                <LanguageSwitcher />
              </div>
            </div>
            <MobileMenu
              isAdmin={isAdmin}
              onAdminClick={handleAdminClick}
              onLoginClick={() => setIsLoginOpen(true)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 z-10">
          <div className="absolute inset-0 z-0">
            <picture>
              <source media="(max-width: 768px)" srcSet="/images/banner-hero-mobile.jpeg" />
              <source media="(min-width: 769px)" srcSet="/images/banner-hero.jpeg" />
              <img src="/images/banner-hero.jpeg" alt="League Banner" className="w-full h-full object-cover" />
            </picture>
          </div>

          <div className="relative z-10 p-6 sm:p-8 md:p-12">
            <div className="h-48 sm:h-40 md:h-48" />

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg shadow-primary/10">
                <p className="text-sm font-bold text-primary">{t.threePlayerMahjong}</p>
                <p className="text-xs text-foreground">{t.sanmaRules}</p>
              </div>
              <div className="px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-lg border border-accent/20 shadow-lg shadow-accent/10">
                <p className="text-sm font-bold text-primary">{t.totalTeams}</p>
                <p className="text-xs text-foreground">{t.playersPerTeam}</p>
              </div>
              <div className="px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-lg border border-primary/20 shadow-lg shadow-primary/10">
                <p className="text-sm font-bold text-primary">{t.currentStage}</p>
                <p className="text-xs text-foreground">{t.stageDates}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="https://www.youtube.com/@summermjhk"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg font-bold hover:shadow-xl hover:shadow-red-500/30 transition-all hover:scale-105 border border-red-400/50 flex items-center gap-2"
              >
                <Youtube className="w-5 h-5" />
                {t.viewLiveMatch}
              </a>
              <Link
                href="/schedule"
                className="px-6 py-2.5 bg-secondary/80 backdrop-blur-sm text-foreground rounded-lg font-bold hover:bg-secondary transition-all hover:scale-105 border border-accent/30"
              >
                {t.schedule}
              </Link>
            </div>
          </div>

          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute -left-12 -top-12 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <LeaderboardSection preloadedResults={matchResults} isLoading={isLoadingResults} />
          </div>

          <div>
            <SemiFinalsIndividualMVP />
          </div>

          <div>
            <ArchivedPhaseView compact={true} />
          </div>

          <div>
            <ScheduleSection preloadedResults={matchResults} isLoading={isLoadingResults} />
          </div>
        </div>
      </main>

      <AdminLogin isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onSuccess={handleLoginSuccess} />

      {isSemiFinalsResultsFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4">
          <div className="w-full max-w-2xl mx-4">
            <SemiFinalsScoreInput
              onClose={() => setIsSemiFinalsResultsFormOpen(false)}
            />
          </div>
        </div>
      )}

      {isFinalsResultsFormOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-4">
          <div className="w-full max-w-2xl mx-4">
            <FinalsScoreInput
              onClose={() => setIsFinalsResultsFormOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
