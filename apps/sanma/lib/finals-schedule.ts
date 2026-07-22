// Finals (決賽) Match Schedule - June 2026
// 3 teams: 缺五五番, 剛滿20歲, 大西北3兄弟
// Total: 8 rounds (24 hanchans = 8 rounds * 3 hanchans per round)

export interface FinalsMatch {
  id: string
  round: number
  date: string
  dayOfWeek: string
  teams: string[] // always 3 teams: 缺五五番, 剛滿20歲, 大西北3兄弟
  isLivestream: boolean
  timeSlot?: string
}

export type FinalsGameKey = "r1g1" | "r1g2" | "r1g3" | "r2g1" | "r2g2" | "r2g3" | "r3g1" | "r3g2" | "r3g3" | "r4g1" | "r4g2" | "r4g3" | "r5g1" | "r5g2" | "r5g3" | "r6g1" | "r6g2" | "r6g3" | "r7g1" | "r7g2" | "r7g3" | "r8g1" | "r8g2" | "r8g3"
export const FINALS_GAME_KEYS: FinalsGameKey[] = [
  "r1g1", "r1g2", "r1g3",
  "r2g1", "r2g2", "r2g3",
  "r3g1", "r3g2", "r3g3",
  "r4g1", "r4g2", "r4g3",
  "r5g1", "r5g2", "r5g3",
  "r6g1", "r6g2", "r6g3",
  "r7g1", "r7g2", "r7g3",
  "r8g1", "r8g2", "r8g3",
]
export const FINALS_GAME_LABELS: Record<FinalsGameKey, string> = {
  r1g1: "第1半莊", r1g2: "第2半莊", r1g3: "第3半莊",
  r2g1: "第1半莊", r2g2: "第2半莊", r2g3: "第3半莊",
  r3g1: "第1半莊", r3g2: "第2半莊", r3g3: "第3半莊",
  r4g1: "第1半莊", r4g2: "第2半莊", r4g3: "第3半莊",
  r5g1: "第1半莊", r5g2: "第2半莊", r5g3: "第3半莊",
  r6g1: "第1半莊", r6g2: "第2半莊", r6g3: "第3半莊",
  r7g1: "第1半莊", r7g2: "第2半莊", r7g3: "第3半莊",
  r8g1: "第1半莊", r8g2: "第2半莊", r8g3: "第3半莊",
}

// 3 finalist teams
export const FINALIST_TEAMS = ["缺五五番", "剛滿20歲", "大西北3兄弟"] as const

// Semi-finals carry-over chips (準決賽帶分)
export const FINALS_STARTING_CHIPS: Record<string, number> = {
  "缺五五番": 222,
  "剛滿20歲": 146,
  "大西北3兄弟": 120,
}

export const finalsSchedule: FinalsMatch[] = [
  // Jun 3 (Wed) - 2 rounds - 20:00-23:15
  { id: "2026-06-03-R1", round: 1, date: "2026-06-03", dayOfWeek: "星期三", isLivestream: true, timeSlot: "20:00-21:30", teams: ["缺五五番", "大西北3兄弟", "剛滿20歲"] },
  { id: "2026-06-03-R2", round: 2, date: "2026-06-03", dayOfWeek: "星期三", isLivestream: true, timeSlot: "21:45-23:15", teams: ["剛滿20歲", "缺五五番", "大西北3兄弟"] },

  // Jun 5 (Fri) - 2 rounds - 20:00-23:15
  { id: "2026-06-05-R1", round: 3, date: "2026-06-05", dayOfWeek: "星期五", isLivestream: true, timeSlot: "20:00-21:30", teams: ["大西北3兄弟", "剛滿20歲", "缺五五番"] },
  { id: "2026-06-05-R2", round: 4, date: "2026-06-05", dayOfWeek: "星期五", isLivestream: true, timeSlot: "21:45-23:15", teams: ["缺五五番", "大西北3兄弟", "剛滿20歲"] },

  // Jun 7 (Sun) - 4 rounds - 14:00-20:45
  { id: "2026-06-07-R1", round: 5, date: "2026-06-07", dayOfWeek: "星期日", isLivestream: true, timeSlot: "14:00-15:30", teams: ["剛滿20歲", "缺五五番", "大西北3兄弟"] },
  { id: "2026-06-07-R2", round: 6, date: "2026-06-07", dayOfWeek: "星期日", isLivestream: true, timeSlot: "15:45-17:15", teams: ["大西北3兄弟", "剛滿20歲", "缺五五番"] },
  { id: "2026-06-07-R3", round: 7, date: "2026-06-07", dayOfWeek: "星期日", isLivestream: true, timeSlot: "17:30-19:00", teams: ["缺五五番", "大西北3兄弟", "剛滿20歲"] },
  { id: "2026-06-07-R4", round: 8, date: "2026-06-07", dayOfWeek: "星期日", isLivestream: true, timeSlot: "19:15-20:45", teams: ["剛滿20歲", "缺五五番", "大西北3兄弟"] },
]

// Total hanchans in finals: 8 rounds * 3 hanchans = 24
export const TOTAL_FINALS_HANCHANS = 24
