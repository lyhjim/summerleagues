import { neon } from '@neondatabase/serverless'
import { NextRequest, NextResponse } from 'next/server'

function getDb() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
  if (!connectionString) {
    return null
  }
  return neon(connectionString)
}

export async function GET() {
  try {
    const sql = getDb()
    if (!sql) {
      // Database not configured, return empty lineups
      return NextResponse.json({ lineups: [] })
    }
    
    const result = await sql`
      SELECT game_number, players FROM game_lineups 
      ORDER BY game_number ASC
    `
    
    const lineups = result.map(row => ({
      gameNumber: row.game_number,
      players: row.players,
    }))

    return NextResponse.json({ lineups })
  } catch (error) {
    console.error('Database error:', error)
    // Return empty lineups on error (e.g., table doesn't exist)
    return NextResponse.json({ lineups: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const sql = getDb()
    if (!sql) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }
    
    const { gameNumber, players } = await request.json()

    if (!gameNumber || !players) {
      return NextResponse.json(
        { error: 'Missing gameNumber or players' },
        { status: 400 }
      )
    }

    await sql`
      INSERT INTO game_lineups (game_number, players) 
      VALUES (${gameNumber}, ${JSON.stringify(players)})
      ON CONFLICT (game_number) DO UPDATE SET 
        players = EXCLUDED.players,
        updated_at = CURRENT_TIMESTAMP
    `

    return NextResponse.json({ 
      success: true, 
      gameNumber, 
      players 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to save lineup' },
      { status: 500 }
    )
  }
}
