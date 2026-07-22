"use client"

import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { CircuitBg } from "@/components/circuit-bg"

// General rules content
const GENERAL_RULES = [
  "如非註明，翻數表一般以單式計算(B: Bonus計算番數)，每一底為5翻",
  "有拉劈情況，以對和牌家有利情況計算",
  "無搭食糊：x2/3/4 (8/12/16隻百搭)",
  "大/小相公者不可鳴牌，並不能收取有關無搭/花草類/詐糊等額外獎勵",
  "除16隻白雪外，皆可自摸白雪，但不得用白雪作上/碰/槓",
  "有人詐糊時，若有人無搭，詐胡家需承包付無搭賞(不適用於只打8隻百搭)，且若有他家聽牌，將以其和出的最大翻數作賠償(正在被詐糊者拉的玩家自動減半)",
  "有人詐糊時，下一鋪莊家將重新擲骰，由詐糊者承擔所出現的獎罰",
  "叮/即/N子內/河底/海底/雙響/三響不影響雞糊/雞嚦",
  "一發巡內，即使他家上/碰/槓，亦沒有破一發",
  "十六不搭三相逢/雜龍，不要求番子作眼",
  "嚦咕根據有多少對將眼，作翻數計算；小小三風/三元為7隻，小小四喜為9隻",
  "嚦咕同/連順，出現一坎時，不能計算",
  "雞嚦為除了無花或一隻花外，不能計算其他翻數(叮牌或偶然役除外)，允許自摸(但不會數自摸的1翻)",
  "十三么可加計混帶么或四歸一，但不加計混老頭/五門齊或七門齊，必須為門清(不得暗槓)及不準搶暗槓",
  "混帶數字類，如混兩/三個，必須有至少兩/三搭牌為該數字組合(亦即不能為一個順子+其他番子組合)",
  "綠一色包含牌為2/3/4/6/8索或發財",
  "龍鳳呈祥必須為(一清龍+三相逢)",
  "全相逢(全姊妹)必須為3相逢加一組相逢",
  "天聽為到自己摸牌前才作宣示，若閒家在輪到自己天叮前榮和他家，則會默認已作天聽",
  "暗槓有level獎勵：第一組為每人一底，第二組為每人兩底，第三組為每人三底(如此類推)。",
  "天/地/人糊不另計N子內；但天/地糊會另正常數莊(例如莊連一則會數3番莊)",
  "莊家起手若暗槓，則不能地聽，亦不會有機會天糊，但同時出銃不會計作地糊",
  "所有天/地聽不會受到他家的鳴牌影響",
  "雙食嚦咕除了「底」外，按普通型及嚦咕型分別各計算一次翻數後再作相加",
  "雞糊類不作高點法，已包花，其他另計。鴨糊類近，已包花及自摸，其他類近",
  "叮牌後除了和牌外，只能隨摸打(除非飛牌自摸)，且不得故意翻閱牌山。另外，除非得到其他玩家同意，否則不建議觀看他家手牌",
  "N子內定義為，包含第N子，只計公海牌及和了牌",
  "三色五步高必須跟從ABCAB的順序",
  "自己手牌中同一款真章最多只可有4張(禁止五歸)；但他家的牌河及手牌不涉及考慮範圍(無斷牌)",
  "不能打出百搭(除非已叮了牌但正處於過水狀態)",
  "當摸一隻花並同時完成一台花及一台草，可收兩者的獎勵(總計3底)",
  "摸到第7/8隻花時，可立即收取30/60翻(即使沒有尾牌可補)。若選擇不收取，則續行，花上自摸則會加計30/60翻",
  "若摸第7隻花時剛好達成一台花、一台草及7隻花的條件，則先收取一台花及一台草的獎勵，然後在摸尾牌前宣言是否續行牌局；不續行的話則收取7隻花的獎勵",
  "所有收取一台花、一台草、7隻或8隻花的情況，必須有尾牌可摸(構成17隻牌的情況)",
  "數番一般情況下皆以高點法計算：如手牌內有 789萬 789 索 56789筒 東東 食出7 筒 因形狀上只能選擇以 56 或 89 筒食出，故選擇以56筒食出計番數暗三相逢",
  "數番一般情況下皆以單式計算 (雞糊除外)：單式定義為如數字組合相同需數兩次同一役種 需多於一半的面子組合並不與另一次的面子組合重疊",
]

