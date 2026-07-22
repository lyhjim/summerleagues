import type { Metadata } from 'next'
import { Orbitron, Rajdhani, Share_Tech_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Primary sans: Rajdhani — condensed, military, clean for body
const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
})

// Display / headings: Orbitron — the iconic sci-fi / robotics font
const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display: 'swap',
})

// Mono data readouts
const shareTechMono = Share_Tech_Mono({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-share-tech-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Taiwan Mahjong Tournament',
  description: 'Official scoreboard and standings for the Taiwan Mahjong Tournament league.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${orbitron.variable} ${shareTechMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground pb-14">
        {children}
        <Analytics />
        {/* Fixed dragon banner always at bottom */}
        <div className="fixed bottom-0 left-0 right-0 z-50 w-full pointer-events-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dragon-banner.png"
            alt="Dragon banner"
            className="w-full h-14 object-cover object-center"
          />
        </div>
      </body>
    </html>
  )
}
