export interface Player {
  name: string
  intro: string
  photoUrl: string
}

export interface TeamData {
  id: string
  chineseName: string
  englishName: string
  teamIntro: string
  supervisor: {
    name: string
    intro: string
  }
  players: Player[]
  logo: string
  teamPhoto?: string
}

// Team name to route mapping for navigation
const teamRouteMap: Record<string, string> = {
  "天月麻雀": "/teams/amatsuki",
  "狂戰士": "/teams/berserker",
  "壞拍子": "/teams/badbeat",
  "Bad Beat": "/teams/badbeat",
  "牌道": "/teams/paidao",
  "易和團": "/teams/eronmust",
  "愚形上等": "/teams/guxing",
  "錦鯉咪好勁": "/teams/nishikigoi",
  "御無礼": "/teams/gobure",
}

export function getTeamRoute(teamName: string): string {
  return teamRouteMap[teamName] || "/"
}

export const teamsData: Record<string, TeamData> = {
  paidao: {
    id: "paidao",
    chineseName: "牌道",
    englishName: "",
    teamIntro: "每個人都在學習麻雀的道路上。希望隊員都可以一起成長！",
    supervisor: {
      name: "魔女",
      intro: "麻雀系Vtuber, 每一天都要破來自觀眾四位的咀咒",
    },
    players: [
      {
        name: "魔女",
        intro: "麻雀系Vtuber, 每一天都要破來自觀眾四位的咀咒",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/25-dULaT0McwlJzf7gsFjbi8i6WxL4SLq.png",
      },
      {
        name: "Happy",
        intro: "傾向科學流的女雀士，日麻雀齡3年，森麻魔女盃冠軍、天鳳5段。牌風傾向進攻，喜歡兜牌，最喜歡嶺上開花與槓出新寶牌。偶然會加點「靈感」，為求令對局更為精彩。希望在此比賽中，能領略到自己未知的部分與細節，並享受高強度兼公平公正的對局。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/26-8pgYk5wkb4JUB2mnQVI5V4SH8jIBo2.png",
      },
      {
        name: "Billy",
        intro: "科學派雀士, 堅信過程比結果更重要, 牌風偏向進攻, 最爱手役為立斷平。日麻牌齡兩年, 在日麻圈也算是較年輕的選手了, 因Saki而接觸到日麻, 被充滿變化性的日麻深深吸引, 其後透過不同途徑鑽研日麻, 尋求進步, 未來亦有考Pro的打算, 希望能和大家一起享受日麻的樂趣, 共創更好的日麻環境。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/27-QEuItisXQue8B3eItBav4Pd0iqLr74.png",
      },
      {
        name: "Steven",
        intro: "紫荊盃 A2 選手，天鳳四麻5段，副露平衡型，與內川幸太郎同一天生日。閒時會看 M league 等日麻賽事觀摩不同雀士的打法，以及魔女日麻直播學習，期望在本聯賽與隊友及選手們一起在牌道上前行。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/28-UxgZPcRMNf79KpiKy22entyuBeKS79.png",
      },
    ],
    logo: "/images/paidao-logo.png",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-YHFkccpq232ToEylbw6IGShSoL96RD.png",
  },
  guxing: {
    id: "guxing",
    chineseName: "愚形上等",
    englishName: "",
    teamIntro: "麻將本來就是棟起手牌，想點打就點打。但一上到直播、幾十雙眼睛盯住，好多人就會被「正確」綁住——驚打錯、驚蝕章、驚出統，轉而計牌效、諗何切，千方百計係隨機與混亂裡搵到一套秩序。我地不執着科學，亦不迷信玄學，只信手感與直覺。靈感到咗，生章都敢衝，見逃唔緊要，大肚都照立直棟起手牌，我哋想點打就點打。麻將，就係咁簡單。",
    supervisor: {
      name: "田仔",
      intro: "為隊伍比賽經驗較多的一位，能為隊員提出較多意見及改善點，亦是本隊伍選手之一。",
    },
    players: [
      {
        name: "田寶寶",
        intro: "超攻擊高打點型選手，手役派選手，喜愛三色同順及染手。愚型八索上等。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/29-KeDiKHEH3QWeGIsZ6qludRCD24Sj26.png",
      },
      {
        name: "Shirley",
        intro: "直播對局及隊制賽經驗尚淺，期望與隊友共同戰鬥，享受日麻的樂趣。喜歡副露斷么和役牌。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/31-5VG77Bg4MUyCBgTgZtpEADnCr9JEER.png",
      },
      {
        name: "浩賢",
        intro: "曾經初出茅廬就係某啲隊制賽嘅日麻比賽中瘋狂倒米，輸到腰痛。但練就心態上嘅心態上可嘅韌性，新一年同新伙伴用百分百感覺打拼。無特別喜愛伇種，然而獨愛立直叫對碰。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/30-P6Hl93GHcIxdHRdO5CsDdsWLwqdsCW.png",
      },
      {
        name: "Jams",
        intro: "初來乍到的初心者，經常俾人問can you play better，日後大家見到我惡手，請大聲講出嚟，教我做啲野。最不喜歡的役種是斷么九，每次數番都會唔記得數。場上有靚女會唔記得食糊。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/32-u5SYIApLihH1WEl6nyLXxLIl8VJCrG.png",
      },
    ],
    logo: "/images/guxing-logo.jpeg",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-S6HNEJ9BoCb6kdpq8NkqvZHz7V7xNZ.png",
  },
  eronmust: {
    id: "eronmust",
    chineseName: "易和團",
    englishName: "E-Ron Must",
    teamIntro: "「那你願意…一輩子和我一起組易和團嗎？」持續一輩子是很困難的，但如果能累積一個又一個的半莊，也許就能變成一輩子……現在正是易和團復權的時刻！",
    supervisor: {
      name: "Rex",
      intro: "實麻半莊多過網麻，最鍾意一通\n希望用最高嘅惡手率攞最多嘅top",
    },
    players: [
      {
        name: "Rex",
        intro: "實麻半莊多過網麻，最鍾意一通\n希望用最高嘅惡手率攞最多嘅top",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/21-46M67rKZuqshLdKNunexIalBorV5y2.png",
      },
      {
        name: "鴨哥",
        intro: "偏進攻型打法，唔信推一組筋就死，希望解鎖直播比賽食役滿嘅成就",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/22-fRLUKYf27pMbtW4y9mYFYWcxxMRJoT.png",
      },
      {
        name: "Leo",
        intro: "隊內最弱最黑成員7筒絕好型\n身為一個反口師\n最鍾意反口",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/23-xq078O9LznXuJli38Cs01of62Makys.png",
      },
      {
        name: "風",
        intro: "來自上世紀的恐龍系雀士，隊內最年長選手，希望能在立直無雙聯賽展示自己的牌風",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/24-6abRWabWhPCTrt3EN4Nbxy3NTC4kUw.png",
      },
    ],
    logo: "/images/eron-logo.png",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-scm56QlraOLSiCFcX84i7bj62uShoK.png",
  },
  badbeat: {
    id: "badbeat",
    chineseName: "壞拍子",
    englishName: "Bad Beat",
    teamIntro: "爆冷門（Bad Beat）​​ 指本來勝率較低的玩家，意外擊敗原本贏面較高的對手。 「被爆冷門」是日麻界極常見的挫折，但建議別過度抱怨，保持好心情才是王道。",
    supervisor: {
      name: "Ruby",
      intro: "我係BB裝飾物熱愛立直一發摸先切利攻兼利守麻雀之奧無窮盡",
    },
    players: [
      {
        name: "PC",
        intro: "開局平和等立直\n一心門清斷么九\n攻守過半三色成\n收緊手膝護赤五\n國士無雙襪襪食",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/13-mAlORsad43DOsTdiZX4BS3L8GqVz5x.png",
      },
      {
        name: "Ben",
        intro: "斷么至上，三飜萬歲，銃率極高的防守型失敗者",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/14-z0GVl2D5ZytsO3b2NdWQYQ0oJsV8fW.png",
      },
      {
        name: "倉鼠",
        intro: "接觸日麻斷斷續續有四年左右，一直在努力學習科學的麻將打法，最近也開始摸索讀牌的技巧。最喜歡的役種是三色同順，希望能把握這次比賽的機會，多向大家學習，請各位多多指教。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/16-xdcAkQIeuvmIBy4KjFD85r64rzsqc5.png",
      },
      {
        name: "Hugh",
        intro: "希望唔好俾人badbeat咁多",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/15-0dz1qK6kLdKU3scmYGLCFz1YoE9Bj2.png",
      },
    ],
    logo: "/images/4bb.png",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-SHxlnlbGmsDgHC2GT8IzNN8vFmwtJw.png",
  },
  nishikigoi: {
    id: "nishikigoi",
    chineseName: "錦鯉咪好勁",
    englishName: "Nishikigoi",
    teamIntro: "由5位傾偈十段嘅牌桌泥工組成，以SAM YIP為中心嘅隊伍準備靠監督嘅燈力輕鬆躺贏",
    supervisor: {
      name: "Sam yip",
      intro: "Johnny said: know is know, no know is no know",
    },
    players: [
      {
        name: "Kelly",
        intro: "「我係(森麻)龍運王嚟㗎嘛，我點會輸？」\n\n打法偏進攻，但保留彈出彈入嘅權利\n冇能力走科學麻雀嘅道路，唯有令打科學麻雀嘅人無路可走\n邊個想嚟挑戰森麻最多冠軍Title嘅人？",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/9.png-SMhWzigmUMVm4vw189MFvZbLH0NCRG.jpeg",
      },
      {
        name: "Ian",
        intro: "比上不足的業餘鳳凰桌玩家。酷愛引筋單騎立直。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/11-AChIyq2cbKGuCVPYW9nkwRR5Ww2cUS.png",
      },
      {
        name: "Zlatan",
        intro: "雞打之王，aka 高目你支棍。\n打牌主打一個亂字，越睇唔明越好。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/12-tNpZEC2yFp2YLpPE0kxE24Rq3prpME.png",
      },
      {
        name: "Sunny Sir",
        intro: "唔好同我講呢啲，我唔信嘅",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/10-YEX2FL6HzQ2v02rGCvGYMdaQRnHmM7.png",
      },
    ],
    logo: "/images/koi-logo.jpeg",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/31-zVhmMUtZ2D1IchlgPq21vLqk0XlYHT.png",
  },
  berserker: {
    id: "berserker",
    chineseName: "狂戰士",
    englishName: "BGT Berserker",
    teamIntro: "狂戰士由多位熱愛立直麻雀的選手組成。我們在追求勝利的同時，更追求極致的競技藝術，務求打出觀賞性與水平兼具的比賽。「以絕對的進攻，席捲整個賽場！」",
    supervisor: {
      name: "查理",
      intro: "紫荊盃A1聯賽選手，2024年度IORMC (國際線上立直麻雀賽)及APRC (亞太盃)香港代表。日麻界摩連奴，以激烈進攻的風格和渴求勝利的心態，令大家感受日本麻雀的樂趣。",
    },
    players: [
      {
        name: "Anson",
        intro: "紫荊盃A2聯賽選手，打點側重的重炮型選手。「輸幾多唔重要，追得番就冇所謂」你敢和我的立直對攻嗎？",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/19-z7EHbM8ky14q0x33lU4DyJaWS50js4.png",
      },
      {
        name: "Alan",
        intro: "一切都没所謂了... 反正我不過是條韭菜罷了 ~~",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/18-VXIGRz4ro3T4jlltOZl4SIYlW8nva5.png",
      },
      {
        name: "Hei Hei",
        intro: "小弟日麻資歷尚淺 非常開心同有幸喺呢度打團體賽。\n\n希望以下剋上戰勝各隊強豪 打牌風格係平衡型兼且重視打點。\n\nP.S. : 18碎就升上鳳桌 2025森麻最強戰冠軍",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/17-W0aPyKbSUBWGiD3RKmE8DpI0TVRdUg.png",
      },
      {
        name: "Kolf",
        intro: "科大麻雀研究社初代社長，在香港及海外的各項賽事均取得不俗的成績（深圳麻雀月賽兩次冠軍、日本東京APRC十六強）。牌風一直以穩健著稱，本次化身狂戰士，因為只有狂戰，方可一勝！",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20-NkGCQAZtR5kaVjrwxBUPh26FvQKSen.png",
      },
    ],
    logo: "/images/berserker-logo.png",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/42-r3cFLsECK8ksXQDdKFipEA4dig8VE4.png",
  },
  amatsuki: {
    id: "amatsuki",
    chineseName: "天月麻雀",
    englishName: "Amatsuki Mahjong",
    teamIntro: "天月兇萌戰隊閃亮登場！重磅來襲日麻直播賽！不只和了，我們要月蝕你的防線！誰能逃脫天月魅惑？",
    supervisor: {
      name: "Angus",
      intro: "BadBeat元老人馬，科學派但冇運，想教隊員打好牌效，但一出聲就裏目，被打臉。唔求贏，只求隊員唔好小相公。",
    },
    players: [
      {
        name: "Krystal",
        intro: "奶茶系Player,「奶茶補運」流，飲咗奶茶勝率會大幅度提升～中意做大牌，唔搏一鋪，點知天唔會跌餡餅？目標係令對手記住我嘅名，就算只記得我放嘅大銃都ok架。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/5-5r9WC5xOvKPJDBUAw1ciBIdCwuLUvA.png",
      },
      {
        name: "Katherine",
        intro: "中一開始玩廣東麻雀，之後都有陪屋企人玩各類型嘅麻雀，日本麻雀係新手，啱啱接觸冇一個月，希望大家多多指教。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6-OJKCXU5PIpilDyyM054OXe40Yi1GsT.png",
      },
      {
        name: "Friend",
        intro: "享受日麻嘅路人玩家，忠誠於打牌係開心,接受所有打牌嘅風格 ;)\n會有奇怪嘅思考回路，希望大家唔好介意>x<\n歡迎大家分享唔同意見~",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/8-cx6Uz0CwqUCpHqJtPr5NMxEFMsGnl8.png",
      },
      {
        name: "Kenneth",
        intro: "小時候就看父親玩SFC麻雀啟蒙，天鳳09年入坑，12年初上鳳凰桌。近年多款AI出現帶來新氣象，開始花更多功夫鑽研學問。喜歡研究何切問題，信奉會有相對正確的打法。",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/7.png-W2PIxUHGMu4mHYBjZla2q9QtTy9Vjx.jpeg",
      },
    ],
    logo: "/images/amatsuki-logo.png",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/23-6f83b7LJZbYkMaL5HSkSBCInA7dsIV.png",
  },
  gobure: {
    id: "gobure",
    chineseName: "御無礼",
    englishName: "GoBuRe",
    teamIntro: "「御無礼隊，科學計算與強運並行，智慧與膽識交織，麻將桌上無懼挑戰！」",
    supervisor: {
      name: "Sun Koo",
      intro: "第0屆龍運王龍運包C , 不是能c , 是包c , 麻煩對面多針對 , 謝謝",
    },
    players: [
      {
        name: "Sun Koo",
        intro: "第0屆龍運王龍運包C , 不是能c , 是包c , 麻煩對面多針對 , 謝謝",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/1-DIq1s2MNCiff6YoMMhuKDuOP7cxaNp.png",
      },
      {
        name: "Kaiser",
        intro: "中英數唔合格段位合格\n被麻雀耽誤嘅工程十段",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2-Ceh1GzzqODPeJDyq0jAuDLH4Ga1J8B.png",
      },
      {
        name: "Louis",
        intro: "喜愛牌型全中全帶五三色三同順\n日麻功力不濟於是轉生成為裁縫十段",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-oAIvS4aTLvdZOwB6XL9gsSM5QBT4uG.png",
      },
      {
        name: "Charles",
        intro: "REST選手\n同萬子唔係好熟",
        photoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/3-0BeC2Et7WdSNnYrKo3Mmp3Ah1MRg0Z.png",
      },
    ],
    logo: "/images/gobure-logo.jpeg",
    teamPhoto: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/4-3vCiOWw9dOukhIH2aU33xhV1ZG0DJC.png",
  },
}
