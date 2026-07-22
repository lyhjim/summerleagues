"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

interface FinalsResultsContextType {
  results: Record<string, any>
  isLoading: boolean
  refetch: () => Promise<void>
}

const FinalsResultsContext = createContext<FinalsResultsContextType | undefined>(undefined)

export function FinalsResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/finals-results", { 
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      })
      if (res.ok) {
        const json = await res.json()
        const data = json.results || {}
        setResults(data)
      } else {
        console.error("[v0] Failed to load finals results:", res.status)
      }
    } catch (err) {
      console.error("[v0] Error loading finals results:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  return (
    <FinalsResultsContext.Provider value={{ results, isLoading, refetch: fetchResults }}>
      {children}
    </FinalsResultsContext.Provider>
  )
}

export function useFinalsResults() {
  const ctx = useContext(FinalsResultsContext)
  if (!ctx) throw new Error("useFinalsResults must be used within FinalsResultsProvider")
  return ctx
}
