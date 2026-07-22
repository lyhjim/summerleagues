import { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { PrintableSheet } from "@/components/summer-selection/printable-sheet"
import { PrintButton } from "@/components/summer-selection/print-button"

export const metadata: Metadata = {
  title: "可列印賽程表 | 夏季選拔賽",
  description: "香港立直無雙聯賽 2026 夏季選拔賽 - 可列印 A4 賽程表",
}

export default function PrintablePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b border-gray-300 print:hidden sticky top-0 bg-white z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/summer-selection" className="text-gray-600 hover:text-gray-900 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">可列印賽程表</h1>
          </div>
          <PrintButton />
        </div>
      </div>

      {/* Printable Content */}
      <div className="bg-white">
        <PrintableSheet />
      </div>
    </main>
  )
}
