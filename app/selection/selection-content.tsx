"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Clock, Trophy, Users, DollarSign, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function SelectionContent() {
  return (
    <main className="min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto max-w-6xl px-4 py-6">
        <Button asChild variant="outline" className="bg-transparent">
          <Link href="/">← 返回主頁</Link>
        </Button>
      </div>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-balance">
              <a
                href="https://www.amatsukimahjong.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                天月麻雀
              </a>{" "}
              選拔賽
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              香港立直無雙聯賽 2026 贊助隊伍選拔大賽
            </p>
          </div>

          {/* Event Poster */}
          <div className="mb-12 flex justify-center">
            <Image
              src="/images/e9-a6-99-e6-b8-af-e7-ab-8b-e7-9b-b4-e7-84-a1-e9-9b-99-e8-81-af-e8-b3-bd-202026-20-e9-81-b8-e6-8b-94-e8-b3-bd-20-282-29.jpg"
              alt="天月麻雀選拔賽"
              width={1920}
              height={1080}
              className="w-full h-auto max-w-4xl rounded-lg shadow-2xl border border-primary/20"
              priority
            />
          </div>

          {/* Introduction */}
          <div className="rounded-lg mb-8 card-glow border border-primary/30 p-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
                <Trophy className="size-6 text-primary" />
                賽事介紹
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-foreground/90 leading-relaxed">
                香港立直無雙聯賽為香港專業麻雀連盟及「森麻Summer」首個長期直播隊際比賽。香港立直麻雀玩家日益增長，頂尖選手可透過團隊競技，互相學習、切磋牌技，從而提升香港玩家的牌技水平。
              </p>
              <p className="text-foreground/90 leading-relaxed">
                <a
                  href="https://www.amatsukimahjong.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  天月麻雀 Amatsuki Mahjong
                </a>{" "}
                正式成為香港立直無雙聯賽的贊助隊伍之一。其中一個隊員名額將透過選拔大賽產生，現誠邀各位有志加入
                <a
                  href="https://www.amatsukimahjong.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  天月麻雀
                </a>
                隊伍的選手報名參賽，爭取席位。
              </p>
            </div>
          </div>

          {/* Tournament Structure */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Preliminary Round */}
            <div className="rounded-lg card-glow border border-border p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Calendar className="size-5 text-primary" />
                  初賽（線上平台）
                </h3>
                <p className="text-muted-foreground">
                  <a
                    href="https://www.amatsukimahjong.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors"
                  >
                    天月麻雀 Amatsuki Mahjong
                  </a>{" "}
                  線上平台
                </p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">日期</p>
                      <p className="text-sm text-muted-foreground">2026 年 2 月 7 日（星期六）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="size-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">時間</p>
                      <p className="text-sm text-muted-foreground">13:00 - 19:00（大會期間任意對局）</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm">賽規</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• 最佳連續三戰合計精算分</li>
                    <li>• 最高分 4 名選手晉級決賽</li>
                    <li>• 東風戰；馬點 15-5</li>
                    <li>• 25000點起及返</li>
                    <li>• 不足30000點也可以1位</li>
                    <li className="text-xs text-muted-foreground">
                      其餘規則按照
                      <a
                        href="https://www.amatsukimahjong.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        天月麻雀
                      </a>
                      四人麻雀規則（有赤、一發、裡寶牌，沒有切上滿貫）
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Finals */}
            <div className="rounded-lg card-glow border border-border p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                  <Trophy className="size-5 text-primary" />
                  決賽（直播）
                </h3>
                <p className="text-muted-foreground">森麻Summer 直播</p>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Calendar className="size-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">日期</p>
                      <p className="text-sm text-muted-foreground">2026 年 2 月 9 日（星期一）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="size-4 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">時間</p>
                      <p className="text-sm text-muted-foreground">19:30 開始</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-sm">賽規</p>
                  <ul className="text-sm text-foreground/80 space-y-1">
                    <li>• 兩個半莊合計最高分選手為冠軍</li>
                    <li>• 森麻段位M規則（與無雙聯賽相同）</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Registration */}
          <div className="rounded-lg mb-8 card-glow border border-primary/30 bg-gradient-to-br from-primary/5 to-transparent p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="size-6 text-primary" />
                比賽報名及費用
              </h2>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">截止報名日期</p>
                  <p className="text-lg font-bold text-primary">2026 年 2 月 5 日 23:59</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="size-4 text-primary" />
                    <p className="text-sm text-muted-foreground">比賽費用</p>
                  </div>
                  <p className="text-lg font-bold text-primary">$100</p>
                  <p className="text-xs text-muted-foreground mt-1">已包括決賽費用及無雙聯賽的隊伍費用</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground mb-1">計分項目</p>
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    納入為香港立直無雙聯賽的自組隊伍計分項目，森麻比賽參與計3分，冠亞季亦會按照比賽頭銜方程式計算分數
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Link - Outside Card */}
          <div className="text-center mb-8">
            <a
              href="https://forms.gle/jkAaHQyLS1EZmS2j6"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-xl font-bold transition-colors shadow-lg hover:shadow-xl"
            >
              立即報名選拔賽
              <ExternalLink className="size-6" />
            </a>
          </div>

          {/* Other Matters */}
          <div className="rounded-lg card-glow border border-border p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">其他事項</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">1.</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    我們期望所有參賽者能尊重大會及其他參賽者，展示最高的禮儀典範。若然主辦方在決賽對局中留意到有強打或其他不符合牌桌禮儀的情況，森麻團隊必定會在對局後與參賽者反映情況，並期望參賽者在之後的對局中作出改善。
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary flex-shrink-0">2.</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    成功加入
                    <a
                      href="https://www.amatsukimahjong.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      天月麻雀
                    </a>
                    隊伍的選手出戰香港立直無雙聯賽需要承擔對局費用，詳細出場次數需與
                    <a
                      href="https://www.amatsukimahjong.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      天月麻雀
                    </a>
                    隊伍監督商討。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