const SCORING_EXAMPLES = [
  { example: "456 筒 456456索 只可計一次相逢" },
  { example: "456456 筒 456456索 則可計兩次相逢 (及四同順)" },
  { example: "123123萬 456 筒 789 索 只可計一次雜龍" },
  { example: "123123萬 456456筒 789索 則可計兩次雜龍" },
  { example: "123萬234筒345索456萬567筒 則視為三次三色三步高(另計三色五步高的Bonus 番數)" },
  { example: "111萬222筒333索444萬 可計兩次大三色連刻 (因為數字組合相同)" },
]

export default function InformationPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <CircuitBg />
      <div className="scanlines" />

      {/* Header */}
      <header className="relative z-10 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO HOME</span>
          </Link>
          <h1 className="font-display text-lg font-bold tracking-wider text-primary">
            INFORMATION
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Tournament Overview */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            <span>{"雲龍盃 SEASON 0"}</span>
          </h2>
          <div className="bg-card border border-border rounded-sm p-6 space-y-4">
            <p className="text-foreground/80 leading-relaxed">
              {"雲龍盃（Cloud Dragon Cup）是台灣麻雀聯賽的首屆賽事，匯聚四支頂尖隊伍，以團隊形式展開六輪激烈對戰。本賽事規則引用 HKPM TWMJ GCoC。"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">4</div>
                <div className="text-xs font-mono text-muted-foreground">TEAMS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">6</div>
                <div className="text-xs font-mono text-muted-foreground">ROUNDS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">3</div>
                <div className="text-xs font-mono text-muted-foreground">PLAYERS/TEAM</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-display font-bold text-primary">19:00</div>
                <div className="text-xs font-mono text-muted-foreground">START TIME</div>
              </div>
            </div>
          </div>
        </section>

        {/* Scoring Method Link */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            <span>{"計分方法 // SCORING METHOD"}</span>
          </h2>
          <a
            href="https://docs.google.com/spreadsheets/d/1XT-zK6NGUChhXMd-jDI9zDHrLNgE4tgKVsxqlZH3CwY/edit?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-card border border-border hover:border-primary/50 rounded-sm p-6 transition-colors group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {"翻數表 // Fan Table"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {"查看完整計分表（Google Sheets）"}
                </p>
              </div>
              <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </a>
        </section>

        {/* General Rules */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            <span>{"一般規則 // GENERAL RULES"}</span>
          </h2>
          <div className="bg-card border border-border rounded-sm p-6">
            <ol className="space-y-4">
              {GENERAL_RULES.map((rule, index) => (
                <li key={index} className="flex gap-4">
                  <span className="shrink-0 w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-mono text-sm font-bold rounded-sm">
                    {index + 1}
                  </span>
                  <p className="text-foreground/80 leading-relaxed pt-1">{rule}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Scoring Examples */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            <span>{"計分例子 // SCORING EXAMPLES"}</span>
          </h2>
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-muted-foreground text-sm mb-4 font-mono">
              {"// 以下為單式計算的例子："}
            </p>
            <ul className="space-y-3">
              {SCORING_EXAMPLES.map((item, index) => (
                <li key={index} className="flex gap-3 items-start">
                  <span className="text-primary font-mono text-sm">{"36-" + (index + 1) + "."}</span>
                  <p className="text-foreground/80">{item.example}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTD Info */}
        <section>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary" />
            <span>{"賽事總監 // CTD"}</span>
          </h2>
          <div className="bg-card border border-border rounded-sm p-6">
            <p className="text-foreground/80">
              {"劉因延先生"}
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
