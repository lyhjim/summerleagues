"use client"

import { LanguageSwitcher } from "@/components/language-switcher"
import { MobileMenu } from "@/components/mobile-menu"
import { useLanguage } from "@/lib/language-context"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.home}
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">森麻 Summer</h1>
          <p className="text-muted-foreground">香港第一及唯一一家全自動八口機的健康立直麻雀專門店</p>
        </div>

        {/* Photo Gallery */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-xl border border-primary/30 shadow-lg group">
            <img
              src="/images/whatsapp-20image-202026-01-07-20at-2000.jpeg"
              alt="Summer Mahjong Parlor - Group Event"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="relative overflow-hidden rounded-xl border border-primary/30 shadow-lg group">
            <img
              src="/images/whatsapp-20image-202026-01-07-20at-2022.jpeg"
              alt="Summer Mahjong Parlor - Mahjong Table with Cherry Blossom"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="relative overflow-hidden rounded-xl border border-primary/30 shadow-lg group">
            <img
              src="/images/whatsapp-lounge.jpeg"
              alt="Summer Mahjong Parlor - Lounge Area"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="relative overflow-hidden rounded-xl border border-primary/30 shadow-lg group">
            <img
              src="/images/whatsapp-cherry-blossom-table.jpeg"
              alt="Summer Mahjong Parlor - AMOS Table with Cherry Blossom Decor"
              className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 prose prose-neutral dark:prose-invert max-w-none">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">關於森麻</h2>
            <p className="text-foreground/90 leading-relaxed">
              森麻 Summer 於
              2025年3月1日開幕，是香港第一及唯一一家全自動八口機的健康立直麻雀專門店。場內設置7部AMOS八口機，其中3部更是最新型號REXX3。亦有兩部台牌機，供客人打越搭和台牌用。
            </p>
            <p className="text-foreground/90 leading-relaxed mt-4">
              全年不休，每天1200-0200營業，提供一個人都能來玩立直麻雀的雀聚。單是2025年10個月內，森麻 Summer
              已經記錄了10000個半莊對局，其中三麻及四麻各佔一半。每位玩家透過三四麻段位戰，除了可以升級段位，更可以挑戰每月龍虎榜，贏得獎品及森麻最強戰席位，優勝者將獲得象徵森麻第一的「森麻最強位」稱號。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">賽事舉辦</h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              森麻致力推廣競技麻雀，在2025年內舉辦了11個比賽，包括：
            </p>
            <ul className="space-y-2 text-foreground/90">
              <li>1) 紫荊盃 - 最高級別個人聯賽</li>
              <li>2) 櫻花盃 - 專為女雀士而設</li>
              <li>3) 天鳳名人盃 - 專為天鳳高段位選手而設</li>
              <li>4) 千禧盃 - 專為年輕選手而設</li>
              <li>5) 魔女盃 - 與日麻頻道 妖精くるる 合作的比賽</li>
              <li>6) 森麻龍運王 - 特殊規則的比賽</li>
              <li>7) 十段戰 - 專為森麻高段位選手而設</li>
              <li>8) 團體代表戰 - 邀請香港各大麻雀團體</li>
              <li>9) 三麻百人戰 - 三麻個人比賽</li>
              <li>10) 三麻邀金League - 三麻隊際比賽</li>
              <li>11) 亞太盃選拔 - 與香港競技協會合作，勝出者將代表香港赴日出戰</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">展望未來</h2>
            <p className="text-foreground/90 leading-relaxed">
              來年2026，森麻將會首次舉辦名為香港立直無雙聯賽的四麻隊際比賽，透過直播推廣立直麻雀。
            </p>
          </section>

          <section className="bg-primary/10 border border-primary/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">聯絡資訊</h2>
            <div className="space-y-2 text-foreground/90">
              <p>
                <span className="font-semibold">電郵：</span>
                <a href="mailto:admin@summermj.com" className="text-primary hover:underline">
                  admin@summermj.com
                </a>
              </p>
              <p>
                <span className="font-semibold">WhatsApp：</span>
                <a
                  href="https://wa.me/85266478000"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  (+852) 6647 8000
                </a>
              </p>
              <p className="mt-4">
                <span className="font-semibold">地址：</span>
                <br />
                彌敦道478號森基商業大廈15樓全層
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
