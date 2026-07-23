'use server'

import { queryHK16, HK16 } from './neon-client'

// Initialize HK16 database schema on first run
export async function initializeHK16Database() {
  try {
    console.log('[v0] Initializing HK16 database schema...')

    // Create match results table
    await queryHK16(
      `CREATE TABLE IF NOT EXISTS hk16_match_results (
        id SERIAL PRIMARY KEY,
        league_id TEXT NOT NULL DEFAULT 'hk16',
        season TEXT NOT NULL DEFAULT '2026-spring',
        match_id TEXT NOT NULL,
        round INTEGER NOT NULL,
        match_date TEXT NOT NULL,
        player_scores JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(season, match_id, round)
      )`
    )
    console.log('[v0] ✓ Created hk16_match_results table')

    // Create indexes
    await queryHK16(
      `CREATE INDEX IF NOT EXISTS idx_hk16_match_results_season_date 
       ON hk16_match_results(season, match_date DESC)`
    )
    await queryHK16(
      `CREATE INDEX IF NOT EXISTS idx_hk16_match_results_match_id 
       ON hk16_match_results(league_id, season, match_id)`
    )
    console.log('[v0] ✓ Created indexes for hk16_match_results')

    // Create standings table
    await queryHK16(
      `CREATE TABLE IF NOT EXISTS hk16_standings (
        id SERIAL PRIMARY KEY,
        league_id TEXT NOT NULL DEFAULT 'hk16',
        season TEXT NOT NULL DEFAULT '2026-spring',
        team_name TEXT NOT NULL,
        match_count INTEGER DEFAULT 0,
        total_points INTEGER DEFAULT 0,
        avg_points DECIMAL(10, 2) DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(season, team_name)
      )`
    )
    console.log('[v0] ✓ Created hk16_standings table')

    await queryHK16(
      `CREATE INDEX IF NOT EXISTS idx_hk16_standings_season 
       ON hk16_standings(season, total_points DESC)`
    )
    console.log('[v0] ✓ All HK16 tables initialized successfully!')
    return true
  } catch (error) {
    console.error('[v0] HK16 database initialization error:', error)
    throw error
  }
}

// Save match results to database
export async function saveHK16MatchResults(
  matchId: string,
  round: number,
  matchDate: string,
  playerScores: Array<{ playerName: string; team: string; rawPts: number }>
) {
  try {
    const result = await queryHK16(
      `INSERT INTO hk16_match_results (league_id, season, match_id, round, match_date, player_scores)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (season, match_id, round) DO UPDATE SET
         player_scores = EXCLUDED.player_scores,
         updated_at = NOW()
       RETURNING *`,
      [HK16.LEAGUE_ID, HK16.CURRENT_SEASON, matchId, round, matchDate, JSON.stringify(playerScores)]
    )
    return result.rows[0]
  } catch (error) {
    console.error('[v0] Error saving HK16 match results:', error)
    throw error
  }
}

// Get all match results for a season
export async function getHK16MatchResults() {
  try {
    const result = await queryHK16(
      `SELECT * FROM hk16_match_results 
       WHERE league_id = $1 AND season = $2
       ORDER BY match_date ASC`,
      [HK16.LEAGUE_ID, HK16.CURRENT_SEASON]
    )
    return result.rows.map((row: any) => ({
      matchId: row.match_id,
      round: row.round,
      matchDate: row.match_date,
      scores: row.player_scores,
      submittedAt: new Date(row.created_at).getTime(),
    }))
  } catch (error) {
    console.error('[v0] Error getting HK16 match results:', error)
    throw error
  }
}

// Update standings based on match results
export async function updateHK16Standings() {
  try {
    const results = await getHK16MatchResults()
    
    // Calculate standings
    const standings: Record<string, { total: number; count: number }> = {}
    
    results.forEach((result: any) => {
      result.scores.forEach((score: any) => {
        if (!standings[score.team]) {
          standings[score.team] = { total: 0, count: 0 }
        }
        standings[score.team].total += score.rawPts
        standings[score.team].count += 1
      })
    })

    // Upsert standings
    for (const [teamName, data] of Object.entries(standings)) {
      const avgPoints = (data.total / data.count).toFixed(2)
      await queryHK16(
        `INSERT INTO hk16_standings (league_id, season, team_name, match_count, total_points, avg_points)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (season, team_name) DO UPDATE SET
           match_count = EXCLUDED.match_count,
           total_points = EXCLUDED.total_points,
           avg_points = EXCLUDED.avg_points,
           updated_at = NOW()`,
        [HK16.LEAGUE_ID, HK16.CURRENT_SEASON, teamName, data.count, data.total, parseFloat(avgPoints)]
      )
    }
    
    return true
  } catch (error) {
    console.error('[v0] Error updating HK16 standings:', error)
    throw error
  }
}
