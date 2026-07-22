// Semi-Final (準決賽) Match Schedule - April - May 2026
// 9 teams: Each match day has 2 tables (T1, T2=直播桌), each with 3 teams playing 1 半莊

export interface SemiFinalsMatch {
  id: string
  week: number
  date: string
  dayOfWeek: string
  table: "T1" | "T2"
  teams: string[] // exactly 3 teams per table
  isLivestream?: boolean
  isCompleted?: boolean
}

export type GameKey = "r1g1" | "r1g2" | "r1g3" | "r2g1" | "r2g2" | "r2g3"
export const GAME_KEYS: GameKey[] = ["r1g1", "r1g2", "r1g3", "r2g1", "r2g2", "r2g3"]
export const GAME_LABELS: Record<GameKey, string> = {
  r1g1: "首輪 第1半莊",
  r1g2: "首輪 第2半莊",
  r1g3: "首輪 第3半莊",
  r2g1: "次輪 第1半莊",
  r2g2: "次輪 第2半莊",
  r2g3: "次輪 第3半莊",
}

export const semiFinalsSchedule: SemiFinalsMatch[] = [
  // Week 1: April 28 - May 1
  // Apr 28 (Tue)
  { id: "2026-04-28-T1", week: 1, date: "2026-04-28", dayOfWeek: "星期二", table: "T1", isLivestream: false, teams: ["缺五五番", "大西北3兄弟", "卡比瘦"] },
  { id: "2026-04-28-T2", week: 1, date: "2026-04-28", dayOfWeek: "星期二", table: "T2", isLivestream: true,  teams: ["老友鬼鬼", "吸金魔術師", "剛滿20歲"] },
  // Apr 29 (Wed)
  { id: "2026-04-29-T1", week: 1, date: "2026-04-29", dayOfWeek: "星期三", table: "T1", isLivestream: false, teams: ["剛滿20歲", "無敵推土機", "邪魔外道"] },
  { id: "2026-04-29-T2", week: 1, date: "2026-04-29", dayOfWeek: "星期三", table: "T2", isLivestream: true,  teams: ["魔法葉", "卡比瘦", "大西北3兄弟"] },
  // May 1 (Fri)
  { id: "2026-05-01-T1", week: 1, date: "2026-05-01", dayOfWeek: "星期五", table: "T1", isLivestream: false, teams: ["魔法葉", "吸金魔術師", "老友鬼鬼"] },
  { id: "2026-05-01-T2", week: 1, date: "2026-05-01", dayOfWeek: "星期五", table: "T2", isLivestream: true,  teams: ["無敵推土機", "缺五五番", "邪魔外道"] },

  // Week 2: May 5 - May 8
  // May 5 (Tue)
  { id: "2026-05-05-T1", week: 2, date: "2026-05-05", dayOfWeek: "星期二", table: "T1", isLivestream: false, teams: ["剛滿20歲", "魔法葉", "卡比瘦"] },
  { id: "2026-05-05-T2", week: 2, date: "2026-05-05", dayOfWeek: "星期二", table: "T2", isLivestream: true,  teams: ["老友鬼鬼", "缺五五番", "大西北3兄弟"] },
  // May 6 (Wed)
  { id: "2026-05-06-T1", week: 2, date: "2026-05-06", dayOfWeek: "星期三", table: "T1", isLivestream: false, teams: ["邪魔外道", "老友鬼鬼", "大西北3兄弟"] },
  { id: "2026-05-06-T2", week: 2, date: "2026-05-06", dayOfWeek: "星期三", table: "T2", isLivestream: true,  teams: ["吸金魔術師", "卡比瘦", "無敵推土機"] },
  // May 8 (Fri)
  { id: "2026-05-08-T1", week: 2, date: "2026-05-08", dayOfWeek: "星期五", table: "T1", isLivestream: false, teams: ["吸金魔術師", "無敵推土機", "缺五五番"] },
  { id: "2026-05-08-T2", week: 2, date: "2026-05-08", dayOfWeek: "星期五", table: "T2", isLivestream: true,  teams: ["魔法葉", "邪魔外道", "剛滿20歲"] },

  // Week 3: May 12 - May 15
  // May 12 (Tue)
  { id: "2026-05-12-T1", week: 3, date: "2026-05-12", dayOfWeek: "星期二", table: "T1", isLivestream: false, teams: ["無敵推土機", "大西北3兄弟", "魔法葉"] },
  { id: "2026-05-12-T2", week: 3, date: "2026-05-12", dayOfWeek: "星期二", table: "T2", isLivestream: true,  teams: ["缺五五番", "卡比瘦", "剛滿20歲"] },
  // May 13 (Wed)
  { id: "2026-05-13-T1", week: 3, date: "2026-05-13", dayOfWeek: "星期三", table: "T1", isLivestream: false, teams: ["卡比瘦", "吸金魔術師", "邪魔外道"] },
  { id: "2026-05-13-T2", week: 3, date: "2026-05-13", dayOfWeek: "星期三", table: "T2", isLivestream: true,  teams: ["魔法葉", "老友鬼鬼", "無敵推土機"] },
  // May 15 (Fri)
  { id: "2026-05-15-T1", week: 3, date: "2026-05-15", dayOfWeek: "星期五", table: "T1", isLivestream: false, teams: ["缺五五番", "剛滿20歲", "老友鬼鬼"] },
  { id: "2026-05-15-T2", week: 3, date: "2026-05-15", dayOfWeek: "星期五", table: "T2", isLivestream: true,  teams: ["邪魔外道", "吸金魔術師", "大西北3兄弟"] },

  // Week 4: May 19 - May 22
  // May 19 (Tue)
  { id: "2026-05-19-T1", week: 4, date: "2026-05-19", dayOfWeek: "星期二", table: "T1", isLivestream: false, teams: ["吸金魔術師", "缺五五番", "魔法葉"] },
  { id: "2026-05-19-T2", week: 4, date: "2026-05-19", dayOfWeek: "星期二", table: "T2", isLivestream: true,  teams: ["卡比瘦", "無敵推土機", "老友鬼鬼"] },
  // May 20 (Wed)
  { id: "2026-05-20-T1", week: 4, date: "2026-05-20", dayOfWeek: "星期三", table: "T1", isLivestream: false, teams: ["老友鬼鬼", "邪魔外道", "卡比瘦"] },
  { id: "2026-05-20-T2", week: 4, date: "2026-05-20", dayOfWeek: "星期三", table: "T2", isLivestream: true,  teams: ["剛滿20歲", "大西北3兄弟", "吸金魔術師"] },
  // May 22 (Fri)
  { id: "2026-05-22-T1", week: 4, date: "2026-05-22", dayOfWeek: "星期五", table: "T1", isLivestream: false, teams: ["大西北3兄弟", "剛滿20歲", "無敵推土機"] },
  { id: "2026-05-22-T2", week: 4, date: "2026-05-22", dayOfWeek: "星期五", table: "T2", isLivestream: true,  teams: ["邪魔外道", "魔法葉", "缺五五番"] },
]

export const TOP_NINE_TEAMS = [
  "老友鬼鬼",
  "吸金魔術師",
  "剛滿20歲",
  "魔法葉",
  "卡比瘦",
  "大西北3兄弟",
  "無敵推土機",
  "缺五五番",
  "邪魔外道",
]

// Semi-Finals Starting Chip Counts
export const SEMI_FINALS_STARTING_CHIPS: Record<string, number> = {
  "魔法葉": 179,
  "邪魔外道": 178,
  "缺五五番": 177,
  "剛滿20歲": 150,
  "大西北3兄弟": 136,
  "吸金魔術師": 96,
  "卡比瘦": 67,
  "老友鬼鬼": -6,
  "無敵推土機": -28,
}
