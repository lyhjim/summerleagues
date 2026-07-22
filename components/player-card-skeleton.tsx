"use client"

import { useEffect, useState } from "react"

export function PlayerCardSkeleton() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="aspect-square rounded-lg bg-white/10 animate-pulse overflow-hidden">
      <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/10" />
      <div className="absolute inset-0 flex flex-col justify-end p-3">
        <div className="space-y-2 pb-14">
          <div className="h-5 w-16 bg-white/20 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/15 rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/15 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function GameCardSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {[1, 2, 3, 4].map((i) => (
        <PlayerCardSkeleton key={i} />
      ))}
    </div>
  )
}
