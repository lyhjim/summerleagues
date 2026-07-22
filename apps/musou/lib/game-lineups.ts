'use client'

import { useEffect, useState } from 'react'

export interface GameLineup {
  gameNumber: number
  players: Record<string, string>
}

export function useGameLineups() {
  const [lineups, setLineups] = useState<GameLineup[]>([])

  useEffect(() => {
    const fetchLineups = async () => {
      try {
        const response = await fetch('/api/game-lineups')
        const data = await response.json()
        setLineups(data.lineups || [])
      } catch (error) {
        console.error('Failed to fetch game lineups:', error)
      }
    }

    fetchLineups()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLineups, 30000)
    return () => clearInterval(interval)
  }, [])

  return lineups
}

export async function saveGameLineup(gameNumber: number, players: Record<string, string>) {
  try {
    const response = await fetch('/api/game-lineups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameNumber, players }),
    })
    return await response.json()
  } catch (error) {
    console.error('Failed to save game lineup:', error)
    throw error
  }
}
