#!/usr/bin/env node

const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

const migrations = [
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
  )`,

  `CREATE INDEX IF NOT EXISTS idx_hk16_match_results_season_date 
   ON hk16_match_results(season, match_date DESC)`,

  `CREATE INDEX IF NOT EXISTS idx_hk16_match_results_match_id 
   ON hk16_match_results(league_id, season, match_id)`,

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
  )`,

  `CREATE INDEX IF NOT EXISTS idx_hk16_standings_season 
   ON hk16_standings(season, total_points DESC)`,
];

async function runMigrations() {
  try {
    console.log('[v0] Starting HK16 database migrations...');
    
    for (const migration of migrations) {
      console.log('[v0] Running migration:', migration.split('\n')[0].substring(0, 60) + '...');
      await sql(migration);
      console.log('[v0] ✓ Migration completed');
    }
    
    console.log('[v0] All HK16 migrations completed successfully!');
  } catch (error) {
    console.error('[v0] Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
