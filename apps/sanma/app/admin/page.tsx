"use client"

import type React from "react"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar, Trash2, Edit, Plus, ArrowLeft, Download, Upload, Database, Tv, Search } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"
import { migrateLocalStorageToSupabase, getAllMatchResults } from "@/lib/supabase-data"
import { createClient } from "@/lib/supabase-client"
import { matchSchedule } from "@/lib/match-data"

interface NewsItem {
  id: number
  date: string
  title: string
  category: string
}

function AdminPageContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<string>("")
  const [livestreamUrl, setLivestreamUrl] = useState<string>("")
  const [editResultsMatch, setEditResultsMatch] = useState<string>("")
  const [currentResults, setCurrentResults] = useState<any>(null)
  const [isLoadingResults, setIsLoadingResults] = useState(false)
  const [viewingResults, setViewingResults] = useState<any>(null)

  useEffect(() => {
    const adminStatus = localStorage.getItem("isAdmin") === "true"
    if (!adminStatus) {
      router.push("/")
      return
    }
    setIsAdmin(true)

    // Load news items from localStorage
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
      localStorage.setItem("newsItems", JSON.stringify(defaultNews))
    }
  }, [router])

  const saveNews = (items: NewsItem[]) => {
    localStorage.setItem("newsItems", JSON.stringify(items))
    setNewsItems(items)
  }

  const handleAdd = () => {
    if (!formData.date || !formData.title || !formData.category) return

    const newItem: NewsItem = {
      id: Date.now(),
      date: formData.date,
      title: formData.title,
      category: formData.category,
    }

    const updated = [newItem, ...newsItems]
    saveNews(updated)
    setFormData({ date: "", title: "", category: "" })
    setIsAdding(false)
  }

  const handleEdit = (id: number) => {
    const item = newsItems.find((n) => n.id === id)
    if (item) {
      setFormData({
        date: item.date,
        title: item.title,
        category: item.category,
      })
      setEditingId(id)
    }
  }

  const handleUpdate = () => {
    if (!formData.date || !formData.title || !formData.category || !editingId) return

    const updated = newsItems.map((item) =>
      item.id === editingId
        ? {
            ...item,
            date: formData.date,
            title: formData.title,
            category: formData.category,
          }
        : item,
    )

    saveNews(updated)
    setFormData({ date: "", title: "", category: "" })
    setEditingId(null)
  }

  const handleDelete = (id: number) => {
    if (confirm(t.deleteConfirm)) {
      const updated = newsItems.filter((item) => item.id !== id)
      saveNews(updated)
    }
  }

  const handleCancel = () => {
    setFormData({ date: "", title: "", category: "" })
    setEditingId(null)
    setIsAdding(false)
  }

  const [isExporting, setIsExporting] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleExportData = async (part: 1 | 2 | 3) => {
    setIsExporting(true)
    try {
      const supabase = createClient()
      
      // Fetch all records without caching
      const { data: supabaseResults, error } = await supabase
        .from("match_results")
        .select("match_id, round, date, results")
        .order("date", { ascending: true })

      console.log("[v0] Export results count:", supabaseResults?.length, "Error:", error)
      
      if (error) {
        alert("數據查詢失敗: " + error.message + "\nData query failed: " + error.message)
        return
      }

      if (!supabaseResults || supabaseResults.length === 0) {
        alert("沒有找到數據。No data found.")
        return
      }

      // Split into 3 parts
      const totalRecords = supabaseResults.length
      const partSize = Math.ceil(totalRecords / 3)
      const startIndex = (part - 1) * partSize
      const endIndex = Math.min(part * partSize, totalRecords)
      const partResults = supabaseResults.slice(startIndex, endIndex)

      const dataToExport = {
        source: "supabase",
        exportDate: new Date().toISOString(),
        part: part,
        totalParts: 3,
        recordsInPart: partResults.length,
        totalRecords: totalRecords,
        startIndex: startIndex,
        endIndex: endIndex,
        matchResults: partResults
      }

      // Create downloadable file
      const dataStr = JSON.stringify(dataToExport, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `mahjong-results-part${part}-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      alert(`Part ${part} 導出成功！共 ${partResults.length} 條記錄 (${startIndex + 1}-${endIndex} of ${totalRecords}).\nPart ${part} exported! ${partResults.length} records.`)
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("導出失敗: " + (error instanceof Error ? error.message : "Unknown error") + "\nExport failed.")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Import all results data
        let count = 0
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("results-")) {
            localStorage.setItem(key, JSON.stringify(value))
            count++
          }
        }

        // Dispatch events to refresh all components
        window.dispatchEvent(new Event("resultsSubmitted"))
        window.dispatchEvent(new Event("resultsUpdated"))

        alert(`成功導入 ${count} 條記錄！Successfully imported ${count} records!`)
        window.location.reload()
      } catch (error) {
        alert("導入失敗，請檢查文件格式。Import failed, please check file format.")
        console.error("Import error:", error)
      }
    }
    reader.readAsText(file)
  }

  const handleMigrateToSupabase = async () => {
    if (
      !confirm(
        "確認將localStorage數據遷移到Supabase？這將使所有用戶都能看到數據。\n\nConfirm migrating localStorage data to Supabase? This will make data visible to all users.",
      )
    ) {
      return
    }

    setIsMigrating(true)
    try {
      const result = await migrateLocalStorageToSupabase()
      alert(
        `成功遷移 ${result?.results || 0} 場比賽結果和 ${result?.lineups || 0} 個陣容！\n\nSuccessfully migrated ${result?.results || 0} match results and ${result?.lineups || 0} lineups!`,
      )
      window.location.reload()
    } catch (error) {
      console.error("[v0] Migration error:", error)
      alert("遷移失敗，請查看控制台了解詳情。\n\nMigration failed, check console for details.")
    } finally {
      setIsMigrating(false)
    }
  }

  const handleSaveLivestreamUrl = () => {
    if (!selectedMatch || !livestreamUrl) return

    const livestreamLinks = JSON.parse(localStorage.getItem("livestreamLinks") || "{}")
    livestreamLinks[selectedMatch] = livestreamUrl
    localStorage.setItem("livestreamLinks", JSON.stringify(livestreamLinks))

    // Dispatch event to update match cards
    window.dispatchEvent(new Event("livestreamLinksUpdated"))

    setSelectedMatch("")
    setLivestreamUrl("")
    alert("直播連結已保存 / Livestream URL saved")
  }

  const handleLoadResults = async () => {
    if (!editResultsMatch) return

    setIsLoadingResults(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("match_results").select("*").eq("match_id", editResultsMatch)

      if (error) {
        console.error("[v0] Error loading results:", error)
        // Fall back to localStorage
        const localResults = localStorage.getItem(`results-${editResultsMatch}`)
        if (localResults) {
          setCurrentResults(JSON.parse(localResults))
        } else {
          alert("未找到該場比賽的結果 / No results found for this match")
          setCurrentResults(null)
        }
      } else {
        if (data && data.length > 0) {
          setCurrentResults(data)
        } else {
          alert("未找到該場比賽的結果 / No results found for this match")
          setCurrentResults(null)
        }
      }
    } catch (error) {
      console.error("[v0] Error loading results:", error)
      alert("載入失敗 / Failed to load results")
    } finally {
      setIsLoadingResults(false)
    }
  }

  const handleEditResults = async () => {
    if (!editResultsMatch) return

    // Fetch current results from Supabase
    const results = await getAllMatchResults()
    const matchResults = results.filter((r: any) => (r.match_id || r.matchId) === editResultsMatch)

    if (matchResults.length === 0) {
      alert(t.noResultsFound || "No results found for this match")
      return
    }

    // Pre-fill the form by scrolling to submit section and showing a note
    const submitSection = document.getElementById("submit-results-section")
    if (submitSection) {
      submitSection.scrollIntoView({ behavior: "smooth" })
      alert(
        `請在下方的提交成績表單中編輯 ${editResultsMatch} 的成績\n\nPlease edit the results for ${editResultsMatch} in the form below`,
      )
    }

    setViewingResults(null)
    setEditResultsMatch("")
  }

  useEffect(() => {
    if (!isAdmin) return

    const livestreamLinks = JSON.parse(localStorage.getItem("livestreamLinks") || "{}")
    // Pre-populate if URL exists for selected match
    if (selectedMatch && livestreamLinks[selectedMatch]) {
      setLivestreamUrl(livestreamLinks[selectedMatch])
    }
  }, [selectedMatch, isAdmin])

  const [formData, setFormData] = useState({
    date: "",
    title: "",
    category: "",
  })

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>
            <h1 className="text-xl font-bold text-foreground">{t.adminPanelTitle}</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">決賽數據 Finals Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">清除所有決賽記錄</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all finals results and lineups from storage. Use this to start fresh.
                </p>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("確定要清除所有決賽數據嗎？此操作不可撤銷。\nAre you sure? This cannot be undone.")) return
                    const res = await fetch("/api/finals-results?clearAll=true", { method: "DELETE" })
                    if (res.ok) {
                      alert("所有決賽數據已清除。All finals data cleared.")
                    } else {
                      alert("清除失敗，請重試。Failed to clear data.")
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除所有決賽數據 Clear All Finals Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">準決賽數據 Semi-Finals Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">清除所有準決賽記錄</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will permanently delete all semi-finals results and lineups from storage. Use this to start fresh.
                </p>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm("確定要清除所有準決賽數據嗎？此操作不可撤銷。\nAre you sure? This cannot be undone.")) return
                    const res = await fetch("/api/semi-finals-results?clearAll=true", { method: "DELETE" })
                    if (res.ok) {
                      alert("所有準決賽數據已清除。All semi-finals data cleared.")
                    } else {
                      alert("清除失敗，請重試。Failed to clear data.")
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  清除所有準決賽數據 Clear All Semi-Finals Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">數據管理 Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Supabase 數據庫遷移</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  將localStorage中的所有比賽數據遷移到Supabase數據庫，讓所有訪問者都能看到排行榜。
                  <br />
                  Migrate all match data from localStorage to Supabase database so all visitors can see the rankings.
                </p>
                <Button
                  onClick={handleMigrateToSupabase}
                  disabled={isMigrating}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Database className="w-4 h-4 mr-2" />
                  {isMigrating ? "遷移中... Migrating..." : "遷移到 Supabase Migrate to Supabase"}
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                <p className="text-sm font-medium">導出數據 (分3部分) Export Data (Split into 3 parts):</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleExportData(1)}
                    disabled={isExporting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "導出中..." : "Part 1 (1-70)"}
                  </Button>
                  <Button
                    onClick={() => handleExportData(2)}
                    disabled={isExporting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "導出中..." : "Part 2 (71-140)"}
                  </Button>
                  <Button
                    onClick={() => handleExportData(3)}
                    disabled={isExporting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "導出中..." : "Part 3 (141-210)"}
                  </Button>
                </div>
                <Button
                  onClick={() => document.getElementById("import-file")?.click()}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  導入數據 Import Data
                </Button>
                <input id="import-file" type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <Button
                  onClick={async () => {
                    setIsDownloading(true)
                    try {
                      const res = await fetch("/api/download-yakumans")
                      const blob = await res.blob()
                      const url = URL.createObjectURL(blob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `yakuman-photos-${new Date().toISOString().split("T")[0]}.zip`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                      alert("役滿照片已下載！All yakuman photos downloaded!")
                    } catch (error) {
                      console.error("[v0] Download error:", error)
                      alert("下載失敗，請重試。Download failed.")
                    } finally {
                      setIsDownloading(false)
                    }
                  }}
                  disabled={isDownloading}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isDownloading ? "下載中... Downloading..." : "下載役滿照片 Download Yakuman Photos (ZIP)"}
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      const res = await fetch("/api/export-yakumans")
                      const data = await res.json()
                      if (data.error) {
                        alert("導出失敗: " + data.error)
                        return
                      }
                      const dataStr = JSON.stringify(data, null, 2)
                      const dataBlob = new Blob([dataStr], { type: "application/json" })
                      const url = URL.createObjectURL(dataBlob)
                      const link = document.createElement("a")
                      link.href = url
                      link.download = `yakuman-photos-${new Date().toISOString().split("T")[0]}.json`
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)
                      alert(`導出成功！共 ${data.totalYakumans} 張役滿照片。\nExported ${data.totalYakumans} yakuman photos.`)
                    } catch (error) {
                      alert("導出失敗，請重試。Export failed.")
                    }
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  導出役滿照片 Export Yakuman Photos (JSON)
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                使用導出功能將所有比賽結果保存為JSON文件，然後在發布的網站上使用導入功能恢復數據。
                <br />
                Use Export to save all match results as a JSON file, then use Import on the published site to restore
                the data.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                編輯比賽結果 / Edit Match Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                選擇一場已提交結果的比賽，查看或修改其分數。
                <br />
                Select a match with submitted results to view or edit its scores.
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">選擇比賽 / Select Match</label>
                  <select
                    value={editResultsMatch}
                    onChange={(e) => {
                      setEditResultsMatch(e.target.value)
                      setCurrentResults(null)
                    }}
                    className="w-full p-2 rounded border bg-background"
                  >
                    <option value="">-- 選擇比賽 / Select Match --</option>
                    {matchSchedule.map((match) => {
                      const matchId = `${match.date}-${match.table}`
                      return (
                        <option key={matchId} value={matchId}>
                          {match.date} {match.table} - {match.teams.join(" vs ")}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleLoadResults}
                    disabled={!editResultsMatch || isLoadingResults}
                    className="flex-1"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isLoadingResults ? "載入中... / Loading..." : "查看結果 / View Results"}
                  </Button>
                  <Button
                    onClick={handleEditResults}
                    disabled={!editResultsMatch}
                    variant="secondary"
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    編輯 / Edit
                  </Button>
                </div>
              </div>

              {currentResults && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                  <h4 className="font-semibold mb-3">當前結果 / Current Results</h4>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>比賽ID / Match ID:</strong> {currentResults.match_id || editResultsMatch}
                    </p>
                    <p>
                      <strong>回合 / Round:</strong> {currentResults.round || "N/A"}
                    </p>
                    {currentResults.results && (
                      <div>
                        <strong>各局分數 / Game Scores:</strong>
                        <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto">
                          {JSON.stringify(currentResults.results, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                直播連結管理 / Livestream URL Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">選擇比賽 / Select Match</label>
                  <select
                    value={selectedMatch}
                    onChange={(e) => setSelectedMatch(e.target.value)}
                    className="w-full p-2 rounded border bg-background"
                  >
                    <option value="">-- 選擇比賽 / Select Match --</option>
                    {matchSchedule
                      .filter((m) => m.isLivestream)
                      .map((match) => {
                        const matchId = `${match.date}-${match.table}`
                        return (
                          <option key={matchId} value={matchId}>
                            {match.date} {match.table} - {match.teams.join(" vs ")}
                          </option>
                        )
                      })}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">直播連結 / Livestream URL</label>
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/live/..."
                    value={livestreamUrl}
                    onChange={(e) => setLivestreamUrl(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleSaveLivestreamUrl} disabled={!selectedMatch || !livestreamUrl}>
                <Plus className="h-4 w-4 mr-2" />
                保存直播連結 / Save Livestream URL
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold">{t.newsManagement}</CardTitle>
              <Button
                onClick={() => setIsAdding(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isAdding || editingId !== null}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t.addNews}
              </Button>
            </CardHeader>
            <CardContent>
              {(isAdding || editingId !== null) && (
                <Card className="mb-6 border-primary/50">
                  <CardHeader>
                    <CardTitle className="text-lg">{editingId ? t.editNews : t.addNews}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">{t.newsDate}</label>
                      <Input
                        type="text"
                        placeholder={t.datePlaceholder}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">{t.newsTitle}</label>
                      <Input
                        type="text"
                        placeholder={t.titlePlaceholder}
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">{t.newsCategory}</label>
                      <Input
                        type="text"
                        placeholder={t.categoryPlaceholder}
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={editingId ? handleUpdate : handleAdd} className="flex-1">
                        {editingId ? t.update : t.add}
                      </Button>
                      <Button onClick={handleCancel} variant="outline" className="flex-1 bg-transparent">
                        {t.cancel}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {newsItems.map((item) => (
                  <Card key={item.id} className={editingId === item.id ? "border-primary/50" : ""}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">{item.date}</p>
                          <h3 className="text-sm font-medium text-foreground leading-snug mb-1">{item.title}</h3>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(item.id)}
                            disabled={isAdding || editingId !== null}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            disabled={isAdding || editingId !== null}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={null}>
      <AdminPageContent />
    </Suspense>
  )
}
