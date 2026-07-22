-- Create round_results table for storing match scores
CREATE TABLE IF NOT EXISTS round_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT NOT NULL,
  round INTEGER NOT NULL CHECK (round IN (1, 2)),
  match_date TEXT NOT NULL,
  scores JSONB NOT NULL DEFAULT '[]',
  submitted_at BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, round)
);

-- Create team_colors table for storing custom team colors
CREATE TABLE IF NOT EXISTS team_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE round_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_colors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "public_read_round_results" ON round_results;
DROP POLICY IF EXISTS "public_write_round_results" ON round_results;
DROP POLICY IF EXISTS "public_read_team_colors" ON team_colors;
DROP POLICY IF EXISTS "public_write_team_colors" ON team_colors;

-- Allow public access (for simplicity - admin auth can be added later)
CREATE POLICY "public_read_round_results" ON round_results FOR SELECT USING (true);
CREATE POLICY "public_write_round_results" ON round_results FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public_read_team_colors" ON team_colors FOR SELECT USING (true);
CREATE POLICY "public_write_team_colors" ON team_colors FOR ALL USING (true) WITH CHECK (true);
