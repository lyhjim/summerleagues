export interface SummerMatch {
  gameNumber: number
  date: string
  day: number
  location: string
  teams: {
    teamName: string
    playerNum: number // 1 or 2
  }[] // [East, South, West, North]
  finalResults?: {
    playerName: string
    team: string
    wind: "E" | "S" | "W" | "N"
    finalScore: number
    points: number
  }[]
}

export const summerSchedule: SummerMatch[] = [
  // Day 1 - June 15
  {
    gameNumber: 1,
    date: "6月15日",
    day: 1,
    location: "台北",
    teams: [
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
    ],
  },
  {
    gameNumber: 2,
    date: "6月15日",
    day: 1,
    location: "台北",
    teams: [
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
    ],
  },
  {
    gameNumber: 3,
    date: "6月15日",
    day: 1,
    location: "台北",
    teams: [
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
    ],
  },
  {
    gameNumber: 4,
    date: "6月15日",
    day: 1,
    location: "東京Ultima",
    teams: [
      { teamName: "影雀", playerNum: 2 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
    ],
  },
  {
    gameNumber: 5,
    date: "6月15日",
    day: 1,
    location: "東京Ultima",
    teams: [
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
    ],
  },
  {
    gameNumber: 6,
    date: "6月15日",
    day: 1,
    location: "東京Ultima",
    teams: [
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 1 },
    ],
  },
  {
    gameNumber: 7,
    date: "6月15日",
    day: 1,
    location: "東京Rex3",
    teams: [
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
    ],
  },
  {
    gameNumber: 8,
    date: "6月15日",
    day: 1,
    location: "東京Rex3",
    teams: [
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
    ],
  },
  {
    gameNumber: 9,
    date: "6月15日",
    day: 1,
    location: "東京Rex3",
    teams: [
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "諾亞方舟", playerNum: 2 },
    ],
  },

  // Day 2 - June 18
  {
    gameNumber: 10,
    date: "6月18日",
    day: 2,
    location: "台北",
    teams: [
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
    ],
  },
  {
    gameNumber: 11,
    date: "6月18日",
    day: 2,
    location: "台北",
    teams: [
      { teamName: "影雀", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
    ],
  },
  {
    gameNumber: 12,
    date: "6月18日",
    day: 2,
    location: "台北",
    teams: [
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
    ],
  },
  {
    gameNumber: 13,
    date: "6月18日",
    day: 2,
    location: "東京Ultima",
    teams: [
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 1 },
    ],
  },
  {
    gameNumber: 14,
    date: "6月18日",
    day: 2,
    location: "東京Ultima",
    teams: [
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
    ],
  },
  {
    gameNumber: 15,
    date: "6月18日",
    day: 2,
    location: "東京Ultima",
    teams: [
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "層層疊", playerNum: 2 },
    ],
  },
  {
    gameNumber: 16,
    date: "6月18日",
    day: 2,
    location: "東京Rex3",
    teams: [
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
    ],
  },
  {
    gameNumber: 17,
    date: "6月18日",
    day: 2,
    location: "東京Rex3",
    teams: [
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
    ],
  },
  {
    gameNumber: 18,
    date: "6月18日",
    day: 2,
    location: "東京Rex3",
    teams: [
      { teamName: "影雀", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
    ],
  },

  // Day 3 - June 22
  {
    gameNumber: 19,
    date: "6月22日",
    day: 3,
    location: "台北",
    teams: [
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
    ],
  },
  {
    gameNumber: 20,
    date: "6月22日",
    day: 3,
    location: "台北",
    teams: [
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
    ],
  },
  {
    gameNumber: 21,
    date: "6月22日",
    day: 3,
    location: "台北",
    teams: [
      { teamName: "影雀", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
    ],
  },
  {
    gameNumber: 22,
    date: "6月22日",
    day: 3,
    location: "東京Ultima",
    teams: [
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
    ],
  },
  {
    gameNumber: 23,
    date: "6月22日",
    day: 3,
    location: "東京Ultima",
    teams: [
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "層層疊", playerNum: 2 },
    ],
  },
  {
    gameNumber: 24,
    date: "6月22日",
    day: 3,
    location: "東京Ultima",
    teams: [
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 1 },
    ],
  },
  {
    gameNumber: 25,
    date: "6月22日",
    day: 3,
    location: "東京Rex3",
    teams: [
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
    ],
  },
  {
    gameNumber: 26,
    date: "6月22日",
    day: 3,
    location: "東京Rex3",
    teams: [
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
    ],
  },
  {
    gameNumber: 27,
    date: "6月22日",
    day: 3,
    location: "東京Rex3",
    teams: [
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
    ],
  },

  // Day 4 - June 25
  {
    gameNumber: 28,
    date: "6月25日",
    day: 4,
    location: "台北",
    teams: [
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
    ],
  },
  {
    gameNumber: 29,
    date: "6月25日",
    day: 4,
    location: "台北",
    teams: [
      { teamName: "影雀", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
    ],
  },
  {
    gameNumber: 30,
    date: "6月25日",
    day: 4,
    location: "台北",
    teams: [
      { teamName: "諾亞方舟", playerNum: 1 },
      { teamName: "影雀", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
    ],
  },
  {
    gameNumber: 31,
    date: "6月25日",
    day: 4,
    location: "東京Ultima",
    teams: [
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "層層疊", playerNum: 2 },
    ],
  },
  {
    gameNumber: 32,
    date: "6月25日",
    day: 4,
    location: "東京Ultima",
    teams: [
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "諾亞方舟", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
    ],
  },
  {
    gameNumber: 33,
    date: "6月25日",
    day: 4,
    location: "東京Ultima",
    teams: [
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "諾亞方舟", playerNum: 2 },
    ],
  },
  {
    gameNumber: 34,
    date: "6月25日",
    day: 4,
    location: "東京Rex3",
    teams: [
      { teamName: "影雀", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
    ],
  },
  {
    gameNumber: 35,
    date: "6月25日",
    day: 4,
    location: "東京Rex3",
    teams: [
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
    ],
  },
  {
    gameNumber: 36,
    date: "6月25日",
    day: 4,
    location: "東京Rex3",
    teams: [
      { teamName: "鬼點子", playerNum: 2 },
      { teamName: "疾風勁草", playerNum: 2 },
      { teamName: "影雀", playerNum: 2 },
      { teamName: "雙狙人", playerNum: 2 },
    ],
  },

  // Finals - June 29 & July 2
  {
    gameNumber: 37,
    date: "6月29日",
    day: 5,
    location: "台北直播",
    teams: [
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
    ],
  },
  {
    gameNumber: 38,
    date: "6月29日",
    day: 5,
    location: "台北直播",
    teams: [
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
    ],
  },
  {
    gameNumber: 39,
    date: "7月2日",
    day: 5,
    location: "台北直播",
    teams: [
      { teamName: "鬼點子", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "層層疊", playerNum: 1 },
    ],
  },
  {
    gameNumber: 40,
    date: "7月2日",
    day: 5,
    location: "台北直播",
    teams: [
      { teamName: "層層疊", playerNum: 1 },
      { teamName: "疾風勁草", playerNum: 1 },
      { teamName: "雙狙人", playerNum: 1 },
      { teamName: "鬼點子", playerNum: 1 },
    ],
  },
]
