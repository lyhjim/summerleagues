import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "香港立直無雙聯賽 | League of Riichi Champions",
  description:
    "Hong Kong's premier professional Riichi Mahjong team league. Experience high-stakes competition, livestreamed matches, and world-class gameplay.",
  generator: "v0.app",
  icons: {
    icon: "/images/lrc-logo-favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        <div className="light-rays" />
        <div className="relative z-10">{children}</div>
        <Analytics />
      </body>
    </html>
  )
}
