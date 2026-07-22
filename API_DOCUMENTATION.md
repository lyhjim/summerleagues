# Game Results API

This document explains how to use the game results API from your overlay site.

## Endpoint

```
POST /api/results
```

## Authentication

Include your API key in the request header:

```
x-api-key: YOUR_RESULTS_API_KEY
```

## Request Body

Send a JSON object with the following structure:

```json
{
  "gameId": "r1_t1_g1",
  "date": "2026-05-24",
  "round": "第一節",
  "matchday": 1,
  "players": [
    {
      "name": "Friend",
      "team": "amatsuki",
      "score": 45000,
      "position": 1,
      "points": 70.0
    },
    {
      "name": "Kaiser",
      "team": "gobure",
      "score": 35000,
      "position": 2,
      "points": 13.1
    },
    {
      "name": "倉鼠",
      "team": "badbeat",
      "score": 25000,
      "position": 3,
      "points": -12.0
    },
    {
      "name": "Steven",
      "team": "paidao",
      "score": -5000,
      "position": 4,
      "points": -71.1
    }
  ],
  "totalRounds": 12,
  "drawnGames": 3,
  "transactions": [
    {
      "roundName": "東一局 (流局)",
      "players": [
        {
          "action": "tenpai",
          "pointChange": 1500,
          "riichiInfo": "立直 (-1,000)",
          "yaku": "",
          "runningScore": 25500
        },
        {
          "action": "no_ten",
          "pointChange": -1500,
          "runningScore": 23500
        },
        {
          "action": "no_ten",
          "pointChange": -1500,
          "runningScore": 23500
        },
        {
          "action": "tenpai",
          "pointChange": 1500,
          "runningScore": 26500
        }
      ]
    },
    {
      "roundName": "東一局1本場",
      "players": [
        {
          "action": "tsumo",
          "pointChange": 14300,
          "riichiInfo": "(+2,300)",
          "yaku": "立直 門前清自摸和 平和 赤寶牌1 裏寶牌1",
          "runningScore": 38800
        },
        {
          "action": "none",
          "pointChange": -4100,
          "runningScore": 19400
        },
        {
          "action": "none",
          "pointChange": -4100,
          "runningScore": 19400
        },
        {
          "action": "none",
          "pointChange": -4100,
          "runningScore": 22400
        }
      ]
    }
  ]
}
```

## Field Descriptions

### Required Fields
- `gameId` (string): Unique identifier for the game (e.g., `r1_t1_g1` = round 1, table 1, game 1)
- `date` (string): Game date in YYYY-MM-DD format
- `round` (string): Round name (e.g., "第一節", "第二節")
- `matchday` (number): Match day number (1-14)
- `players` (array): Array of exactly 4 player objects
  - `name` (string): Player's name
  - `team` (string): Team ID (see Team IDs below)
  - `score` (number): Final game score (e.g., 45000)
  - `position` (number): Finishing position (1, 2, 3, or 4)
  - `points` (number): League points awarded (e.g., +70.0, +13.1, -12.0, -71.1)

### Optional Fields (Transaction Summary)
- `totalRounds` (number): Total rounds played (總局數)
- `drawnGames` (number): Number of drawn games (流局數)
- `transactions` (array): Round-by-round transaction details
  - `roundName` (string): Round name (e.g., "東一局", "東一局1本場", "東二局 (流局)")
  - `players` (array): Array of 4 player transaction objects (same order as main players array)
    - `action` (string): One of: `tsumo`, `ron`, `deal_in`, `no_ten`, `tenpai`, `riichi_deposit`, `none`
    - `pointChange` (number): Points gained/lost in this round (e.g., +14300, -4100)
    - `riichiInfo` (string, optional): Riichi deposit info (e.g., "立直 (-1,000)" or "(+2,300)")
    - `yaku` (string, optional): Winning hand description (e.g., "立直 門前清自摸和 平和 赤寶牌1")
    - `runningScore` (number): Score after this round

### Action Types
| Action | Chinese | Description |
|--------|---------|-------------|
| `tsumo` | 自摸 | Self-draw win |
| `ron` | 榮和 | Win by discard |
| `deal_in` | 放銃 | Deal-in (paid for someone's ron) |
| `no_ten` | 不聽 | No-ten (not ready) in draw |
| `tenpai` | 聽牌 | Tenpai (ready) in draw |
| `riichi_deposit` | - | Only lost riichi deposit |
| `none` | - | No special action (just paid tsumo, etc.)

## Example Usage (JavaScript)

```javascript
const API_KEY = "your-api-key-here"
const BASE_URL = "https://yourleague.com"

async function submitGameResult(gameData) {
  try {
    const response = await fetch(`${BASE_URL}/api/results`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(gameData),
    })

    const result = await response.json()

    if (response.ok) {
      console.log("Game result submitted:", result)
      return true
    } else {
      console.error("Error:", result.error)
      return false
    }
  } catch (error) {
    console.error("Request failed:", error)
    return false
  }
}

// Usage
const gameData = {
  gameId: "game_001",
  date: "2026-05-24",
  round: "第一輪",
  matchday: 1,
  players: [
    {
      name: "魔女",
      team: "paidao",
      score: 45000,
      position: 1,
      points: 50,
    },
    // ... other 3 players
  ],
}

submitGameResult(gameData)
```

## Response

**Success (200):**
```json
{
  "success": true,
  "gameId": "game_001"
}
```

**Error (401):**
```json
{
  "error": "Unauthorized"
}
```

**Error (400):**
```json
{
  "error": "Missing required fields: gameId, date, round, matchday, players"
}
```

## Other Endpoints

### GET /api/results
Retrieve all game results (no authentication needed).

**Response:**
```json
[
  {
    "gameId": "game_001",
    "date": "2026-05-24",
    "round": "第一輪",
    "matchday": 1,
    "players": [...]
  }
]
```

### DELETE /api/results?gameId=game_001
Delete a specific game result (requires API key).

**Response:**
```json
{
  "success": true,
  "gameId": "game_001"
}
```

## Team IDs

```
paidao      - 牌道
guxing      - 愚形上等
eron        - 易和團
badbeat     - 壞拍子
nishikigoi  - 錦鯉咪好勁
berserker   - 狂戰士
amatsuki    - 天月麻雀
gobure      - 御無禮
```
