"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileMenu } from "@/components/mobile-menu"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SanmaRulesPage() {
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

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.home}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">三麻邀金League 規則</h1>
          <p className="text-sm text-muted-foreground">最新版本 v2.0 2025-10-20</p>
        </div>

        <div className="space-y-6">
          {/* Most Important Rules */}
          <Card className="border-red-500/30 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-600">最重要項目</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• 請絕對不要先摸牌（若已碰觸牌山，便不能再作鳴牌）</p>
              <p>• 請不要做出任何可能激怒其他顧客的行為</p>
              <p>• 請務必清晰地發出聲音，讓桌上所有人聽到</p>
              <p>• 請以公平的精神來進行遊戲</p>
            </CardContent>
          </Card>

          {/* Section 1 - Tiles */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>一、用牌</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>使用112隻麻雀牌：所有番子，索子及筒子，而萬子則只有一萬及九萬</p>
              <p>
                四張白板其中一張為Pocchi（白板加一紅點）。平常用作白板，只有在立直後，自摸Pocchi
                會視為百搭，以高點法計算（例如一氣通貫/ 金 5 / 中裏）。
              </p>
              <p>四隻花牌（三隻赤牌， 一隻金牌）</p>
              <p>• 空氣拔花（不會消除一發，天和等，不算嶺上，不能打出花牌）</p>
              <p>• 5索及5筒有三隻赤牌， 一隻金牌，均為一番寶牌</p>
              <p>• 北為全員役牌，沒有拔北</p>
              <p>• 七對子可以使用相同4枚牌為兩對</p>
            </CardContent>
          </Card>

          {/* Section 2 - Basic Rules */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>二、基本規則，順位點及分數</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>有食斷，有後付。沒有上牌</p>
              <p>沒有 500 / 100 點，點棒最細單位為 1000 點</p>
              <p>有符計算，最低30符，最多70符；不足1000點的均會上捨，詳細見點數表</p>
              <p>每本場 1000 點（自摸的話每位每本場均加 1000 點）</p>
              <p>50000 點起，50000 點返。順位馬一位＋20 ・ 二位 0 ・三位△ 20</p>
              <p>南三尾莊聴牌或和了連莊，一位強制完結。二位或三位可選擇連莊或半莊完結。</p>
              <p>半莊完結時，全員50000點未滿都會結束半莊</p>

              <div className="mt-4 space-y-2">
                <p className="font-semibold">分數計算示例：</p>
                <div className="pl-4 space-y-1 text-xs">
                  <p>
                    三位 9000 點，距離原點 50000 點 = 41000 點，順位馬三位 - 20000；共 -61000 點。除以每枚 4000 點；共輸
                    15 枚
                  </p>
                  <p>二位 53000 點，距離原點 50000 點 = 3000 點，不足 4000 點，正負 0 枚</p>
                  <p>一位 88000 點，枚數為二及三位相加的倒數，正 15 枚</p>
                </div>
              </div>

              <p>
                對局中：一發，金5，金花，每隻裏寶牌為 1 枚。自摸時另外兩家都要支付。數役滿為4 枚/ 2 枚all；每款役滿→ 10
                枚/ 5 枚all
              </p>

              <p className="font-semibold mt-4">擊飛賞 2 枚：</p>
              <p className="pl-4 text-xs">
                爆箱半莊終結，0 點亦都終結。玩家只有 1000 點時仍然可以立直・若然當局完結後點數為 0
                點(或以下)則爆箱作結。除非二位單獨和了擊飛三位，否則一位獨取擊飛賞
              </p>

              <p>同點時，較近起家的人拿上位</p>
            </CardContent>
          </Card>

          {/* Section 3 - Yakuman */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>三、役滿</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="font-semibold">除了正常的役滿以外加設：</p>
              <div className="pl-4 space-y-2">
                <p>• 人和：摸第一次牌前門清和了（之前不可以有人槓或副露）</p>
                <p>• 萬字混一色</p>
                <p>• 流局役滿：不能副露或被副露，計自摸和</p>
                <p>• 大車輪：（任何清一色七對子）</p>
              </div>

              <div className="mt-4 space-y-2">
                <p>• 國士無雙不可以搶暗槓</p>
                <p>• 沒有雙倍役滿但有複合役滿</p>
                <p>• 數役滿為14番以上</p>
                <p>• 沒有四連刻・三連刻・小車輪・三風</p>
              </div>

              <p className="font-semibold mt-4">包牌：</p>
              <p className="pl-4 text-xs">
                大三元、大四喜、四槓子全包。例如當A家碰出白板紅中後，B家打出發財A家碰，若後來C家放銃A家，B家負全責。如A家自摸，B家則只需付一家本場
              </p>
            </CardContent>
          </Card>

          {/* Section 4 - Riichi */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>四、立直</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>• 不可以振聴立直。振聴立直後和了計錯和，流局亦計錯和，可接受非立直時振聽自摸和</p>
              <p>• 立直後禁止見逃，立直見逃後不能和牌，流局計錯和</p>
              <p>• 宣告立直後，下家未摸牌或立直宣言牌被嗚走前可以取消立直，罰2枚，該局仍可門清和了</p>
              <p>
                •
                立直後可以任意暗槓，不論會否改變面子構成，但不可改變待牌。牌山剩最後兩張牌時不能開槓（由於無法開新寶牌）
              </p>
              <p>• 每局最多槓四次</p>
            </CardContent>
          </Card>

          {/* Section 5 - Win */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>五、和了</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>有二家和，供託和本場歸放銃家下家。</p>
              <p>若放銃家下家為親家則連莊，若放銃家上家為親家則過莊</p>
            </CardContent>
          </Card>

          {/* Section 6 - Draw */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>六、流局</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>莊家流局聴牌連莊。</p>
              <p>一家聴牌：另外兩家每家付 1000 點；兩家聴牌：不聴家付另外每家 1000 點</p>
            </CardContent>
          </Card>

          {/* Section 7 - Penalties */}
          <Card className="border-red-500/20 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-600">七、罰則</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold">暴露張：</p>
                <div className="pl-4 space-y-1">
                  <p>• 1 - 2張：警告，第二次開始每次減 2 枚</p>
                  <p>• 3 - 6張：和了放棄</p>
                  <p>• 7張以上：錯和</p>
                </div>
              </div>

              <p>• 多牌：每多一隻減 2 枚及和了放棄</p>
              <p>• 誤鳴：叫Chi/無法碰/錯槓: 減 2 枚</p>
              <p>• 取消立直：減 2 枚，該局仍可門清和了)</p>
              <p>• 莊家在所有人未摸齊頭牌便打牌：減 2 枚</p>
              <p>• 誤和/誤自摸：減 4 枚及和了放棄</p>

              <div className="mt-4">
                <p className="font-semibold">錯和：減 10 枚</p>
                <p className="text-xs pl-4 mt-1">
                  例如：錯和並已倒牌; 不聴立直後流局; 立直後的暗槓改變待牌後流局; 破壞牌山令牌局不能繼續進行;
                  被發現立直後見逃。該局不會重打，錯和者立起手牌，流局時算不聽。如果牌山已經被破壞（例如已經開裏寶牌，錯和者如為莊家，則進入下一局。如錯和者為子家，該局重打)
                </p>
              </div>

              <div className="mt-4">
                <p className="font-semibold">和了放棄：</p>
                <p className="text-xs pl-4 mt-1">
                  當任何一家被罰和了放棄時，該玩家即時起直至一局結束都不得再鳴牌、立直或和了，該玩家可正常補花。若立直後誤和或誤自摸罰和了放棄，流局仍需展示手牌證明非錯和牌型，當流局不聽處理，繼續下一局
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Points Table */}
        <Card className="border-primary/20 mt-6">
          <CardHeader>
            <CardTitle className="text-xl text-primary">點數表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <img
                src="/images/whatsapp-20image-202026-01-13-20at-2016.jpeg"
                alt="點數表"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
