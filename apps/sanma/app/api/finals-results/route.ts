import { put, list } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

const BLOB_FILENAME = 'finals-results.json'

interface FinalsData {
  [matchKey: string]: {
    lineups: { [teamName: string]: string }
    results: {
      g1: any[]
      g2: any[]
      g3: any[]
    }
    updatedAt: string
  }
}

async function getExistingData(): Promise<FinalsData> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[v0] BLOB_READ_WRITE_TOKEN not available')
    return {}
  }
  
  try {
    const { blobs } = await list({ prefix: BLOB_FILENAME })
    
    if (blobs.length > 0) {
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
    console.error('[v0] Error reading existing finals blob:', error)
  }
  return {}
}

export async function GET() {
  try {
    const data = await getExistingData()
    return NextResponse.json({ success: true, results: data })
  } catch (error) {
    console.error('[v0] Error fetching finals results:', error)
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

    const existingData = await getExistingData()

    // Merge results: keep existing game keys, only overwrite keys with actual data
    const existingResults = existingData[matchKey]?.results || { g1: [], g2: [], g3: [] }
    const mergedResults = { ...existingResults }
    if (results) {
      Object.entries(results).forEach(([gameKey, gamePlayers]: [string, any]) => {
        if (Array.isArray(gamePlayers) && gamePlayers.some((p: any) => typeof p.rawScore === "number")) {
          mergedResults[gameKey] = gamePlayers
        }
      })
    }

    existingData[matchKey] = {
      lineups: lineups || existingData[matchKey]?.lineups || {},
      results: mergedResults,
      updatedAt: new Date().toISOString(),
    }

    await put(BLOB_FILENAME, JSON.stringify(existingData, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    })

    return NextResponse.json({ 
      success: true, 
      matchKey,
      message: 'Finals results saved successfully'
    })
  } catch (error) {
    console.error('[v0] Error saving finals results:', error)
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

    if (clearAll) {
      await put(BLOB_FILENAME, JSON.stringify({}, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
      })
      return NextResponse.json({ success: true, message: 'All finals data cleared' })
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

    return NextResponse.json({ success: true, message: 'Finals result deleted successfully' })
  } catch (error) {
    console.error('[v0] Error deleting finals results:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete results' }, { status: 500 })
  }
}
