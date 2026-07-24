"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSeasonOpen, setIsSeasonOpen] = useState(false)

  const scrollToApplication = () => {
    const element = document.getElementById("application")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glassmorphism">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Added clickable links to organizer logos */}
            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <a href="https://www.hkpm.pro/" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/summer-21.png"
                  alt="HKPM Logo"
                  width={120}
                  height={48}
                  className="h-12 md:h-16 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </a>
              <a href="https://summermj.com" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/summer-desktop-logo.png"
                  alt="Summer Logo"
                  width={40}
                  height={40}
                  className="h-10 md:h-14 w-auto object-contain hover:opacity-80 transition-opacity"
                />
              </a>
            </div>
            {/* End of added clickable links */}
            <Link href="/" className="text-sm md:text-xl font-extrabold tracking-tight truncate">
              <Image
                src="/images/lrc-logo.png"
                alt="LRC Logo"
                width={100}
                height={100}
                className="h-16 md:h-20 w-auto object-contain hover:opacity-80 transition-opacity"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/rules" className="text-sm font-medium hover:text-primary transition-colors">
              比賽規則
            </Link>
            <Link href="/schedule" className="text-sm font-medium hover:text-primary transition-colors">
              賽程表
            </Link>
            {/* Season Dropdown */}
            <div className="relative">
              <button
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
                onClick={() => setIsSeasonOpen(!isSeasonOpen)}
              >
                過往成績
                <ChevronDown className={`w-4 h-4 transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`} />
              </button>
              {isSeasonOpen && (
                <div className="absolute top-full mt-2 left-0 bg-background border border-border rounded-lg shadow-lg z-50">
                  <Link
                    href="/season/2026-spring"
                    className="block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setIsSeasonOpen(false)}
                  >
                    2026 春季賽
                  </Link>
                  <Link
                    href="/summer-selection"
                    className="block px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                    onClick={() => setIsSeasonOpen(false)}
                  >
                    夏季選拔賽
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link
                href="/rules"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                比賽規則
              </Link>
              <Link
                href="/schedule"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                賽程表
              </Link>
              {/* Mobile Season Dropdown */}
              <div>
                <button
                  className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 w-full justify-between"
                  onClick={() => setIsSeasonOpen(!isSeasonOpen)}
                >
                  過往成績
                  <ChevronDown className={`w-4 h-4 transition-transform ${isSeasonOpen ? 'rotate-180' : ''}`} />
                </button>
                {isSeasonOpen && (
                  <div className="mt-2 pl-4 flex flex-col gap-2">
                    <Link
                      href="/season/2026-spring"
                      className="text-sm hover:text-primary transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsSeasonOpen(false)
                      }}
                    >
                      2026 春季賽
                    </Link>
                    <Link
                      href="/summer-selection"
                      className="text-sm hover:text-primary transition-colors"
                      onClick={() => {
                        setIsMenuOpen(false)
                        setIsSeasonOpen(false)
                      }}
                    >
                      夏季選拔賽
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
