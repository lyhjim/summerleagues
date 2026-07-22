"use client"

import { useState, useEffect } from "react"
import { Lock, LogOut, AlertTriangle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ScoreInputSection } from "@/components/score-input-section"
import { ScoreGlobalView } from "@/components/score-global-view"
import { TeamColorSettings } from "@/components/team-color-settings"
import { cn } from "@/lib/utils"

const ADMIN_PASSWORD = "Overkneesocks!"
const AUTH_KEY = "tw_mahjong_admin_auth"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check localStorage for existing auth on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(AUTH_KEY)
    if (stored === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setError(false)
      localStorage.setItem(AUTH_KEY, "true")
    } else {
      setError(true)
      setPassword("")
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(AUTH_KEY)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm border border-border relative"
          style={{ boxShadow: "inset 0 0 60px oklch(0 0 0 / 0.4)" }}
        >
          {/* Corner accents */}
          <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 pointer-events-none" />
          <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 pointer-events-none" />

          <div className="px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-10 h-10 border border-primary/40 flex items-center justify-center bg-primary/5">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold tracking-tight text-foreground">
                  {"管理員登入"}
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-muted-foreground">
                  ADMIN ACCESS
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono tracking-widest text-muted-foreground mb-1.5">
                  PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError(false)
                  }}
                  placeholder="Enter admin password"
                  className={cn(
                    "w-full h-10 bg-secondary border text-sm font-mono px-3 text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors",
                    error ? "border-destructive" : "border-border focus:border-primary/60"
                  )}
                  autoFocus
                />
                {error && (
                  <div className="flex items-center gap-1.5 mt-2 text-destructive text-xs font-mono">
                    <AlertTriangle className="w-3 h-3" />
                    {"密碼錯誤 / INVALID PASSWORD"}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full relative px-4 py-2.5 text-[11px] font-mono tracking-widest font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border border-primary transition-all border-glow-cyan"
              >
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-primary-foreground/40" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-primary-foreground/40" />
                LOGIN
              </button>
            </form>

            <p className="text-[9px] font-mono tracking-wide text-muted-foreground/40 mt-4 text-center">
              {"// AUTHORIZED PERSONNEL ONLY"}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-primary/40 flex items-center justify-center bg-primary/5">
              <Lock className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold tracking-tight text-foreground">
                {"管理員面板"}
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-muted-foreground">
                ADMIN PANEL
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 border border-border hover:border-primary/30 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              MAIN PAGE
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-mono tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 border border-border hover:border-destructive/30 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-12">
        <ScoreInputSection />
        <ScoreGlobalView />
        <TeamColorSettings />
      </main>
    </div>
  )
}
