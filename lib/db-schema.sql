-- Create game_lineups table to store upcoming game lineups
CREATE TABLE IF NOT EXISTS game_lineups (
  id SERIAL PRIMARY KEY,
  game_number INTEGER UNIQUE NOT NULL,
  teams_players JSONB NOT NULL, -- JSON object mapping team names to player names
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example data for Games 49-50
INSERT INTO game_lineups (game_number, teams_players) VALUES
(49, '{"錦鯉咪好勁": "Kelly", "天月麻雀": "Katherine", "易和團": "Leo", "牌道": "Billy"}'),
(50, '{"牌道": "魔女", "易和團": "鴨哥", "天月麻雀": "Krystal", "錦鯉咪好勁": "Sunny Sir"}')
ON CONFLICT (game_number) DO UPDATE SET 
  teams_players = EXCLUDED.teams_players,
  updated_at = CURRENT_TIMESTAMP;
