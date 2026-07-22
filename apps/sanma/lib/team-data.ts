export interface TeamPlayer {
  name: string
  role?: string
  photo?: string
  stats?: PlayerStats
}

export interface PlayerStats {
  games: number // 半莊數
  firstPlace: number // 1位
  secondPlace: number // 2位
  thirdPlace: number // 3位
  totalPoints: number // 枚數
  highestSingleRound: number // 單輪最高枚數
  yakumanCount: number // 役滿數
}

export interface Team {
  id: number
  name: string
  color: string
  logo?: string
  teamPhoto?: string
  players: TeamPlayer[]
}

const defaultStats: PlayerStats = {
  games: 0,
  firstPlace: 0,
  secondPlace: 0,
  thirdPlace: 0,
  totalPoints: 0,
  highestSingleRound: 0,
  yakumanCount: 0,
}

export const teams: Team[] = [
  {
    id: 1,
    name: "bgt狂戰士",
    color: "#DC143C",
    logo: "/images/bgt.png",
    teamPhoto: "/images/14.jpg",
    players: [
      { name: "查理", role: "隊長", photo: "/images/players/charley.png", stats: { ...defaultStats } },
      { name: "Jeff", photo: "/images/players/jeff.png", stats: { ...defaultStats } },
      { name: "Anson", photo: "/images/players/anson.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 2,
    name: "麻雀學園",
    color: "#F79AC0",
    logo: "/images/e9-ba-bb-e9-9b-80-e5-ad-b8-e5-9c-92.png",
    teamPhoto: "/images/13.jpg",
    players: [
      { name: "園長", role: "隊長", photo: "/images/players/yuanzhang.png", stats: { ...defaultStats } },
      { name: "Cleo", photo: "/images/players/cleo.png", stats: { ...defaultStats } },
      { name: "阿瑞C", photo: "/images/players/aruic.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 3,
    name: "老友鬼鬼",
    color: "#f7f7f7",
    logo: "/images/e8-80-81-e5-8f-8b-e9-ac-bc-e9-ac-bc.png",
    teamPhoto: "/images/7.jpg",
    players: [
      { name: "Eris", role: "隊長", photo: "/images/players/eris.png", stats: { ...defaultStats } },
      { name: "Victor Ho", photo: "/images/players/victor-ho.png", stats: { ...defaultStats } },
      { name: "Charles", photo: "/images/players/charles-lau.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 4,
    name: "邪魔外道",
    color: "#ffe88a",
    logo: "/images/e9-82-aa-e9-ad-94-e5-a4-96-e9-81-93.png",
    teamPhoto: "/images/5.jpg",
    players: [
      { name: "邪魔肥仔", role: "隊長", photo: "/images/players/evil-fatty.png", stats: { ...defaultStats } },
      { name: "VLT", photo: "/images/players/vlt.png", stats: { ...defaultStats } },
      { name: "大魔", photo: "/images/players/daemo.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 5,
    name: "無敵推土機",
    color: "#84C1FF",
    logo: "/images/e7-84-a1-e6-95-b5-e6-8e-a8-e5-9c-9f-e6-a9-9f.png",
    teamPhoto: "/images/15.jpg",
    players: [
      { name: "Abbey", role: "隊長", photo: "/images/players/abbey.png", stats: { ...defaultStats } },
      { name: "Billy", photo: "/images/players/billy.png", stats: { ...defaultStats } },
      { name: "天狼", photo: "/images/players/wolf.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 6,
    name: "藍玫BlueRose",
    color: "#1447ff",
    logo: "/images/e8-97-8d-e7-8e-abbluerose.png",
    teamPhoto: "/images/4.jpg",
    players: [
      { name: "zQ", role: "隊長", photo: "/images/players/zq.png", stats: { ...defaultStats } },
      { name: "Jams", photo: "/images/players/jams.png", stats: { ...defaultStats } },
      { name: "Shu", photo: "/images/players/shu.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 7,
    name: "剛滿20歲",
    color: "#dbd0fe",
    logo: "/images/e5-89-9b-e6-bb-bf20-e6-ad-b2.png",
    teamPhoto: "/images/3.jpg",
    players: [
      { name: "YAMABOII", role: "隊長", photo: "/images/players/yamaboii.png", stats: { ...defaultStats } },
      { name: "小鳥ian", photo: "/images/players/birdian.png", stats: { ...defaultStats } },
      { name: "警號", photo: "/images/players/jinghao.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 8,
    name: "家有一寶",
    color: "#ffb3ff",
    logo: "/images/e5-ae-b6-e6-9c-89-e4-b8-80-e5-af-b6.png",
    teamPhoto: "/images/1.jpg",
    players: [
      { name: "Lomo", role: "隊長", photo: "/images/players/lomo.png", stats: { ...defaultStats } },
      { name: "寶寶", photo: "/images/players/baobao.png", stats: { ...defaultStats } },
      { name: "Gor Gor", photo: "/images/players/gorgor.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 9,
    name: "牌效工房",
    color: "#E32227",
    logo: "/images/e7-89-8c-e6-95-88-e5-b7-a5-e6-88-bf.png",
    teamPhoto: "/images/6.png",
    players: [
      { name: "Krystal", role: "隊長", photo: "/images/players/krystal.png", stats: { ...defaultStats } },
      { name: "浩賢", photo: "/images/players/haoxian.png", stats: { ...defaultStats } },
      { name: "SiuHong", photo: "/images/players/siuhong.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 10,
    name: "魔法葉",
    color: "#0ac482",
    logo: "/images/e9-ad-94-e6-b3-95-e8-91-89.png",
    teamPhoto: "/images/9.jpg",
    players: [
      { name: "Tyrus", role: "隊長", photo: "/images/players/tyrus.png", stats: { ...defaultStats } },
      { name: "Sunny", photo: "/images/players/sunny.png", stats: { ...defaultStats } },
      { name: "Lyun", photo: "/images/players/lyun.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 11,
    name: "吸金魔術師",
    color: "#1A0E5A",
    logo: "/images/e5-90-b8-e9-87-91-e9-ad-94-e8-a1-93-e5-b8-ab.png",
    teamPhoto: "/images/8.jpg",
    players: [
      { name: "Tin仔", role: "隊長", photo: "/images/players/tinjai.png", stats: { ...defaultStats } },
      { name: "Marco", photo: "/images/players/marco.png", stats: { ...defaultStats } },
      { name: "Sy", photo: "/images/players/sy.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 12,
    name: "大西北3兄弟",
    color: "#ff30e4",
    logo: "/images/e5-a4-a7-e8-a5-bf-e5-8c-97-e4-b8-89-e5-85-84-e5-bc-9f.jpeg",
    teamPhoto: "/images/10.jpg",
    players: [
      { name: "鴨哥", role: "隊長", photo: "/images/players/duckbro.png", stats: { ...defaultStats } },
      { name: "Rex", photo: "/images/players/rex.png", stats: { ...defaultStats } },
      { name: "Leo", photo: "/images/players/leo.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 13,
    name: "三孃鉸剪",
    color: "#FBD9D9",
    logo: "/images/e4-b8-89-e5-a8-98-e9-89-b8-e5-89-aa.png",
    teamPhoto: "/images/11.jpg",
    players: [
      { name: "剪你孃Kelly", role: "隊長", photo: "/images/players/kelly.png", stats: { ...defaultStats } },
      { name: "剪你孃神犬", photo: "/images/players/goddess.png", stats: { ...defaultStats } },
      { name: "剪你孃Ruby", photo: "/images/players/ruby.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 14,
    name: "缺五五番",
    color: "#9B95C9",
    logo: "/images/e7-bc-ba-e4-ba-94-e4-ba-94-e7-95-aa.jpeg",
    teamPhoto: "/images/12.jpg",
    players: [
      { name: "ls2", role: "隊長", photo: "/images/players/ls2.png", stats: { ...defaultStats } },
      { name: "kelvin", photo: "/images/players/kelvin.png", stats: { ...defaultStats } },
      { name: "desmond", photo: "/images/players/desmond.png", stats: { ...defaultStats } },
    ],
  },
  {
    id: 15,
    name: "卡比瘦",
    color: "#04797f",
    logo: "/images/e5-8d-a1-e6-af-94-e7-98-a6.png",
    teamPhoto: "/images/2.jpg",
    players: [
      { name: "卡比", role: "隊長", photo: "/images/players/kirby.png", stats: { ...defaultStats } },
      { name: "狐狸", photo: "/images/players/fox.png", stats: { ...defaultStats } },
      { name: "星之", photo: "/images/players/star.png", stats: { ...defaultStats } },
    ],
  },
]

export function getTeamById(id: number): Team | undefined {
  return teams.find((team) => team.id === id)
}

export function getTeamByName(name: string): Team | undefined {
  return teams.find((team) => team.name === name)
}
