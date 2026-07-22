import { put, list } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const BLOB_FILENAME = 'semi-finals-results.json'

interface SemiFinalsData {
  [matchKey: string]: {
    lineups: {
      round1: { [teamName: string]: string }
      round2: { [teamName: string]: string }
    }
    results: {
      r1g1: any[]
      r1g2: any[]
      r1g3: any[]
      r2g1: any[]
      r2g2: any[]
      r2g3: any[]
    }
    updatedAt: string
  }
}

async function getExistingData(): Promise<SemiFinalsData> {
  // Check if token is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[v0] BLOB_READ_WRITE_TOKEN not available')
    return {}
  }
  
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME })
    
    if (blobs.length > 0) {
      // Fetch with auth token to ensure access in all environments
      const response = await fetch(blobs[0].url, {
        headers: {
          Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
        },
      })
      if (response.ok) {
        return await response.json()
      }
    }
  } catch (error) {
    console.error('[v0] Error reading existing blob:', error)
  }
  return {}
}

// Extract the correct key (e.g. "2026-04-28-T1") from both valid and malformed keys
function normalizeMatchKey(key: string): string | null {
  // Already valid e.g. "2026-04-28-T1"
  if (/^\d{4}-\d{2}-\d{2}-T\d+$/.test(key)) return key
  // Malformed e.g. "2026-04-28-2026-04-28-T1" — extract last date + table segment
  const match = key.match(/(\d{4}-\d{2}-\d{2}-T\d+)$/)
  if (match) return match[1]
  return null
}

export async function GET() {
  try {
    const data = await getExistingData()
    
    // Remap all keys to correct format, preferring valid keys over malformed duplicates
    const cleanedData: SemiFinalsData = {}
    Object.entries(data).forEach(([key, val]) => {
      const normalized = normalizeMatchKey(key)
      if (!normalized) return
      // Only overwrite if this is a valid key (not malformed), or if no entry yet
      const isValidKey = /^\d{4}-\d{2}-\d{2}-T\d+$/.test(key)
      if (!cleanedData[normalized] || isValidKey) {
        cleanedData[normalized] = val as any
      }
    })
    
    return NextResponse.json({ success: true, results: cleanedData })
  } catch (error) {
    console.error('[v0] Error fetching semi-finals results:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch results' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ success: false, error: 'Blob storage not configured' }, { status: 500 })
    }
    
    const body = await request.json()
    const { matchKey, lineups, results } = body

    if (!matchKey) {
      return NextResponse.json({ success: false, error: 'Missing matchKey' }, { status: 400 })
    }

    // Get existing data and normalize all malformed keys
    const rawData = await getExistingData()
    const existingData: SemiFinalsData = {}
    Object.entries(rawData).forEach(([key, val]) => {
      const normalized = normalizeMatchKey(key)
      if (!normalized) return
      const isValidKey = /^\d{4}-\d{2}-\d{2}-T\d+$/.test(key)
      if (!existingData[normalized] || isValidKey) {
        existingData[normalized] = val
      }
    })

    // Merge results: keep existing game keys, only overwrite keys that are present in the new submission
    const existingResults = existingData[matchKey]?.results || {
      r1g1: [], r1g2: [], r1g3: [],
      r2g1: [], r2g2: [], r2g3: [],
    }
    const mergedResults = { ...existingResults }
    if (results) {
      Object.entries(results).forEach(([gameKey, gamePlayers]: [string, any]) => {
        // Only overwrite a game if it has actual player data with scores (typeof allows 0 as valid score)
        if (Array.isArray(gamePlayers) && gamePlayers.some((p: any) => typeof p.rawScore === "number")) {
          mergedResults[gameKey] = gamePlayers
        }
      })
    }

    // Update with merged data
    existingData[matchKey] = {
      lineups: lineups || existingData[matchKey]?.lineups || { round1: {}, round2: {} },
      results: mergedResults,
      updatedAt: new Date().toISOString(),
    }

    // Save to Blob
    const blob = await put(BLOB_FILENAME, JSON.stringify(existingData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return NextResponse.json({ 
      success: true, 
      matchKey,
      message: 'Results saved successfully'
    })
  } catch (error) {
    console.error('[v0] Error saving semi-finals results:', error)
    return NextResponse.json({ success: false, error: 'Failed to save results' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ success: false, error: 'Blob storage not configured' }, { status: 500 })
    }
    
    const { searchParams } = new URL(request.url)
    const matchKey = searchParams.get('matchKey')
    const clearAll = searchParams.get('clearAll') === 'true'

    // Clear ALL semi-finals data
    if (clearAll) {
      await put(BLOB_FILENAME, JSON.stringify({}, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return NextResponse.json({ success: true, message: 'All semi-finals data cleared' })
    }

    if (!matchKey) {
      return NextResponse.json({ success: false, error: 'Missing matchKey' }, { status: 400 })
    }

    const existingData = await getExistingData()
    
    if (existingData[matchKey]) {
      delete existingData[matchKey]
      
      await put(BLOB_FILENAME, JSON.stringify(existingData, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
    }

    return NextResponse.json({ success: true, message: 'Result deleted successfully' })
  } catch (error) {
    console.error('[v0] Error deleting semi-finals results:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete results' }, { status: 500 })
  }
}
