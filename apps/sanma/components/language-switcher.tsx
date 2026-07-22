"use client"

import { useLanguage } from "@/lib/language-context"
import type { Language } from "@/lib/translations"
import { useState } from "react"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const languages: { code: Language; label: string; short: string }[] = [
    { code: "zh-TW", label: "繁體中文", short: "中" },
    { code: "en", label: "English", short: "EN" },
    { code: "ja", label: "日本語", short: "日" },
  ]

  const currentLang = languages.find((l) => l.code === language)

  return (
    <>
      <div className="hidden md:flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              language === lang.code
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </>
  )
}
