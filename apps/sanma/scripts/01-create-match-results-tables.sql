-- Create match_lineups table to store team lineups for each match
CREATE TABLE IF NOT EXISTS match_lineups (
  id SERIAL PRIMARY KEY,
  match_id TEXT NOT NULL UNIQUE,
  match_date TEXT NOT NULL,
  round TEXT NOT NULL,
  players JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_results table to store game results
CREATE TABLE IF NOT EXISTS match_results (
  id SERIAL PRIMARY KEY,
  match_id TEXT NOT NULL,
  round TEXT NOT NULL,
  date TEXT NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, round)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_match_lineups_match_id ON match_lineups(match_id);
CREATE INDEX IF NOT EXISTS idx_match_results_match_id ON match_results(match_id);
CREATE INDEX IF NOT EXISTS idx_match_results_date ON match_results(date);

-- Enable Row Level Security
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_results ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all authenticated and anonymous users to read data
CREATE POLICY "Allow public read access to lineups" ON match_lineups
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow public read access to results" ON match_results
  FOR SELECT TO public
  USING (true);

-- Create policies to allow authenticated users to insert/update data
CREATE POLICY "Allow authenticated insert to lineups" ON match_lineups
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to lineups" ON match_lineups
  FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert to results" ON match_results
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to results" ON match_results
  FOR UPDATE TO authenticated
  USING (true);
