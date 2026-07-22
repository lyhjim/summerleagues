"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const navLinks = [
  { label: "排行榜", labelEn: "STANDINGS", href: "#standings" },
  { label: "賽程", labelEn: "SCHEDULE", href: "/schedule" },
  { label: "隊伍", labelEn: "TEAMS", href: "/teams" },
  { label: "資訊", labelEn: "INFORMATION", href: "/information" },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      {/* Top accent line */}
      <div className="h-px w-full bg-primary opacity-80" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            {/* Dragon logo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logos/dragon-logo.png"
              alt="雲龍盃"
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="leading-none">
              <p className="text-lg font-display font-black tracking-wide text-foreground">
                {"雲龍盃"}
              </p>
              <p className="text-[8px] font-mono tracking-[0.2em] text-primary/80 uppercase mt-0.5">
                {"CLOUD DRAGON CUP"}
              </p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-5 py-2 text-sm font-display font-semibold tracking-[0.15em] text-muted-foreground hover:text-primary transition-colors group"
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-2 h-px bg-primary transition-all duration-200" />
                {link.labelEn}
              </Link>
            ))}
          </nav>



          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-primary transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2">
          <nav className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm font-mono text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
              >
                <span className="w-1 h-1 bg-primary/50 shrink-0" />
                <span className="tracking-widest text-[11px]">{link.labelEn}</span>
                <span className="ml-auto text-xs text-muted-foreground/40">{link.label}</span>
              </Link>
            ))}

          </nav>
        </div>
      )}
    </header>
  )
}
