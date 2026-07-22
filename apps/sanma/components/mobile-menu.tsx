"use client"

import { useState } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { Menu, X, FileText, Trophy, Scroll, Youtube, Lock } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

interface MobileMenuProps {
  isAdmin: boolean
  onAdminClick: () => void
  onLoginClick: () => void
  onLogout: () => void
}

export function MobileMenu({ isAdmin, onAdminClick, onLoginClick, onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { t, language, setLanguage } = useLanguage()

  const languages: { code: "zh-TW" | "en" | "ja"; label: string }[] = [
    { code: "zh-TW", label: "繁體中文" },
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
  ]

  const menuContent = isOpen ? (
    <>
      <div className="fixed inset-0 bg-black/80 z-[9998]" onClick={() => setIsOpen(false)} />
      <div className="fixed inset-0 bg-background z-[9999] overflow-y-auto">
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
            <h3 className="font-bold text-lg">{t.menu}</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-accent rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 pb-3 border-b border-border">
            <p className="text-sm text-muted-foreground mb-2 px-4">{t.language || "語言 / Language"}</p>
            <div className="space-y-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full px-4 py-3 text-left rounded-lg transition-colors ${
                    language === lang.code ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {!isAdmin && language === "ja" && (
            <button
              onClick={() => {
                onLoginClick()
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
            >
              <Lock className="w-5 h-5" />
              <span>登入</span>
            </button>
          )}

          {isAdmin && (
            <>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
              >
                <Trophy className="w-5 h-5" />
                <span>{t.adminPanelTitle}</span>
              </Link>
              <button
                onClick={() => {
                  onAdminClick()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
              >
                <Scroll className="w-5 h-5" />
                <span>{t.scoreInput}</span>
              </button>
              <button
                onClick={() => {
                  onLogout()
                  setIsOpen(false)
                }}
                className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent rounded-lg transition-colors text-destructive"
              >
                <Lock className="w-5 h-5" />
                <span>{t.logout}</span>
              </button>
              <div className="border-t border-border my-2" />
            </>
          )}

          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>{t.senmaIntroduction}</span>
          </Link>

          <Link
            href="/rules"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
          >
            <Trophy className="w-5 h-5" />
            <span>{t.tournamentRules}</span>
          </Link>

          <Link
            href="/sanma-rules"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
          >
            <Scroll className="w-5 h-5" />
            <span>{t.sanmaRules}</span>
          </Link>

          <Link
            href="/schedule"
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent rounded-lg transition-colors"
          >
            <Youtube className="w-5 h-5" />
            <span>{t.matchSchedule}</span>
          </Link>
        </div>
      </div>
    </>
  ) : null

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-foreground hover:text-primary transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {typeof window !== "undefined" && menuContent && createPortal(menuContent, document.body)}
    </div>
  )
}
