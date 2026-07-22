export interface SummerTeam {
  id: string
  chineseName: string
  englishName: string
  players: {
    name: string
    isSupervisor: boolean
  }[]
  points?: number
  matches?: number
  first?: number
  second?: number
  third?: number
  fourth?: number
}

export const summerTeams: SummerTeam[] = [
  {
    id: "jenga",
    chineseName: "層層疊",
    englishName: "Jenga",
    players: [
      { name: "麥旋風", isSupervisor: true },
      { name: "Cole 姐", isSupervisor: false },
      { name: "爆鷹", isSupervisor: false },
      { name: "白痴仔", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
  {
    id: "kdz",
    chineseName: "鬼點子",
    englishName: "",
    players: [
      { name: "Marcus", isSupervisor: true },
      { name: "Lyun", isSupervisor: false },
      { name: "Sunny", isSupervisor: false },
      { name: "Ching", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
  {
    id: "snipers",
    chineseName: "雙狙人",
    englishName: "Snipers",
    players: [
      { name: "Cal", isSupervisor: true },
      { name: "Seiya", isSupervisor: false },
      { name: "℗tony", isSupervisor: false },
      { name: "℗Johnny", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
  {
    id: "yingque",
    chineseName: "影雀",
    englishName: "",
    players: [
      { name: "℗August", isSupervisor: true },
      { name: "Hin", isSupervisor: false },
      { name: "卡樂", isSupervisor: false },
      { name: "JerryK", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
  {
    id: "teyvat",
    chineseName: "諾亞方舟",
    englishName: "Teyvat Noaḥ",
    players: [
      { name: "Abbey", isSupervisor: true },
      { name: "Kirk", isSupervisor: false },
      { name: "Desmond Yu", isSupervisor: false },
      { name: "Equal", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
  {
    id: "jifeng",
    chineseName: "疾風勁草",
    englishName: "",
    players: [
      { name: "Daniel", isSupervisor: true },
      { name: "Marco", isSupervisor: false },
      { name: "Ernest", isSupervisor: false },
      { name: "VLT", isSupervisor: false },
    ],
    points: 0,
    matches: 0,
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  },
]
