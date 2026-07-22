import { Navigation } from "@/components/navigation"
import { LineupSettings } from "@/components/lineup-settings"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: "下場賽事設定 | 立直無雙聯賽",
  description: "管理下場賽事的隊員陣容",
}

export default function LineupSettingsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-16">
        <section className="py-12 px-4 border-b border-white/10">
          <div className="container mx-auto max-w-4xl">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              返回主頁
            </Link>

            <div className="flex items-center gap-4 mb-8">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-wider uppercase text-foreground">
                下場賽事設定
              </h1>
            </div>

            <p className="text-foreground/80 mb-6">
              在此設定下場比賽的隊員陣容。設定後，主頁的「下場賽事」區域將顯示相應選手的照片。
            </p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl">
            <LineupSettings />
          </div>
        </section>
      </div>
    </main>
  )
}
