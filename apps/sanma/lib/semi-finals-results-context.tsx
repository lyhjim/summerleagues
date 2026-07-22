"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react"

type SemiFinalsResults = Record<string, any>

interface SemiFinalsResultsContextType {
  results: SemiFinalsResults
  isLoading: boolean
  refetch: () => Promise<void>
}

const SemiFinalsResultsContext = createContext<SemiFinalsResultsContextType>({
  results: {},
  isLoading: true,
  refetch: async () => {},
})

export function SemiFinalsResultsProvider({ children }: { children: ReactNode }) {
  const [results, setResults] = useState<SemiFinalsResults>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchResults = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/semi-finals-results", { 
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      })
      if (res.ok) {
        const json = await res.json()
        const data = json.results || {}
        console.log("[v0] Semi-finals results loaded:", Object.keys(data).length, "matches")
        setResults(data)
      } else {
        console.error("[v0] Failed to load semi-finals results:", res.status)
      }
    } catch (err) {
      console.error("[v0] Error loading semi-finals results:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  return (
    <SemiFinalsResultsContext.Provider value={{ results, isLoading, refetch: fetchResults }}>
      {children}
    </SemiFinalsResultsContext.Provider>
  )
}

export function useSemiFinalsResults() {
  return useContext(SemiFinalsResultsContext)
}
