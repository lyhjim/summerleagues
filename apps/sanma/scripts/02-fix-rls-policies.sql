-- Allow public (anonymous) INSERT and UPDATE for match data
-- This enables the league dashboard to work without authentication

DROP POLICY IF EXISTS "Allow authenticated insert to results" ON match_results;
DROP POLICY IF EXISTS "Allow authenticated update to results" ON match_results;
DROP POLICY IF EXISTS "Allow authenticated insert to lineups" ON match_lineups;
DROP POLICY IF EXISTS "Allow authenticated update to lineups" ON match_lineups;

-- Create new policies for public access
CREATE POLICY "Allow public insert to results"
  ON match_results FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to results"
  ON match_results FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public insert to lineups"
  ON match_lineups FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to lineups"
  ON match_lineups FOR UPDATE
  TO public
  USING (true);

-- Create news table
CREATE TABLE IF NOT EXISTS news_items (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- Create policies for news
CREATE POLICY "Allow public read access to news"
  ON news_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to news"
  ON news_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to news"
  ON news_items FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete from news"
  ON news_items FOR DELETE
  TO public
  USING (true);
