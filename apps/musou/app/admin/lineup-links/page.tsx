"use client"

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { verifyAdminSecret } from "@/app/admin/actions"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

interface Team {
  team_name: string
  access_token: string
}

export default function AdminLineupLinksPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [secret, setSecret] = useState("")
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [currentTab, setCurrentTab] = useState<"links" | "dashboard">("dashboard")

  useEffect(() => {
    // Check if already authenticated (stored in session)
    const isAuth = sessionStorage.getItem("lineupAdminAuth") === "true"
    if (isAuth) {
      setAuthenticated(true)
      // Fetch teams with proper loading state
      fetchTeams()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/admin/lineup-links")
      if (response.ok) {
        const data = await response.json()
        setTeams(data.teams)
      } else {
        setError("無法載入隊伍信息")
      }
    } catch (err) {
      console.error("[v0] Error fetching teams:", err)
      setError("載入失敗")
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const isValid = await verifyAdminSecret(secret)
      
      if (isValid) {
        setAuthenticated(true)
        sessionStorage.setItem("lineupAdminAuth", "true")
        setSecret("")
        setError("")
        await fetchTeams()
      } else {
        setError("密鑰錯誤，請重試")
        setSecret("")
      }
    } catch (err) {
      console.error("[v0] Error verifying secret:", err)
      setError("驗證失敗，請重試")
      setSecret("")
    } finally {
      setLoading(false)
    }
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">載入中...</div>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-background">
        {/* Navigation */}
        <div className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-foreground">夏季選拔賽 - 隊伍申報鏈接</h1>
          </div>
        </div>

        {/* Login Section */}
        <section className="max-w-md mx-auto px-4 py-12">
          <div className="rounded-lg border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-bold text-foreground mb-6">管理員認證</h2>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="secret" className="block text-sm font-semibold text-foreground mb-2">
                  輸入管理員密鑰
                </label>
                <input
                  id="secret"
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="輸入密鑰..."
                  disabled={loading}
                  className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
              </div>

              {error && <div className="text-sm text-red-400">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity font-semibold disabled:opacity-50"
              >
                {loading ? "驗證中..." : "確認"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground mt-6">
              此頁面包含敏感信息。只有授權用戶可以訪問。
            </p>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-foreground">夏季選拔賽 - 管理後台</h1>
          <button
            onClick={() => {
              sessionStorage.removeItem("lineupAdminAuth")
              setAuthenticated(false)
            }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            登出
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10 bg-white/5">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setCurrentTab("dashboard")}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                currentTab === "dashboard"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              管理儀表板
            </button>
            <button
              onClick={() => setCurrentTab("links")}
              className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                currentTab === "links"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              申報鏈接
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        {currentTab === "dashboard" && <AdminDashboard />}

        {currentTab === "links" && (
          <div className="space-y-6">
            <div>
              <p className="text-muted-foreground mb-6">
                以下是每個隊伍的專屬申報鏈接。請分享給各隊伍負責人。
              </p>
            </div>

            {error && <div className="text-sm text-red-400">{error}</div>}

            <div className="space-y-4">
              {teams.map((team) => {
                const FINALS_TEAMS = ["鬼點子", "層層疊", "雙狙人", "疾風勁草"]
                const isEliminated = !FINALS_TEAMS.includes(team.team_name)
                const isFinalTeam = FINALS_TEAMS.includes(team.team_name)

                return (
                  <div
                    key={team.team_name}
                    className={`rounded-lg border p-6 transition-opacity ${
                      isEliminated
                        ? "border-red-400/20 bg-red-400/5 opacity-60"
                        : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">{team.team_name}</h3>
                      {isEliminated && (
                        <span className="text-xs font-bold px-2 py-1 bg-red-400/30 rounded text-red-300">
                          已淘汰
                        </span>
                      )}
                      {isFinalTeam && (
                        <span className="text-xs font-bold px-2 py-1 bg-emerald-400/30 rounded text-emerald-300">
                          決賽隊伍
                        </span>
                      )}
                    </div>

                    {isEliminated ? (
                      <div className="text-sm text-red-300">
                        此隊伍已被淘汰，不再需要提交選手信息
                      </div>
                    ) : (
                      <>
                        <div className="bg-black/20 rounded-lg p-4 mb-4">
                          <code className="text-sm text-green-300 break-all">
                            {`${baseUrl}/lineups/${team.access_token}`}
                          </code>
                        </div>

                        <button
                          onClick={() => {
                            const link = `${baseUrl}/lineups/${team.access_token}`
                            navigator.clipboard.writeText(link)
                            alert("鏈接已複製到剪貼板")
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-80 transition-opacity text-sm font-semibold"
                        >
                          複製鏈接
                        </button>
                        {isFinalTeam && (
                          <p className="text-xs text-emerald-300 mt-3">
                            此隊伍可提交決賽 (Game 37-40) 的選手信息和照片
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="bg-blue-400/10 border border-blue-400/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                提示：這些是一次性使用的安全鏈接。每個隊伍都有唯一的鏈接，無需登錄即可提交選手信息。
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
