-- HK16 League Database Schema
-- Cloud Dragon Cup (雲龍盃) Tournament - Spring 2026

-- Match results storage for HK16
CREATE TABLE IF NOT EXISTS hk16_match_results (
  id SERIAL PRIMARY KEY,
  league_id TEXT NOT NULL DEFAULT 'hk16',
  season TEXT NOT NULL DEFAULT '2026-spring',
  match_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  match_date TEXT NOT NULL,
  player_scores JSONB NOT NULL,  -- Array of {playerName, team, rawPts}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season, match_id, round)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hk16_match_results_season_date 
ON hk16_match_results(season, match_date DESC);

CREATE INDEX IF NOT EXISTS idx_hk16_match_results_match_id 
ON hk16_match_results(league_id, season, match_id);

-- Tournament standings (cached)
CREATE TABLE IF NOT EXISTS hk16_standings (
  id SERIAL PRIMARY KEY,
  league_id TEXT NOT NULL DEFAULT 'hk16',
  season TEXT NOT NULL DEFAULT '2026-spring',
  team_name TEXT NOT NULL,
  match_count INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  avg_points DECIMAL(10, 2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(season, team_name)
);

CREATE INDEX IF NOT EXISTS idx_hk16_standings_season 
ON hk16_standings(season, total_points DESC);
