"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileMenu } from "@/components/mobile-menu"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft, Calendar, Trophy } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RulesPage() {
  const { t } = useLanguage()

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.home}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">{t.rulesTitle}</h1>
          <p className="text-muted-foreground">{t.leagueTitle}</p>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                賽事概覽
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90">
              <p>• 15 隊參賽，每隊 3 名選手</p>
              <p>• 三人麻雀賽制</p>
              <p>• 賽事分為三個階段：初賽、準決賽、決賽</p>
            </CardContent>
          </Card>

          {/* Stage 1 */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                1) 初賽階段
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90">
              <p className="font-semibold text-foreground">
                時間：2026 年 1 月 6 日至 4 月 24 日（逢星期二、三、四及五）
              </p>

              <div className="space-y-2 pl-4">
                <p>• 初賽共進行 14 個星期</p>
                <p>• 逢星期二至五進行，每週共 4 個賽日，每隊打其中一或兩日（長短週）</p>
                <p>• 每日有兩張比賽桌（雙數週星期五只有一張）</p>
                <p>• 星期三及五其中一張為直播桌，設有旁述（星期三由第4週開始直播）</p>
                <p>• 每隊共出席其中 21 個賽日，共 126 半莊。每位選手需要至少完成 7 輪賽事</p>
                <p>• 每隊會有相同直播次數，及與其他隊伍相同對決次數</p>
              </div>

              <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="font-semibold text-primary">晉級規則</p>
                <p className="mt-2">初賽總分最多 9 隊進入準決賽</p>
                <p className="text-xs text-muted-foreground mt-1">
                  同分時，先比較初賽隊伍一位數量，再比較初賽最高分半莊枚數，次高分半莊枚數，如此類推
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stage 2 */}
          <Card className="border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                2) 準決賽階段
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90">
              <p className="font-semibold text-foreground">初賽總分折半帶入準決賽（小數點進位）</p>

              <div className="space-y-2 pl-4">
                <p>• 準決賽共進行 4 個星期</p>
                <p>• 逢星期二、三及五進行，每週共 3 個賽日，每隊打兩日</p>
                <p>• 每日兩張比賽桌，其中一張為直播桌，設有旁述</p>
                <p>• 每隊共出席其中 8 個賽日，共 48 半莊。每位選手需要至少完成 2 輪賽事</p>
                <p>• 每隊會有相同直播次數，及與其他隊伍相同對決次數</p>
              </div>

              <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="font-semibold text-accent">晉級規則</p>
                <p className="mt-2">準決賽總分最多 3 隊進入決賽</p>
                <p className="text-xs text-muted-foreground mt-1">
                  同分時，先晉級沒有用小數點進位的隊伍，再比較隊伍準決賽一位數量，之後再比較準決賽最高分半莊枚數，次高分半莊枚數，如此類推
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stage 3 */}
          <Card className="border-chart-2/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-chart-2" />
                3) 決賽階段
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90">
              <p className="font-semibold text-foreground">準決賽總分折半帶入決賽（小數點進位）</p>

              <div className="space-y-2 pl-4">
                <p>• 決賽共三日</p>
                <p>• 6 月 3 及 5 日每日兩輪（20:00 - 23:15）</p>
                <p>• 6 月 7 日四輪（14:00 - 21:00）</p>
                <p>• 每日只有一張比賽直播桌，設有旁述</p>
              </div>

              <div className="mt-4 p-4 bg-chart-2/10 rounded-lg border border-chart-2/20">
                <p className="font-semibold text-chart-2">冠軍決定</p>
                <p className="mt-2">按照總分決定三麻邀金League 2026 冠亞季軍隊伍</p>
                <p className="text-xs text-muted-foreground mt-1">
                  同分時，先晉級沒有用小數點進位的隊伍，再比較決賽隊伍一位數量，之後再比較決賽最高分半莊枚數，次高分半莊枚數，如此類推
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
