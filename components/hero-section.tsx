"use client"

import { Button } from "@/components/ui/button"

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center text-center px-4">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none" />
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter text-balance">
          <span className="block text-primary">香港立直無雙聯賽</span>
          <span className="block text-foreground mt-2">League of Riichi Champions HK</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
          香港首屈一指的專業立直麻雀團體聯賽。體驗高水平競技、現場直播賽事，以及世界級的對局。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-lg px-8"
            onClick={() => scrollToSection("application")}
          >
            報名參賽
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-bold text-lg px-8 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground bg-transparent"
            onClick={() => scrollToSection("about")}
          >
            了解更多
          </Button>
        </div>
      </div>
    </section>
  )
}
