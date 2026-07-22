// Shared schedule + team data for the tournament

export const DAY_NAMES_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
export const DAY_NAMES_ZH = ["日", "一", "二", "三", "四", "五", "六"]

// 4 teams only
export const TEAMS = {
  xiemo:   { name: "邪魔外道",     logo: "/logos/tw1.png",      color: "#facc15" },
  spkt:    { name: "新蒲崗蕃茄黨", logo: "/logos/tw2.png",      color: "#ef4444" },
  hailuk:  { name: "海陸胸墊隊",   logo: "/logos/tw3.jpeg",     color: "#87CEEB" },
  wushuang:{ name: "無雙大雅",     logo: "/logos/wushuang.png", color: "#22d3ee" },
} as const

export type TeamKey = keyof typeof TEAMS

// Players per team (3 per team as given)
export const PLAYERS_BY_TEAM: Record<TeamKey, string[]> = {
  xiemo:   ["邪魔肥仔", "啤啤", "皇詐俠"],
  spkt:    ["毛毛爸爸", "肥手手", "Kazuha"],
  hailuk:  ["真寶", "Leona", "Elvan", "純真"],
  wushuang:["Krystal", "Koko", "何Sir"],
}

export interface MatchCard {
  id: string
  table: "T1" | "T2"
  date: string           // YYYY-MM-DD
  isLive?: boolean
  teams: [TeamKey, TeamKey, TeamKey, TeamKey]
  winner?: TeamKey | null
  status: "upcoming" | "live" | "completed"
}

export interface ScheduleDay {
  date: string
  matches: MatchCard[]
}

// Tournament: 雲龍盃 SEASON 0 (Cloud Dragon Cup)
// Dates: April 25(Sat), 26(Sun), May 2(Sat), 3(Sun), 16(Sat), 17(Sun)
// Daily schedule: Check-in 18:40, R1 19:00-20:40, Break, R2 21:00-22:40
export const TOURNAMENT_NAME = "雲龍盃 SEASON 0"
export const TOURNAMENT_NAME_EN = "Cloud Dragon Cup"

export const FULL_SCHEDULE: ScheduleDay[] = [
  {
    date: "2026-04-25",
    matches: [
      {
        id: "r1",
        table: "T1",
        date: "2026-04-25",
        teams: ["xiemo", "spkt", "hailuk", "wushuang"],
        winner: "hailuk",
        status: "completed",
      },
    ],
  },
  {
    date: "2026-04-26",
    matches: [
      {
        id: "r2",
        table: "T1",
        date: "2026-04-26",
        teams: ["spkt", "wushuang", "xiemo", "hailuk"],
        winner: "hailuk",
        status: "completed",
      },
    ],
  },
  {
    date: "2026-05-02",
    matches: [
      {
        id: "r3",
        table: "T1",
        date: "2026-05-02",
        teams: ["hailuk", "xiemo", "wushuang", "spkt"],
        winner: "hailuk",
        status: "completed",
      },
    ],
  },
  {
    date: "2026-05-03",
    matches: [
      {
        id: "r4",
        table: "T1",
        date: "2026-05-03",
        teams: ["wushuang", "hailuk", "spkt", "xiemo"],
        winner: "xiemo",
        status: "completed",
      },
    ],
  },
  {
    date: "2026-05-16",
    matches: [
      {
        id: "r5",
        table: "T1",
        date: "2026-05-16",
        teams: ["spkt", "xiemo", "hailuk", "wushuang"],
        winner: "hailuk",
        status: "completed",
      },
    ],
  },
  {
    date: "2026-05-17",
    matches: [
      {
        id: "r6",
        table: "T1",
        date: "2026-05-17",
        teams: ["xiemo", "wushuang", "spkt", "hailuk"],
        status: "upcoming",
      },
    ],
  },
]

// Helper: get first upcoming or live match
export function getNextMatch(): MatchCard | null {
  for (const day of FULL_SCHEDULE) {
    for (const match of day.matches) {
      if (match.status === "live" || match.status === "upcoming") return match
    }
  }
  return null
}

// Helper: get N upcoming matches
export function getUpcomingMatches(limit = 4): MatchCard[] {
  const upcoming: MatchCard[] = []
  for (const day of FULL_SCHEDULE) {
    for (const match of day.matches) {
      if (match.status === "live" || match.status === "upcoming") {
        upcoming.push(match)
        if (upcoming.length >= limit) return upcoming
      }
    }
  }
  return upcoming
}

// Helper: format date — returns DD/MM (MON) 19:00
export function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  const dayIdx = d.getDay()
  const dd   = String(d.getDate()).padStart(2, "0")
  const mm   = String(d.getMonth() + 1).padStart(2, "0")
  return {
    dayEn:       DAY_NAMES_EN[dayIdx],
    dayZh:       DAY_NAMES_ZH[dayIdx],
    shortDate:   `${dd}/${mm}`,
    dateTimeFull:`${dd}/${mm} (${DAY_NAMES_EN[dayIdx]}) 19:00`,
    full:         dateStr,
  }
}
