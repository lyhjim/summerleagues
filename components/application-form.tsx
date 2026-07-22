"use client"

import type React from "react"

import { useState } from "react"
import { ExternalLink } from "lucide-react"

export function ApplicationForm() {
  const [formData, setFormData] = useState({
    teamName: "",
    representativeName: "",
    contactMethod: "",
    contactValue: "",
    experience: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Form submitted:", formData)
    // Handle form submission
  }

  return (
    <section id="application" className="py-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-balance">
            報名<span className="text-primary">參賽</span>
          </h2>
          <p className="text-muted-foreground text-lg text-pretty">香港立直無雙聯賽 2026 夏季隊際選拔賽</p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-foreground mb-2">報名夏季隊際選拔賽</h3>
              <p className="text-muted-foreground">參加香港立直無雙聯賽2026年夏季選拔，爭取聯賽參賽權</p>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-foreground/90 leading-relaxed">
                本次隊際選拔賽為優秀選手提供機會加入香港立直無雙聯賽，展現牌技、競逐頂級榮譽。每隊由1名監督及4位隊員組成，冠軍隊伍將晉級為2026年夏季賽參賽隊伍。
              </p>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">截止報名日期</p>
                <p className="text-lg font-bold text-primary">6月4日</p>
              </div>
            </div>
          </div>

          <a
            href="https://forms.gle/296XEuYzAuhXApnR6"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg h-14 px-8 py-2 transition-colors"
          >
            報名夏季隊際選拔賽
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  )
}
