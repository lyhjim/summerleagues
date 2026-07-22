export type Match = {
  table: number
  teams: [string, string, string, string]
}

export type MatchDay = {
  date: string
  day: string
  round: number
  matches: Match[]
  completed?: boolean
}

export const teamLogos: Record<string, { logo: string }> = {
  "天月麻雀":   { logo: "/images/amatsuki-logo.png" },
  "狂戰士":     { logo: "/images/berserker-logo.png" },
  "Bad Beat":     { logo: "/images/4bb.png" },
  "牌道":       { logo: "/images/paidao-logo.png" },
  "易和團":     { logo: "/images/eron-logo.png" },
  "愚形上等":   { logo: "/images/guxing-logo.jpeg" },
  "錦鯉咪好勁": { logo: "/images/koi-logo.jpeg" },
  "御無礼":     { logo: "/images/gobure-logo.jpeg" },
}

export const schedule: MatchDay[] = [
  { date: "3月9日",  day: "一", round: 1,  completed: false, matches: [{ table: 1, teams: ["天月麻雀","愚形上等","錦鯉咪好勁","御無礼"] },    { table: 2, teams: ["御無礼","錦鯉咪好勁","愚形上等","天月麻雀"] }] },
  { date: "3月12日", day: "四", round: 2,  completed: false, matches: [{ table: 1, teams: ["狂戰士","Bad Beat","牌道","易和團"] }, { table: 2, teams: ["易和團","牌道","Bad Beat","狂戰士"] }] },
  { date: "3月16日", day: "一", round: 2,  completed: false, matches: [{ table: 1, teams: ["愚形上等","御無礼","狂戰士","易和團"] }, { table: 2, teams: ["易和團","狂戰士","御無礼","愚形上等"] }] },
  { date: "3月19日", day: "四", round: 3,  completed: false, matches: [{ table: 1, teams: ["錦鯉咪好勁","牌道","天月麻雀","Bad Beat"] },   { table: 2, teams: ["Bad Beat","天月麻雀","牌道","錦鯉咪好勁"] }] },
  { date: "3月23日", day: "一", round: 3,  completed: false, matches: [{ table: 1, teams: ["狂戰士","錦鯉咪好勁","Bad Beat","御無礼"] },{ table: 2, teams: ["御無礼","Bad Beat","錦鯉咪好勁","狂戰士"] }] },
  { date: "3月26日", day: "四", round: 4,  completed: false, matches: [{ table: 1, teams: ["天月麻雀","易和團","愚形上等","牌道"] },      { table: 2, teams: ["牌道","愚形上等","易和團","天月麻雀"] }] },
  { date: "3月30日", day: "一", round: 4,  completed: false, matches: [{ table: 1, teams: ["愚形上等","狂戰士","天月麻雀","Bad Beat"] },{ table: 2, teams: ["Bad Beat","天月麻雀","狂戰士","愚形上等"] }] },
  { date: "4月2日",  day: "四", round: 5,  completed: false, matches: [{ table: 1, teams: ["易和團","牌道","御無礼","錦鯉咪好勁"] },      { table: 2, teams: ["錦鯉咪好勁","御無礼","牌道","易和團"] }] },
  { date: "4月6日",  day: "一", round: 5,  completed: false, matches: [{ table: 1, teams: ["狂戰士","天月麻雀","易和團","錦鯉咪好勁"] },    { table: 2, teams: ["錦鯉咪好勁","易和團","天月麻雀","狂戰士"] }] },
  { date: "4月9日",  day: "四", round: 6,  completed: false, matches: [{ table: 1, teams: ["牌道","Bad Beat","愚形上等","御無礼"] },   { table: 2, teams: ["御無礼","愚形上等","Bad Beat","牌道"] }] },
  { date: "4月13日", day: "一", round: 6,  completed: false, matches: [{ table: 1, teams: ["愚形上等","狂戰士","錦鯉咪好勁","牌道"] }, { table: 2, teams: ["牌道","錦鯉咪好勁","狂戰士","愚形上等"] }] },
  { date: "4月16日", day: "四", round: 7,  completed: false, matches: [{ table: 1, teams: ["天月麻雀","易和團","御無礼","Bad Beat"] },     { table: 2, teams: ["Bad Beat","御無礼","易和團","天月麻雀"] }] },
  { date: "4月20日", day: "一", round: 7,  completed: false, matches: [{ table: 1, teams: ["狂戰士","牌道","天月麻雀","御無礼"] },         { table: 2, teams: ["御無礼","天月麻雀","牌道","狂戰士"] }] },
  { date: "4月23日", day: "四", round: 8,  completed: false, matches: [{ table: 1, teams: ["錦鯉咪好勁","愚形上等","Bad Beat","易和團"] },       { table: 2, teams: ["易和團","Bad Beat","愚形上等","錦鯉咪好勁"] }] },
  { date: "4月27日", day: "一", round: 8,  completed: false, matches: [{ table: 1, teams: ["御無礼","錦鯉咪好勁","易和團","Bad Beat"] },   { table: 2, teams: ["Bad Beat","易和團","錦鯉咪好勁","御無礼"] }] },
  { date: "4月30日", day: "四", round: 9,  completed: false, matches: [{ table: 1, teams: ["天月麻雀","狂戰士","愚形上等","牌道"] }, { table: 2, teams: ["牌道","愚形上等","狂戰士","天月麻雀"] }] },
  { date: "5月4日",  day: "一", round: 9,  completed: false, matches: [{ table: 1, teams: ["愚形上等","牌道","御無礼","易和團"] }, { table: 2, teams: ["易和團","御無礼","牌道","愚形上等"] }] },
  { date: "5月7日",  day: "四", round: 10, completed: false, matches: [{ table: 1, teams: ["錦鯉咪好勁","天月麻雀","狂戰士","Bad Beat"] },{ table: 2, teams: ["Bad Beat","狂戰士","天月麻雀","錦鯉咪好勁"] }] },
  { date: "5月11日", day: "一", round: 10, completed: false, matches: [{ table: 1, teams: ["Bad Beat","易和團","狂戰士","牌道"] },    { table: 2, teams: ["牌道","狂戰士","易和團","Bad Beat"] }] },
  { date: "5月14日", day: "四", round: 11, completed: false, matches: [{ table: 1, teams: ["御無礼","愚形上等","錦鯉咪好勁","天月麻雀"] },{ table: 2, teams: ["天月麻雀","錦鯉咪好勁","愚形上等","御無礼"] }] },
  { date: "5月18日", day: "一", round: 11, completed: false, matches: [{ table: 1, teams: ["錦鯉咪好勁","牌道","Bad Beat","愚形上等"] }, { table: 2, teams: ["愚形上等","Bad Beat","牌道","錦鯉咪好勁"] }] },
  { date: "5月21日", day: "四", round: 12, completed: false, matches: [{ table: 1, teams: ["易和團","御無礼","天月麻雀","狂戰士"] },    { table: 2, teams: ["狂戰士","天月麻雀","御無礼","易和團"] }] },
  { date: "5月25日", day: "一", round: 12, completed: false, matches: [{ table: 1, teams: ["牌道","Bad Beat","御無礼","天月麻雀"] },{ table: 2, teams: ["天月麻雀","御無礼","Bad Beat","牌道"] }] },
  { date: "5月28日", day: "四", round: 13, completed: false, matches: [{ table: 1, teams: ["狂戰士","愚形上等","錦鯉咪好勁","易和團"] }, { table: 2, teams: ["易和團","錦鯉咪好勁","愚形上等","狂戰士"] }] },
  { date: "6月1日",  day: "一", round: 13, completed: false, matches: [{ table: 1, teams: ["錦鯉咪好勁","天月麻雀","易和團","牌道"] },      { table: 2, teams: ["牌道","易和團","天月麻雀","錦鯉咪好勁"] }] },
  { date: "6月4日",  day: "四", round: 14, completed: false, matches: [{ table: 1, teams: ["Bad Beat","狂戰士","御無礼","愚形上等"] }, { table: 2, teams: ["愚形上等","御無礼","狂戰士","Bad Beat"] }] },
  { date: "6月8日",  day: "一", round: 14, completed: false, matches: [{ table: 1, teams: ["天月麻雀","易和團","Bad Beat","愚形上等"] }, { table: 2, teams: ["愚形上等","Bad Beat","易和團","天月麻雀"] }] },
  { date: "6月11日", day: "四", round: 15, completed: false, matches: [{ table: 1, teams: ["狂戰士","錦鯉咪好勁","牌道","御無礼"] }, { table: 2, teams: ["御無礼","牌道","錦鯉咪好勁","狂戰士"] }] },
]
