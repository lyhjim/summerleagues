import { FileText, AlertCircle } from "lucide-react"

export function CompetitionRules() {
  return (
    <section id="rules" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold mb-4 text-balance">比賽規則</h2>
          <p className="text-lg text-muted-foreground">香港立直無雙聯賽特別比賽條例</p>
          <p className="text-sm text-muted-foreground mt-2">修訂日期：2026 年 1 月 14 日</p>
        </div>

        <div className="p-8 bg-card/50 backdrop-blur border-2 border-primary/20 rounded-lg mb-8">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="size-6 text-primary shrink-0 mt-1" />
            <p className="text-muted-foreground">本規則以M-League 為藍本，但詳細罰則未必與M-League相同，請細心查閲。</p>
          </div>
        </div>

        {/* 摘要 */}
        <div className="p-8 bg-card/50 backdrop-blur border-2 border-primary/20 rounded-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="size-8 text-primary" />
            <h3 className="text-2xl font-bold">摘要</h3>
          </div>
          <div className="space-y-3 text-muted-foreground">
            <p>遵循現代競技立直麻將規則，並包含以下主要規則重點：</p>
            <ul className="space-y-2 list-disc list-inside ml-4">
              <li>每位玩家起始分數為 25,000 點，返點 30,000 點。</li>
              <li>順位馬點 +50P / +10P / -10P / - 30P。</li>
              <li>若兩位或更多玩家的分數相同，他們將平分對應的馬點總分。</li>
              <li>在非門清的手牌，斷幺九番數不減。</li>
              <li>禁止吃牌後立即打出可與用作鳴牌的兩隻牌組成一組的牌，但前一巡已打出的牌則不予考慮。</li>
              <li>使用寶牌、裡寶牌、槓寶牌和槓後裡寶牌。在任何槓的情況下，都立刻翻開下一隻槓寶牌。</li>
              <li>使用 5筒，5索，5萬 各一枚赤寶牌。</li>
              <li>
                若莊家和了，或若無人和牌但莊家聽牌，莊家繼續連莊，連莊數量無上限，沒有二番縛，八連莊不是役滿，每次流局或連莊後，下局和牌的分數獎勵共
                300 點。
              </li>
              <li>允許無役流局報聽牌，如在聽的每一枚牌皆在自己的手牌或鳴牌區中，則不能報聽。</li>
              <li>若流局，未聽牌的玩家將平分支付 3,000 點，並由聽牌的玩家平分該 3,000 點。</li>
              <li>在南四局結束但滿足連莊條件時，即使莊家處於第一名，遊戲仍將繼續進行。</li>
              <li>
                頭跳：僅允許一名玩家和牌；若多名玩家同時宣告和了，則由距離放銃者最近的玩家有和了優先權，此玩家會得到埸上的所有供託。
              </li>
              <li>宣告優先權：和牌宣告優先於其他吃碰槓的優先權，即使發聲有稍微延誤。</li>
              <li>無累計役滿：若和牌達到 11 番或以上，但手牌並沒有任何價值為役滿的役種，此時得分為三倍滿。</li>
              <li>無雙倍役滿：單個役種的最大番數為單役滿。</li>
              <li>多重役滿：若一手牌符合多個不同役滿條件，則所有符合的役滿均計分。</li>
              <li>責任支付：適用於大三元、大四喜和四槓子。(見詳細規則)</li>
              <li>滿貫上調： 4 番 30 符、3 番 60 符及以上的得分均計為滿貫。</li>
              <li>無流局滿貫。</li>
              <li>無人和。</li>
              <li>綠一色：不要求手牌中必須包含發。</li>
              <li>國士無雙：禁止通過搶暗槓完成該役，十三面待無特別加番。</li>
              <li>九蓮寶燈：適用於筒，索及萬的清一色，非純正亦計為役滿。</li>
              <li>連風對子：共計 2 符。</li>
              <li>嶺上自摸：除自摸和的 2 符外，不會額外加計 2 符</li>
              <li>
                立直後的暗槓
                ：若暗槓會改變聽牌的結構，番數，待牌種類或待牌枚數中的其中一項，則禁止暗槓。暗槓必須包含即巡摸到的牌。
              </li>
              <li>立直條件：只要牌山中有一隻或以上的牌，玩家都可立直。</li>
              <li>立直棒：在半莊結束時，桌上的立直棒將由當時點數最高的玩家收回。</li>
              <li>無任何途中流局</li>
              <li>最多允許所有玩家共計 4 次槓，遊戲會繼續進行，不會流局而中止。</li>
              <li>沒有負點結束：如其中一位玩家分數為負，半莊繼續。如果玩家分數低於 1,000 點仍然可以立直。</li>
              <li>無西風圈：在所有情況下，遊戲在南風圈結束後結束。</li>
              <li>無烤雞罰點。</li>
              <li>沒有時間限制</li>
            </ul>
          </div>
        </div>

        {/* 行牌 */}
        <div className="p-8 bg-card/50 backdrop-blur border-2 border-primary/20 rounded-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">行牌</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">2.1 棄牌</h4>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  當牌被主動放置在玩家手牌前方位置且非背面朝上時，無論是否能清楚看見該牌是何牌，該牌即被視為「捨牌」。此時，捨牌者不能再將該牌取回。此規則不適用於因意外撞倒的牌。如果發生爭議，距離捨牌區較近的牌會被視為捨牌。在下一位玩家摸牌之前，上一枚捨牌仍可鳴牌或和了。一旦下一位玩家觸碰牌牆後，所有玩家皆不能鳴牌或和了。玩家只能在自己的回合中宣告加槓、暗槓、立直或自摸和。
                </p>
                <p>
                  無論對局是否設有時間限制，玩家必須保持合理的出牌節奏。若玩家摸牌速度過快，導致其他玩家無法及時宣告吃、碰、槓或和了，或是反覆拖延時間，可能會因為擾亂牌局而被TD判罰。
                </p>
                <p>
                  如果某玩家摸牌速度過快，而其他玩家此時已宣告吃、碰、槓或胡牌，則該宣告仍然有效，並且摸出的牌應放回牌牆。TD定義一位玩家摸牌速度是否過快將依包括但不限於以下的依據作裁決：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>比較該玩家其他巡目的摸牌速度</li>
                  <li>上家的棄牌是否已清楚展示給所有玩家</li>
                  <li>下一隻牌的牌牆與玩家的距離</li>
                </ul>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">2.2 鳴牌</h4>
              <div className="space-y-3 text-muted-foreground">
                <p>鳴牌優先順序為：自摸 &gt; 榮和 &gt; 第一位宣告者 &gt; 刻子/槓子 &gt; 順子。</p>
                <p>在一位或多位玩家同時宣告吃、碰或槓同一張牌的情況下：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>如果宣告的時間明顯有先後順序，則第一位宣告者優先。</li>
                  <li>如果兩次宣告幾乎同時發生，則碰或槓的宣告優先於吃的宣告。</li>
                  <li>如果無法確定宣告是否同時發生，則一律視為同時發生。</li>
                  <li>一位玩家只能針對一張捨牌作一次宣告，不能作更改。</li>
                  <li>如果在沒有宣告的情況下直接亮出搭子，此情況則視為未作任何宣告。</li>
                  <li>如果在未作鳴牌宣告的情況下作鳴牌行為，則會因為擾亂牌局而被TD判罰。</li>
                </ul>
                <p>
                  如果某位玩家因為無法看到捨出的牌而未能及時宣告，從而引起爭議，應立即呼叫TD。TD會參考包括但不限於以下的依據作裁決：
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>捨牌者是否刻意或無意作遮擋捨牌的行為</li>
                  <li>各鳴牌者對應捨牌者的坐席</li>
                  <li>宣告延誤的時間長度</li>
                </ul>
                <p>
                  如果有兩位或三位玩家同時宣告榮和，則按照輪次順序，輪次距離捨牌者最近的宣告者獲勝。宣告的速度此時不影響判定，但如果在其中一人的整副和了手牌已經清楚展示給其他玩家觀看，此刻後的和了宣告則不作計算。
                </p>
                <p>
                  如果有多於一位玩家同時宣告榮和，而其中的一人或多人為錯和，則先按上述規則正常處理和了者的分數交收，再呼叫TD對錯和作判罰。
                </p>
                <p>牌局的最後一枚捨牌不能作任何和了之外的鳴牌。</p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">2.3 立直</h4>
              <div className="space-y-3 text-muted-foreground">
                <p>玩家若持有正在聽牌的門清手牌，可在自己的回合宣告立直。宣告立直時，玩家必須順序：</p>
                <ol className="list-decimal list-inside ml-4 space-y-1">
                  <li>先清楚地說出「立直」</li>
                  <li>以橫置方式捨出一張牌</li>
                  <li>確定沒有其他玩家作和了宣言後，將一根1,000點的計分棒放置在自己的立直供托區域</li>
                </ol>
                <p>
                  任何不是按此順序的立直宣言皆視為犯規。為防引起混亂，立直者的下一位玩家請等待立直者完成以上三點動作後再摸牌。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>玩家在1000點以下可以立直。</li>
                  <li>振聽中的玩家可以立直。</li>
                  <li>只要牌山中還有牌，玩家都可以立直。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 有關一局完結 */}
        <div className="p-8 bg-card/50 backdrop-blur border-2 border-primary/20 rounded-lg mb-8">
          <h3 className="text-2xl font-bold mb-6">有關一局完結</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">3.1 流局</h4>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  如果在最後一張牌捨出後仍然無人胡牌，該局則以荒牌流局結束。玩家必須宣告自己的手牌是聽牌還是無聽。玩家必須按照順序依次宣告：東家先宣告，接著是南家、西家，最後是北家。如果玩家在輪到自己宣告之前提前宣告，則視為犯規，玩家亦不得更改自己的宣告結果。
                </p>
                <p>
                  持有聽牌手牌的玩家可以選擇宣告為無聽並且不揭示手牌，除非玩家已經宣告立直。聽牌的玩家必須將手牌展示出來，而無聽的玩家則不得揭示手牌。
                </p>
                <p>無聽的玩家需平分支付 3,000 點給聽牌的玩家平分。</p>
                <p>
                  流局時，無論任何人聽牌與否，本場數必然加一。如果機器有顯示本場的功能，則不用在桌面上放置本場棒，然而立直的供托則放在下一局的莊家的鳴牌區附近。
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">3.2 包牌</h4>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  <strong>責任玩家</strong>：打出任何牌後，令到某玩家可在該牌副露鳴牌後，大三元，大四喜或四槓子確定。
                </p>
                <p>
                  <strong>放銃者</strong>：在責任玩家存在時，打出任何一牌令役滿確定者和了
                </p>
                <p className="font-semibold">當該手牌僅值單個役滿時：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>役滿確定者自摸胡牌時，責任玩家必須支付整個手牌的點數，包括所有本場棒的點數。</li>
                  <li>役滿確定者榮和胡牌時，責任玩家需與放銃者平分該手牌的點數。只有放銃者支付本場棒的點數。</li>
                </ul>
                <p className="font-semibold">當該手牌同時符合多個役滿時：</p>
                <p>每個役滿單獨計算點數，但本場棒僅支付一次：</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>
                    役滿確定者自摸胡牌時，責任玩家需支付其放銃役滿的全部點數。其他役滿的點數由每位玩家（包括責任玩家）分擔。此外，每位玩家需支付100點作為每根本場棒的分攤。
                  </li>
                  <li>
                    役滿確定者榮和胡牌時，責任玩家需與放銃者平分其放銃役滿的點數。放銃者需支付其他役滿的點數，以及所有本場棒的點數。
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 有關半莊完結 */}
        <div className="p-8 bg-card/50 backdrop-blur border-2 border-primary/20 rounded-lg">
          <h3 className="text-2xl font-bold mb-6">有關半莊完結</h3>

          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">4.1 剩餘供托</h4>
              <p className="text-muted-foreground">最後一局結束後，當時點棒數量最多者可得到埸上所有的剩餘供托。</p>
            </div>

            <div>
              <h4 className="text-xl font-semibold mb-3 text-primary">4.2 匯報分數</h4>
              <p className="text-muted-foreground">
                玩家必須完整填寫點數報表，每場玩家都有責任確保每一個欄位都準確。如有需要，任意玩家都可以請工作人員進行核對。在未確認點數報表之前，所有玩家絕對不可重置點棒或離開桌子。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
