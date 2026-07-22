import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, Noto_Sans_TC, Noto_Sans_JP } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/language-context"
import { SemiFinalsResultsProvider } from "@/lib/semi-finals-results-context"
import { FinalsResultsProvider } from "@/lib/finals-results-context"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })
const _notoSansTC = Noto_Sans_TC({ subsets: ["latin"], weight: ["400", "500", "700"] })
const _notoSansJP = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "700"] })

export const metadata: Metadata = {
  title: "三麻邀金League II 2026 | 森麻Summer 主辦",
  description: "Official site of Sanma Invitational League II 2026 organised by Summermjhk",
  generator: "v0.app",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className={`font-sans antialiased`}>
        <LanguageProvider>
          <SemiFinalsResultsProvider>
            <FinalsResultsProvider>{children}</FinalsResultsProvider>
          </SemiFinalsResultsProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
