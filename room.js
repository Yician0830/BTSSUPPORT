/* 彩蛋小窩：像素房間。解鎖徽章／彩蛋，房間就會多一件物品。
   新增物品：在 ITEMS 加一筆 {k 代號, b 對應徽章代號, n 名稱, hid 是否隱藏, x,y,w,h 固定位置與大小, art 像素圖, an 點擊動畫, say 點擊台詞}
   只讀取 badgeSync() 的結果，不改任何徽章資料。會存的東西只有三個：localStorage: room-seen（已看過的物品代號，用來標「新獲得」的閃爍星星）、room-fest（每個節日今年是否已經打過招呼）、room-ng（上一次七人進場的時間，七人一小時才進場一次）；檯燈開關、晝夜切換只在這次開啟有效。 */
(function () {
  "use strict";
  if (window.__roomLoaded) return;
  window.__roomLoaded = true;
  /* 網址的 ?preview= 在載入當下就先記下來（網站之後如果改掉網址列，預覽也不會消失） */
  /* 預覽參數可以組合：?preview=room1all,vd（逗號、加號、或重複 &preview=… 都可以）。
     room1all／room2all 是「全部解鎖」旗標，可以跟任何一個日期／節日／成員預覽一起用；PV 是其餘參數裡的第一個（日期／節日／成員），舊的單一參數寫法完全不變 */
  var PV = "", PVL = [];
  try {
    var pvRaw = window.__PV || new URLSearchParams(location.search).getAll("preview").join(",");
    PVL = String(pvRaw || "").split(/[,+\s]+/).filter(Boolean);
    PV = PVL.filter(function (x) { return x !== "room1all" && x !== "room2all" && x !== "room3all"; })[0] || (PVL[0] || "");
  } catch (e) {}

  var R = function (x, y, w, h, c, o) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + c + '"' + (o ? ' opacity="' + o + '"' : "") + "/>";
  };
  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  };
  var p2 = function (n) { return (n < 10 ? "0" : "") + n; };

  /* ===== 多語言 =====
     LT：中文原文 → [英, 韓, 日]。網站的翻譯機制（i18n.js）是「整段文字完全相同才換」，所以畫面上的句子都拆成固定短句，數字、日期另外放在自己的標籤裡。
     t(中文)：JS 自己組字串（aria-label、時鐘台詞）時用，依 <html lang> 取目前語言。 */
  var LT = {
    "在桌邊寫情書，筆尖沙沙響。": ["Writing a love letter at the desk, the pen scratching softly.", "책상 옆에서 러브레터를 쓰는 중, 펜 소리가 사각사각.", "机のそばでラブレターを書いてる。ペン先がさらさら。"],
    "寫了又擦，最後還是寫下最想說的話。": ["Written, erased, and in the end the words that mattered most.", "썼다 지웠다 하다가 결국 가장 하고 싶은 말을 적었어요.", "書いては消して、結局いちばん伝えたい言葉を書いた。"],
    "把信封收好，走去郵筒。": ["Tucked the envelope away and headed for the mailbox.", "봉투를 챙겨 우체통으로 가요.", "封筒をしまって、ポストへ向かう。"],
    "把情書投進郵筒，希望能順利寄到。": ["Dropped the letter in the mailbox, hoping it arrives safely.", "러브레터를 우체통에 넣었어요. 잘 도착하길 바라요.", "ラブレターをポストに投函。無事に届きますように。"],
    "叮咚——信寄出去了，心跳好快。": ["Ding-dong. The letter is sent, heart racing.", "딩동— 편지를 보냈어요. 심장이 두근거려요.", "ピンポン——手紙を出した。ドキドキが止まらない。"],
    "最後一顆了，捨不得吃，還是吃掉了。": ["The last piece. Hard to part with, but eaten anyway.", "마지막 한 개예요. 아까웠지만 결국 먹어 버렸어요.", "最後のひとつ。もったいないけど、食べちゃった。"],
    "偷偷拿走最後一顆，盒子空空的了。": ["Sneaked the last piece. The box is empty now.", "몰래 마지막 한 개를 집었어요. 상자가 비었어요.", "こっそり最後のひとつを。箱は空っぽになった。"],
    "盒子空了，只剩下包裝紙。": ["The box is empty, just the wrapping left.", "상자가 비었어요. 포장지만 남았어요.", "箱は空っぽ。包み紙だけが残ってる。"],
    "巧克力被吃光了，下次要記得留一顆。": ["All the chocolates are gone. Save one next time.", "초콜릿을 다 먹었어요. 다음엔 하나 남겨 둬요.", "チョコは全部なくなった。次はひとつ残しておこう。"],
    "郵筒": ["Mailbox", "우체통", "ポスト"],
    "郵筒肚子裡，好像有信在等著寄出。": ["There seems to be a letter inside, waiting to be sent.", "우체통 안에 보낼 편지가 기다리는 것 같아요.", "ポストの中で、手紙が出番を待っているみたい。"],
    "投進去的心意，一定會寄到。": ["Whatever you drop in is sure to arrive.", "넣은 마음은 꼭 도착할 거예요.", "投函した気持ちは、きっと届くよ。"],
    "玫瑰": ["Rose", "장미", "バラ"], "情書": ["Love letter", "러브레터", "ラブレター"],
    "一朵紅玫瑰，送給最喜歡的你。": ["A red rose, for the one you like most.", "빨간 장미 한 송이, 가장 좋아하는 당신에게.", "赤いバラを一輪、いちばん大好きなあなたに。"],
    "玫瑰的香味淡淡的，好像春天來了。": ["The rose smells faint and sweet, like spring has come.", "장미 향이 은은해서 봄이 온 것 같아요.", "バラの香りがほのかで、春が来たみたい。"],
    "信封上蓋著愛心封印，不知道是寫給誰的。": ["The envelope has a heart seal. Who is it for?", "봉투에 하트 도장이 찍혀 있어요. 누구에게 쓴 걸까요?", "封筒にハートの封印。誰宛てなんだろう？"],
    "拆開看看吧，裡面寫著滿滿的心意。": ["Open it up. It's full of heartfelt words.", "열어 보세요. 마음이 가득 적혀 있어요.", "開けてみよう。気持ちがいっぱい書いてあるよ。"],
    "湊近聞了聞玫瑰，甜甜的香味。": ["Leaned in to smell the rose. So sweet.", "장미에 코를 가까이 대 보니 달콤한 향이 나요.", "バラに顔を近づけて香りをかぐ。甘いね。"],
    "幫玫瑰擺正，花瓣紅得很漂亮。": ["Straightened the rose. Such pretty red petals.", "장미를 바로 세워 줬어요. 꽃잎이 정말 예쁜 빨간색이에요.", "バラをまっすぐ直した。花びらがきれいな赤。"],
    "拿起情書慢慢讀，臉都紅了。": ["Reading the love letter slowly, blushing already.", "러브레터를 천천히 읽다가 얼굴이 빨개졌어요.", "ラブレターをゆっくり読んで、顔が真っ赤。"],
    "把情書捧在胸前，心跳好快。": ["Hugging the letter to the chest, heart racing.", "러브레터를 가슴에 안으니 심장이 두근거려요.", "ラブレターを胸に抱えて、ドキドキ。"],
    "七個人一起送愛心！": ["All seven are sending hearts!", "일곱 명이 함께 하트를 보내요!", "7人みんなでハートを贈るよ！"],
    "情人節快樂，愛心送給每一位 ARMY。": ["Happy Valentine's Day. Hearts for every ARMY.", "해피 발렌타인데이, 모든 아미에게 하트를 보내요.", "ハッピーバレンタイン。すべての ARMY にハートを。"],
    "愛心送給你！": ["Here's a heart for you!", "하트를 보내요!", "ハートをあげる！"],
    "今天也要一起幸福！": ["Let's be happy together today, too!", "오늘도 같이 행복해요!", "今日も一緒に幸せになろう！"],
    "彩蛋小窩": ["Easter Egg Room", "에그 룸", "たまごのお部屋"],
    "解鎖徽章和彩蛋，布置你自己的 ARMY 小窩": ["Unlock badges and eggs to fill your own ARMY room", "배지와 에그를 해제해 나만의 아미 방을 꾸며 보세요", "バッジやたまごを解除して、自分だけの ARMY ルームを飾ろう"],
    "新功能／暫未開放": ["New feature / not open yet", "새 기능 / 아직 열리지 않았어요", "新機能／まだ公開前です"],
    "新功能，暫未開放": ["New feature, not open yet", "새 기능이에요. 아직 열리지 않았어요", "新機能です。まだ公開前です"],
    "我的 ARMY 小窩": ["My ARMY room", "나의 아미 방", "私の ARMY ルーム"],
    "房間": ["Room", "방", "お部屋"],
    "收藏清單": ["Collection", "수집 목록", "コレクション"],
    "已獲得": ["Owned", "획득함", "獲得済み"],
    "未獲得": ["Not yet", "미획득", "未獲得"],
    "隱藏物品": ["Hidden item", "숨겨진 아이템", "隠しアイテム"],
    "隱藏物品，達成後才會揭曉。": ["Hidden item — revealed once unlocked.", "숨겨진 아이템 — 달성하면 공개돼요.", "隠しアイテム。達成すると明らかになります。"],
    "尚未解鎖": ["Not unlocked yet", "아직 해제되지 않았어요", "まだ解除されていません"],
    "來自徽章：": ["From badge: ", "배지: ", "バッジ："],
    "解鎖徽章：": ["Unlock badge: ", "해제할 배지: ", "解除するバッジ："],
    "獲得於": ["Obtained on", "획득일", "獲得日"],
    "件": ["items", "개", "個"],
    "小窩完成度": ["Room completion", "방 완성도", "お部屋の完成度"],
    "小窩完成！": ["Room complete!", "방 완성!", "お部屋が完成！"],
    "窗外好像有七個人影在揮手……": ["Seven silhouettes seem to be waving outside the window...", "창밖에서 일곱 사람의 그림자가 손을 흔드는 것 같아요…", "窓の外で7人のシルエットが手を振っているみたい……"],
    "點房間裡的東西看看。暗暗的剪影是還沒解鎖的物品。": ["Tap things in the room. Dark silhouettes are items you haven't unlocked yet.", "방 안의 물건을 눌러 보세요. 어두운 실루엣은 아직 해제하지 않은 물건이에요.", "お部屋のものをタップしてみよう。暗いシルエットはまだ解除していないアイテムです。"],
    "☀ 切到白天": ["☀ Switch to day", "☀ 낮으로", "☀ 昼にする"],
    "🌙 切到夜晚": ["🌙 Switch to night", "🌙 밤으로", "🌙 夜にする"],
    "地毯": ["Rug", "러그", "ラグ"], "球鞋": ["Sneakers", "운동화", "スニーカー"], "時鐘": ["Clock", "시계", "時計"], "日曆": ["Calendar", "달력", "カレンダー"],
    "書架": ["Bookshelf", "책장", "本棚"], "獎盃": ["Trophy", "트로피", "トロフィー"], "收納櫃": ["Cabinet", "수납장", "収納棚"], "籤筒": ["Fortune cup", "운세 통", "おみくじ筒"],
    "七人壁貼": ["Seven-member decal", "일곱 멤버 스티커", "7人のウォールステッカー"], "票根串": ["Ticket strand", "티켓 줄", "チケットの束"], "月亮貼紙": ["Moon sticker", "달 스티커", "月のステッカー"],
    "檯燈": ["Desk lamp", "스탠드", "デスクライト"], "合照相框": ["Group photo frame", "단체 사진 액자", "集合写真のフレーム"], "小蛋糕": ["Little cake", "작은 케이크", "ミニケーキ"],
    "水晶球": ["Crystal ball", "수정구", "水晶玉"], "盆栽": ["Potted plant", "화분", "鉢植え"], "星星海報": ["Star poster", "별 포스터", "星のポスター"], "手燈": ["Light stick", "응원봉", "ペンライト"],
    "軟軟的地毯，踩起來很舒服。": ["A soft rug — so comfy to step on.", "폭신한 러그, 밟으면 정말 편해요.", "ふかふかのラグ。踏むと気持ちいい。"],
    "穿上球鞋，照著成員的足跡走一圈。": ["Lace up and walk the members' footprints.", "운동화를 신고 멤버들의 발자취를 따라 걸어 봐요.", "スニーカーを履いて、メンバーの足跡をたどろう。"],
    "又撕掉一頁，日子一天天往演唱會靠近。": ["Another page torn off — the concert gets closer every day.", "한 장 더 뜯었어요. 콘서트가 하루하루 다가와요.", "また1枚めくった。コンサートの日が一日ずつ近づくね。"],
    "收藏的應援都整齊排在這裡。": ["All your favorited projects are lined up neatly here.", "즐겨찾기한 응원이 여기 가지런히 꽂혀 있어요.", "お気に入りの応援がここにきれいに並んでいます。"],
    "應援遊戲 S 級！閃閃發亮。": ["S rank in the fanchant game! Shiny.", "응원 게임 S 등급! 반짝반짝 빛나요.", "応援ゲームでSランク！ピカピカ光ってる。"],
    "收藏的應援，全部都兌現了。": ["Every project you saved, you went and checked in.", "즐겨찾기한 응원을 전부 다녀왔어요.", "お気に入りに入れた応援は、ぜんぶ行ってきました。"],
    "籤筒晃一晃，今天的運氣就靠你自己抽啦。": ["Shake the cup — draw your own luck today!", "운세 통을 흔들어 오늘의 운을 직접 뽑아 봐요!", "おみくじ筒を振って、今日の運を引いてみよう！"],
    "七個小人排排站，看著你。": ["Seven little ones in a row, watching you.", "일곱 꼬마들이 나란히 서서 너를 보고 있어요.", "7人のミニキャラが並んで、あなたを見ています。"],
    "三天全勤的票根，一張都沒少。": ["Ticket stubs from all three days — not one missing.", "사흘 개근 티켓, 한 장도 빠지지 않았어요.", "3日間皆勤のチケット。1枚も欠けていません。"],
    "夜深了，小窩陪你一起熬夜。": ["It's late — your room is staying up with you.", "밤이 깊었어요. 방이 함께 밤을 새워 줄게요.", "夜も更けました。お部屋も一緒に夜更かしするよ。"],
    "檯燈亮了。": ["The lamp is on.", "스탠드가 켜졌어요.", "ライトがつきました。"],
    "檯燈關了。": ["The lamp is off.", "스탠드가 꺼졌어요.", "ライトが消えました。"],
    "6/13 的合照，七個人都戴上了派對帽。": ["The 6/13 group photo — all seven in party hats.", "6/13 단체 사진, 일곱 명 모두 파티 모자를 썼어요.", "6/13の集合写真。7人みんなパーティー帽子。"],
    "七個人一起來慶祝了！出道紀念日快樂！": ["All seven came to celebrate — happy debut anniversary!", "일곱 명이 함께 축하하러 왔어요. 데뷔 기념일 축하해요!", "7人そろってお祝いに来た。デビュー記念日おめでとう！"],
    "七個人一起幫 ": ["All seven are celebrating ", "일곱 명이 함께 ", "7人みんなで "],
    " 慶祝生日！": ["'s birthday!", "의 생일을 축하해요!", " の誕生日をお祝い！"],
    "派對告一段落，大家先離開。": ["The party's winding down — everyone heads out.", "파티가 끝나서 다들 나가요.", "パーティーは一区切り。みんなで退室。"],
    "演唱會海報": ["Concert poster", "콘서트 포스터", "コンサートポスター"],
    "演唱會海報貼好了，今天就是正式演出！": ["The concert poster is up — today is the real show!", "콘서트 포스터를 붙였어요. 오늘이 본공연이에요!", "コンサートポスターを貼った。今日が本番！"],
    "演唱會海報貼好了，明天就要見面了。": ["The concert poster is up — see them tomorrow.", "콘서트 포스터를 붙였어요. 내일이면 만나요.", "コンサートポスターを貼った。明日はいよいよ会える。"],
    "練習室裡也有手燈在發光。": ["A light stick is glowing in the practice room too.", "연습실에도 응원봉이 빛나고 있어요.", "練習室でもペンライトが光っている。"],
    "小人拿起手燈，準備出門了。": ["Light stick in hand, getting ready to head out.", "응원봉을 들고 외출 준비 중이에요.", "ペンライトを持って、出かける準備。"],
    "練習到這裡，明天就是正式舞台。": ["Practice ends here — tomorrow is the real stage.", "연습은 여기까지, 내일은 진짜 무대예요.", "練習はここまで。明日が本番のステージ。"],
    "小人正在整理明天的行李。": ["Packing the bag for tomorrow.", "내일 짐을 챙기는 중이에요.", "明日の荷物を準備中。"],
    "先讓出位置，等一下再回來。": ["Stepping aside — back in a moment.", "자리를 비켜줬다가 곧 돌아올게요.", "場所を空けて、すぐ戻るね。"],
    "回來了，繼續待在小窩。": ["Back again, hanging out in the nest.", "돌아왔어요. 계속 둥지에서 쉬어요.", "戻ってきた。引き続き小窩でのんびり。"],
    "帶著手燈出門，去現場囉！": ["Heading out with the light stick — off to the venue!", "응원봉을 들고 공연장으로 출발!", "ペンライトを持って、会場へ出発！"],
    "小人出發看演唱會了，晚點回來。": ["Off to the concert — back later.", "콘서트 보러 출발했어요. 나중에 돌아올게요.", "コンサートに出発！あとで帰ってくるね。"],
    "演唱會結束，小人回來了。": ["The concert is over — back home!", "콘서트가 끝나고 돌아왔어요.", "コンサートが終わって、ただいま！"],
    "回來了，還在回味演唱會的感動。": ["Back home, still glowing from the concert.", "돌아왔어요. 아직 콘서트의 여운이 남아 있어요.", "帰ってきた。まだコンサートの余韻の中。"],
    "票帶了嗎？手燈充飽了嗎？再確認一次！": ["Got the ticket? Light stick charged? One more check!", "티켓 챙겼나? 응원봉 충전은? 한 번 더 확인!", "チケットは持った？ペンライトは充電した？もう一回確認！"],
    "水壺和毛巾": ["Water bottle & towel", "물병과 수건", "ボトルとタオル"], "運動鞋": ["Sneakers", "운동화", "スニーカー"],
    "練舞練到口渴，先喝口水補充體力。": ["Thirsty from dancing — time for a sip of water.", "연습하다 목이 말라요. 물 한 모금 마시고 힘내요.", "踊り疲れて喉がカラカラ。まずは水分補給。"],
    "毛巾搭在水壺上，等一下還要擦汗。": ["The towel is draped over the bottle, ready to wipe off sweat.", "수건을 물병에 걸어 뒀어요. 곧 땀을 닦아야 해요.", "タオルをボトルに掛けた。あとで汗を拭くよ。"],
    "多喝水，七個人一起跳才不會累倒。": ["Drink up — all seven need energy to dance together.", "물 많이 마셔요. 일곱 명이 함께 춰야 하니까요.", "水をたくさん飲もう。七人で踊るなら体力が大事。"],
    "練舞的球鞋，鞋底都快磨平了。": ["Dance sneakers — the soles are almost worn flat.", "연습용 운동화예요. 밑창이 거의 다 닳았어요.", "練習用のスニーカー。ソールがすり減ってきた。"],
    "有一隻歪倒了，趕快擺好再出發。": ["One has tipped over — set it straight before heading out.", "한 짝이 쓰러졌어요. 바로 세워 놓고 출발!", "片方が倒れてる。直してから出発しよう。"],
    "鞋帶綁緊，今天也要練到最後一刻。": ["Laces tight — practice to the very last minute again today.", "신발끈 단단히! 오늘도 끝까지 연습해요.", "靴ひもをしっかり結んで、今日も最後まで練習。"],
    "抬頭看著海報，明天就要見面了。": ["Looking up at the poster — see them tomorrow.", "포스터를 올려다봐요. 내일이면 만나요.", "ポスターを見上げてる。明日はいよいよ会える。"],
    "看著海報，心跳已經開始加速。": ["Gazing at the poster, heart already racing.", "포스터를 보니 벌써 심장이 두근거려요.", "ポスターを見てるだけで、もうドキドキ。"],
    "看著海報，今天就是正式演出！": ["Looking at the poster — today is the real show!", "포스터를 보며… 오늘이 본공연이에요!", "ポスターを見つめる。今日が本番！"],
    "海報上的七個人，今天終於要見面了！": ["The seven on the poster — finally meeting them today!", "포스터 속 일곱 명, 오늘 드디어 만나요!", "ポスターの七人に、今日やっと会える！"],
    "生日禮物": ["Birthday gifts", "생일 선물", "誕生日プレゼント"],
    "是給壽星的，裡面是什麼呢？": ["It's for the birthday star — what could be inside?", "생일 주인공을 위한 선물, 안엔 뭐가 들었을까요?", "主役へのプレゼント。中身は何かな？"],
    "包裝得好漂亮，不知道裝了什麼。": ["Beautifully wrapped — wonder what's inside.", "포장이 정말 예뻐요. 뭐가 들었는지 궁금해요.", "きれいに包まれてる。何が入ってるんだろう。"],
    "七個人一起挑的禮物，藏不住心意。": ["A gift picked by all seven — the love shows.", "일곱 명이 함께 고른 선물, 마음이 가득해요.", "七人で選んだプレゼント。気持ちがあふれてる。"],
    "停在禮物前面，猜猜裡面是什麼。": ["Stopping by the gifts, guessing what's inside.", "선물 앞에 멈춰서 안에 뭐가 들었는지 맞혀 봐요.", "プレゼントの前で足を止めて、中身を想像中。"],
    "看著壽星的禮物，也跟著開心起來。": ["Looking at the birthday gifts, feeling happy too.", "생일 선물을 보니 덩달아 기분이 좋아져요.", "主役のプレゼントを見てたら、こっちまで嬉しくなる。"],
    "生日氣球": ["Birthday balloons", "생일 풍선", "誕生日の風船"],
    "氣球飄呀飄，今天是你的日子。": ["Balloons floating by — today is your day.", "풍선이 둥실둥실, 오늘은 당신의 날이에요.", "風船がふわふわ。今日は主役の日。"],
    "輕輕一碰，氣球就晃了起來。": ["One gentle tap and the balloons start to sway.", "살짝 건드리니 풍선이 흔들려요.", "そっと触れたら、風船がゆらゆら。"],
    "三顆氣球綁在一起，一起慶祝生日。": ["Three balloons tied together, celebrating the birthday.", "풍선 세 개가 함께 생일을 축하해요.", "三つの風船が一緒にお祝い。"],
    "看著氣球飄呀飄，心情也輕飄飄的。": ["Watching the balloons float, feeling light too.", "풍선이 둥실둥실, 마음도 가벼워져요.", "風船を眺めてたら、気持ちもふわふわ。"],
    "伸手碰了碰氣球，氣球晃了起來。": ["Reached out to touch the balloons — they sway.", "손을 뻗어 풍선을 건드리니 흔들려요.", "風船にそっと手を伸ばしたら、ゆらゆら揺れた。"],
    "整理行李：票、手燈、行動電源，都放進包包了。": ["Packing up: ticket, light stick, power bank — all in the bag.", "짐 챙기기: 티켓, 응원봉, 보조배터리 모두 가방에 넣었어요.", "荷造り：チケット、ペンライト、モバイルバッテリー、全部バッグへ。"],
    "拉開彩帶砲——砰！紙花滿天飛。": ["Pulling the party popper — pop! Confetti everywhere.", "파티 폭죽을 당겼어요. 펑! 색종이가 날아요.", "クラッカーをパーン！紙吹雪が舞った。"],
    "捧著小蛋糕許願，然後一口氣吹熄蠟燭。": ["Holding a little cake, making a wish, then blowing out the candle.", "작은 케이크를 들고 소원을 빌고, 촛불을 후— 불어요.", "ミニケーキを持って願いごと、ふーっとろうそくを吹き消す。"],
    "七個人，一張合照。": ["Seven of them, one photo.", "일곱 명, 한 장의 단체 사진.", "7人、1枚の集合写真。"],
    "6/13 的蛋糕，出道紀念日快樂！": ["A 6/13 cake — happy debut anniversary!", "6/13 케이크, 데뷔 기념일 축하해요!", "6/13のケーキ。デビュー記念日おめでとう！"],
    "水晶球裡好像看到了……下一場的歌單？": ["I think I see something in the crystal ball... the next setlist?", "수정구 안에 뭔가 보이는 것 같아요… 다음 공연 세트리스트?", "水晶玉に何か見える……次のセットリスト？"],
    "盆栽沙沙搖，歡迎常常回來。": ["The plant rustles — come back often!", "화분이 살랑살랑, 자주 놀러 오세요.", "鉢植えがさわさわ揺れてる。また来てね。"],
    "星星海報：今天的運勢，抽籤才知道。": ["Star poster: you'll only know today's fortune by drawing one.", "별 포스터: 오늘의 운세는 뽑아 봐야 알아요.", "星のポスター：今日の運勢は、引いてからのお楽しみ。"],
    "手燈亮起來了 💜": ["The light stick is glowing 💜", "응원봉이 환하게 켜졌어요 💜", "ペンライトが光ったよ 💜"],
    "有新物品！": ["New items!", "새 아이템이 있어요!", "新しいアイテムがあります！"],
    "閃爍的星星是新獲得的，點一下看看。": ["The blinking stars mark new items — tap to take a look.", "반짝이는 별은 새로 얻은 아이템이에요. 눌러서 확인해 보세요.", "点滅する星は新しく獲得したアイテム。タップしてみよう。"],
    "全部": ["All", "전체", "すべて"],
    "在小窩裡散步。": ["Taking a stroll around the room.", "방 안을 산책 중이에요.", "お部屋を散歩中。"],
    "本命一直都在小窩裡。": ["Your bias is always here in the room.", "최애는 언제나 방에 있어요.", "本命はいつもお部屋にいます。"],
    "散步的小人": ["Little walker", "산책하는 꼬마", "お散歩ミニキャラ"],
    "關閉": ["Close", "닫기", "閉じる"],
    "今天是 6/13，出道紀念日！": ["It's 6/13 — debut anniversary!", "오늘은 6/13, 데뷔 기념일!", "今日は6/13、デビュー記念日！"],
    "小窩也掛上彩旗了。": ["The room put up bunting too.", "방에도 깃발을 달았어요.", "お部屋にもガーランドを飾りました。"],
    "出道紀念日剛過！": ["The debut anniversary just passed!", "데뷔 기념일이 지나갔어요!", "デビュー記念日が過ぎました！"],
    "小窩的彩旗還沒收，捨不得。": ["The flags in the room are still up — hard to take them down.", "방의 깃발을 아직 못 치웠어요. 아쉬워서요.", "お部屋の旗はまだそのまま。名残惜しくて。"],
    "練習室的彩旗還沒收，捨不得。": ["The flags in the practice room are still up — hard to take them down.", "연습실의 깃발을 아직 못 치웠어요. 아쉬워서요.", "練習室の旗はまだそのまま。名残惜しくて。"],
    "巧克力": ["Chocolates", "초콜릿", "チョコレート"],
    "愛心": ["Hearts", "하트", "ハート"],
    "情人節的巧克力，粉紅緞帶綁得好整齊。": ["Valentine's chocolates, the pink ribbon tied just right.", "발렌타인 초콜릿, 분홍 리본이 가지런히 묶여 있어요.", "バレンタインのチョコ。ピンクのリボンがきれいに結ばれてる。"],
    "打開蓋子，每一顆都不一樣。": ["Open the lid — every piece is different.", "뚜껑을 열면 하나하나 모두 달라요.", "ふたを開けると、ひとつひとつ違うよ。"],
    "分你一顆，剩下的我們一起吃。": ["One for you — we'll share the rest.", "한 개 줄게요. 나머지는 같이 먹어요.", "ひとつあげる。残りはいっしょに食べよう。"],
    "愛心飄呀飄，今天滿滿都是愛。": ["Hearts floating by — today is full of love.", "하트가 둥실둥실, 오늘은 사랑이 가득해요.", "ハートがふわふわ。今日は愛でいっぱい。"],
    "輕輕一碰，愛心晃了起來。": ["One gentle tap and the hearts start to sway.", "살짝 건드리니 하트가 흔들려요.", "そっと触れたら、ハートがゆらゆら。"],
    "偷偷拿了一顆巧克力，甜甜的。": ["Sneaked a chocolate — so sweet.", "몰래 초콜릿 하나를 집었어요. 달콤해요.", "こっそりチョコをひとつ。甘いね。"],
    "情人節的巧克力，捨不得一口吃完。": ["Valentine's chocolate — too precious to finish in one bite.", "발렌타인 초콜릿, 한입에 먹기 아까워요.", "バレンタインのチョコ、ひと口で食べるのはもったいない。"],
    "情人節快樂！": ["Happy Valentine's Day!", "해피 발렌타인데이!", "ハッピーバレンタイン！"],
    "小窩也布置好愛心了。": ["The room is decked out with hearts too.", "방도 하트로 꾸며졌어요.", "お部屋もハートで飾りつけしました。"],
    "練習室也布置好愛心了。": ["The practice room is decked out with hearts too.", "연습실도 하트로 꾸며졌어요.", "練習室もハートで飾りつけしました。"],
    "情人節": ["Valentine's Day", "발렌타인데이", "バレンタイン"],
    "七個人一起跨年！": ["All seven ring in the New Year together!", "일곱 명이 함께 새해를 맞아요!", "七人そろって年越し！"],
    "乾杯，倒數完就是新的一年了。": ["Cheers — one countdown away from a new year.", "건배! 카운트다운이 끝나면 새해예요.", "乾杯！カウントダウンが終わったら新しい年。"],
    "跨年快樂！": ["Happy New Year's Eve!", "새해 전야 즐거워요!", "良いお年を！"],
    "乾杯！": ["Cheers!", "건배!", "乾杯！"],
    "一起倒數！": ["Count down together!", "같이 카운트다운해요!", "一緒にカウントダウン！"],
    "兔子燈": ["Rabbit lantern", "토끼 등불", "うさぎのランタン"],
    "月餅": ["Mooncake", "월병", "月餅"],
    "柚子": ["Pomelo", "유자", "ブンタン"],
    "兔子燈亮亮的，像月亮上的玉兔。": ["The rabbit lantern glows like the Jade Rabbit on the moon.", "토끼 등불이 달 속 옥토끼처럼 환하게 빛나요.", "うさぎのランタンが、月の玉兎みたいに光ってる。"],
    "燈籠晃呀晃，中秋的味道。": ["The lantern sways — that Mid-Autumn feeling.", "등불이 흔들흔들, 추석 분위기예요.", "ランタンがゆらゆら、中秋の雰囲気。"],
    "中秋的月餅，一人一半才夠甜。": ["Mooncakes taste sweetest when shared.", "추석 월병은 나눠 먹어야 더 달아요.", "中秋の月餅は、半分こが一番甘い。"],
    "蛋黃酥香香的，等月亮出來再吃。": ["Smells so good — saving it until the moon comes out.", "고소한 냄새, 달이 뜰 때까지 기다렸다 먹을래요.", "いい香り。月が出るまで我慢して食べよう。"],
    "柚子清清香香，剝一瓣來吃。": ["Fresh pomelo scent — peel a piece to eat.", "상큼한 유자 향, 한 조각 까서 먹어요.", "さわやかなブンタンの香り。ひと房むいて食べよう。"],
    "中秋就是要吃柚子配月餅。": ["Mid-Autumn means pomelo with mooncake.", "추석엔 유자랑 월병이죠.", "中秋はブンタンと月餅でしょ。"],
    "切一塊月餅，蛋黃餡的最香。": ["Cut a slice of mooncake — the egg-yolk one smells best.", "월병을 한 조각 잘랐어요. 노른자 월병이 제일 고소해요.", "月餅をひと切れ。卵黄入りがいちばん香ばしい。"],
    "偷咬一口月餅，邊吃邊賞月。": ["Sneaking a bite of mooncake while moon-gazing.", "몰래 월병 한 입, 달 구경하면서 먹어요.", "こっそり月餅をひと口、お月見しながら。"],
    "停在窗邊賞月，今晚的月亮好圓。": ["Stopping by the window to watch the moon — so round tonight.", "창가에서 달 구경, 오늘 달이 정말 둥글어요.", "窓辺でお月見。今夜の月はまんまる。"],
    "抬頭看圓圓的月亮，團圓的日子。": ["Looking up at the full moon — a day for reunion.", "둥근 달을 올려다봐요. 보름달 같은 한가위예요.", "まんまるの月を見上げる。団らんの日。"],
    "七個人一起賞月！": ["All seven are moon-gazing together!", "일곱 명이 함께 달구경해요!", "七人そろってお月見！"],
    "中秋節快樂，月亮好圓。": ["Happy Mid-Autumn — the moon is so round.", "즐거운 추석, 달이 정말 둥글어요.", "中秋節おめでとう。月がまんまる。"],
    "月亮好圓！": ["What a round moon!", "달이 정말 둥글어요!", "月がまんまる！"],
    "月餅分你一半！": ["Half of my mooncake is yours!", "월병 반쪽 나눠 줄게요!", "月餅、半分あげる！"],
    "聖誕樹": ["Christmas tree", "크리스마스 트리", "クリスマスツリー"],
    "樹亮起來了，窗外也下雪了。": ["The tree is lit up, and it's snowing outside the window.", "트리가 켜졌어요. 창밖에도 눈이 내려요.", "ツリーが点灯。窓の外には雪が降ってきた。"],
    "彩燈一閃一閃，聖誕節的氣氛來了。": ["The lights twinkle — Christmas is here.", "전구가 반짝반짝, 크리스마스 분위기예요.", "イルミネーションがチカチカ、クリスマス気分。"],
    "聽，窗外的雪沙沙地落下來。": ["Listen — the snow is softly falling outside.", "들어 보세요, 창밖에 눈이 사르르 내려요.", "聞いて、窓の外で雪がさらさら降ってる。"],
    "燈關掉了，樹安安靜靜站著。": ["Lights off — the tree stands quietly.", "불을 껐어요. 트리가 조용히 서 있어요.", "明かりを消して、ツリーは静かに立ってる。"],
    "等一下再點亮，窗外的雪也會停。": ["Light it again later — the snow outside will stop for now.", "나중에 다시 켜요. 창밖의 눈도 잠시 그쳐요.", "またあとで点けよう。窓の外の雪もやんだ。"],
    "聖誕老人": ["Santa", "산타 할아버지", "サンタさん"],
    "窗外有雪橇飛過，是來送禮物的嗎？": ["A sleigh flew past the window — delivering gifts?", "창밖으로 썰매가 지나갔어요. 선물을 배달하나 봐요?", "窓の外をそりが通り過ぎた。プレゼントを届けにきたのかな？"],
    "邊揮手燈邊哼歌，今天的演唱會還在耳邊。": ["Waving the lightstick and humming — tonight's concert still rings in my ears.", "응원봉을 흔들며 콧노래, 오늘 콘서트가 아직 귓가에 맴돌아요.", "ペンライトを振りながら鼻歌。今日のライブがまだ耳に残ってる。"],
    "揮著手燈哼著歌，回味剛剛的現場。": ["Swinging the lightstick and humming, replaying the show in my head.", "응원봉을 흔들며 노래를 흥얼거려요. 방금 공연을 되새겨요.", "ペンライトを振って鼻歌、さっきのライブを思い出してる。"],
    "南瓜燈": ["Jack-o'-lantern", "잭오랜턴", "ジャック・オ・ランタン"],
    "南瓜燈亮起來了，橘色的光暖暖的。": ["The jack-o'-lantern glows with a warm orange light.", "잭오랜턴이 켜졌어요. 따뜻한 주황빛이에요.", "ジャック・オ・ランタンが点灯。オレンジの光があたたかい。"],
    "燭光一閃一閃，萬聖節的氣氛來了。": ["The candlelight flickers — Halloween is here.", "촛불이 깜빡깜빡, 할로윈 분위기예요.", "ろうそくの火がゆらゆら、ハロウィン気分。"],
    "咧開嘴笑的南瓜，好像在說不給糖就搗蛋！": ["That grinning pumpkin seems to say: trick or treat!", "씩 웃는 호박이 트릭 오어 트릿! 하는 것 같아요.", "にやりと笑うカボチャ、トリック・オア・トリート！って言ってるみたい。"],
    "燈熄了，南瓜安靜地蹲著。": ["Lights out — the pumpkin sits quietly.", "불이 꺼졌어요. 호박이 조용히 앉아 있어요.", "明かりが消えて、カボチャは静かにしゃがんでる。"],
    "等天黑再點亮，會更有氣氛。": ["Light it again when it gets dark for more atmosphere.", "어두워지면 다시 켜요. 분위기가 더 좋아요.", "暗くなったらまた点けよう。もっと雰囲気が出るよ。"],
    "七個人給的紅包，收到了！新年快樂。": ["Got the red envelopes from all seven — Happy New Year!", "일곱 명이 준 세뱃돈 받았어요. 새해 복 많이 받으세요!", "七人からのお年玉、受け取ったよ！あけましておめでとう。"],
    "收到大家的紅包，開心到想跳一下。": ["Got everyone's red envelopes — so happy I could jump.", "모두에게 세뱃돈을 받아서 신나서 폴짝 뛰고 싶어요.", "みんなからお年玉をもらって、うれしくてジャンプしたい。"],
    "00:00，新的一年開始了。": ["00:00 — a brand-new year begins.", "00:00, 새로운 한 해가 시작됐어요.", "0:00、新しい年が始まったよ。"],
    "萬聖節快樂！不給糖就搗蛋～": ["Happy Halloween! Trick or treat~", "해피 할로윈! 트릭 오어 트릿~", "ハッピーハロウィン！トリック・オア・トリート～"],
    "聖誕快樂！今年也要一起過節。": ["Merry Christmas! Let's celebrate together again this year.", "메리 크리스마스! 올해도 함께 보내요.", "メリークリスマス！今年も一緒にお祝いしよう。"],
    "新年快樂！新的一年也要在一起。": ["Happy New Year! Let's stay together this year too.", "새해 복 많이 받으세요! 올해도 함께해요.", "あけましておめでとう！今年も一緒にいようね。"],
    "情人節快樂！把滿滿的愛心送給你。": ["Happy Valentine's Day! Sending you lots of love.", "해피 밸런타인데이! 사랑을 가득 보내요.", "ハッピーバレンタイン！たくさんの愛を贈るよ。"],
    "中秋節快樂！今晚的月亮好圓。": ["Happy Mid-Autumn! The moon is so round tonight.", "즐거운 추석! 오늘 밤 달이 정말 둥글어요.", "中秋節おめでとう！今夜の月はまんまる。"],
    "跨年快樂！等一下一起倒數。": ["Happy New Year's Eve! Let's count down together later.", "새해 전야 즐거워요! 이따가 같이 카운트다운해요.", "良いお年を！あとで一緒にカウントダウンしよう。"],
    "哇！南瓜突然亮起來，嚇我一跳！": ["Whoa! The pumpkin lit up out of nowhere — you scared me!", "으악! 호박이 갑자기 켜져서 깜짝 놀랐어요!", "わっ！カボチャが急に光ってびっくりした！"],
    "嚇死我了，原來是南瓜燈。": ["You scared me to death — it was just the jack-o'-lantern.", "간 떨어질 뻔했어요. 잭오랜턴이었네요.", "びっくりした、ジャック・オ・ランタンか。"],
    "咦？它剛剛是不是瞪我？": ["Huh? Did it just glare at me?", "어? 방금 저를 노려본 거 아니에요?", "あれ？今、こっちをにらんだ？"],
    "今天是萬聖節，小窩也變得有點神秘。": ["It's Halloween — even the nest feels a little mysterious.", "오늘은 할로윈, 둥지도 조금 신비로워졌어요.", "今日はハロウィン。小窩もちょっと不思議な雰囲気。"],
    "糖果準備好了嗎？小心南瓜燈在看你。": ["Got your candy ready? Careful, the jack-o'-lantern is watching.", "사탕 준비됐어요? 잭오랜턴이 지켜보고 있어요.", "お菓子の準備はいい？ジャック・オ・ランタンが見てるよ。"],
    "南瓜燈亮起來吧，萬聖節的夜晚才有趣。": ["Light up the pumpkin — Halloween nights are the fun ones.", "호박등을 켜 봐요. 할로윈 밤이 제일 재밌어요.", "カボチャを光らせよう。ハロウィンの夜はこれから。"],
    "叮叮噹，小窩的聖誕節開始了。": ["Jingle bells — Christmas has begun in the nest.", "딩동댕, 둥지의 크리스마스가 시작됐어요.", "ジングルベル、小窩のクリスマスが始まったよ。"],
    "樹下的禮物好像比去年多了一個。": ["There seems to be one more gift under the tree than last year.", "트리 아래 선물이 작년보다 하나 늘어난 것 같아요.", "ツリーの下のプレゼント、去年より一つ増えた気がする。"],
    "聖誕夜的願望，已經悄悄許好了。": ["I've already made my Christmas Eve wish, quietly.", "크리스마스 이브 소원은 벌써 몰래 빌었어요.", "クリスマスイブの願い事、こっそりもうしたよ。"],
    "新年到，紅包和好運都要收好。": ["New Year is here — keep your red envelopes and good luck safe.", "새해가 왔어요. 세뱃돈이랑 행운 잘 챙겨요.", "新年だよ。お年玉も幸運も大事にしまっておこう。"],
    "恭喜發財，今年也要一起加油！": ["Wishing you prosperity — let's cheer together again this year!", "부자 되세요, 올해도 같이 힘내요!", "新年おめでとう、今年も一緒にがんばろう！"],
    "新的一年，願望和應援都滿滿的。": ["A new year, full of wishes and cheering.", "새해에는 소원도 응원도 가득하길.", "新しい年、願いも応援もいっぱいに。"],
    "今天的小窩粉粉的，心情也是。": ["The nest is pink today, and so is my mood.", "오늘 둥지는 분홍빛, 기분도 그래요.", "今日の小窩はピンク色、気分もね。"],
    "巧克力和玫瑰都準備好了，等你來。": ["Chocolates and roses are ready — waiting for you.", "초콜릿이랑 장미 준비 끝, 기다리고 있어요.", "チョコもバラも準備できたよ。待ってるね。"],
    "把想說的話，寫進今天的情書裡。": ["Write what you want to say into today's love letter.", "하고 싶은 말을 오늘의 러브레터에 적어 봐요.", "言いたいことを、今日のラブレターに書こう。"],
    "月餅切好了，等月亮升起來一起吃。": ["The mooncakes are cut — let's eat when the moon rises.", "월병을 잘라 놨어요. 달이 뜨면 같이 먹어요.", "月餅は切ってあるよ。月が昇ったら一緒に食べよう。"],
    "圓圓的月亮，圓圓的團圓，真好。": ["A round moon, a round reunion — how lovely.", "둥근 달, 둥근 한가위, 참 좋아요.", "まんまるの月、まんまるの団らん、いいね。"],
    "抬頭看看月亮，大家都在同一片月光下。": ["Look up at the moon — we're all under the same moonlight.", "달을 올려다봐요. 모두 같은 달빛 아래 있어요.", "月を見上げよう。みんな同じ月明かりの下にいる。"],
    "今年的最後一天，辛苦了，也謝謝一路陪著。": ["The last day of the year — thank you for all your hard work and for staying with me.", "올해 마지막 날, 수고했어요. 끝까지 함께해 줘서 고마워요.", "今年最後の日。おつかれさま、ずっと一緒にいてくれてありがとう。"],
    "零食準備好了，一起等煙火吧。": ["Snacks are ready — let's wait for the fireworks together.", "간식 준비 끝, 같이 불꽃놀이 기다려요.", "おやつの準備できたよ。一緒に花火を待とう。"],
    "倒數之前，先許個願望好不好？": ["Before the countdown, shall we make a wish?", "카운트다운 전에 소원 하나 빌어 볼까요?", "カウントダウンの前に、願い事をしない？"],
    "應援街區": ["Support Street", "응원 거리", "応援ストリート"],
    "街區完成度": ["Street progress", "거리 완성도", "ストリート達成度"],
    "第 3 間": ["Room 3", "3번째 방", "3つ目の部屋"],
    "應援旗": ["Support flags", "응원 깃발", "応援フラッグ"],
    "LED 電視牆": ["LED video wall", "LED 전광판", "LEDビジョン"],
    "霓虹招牌": ["Neon sign", "네온사인", "ネオンサイン"],
    "展覽": ["Exhibition", "전시", "展示"],
    "快閃店": ["Pop-up store", "팝업스토어", "ポップアップストア"],
    "燈箱看板": ["Lightbox sign", "라이트박스", "ライトボックス"],
    "咖啡廳": ["Café", "카페", "カフェ"],
    "公車站牌": ["Bus stop", "버스 정류장", "バス停"],
    "應援咖啡廳": ["Support café", "응원 카페", "応援カフェ"],
    "LED 廣告車": ["LED ad truck", "LED 광고 차량", "LED広告トラック"],
    "應援企劃達人": ["Support Project Pro", "응원 기획 달인", "応援企画の達人"],
    "LED電視牆達人": ["LED Wall Pro", "LED 전광판 달인", "LEDビジョンの達人"],
    "全類型收集": ["All Types Collected", "전체 유형 수집", "全タイプ収集"],
    "展覽達人": ["Exhibition Pro", "전시 달인", "展示の達人"],
    "快閃店達人": ["Pop-up Pro", "팝업스토어 달인", "ポップアップの達人"],
    "燈箱/看板達人": ["Lightbox Pro", "라이트박스 달인", "ライトボックスの達人"],
    "咖啡廳達人": ["Café Pro", "카페 달인", "カフェの達人"],
    "公車站牌達人": ["Bus Stop Pro", "버스 정류장 달인", "バス停の達人"],
    "應援咖啡廳達人": ["Support Café Pro", "응원 카페 달인", "応援カフェの達人"],
    "LED廣告車達人": ["LED Ad Truck Pro", "LED 광고 차량 달인", "LED広告トラックの達人"],
    "彩旗一面一面掛起來，整條街都是應援的味道。": ["Flags go up one by one — the whole street smells of fan support.", "깃발이 하나둘 걸리고, 거리 전체에 응원의 기운이 가득해요.", "フラッグが一枚ずつ掛かって、通り全体に応援の空気。"],
    "大螢幕亮起來了，節拍跟著畫面一起跳。": ["The big screen lights up, the beat jumping along with the picture.", "큰 화면이 켜지고, 박자가 영상과 함께 뛰어요.", "大きなスクリーンが点いて、ビートが映像と一緒に弾む。"],
    "每一種應援都集齊了，整條街的燈全部亮起。": ["Every kind of support collected — the whole street lights up.", "모든 종류의 응원을 모았어요. 거리 전체에 불이 켜져요.", "すべての種類を集めて、通り中の明かりが灯った。"],
    "展覽開幕了，進去慢慢看，別急。": ["The exhibition is open — take your time inside.", "전시가 시작됐어요. 천천히 둘러보세요.", "展示がオープン。ゆっくり見ていってね。"],
    "快閃店限定周邊，今天也排了好長的隊。": ["Limited pop-up goods, and the line is long again today.", "팝업 한정 굿즈, 오늘도 줄이 길어요.", "ポップアップ限定グッズ、今日も長蛇の列。"],
    "燈箱亮著，路過的人都會停下來拍一張。": ["The lightbox glows and passersby stop for a photo.", "라이트박스가 빛나서 지나가던 사람들이 사진을 찍어요.", "ライトボックスが光って、通りがかりの人も写真を撮っていく。"],
    "坐下來喝杯咖啡，等下一站再出發。": ["Sit down for a coffee before the next stop.", "앉아서 커피 한 잔 하고 다음 장소로 가요.", "座ってコーヒーを一杯、次の場所へ行く前に。"],
    "站牌旁邊拍照打卡，公車來了先讓它過。": ["Photo at the bus stop — let the bus pass first.", "정류장에서 인증샷, 버스는 먼저 보내요.", "バス停で写真を一枚。バスが来たら先に通してあげよう。"],
    "應援咖啡廳的杯套今天也很好看。": ["The cup sleeves at the support café look lovely again today.", "응원 카페의 컵 홀더가 오늘도 예뻐요.", "応援カフェのカップスリーブ、今日もかわいい。"],
    "廣告車慢慢開過去，整條街都跟著抬頭看。": ["The ad truck rolls slowly by and the whole street looks up.", "광고 차량이 천천히 지나가고 거리 전체가 올려다봐요.", "広告トラックがゆっくり通り過ぎて、通りじゅうが見上げる。"],
    "街上也掛滿彩旗了。": ["The street is hung with flags too.", "거리에도 깃발이 가득 걸렸어요.", "通りにもフラッグがいっぱい。"],
    "街區為壽星亮燈了。": ["The street lit up for the birthday star.", "거리가 생일의 주인공을 위해 불을 밝혔어요.", "通りが主役のために明かりを灯した。"],
    "街區先掛上彩旗了。": ["The street put up flags in advance.", "거리에 먼저 깃발을 걸었어요.", "通りに先にフラッグを掛けた。"],
    "街區的彩旗還沒收，捨不得。": ["The street's flags are still up — hard to take down.", "거리의 깃발을 아직 못 걷었어요. 아쉬워서요.", "通りのフラッグはまだ片付けられない。名残惜しくて。"],
    "街區也迎接新的一年了。": ["The street welcomes the new year too.", "거리도 새해를 맞이했어요.", "通りも新しい年を迎えた。"],
    "應援街區完成！": ["Support Street complete!", "응원 거리 완성!", "応援ストリート完成！"],
    "整條街的燈都亮了。": ["Every light on the street is on.", "거리의 불이 모두 켜졌어요.", "通りの明かりが全部灯った。"],
    "點街上的東西看看。暗暗的剪影是還沒解鎖的物品。": ["Tap things on the street. Dark silhouettes are items not yet unlocked.", "거리의 물건을 눌러 보세요. 어두운 실루엣은 아직 잠긴 물건이에요.", "通りのものをタップしてみよう。暗いシルエットは未解放のアイテム。"],
    "完成第二個房間後解鎖。": ["Unlocks after completing the second room.", "두 번째 방을 완성하면 열려요.", "2つ目の部屋を完成させると解放されます。"],
    "第二個房間已完成，新房間準備中。": ["The second room is complete. A new room is on its way.", "두 번째 방을 완성했어요. 새 방을 준비 중이에요.", "2つ目の部屋は完成。新しい部屋を準備中です。"],
    "應援街區開放了，快去看看。": ["Support Street is open — go take a look.", "응원 거리가 열렸어요. 가 보세요.", "応援ストリートが開放されたよ。見に行こう。"],
    "一邊走一邊看街上的應援。": ["Walking along, taking in the support displays on the street.", "걸으면서 거리의 응원을 구경해요.", "歩きながら、街の応援を眺めてる。"],
    "路過的人都在拍照打卡。": ["Everyone passing by is taking photos and checking in.", "지나가는 사람들이 모두 사진 찍고 체크인해요.", "通りがかりの人がみんな写真を撮ってチェックインしてる。"],
    "今天的街上好熱鬧。": ["The street is so lively today.", "오늘 거리가 정말 북적여요.", "今日の街はにぎやか。"],
    "街上還空空的，等著一個一個被打卡的應援。": ["The street is still empty, waiting for each support spot to be checked in.", "거리가 아직 비어 있어요. 하나씩 체크인될 응원을 기다려요.", "街はまだ空っぽ。ひとつずつチェックインされる応援を待ってる。"],
    "打卡一個類型的應援，街上就多一處景。": ["Check in one type of support and the street gets a new sight.", "한 종류의 응원을 체크인하면 거리에 볼거리가 하나 늘어요.", "ひとつの種類の応援をチェックインすると、街に新しい景色が増えるよ。"],
    "走進展覽慢慢看，每一件都想多看一眼。": ["Walking through the exhibition slowly — I want a second look at every piece.", "전시를 천천히 둘러봐요. 하나하나 다시 보고 싶어요.", "展覧会をゆっくり見て回る。どれも二度見したくなる。"],
    "展覽的燈光好舒服，捨不得這麼快出來。": ["The exhibition lighting is so soothing — I don't want to leave so soon.", "전시장 조명이 편안해서 금방 나오기 아쉬워요.", "展示の照明が心地よくて、すぐには出たくない。"],
    "快閃店排了好長的隊，我也來湊個熱鬧。": ["The pop-up store has a long line — let me join the fun.", "팝업스토어 줄이 길어요. 저도 구경하러 왔어요.", "ポップアップストアは長い行列。私も混ざってみよう。"],
    "限定周邊要搶，先看看有哪些。": ["The limited merch goes fast — let me see what's there first.", "한정 굿즈는 금방 나가요. 먼저 뭐가 있나 볼게요.", "限定グッズは争奪戦。まず何があるか見てみよう。"],
    "站在燈箱前拍一張，今天也到此一遊。": ["A photo in front of the light box — I was here today.", "라이트박스 앞에서 한 장, 오늘도 다녀갔어요.", "ライトボックスの前で一枚。今日も来たよ。"],
    "燈箱亮亮的，拍起來特別好看。": ["The light box glows — it makes for a great photo.", "라이트박스가 환해서 사진이 특히 예쁘게 나와요.", "ライトボックスが明るくて、写真がきれいに撮れる。"],
    "買杯咖啡，坐下來歇一會。": ["Grabbing a coffee and sitting down for a rest.", "커피 한 잔 사서 앉아 쉬어요.", "コーヒーを買って、座ってひと休み。"],
    "拿到杯套了，今天的咖啡特別香。": ["Got the cup sleeve — today's coffee smells extra good.", "컵 슬리브를 받았어요. 오늘 커피는 유난히 향긋해요.", "カップスリーブをゲット。今日のコーヒーはいつもより香ばしい。"],
    "抬頭看大螢幕，節拍跟著畫面一起跳。": ["Looking up at the big screen — the beat bounces along with the picture.", "큰 화면을 올려다봐요. 박자가 화면과 함께 뛰어요.", "大きな画面を見上げる。ビートが映像と一緒に跳ねる。"],
    "大螢幕在播應援影片，看到都不想走。": ["The big screen is playing a support video — I don't want to walk away.", "큰 화면에서 응원 영상이 나와서 떠나고 싶지 않아요.", "大画面で応援映像が流れてて、離れたくない。"],
    "在站牌旁等公車，順便拍張照打卡。": ["Waiting for the bus by the stop, snapping a check-in photo while I'm at it.", "정류장에서 버스를 기다리며 체크인 사진도 찍어요.", "バス停でバスを待ちながら、チェックインの写真も撮る。"],
    "站牌上貼著應援，等車也不無聊。": ["The bus stop is covered in support messages — waiting isn't boring.", "정류장에 응원이 붙어 있어서 기다려도 지루하지 않아요.", "バス停に応援が貼ってあって、待ち時間も退屈しない。"],
    "應援咖啡廳的杯套好可愛，一定要帶一個走。": ["The support café's cup sleeves are so cute — I have to take one home.", "응원 카페 컵 슬리브가 너무 귀여워요. 꼭 하나 가져갈래요.", "応援カフェのカップスリーブがかわいい。絶対持ち帰る。"],
    "排隊領杯套，慢慢等也值得。": ["Queuing for a cup sleeve — worth the wait.", "슬리브 받으려고 줄을 서요. 천천히 기다려도 아깝지 않아요.", "カップスリーブの列に並ぶ。ゆっくり待つ価値あり。"],
    "尚未開放：應援累積得夠多就會出現。": ["Not open yet — it appears once there are enough support spots.", "아직 열리지 않았어요. 응원이 충분히 쌓이면 나타나요.", "まだ開放前。応援が十分たまると登場するよ。"],
    "跨年零食桌": ["New Year's Eve snack table", "새해 전야 간식 상", "年越しのおやつテーブル"],
    "橘子和年糕，跨年一定要吃點好彩頭。": ["Tangerines and rice cake — a little good luck for New Year's Eve.", "귤과 떡, 새해 전야엔 복을 챙겨야죠.", "みかんとお餅、年越しには縁起物を。"],
    "偷拿一塊年糕，邊吃邊等倒數。": ["Sneaking a piece of rice cake while waiting for the countdown.", "떡 한 조각 몰래 집어먹으며 카운트다운을 기다려요.", "お餅をこっそり一つ、カウントダウンを待ちながら。"],
    "桌上還有一顆星星糖，留到午夜再吃。": ["There's a star candy too — saving it for midnight.", "별사탕도 하나 있어요. 자정에 먹으려고 남겨둬요.", "星のキャンディもある。真夜中までとっておこう。"],
    "跨年要吃點好彩頭，橘子配年糕。": ["Some good-luck snacks for New Year's Eve: tangerines and rice cake.", "새해 전야엔 복을 챙겨요. 귤에 떡이에요.", "年越しは縁起もの。みかんとお餅。"],
    "今年最後一頁了，捨不得又期待。": ["The last page of the year — sad to go, excited for what's next.", "올해의 마지막 장이에요. 아쉽지만 기대돼요.", "今年最後の1枚。名残惜しいけど楽しみ。"],
    "唰——撕下最後一頁，新的一年要來了！": ["Rip — the last page is gone, a new year is coming!", "찰칵— 마지막 장을 뜯었어요. 새해가 오고 있어요!", "ビリッ——最後の1枚をはがした。新しい年がやってくる！"],
    "停在窗邊看煙火，一朵接一朵。": ["Stopping by the window to watch the fireworks, one after another.", "창가에서 불꽃놀이를 구경해요. 하나씩 터져요.", "窓辺で花火を見上げる。次々に上がるよ。"],
    "抬頭看煙火，新的一年快到了。": ["Looking up at the fireworks — the new year is almost here.", "불꽃놀이를 올려다봐요. 새해가 곧 와요.", "花火を見上げる。もうすぐ新年。"],
    "今天跨年！": ["It's New Year's Eve!", "오늘은 새해 전야예요!", "今日は大みそか！"],
    "點時鐘看跨年倒數，晚上窗外有煙火。": ["Tap the clock for the countdown — fireworks outside tonight.", "시계를 눌러 카운트다운을 확인해요. 밤엔 창밖에 불꽃놀이가 있어요.", "時計をタップしてカウントダウン。夜は窓の外に花火が上がるよ。"],
    "練習室也迎接新的一年了。": ["The practice room is welcoming the new year too.", "연습실도 새해를 맞이하고 있어요.", "練習室も新しい年を迎えています。"],
    "跨年夜": ["New Year's Eve", "새해 전야", "大みそか"],
    "紀念日週": ["Anniversary week", "기념일 주간", "記念日ウィーク"],
    "出道紀念日快到了！": ["The debut anniversary is almost here!", "데뷔 기념일이 다가와요!", "デビュー記念日がもうすぐ！"],
    "小窩先掛上彩旗了。": ["Flags are already up in the room.", "방에 깃발을 먼저 달았어요.", "お部屋に旗を先に飾りました。"],
    "練習室先掛上彩旗了。": ["Flags are already up in the practice room.", "연습실에 깃발을 먼저 달았어요.", "練習室に旗を先に飾りました。"],
    "限定布置": ["Limited decor", "한정 장식", "限定デコ"],
    "生日當天": ["Birthday", "생일 당일", "誕生日当日"],
    "生日週": ["Birthday week", "생일 주간", "誕生日ウィーク"],
    "生日隔天": ["Day after birthday", "생일 다음 날", "誕生日の翌日"],
    "萬聖節": ["Halloween", "할로윈", "ハロウィン"],
    "聖誕節": ["Christmas", "크리스마스", "クリスマス"],
    "新年": ["New Year", "새해", "お正月"],
    "演唱會當天": ["Concert day", "콘서트 당일", "公演当日"],
    "演唱會前夕": ["Concert eve", "콘서트 전날", "公演前日"],
    "出道紀念日": ["Debut anniversary", "데뷔 기념일", "デビュー記念日"],
    "昨天生日！": ["Birthday was yesterday!", "어제가 생일이었어요!", "昨日は誕生日でした！"],
    "昨天的派對還有一點餘味。": ["Yesterday's party still lingers a little.", "어제의 파티 여운이 아직 남아 있어요.", "昨日のパーティーの余韻がまだ少し残っています。"],
    "昨天的氣球還沒收，捨不得。": ["The balloons from yesterday aren't taken down yet.", "어제의 풍선을 아직 못 치웠어요. 아쉬워서요.", "昨日の風船はまだ片づけてないよ。名残惜しくて。"],
    "派對散場了，氣球還留著一點餘味。": ["The party's over, but the balloons still hold a bit of the glow.", "파티는 끝났지만 풍선에 여운이 남아 있어요.", "パーティーは終わったけど、風船に余韻が残っている。"],
    "生日快到了！": ["Birthday coming up!", "생일이 다가와요!", "もうすぐ誕生日！"],
    "小窩先掛上彩旗和氣球了。": ["Flags and balloons are already up in the room.", "방에 깃발과 풍선을 먼저 달았어요.", "お部屋に旗と風船を先に飾りました。"],
    "練習室先掛上彩旗和氣球了。": ["Flags and balloons are already up in the practice room.", "연습실에 깃발과 풍선을 먼저 달았어요.", "練習室に旗と風船を先に飾りました。"],
    "氣球先綁好了，生日快到囉。": ["Balloons are tied up — the birthday is almost here.", "풍선을 미리 달아 뒀어요. 생일이 코앞이에요.", "風船を先に結んだよ。もうすぐ誕生日。"],
    "三顆氣球先綁在一起，等著慶祝生日。": ["Three balloons tied together, waiting for the birthday.", "풍선 세 개가 생일을 기다리고 있어요.", "三つの風船が、誕生日を待っています。"],
    "今天生日！": ["It's their birthday today!", "오늘은 생일이에요!", "今日は誕生日！"],
    "小窩為壽星布置好了。": ["The room is all decked out for the birthday star.", "방이 생일 주인공을 위해 꾸며졌어요.", "お部屋が主役のために飾られました。"],
    "第 1 間": ["Room 1", "방 1", "部屋 1"],
    "第 2 間": ["Room 2", "방 2", "部屋 2"],
    "第一個房間完成了！": ["The first room is complete!", "첫 번째 방 완성!", "最初のお部屋が完成！"],
    "下一個房間即將推出，敬請期待。": ["The next room is coming soon — stay tuned.", "다음 방이 곧 공개돼요. 기대해 주세요.", "次のお部屋は近日公開予定です。お楽しみに。"],
    "看看下一個房間": ["Peek at the next room", "다음 방 보러 가기", "次のお部屋を見る"],
    "晚點再說": ["Maybe later", "나중에", "あとで"],
    "新房間即將推出": ["New room coming soon", "새 방이 곧 공개돼요", "新しいお部屋は近日公開"],
    "完成第一個房間後解鎖。": ["Unlocks after you complete the first room.", "첫 번째 방을 완성하면 열려요.", "最初のお部屋を完成させると解放されます。"],
    "第一個房間已完成，新房間準備中。": ["First room complete — the new room is on its way.", "첫 번째 방 완성! 새 방을 준비하고 있어요.", "最初のお部屋は完成！新しいお部屋を準備中です。"],
    "練習室": ["Practice Room", "연습실", "練習室"],
    "練習室完成度": ["Practice room completion", "연습실 완성도", "練習室の完成度"],
    "練習室完成！": ["Practice room complete!", "연습실 완성!", "練習室が完成！"],
    "七個人站好位置了，準備開跳。": ["All seven are in position — time to dance.", "일곱 명이 자리를 잡았어요. 이제 춤출 시간!", "7人が立ち位置につきました。踊り始めよう。"],
    "點練習室裡的東西看看。暗暗的剪影是還沒解鎖的物品。": ["Tap things in the practice room. Dark silhouettes are items you haven't unlocked yet.", "연습실 안의 물건을 눌러 보세요. 어두운 실루엣은 아직 해제하지 않은 물건이에요.", "練習室のものをタップしてみよう。暗いシルエットはまだ解除していないアイテムです。"],
    "練習室也掛上彩旗了。": ["The practice room put up bunting too.", "연습실에도 깃발을 달았어요.", "練習室にもガーランドを飾りました。"],
    "練習室為壽星布置好了。": ["The practice room is all decked out for the birthday star.", "연습실이 생일 주인공을 위해 꾸며졌어요.", "練習室が主役のために飾られました。"],
    "練習室開放了，快去看看。": ["The practice room is open — go take a look.", "연습실이 열렸어요. 얼른 가 보세요.", "練習室がオープンしました。見に行ってみよう。"],
    "隊形練習中，再練一遍。": ["Running formations — one more time.", "대형 연습 중이에요. 한 번만 더요.", "フォーメーション練習中。もう一回やろう。"],
    "音響": ["Speaker", "스피커", "スピーカー"], "隊形貼紙": ["Formation marks", "대형 스티커", "立ち位置テープ"], "三腳架": ["Tripod", "삼각대", "三脚"], "白板": ["Whiteboard", "화이트보드", "ホワイトボード"],
    "水瓶": ["Water bottle", "물병", "ボトル"], "毛巾": ["Towel", "수건", "タオル"], "運動包": ["Gym bag", "스포츠백", "スポーツバッグ"], "手機架": ["Phone stand", "폰 거치대", "スマホスタンド"],
    "掛鐘": ["Wall clock", "벽시계", "壁掛け時計"], "日出窗": ["Sunrise window", "일출 창문", "朝焼けの窓"], "練習服掛架": ["Practice-wear rack", "연습복 행거", "練習着ラック"], "練習日誌": ["Practice log", "연습 일지", "練習ノート"],
    "節拍開起來，從頭再跳一次。": ["Beat's on — one more time from the top.", "비트 켜! 처음부터 한 번 더.", "ビートを流して、もう一回頭から。"],
    "站好位置，七個人一個都不能錯。": ["Hit your marks — all seven, no one out of place.", "자리에 서요. 일곱 명 모두 틀리면 안 돼요.", "立ち位置について。7人、誰も間違えないで。"],
    "錄下來，晚點再檢討。": ["Recording — we'll review it later.", "녹화해 두고 나중에 같이 모니터링해요.", "録画しておいて、あとで振り返ろう。"],
    "今天的練習曲，你猜是哪一首？": ["Today's practice song — can you guess which?", "오늘의 연습곡, 어떤 곡일까요?", "今日の練習曲、どれだと思う？"],
    "補水時間。": ["Water break.", "물 마시는 시간.", "水分補給の時間。"],
    "練到流汗，毛巾先掛這裡。": ["Sweaty already — hang the towel here.", "땀이 날 때까지 연습! 수건은 여기에 걸어 둬요.", "汗だくになるまで練習。タオルはここに。"],
    "東西都帶齊了，隨時可以出發。": ["Everything's packed — ready to go anytime.", "챙길 건 다 챙겼어요. 언제든 출발할 수 있어요.", "荷物は全部そろった。いつでも出発できるよ。"],
    "今天的運勢，順便排進練習表。": ["Today's fortune — slot it into the practice schedule.", "오늘의 운세도 연습표에 같이 넣어요.", "今日の運勢も、練習スケジュールに入れておこう。"],
    "還沒走嗎？再一遍就好。": ["Still here? Just one more run.", "아직 안 갔어요? 딱 한 번만 더요.", "まだ帰らないの？あと1回だけ。"],
    "不知不覺，天亮了。": ["Without noticing, it's already dawn.", "어느새 날이 밝았어요.", "気づけば、夜が明けていた。"],
    "七件，一件不少。": ["Seven outfits — none missing.", "일곱 벌, 한 벌도 빠지지 않았어요.", "7着、1着も欠けていません。"],
    "今天也有好好練習。": ["Practiced hard again today.", "오늘도 열심히 연습했어요.", "今日もちゃんと練習したよ。"],
    "練習課表": ["Practice schedule", "연습 시간표", "練習スケジュール"],
    "這週的課表排得滿滿的，照表操課。": ["This week's schedule is packed — follow it to the letter.", "이번 주 시간표가 빽빽해요. 표대로 연습해요.", "今週のスケジュールはぎっしり。表のとおりに練習しよう。"],
    "慢慢晃來晃去，心情不錯。": ["Wandering around slowly, in a good mood.", "느긋하게 돌아다니는 중, 기분이 좋아요.", "のんびり歩き回り中。ご機嫌です。"],
    "東看看西看看，巡視自己的小窩。": ["Looking around, checking on the room.", "여기저기 둘러보며 방을 살펴보는 중.", "あちこち見て回って、お部屋をパトロール中。"],
    "突然想跑一下！": ["Suddenly feels like running!", "갑자기 뛰고 싶어졌어요!", "急に走りたくなった！"],
    "小跑步中，小心別撞到家具。": ["Jogging — careful not to bump into the furniture.", "총총 달리는 중, 가구에 부딪히지 않게 조심!", "小走り中。家具にぶつからないでね。"],
    "盯著球鞋看，好想出門走走。": ["Staring at the sneakers, itching to go out for a walk.", "운동화를 바라보며 밖에 나가 걷고 싶어 해요.", "スニーカーを見つめて、お出かけしたくなってる。"],
    "看著球鞋發呆，想起下一場應援。": ["Spacing out at the sneakers, thinking of the next cheering.", "운동화를 보며 멍하니 다음 응원을 떠올려요.", "スニーカーを眺めて、次の応援に思いをはせてる。"],
    "在書架前翻書，看得入迷。": ["Flipping through a book at the shelf, totally absorbed.", "책장 앞에서 책을 넘기며 푹 빠졌어요.", "本棚の前で本をめくって、夢中になってる。"],
    "挑了一本書，安靜閱讀中。": ["Picked a book and reading quietly.", "책 한 권을 골라 조용히 읽는 중.", "本を1冊選んで、静かに読書中。"],
    "在日曆前研究日子，數著還有幾天。": ["Studying the calendar, counting the days.", "달력 앞에서 날짜를 세어 보는 중.", "カレンダーの前で、あと何日か数えてる。"],
    "唰——撕掉一頁日曆。": ["Rip — one calendar page torn off.", "쭉— 달력 한 장을 뜯었어요.", "ぴりっ——カレンダーを1枚めくった。"],
    "正在休息，zZ…": ["Taking a rest, zZ…", "쉬는 중이에요, zZ…", "お休み中、zZ…"],
    "打瞌睡中，夜深了。": ["Dozing off — it's late.", "꾸벅꾸벅 졸아요. 밤이 깊었어요.", "うとうと中。夜も更けたね。"],
    "趴著睡著了，zzZ…": ["Fell asleep, zzZ…", "엎드려 잠들었어요, zzZ…", "うたた寝しちゃった、zzZ…"],
    "在練習室裡熱身走動。": ["Warming up, walking around the studio.", "연습실을 돌아다니며 몸을 푸는 중.", "練習室でウォームアップ中。"],
    "一邊走一邊默默數拍子。": ["Quietly counting beats while walking.", "걸으면서 조용히 박자를 세는 중.", "歩きながらこっそりカウント中。"],
    "跳舞中，節拍跟上！": ["Dancing — keep up with the beat!", "춤추는 중, 박자를 놓치지 마요!", "ダンス中。ビートに乗って！"],
    "練舞練到停不下來。": ["Practicing nonstop — can't stop now.", "연습에 빠져서 멈출 수가 없어요.", "夢中で踊って、止まらない。"],
    "跳完舞，先擦擦汗。": ["Done dancing — time to wipe off the sweat.", "춤을 추고 나서 땀부터 닦아요.", "踊り終わったら、まずは汗を拭こう。"],
    "拿毛巾擦擦臉，等一下再來一遍。": ["Wiping the face with the towel — one more run in a bit.", "수건으로 얼굴을 닦아요. 조금 있다 한 번 더!", "タオルで顔を拭いて、あとでもう一回。"],
    "咕嚕咕嚕，補充水分。": ["Gulp, gulp — rehydrating.", "꿀꺽꿀꺽, 수분 보충 중.", "ごくごく、水分補給。"],
    "喝口水，體力補滿。": ["A sip of water — energy refilled.", "물 한 모금, 체력 충전!", "水を一口飲んで、体力回復。"],
    "在練習日誌上寫下今天的進度。": ["Writing today's progress in the practice log.", "연습 일지에 오늘의 진도를 적는 중이에요.", "練習ノートに今日の進み具合を書き込み中。"],
    "翻開日誌，核對今天練了幾遍。": ["Flipping open the log to check how many runs we did today.", "일지를 펴서 오늘 몇 번 연습했는지 확인해요.", "ノートを開いて、今日は何回練習したか確認中。"],
    "一筆一筆記下來，天天都不間斷。": ["Jotting it down bit by bit — not a single day missed.", "한 줄 한 줄 적어요. 하루도 빠짐없이.", "一つずつ書き留めて、毎日欠かさず。"],
    "對著三腳架擺姿勢，看鏡頭！": ["Striking a pose for the tripod — look at the camera!", "삼각대 앞에서 포즈 중, 카메라를 봐요!", "三脚の前でポーズ。カメラを見て！"],
    "練習告一段落，大家先離開。": ["Practice is done for now — everyone heads out.", "연습이 끝나서 다들 나가요.", "練習は一区切り。みんなで退室。"],
    "新一輪練習，大家就位。": ["New round of practice — everyone to your spots.", "새 연습 시작, 다들 자리로!", "新しい練習、みんな位置について。"],
    "去喝口水，馬上回來。": ["Off for a sip of water — back in a sec.", "물 한 모금 마시고 금방 올게요.", "ちょっと水を飲んでくる。すぐ戻るよ。"],
    "拿毛巾擦擦汗，再回去跳。": ["Grabbing the towel to wipe off sweat, then back to dancing.", "수건으로 땀 닦고 다시 춤추러 갈게요.", "タオルで汗を拭いて、また踊りに戻るよ。"],
    "七人隊形": ["Seven-member formation", "일곱 멤버 대형", "7人フォーメーション"],
    "排成一排，整整齊齊。": ["Lined up in a row, neat and tidy.", "한 줄로 나란히, 가지런히 섰어요.", "一列に並んで、きれいにそろった。"],
    "拉成弧形，中間的往前站。": ["Curved into an arc, the middle steps forward.", "호를 그리며 가운데가 앞으로 나왔어요.", "弧を描いて、真ん中が前に出た。"],
    "高低交錯，換成錯位隊形。": ["Switching to a staggered high-low formation.", "높낮이를 엇갈리게 바꾼 대형이에요.", "高低をずらした、互い違いの隊形に。"],
    "排成斜線，一階一階往上。": ["Lined up on a diagonal, stepping up one by one.", "대각선으로 한 칸씩 올라가요.", "斜めに並んで、一段ずつ上がっていく。"],
    "再點一次，去抽今天的幸運籤": ["Tap again to go draw today's fortune", "한 번 더 누르면 오늘의 운세를 뽑으러 가요", "もう一度タップして、今日のおみくじを引きに行こう"],
    "再點一次，去猜下一場的歌單": ["Tap again to guess the next setlist", "한 번 더 누르면 다음 공연 셋리스트를 예측하러 가요", "もう一度タップして、次のセットリストを予想しに行こう"],
    "再點一次，去玩應援遊戲": ["Tap again to play the fanchant game", "한 번 더 누르면 응원 게임을 하러 가요", "もう一度タップして、応援ゲームを遊びに行こう"],
    "今天已經抽過籤了，明天再來搖一搖。": ["You've already drawn today — shake it again tomorrow.", "오늘은 이미 뽑았어요. 내일 또 흔들어 봐요.", "今日はもう引きました。また明日振ってみてね。"],
    "今天是萬聖節！": ["It's Halloween!", "오늘은 할로윈이에요!", "今日はハロウィン！"],
    "小窩也掛上南瓜旗了。": ["The room put up pumpkin bunting too.", "방에도 호박 깃발을 달았어요.", "お部屋にもカボチャのガーランドを飾りました。"],
    "練習室也掛上南瓜旗了。": ["The practice room put up pumpkin bunting too.", "연습실에도 호박 깃발을 달았어요.", "練習室にもカボチャのガーランドを飾りました。"],
    "聖誕快樂！": ["Merry Christmas!", "메리 크리스마스!", "メリークリスマス！"],
    "中秋節快樂！": ["Happy Mid-Autumn Festival!", "즐거운 추석 보내세요!", "中秋節おめでとう！"],
    "小窩也布置好中秋節的柚子和月餅了。": ["The room has pomelo and mooncakes for Mid-Autumn too.", "방에도 추석 맞이로 유자와 월병을 놓았어요.", "お部屋にも中秋節のブンタンと月餅を飾りました。"],
    "練習室也布置好中秋節的柚子和月餅了。": ["The practice room has pomelo and mooncakes for Mid-Autumn too.", "연습실에도 추석 맞이로 유자와 월병을 놓았어요.", "練習室にも中秋節のブンタンと月餅を飾りました。"],
    "小窩也布置好聖誕裝飾了。": ["The room is decked out for Christmas too.", "방도 크리스마스 장식으로 꾸며졌어요.", "お部屋もクリスマスの飾りつけをしました。"],
    "練習室也布置好聖誕裝飾了。": ["The practice room is decked out for Christmas too.", "연습실도 크리스마스 장식으로 꾸며졌어요.", "練習室もクリスマスの飾りつけをしました。"],
    "新年快樂！": ["Happy New Year!", "새해 복 많이 받으세요!", "あけましておめでとう！"],
    "小窩也掛上新年彩旗了。": ["The room put up New Year bunting too.", "방에도 새해 깃발을 달았어요.", "お部屋にもお正月のガーランドを飾りました。"],
    "練習室也掛上新年彩旗了。": ["The practice room put up New Year bunting too.", "연습실에도 새해 깃발을 달았어요.", "練習室にもお正月のガーランドを飾りました。"],
    /* 小人主動說的話（talkLine） */
    "早安！今天也要元氣滿滿。": ["Good morning! Let's have an energetic day.", "좋은 아침! 오늘도 힘차게 가요.", "おはよう！今日も元気にいこう。"],
    "中午了，有好好吃飯嗎？": ["It's noon — did you eat properly?", "점심시간이에요. 밥은 잘 챙겨 먹었어요?", "お昼だよ。ちゃんとごはん食べた？"],
    "下午了，喝口水休息一下吧。": ["It's afternoon — have some water and take a short break.", "오후예요. 물 한 모금 마시고 잠깐 쉬어요.", "午後だね。水を飲んで、ちょっと休もう。"],
    "晚上好，今天過得怎麼樣？": ["Good evening — how was your day?", "좋은 저녁이에요. 오늘 하루 어땠어요?", "こんばんは。今日はどんな一日だった？"],
    "這麼晚了，早點休息，晚安。": ["It's so late — get some rest soon. Good night.", "벌써 이렇게 늦었어요. 일찍 쉬어요, 잘 자요.", "もうこんなに遅い。早めに休んでね、おやすみ。"],
    "房間還有好多空位，多打卡就會有新東西。": ["Lots of room left — check in more and new things will show up.", "방에 빈자리가 많아요. 체크인하면 새 물건이 생겨요.", "お部屋はまだ空きがいっぱい。チェックインすると新しいものが増えるよ。"],
    "小窩越來越熱鬧了，謝謝你一直來。": ["The room is getting livelier — thanks for always coming by.", "방이 점점 북적여요. 계속 와 줘서 고마워요.", "お部屋がだんだん賑やかになってきた。いつも来てくれてありがとう。"],
    "小窩完成了，我最喜歡這裡了。": ["The room is all done — this is my favorite place.", "방이 완성됐어요. 저는 여기가 제일 좋아요.", "お部屋が完成したね。ここがいちばん好き。"],
    "好像有新東西耶，點閃閃的星星看看。": ["Looks like there's something new — tap the sparkly star!", "새 물건이 생긴 것 같아요. 반짝이는 별을 눌러 봐요!", "新しいものがあるみたい。キラキラの星をタップしてみて！"],
    "今天還沒抽籤喔，籤筒在等你。": ["You haven't drawn a fortune today — the cup is waiting for you.", "오늘은 아직 운세를 안 뽑았어요. 운세 통이 기다리고 있어요.", "今日はまだおみくじを引いてないよ。筒が待ってるよ。"],
    "有檯燈在，晚上也不怕黑。": ["With the lamp on, the night isn't scary.", "스탠드가 있으니 밤에도 무섭지 않아요.", "ライトがあるから、夜も怖くないよ。"],
    "今天也辛苦了，有你在真好。": ["You did great today — I'm glad you're here.", "오늘도 수고했어요. 함께 있어서 좋아요.", "今日もおつかれさま。あなたがいてくれて嬉しい。"],
    "記得多喝水，也要好好休息喔。": ["Remember to drink water and get some rest.", "물 많이 마시고 푹 쉬는 것도 잊지 마세요.", "水をたくさん飲んで、ちゃんと休んでね。"],
    "今天有打卡了嗎？一起去看看應援吧。": ["Did you check in today? Let's go see the fan projects.", "오늘 체크인했어요? 같이 응원 보러 가요.", "今日はチェックインした？一緒に応援を見に行こう。"],
    "今天也一起加油吧！": ["Let's do our best again today!", "오늘도 같이 힘내요!", "今日も一緒にがんばろう！"],
    "要不要一起聽歌？": ["Want to listen to some music together?", "같이 노래 들을래요?", "一緒に音楽を聴かない？"],
    /* 小人和已解鎖物品的互動（CAPS 的 tube／cab／water／peek／decal） */
    "晃了晃籤筒，不知道今天會抽到誰。": ["Gave the fortune cup a shake — who will it be today?", "운세 통을 흔들어 봐요. 오늘은 누가 나올까?", "おみくじ筒を振ってみた。今日は誰が出るかな？"],
    "籤筒搖得喀啦喀啦響。": ["The fortune cup rattles away.", "운세 통이 달그락달그락 소리를 내요.", "おみくじ筒がカラカラ鳴ってる。"],
    "打開收納櫃翻了翻，說過的話都好好收著。": ["Rummaged through the cabinet — every promise is kept safe inside.", "수납장을 열어 보니 약속한 건 전부 잘 보관돼 있어요.", "収納棚を開けてみた。約束したものは全部ちゃんとしまってある。"],
    "櫃子裡整整齊齊，什麼都沒少。": ["Everything in the cabinet is neat and nothing's missing.", "수납장 안이 가지런해요. 빠진 게 하나도 없어요.", "棚の中はきちんと整っていて、何も欠けていない。"],
    "幫盆栽澆了點水，葉子都挺起來了。": ["Watered the plant — its leaves perked right up.", "화분에 물을 줬더니 잎이 쭉 폈어요.", "鉢植えに水をあげたら、葉っぱがぴんと元気に。"],
    "盆栽沙沙搖，看起來心情不錯。": ["The plant rustles, looking pretty happy.", "화분이 살랑살랑, 기분이 좋아 보여요.", "鉢植えがさわさわ揺れて、ご機嫌みたい。"],
    "湊近水晶球瞧了瞧，好像有光在閃。": ["Leaned in to the crystal ball — something's glimmering.", "수정구에 가까이 다가가 보니 뭔가 반짝여요.", "水晶玉に顔を近づけると、何かがきらりと光った。"],
    "水晶球裡的光轉啊轉，看得入迷了。": ["Light swirls inside the crystal ball — totally mesmerized.", "수정구 속 빛이 빙글빙글, 넋을 놓고 봐요.", "水晶玉の中の光がくるくる回って、つい見とれちゃう。"],
    "牆上的七個人排排站，好像也在看我。": ["The seven on the wall stand in a row — they seem to be looking back.", "벽 위의 일곱 명이 나란히 서서 저를 보는 것 같아요.", "壁の七人が並んで、こっちを見てるみたい。"],
    "數一數，七個人一個都不少。": ["Counting them up — all seven are here.", "세어 보니 일곱 명 모두 있어요.", "数えてみたら、七人ちゃんと全員いる。"],
    /* 時鐘整點／檯燈／籤筒提醒（CAPS 的 tubeR／lread／loff／lsl／lon） */
    "今天還沒抽籤喔，點一下籤筒去抽吧！": ["You haven't drawn today — tap the fortune cup to go draw!", "오늘은 아직 안 뽑았어요. 운세 통을 눌러서 뽑아 봐요!", "今日はまだ引いてないよ。おみくじ筒をタップして引いてみよう！"],
    "籤筒搖呀搖，今天的幸運籤在等你。": ["The cup keeps rattling — today's lucky draw is waiting.", "운세 통이 달그락달그락, 오늘의 행운 운세가 기다리고 있어요.", "筒がカラカラ鳴ってる。今日のラッキーおみくじが待ってるよ。"],
    "在檯燈下看書，夜晚特別安靜。": ["Reading under the lamp — the night is so quiet.", "스탠드 아래에서 책을 읽어요. 밤이 정말 고요해요.", "ライトの下で読書。夜はとても静か。"],
    "燈光暖暖的，書也看得特別專心。": ["The warm light makes it easy to focus on the book.", "불빛이 따뜻해서 책에 더 집중돼요.", "あたたかい光で、本にも集中できる。"],
    "把檯燈關了，今天先睡吧。": ["Switched off the lamp — time to sleep.", "스탠드를 끄고 이제 자러 가요.", "ライトを消して、今日はもう寝よう。"],
    "燈關了，小人睡著了。": ["Lights out — fast asleep.", "불을 끄고 스르르 잠들었어요.", "電気を消して、すやすや眠ってる。"],
    "睡不著，又把檯燈打開了。": ["Can't sleep — turned the lamp back on.", "잠이 안 와서 스탠드를 다시 켰어요.", "眠れなくて、またライトをつけた。"]
  };
  var LI = { en: 0, ko: 1, ja: 2 };
  function lang() {
    var l = (document.documentElement.lang || "zh").slice(0, 2);
    return l === "zh" ? "zh" : l;
  }
  function t(zh) {
    var L = lang(), v = LT[zh];
    return L !== "zh" && v && v[LI[L]] ? v[LI[L]] : zh;
  }
  /* 跨年夜（12/31）：窗外夜晚不論完成度都放煙火、放得比較密，點時鐘改成跨年倒數。預覽：網址加 ?preview=nye（倒數照現在的時間算到午夜） */
  function isNye() {
    var d = new Date();
    return PV === "nye" || (d.getMonth() === 11 && d.getDate() === 31) || nyeAfter();
  }
  /* 跨過午夜之後的 10 分鐘（1/1 00:00–00:09）：還算跨年夜，煙火、零食桌都還在；00:00 小儀式也是在這段時間放 */
  function nyeAfter() {
    var d = new Date();
    return d.getMonth() === 0 && d.getDate() === 1 && d.getHours() === 0 && d.getMinutes() < 10;
  }
  /* 節日代號（給「節日第一次開啟」用）：萬聖節 hw、聖誕 xmas、新年 ny、情人節 vd、中秋 mid、跨年夜 nye；不是這些節日就回傳空字串 */
  function festKey() {
    var k = seasonKind();
    if (k === "hw" || k === "xmas" || k === "ny" || k === "vd" || k === "mid") return k;
    return isNye() && !k ? "nye" : "";
  }
  /* 這個節日今年有沒有打過招呼了（localStorage: room-fest，{節日代號: 年份}） */
  function festSeen(k) {
    try { var f = JSON.parse(localStorage.getItem("room-fest") || "{}") || {}; return f[k] === new Date().getFullYear(); } catch (e) { return false; }
  }
  function festMark(k) {
    try { var f = JSON.parse(localStorage.getItem("room-fest") || "{}") || {}; f[k] = new Date().getFullYear(); localStorage.setItem("room-fest", JSON.stringify(f)); } catch (e) {}
  }
  function nyeSay() {
    if (nyeAfter()) { var LA = lang(); return LA === "en" ? "Happy New Year! A brand-new year has begun." : LA === "ko" ? "새해 복 많이 받으세요! 새로운 한 해가 시작됐어요." : LA === "ja" ? "あけましておめでとう！新しい年が始まったよ。" : "新年快樂！新的一年開始了。"; }
    var d = new Date(), L = lang(), tot = Math.max(1, Math.ceil((new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) - d) / 60000)), h = Math.floor(tot / 60), m = tot % 60;
    if (L === "en") return h > 0 ? "New Year countdown: " + h + "h " + m + "m to go." : "New Year countdown: only " + m + " min left!";
    if (L === "ko") return h > 0 ? "새해까지 " + h + "시간 " + m + "분 남았어요." : "새해까지 " + m + "분 남았어요!";
    if (L === "ja") return h > 0 ? "新年まであと" + h + "時間" + m + "分。" : "新年まであと" + m + "分！";
    return h > 0 ? "跨年倒數：還有 " + h + " 小時 " + m + " 分。" : "跨年倒數：只剩 " + m + " 分鐘了！";
  }
  function clockSay() {
    if (isNye()) return nyeSay();
    var d = new Date(), L = lang(), M = d.getMonth() + 1, D = d.getDate(), W = d.getDay(), hm = p2(d.getHours()) + ":" + p2(d.getMinutes());
    if (L === "en") return "Today is " + ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][W] + ", " + M + "/" + D + ". It's " + hm + " now.";
    if (L === "ko") return "오늘은 " + M + "월 " + D + "일(" + "일월화수목금토".charAt(W) + ")이에요. 지금은 " + hm + "예요.";
    if (L === "ja") return "今日は" + M + "月" + D + "日（" + "日月火水木金土".charAt(W) + "）、今は" + hm + "です。";
    return "今天是 " + M + "/" + D + "（週" + "日一二三四五六".charAt(W) + "），現在 " + hm + "。";
  }
  /* 整點報時：整點後小人第一次經過時鐘下方時，下方文字改講這句（只報幾點，不報分鐘） */
  function chimeSay() {
    var h = new Date().getHours(), L = lang();
    if (L === "en") return "Chime! It's " + p2(h) + ":00 now.";
    if (L === "ko") return "정각이에요. 지금은 " + h + "시예요.";
    if (L === "ja") return "ちょうど" + h + "時だよ。";
    return "整點報時：現在 " + h + " 點囉。";
  }
  /* 練習室的掛鐘：報真實時間，再依時段接一句練習室的話（跨年夜同小窩，改報跨年倒數） */
  function practiceClockSay() {
    if (isNye()) return nyeSay();
    var d = new Date(), L = lang(), h = d.getHours(), hm = p2(h) + ":" + p2(d.getMinutes()), k = h < 5 ? 0 : h < 12 ? 1 : h < 18 ? 2 : 3;
    var Z = ["現在 " + hm + "，還沒走嗎？再一遍就好。", "現在 " + hm + "，早起練習，先把暖身做好。", "現在 " + hm + "，下午的練習時間，記得補水。", "現在 " + hm + "，晚上了，再一遍就收工。"];
    var E = ["It's " + hm + " now. Still here? Just one more run.", "It's " + hm + " now. Early practice, warm up first.", "It's " + hm + " now. Afternoon practice, remember to drink water.", "It's " + hm + " now. Evening already, one more run and we wrap up."];
    var K = ["지금은 " + hm + "예요. 아직 안 갔어요? 한 번만 더요.", "지금은 " + hm + "예요. 일찍 연습하러 왔네요, 먼저 몸부터 풀어요.", "지금은 " + hm + "예요. 오후 연습 시간, 물 마시는 것 잊지 마요.", "지금은 " + hm + "예요. 저녁이에요, 한 번만 더 하고 마무리해요."];
    var J = ["今は" + hm + "です。まだ帰らないの？あと1回だけ。", "今は" + hm + "です。朝練、まずはウォームアップから。", "今は" + hm + "です。午後の練習、水分補給を忘れずに。", "今は" + hm + "です。もう夜、あと1回やったら終わりにしよう。"];
    return (L === "en" ? E : L === "ko" ? K : L === "ja" ? J : Z)[k];
  }
  /* 小人的動作 → 下方那行文字。每個動作有幾句，進入動作時隨機挑一句（第 1 句是「點一下換人」的提示，本命固定時不用） */
  var CAPS = {
    tube: ["晃了晃籤筒，不知道今天會抽到誰。", "籤筒搖得喀啦喀啦響。"],
    cab: ["打開收納櫃翻了翻，說過的話都好好收著。", "櫃子裡整整齊齊，什麼都沒少。"],
    water: ["幫盆栽澆了點水，葉子都挺起來了。", "盆栽沙沙搖，看起來心情不錯。"],
    peek: ["湊近水晶球瞧了瞧，好像有光在閃。", "水晶球裡的光轉啊轉，看得入迷了。"],
    decal: ["牆上的七個人排排站，好像也在看我。", "數一數，七個人一個都不少。"],
    tubeR: ["今天還沒抽籤喔，點一下籤筒去抽吧！", "籤筒搖呀搖，今天的幸運籤在等你。"],
    lread: ["在檯燈下看書，夜晚特別安靜。", "燈光暖暖的，書也看得特別專心。"],
    loff: ["把檯燈關了，今天先睡吧。"],
    lsl: ["燈關了，小人睡著了。"],
    lon: ["睡不著，又把檯燈打開了。"],
    blow: ["捧著小蛋糕許願，然後一口氣吹熄蠟燭。"],
    out: ["帶著手燈出門，去現場囉！"],
    back: ["回來了，還在回味演唱會的感動。"],
    outG: ["先讓出位置，等一下再回來。"],
    backG: ["回來了，繼續待在小窩。"],
    bdb: ["看著氣球飄呀飄，心情也輕飄飄的。", "伸手碰了碰氣球，氣球晃了起來。"],
    bdg: ["停在禮物前面，猜猜裡面是什麼。", "看著壽星的禮物，也跟著開心起來。"],
    posterE: ["抬頭看著海報，明天就要見面了。", "看著海報，心跳已經開始加速。"],
    posterT: ["看著海報，今天就是正式演出！", "海報上的七個人，今天終於要見面了！"],
    pack: ["整理行李：票、手燈、行動電源，都放進包包了。", "票帶了嗎？手燈充飽了嗎？再確認一次！"],
    pop: ["拉開彩帶砲——砰！紙花滿天飛。"],
    walk: ["在小窩裡散步。", "慢慢晃來晃去，心情不錯。", "東看看西看看，巡視自己的小窩。"],
    run: ["突然想跑一下！", "小跑步中，小心別撞到家具。"],
    look: ["盯著球鞋看，好想出門走走。", "看著球鞋發呆，想起下一場應援。"],
    read: ["在書架前翻書，看得入迷。", "挑了一本書，安靜閱讀中。"],
    cal: ["在日曆前研究日子，數著還有幾天。"],
    tear: ["唰——撕掉一頁日曆。"],
    calN: ["今年最後一頁了，捨不得又期待。"],
    tearN: ["唰——撕下最後一頁，新的一年要來了！"],
    snack: ["跨年要吃點好彩頭，橘子配年糕。", "偷拿一塊年糕，邊吃邊等倒數。"],
    fwatch: ["停在窗邊看煙火，一朵接一朵。", "抬頭看煙火，新的一年快到了。"],
    mcake: ["切一塊月餅，蛋黃餡的最香。", "偷咬一口月餅，邊吃邊賞月。"],
    mwatch: ["停在窗邊賞月，今晚的月亮好圓。", "抬頭看圓圓的月亮，團圓的日子。"],
    hum: ["邊揮手燈邊哼歌，今天的演唱會還在耳邊。", "揮著手燈哼著歌，回味剛剛的現場。"],
    hbg: ["七個人給的紅包，收到了！新年快樂。", "收到大家的紅包，開心到想跳一下。"],
    greethw: ["萬聖節快樂！不給糖就搗蛋～", "今天是萬聖節，小窩也變得有點神秘。", "糖果準備好了嗎？小心南瓜燈在看你。", "南瓜燈亮起來吧，萬聖節的夜晚才有趣。"],
    greetxmas: ["聖誕快樂！今年也要一起過節。", "叮叮噹，小窩的聖誕節開始了。", "樹下的禮物好像比去年多了一個。", "聖誕夜的願望，已經悄悄許好了。"],
    greetny: ["新年快樂！新的一年也要在一起。", "新年到，紅包和好運都要收好。", "恭喜發財，今年也要一起加油！", "新的一年，願望和應援都滿滿的。"],
    greetvd: ["情人節快樂！把滿滿的愛心送給你。", "今天的小窩粉粉的，心情也是。", "巧克力和玫瑰都準備好了，等你來。", "把想說的話，寫進今天的情書裡。"],
    greetmid: ["中秋節快樂！今晚的月亮好圓。", "月餅切好了，等月亮升起來一起吃。", "圓圓的月亮，圓圓的團圓，真好。", "抬頭看看月亮，大家都在同一片月光下。"],
    greetnye: ["跨年快樂！等一下一起倒數。", "今年的最後一天，辛苦了，也謝謝一路陪著。", "零食準備好了，一起等煙火吧。", "倒數之前，先許個願望好不好？"],
    scare: ["哇！南瓜突然亮起來，嚇我一跳！", "嚇死我了，原來是南瓜燈。", "咦？它剛剛是不是瞪我？"],
    sleep: ["正在休息，zZ…", "打瞌睡中，夜深了。", "趴著睡著了，zzZ…"],
    w2: ["在練習室裡熱身走動。", "一邊走一邊默默數拍子。"],
    w3: ["一邊走一邊看街上的應援。", "路過的人都在拍照打卡。", "今天的街上好熱鬧。"],
    w3e: ["街上還空空的，等著一個一個被打卡的應援。", "打卡一個類型的應援，街上就多一處景。"],
    sr_sexh: ["走進展覽慢慢看，每一件都想多看一眼。", "展覽的燈光好舒服，捨不得這麼快出來。"],
    sr_skm: ["快閃店排了好長的隊，我也來湊個熱鬧。", "限定周邊要搶，先看看有哪些。"],
    sr_slb: ["站在燈箱前拍一張，今天也到此一遊。", "燈箱亮亮的，拍起來特別好看。"],
    sr_scf: ["買杯咖啡，坐下來歇一會。", "拿到杯套了，今天的咖啡特別香。"],
    sr_sled: ["抬頭看大螢幕，節拍跟著畫面一起跳。", "大螢幕在播應援影片，看到都不想走。"],
    sr_sbus: ["在站牌旁等公車，順便拍張照打卡。", "站牌上貼著應援，等車也不無聊。"],
    sr_scafe: ["應援咖啡廳的杯套好可愛，一定要帶一個走。", "排隊領杯套，慢慢等也值得。"],
    dn: ["跳舞中，節拍跟上！", "練舞練到停不下來。"],
    pose: ["對著三腳架擺姿勢，看鏡頭！"],
    wipe: ["跳完舞，先擦擦汗。", "拿毛巾擦擦臉，等一下再來一遍。"],
    drink: ["咕嚕咕嚕，補充水分。", "喝口水，體力補滿。"],
    plog: ["在練習日誌上寫下今天的進度。", "翻開日誌，核對今天練了幾遍。", "一筆一筆記下來，天天都不間斷。"],
    candy: ["蹲在地上撿糖果，偷吃一顆。", "不給糖就搗蛋，先吃一顆再說。"],
    broom: ["拿起掃帚，假裝要飛起來。", "把掃帚扶正，女巫帽也戴好了。"],
    choc: ["偷偷拿了一顆巧克力，甜甜的。", "情人節的巧克力，捨不得一口吃完。"],
    cookie: ["偷偷咬一口餅乾，再喝口牛奶。", "這是給聖誕老人的……少一片應該沒關係。"],
    gift: ["搖搖禮物盒，猜猜裡面是什麼。", "蹲在樹下看禮物，好期待。"],
    sock: ["踮腳檢查聖誕襪裡有沒有禮物。", "把襪子拉平整，掛得漂漂亮亮。"],
    hb: ["收到紅包，開心到想跳一下。", "把紅包收進口袋，新年快樂！"],
    ingot: ["抱起金元寶掂掂重量，沉甸甸的。", "金元寶擦得亮晶晶，討個好彩頭。"],
    rose: ["湊近聞了聞玫瑰，甜甜的香味。", "幫玫瑰擺正，花瓣紅得很漂亮。"],
    letter: ["拿起情書慢慢讀，臉都紅了。", "把情書捧在胸前，心跳好快。"],
    chocL: ["最後一顆了，捨不得吃，還是吃掉了。", "偷偷拿走最後一顆，盒子空空的了。"],
    chocE: ["盒子空了，只剩下包裝紙。", "巧克力被吃光了，下次要記得留一顆。"],
    write: ["在桌邊寫情書，筆尖沙沙響。", "寫了又擦，最後還是寫下最想說的話。"],
    mailgo: ["把信封收好，走去郵筒。"],
    mail: ["把情書投進郵筒，希望能順利寄到。", "叮咚——信寄出去了，心跳好快。"]
  };
  var CAPF = ["排成一排，整整齊齊。", "拉成弧形，中間的往前站。", "高低交錯，換成錯位隊形。", "排成斜線，一階一階往上。"];
  /* 彩蛋小窩開關：跟「藝人同款足跡」一樣的鎖法。
     ROOM_PUBLIC=false＝對一般使用者鎖起來（首頁入口灰色＋鎖頭＋「新功能／暫未開放」）；要正式開放就改成 true，並把 sw.js 的 VER 換一個值。
     自己預覽：用 ?preview=room 開一次，這台裝置就會解鎖（存在 localStorage: room-preview）；用 ?preview=off 關掉預覽 */
  var ROOM_PUBLIC = false;
  var ROOM_OPEN = ROOM_PUBLIC || (function () {
    try {
      var v = PV;
      if (PVL.indexOf("room1all") >= 0 || PVL.indexOf("room2all") >= 0 || PVL.indexOf("room3all") >= 0) return true;
      if (v === "room" || v === "room2" || v === "room3") localStorage.setItem("room-preview", "1");
      if (v === "room3") localStorage.setItem("room3-preview", "1");
      if (v === "room2") localStorage.setItem("room2-preview", "1");
      else if (v === "off") { localStorage.removeItem("room-preview"); localStorage.removeItem("room2-preview"); localStorage.removeItem("room3-preview"); }
      if (v === "613" || v === "613w" || v === "613a" || v === "nye" || v === "tour" || v === "eve" || v === "room2all" || v === "room1all" || v === "room3all" || v === "hw" || v === "xmas" || v === "ny" || v === "vd" || v === "mid" || v.indexOf("bd-") === 0 || v.indexOf("bdw-") === 0 || v.indexOf("bda-") === 0) return true; /* 只預覽 6/13、成員生日：這次直接開放小窩，不用先 ?preview=room，也不存任何東西 */
      return localStorage.getItem("room-preview") === "1";
    } catch (e) { return false; }
  })();
  /* 練習室（第 2 間）開關。
     ROOM2_PUBLIC=false＝一般使用者看到的第 2 間還是上鎖畫面；要正式開放就改成 true（開放後仍要先完成第 1 間才進得去），並把 sw.js 的 VER 換一個值。
     自己預覽：用 ?preview=room2 開一次，這台裝置就能直接進練習室（存在 localStorage: room2-preview，也會一併解鎖小窩入口）；
     ?preview=room2all 只在這次開啟把練習室 13 件物品全部當成已解鎖（含七人隊形），不存任何東西；?preview=off 會把兩個預覽都關掉 */
  var ROOM2_PUBLIC = false;
  var P2ALL = PVL.indexOf("room2all") >= 0;
  /* ?preview=room1all：只在這次開啟把第 1 間（彩蛋小窩）18 件物品全部當成已獲得，不存任何東西（跟 room2all 一樣的做法） */
  var P1ALL = PVL.indexOf("room1all") >= 0;
  var ROOM2_PV = P2ALL || PV === "room2" || (function () {
    try { return localStorage.getItem("room2-preview") === "1"; } catch (e) { return false; }
  })();
  /* 應援街區（第 3 間）開關，用法跟練習室一樣。
     ROOM3_PUBLIC=false＝一般使用者還看不到第 3 間（要正式開放就改成 true，開放後仍要先完成第 2 間，並把 sw.js 的 VER 換一個值）。
     自己預覽：用 ?preview=room3 開一次，這台裝置就能直接進街區（存在 localStorage: room3-preview，也會一併解鎖小窩入口）；
     ?preview=room3all 只在這次開啟把街區 10 件物品全部當成已解鎖，不存任何東西；?preview=off 會把所有預覽都關掉 */
  var ROOM3_PUBLIC = false;
  var P3ALL = PVL.indexOf("room3all") >= 0;
  var ROOM3_PV = P3ALL || PV === "room3" || (function () {
    try { return localStorage.getItem("room3-preview") === "1"; } catch (e) { return false; }
  })();
  /* 房間是否開放，統一由下面 ROOMS 區塊的 roomOpen(i, st) 判斷（ROOM2_PUBLIC／ROOM2_PV／P2ALL 現在只是第 2 間在 ROOMS 裡的設定值） */

  if (!ROOM_OPEN) {
    var rb = document.getElementById("roomBtn");
    if (rb) {
      rb.classList.add("lock");
      rb.setAttribute("aria-disabled", "true");
      rb.title = "新功能／暫未開放";
      var ric = rb.querySelector(".ic");
      if (ric) ric.innerHTML = '<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true" fill="#8a93a8"><rect x="3" y="0" width="4" height="1"/><rect x="2" y="1" width="1" height="3"/><rect x="7" y="1" width="1" height="3"/><rect x="1" y="4" width="8" height="5"/><rect x="4" y="5" width="2" height="2" fill="#fff"/><rect x="4" y="7" width="2" height="1" fill="#fff"/></svg>';
      var rsp = rb.querySelector(".et span");
      if (rsp) rsp.textContent = "新功能／暫未開放";
      rb.addEventListener("click", function () { if (typeof toast === "function") toast(t("新功能，暫未開放")); });
    }
  }

  var MC = ["#8e6bd8", "#ff8fb3", "#ffd23f", "#2dbf8f", "#6fb7ff", "#ff8a5b", "#b794ff"];

  /* ===== 物品的像素圖（座標都是物品自己的左上角 0,0） ===== */
  function artShelf() {
    var s = R(0, 0, 30, 50, "#8b5a2b") + R(2, 2, 26, 46, "#5a3a1a") + R(2, 16, 26, 2, "#8b5a2b") + R(2, 32, 26, 2, "#8b5a2b");
    var cols = ["#e0457b", "#2a7de1", "#ffd23f", "#2dbf8f", "#7b4fd6", "#ff8a5b", "#6fb7ff"];
    [16, 32, 48].forEach(function (bot, ri) {
      var x = 3, i = ri * 3;
      while (x < 27) {
        var w = 2 + ((i * 7) % 3), h = 8 + ((i * 5) % 5);
        if (x + w > 27) break;
        s += R(x, bot - h, w, h, cols[i % 7]);
        x += w + 1;
        i++;
      }
    });
    return s;
  }
  function artMoon() {
    var rows = [[0, 3, 4], [1, 2, 3], [2, 1, 3], [3, 1, 2], [4, 0, 2], [5, 0, 2], [6, 0, 2], [7, 1, 2], [8, 1, 3], [9, 2, 3], [10, 3, 4]], s = "";
    rows.forEach(function (r) { s += R(r[1], r[0], r[2], 1, "#ffd23f"); });
    return s + R(9, 3, 1, 1, "#fff") + R(10, 6, 1, 1, "#fff") + R(8, 9, 1, 1, "#fff");
  }
  function artDecal() {
    var s = "";
    for (var i = 0; i < 7; i++) s += R(i * 7 + 1, 0, 2, 2, "#ffe0c2") + R(i * 7, 2, 4, 5, MC[i]);
    return s;
  }
  function artPhoto() {
    var s = R(0, 0, 12, 10, "#8b5a2b") + R(1, 1, 10, 8, "#bfe3ff");
    for (var i = 0; i < 7; i++) s += R(2 + i, 4, 1, 1, "#ffe0c2") + R(2 + i, 5, 1, 3, MC[i]);
    return s;
  }
  /* 6/13 當天：合照相框換成七人戴著派對帽的版本（金框、粉色底、頭上一頂小帽、角落灑彩紙） */
  function artPhoto613() {
    var s = R(0, 0, 12, 10, "#ffd23f") + R(1, 1, 10, 8, "#ffe3ef") + R(2, 2, 1, 1, "#6fb7ff") + R(9, 1, 1, 1, "#ff8a5b") + R(6, 2, 1, 1, "#2dbf8f");
    for (var i = 0; i < 7; i++) s += R(2 + i, 3, 1, 1, MC[(i + 3) % 7]) + R(2 + i, 4, 1, 1, "#ffe0c2") + R(2 + i, 5, 1, 3, MC[i]);
    return s;
  }
  /* 巡演日（當天／前一天）：星星海報換成原創的演唱會海報（深紫底、手燈、七個成員色的小點；不是官方海報） */
  function artTourPoster() {
    var s = R(0, 0, 16, 14, "#b794ff") + R(1, 1, 14, 12, "#241a52") + R(1, 1, 14, 1, "#3a2c7a") + R(5, 2, 6, 3, "#b794ff", 0.35) + R(6, 2, 4, 3, "#b794ff") + R(7, 3, 2, 1, "#fff") + R(7, 5, 2, 4, "#d9d9e8");
    s += R(3, 10, 10, 1, "#fff", 0.85) + R(5, 9, 6, 1, "#fff", 0.5);
    for (var i = 0; i < 7; i++) s += R(2 + i * 2, 11, 1, 1, MC[i]);
    return s;
  }
  function artTickets() {
    var s = R(0, 0, 22, 1, "#8b5a2b"), c = ["#ffd23f", "#ff8fb3", "#6fb7ff"];
    [1, 8, 15].forEach(function (x, i) {
      s += R(x + 2, 1, 1, 1, "#8b5a2b") + R(x, 2, 5, 10, c[i]) + R(x + 1, 4, 3, 1, "#fff") + R(x + 1, 6, 3, 1, "#fff", 0.7) + R(x, 8, 1, 1, "#00000022");
    });
    return s;
  }
  /* 春聯（斗方）：兩張方形的紅底金字春聯，左「福」右「春」，金色內框，掛在同一根橫桿上；字用 SVG 文字，才看得清楚 */
  function artCouplet() {
    var tx = function (x, y, sz, c) { return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" font-weight="700" text-anchor="middle" fill="#ffd23f" shape-rendering="auto" font-family="\'Noto Serif TC\',\'PMingLiU\',serif">' + c + "</text>"; };
    var s = R(0, 0, 22, 1, "#8b5a2b");
    [1, 12].forEach(function (x) {
      s += R(x + 4, 1, 1, 1, "#8b5a2b") + R(x, 2, 10, 10, "#e0453a") +
        R(x + 1, 3, 8, 1, "#ffd23f", 0.85) + R(x + 1, 10, 8, 1, "#ffd23f", 0.85) + R(x + 1, 3, 1, 8, "#ffd23f", 0.85) + R(x + 8, 3, 1, 8, "#ffd23f", 0.85);
    });
    return s + tx(6, 9.5, 6, "福") + tx(17, 9.5, 6, "春");
  }
  function artLamp() {
    var lc = seasonKind() === "vd" ? "#ff8fb3" : "#ffe27a";
    return (
      '<g class="glow">' + R(-8, -4, 28, 26, lc, 0.1) + R(-5, -2, 22, 20, lc, 0.12) + R(-2, 0, 16, 15, lc, 0.14) + "</g>" +
      R(5, 6, 2, 8, "#555") + R(3, 14, 6, 2, "#444") +
      '<g class="sh">' + R(2, 0, 8, 2, "#fff") + R(1, 2, 10, 2, "#fff") + R(0, 4, 12, 2, "#fff") + "</g>"
    );
  }

  /* ===== 6/13 出道紀念日：整個小窩一起慶祝（彩旗、彩紙、蛋糕點蠟燭、小人戴派對帽） =====
     預覽：網址加 ?preview=613 就當作今天是 6/13（不會存任何東西） */
  function isAnniv() {
    var d = new Date();
    if (d.getMonth() === 5 && d.getDate() === 13) return true;
    return PV === "613";
  }
  /* 紀念日週：6/13 前 ANNIV_LEAD 天、後 ANNIV_TAIL 天（都不含 6/13 當天）掛著彩旗；字旗、蛋糕、七人慶祝等仍然只有 6/13 當天才有。
     回傳 0＝不是紀念日週、1＝6/13 之前、2＝6/13 之後。ANNIV_LEAD／ANNIV_TAIL 想調整只改這兩個數字（現在是 6/6–6/15）。
     預覽：網址加 ?preview=613w（之前）或 ?preview=613a（之後） */
  var ANNIV_LEAD = 7, ANNIV_TAIL = 2;
  function annivWeek() {
    if (isAnniv()) return 0;
    if (PV === "613w") return 1;
    if (PV === "613a") return 2;
    var d = new Date(), df = 13 - d.getDate();
    if (d.getMonth() !== 5) return 0;
    if (df >= 1 && df <= ANNIV_LEAD) return 1;
    if (df < 0 && -df <= ANNIV_TAIL) return 2;
    return 0;
  }
  function isFest() { return isAnniv() || !!bdName(); }
  /* 今天生日的成員（MEMBERS 是 app.js 的成員生日表）；預覽：網址加 ?preview=bd-Jimin */
  function bdName() {
    if (PV.indexOf("bd-") === 0 && WN.indexOf(PV.slice(3)) >= 0) return PV.slice(3);
    for (var i = 0; i < WN.length; i++) if (bdToday(WN[i])) return WN[i];
    return "";
  }
  /* 生日週：成員生日前 BD_LEAD 天（不含當天）開始掛彩旗和氣球；蛋糕、七人慶祝、派對帽、禮物堆、HAPPY BIRTHDAY 字旗仍然只有當天才有。
     BD_LEAD 想拉長或縮短只改這個數字。預覽：網址加 ?preview=bdw-Jimin */
  var BD_LEAD = 3;
  function bdWeekName() {
    if (isAnniv() || bdName()) return "";
    if (PV.indexOf("bdw-") === 0 && WN.indexOf(PV.slice(4)) >= 0) return PV.slice(4);
    try {
      if (typeof MEMBERS === "undefined") return "";
      var now = new Date(), t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()), i, m, tg, df;
      for (i = 0; i < MEMBERS.length; i++) {
        m = MEMBERS[i];
        if (WN.indexOf(m[0]) < 0) continue;
        tg = new Date(now.getFullYear(), Number(m[1]) - 1, Number(m[2]));
        if (tg < t0) tg = new Date(now.getFullYear() + 1, Number(m[1]) - 1, Number(m[2]));
        df = Math.round((tg - t0) / 86400000);
        if (df >= 1 && df <= BD_LEAD) return m[0];
      }
    } catch (e) {}
    return "";
  }
  /* 收藏清單上方的「限定布置」標籤：現在房間有哪一種限定布置。回傳 [階段文字, 成員名（沒有就空字串）]，沒有限定布置就回傳 null。
     優先順序跟說明文字一致：6/13 > 生日當天 > 生日週 > 節日 > 演唱會 > 生日隔天 */
  function limTag() {
    var n, k;
    if (isAnniv()) return ["出道紀念日", ""];
    if ((n = bdName())) return ["生日當天", n];
    if ((n = bdWeekName())) return ["生日週", n];
    if (annivWeek()) return ["紀念日週", ""];
    if ((k = seasonKind())) return [k === "hw" ? "萬聖節" : k === "xmas" ? "聖誕節" : k === "vd" ? "情人節" : k === "mid" ? "中秋節" : "新年", ""];
    if ((k = tourKind())) return [k === "today" ? "演唱會當天" : "演唱會前夕", ""];
    if (isNye()) return ["跨年夜", ""];
    if ((n = bdAfterName())) return ["生日隔天", n];
    return null;
  }
  /* 限定布置的小圖示（12×12 像素，顯示在首頁入口按鈕右上角）。判斷順序跟 limTag() 一樣，兩邊要一起改 */
  function limIcon() {
    var n, k, c, G = "#2dbf8f", GD = "#1f9a72", s = "";
    if (isAnniv()) s = R(5, 0, 2, 1, "#ffd23f") + R(4, 1, 4, 2, "#ff8fb3") + R(3, 3, 6, 2, "#fff") + R(2, 5, 8, 2, "#6fb7ff") + R(1, 7, 10, 1, "#ffd23f") + R(4, 9, 1, 1, "#e0457b") + R(8, 10, 1, 1, "#2dbf8f") + R(2, 11, 1, 1, "#ffd23f");
    else if ((n = bdName() || bdWeekName() || bdAfterName())) { c = MC[WN.indexOf(n) % 7]; s = R(4, 0, 4, 1, c) + R(3, 1, 6, 5, c) + R(4, 6, 4, 1, c) + R(4, 2, 1, 1, "#fff") + R(5, 7, 2, 1, c) + R(6, 8, 1, 4, "#8b5a2b"); }
    else if (annivWeek()) s = R(0, 2, 12, 1, "#8b5a2b") + R(1, 3, 3, 1, MC[0]) + R(2, 4, 1, 1, MC[0]) + R(5, 3, 3, 1, MC[2]) + R(6, 4, 1, 1, MC[2]) + R(9, 3, 3, 1, MC[1]) + R(10, 4, 1, 1, MC[1]) + R(0, 6, 12, 1, "#8b5a2b") + R(1, 7, 3, 1, MC[3]) + R(2, 8, 1, 1, MC[3]) + R(5, 7, 3, 1, MC[4]) + R(6, 8, 1, 1, MC[4]) + R(9, 7, 3, 1, MC[5]) + R(10, 8, 1, 1, MC[5]);
    else if ((k = seasonKind())) {
      if (k === "hw") s = R(5, 1, 2, 2, G) + R(2, 3, 8, 1, "#ff8a1f") + R(1, 4, 10, 6, "#ff8a1f") + R(2, 10, 8, 1, "#ff8a1f") + R(5, 4, 1, 6, "#d9610f") + R(3, 5, 2, 2, "#2b2f3a") + R(7, 5, 2, 2, "#2b2f3a") + R(4, 8, 4, 1, "#ffd23f");
      else if (k === "xmas") s = R(5, 0, 2, 1, "#ffd23f") + R(5, 1, 2, 2, G) + R(4, 3, 4, 2, G) + R(3, 5, 6, 2, G) + R(2, 7, 8, 2, G) + R(8, 3, 1, 2, GD) + R(9, 5, 1, 2, GD) + R(10, 7, 1, 2, GD) + R(5, 9, 2, 2, "#8b5a2b") + R(5, 4, 1, 1, "#e0453a") + R(7, 6, 1, 1, "#ffd23f") + R(4, 7, 1, 1, "#6fb7ff") + R(6, 8, 1, 1, "#e0453a");
      else if (k === "vd") s = vdHeart(3, 3, "#e0457b") + R(4, 3, 1, 1, "#ff8fb3");
      else if (k === "mid") s = R(3, 1, 6, 1, "#fff1a8") + R(2, 2, 8, 8, "#fff1a8") + R(3, 10, 6, 1, "#fff1a8") + R(4, 3, 2, 2, "#e8d27a") + R(7, 6, 2, 2, "#e8d27a") + R(3, 7, 2, 1, "#e8d27a") + R(6, 3, 1, 1, "#fff");
      else s = R(5, 0, 2, 1, "#8b5a2b") + R(3, 1, 6, 1, "#ffd23f") + R(2, 2, 8, 6, "#e0453a") + R(5, 2, 1, 6, "#b02a20") + R(3, 3, 1, 1, "#ff8a7a") + R(3, 8, 6, 1, "#ffd23f") + R(5, 9, 2, 3, "#ffd23f");
    }
    else if (tourKind()) s = R(2, 0, 8, 7, "#b794ff", 0.3) + R(4, 0, 4, 5, "#b794ff") + R(5, 1, 2, 2, "#fff") + R(5, 5, 2, 5, "#444") + R(4, 10, 4, 2, "#222");
    else if (isNye()) s = R(5, 0, 2, 12, "#ffd23f") + R(0, 5, 12, 2, "#ffd23f") + R(2, 2, 1, 1, "#ff8fb3") + R(9, 2, 1, 1, "#6fb7ff") + R(2, 9, 1, 1, "#6fb7ff") + R(9, 9, 1, 1, "#ff8fb3") + R(5, 5, 2, 2, "#fff");
    return s ? '<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true">' + s + "</svg>" : "";
  }
  /* 生日後一天：昨天是成員生日，今天只留沒收的氣球和一句收尾文字（沒有彩旗、蛋糕、禮物）。預覽：網址加 ?preview=bda-Jimin */
  function bdAfterName() {
    if (isAnniv() || bdName() || bdWeekName()) return "";
    if (PV.indexOf("bda-") === 0 && WN.indexOf(PV.slice(4)) >= 0) return PV.slice(4);
    try {
      if (typeof MEMBERS === "undefined") return "";
      var y = new Date(), i, m;
      y.setDate(y.getDate() - 1);
      for (i = 0; i < MEMBERS.length; i++) {
        m = MEMBERS[i];
        if (WN.indexOf(m[0]) >= 0 && Number(m[1]) === y.getMonth() + 1 && Number(m[2]) === y.getDate()) return m[0];
      }
    } catch (e) {}
    return "";
  }
  /* 今天抽到的幸運籤成員：跟 app.js 的 ftShow() 用同一套算法（ftKey／fth／ftBd），
     只在「今天已經抽過」（localStorage ftn-st.last 是今天）時才回傳，沒抽就回傳空字串，不會劇透今天的籤 */
  function drawnMem() {
    try {
      var d = new Date(), td = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      var st = JSON.parse(localStorage.getItem("ftn-st") || "{}") || {};
      if (st.last !== td) return "";
      if (typeof ftKey !== "function" || typeof fth !== "function" || typeof MEMBERS === "undefined") return "";
      var M = MEMBERS.filter(function (m) { return m[0] !== "BTS"; }), bd = typeof ftBd === "function" ? ftBd(d) : null;
      var n = bd ? bd.m : M[fth(ftKey(d) + "m") % M.length][0];
      return WN.indexOf(n) >= 0 ? n : "";
    } catch (e) { return ""; }
  }
  /* 今天是否已經抽過幸運籤（localStorage ftn-st.last 是今天） */
  function drewToday() {
    try {
      var d = new Date(), td = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
      var st = JSON.parse(localStorage.getItem("ftn-st") || "{}") || {};
      return st.last === td;
    } catch (e) { return false; }
  }
  /* 節日造型（跟首頁彩蛋、桌寵同一批日期）：10/29–10/31 萬聖節、12/24–25 聖誕、2/4–2/10 新年。
     預覽：網址加 ?preview=hw／xmas／ny／vd（2/14 情人節）。6/13 和成員生日的布置優先，節日不會疊上去 */
  /* 中秋節：農曆八月十四、十五（瀏覽器內建的農曆算出來，每年國曆日期不同，不用手改）。閏八月的 "8bis" 不算。預覽：?preview=mid */
  var lunFmt = null, lunKey = 0, lunVal = false;
  function isMidAutumn() {
    var d = new Date(), key = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
    if (key === lunKey) return lunVal;
    lunKey = key; lunVal = false;
    try {
      if (!lunFmt) lunFmt = new Intl.DateTimeFormat("en-u-ca-chinese", { month: "numeric", day: "numeric" });
      var m = "", dy = 0;
      lunFmt.formatToParts(d).forEach(function (x) { if (x.type === "month") m = x.value; else if (x.type === "day") dy = Number(x.value); });
      lunVal = m === "8" && (dy === 14 || dy === 15);
    } catch (e) {}
    return lunVal;
  }
  function seasonKind() {
    if (isAnniv() || bdName() || bdWeekName()) return "";
    var d = new Date(), m = d.getMonth() + 1, dy = d.getDate();
    if (PV === "hw" || (m === 10 && dy >= 29 && dy <= 31)) return "hw";
    if (PV === "xmas" || (m === 12 && (dy === 24 || dy === 25))) return "xmas";
    if (PV === "ny" || (m === 2 && dy >= 4 && dy <= 10)) return "ny";
    if (PV === "vd" || (m === 2 && dy === 14)) return "vd";
    if (PV === "mid" || isMidAutumn()) return "mid";
    return "";
  }
  /* 巡演日（讀 data.js 的 CITIES：showDays＝演唱會日，格式 "11/19"，y＝年份）：演唱會當天回傳 "today"，前一天回傳 "eve"，其他回傳 ""。
     預覽：網址加 ?preview=tour（當天）或 ?preview=eve（前一天），不存任何東西 */
  var TOURPAL = ["#8e6bd8", "#ffffff", "#b794ff"];
  var tkCache = null;
  function tourInfo() {
    if (PV === "tour" || PV === "eve" || PV === "tourout" || PV === "tourgo" || PV === "tourback") {
      var C0 = null; try { C0 = typeof CITIES !== "undefined" ? CITIES[Object.keys(CITIES)[0]] : null; } catch (e) {}
      return { k: PV === "eve" ? "eve" : "today", zh: C0 ? C0.name : "高雄", en: C0 ? C0.en : "Kaohsiung" };
    }
    try {
      if (typeof CITIES === "undefined") return null;
      var n = new Date(), nx = new Date(n.getTime() + 86400000), ks = Object.keys(CITIES), i, C, r = null;
      var md = function (d) { return (d.getMonth() + 1) + "/" + d.getDate(); };
      for (i = 0; i < ks.length; i++) {
        C = CITIES[ks[i]];
        if (!C || !C.showDays) continue;
        if (C.y === n.getFullYear() && C.showDays.indexOf(md(n)) >= 0) return { k: "today", zh: C.name, en: C.en };
        if (C.y === nx.getFullYear() && C.showDays.indexOf(md(nx)) >= 0 && !r) r = { k: "eve", zh: C.name, en: C.en };
      }
      return r;
    } catch (e) { return null; }
  }
  function tourKind() { var i = tourInfo(); return i ? i.k : ""; }
  /* 演唱會當天 18:59：小人拿著手燈走出房間（之後 19:00 起不出現）。預覽：?preview=tourgo（走出去後一直不回來） */
  function tourLeaving() {
    if (PV === "tourgo") return true;
    if (tourKind() !== "today") return false;
    var n = new Date();
    return n.getHours() === 18 && n.getMinutes() === 59;
  }
  /* 演唱會當天 19:00～22:00：小人出發去看演唱會，房間裡不出現，22:00 後再回來。預覽：?preview=tourout */
  function tourAway() {
    if (PV === "tourout") return true;
    if (tourKind() !== "today") return false;
    var h = new Date().getHours();
    return h >= 19 && h < 22;
  }
  /* 演唱會當天 22:00 之後：小人看完演唱會回來了，下方文字改講「演唱會結束，小人回來了」。預覽：?preview=tourback */
  function tourBack() {
    if (PV === "tourback") return true;
    if (tourKind() !== "today") return false;
    return new Date().getHours() >= 22;
  }
  function tourTitle() {
    var i = tourInfo(), L = lang();
    if (!i) return "";
    var td = i.k === "today";
    if (L === "en") return td ? "It's the " + i.en + " concert day!" : "The " + i.en + " concert is tomorrow!";
    if (L === "ko") return td ? "오늘은 " + i.en + " 콘서트 날!" : "내일은 " + i.en + " 콘서트!";
    if (L === "ja") return td ? "今日は" + i.en + "公演！" : "明日は" + i.en + "公演！";
    return td ? "今天是" + i.zh + "演唱會！" : "明天就是" + i.zh + "演唱會！";
  }
  function tourCap(r2) {
    var td = tourKind() === "today";
    return "<b>" + esc(tourTitle()) + "</b><br>" + esc(t(td ? (tourAway() ? "小人出發看演唱會了，晚點回來。" : tourBack() ? "演唱會結束，小人回來了。" : r2 ? "練習室裡也有手燈在發光。" : "小人拿起手燈，準備出門了。") : (r2 ? "練習到這裡，明天就是正式舞台。" : "小人正在整理明天的行李。")));
  }
  /* pal＝彩旗顏色；hat＝帽子像素（10 格寬的小圖）；hy＝帽子最下面一排要貼在頭頂（y=0）所需的位移；tt／s1／s2＝下方文字 */
  var SEAS = {
    hw: { pal: ["#ff8a1f", "#7b4fd6", "#ff8a1f", "#2b2f3a"], hy: -5, tt: "今天是萬聖節！", s1: "小窩也掛上南瓜旗了。", s2: "練習室也掛上南瓜旗了。",
      hat: R(4, 0, 2, 1, "#7b4fd6") + R(3, 1, 4, 2, "#7b4fd6") + R(2, 3, 6, 1, "#ffd23f") + R(2, 4, 6, 1, "#7b4fd6") + R(0, 5, 10, 1, "#7b4fd6") },
    xmas: { pal: ["#e0453a", "#2dbf8f", "#ffffff", "#2dbf8f"], hy: -4, tt: "聖誕快樂！", s1: "小窩也布置好聖誕裝飾了。", s2: "練習室也布置好聖誕裝飾了。",
      hat: R(6, 0, 2, 1, "#fff") + R(3, 1, 4, 1, "#e0453a") + R(2, 2, 6, 2, "#e0453a") + R(1, 4, 8, 1, "#fff") },
    ny: { pal: ["#ffd23f", "#e0453a", "#ffd23f", "#ffffff"], hy: -5, tt: "新年快樂！", s1: "小窩也掛上新年彩旗了。", s2: "練習室也掛上新年彩旗了。",
      hat: R(1, 2, 2, 3, "#ffd23f") + R(4, 1, 2, 4, "#ffd23f") + R(7, 2, 2, 3, "#ffd23f") + R(1, 5, 8, 1, "#e0a800") + R(4, 3, 2, 1, "#e0453a") },
    mid: { pal: ["#ffd23f", "#e0453a", "#fff1a8", "#ff8a1f"], hy: -4, tt: "中秋節快樂！", s1: "小窩也布置好中秋節的柚子和月餅了。", s2: "練習室也布置好中秋節的柚子和月餅了。",
      hat: R(5, 0, 1, 1, "#2dbf8f") + R(4, 1, 3, 1, "#c9d83f") + R(2, 2, 6, 2, "#c9d83f") + R(1, 4, 8, 1, "#a9b82a") + R(4, 2, 1, 1, "#e8f08a") + R(7, 3, 1, 1, "#a9b82a") },
    vd: { pal: ["#ff8fb3", "#e0457b", "#ffffff", "#e0457b"], hy: -5, tt: "情人節快樂！", s1: "小窩也布置好愛心了。", s2: "練習室也布置好愛心了。",
      hat: R(2, 0, 2, 1, "#e0457b") + R(6, 0, 2, 1, "#e0457b") + R(1, 1, 8, 2, "#e0457b") + R(2, 3, 6, 1, "#e0457b") + R(3, 4, 4, 1, "#e0457b") + R(4, 5, 2, 1, "#e0457b") + R(2, 1, 2, 1, "#ff8fb3") }
  };
  /* 節日帽：座標系跟派對帽一樣（以小人 26×26 的圖左上角為原點），傾斜角度也一樣 */
  function festHat(k) {
    var h = SEAS[k];
    return h ? '<g transform="rotate(-10 13 3)"><g transform="translate(8,' + h.hy + ')">' + h.hat + "</g></g>" : "";
  }
  /* 情人節（2/14）：地板上一盒巧克力、旁邊飄兩顆愛心（跟氣球同一套上下飄的動畫，減少動態時會停） */
  function vdHeart(x, y, c) {
    return R(x, y, 2, 1, c) + R(x + 3, y, 2, 1, c) + R(x, y + 1, 5, 2, c) + R(x + 1, y + 3, 3, 1, c) + R(x + 2, y + 4, 1, 1, c);
  }
  /* 情人節互動的狀態（只存在這次開啟小窩的期間，每次打開都重來）：巧克力還剩幾顆、郵筒旗子是否升起、地板上的情書是第幾封 */
  var vdChoc = 6, vdMailUp = false, vdLetterN = 0, nyCalFlip = false, nyParty = false, xmasLit = false, hwLit = false;
  var CHOCC = ["#8a4b36", "#c68642", "#ffd9e4", "#e0457b", "#8a4b36", "#ffd23f"];
  var LETV = [["#ffffff", "#e0b8c8", "#e0457b"], ["#ffe3ef", "#f0a8c0", "#c0306a"], ["#e8f3ff", "#a8c8e8", "#2a7de1"], ["#fff6d6", "#e8d090", "#e0a800"]];
  /* 打開的巧克力盒，裡面 2×3 顆，剩幾顆就畫幾顆（被小人偷吃會一顆一顆消失） */
  function chocBoxArt() {
    var a = '<g transform="translate(30,78)">' + R(0, 2, 12, 8, "#6b3a2a") + R(0, 2, 12, 1, "#e0457b") + R(1, 3, 10, 6, "#3a1f17") + R(9, 0, 3, 2, "#e0457b") + R(10, 1, 1, 1, "#ff8fb3"), i;
    for (i = 0; i < vdChoc; i++) a += '<g class="rcp" data-i="' + i + '">' + R(2 + (i % 3) * 3, 4 + Math.floor(i / 3) * 3, 2, 2, CHOCC[i]) + R(2 + (i % 3) * 3, 4 + Math.floor(i / 3) * 3, 1, 1, "#ffffff", 0.35) + "</g>";
    return a + "</g>";
  }
  /* 地板上的情書：每寄出一封，換成下一種顏色的新信（白、粉、藍、奶油色輪流） */
  function letterArt(n, lx) {
    var v = LETV[n % 4];
    return '<g class="rlt" transform="translate(' + lx + ',83)">' + R(0, 0, 10, 7, v[0]) + R(0, 6, 10, 1, v[1]) + R(1, 1, 2, 1, v[1]) + R(3, 2, 2, 1, v[1]) + R(5, 2, 2, 1, v[1]) + R(7, 1, 2, 1, v[1]) +
      R(3, 3, 1, 1, v[2]) + R(5, 3, 1, 1, v[2]) + R(3, 4, 3, 1, v[2]) + R(4, 5, 1, 1, v[2]) + "</g>";
  }
  /* 郵筒（只有小窩有）：圓頂紅色，左邊一支小旗子，有信投進去後旗子升起 */
  function mailArt() {
    return '<g class="rmml' + (vdMailUp ? " up" : "") + '" transform="translate(149,75)">' + R(2, 0, 6, 1, "#e0453a") + R(1, 1, 8, 1, "#e0453a") + R(0, 2, 10, 10, "#e0453a") + R(0, 2, 1, 10, "#ff8a7a", 0.5) + R(9, 2, 1, 10, "#b02a20") + R(1, 12, 8, 1, "#b02a20") +
      R(2, 4, 6, 1, "#3a1f17") + R(3, 7, 1, 1, "#fff") + R(5, 7, 1, 1, "#fff") + R(3, 8, 3, 1, "#fff") + R(4, 9, 1, 1, "#fff") + R(4, 13, 2, 3, "#555") + R(-1, 3, 1, 8, "#555") +
      '<g class="rmfd">' + R(-4, 8, 3, 2, "#ffd23f") + '</g><g class="rmfu">' + R(-4, 3, 3, 2, "#ffd23f") + "</g></g>";
  }
  /* 巧克力盒（可以點，小人也會走過來偷吃一顆）和兩顆上下飄的愛心（可以點）。練習室（r2）只當裝飾，不擋點擊 */
  function vdDeco(r2) {
    var box = chocBoxArt();
    var hearts = '<g transform="translate(44,74)"><g class="rbal d1">' + vdHeart(0, 0, "#e0457b") + "</g></g>" +
      '<g transform="translate(52,78)"><g class="rbal d2">' + vdHeart(0, 0, "#ff8fb3") + "</g></g>";
    var rx = r2 ? 104 : 124, lx = r2 ? 116 : 138;
    var rose = '<g transform="translate(' + rx + ',80)">' + R(3, 0, 3, 1, "#e0457b") + R(2, 1, 5, 3, "#e0457b") + R(3, 4, 3, 1, "#e0457b") + R(4, 1, 1, 2, "#ff8fb3") + R(4, 5, 1, 5, "#2dbf8f") + R(2, 7, 2, 1, "#2dbf8f") + R(5, 8, 2, 1, "#2dbf8f") +
      R(2, 10, 5, 1, "#bfe3ff") + R(1, 11, 7, 4, "#bfe3ff") + R(2, 15, 5, 1, "#9ad0ff") + R(2, 12, 1, 2, "#ffffff") + R(1, 13, 7, 1, "#ff8fb3") + "</g>";
    var letter = letterArt(vdLetterN, lx);
    return fxG("vdchoc", box, [29, 78, 14, 12], r2) + fxG("vdheart", hearts, [43, 72, 16, 14], r2) +
      fxG("vdrose", rose, [rx - 1, 79, 11, 17], r2) + fxG("vdletter", letter, [lx - 1, 82, 12, 9], r2) + (r2 ? "" : fxG("vdmail", mailArt(), [144, 75, 16, 17]));
  }
  /* 中秋節的地板擺飾：左邊一盤月餅（兩個），右邊一顆柚子。都只是裝飾，不能點 */
  function midMoonCakes() {
    return R(0, 9, 18, 2, "#e8eef5") + R(1, 11, 16, 1, "#c7d2e0") +
      R(2, 5, 7, 4, "#c68642") + R(3, 4, 5, 1, "#c68642") + R(4, 6, 3, 2, "#8a5a2a") + R(2, 5, 7, 1, "#ffffff", 0.2) +
      R(10, 6, 6, 3, "#d9964f") + R(11, 5, 4, 1, "#d9964f") + R(12, 6, 2, 2, "#8a5a2a");
  }
  function midPomelo(px) {
    return '<g transform="translate(' + (px || 140) + ',80)">' + R(4, 0, 2, 2, "#2dbf8f") + R(2, 2, 6, 1, "#c9d83f") + R(1, 3, 8, 6, "#c9d83f") + R(2, 9, 6, 1, "#a9b82a") +
      R(3, 4, 2, 2, "#e8f08a") + R(7, 6, 2, 3, "#a9b82a") + "</g>";
  }
  /* 中秋節窗外的月亮：夜晚是一顆大圓月（左上那一格窗，外面一圈淡淡的月暈）；白天只有一顆淡淡的月亮 */
  function midMoon(night) {
    var CL = '<clipPath id="rmwcm"><rect x="64" y="10" width="32" height="28"/></clipPath><g clip-path="url(#rmwcm)"><g class="mrs">';
    if (!night) return CL + R(68, 13, 6, 1, "#ffffff", 0.5) + R(67, 14, 8, 5, "#ffffff", 0.5) + R(68, 19, 6, 1, "#ffffff", 0.5) + "</g></g>";
    return CL + R(65, 11, 14, 14, "#fff1a8", 0.16) + R(68, 12, 8, 1, "#fff6c4") + R(67, 13, 10, 1, "#fff6c4") + R(66, 14, 12, 8, "#fff6c4") + R(67, 22, 10, 1, "#fff6c4") + R(68, 23, 8, 1, "#fff6c4") +
      R(69, 15, 2, 2, "#e8d27a") + R(73, 18, 3, 2, "#e8d27a") + R(68, 20, 2, 1, "#e8d27a") + R(74, 14, 1, 1, "#e8d27a") + R(72, 21, 4, 2, "#f0e08a", 0.6) +
      '<g class="mrt">' + R(68, 12, 8, 1, "#ff9f43", 0.55) + R(67, 13, 10, 1, "#ff9f43", 0.55) + R(66, 14, 12, 8, "#ff9f43", 0.55) + R(67, 22, 10, 1, "#ff9f43", 0.55) + R(68, 23, 8, 1, "#ff9f43", 0.55) + "</g></g></g>";
  }
  /* 兔子燈：吊在牆上，白色（或淡黃色）的圓身、兩隻長耳朵、紅眼睛、底下一串金色流蘇 */
  function rabbitLan(x, y, c, sh) {
    return R(x - 1, y + 3, 10, 8, "#fff1a8", 0.18) + R(x + 3, y - 3, 1, 3, "#8b5a2b") +
      R(x + 2, y, 1, 3, c) + R(x + 5, y, 1, 3, c) + R(x + 2, y + 1, 1, 1, "#ffb3c7") + R(x + 5, y + 1, 1, 1, "#ffb3c7") +
      R(x + 1, y + 3, 6, 1, c) + R(x, y + 4, 8, 5, c) + R(x + 1, y + 9, 6, 1, c) + R(x + 6, y + 4, 2, 5, sh) +
      R(x + 2, y + 5, 1, 1, "#e0453a") + R(x + 5, y + 5, 1, 1, "#e0453a") + R(x + 3, y + 7, 2, 1, "#ffb3c7") +
      R(x + 3, y + 10, 2, 1, "#ffd23f") + R(x + 3, y + 11, 1, 2, "#ffd23f");
  }
  /* 中秋節的裝飾：牆上兩盞兔子燈、地板左邊的月餅、右邊的柚子。都可以點（燈籠抖、月餅和柚子跳），練習室（r2）只當裝飾 */
  function midDeco(r2) {
    var pxm = r2 ? 104 : 140; /* 練習室右邊的運動包佔了 x≈140–156，柚子改放到它左邊的空地 */
    return fxG("midlan", rabbitLan(31, 4, "#ffffff", "#e8eef5"), [30, 0, 10, 16], r2) + fxG("midlan", rabbitLan(151, 4, "#fff1a8", "#e8d27a"), [150, 0, 10, 16], r2) +
      fxG("midcake", '<g transform="translate(30,78)">' + midMoonCakes() + "</g>", [29, 80, 20, 12], r2) +
      fxG("midpomelo", midPomelo(pxm), [pxm - 1, 79, 12, 12], r2);
  }
  /* 萬聖節的南瓜燈（可以點：亮燈／熄燈，亮燈時眼睛和嘴巴發黃光、外圍一圈會閃的橘色光暈）；點的時候 fxHit 會直接換掉這一層的內容 */
  function pumpkinArt() {
    var e = hwLit ? "#ffe27a" : "#2b2f3a", b = hwLit ? "#ff9a2e" : "#ff8a1f";
    return (hwLit ? '<g class="xlA">' + R(-3, -1, 18, 13, "#ffb347", 0.22) + "</g>" + R(-1, 10, 14, 2, "#ffb347", 0.28) : "") +
      R(5, 0, 2, 2, "#2dbf8f") + R(2, 2, 8, 1, b) + R(1, 3, 10, 6, b) + R(2, 9, 8, 1, b) + R(5, 3, 1, 6, "#d9610f") + R(3, 4, 2, 2, e) + R(7, 4, 2, 2, e) +
      R(4, 7, 4, 1, hwLit ? "#fff1a8" : "#ffd23f") + (hwLit ? R(3, 8, 6, 1, "#ffe27a", 0.8) : "");
  }
  function hwPumpInner() { return R(28, 76, 16, 14, "transparent") + '<g transform="translate(30,78)">' + pumpkinArt() + "</g>"; }
  /* 地板上的小擺飾（只是裝飾，不能點）：萬聖節南瓜、聖誕樹、情人節巧克力；新年只有彩旗和皇冠 */
  function festProp(r2) {
    var k = seasonKind(), s = "";
    return (s ? '<g transform="translate(' + (k === "xmas" ? "138,72" : "30,78") + ')" pointer-events="none">' + s + "</g>" : "") + (k === "hw" ? fxG("hwpump", hwPumpInner(), null, r2) + candyArt(r2) + broomArt() : "") + (k === "xmas" ? xmasDeco(r2) : "") + (k === "mid" ? midDeco(r2) : "") + (k === "ny" ? nyDeco(r2) : "") + (k === "vd" ? vdDeco(r2) : "") + (isNye() && !k ? nyeDeco(r2) : "");
  }
  /* 聖誕樹（可以點：亮燈／關燈，亮燈時窗外也會下雪）；點的時候 fxHit 會直接換掉這一層的內容 */
  function xtreeInner() { return R(137, 70, 18, 21, "transparent") + '<g transform="translate(138,72)">' + xmasTree() + "</g>"; }
  /* 聖誕節窗外：亮燈時下雪（xmasLit，平常藏起來）、夜晚有聖誕老人的雪橇飛過（剪影，由 tick 觸發） */
  function xmasWinArt(night) {
    var r = '<clipPath id="rmwcs"><rect x="64" y="10" width="32" height="28"/></clipPath><g id="rmws" clip-path="url(#rmwcs)"' + (xmasLit ? "" : ' style="display:none"') + ">", i;
    for (i = 0; i < 12; i++) r += '<g transform="translate(' + (65 + (i * 7) % 30) + ',9)"><g class="wsn" style="animation-duration:' + (4 + (i % 3)) + "s;animation-delay:-" + (i * 0.45).toFixed(2) + 's">' + (i % 3 === 0 ? R(0, 0, 2, 2, "#ffffff") : R(0, 0, 1, 1, "#ffffff")) + "</g></g>";
    r += "</g>";
    if (night) {
      var D = "#03081c";
      r += '<g clip-path="url(#rmwcs)"><g id="rmsa">' + R(0, 2, 1, 1, D) + R(0, 3, 7, 2, D) + R(-1, 5, 9, 1, D) + R(2, 0, 3, 3, D) + R(4, -1, 1, 1, D) + R(7, 4, 3, 1, D) +
        R(10, 3, 4, 2, D) + R(10, 5, 1, 1, D) + R(13, 5, 1, 1, D) + R(14, 2, 1, 2, D) + R(15, 2, 2, 1, D) + R(15, 0, 1, 2, D) + R(16, 0, 1, 1, D) + R(17, 2, 1, 1, "#e0453a") +
        R(-4, 4, 1, 1, "#ffd23f", 0.8) + R(-7, 3, 1, 1, "#ffffff", 0.6) + R(-10, 5, 1, 1, "#ffd23f", 0.6) + "</g></g>";
    }
    return r;
  }
  /* 聖誕節的地板裝飾：樹下的禮物盒、給聖誕老人的餅乾和牛奶、掛在桌邊的聖誕襪（練習室沒有桌子，不掛）。
     一樣可以點（跳一下／抖一下＋台詞）；練習室（r2）只當裝飾，不擋點擊 */
  function giftArt(x, y, w, h, c, rb) {
    var cx = x + Math.floor(w / 2);
    return R(x, y, w, h, c) + R(x, y, w, 1, "#ffffff", 0.25) + R(cx, y, w > 8 ? 2 : 1, h, rb) + R(x, y + Math.floor(h / 2), w, 1, rb) + R(cx - 1, y - 1, 3, 1, rb);
  }
  function sockArt(x, y, c) {
    return R(x, y, 6, 2, "#ffffff") + R(x + 5, y - 1, 1, 1, "#ffd23f") + R(x + 1, y + 2, 4, 5, c) + R(x + 1, y + 4, 4, 1, "#ffffff") + R(x + 1, y + 7, 7, 3, c) + R(x + 6, y + 7, 2, 3, "#ffffff");
  }
  function xmasDeco(r2) {
    var cookie = '<g transform="translate(36,86)">' + R(0, 5, 10, 2, "#e8eef5") + R(1, 6, 8, 1, "#c7d2e0") +
      R(1, 2, 4, 3, "#c68642") + R(2, 3, 1, 1, "#5a3a1a") + R(4, 2, 1, 1, "#5a3a1a") + R(5, 3, 4, 2, "#c68642") + R(6, 3, 1, 1, "#5a3a1a") +
      R(11, 0, 5, 7, "#dfeefa") + R(11, 2, 5, 5, "#ffffff") + R(11, 6, 5, 1, "#c7d2e0") + "</g>";
    var big = fxG("xtree", xtreeInner(), null, r2) + fxG("xgift", giftArt(128, 84, 9, 8, "#e0453a", "#ffd23f"), [127, 82, 11, 11], r2) +
      fxG("xgift", giftArt(150, 86, 8, 6, "#2a7de1", "#ffffff"), [149, 84, 10, 9], r2) +
      fxG("xgift", giftArt(141, 89, 6, 4, "#ffd23f", "#e0453a"), [140, 87, 8, 7], r2);
    /* 練習室右邊有筆記本和運動包，樹和禮物整組往左移到空地 */
    var s = (r2 ? '<g transform="translate(-48,0)">' + big + "</g>" : big) + fxG("xcookie", cookie, [35, 84, 18, 10], r2);
    if (!r2) s += fxG("xsock", sockArt(120, 57, "#e0453a"), [119, 55, 10, 12]) + fxG("xsock", sockArt(134, 57, "#2dbf8f"), [133, 55, 10, 12]);
    return s;
  }
  /* 聖誕節的飄雪：22 片小雪花慢慢飄下來，畫在最上層、不擋點擊（跟 6/13 的彩紙用同一套動畫，減少動態時會隱藏） */
  function snowArt() {
    var sk = seasonKind();
    if (sk === "vd") {
      var hc = ["#ff8fb3", "#e0457b", "#ffffff", "#ff8fb3"], hs = '<g class="rcfs">', hi, cc;
      for (hi = 0; hi < 18; hi++) {
        cc = hc[hi % 4];
        hs += '<g transform="translate(' + ((hi * 17 + 6) % 156) + ',0)"><g class="rcf" style="animation-duration:' + (7 + (hi % 5)) + "s;animation-delay:-" + (hi * 1.3).toFixed(1) + 's">' +
          (hi % 3 === 0 ? R(0, 0, 1, 1, cc) + R(2, 0, 1, 1, cc) + R(0, 1, 3, 1, cc) + R(1, 2, 1, 1, cc) : R(0, 0, 2, 1, cc) + R(1, 1, 1, 1, cc, 0.8)) + "</g></g>";
      }
      return hs + "</g>";
    }
    if (sk !== "xmas") return "";
    var s = '<g class="rcfs">';
    for (var i = 0; i < 22; i++) {
      var big = i % 3 === 0;
      s += '<g transform="translate(' + ((i * 13 + 4) % 158) + ',0)"><g class="rcf" style="animation-duration:' + (7 + (i % 5)) + "s;animation-delay:-" + (i * 1.1).toFixed(1) + 's">' +
        R(-1, -1, big ? 4 : 3, big ? 4 : 3, "#9fc4ea", 0.35) + R(0, 0, big ? 2 : 1, big ? 2 : 1, "#ffffff") + "</g></g>";
    }
    return s + "</g>";
  }
  /* 新年：七位成員排成一排一起拜年（戴金皇冠、一起鞠躬）。只在新年期間（2/4–2/10）出現，由 tick() 定時觸發或點春聯觸發 */
  /* xs＝情人節七人送愛心用：每個人目前的 x（走進來、走出去的過程中會變）；新年拜年不傳，固定站好 */
  function ngHtml(xs) {
    var mid = seasonKind() === "mid", s = '<g id="rmng"' + (xs || mid ? ' class="' + (xs ? "wk" : "") + (mid ? " mg" : "") + '"' : "") + ">", PC = ["#8e6bd8", "#ff8fb3", "#ffd23f", "#2dbf8f", "#6fb7ff", "#ff9f1c", "#b794ff"], nye = isNye() && !seasonKind(), nyr = seasonKind() === "ny";
    WN.forEach(function (n, i) {
      var x = xs ? xs[i] : 8 + i * 21, y = 73 + Math.abs(i - 3) * 1.5, dd = Math.max(-9, Math.min(9, (72 - (x + 9)) / 8));
      s += '<g class="rmnm" data-i="' + i + '" transform="translate(' + x + "," + y.toFixed(1) + ')" tabindex="0" role="button" aria-label="' + esc(n) + '"><g class="rmbw" style="animation-delay:-' + (i * 0.1).toFixed(2) + 's' + (mid ? ";--d:" + dd.toFixed(1) + "deg" : "") + '">' +
        R(0, 0, 18, 18, "transparent") + '<image href="' + esc(avUrl(n)) + '" x="0" y="0" width="18" height="18" preserveAspectRatio="xMidYMax meet"/><g transform="translate(-1,3) scale(.75)">' + (nye ? "" : festHat(seasonKind())) + "</g>" + (nye ? '<g transform="translate(6,-3)">' + R(2, 0, 1, 1, "#ffd23f") + R(1, 1, 3, 1, PC[i]) + R(1, 2, 3, 1, "#ffffff") + R(0, 3, 5, 1, PC[i]) + '</g><g transform="translate(13,12)">' + R(0, 0, 4, 1, "#ffffff") + R(0, 1, 4, 3, PC[i]) + R(1, 4, 2, 1, "#e8eef5") + "</g>" : "") + (mid ? '<g transform="translate(13,13)">' + R(1, 0, 2, 1, "#c68642") + R(0, 1, 4, 3, "#c68642") + R(1, 2, 2, 1, "#8a5a2a") + "</g>" : "") + (nyr ? '<g transform="translate(13,11)">' + R(0, 0, 4, 6, "#e0453a") + R(0, 0, 4, 1, "#ff7a6e") + R(1, 2, 2, 2, "#ffd23f") + "</g>" : "") + (seasonKind() === "vd" ? '<g transform="translate(6,11)">' + vdHeart(0, 0, "#e0457b") + R(1, 0, 1, 1, "#ff8fb3") + "</g>" : "") + "</g></g>";
    });
    if (nye) {
      var cc = ["#ffd23f", "#ff8fb3", "#6fb7ff", "#ffffff"], ci;
      s += '<g class="rcfs">';
      for (ci = 0; ci < 20; ci++) s += '<g transform="translate(' + ((ci * 19 + 5) % 156) + ',0)"><g class="rcf" style="animation-duration:' + (5 + (ci % 4)) + "s;animation-delay:-" + (ci * 0.9).toFixed(1) + 's">' + R(0, 0, 2, 1, cc[ci % 4]) + R(1, 1, 1, 1, cc[(ci + 1) % 4], 0.8) + "</g></g>";
      s += "</g>";
    }
    return s + "</g>";
  }
  /* 跨年夜派對結束後留在地上的彩帶紙屑（不擋點擊） */
  function nyScrapArt() {
    var cc = ["#ffd23f", "#ff8fb3", "#6fb7ff", "#ffffff", "#2dbf8f"], xs = [6, 19, 33, 47, 58, 71, 88, 97, 112, 125, 138, 150], ys = [90, 93, 88, 94, 91, 87, 93, 89, 94, 90, 87, 92], r = '<g id="rmscrap" style="pointer-events:none">', i;
    for (i = 0; i < 12; i++) r += R(xs[i], ys[i], i % 3 === 0 ? 2 : 1, 1, cc[i % 5]);
    return r + "</g>";
  }
  /* ===== 跨年夜（12/31）專屬：日曆最後一頁、零食桌 ===== */
  function dgStr(n, x, y, c) {
    var g = DG[n], r = "", k;
    for (k = 0; k < 15; k++) if (g.charAt(k) === "1") r += R(x + (k % 3), y + Math.floor(k / 3), 1, 1, c);
    return r;
  }
  /* 日曆：跨年夜顯示「31」最後一頁；小人撕掉之後換成「1」加金色亮點（nyCalFlip） */
  function calNyArt() {
    if (nyeAfter()) nyCalFlip = true;
    var D = "#0b2a5b", r = R(0, 0, 12, 14, "#fff") + R(0, 0, 12, 4, "#e0457b") + R(2, 0, 1, 2, "#555") + R(9, 0, 1, 2, "#555") + R(0, 13, 12, 1, "#b9dcf5");
    if (nyCalFlip) return r + dgStr(1, 4, 6, D) + R(9, 5, 1, 1, "#ffd23f") + R(8, 6, 3, 1, "#ffd23f") + R(9, 7, 1, 1, "#ffd23f") + R(1, 11, 2, 1, "#ffd23f");
    return r + dgStr(3, 3, 6, D) + dgStr(1, 7, 6, D);
  }
  /* 跨年零食桌：地板右邊一張矮桌，橘子、年糕、星星糖。可以點（跳一下＋台詞），練習室（r2）只當裝飾 */
  function nyeDeco(r2) {
    var t0 = R(0, 0, 30, 2, "#a8743f") + R(0, 2, 30, 1, "#8b5a2b") + R(2, 3, 2, 9, "#8b5a2b") + R(26, 3, 2, 9, "#8b5a2b");
    var orange = R(3, -5, 4, 4, "#ff9f1c") + R(4, -6, 1, 1, "#2dbf8f") + R(8, -4, 4, 3, "#ff9f1c") + R(9, -5, 1, 1, "#2dbf8f") + R(2, -1, 11, 1, "#e8eef5");
    var cake = R(17, -3, 7, 3, "#e8eef5") + R(18, -5, 5, 2, "#ffffff") + R(20, -6, 1, 1, "#e0453a") + R(17, -1, 7, 1, "#c7d2e0");
    var star = R(26, -2, 2, 2, "#ffd23f") + R(26, -3, 2, 1, "#fff1a8");
    var tx = r2 ? 76 : 122; /* 練習室右邊有筆記本（x≈122–134）和運動包（x≈140–156），桌子改放到它們左邊的空地 */
    return fxG("nyesnack", '<g transform="translate(' + tx + ',80)">' + t0 + orange + cake + star + "</g>", [tx - 1, 72, 32, 21], r2);
  }
  /* 新年的裝飾：牆上兩盞紅燈籠、地板右邊的紅包、左邊的金元寶。可以點（燈籠抖、紅包和元寶跳），練習室（r2）只當裝飾 */
  function lanternArt(x, y) {
    return R(x + 4, y - 3, 1, 3, "#8b5a2b") + R(x + 2, y, 4, 1, "#ffd23f") + R(x + 1, y + 1, 6, 1, "#e0453a") + R(x, y + 2, 8, 4, "#e0453a") + R(x + 1, y + 6, 6, 1, "#e0453a") +
      R(x + 3, y + 2, 1, 5, "#b02a20") + R(x + 5, y + 2, 1, 5, "#b02a20") + R(x + 2, y + 7, 4, 1, "#ffd23f") + R(x + 4, y + 8, 1, 3, "#ffd23f") + R(x + 1, y + 2, 1, 1, "#ff8a7a");
  }
  function envArt(x, y) {
    return R(x, y, 6, 8, "#e0453a") + R(x + 1, y + 1, 4, 1, "#b02a20") + R(x + 2, y + 4, 2, 2, "#ffd23f");
  }
  function nyDeco(r2) {
    var ingot = '<g transform="translate(34,86)">' + R(3, 0, 6, 2, "#ffe27a") + R(4, 0, 2, 1, "#ffffff") + R(0, 2, 12, 2, "#ffd23f") + R(1, 4, 10, 2, "#e0a800") + R(2, 6, 8, 1, "#b87333") + "</g>";
    return fxG("nylan", lanternArt(31, 4), [30, 0, 10, 16], r2) + fxG("nylan", lanternArt(151, 4), [150, 0, 10, 16], r2) +
      (r2 ? '<g transform="translate(-46,0)">' : "") + fxG("nyhb", envArt(128, 86), [127, 85, 8, 10], r2) + fxG("nyhb", envArt(135, 90), [134, 89, 8, 10], r2) + fxG("nyhb", envArt(142, 86), [141, 85, 8, 10], r2) + (r2 ? "</g>" : "") +
      fxG("nyingot", ingot, [33, 85, 14, 9], r2);
  }
  /* 聖誕樹：放在地板右側，16×18 格（比原本大），只是裝飾，不能點 */
  function xmasTree() {
    var g = "#2dbf8f", d = "#1f9a72", s = R(7, 0, 2, 2, "#ffd23f") + R(6, 1, 4, 1, "#ffd23f"), t = 0;
    [[7, 2], [6, 4], [5, 6], [4, 8], [3, 10], [2, 12], [1, 14]].forEach(function (a, i) {
      var w = a[0] === 7 ? 2 : 16 - 2 * a[0];
      s += R(a[0], a[1], w, 2, g) + R(a[0] + w - 2, a[1], 2, 2, d);
    });
    s += R(7, 16, 2, 2, "#8b5a2b") + R(6, 17, 4, 1, "#8b5a2b");
    s += R(7, 5, 1, 1, "#e0453a") + R(8, 7, 1, 1, "#ffd23f") + R(6, 9, 1, 1, "#6fb7ff") + R(10, 10, 1, 1, "#e0453a") + R(5, 12, 1, 1, "#ffd23f") + R(8, 12, 1, 1, "#6fb7ff") + R(3, 14, 1, 1, "#e0453a") + R(11, 14, 1, 1, "#ffd23f") + R(7, 15, 1, 1, "#e0453a");
    if (xmasLit) {
      var XL = [[7, 3], [8, 5], [6, 7], [9, 8], [5, 10], [10, 11], [4, 13], [8, 13], [12, 14], [6, 15]], XC = ["#e0453a", "#ffd23f", "#6fb7ff", "#ffffff"], xi;
      s = R(-2, 0, 20, 20, "#fff1a8", 0.12) + R(5, -1, 6, 4, "#fff1a8", 0.35) + s;
      for (xi = 0; xi < XL.length; xi++) s += '<g class="' + (xi % 2 ? "xlB" : "xlA") + '">' + R(XL[xi][0], XL[xi][1], 1, 1, XC[xi % 4]) + R(XL[xi][0] - 1, XL[xi][1], 3, 1, XC[xi % 4], 0.35) + "</g>";
    }
    return s;
  }
  /* 萬聖節的互動裝飾：糖果和掃帚可以點（跳一下／抖一下＋台詞），小人散步時也會自己去撿糖、拿掃帚。
     只在萬聖節出現（festProp 才會畫），class="rmfx"，由 fxHit() 處理 */
  var FXI = {
    hwcandy: { an: "hop", n: "糖果", say: ["不給糖就搗蛋！", "偷偷吃一顆，不會被發現吧。", "甜甜的，今天是萬聖節。"] },
    hwbroom: { an: "shake", n: "掃帚", say: ["女巫的掃帚，騎上去好像就能飛。", "掃帚靠在書架旁，隨時可以出發。"] },
    xgift: { an: "hop", n: "禮物盒", say: ["不知道裡面是什麼，好期待。", "搖一搖，好像有東西在動。", "是要送給誰的呢？"] },
    xcookie: { an: "hop", n: "餅乾和牛奶", say: ["給聖誕老人準備的，今晚會有人來吃嗎？", "餅乾還熱熱的，牛奶也倒好了。"] },
    xsock: { an: "shake", n: "聖誕襪", say: ["掛好聖誕襪，等著收禮物。", "襪子裡好像有顆糖果。"] },
    hwpump: { an: "hop", n: "南瓜燈", say: ["南瓜燈亮起來了，橘色的光暖暖的。", "燭光一閃一閃，萬聖節的氣氛來了。", "咧開嘴笑的南瓜，好像在說不給糖就搗蛋！"], off: ["燈熄了，南瓜安靜地蹲著。", "等天黑再點亮，會更有氣氛。"] },
    xtree: { an: "hop", n: "聖誕樹", say: ["樹亮起來了，窗外也下雪了。", "彩燈一閃一閃，聖誕節的氣氛來了。", "聽，窗外的雪沙沙地落下來。"], off: ["燈關掉了，樹安安靜靜站著。", "等一下再點亮，窗外的雪也會停。"] },
    nylan: { an: "shake", n: "燈籠", say: ["紅燈籠高高掛，過年的味道。", "燈籠晃呀晃，喜氣洋洋。"] },
    nyesnack: { an: "hop", n: "跨年零食桌", say: ["橘子和年糕，跨年一定要吃點好彩頭。", "偷拿一塊年糕，邊吃邊等倒數。", "桌上還有一顆星星糖，留到午夜再吃。"] },
    nyhb: { an: "hop", n: "紅包", say: ["新年快樂，恭喜發財！", "紅包拿來，裡面是滿滿的祝福。"] },
    nyingot: { an: "hop", n: "金元寶", say: ["金光閃閃，今年一定順順利利。", "沉甸甸的，好有福氣。"] },
    bdballoon: { an: "hop", n: "生日氣球", say: ["氣球飄呀飄，今天是你的日子。", "輕輕一碰，氣球就晃了起來。", "三顆氣球綁在一起，一起慶祝生日。"] },
    vdchoc: { an: "hop", n: "巧克力", say: ["情人節的巧克力，粉紅緞帶綁得好整齊。", "打開蓋子，每一顆都不一樣。", "分你一顆，剩下的我們一起吃。"] },
    vdheart: { an: "hop", n: "愛心", say: ["愛心飄呀飄，今天滿滿都是愛。", "輕輕一碰，愛心晃了起來。"] },
    bdwballoon: { an: "hop", n: "生日氣球", say: ["氣球先綁好了，生日快到囉。", "輕輕一碰，氣球就晃了起來。", "三顆氣球先綁在一起，等著慶祝生日。"] },
    bdpballoon: { an: "hop", n: "生日氣球", say: ["昨天的氣球還沒收，捨不得。", "輕輕一碰，氣球就晃了起來。", "派對散場了，氣球還留著一點餘味。"] },
    vdrose: { an: "shake", n: "玫瑰", say: ["一朵紅玫瑰，送給最喜歡的你。", "玫瑰的香味淡淡的，好像春天來了。"] },
    vdmail: { an: "shake", n: "郵筒", say: ["郵筒肚子裡，好像有信在等著寄出。", "投進去的心意，一定會寄到。"] },
    vdletter: { an: "hop", n: "情書", say: ["信封上蓋著愛心封印，不知道是寫給誰的。", "拆開看看吧，裡面寫著滿滿的心意。"] },
    bdgift: { an: "hop", n: "生日禮物", say: ["是給壽星的，裡面是什麼呢？", "包裝得好漂亮，不知道裝了什麼。", "七個人一起挑的禮物，藏不住心意。"] },
    prbottle: { an: "hop", n: "水壺和毛巾", say: ["練舞練到口渴，先喝口水補充體力。", "毛巾搭在水壺上，等一下還要擦汗。", "多喝水，七個人一起跳才不會累倒。"] },
    midlan: { an: "shake", n: "兔子燈", say: ["兔子燈亮亮的，像月亮上的玉兔。", "燈籠晃呀晃，中秋的味道。"] },
    midcake: { an: "hop", n: "月餅", say: ["中秋的月餅，一人一半才夠甜。", "蛋黃酥香香的，等月亮出來再吃。"] },
    midpomelo: { an: "hop", n: "柚子", say: ["柚子清清香香，剝一瓣來吃。", "中秋就是要吃柚子配月餅。"] },
    prshoes: { an: "shake", n: "運動鞋", say: ["練舞的球鞋，鞋底都快磨平了。", "有一隻歪倒了，趕快擺好再出發。", "鞋帶綁緊，今天也要練到最後一刻。"] }
  };
  function fxG(k, a, hit, inert) {
    if (inert) return '<g pointer-events="none">' + a + "</g>";
    return '<g class="rmfx" data-k="' + k + '" tabindex="0" role="button" aria-label="' + esc(t(FXI[k].n)) + '">' + (hit ? R(hit[0], hit[1], hit[2], hit[3], "transparent") : "") + a + "</g>";
  }
  /* 斜靠在書架旁的掃帚（深咖啡柄、紫色綁帶、黃色掃帚頭） */
  function broomArt() {
    var s = "", i, j, x0;
    for (i = 0; i < 20; i++) s += R(10 - Math.floor(i * 0.35), 64 + i, 2, 1, "#2e1a0c");
    s += R(2, 83, 5, 1, "#7b4fd6");
    for (j = 0; j < 9; j++) {
      x0 = 2 - Math.floor(j * 0.3);
      s += R(x0, 84 + j, 5 + Math.floor(j * 0.4), 1, "#e0a800") + R(x0 + 2, 84 + j, 1, 1, "#b87333");
    }
    return fxG("hwbroom", s, [0, 70, 12, 24]);
  }
  /* 地板上散落的糖果和一根棒棒糖：每一顆都能單獨點 */
  function candyArt(r2) {
    var sx = r2 ? -46 : 0; /* 練習室右邊的筆記本和運動包會被蓋到，右半邊的糖果往左移 */
    var cd = function (x, y, c, e) { return fxG("hwcandy", R(x + 1, y, 3, 2, c) + R(x, y, 1, 2, e) + R(x + 4, y, 1, 2, e), [x - 1, y - 2, 7, 6]); };
    return cd(116 + sx, 86, "#ff8a1f", "#ffd9a8") + cd(125 + sx, 91, "#7b4fd6", "#cdb8ff") + cd(134 + sx, 85, "#ff8fb3", "#ffd6e4") + cd(143 + sx, 92, "#ff8a1f", "#ffd9a8") + cd(46, 94, "#7b4fd6", "#cdb8ff") +
      fxG("hwcandy", '<g transform="translate(' + (120 + sx) + ',76)">' + R(1, 0, 3, 5, "#ff8fb3") + R(0, 1, 5, 3, "#ff8fb3") + R(2, 1, 1, 3, "#fff") + R(1, 2, 3, 1, "#fff") + R(2, 5, 1, 5, "#e8e8e8") + "</g>", [119 + sx, 75, 7, 12]);
  }
  /* 節日的下方說明文字（r2＝練習室） */
  function seasCap(r2) {
    var h = SEAS[seasonKind()];
    return "<b>" + h.tt + "</b><br>" + (r2 ? h.s2 : h.s1);
  }
  /* 牆上方的彩旗：兩段下垂的線，每 7 格掛一面三角旗。生日那天（傳入成員名）改成「那位成員的顏色＋白」交替 */
  function buntArt(n, pal) {
    var s = "", x, y;
    for (x = 0; x < 160; x += 2) s += R(x, 1 + Math.round(2 * Math.sin(Math.PI * (x % 80) / 80)), 2, 1, "#8b5a2b");
    for (x = 3; x < 158; x += 7) {
      y = 1 + Math.round(2 * Math.sin(Math.PI * (x % 80) / 80));
      var c = pal ? pal[Math.floor(x / 7) % pal.length] : n ? (Math.floor(x / 7) % 2 ? "#fff" : MC[WN.indexOf(n) % 7]) : MC[Math.floor(x / 7) % 7];
      s += R(x, y + 1, 3, 1, c) + R(x + 1, y + 2, 1, 1, c);
    }
    return s;
  }
  /* 「HAPPY BTS DAY」字母旗（只有 6/13 才有）：3×5 的像素字母，每個字母一面白色三角旗，旗面上的字用成員色；兩端高、中間垂下 */
  var BFONT = {
    H: ["101", "101", "111", "101", "101"], A: ["010", "101", "111", "101", "101"], P: ["110", "101", "110", "100", "100"],
    Y: ["101", "101", "010", "010", "010"], B: ["110", "101", "110", "101", "110"], T: ["111", "010", "010", "010", "010"],
    S: ["011", "100", "010", "001", "110"], D: ["110", "101", "101", "101", "110"], I: ["111", "010", "010", "010", "111"],
    R: ["110", "101", "110", "101", "101"]
  };
  /* 生日當天文字改成「HAPPY BIRTHDAY」，字用壽星的顏色 */
  function letterBanner(x0, y0, bn) {
    var txt = bn ? "HAPPY BIRTHDAY" : "HAPPY BTS DAY", s = "", x, i, k = 0, cx = x0, W = 0;
    for (i = 0; i < txt.length; i++) W += txt.charAt(i) === " " ? 3 : 6;
    var mc = bn ? MC[WN.indexOf(bn) % 7] : "";
    var sag = function (xx) { return y0 + Math.round(2 * Math.sin(Math.PI * (xx - x0) / W)); };
    for (x = x0; x < x0 + W; x += 2) s += R(x, sag(x), 2, 1, "#8b5a2b");
    for (i = 0; i < txt.length; i++) {
      var ch = txt.charAt(i);
      if (ch === " ") { cx += 3; continue; }
      var cc = mc || MC[k % 7], y = sag(cx + 2) + 1, c = cc === "#ffd23f" ? "#e0a800" : cc, f = BFONT[ch], r, q;
      s += R(cx, y, 5, 6, "#fff") + R(cx + 1, y + 6, 3, 1, "#fff") + R(cx + 2, y + 7, 1, 1, "#fff") + R(cx, y, 5, 1, c);
      for (r = 0; r < 5; r++) for (q = 0; q < 3; q++) if (f[r].charAt(q) === "1") s += R(cx + 1 + q, y + 1 + r, 1, 1, c);
      cx += 6; k++;
    }
    return '<g pointer-events="none">' + s + "</g>";
  }
  /* 生日當天的禮物堆（壽星的顏色，在 x,y）和三顆會輕輕上下飄的氣球（往右偏移 bx）；只是裝飾 */
  function bdDeco(n, x, y, bx, pre) {
    var c = MC[WN.indexOf(n) % 7], c2 = MC[(WN.indexOf(n) + 3) % 7];
    var bal = function (bx, by, col, d) { return '<g transform="translate(' + bx + "," + by + ')"><g class="rbal ' + d + '">' + R(1, 0, 3, 1, col) + R(0, 1, 5, 4, col) + R(1, 5, 3, 1, col) + R(1, 1, 1, 1, "#fff", 0.6) + R(2, 6, 1, 12, "#8b5a2b", 0.6) + "</g></g>"; };
    var gifts = giftArt(0, 4, 9, 6, c, "#fff") + giftArt(10, 6, 7, 4, "#fff", c) + giftArt(3, -1, 6, 5, "#ffd23f", "#e0457b");
    return '<g transform="translate(' + x + "," + y + ')">' + '<g transform="translate(' + (bx || 0) + ',0)">' + fxG(pre === 2 ? "bdpballoon" : pre ? "bdwballoon" : "bdballoon", bal(2, -22, c, "") + bal(8, -26, "#fff", "d1") + bal(14, -21, c2, "d2"), [1, -27, 18, 22]) + "</g>" +
      (pre ? "" : fxG("bdgift", gifts, [0, -1, 17, 11])) + "</g>";
  }
  /* 彩紙：14 小片用 CSS 慢慢飄下來，畫在最上層、不擋點擊 */
  function confArt() {
    var s = '<g class="rcfs">';
    for (var i = 0; i < 14; i++) {
      s += '<g transform="translate(' + ((i * 11 + 5) % 156) + ',0)"><g class="rcf" style="animation-duration:' + (5 + (i % 4)) + "s;animation-delay:-" + (i * 0.9).toFixed(1) + 's">' + (i % 2 ? R(0, 0, 1, 2, MC[i % 7]) : R(0, 0, 2, 1, MC[i % 7])) + "</g></g>";
    }
    return s + "</g>";
  }
  /* 蛋糕上的蠟燭火焰：兩個影格交替閃，旁邊一圈淡淡的光 */
  var FLAME = R(2, -3, 3, 3, "#ffe27a", 0.25) + '<g class="rflA">' + R(3, -2, 1, 1, "#fff1a8") + R(3, -1, 1, 1, "#ff8a5b") + '</g><g class="rflB">' + R(4, -2, 1, 1, "#fff1a8") + R(3, -1, 1, 1, "#ff8a5b") + "</g>";

  /* 新獲得的物品：右上角一顆閃爍的小星星（點該物品後消失）。 */
  function newMark(it) {
    return '<g class="rnw" transform="translate(' + (it.w - 2) + ',-4)">' + R(1, 0, 1, 3, "#ffd23f") + R(0, 1, 3, 1, "#ffd23f") + R(1, 1, 1, 1, "#fff") + "</g>";
  }

  var ITEMS = [
    { k: "rug", b: "m1", fb: "初次打卡", n: "地毯", x: 54, y: 76, w: 56, h: 16, an: "hop", say: "軟軟的地毯，踩起來很舒服。",
      art: R(0, 0, 56, 16, "#7b4fd6") + R(2, 2, 52, 12, "#b794ff") + R(5, 5, 46, 6, "#7b4fd6") + R(8, 7, 40, 2, "#ffd23f") },
    { k: "shoes", b: "fp-1", fb: "初次足跡", n: "球鞋", x: 12, y: 78, w: 17, h: 8, an: "hop", say: "穿上球鞋，照著成員的足跡走一圈。",
      art: R(1, 2, 6, 4, "#fff") + R(0, 5, 8, 2, "#e0457b") + R(2, 1, 3, 1, "#fff") + R(10, 2, 6, 4, "#fff") + R(9, 5, 8, 2, "#e0457b") + R(11, 1, 3, 1, "#fff") },
    { k: "clock", b: "h-open", fb: "開幕第一人", hid: 1, n: "時鐘", x: 42, y: 8, w: 12, h: 12, an: "shake", say: "clock",
      art: R(1, 0, 10, 12, "#7b4fd6") + R(0, 1, 12, 10, "#7b4fd6") + R(2, 2, 8, 8, "#fff") + R(6, 3, 1, 4, "#0b2a5b") + R(6, 6, 3, 1, "#0b2a5b") },
    { k: "cal", b: "h-last", fb: "壓線達陣", hid: 1, n: "日曆", x: 42, y: 24, w: 12, h: 14, an: "shake", say: "又撕掉一頁，日子一天天往演唱會靠近。",
      art: R(0, 0, 12, 14, "#fff") + R(0, 0, 12, 4, "#e0457b") + R(2, 0, 1, 2, "#555") + R(9, 0, 1, 2, "#555") + R(2, 6, 8, 1, "#9aa3c7") + R(2, 8, 8, 1, "#9aa3c7") + R(2, 10, 3, 2, "#e0457b") + R(0, 13, 12, 1, "#b9dcf5") },
    { k: "shelf", b: "v-fav", fb: "收藏家", n: "書架", x: 6, y: 16, w: 30, h: 50, an: "shake", say: "收藏的應援都整齊排在這裡。", art: artShelf() },
    { k: "trophy", b: "g-s", fb: "遊戲 S 級", n: "獎盃", x: 16, y: 7, w: 10, h: 9, an: "bounce", say: "應援遊戲 S 級！閃閃發亮。",
      art: R(2, 0, 6, 4, "#ffd23f") + R(0, 1, 2, 2, "#ffd23f") + R(8, 1, 2, 2, "#ffd23f") + R(4, 4, 2, 3, "#e0a800") + R(2, 7, 6, 2, "#b87333") },
    { k: "cabinet", b: "h-vow", fb: "言出必行", hid: 1, n: "收納櫃", x: 40, y: 48, w: 18, h: 18, an: "shake", say: "收藏的應援，全部都兌現了。",
      art: R(0, 0, 18, 18, "#b07a45") + R(1, 1, 16, 16, "#c99a6b") + R(9, 1, 1, 16, "#8b5a2b") + R(7, 8, 1, 3, "#ffd23f") + R(11, 8, 1, 3, "#ffd23f") },
    { k: "tube", b: "f-s7", fb: "連抽七天", n: "籤筒", x: 44, y: 40, w: 10, h: 8, an: "shake", say: "籤筒晃一晃，今天的運氣就靠你自己抽啦。",
      art: R(2, 0, 1, 3, "#ffd23f") + R(4, 0, 1, 3, "#fff") + R(6, 0, 1, 3, "#7b4fd6") + R(1, 3, 8, 5, "#e0457b") + R(2, 4, 1, 3, "#ff8fb3") },
    { k: "decal", b: "h-egg", fb: "七人大遊行", hid: 1, n: "七人壁貼", x: 106, y: 10, w: 46, h: 7, an: "bounce", say: "七個小人排排站，看著你。", art: artDecal() },
    { k: "tickets", b: "h-w3", fb: "三日全勤", hid: 1, x: 108, y: 24, w: 22, h: 12, an: "sway",
      /* 新年期間（2/4–2/10）：票根串換成春聯；解鎖條件、收藏清單的位置都不變，只換名稱、圖和台詞 */
      get n() { return seasonKind() === "ny" ? "春聯" : "票根串"; },
      get say() { return seasonKind() === "ny" ? "春聯貼好了，新的一年也一起好好應援。" : "三天全勤的票根，一張都沒少。"; },
      get art() { return seasonKind() === "ny" ? artCouplet() : artTickets(); } },
    { k: "moon", b: "h-nt", fb: "夜貓應援", hid: 1, n: "月亮貼紙", x: 136, y: 22, w: 12, h: 11, an: "bounce", say: "夜深了，小窩陪你一起熬夜。", art: artMoon() },
    { k: "lamp", b: "f-s3", fb: "連抽三天", n: "檯燈", x: 106, y: 36, w: 12, h: 16, an: "", say: "lamp", get art() { return artLamp(); } },
    { k: "photo", b: "h-egg2", fb: "合照時間", hid: 1, n: "合照相框", x: 122, y: 42, w: 12, h: 10, an: "bounce",
      get say() { return isAnniv() ? "6/13 的合照，七個人都戴上了派對帽。" : "七個人，一張合照。"; },
      get art() { return isAnniv() ? artPhoto613() : artPhoto(); } },
    { k: "cake", b: "h-613", fb: "出道紀念日", hid: 1, n: "小蛋糕", x: 138, y: 43, w: 9, h: 9, an: "bounce", say: "6/13 的蛋糕，出道紀念日快樂！",
      art: R(3, 0, 1, 2, "#ffd23f") + R(1, 2, 7, 2, "#fff") + R(0, 4, 9, 4, "#ff8fb3") + R(0, 6, 9, 1, "#e0457b") + R(0, 8, 9, 1, "#9aa3c7") },
    { k: "ball", b: "r-1", fb: "初次預測", n: "水晶球", x: 148, y: 42, w: 10, h: 10, an: "glow", say: "水晶球裡好像看到了……下一場的歌單？",
      art: R(2, 0, 6, 1, "#b794ff") + R(1, 1, 8, 6, "#b794ff") + R(0, 2, 10, 4, "#b794ff") + R(2, 2, 2, 2, "#fff") + R(1, 8, 8, 2, "#7b4fd6") + R(2, 7, 6, 1, "#7b4fd6") },
    { k: "plant", b: "x-app", fb: "常駐站民", n: "盆栽", x: 92, y: 32, w: 10, h: 14, an: "sway", say: "盆栽沙沙搖，歡迎常常回來。",
      art: R(4, 2, 2, 7, "#2dbf8f") + R(2, 4, 3, 3, "#2dbf8f") + R(5, 3, 3, 3, "#2dbf8f") + R(3, 1, 2, 2, "#2dbf8f") + R(2, 9, 6, 5, "#d9482f") + R(1, 9, 8, 1, "#b8381f") },
    { k: "poster", b: "f-1", fb: "初次抽籤", x: 64, y: 50, w: 16, h: 14, an: "shake",
      get n() { return tourKind() ? "演唱會海報" : "星星海報"; },
      get say() { return tourKind() === "today" ? "演唱會海報貼好了，今天就是正式演出！" : tourKind() === "eve" ? "演唱會海報貼好了，明天就要見面了。" : "星星海報：今天的運勢，抽籤才知道。"; },
      get art() { return tourKind() ? artTourPoster() : R(0, 0, 16, 14, "#7b4fd6") + R(1, 1, 14, 12, "#9d7be8") + R(7, 3, 2, 2, "#ffd23f") + R(4, 5, 8, 2, "#ffd23f") + R(5, 7, 6, 2, "#ffd23f") + R(4, 9, 3, 2, "#ffd23f") + R(9, 9, 3, 2, "#ffd23f"); } },
    { k: "stick", b: "h-live", fb: "現場見證", hid: 1, n: "手燈", x: 88, y: 48, w: 8, h: 18, an: "glow", say: "手燈亮起來了 💜",
      art: '<g class="halo">' + R(-4, -3, 16, 14, "#b794ff", 0.25) + R(-2, -1, 12, 10, "#b794ff", 0.25) + "</g>" + R(1, 0, 6, 5, "#b794ff") + R(2, 5, 4, 1, "#9d7be8") + R(3, 6, 2, 10, "#444") + R(2, 16, 4, 2, "#222") }
  ];

  /* ===== 第 2 間：練習室（13 件物品；6/13、成員生日當天另有裝飾，不算進完成度） =====
     物品欄位和第 1 間一樣。徽章代號 b 要在 app.js 的徽章表新增（這個檔只讀 badgeSync()，不改徽章資料）：
       p-game 玩過 5 首不同的歌 ｜ p-foot 足跡集滿 3 個國家 ｜ p-pass 匯出一次「ARMY 應援護照」｜ p-pred 預測 5 次
       p-chk 打卡 3 個應援地點 ｜ p-fav 收藏 10 個應援 ｜ p-sub 投稿一次 ｜ p-luck 累積抽籤 10 次
       （隱藏）p-late 凌晨 0–4 點打卡 ｜ p-dawn 連兩天深夜打卡 ｜ p-seven 七位成員都打卡過 ｜ p-week 連續打卡 7 天
     以上條件都是暫定，要調整只改 app.js 的徽章判斷，這裡不用動。
     第 13 件「練習課表」不新增徽章，直接用現有的 m10（應援高手：累計打卡 10 個）。
     an 新增兩種點擊動畫：eq（音量條跳動）、flash（相機閃光）。 */
  function artPspk() {
    var s = R(0, 0, 18, 22, "#2b2f3a") + R(1, 1, 16, 20, "#3a4050");
    [[2, 3], [6, 6], [10, 4], [14, 5]].forEach(function (b, i) { s += '<g class="rsb">' + R(b[0], 8 - b[1], 2, b[1], MC[i]) + "</g>"; });
    return s + R(6, 10, 6, 1, "#15171e") + R(5, 11, 8, 1, "#15171e") + R(4, 12, 10, 6, "#15171e") + R(5, 18, 8, 1, "#15171e") + R(6, 19, 6, 1, "#15171e") + R(6, 13, 6, 4, "#444") + R(8, 14, 2, 2, "#aab2c8");
  }
  /* 七個 X，位置對準七人隊形的第一種站位（站位的 x 中心 = 19 + 21×i） */
  function artPmark() {
    var s = "";
    for (var i = 0; i < 7; i++) {
      var x = 2 + i * 21, c = MC[i];
      s += R(x, 0, 1, 1, c) + R(x + 4, 0, 1, 1, c) + R(x + 1, 1, 1, 1, c) + R(x + 3, 1, 1, 1, c) + R(x + 2, 2, 1, 1, c) + R(x + 1, 3, 1, 1, c) + R(x + 3, 3, 1, 1, c) + R(x, 4, 1, 1, c) + R(x + 4, 4, 1, 1, c);
    }
    return s;
  }
  function artPtripod() {
    var s = R(2, 0, 8, 6, "#222") + R(3, 1, 6, 4, "#3a4050") + R(5, 2, 2, 2, "#6fb7ff") + R(8, 1, 1, 1, "#e0457b") + R(5, 6, 2, 10, "#555");
    for (var k = 0; k < 8; k++) s += R(5 - Math.round(k * 0.7), 16 + k, 1, 1, "#444") + R(6 + Math.round(k * 0.7), 16 + k, 1, 1, "#444");
    return s + '<g class="rfl">' + R(-4, -4, 20, 14, "#fff", 0.85) + "</g>";
  }
  function artPboard() {
    return R(0, 0, 20, 14, "#aab2c8") + R(1, 1, 18, 11, "#fff") + R(2, 13, 16, 1, "#8b5a2b") +
      R(4, 3, 1, 5, "#555") + R(2, 7, 3, 2, "#555") + R(5, 3, 2, 1, "#555") +
      R(10, 3, 7, 1, "#7b4fd6") + R(10, 5, 6, 1, "#9aa3c7") + R(10, 7, 7, 1, "#e0457b") + R(10, 9, 4, 1, "#9aa3c7");
  }
  function artPwater() {
    return R(1, 0, 3, 1, "#e0457b") + R(1, 1, 3, 1, "#aab2c8") + R(0, 2, 5, 8, "#bfe3ff") + R(0, 2, 1, 8, "#fff", 0.6) + R(1, 5, 3, 2, "#7b4fd6");
  }
  function artPtowel() {
    return R(0, 0, 9, 3, "#9ad0ff") + R(1, 3, 7, 8, "#6fb7ff") + R(1, 5, 7, 1, "#fff") + R(1, 8, 7, 1, "#fff") + R(1, 11, 7, 1, "#4a90d6");
  }
  function artPbag() {
    return R(4, 0, 8, 1, "#222") + R(3, 1, 1, 3, "#222") + R(12, 1, 1, 3, "#222") + R(0, 3, 16, 9, "#2b2f3a") + R(1, 4, 14, 7, "#3a4050") +
      R(2, 6, 12, 1, "#aab2c8") + R(6, 8, 4, 2, "#7b4fd6") + R(0, 8, 3, 4, "#222");
  }
  function artPphone() {
    return R(1, 0, 6, 6, "#222") + R(2, 1, 4, 4, "#6fb7ff") + R(2, 1, 1, 1, "#fff") + R(3, 6, 2, 4, "#888") + R(1, 10, 6, 2, "#555");
  }
  function artPclock() {
    return R(1, 0, 10, 12, "#19b5c9") + R(0, 1, 12, 10, "#19b5c9") + R(2, 2, 8, 8, "#fff") + R(6, 3, 1, 4, "#0b2a5b") + R(3, 6, 4, 1, "#0b2a5b");
  }
  function artPwin() {
    return R(0, 0, 20, 20, "#8b5a2b") + R(2, 2, 16, 4, "#7b6fd0") + R(2, 6, 16, 4, "#e58fb0") + R(2, 10, 16, 4, "#ffb36b") + R(2, 14, 16, 4, "#ffe27a") +
      R(8, 11, 5, 3, "#fff1a8") + R(9, 10, 3, 1, "#fff1a8") + R(2, 15, 16, 3, "#3a4163") + R(9, 2, 2, 16, "#8b5a2b") + R(2, 9, 16, 1, "#8b5a2b");
  }
  /* 日出窗在練習室裡會跟著晝夜變：還沒解鎖「練到天亮」＝一直是夜空；解鎖後白天是日出，夜晚是夜空加上地平線一抹快亮的光 */
  function artPwinNight(glow) {
    var s = R(0, 0, 20, 20, "#8b5a2b") + R(2, 2, 16, 4, "#141a3d") + R(2, 6, 16, 4, "#1b2350") + R(2, 10, 16, 4, "#232d63") + R(2, 14, 16, 4, "#2c3670");
    s += R(4, 3, 3, 3, "#fff1a8") + R(5, 3, 2, 2, "#141a3d");
    s += R(13, 3, 1, 1, "#fff") + R(16, 5, 1, 1, "#fff", 0.8) + R(12, 7, 1, 1, "#fff", 0.8) + R(15, 8, 1, 1, "#fff") + R(3, 8, 1, 1, "#fff", 0.8) + R(7, 7, 1, 1, "#fff");
    if (glow) s += R(2, 12, 16, 1, "#4a3f8f") + R(2, 13, 16, 1, "#9a5f9f") + R(2, 14, 16, 1, "#ffb36b", 0.9);
    return s + R(2, 15, 16, 3, "#2a2f4d") + R(9, 2, 2, 16, "#8b5a2b") + R(2, 9, 16, 1, "#8b5a2b");
  }
  function pwinArt(on, night) {
    return on ? (night ? artPwinNight(true) : artPwin()) : artPwinNight(false);
  }
  function artPrack() {
    var s = R(0, 0, 21, 1, "#555");
    for (var i = 0; i < 7; i++) s += R(i * 3 + 1, 1, 1, 1, "#aab2c8") + R(i * 3, 2, 3, 9, MC[i]) + R(i * 3 + 1, 2, 1, 1, "#fff");
    return s;
  }
  function artPlog() {
    return R(0, 1, 12, 6, "#e0457b") + R(1, 0, 5, 6, "#fff") + R(6, 0, 5, 6, "#fff") + R(5, 0, 2, 6, "#9aa3c7") + R(2, 1, 3, 1, "#9aa3c7") + R(2, 3, 3, 1, "#9aa3c7") + R(7, 1, 3, 1, "#9aa3c7") + R(8, 4, 3, 1, "#ffd23f");
  }
  function artPsched() {
    var s = R(0, 0, 22, 14, "#aab2c8") + R(1, 1, 20, 12, "#fff") + R(1, 1, 20, 3, "#7b4fd6") + R(10, 0, 2, 1, "#e0457b");
    [5, 9, 13, 17].forEach(function (x) { s += R(x, 4, 1, 9, "#d5dbe8"); });
    [7, 10].forEach(function (y) { s += R(1, y, 20, 1, "#d5dbe8"); });
    return s + R(2, 5, 3, 2, MC[1]) + R(6, 5, 3, 2, MC[3]) + R(14, 5, 3, 2, MC[4]) + R(10, 8, 3, 2, MC[2]) + R(18, 8, 3, 2, MC[5]) + R(2, 11, 3, 1, MC[0]) + R(14, 11, 3, 1, MC[6]);
  }
  var ITEMS2 = [
    { k: "pmark", b: "p-foot", fb: "站好位置", n: "隊形貼紙", x: 15, y: 89, w: 133, h: 5, an: "hop", say: "站好位置，七個人一個都不能錯。", art: artPmark() },
    { k: "pspk", b: "p-game", fb: "節拍練習生", n: "音響", x: 136, y: 44, w: 18, h: 22, an: "eq", say: "節拍開起來，從頭再跳一次。", art: artPspk() },
    { k: "ptripod", b: "p-pass", fb: "錄影存檔", n: "三腳架", x: 5, y: 42, w: 12, h: 24, an: "flash", say: "錄下來，晚點再檢討。", art: artPtripod() },
    { k: "pboard", b: "p-pred", fb: "練習曲目", n: "白板", x: 116, y: 8, w: 20, h: 14, an: "shake", say: "今天的練習曲，你猜是哪一首？", art: artPboard() },
    { k: "pwater", b: "p-chk", fb: "補水時間", n: "水瓶", x: 116, y: 56, w: 5, h: 10, an: "hop", say: "補水時間。", art: artPwater() },
    { k: "ptowel", b: "p-fav", fb: "汗水毛巾", n: "毛巾", x: 44, y: 47, w: 9, h: 12, an: "sway", say: "練到流汗，毛巾先掛這裡。", art: artPtowel() },
    { k: "pbag", b: "p-sub", fb: "整裝待發", n: "運動包", x: 140, y: 76, w: 16, h: 12, an: "shake", say: "東西都帶齊了，隨時可以出發。", art: artPbag() },
    { k: "pphone", b: "p-luck", fb: "排進行程", n: "手機架", x: 127, y: 56, w: 8, h: 12, an: "bounce", say: "今天的運勢，順便排進練習表。", art: artPphone() },
    { k: "pclock", b: "p-late", fb: "練到深夜", hid: 1, n: "掛鐘", x: 68, y: 5, w: 12, h: 12, an: "shake", say: "pclock", art: artPclock() },
    { k: "pwin", b: "p-dawn", fb: "練到天亮", hid: 1, n: "日出窗", x: 138, y: 8, w: 20, h: 20, an: "bounce", say: "不知不覺，天亮了。", art: artPwin() },
    { k: "prack", b: "p-seven", fb: "七件同款", hid: 1, n: "練習服掛架", x: 1, y: 8, w: 21, h: 12, an: "sway", say: "七件，一件不少。", art: artPrack() },
    { k: "plog", b: "p-week", fb: "每日練習", hid: 1, n: "練習日誌", x: 122, y: 72, w: 12, h: 7, an: "hop", say: "今天也有好好練習。", art: artPlog() },
    { k: "psched", b: "m10", fb: "應援高手", n: "練習課表", x: 30, y: 3, w: 22, h: 14, an: "shake", say: "這週的課表排得滿滿的，照表操課。", art: artPsched() }
  ];

  /* ===== 第 3 間：應援街區 =====
     一條夜晚的小街，用網站「類型達人」徽章（t-類型）蓋起來：9 種打卡類型各一處，加上「全類型收集」（t-all）整條街亮燈。
     網站只有某個類型至少有 2 個活動才會產生那個類型的徽章，所以目前資料裡還沒有徽章的類型，物品會一直是暗暗的剪影，等活動變多就會自己解鎖。
     artf(nt)＝場景裡用的畫法（nt 為 true 是夜晚，招牌、螢幕、窗戶會發光）；art＝收藏清單裡用的（亮著的樣子）。 */
  var PCS = ["#8e6bd8", "#ff8fb3", "#ffd23f", "#2dbf8f", "#6fb7ff", "#ff9f1c", "#b794ff"];
  function stArt(k, nt) {
    var s = "", i, c, o = nt ? 1 : 0.55;
    var BH = [8, 12, 6, 14, 10, 16, 7, 12, 9, 13, 6, 11], TH = [4, 7, 5, 9, 6, 8, 4, 7];
    var G = { A: ["0110", "1001", "1111", "1001", "1001"], R: ["1110", "1001", "1110", "1010", "1001"], M: ["1001", "1111", "1111", "1001", "1001"], Y: ["1001", "1001", "0110", "0010", "0010"] }, W = "ARMY", li, ry, cx, g;
    switch (k) {
      case "sflag": /* 應援旗串：整條街頂上掛一排七種顏色的小旗 */
        s = R(0, 2, 156, 1, "#c9b28a");
        for (i = 0; i < 26; i++) { c = PCS[i % 7]; s += R(i * 6, 3, 5, 2, c) + R(i * 6 + 1, 5, 3, 2, c) + R(i * 6 + 2, 7, 1, 1, c); }
        break;
      case "sled": /* LED 電視牆：黑框、螢幕裡七種顏色的節拍條 */
        s = (nt ? R(-2, -2, 50, 30, "#8e6bd8", 0.18) : "") + R(0, 0, 46, 26, "#1c2038") + R(2, 2, 42, 22, nt ? "#0d1230" : "#3a4062");
        for (i = 0; i < 12; i++) s += R(4 + i * 3, 22 - BH[i], 2, BH[i], PCS[i % 7], o);
        s += R(2, 2, 42, 1, "#ffffff", 0.15);
        break;
      case "sneon": /* 全類型收集：霓虹招牌 ♥ARMY♥ */
        s = (nt ? R(-2, -2, 36, 16, "#ff8fd0", 0.18) : "") + R(0, 0, 32, 12, "#1c2038") + R(1, 1, 30, 10, "#2a2f5a");
        c = nt ? "#ff8fd0" : "#8a90c0";
        s += R(2, 4, 1, 1, c) + R(4, 4, 1, 1, c) + R(2, 5, 3, 1, c) + R(3, 6, 1, 1, c) + R(27, 4, 1, 1, c) + R(29, 4, 1, 1, c) + R(27, 5, 3, 1, c) + R(28, 6, 1, 1, c);
        for (li = 0; li < 4; li++) { g = G[W.charAt(li)]; for (ry = 0; ry < 5; ry++) for (cx = 0; cx < 4; cx++) if (g[ry].charAt(cx) === "1") s += R(6 + li * 5 + cx, 3 + ry, 1, 1, nt ? (li < 2 ? "#ffffff" : "#d8c8ff") : "#aab0d0"); }
        break;
      case "sexh": /* 展覽：立式海報框（裡面一顆紫色愛心）、上面一盞投射燈 */
        s = (nt ? R(3, 5, 16, 14, "#fff1a8", 0.16) : "") + R(9, 0, 4, 2, "#6b7391") + R(10, 2, 2, 3, "#6b7391") + R(2, 8, 18, 22, "#d9c7a0") + R(4, 10, 14, 18, nt ? "#2a2f5a" : "#ece8ff") +
          R(7, 13, 3, 3, "#7b4fd6") + R(12, 13, 3, 3, "#7b4fd6") + R(7, 16, 8, 3, "#7b4fd6") + R(8, 19, 6, 2, "#7b4fd6") + R(10, 21, 2, 1, "#7b4fd6") +
          R(6, 24, 10, 1, nt ? "#8a90c0" : "#aab0d0") + R(8, 26, 6, 1, nt ? "#8a90c0" : "#aab0d0") + R(4, 30, 2, 4, "#8b5a2b") + R(16, 30, 2, 4, "#8b5a2b");
        break;
      case "skm": /* 快閃店：粉白條紋的棚子、櫃檯上三樣周邊、一顆氣球 */
        for (i = 0; i < 11; i++) s += R(1 + i * 2, 4, 2, 5, i % 2 ? "#ffffff" : "#ff5d8f") + R(1 + i * 2, 9, 2, 1, i % 2 ? "#ffffff" : "#ff5d8f");
        s += R(0, 3, 22, 2, "#e04a7a") + R(1, 10, 2, 14, "#8b5a2b") + R(19, 10, 2, 14, "#8b5a2b") + R(3, 17, 16, 7, "#b07a45") + R(3, 17, 16, 2, "#d9a96b") +
          R(5, 14, 3, 3, "#7b4fd6") + R(10, 14, 3, 3, "#ffd23f") + R(15, 14, 3, 3, "#2dbf8f") + R(18, 0, 3, 3, "#ff8fb3") + R(19, 3, 1, 4, "#aab0d0") + (nt ? R(2, 10, 18, 3, "#fff1a8", 0.25) : "");
        break;
      case "slb": /* 燈箱／看板：立在柱子上的發光看板，裡面一顆紫色愛心 */
        s = (nt ? R(-1, -1, 20, 22, "#fff6c4", 0.2) : "") + R(1, 0, 16, 20, "#cfd5ea") + R(3, 2, 12, 16, nt ? "#fff6c4" : "#e8ecff") +
          R(5, 5, 3, 3, "#7b4fd6") + R(10, 5, 3, 3, "#7b4fd6") + R(5, 8, 8, 3, "#7b4fd6") + R(6, 11, 6, 2, "#7b4fd6") + R(8, 13, 1, 1, "#7b4fd6") + R(9, 13, 1, 1, "#7b4fd6") + R(5, 15, 8, 1, "#9aa0c0") +
          R(8, 20, 2, 10, "#6b7391") + R(5, 30, 8, 2, "#6b7391");
        break;
      case "scf": /* 咖啡廳：黃白條紋的陽傘、小圓桌、兩張椅子 */
        for (i = 0; i < 6; i++) s += R(2 + i * 3, 0, 3, 3, i % 2 ? "#ffffff" : "#ffd23f");
        s += R(1, 3, 20, 1, "#e0b020") + R(10, 4, 2, 7, "#8b5a2b") + R(4, 11, 14, 1, "#b07a45") + R(6, 12, 1, 4, "#8b5a2b") + R(15, 12, 1, 4, "#8b5a2b") +
          R(8, 9, 2, 2, "#ffffff") + R(13, 9, 2, 2, "#ffffff") + R(0, 10, 3, 6, "#c9a06a") + R(19, 10, 3, 6, "#c9a06a") + (nt ? R(3, 4, 16, 6, "#fff1a8", 0.18) : "");
        break;
      case "sbus": /* 公車站牌：玻璃候車亭、長椅、旁邊立著藍色站牌 */
        s = R(0, 6, 15, 2, "#5a6a9a") + R(1, 8, 13, 16, nt ? "#3a4f9a" : "#cfe8f5", nt ? 0.9 : 0.6) + R(3, 19, 10, 2, "#b07a45") + R(4, 21, 1, 3, "#8b5a2b") + R(11, 21, 1, 3, "#8b5a2b") +
          R(17, 0, 2, 28, "#6b7391") + R(14, 0, 6, 8, "#2d6bd6") + R(15, 2, 4, 3, "#ffffff") + R(15, 6, 4, 1, "#ffd23f") + (nt ? R(3, 9, 10, 1, "#fff6c4") + R(1, 8, 13, 16, "#fff6c4", 0.08) : "");
        break;
      case "scafe": /* 應援咖啡廳：紫白遮陽棚的店面、發光的窗和兩只杯子、粉紅愛心招牌 */
        s = (nt ? R(-2, 4, 46, 38, "#ffe9a8", 0.1) : "") + R(0, 8, 42, 32, nt ? "#5b4a8a" : "#cdbbe8");
        for (i = 0; i < 14; i++) s += R(i * 3, 8, 3, 6, i % 2 ? "#ffffff" : "#7b4fd6") + R(i * 3, 14, 3, 2, i % 2 ? "#ffffff" : "#7b4fd6");
        s += R(4, 18, 22, 16, nt ? "#ffe9a8" : "#bfe3f5") + R(14, 18, 1, 16, "#8b5a2b") + R(8, 27, 4, 5, "#ffffff") + R(9, 24, 1, 2, "#e8e8f4") + R(18, 27, 4, 5, "#ffffff") + R(19, 24, 1, 2, "#e8e8f4") +
          R(29, 18, 9, 22, "#8b5a2b") + R(30, 19, 7, 20, "#b07a45") + R(35, 29, 1, 2, "#ffd23f") +
          R(18, 0, 2, 2, "#ff5d8f") + R(22, 0, 2, 2, "#ff5d8f") + R(18, 2, 6, 2, "#ff5d8f") + R(19, 4, 4, 1, "#ff5d8f") + R(20, 5, 2, 1, "#ff5d8f");
        break;
      case "struck": /* LED 廣告車：白色車廂（整面 LED 節拍條）、紫色車頭、兩個輪子 */
        s = R(0, 2, 42, 17, "#e4e8f6") + R(0, 2, 42, 2, "#c9cfe6") + R(2, 5, 38, 12, nt ? "#101840" : "#3a4062");
        for (i = 0; i < 8; i++) s += R(4 + i * 4, 17 - TH[i], 3, TH[i], PCS[i % 7], o);
        s += R(42, 7, 12, 12, "#7b4fd6") + R(42, 7, 12, 2, "#6a42c0") + R(46, 9, 6, 5, "#bfe3f5") + R(53, 15, 3, 4, "#c9cfe6") +
          R(6, 17, 9, 6, "#1c2038") + R(8, 19, 5, 3, "#8a90a8") + R(36, 17, 9, 6, "#1c2038") + R(38, 19, 5, 3, "#8a90a8") + (nt ? R(54, 14, 2, 2, "#fff1a8") + R(56, 13, 4, 4, "#ffe9a8", 0.45) : "");
        break;
    }
    return s;
  }
  function stItem(k, b, fb, n, x, y, w, h, an, say) {
    return { k: k, b: b, fb: fb, n: n, x: x, y: y, w: w, h: h, an: an, say: say, art: stArt(k, true), artf: function (nt) { return stArt(k, nt); } };
  }
  var ITEMS3 = [
    stItem("sflag", "t-應援企劃", "應援企劃達人", "應援旗", 2, 1, 156, 9, "sway", "彩旗一面一面掛起來，整條街都是應援的味道。"),
    stItem("sled", "t-LED電視牆", "LED電視牆達人", "LED 電視牆", 50, 10, 46, 26, "flash", "大螢幕亮起來了，節拍跟著畫面一起跳。"),
    stItem("sneon", "t-all", "全類型收集", "霓虹招牌", 100, 13, 32, 12, "flash", "每一種應援都集齊了，整條街的燈全部亮起。"),
    stItem("sexh", "t-展覽", "展覽達人", "展覽", 2, 36, 22, 34, "hop", "展覽開幕了，進去慢慢看，別急。"),
    stItem("skm", "t-快閃店", "快閃店達人", "快閃店", 26, 46, 22, 24, "bounce", "快閃店限定周邊，今天也排了好長的隊。"),
    stItem("slb", "t-燈箱/看板", "燈箱/看板達人", "燈箱看板", 50, 38, 18, 32, "flash", "燈箱亮著，路過的人都會停下來拍一張。"),
    stItem("scf", "t-咖啡廳", "咖啡廳達人", "咖啡廳", 68, 54, 22, 16, "sway", "坐下來喝杯咖啡，等下一站再出發。"),
    stItem("sbus", "t-公車站牌", "公車站牌達人", "公車站牌", 94, 42, 20, 28, "shake", "站牌旁邊拍照打卡，公車來了先讓它過。"),
    stItem("scafe", "t-應援咖啡廳", "應援咖啡廳達人", "應援咖啡廳", 116, 30, 42, 40, "bounce", "應援咖啡廳的杯套今天也很好看。"),
    stItem("struck", "t-LED廣告車", "LED廣告車達人", "LED 廣告車", 12, 74, 60, 24, "hop", "廣告車慢慢開過去，整條街都跟著抬頭看。")
  ];
  var ALL = ITEMS.concat(ITEMS2, ITEMS3);

  /* ===== 房間表 =====
     新增房間：在 ROOMS 加一筆，再補上該房間的 items、scene 函式（以及需要時的 tick 函式，見 open() 裡的 TICKS）。
     id      房間代號（也是別的房間 gate 要填的值）
     chip    房間選擇器上的標籤（要在 LT 裡有翻譯，例如「第 3 間」）
     name    房間名稱，開放後才顯示（鎖著時顯示「？？？」）
     items   這間的物品清單（徽章代號 b 必須全站唯一，room-seen 才不會混在一起）
     scene   (S, full) → 這間的 SVG 字串
     gate    要先完成哪一間才會開放（填那間的 id）；null＝一開始就開放
     pub     true＝正式開放（仍要先完成 gate）；false＝只有預覽能進。第 1 間不需要
     pv／pvAll／pvStart  預覽開關：pv＝這台裝置已預覽解鎖；pvAll＝這次開啟把物品全部當成已獲得；pvStart＝網址 ?preview= 以此開頭就直接開在這間
     lazy    true＝要真的進到這間，才把物品標成「看過」（NEW 星星才不會在還沒進去前就被吃掉）
     wmax    小人散步的右邊界；ng＝這間有新年拜年；alt＝節日／巡演文字用「練習室版」
     popTitle 這間集滿時，打開小窩會跳「前往下一個房間」彈窗的標題（沒填就不跳；下一間也已集滿時同樣不跳）
     pct     完成度標籤；cap＝節日、完成、提示的下方文字；lock＝鎖著時的說明；unlocked＝前一間完成時彈窗上的文字 */
  var ROOMS = [
    { id: "nest", chip: "第 1 間", name: "彩蛋小窩", items: ITEMS, scene: scene, gate: null, lazy: false, wmax: 112, ng: true, alt: false, pvAll: P1ALL,
      pct: "小窩完成度", popTitle: "第一個房間完成了！",
      cap: { anniv: "小窩也掛上彩旗了。", bd: "小窩為壽星布置好了。", bw: "小窩先掛上彩旗和氣球了。", aw: "小窩先掛上彩旗了。", ax: "小窩的彩旗還沒收，捨不得。", nye: "點時鐘看跨年倒數，晚上窗外有煙火。", done: "<b>小窩完成！</b><br>窗外好像有七個人影在揮手……", hint: "點房間裡的東西看看。暗暗的剪影是還沒解鎖的物品。" } },
    { id: "prac", chip: "第 2 間", name: "練習室", items: ITEMS2, scene: scene2, gate: "nest", lazy: true, wmax: 108, ng: false, alt: true,
      pub: ROOM2_PUBLIC, pv: ROOM2_PV, pvAll: P2ALL, pvStart: "room2",
      pct: "練習室完成度",
      cap: { anniv: "練習室也掛上彩旗了。", bd: "練習室為壽星布置好了。", bw: "練習室先掛上彩旗和氣球了。", aw: "練習室先掛上彩旗了。", ax: "練習室的彩旗還沒收，捨不得。", nye: "練習室也迎接新的一年了。", done: "<b>練習室完成！</b><br>七個人站好位置了，準備開跳。", hint: "點練習室裡的東西看看。暗暗的剪影是還沒解鎖的物品。" },
      lock: { wait: "完成第一個房間後解鎖。", ready: "第一個房間已完成，新房間準備中。" },
      unlocked: "練習室開放了，快去看看。" },
    { id: "street", chip: "第 3 間", name: "應援街區", items: ITEMS3, scene: scene3, gate: "prac", lazy: true, wmax: 128, soft: true, ng: false, alt: false,
      pub: ROOM3_PUBLIC, pv: ROOM3_PV, pvAll: P3ALL, pvStart: "room3",
      pct: "街區完成度",
      cap: { anniv: "街上也掛滿彩旗了。", bd: "街區為壽星亮燈了。", bw: "街區先掛上彩旗了。", aw: "街區先掛上彩旗了。", ax: "街區的彩旗還沒收，捨不得。", nye: "街區也迎接新的一年了。", done: "<b>應援街區完成！</b><br>整條街的燈都亮了。", hint: "點街上的東西看看。暗暗的剪影是還沒解鎖的物品。" },
      lock: { wait: "完成第二個房間後解鎖。", ready: "第二個房間已完成，新房間準備中。" },
      unlocked: "應援街區開放了，快去看看。" }
  ];
  function roomIx(id) { for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].id === id) return i; return -1; }
  /* 這間房要算完成度的物品。soft 房間（應援街區）的物品綁的是「資料夠了才會出現」的徽章（某個類型要有 2 個以上的活動才有「類型達人」），
     徽章還不存在、也還沒解鎖的物品先不算進完成度，等網站有了那個徽章才自動算進來；讀不到徽章清單時，照原本全部算 */
  function roomItems(i) {
    var its = ROOMS[i].items;
    if (!ROOMS[i].soft) return its;
    try {
      var have = {}, a;
      getBs().L.forEach(function (b) { have[b.id] = 1; });
      a = its.filter(function (it) { return have[it.b]; });
      return a.length ? a : its;
    } catch (e) { return its; }
  }
  function roomN(i, st) { return count(st, roomItems(i)); }
  function roomPct(i, st) { return Math.round((roomN(i, st) / roomItems(i).length) * 100); }
  function roomFull(i, st) { return roomN(i, st) >= roomItems(i).length; }
  function roomOpen(i, st) {
    var r = ROOMS[i], g;
    if (!r.gate || r.pv) return true;
    g = roomIx(r.gate);
    return !!r.pub && g >= 0 && roomOpen(g, st) && roomFull(g, st);
  }
  function startRoom() {
    for (var i = 0; i < ROOMS.length; i++) if (ROOMS[i].pvStart && (PV.indexOf(ROOMS[i].pvStart) === 0 || ROOMS[i].pvAll)) return i;
    return 0;
  }

  /* ===== 窗外煙火（只有小窩 100% 才有）：一格一格的像素，共 8 影格——前 3 格火箭上升，後 5 格爆開、變淡 ===== */
  var HFW = ["011000110", "111101111", "111111111", "111111111", "011111110", "001111100", "000111000", "000010000"];
  /* 00:00 小儀式的三輪煙火：每輪 5～6 發「同時」升空、同時爆開（x, y, 顏色編號） */
  var NYR = [[[70, 17, 0], [78, 22, 2], [86, 16, 4], [91, 22, 5], [82, 13, 6]], [[73, 19, 1], [81, 15, 3], [88, 20, 6], [69, 23, 5], [92, 15, 2]], [[68, 16, 0], [75, 22, 3], [82, 17, 5], [89, 23, 1], [92, 16, 4], [80, 25, 6]]];
  function fwHtml(b, f) {
    var s = "", c1 = MC[b.c], c2 = MC[(b.c + 3) % 7];
    if (b.h && f >= 3) {
      var kh = f - 3, oh = [1, 1, 0.85, 0.55, 0.3];
      if (kh >= 5) return "";
      HFW.forEach(function (row, r) { for (var q = 0; q < 9; q++) if (row.charAt(q) === "1") s += R(b.x - 4 + q, b.y - 4 + r, 1, 1, r < 3 ? "#ff8fb3" : "#e0457b", oh[kh]); });
      if (kh === 0) s += R(b.x - 1, b.y, 3, 1, "#fff") + R(b.x, b.y - 1, 1, 3, "#fff");
      return s;
    }
    if (f < 3) {
      var y = 34 - Math.round((34 - b.y) * (f + 1) / 3);
      return R(b.x, y, 1, 2, "#fff") + R(b.x, y + 2, 1, 1, "#ffd23f");
    }
    var k = f - 3, rs = [1, 3, 5, 6, 7], os = [1, 1, 0.8, 0.55, 0.3];
    if (k >= rs.length) return "";
    for (var a = 0; a < 12; a++) {
      var rad = a * Math.PI / 6;
      s += R(b.x + Math.round(Math.cos(rad) * rs[k]), b.y + Math.round(Math.sin(rad) * rs[k]), 1, 1, a % 2 ? c1 : c2, os[k]);
    }
    if (k === 0) s += R(b.x - 1, b.y, 3, 1, "#fff") + R(b.x, b.y - 1, 1, 3, "#fff");
    return s;
  }

  /* ===== 窗外的海（白天／夜晚），集滿 100% 會多七個人影 ===== */
  function win(night, full) {
    var s = night
      ? R(64, 10, 32, 28, "#0b1f4d") + R(64, 26, 32, 12, "#10306e") + R(68, 14, 1, 1, "#fff") + R(90, 13, 1, 1, "#fff") + R(74, 18, 1, 1, "#7cf2ff") + R(86, 22, 1, 1, "#7cf2ff") +
        '<g class="fish">' + R(70, 22, 4, 3, "#c9a7ff") + R(71, 25, 1, 3, "#c9a7ff") + R(73, 25, 1, 2, "#c9a7ff") + "</g>"
      : R(64, 10, 32, 28, "#7cc4ff") + R(64, 10, 32, 8, "#9bd3ff") + R(70, 10, 3, 28, "#fff", 0.15) + R(84, 10, 3, 28, "#fff", 0.12) + R(75, 16, 1, 1, "#fff") + R(90, 20, 1, 1, "#fff") +
        '<g class="fish">' + R(68, 24, 4, 2, "#ff8a5b") + R(72, 23, 1, 4, "#ff8a5b") + R(67, 25, 1, 1, "#fff") + "</g>";
    if (seasonKind() === "mid") s += midMoon(night);
    if (seasonKind() === "xmas") s += xmasWinArt(night);
    s += R(64, 38, 32, 4, night ? "#3a4a7a" : "#f0d9a0") + R(66, 34, 1, 4, "#2dbf8f") + R(67, 33, 1, 3, "#2dbf8f") + R(92, 35, 1, 3, "#2dbf8f");
    if (full || (night && (isFest() || isNye() || seasonKind() === "vd"))) {
      /* 煙火層：夾在天空和人影之間，用 clipPath 切在窗框內，內容由 tick 每幀換（6/13、12/31 的夜晚不用集滿也會放） */
      s += '<clipPath id="rmwc"><rect x="64" y="10" width="32" height="28"/></clipPath><g id="rmfw" clip-path="url(#rmwc)"></g>';
    }
    if (full && !isFest()) {
      for (var i = 0; i < 7; i++) s += R(66 + i * 4, 32, 2, 2, night ? "#4a6bd0" : "#062a6e") + R(65 + i * 4, 34, 4, 4, night ? "#4a6bd0" : "#062a6e");
    }
    var fr = night ? "#9aa3c7" : "#ffffff";
    return s + R(60, 6, 40, 4, fr) + R(60, 6, 4, 38, fr) + R(96, 6, 4, 38, fr) + R(79, 10, 2, 32, fr) + R(64, 24, 32, 2, fr) + R(58, 42, 44, 5, night ? "#7a88b8" : "#e2ecf8");
  }

  var PD = { wall: "#d4e9ff", wl: "#b9dcf5", fl: "#d9a877", fll: "#b98757", bs: "#ffffff" };
  var PN = { wall: "#25346b", wl: "#1d2a55", fl: "#6b4c3a", fll: "#533a2c", bs: "#8aa0d8" };

  /* ===== 在房間裡走來走去的小人：左右來回散步，點一下換下一位成員（用網站的成員頭像） ===== */
  var WN = ["RM", "Jin", "SUGA", "j-hope", "Jimin", "V", "Jungkook"];
  /* 成員頭像路徑：優先用網站本來的 FPAV（app.js 裡定義的），讀不到才用這裡的備用路徑 */
  var AVF = { "Jungkook": "bts/av-1.png", "Jimin": "bts/av-5.png", "V": "bts/av-4.png", "j-hope": "bts/av-6.png", "SUGA": "bts/av-7.png", "Jin": "bts/av-2.png", "RM": "bts/av-3.png" };
  function avUrl(n) {
    try { if (typeof FPAV !== "undefined" && FPAV && FPAV[n]) return FPAV[n]; } catch (e) {}
    return AVF[n];
  }
  /* 本命生日當天（MEMBERS 是 app.js 的成員生日表）頭上戴派對帽 */
  function bdToday(n) {
    try {
      if (typeof MEMBERS === "undefined") return false;
      var d = new Date();
      for (var i = 0; i < MEMBERS.length; i++) {
        var m = MEMBERS[i];
        if (m[0] === n) return Number(m[1]) === d.getMonth() + 1 && Number(m[2]) === d.getDate();
      }
    } catch (e) {}
    return false;
  }
  /* ===== 小人頭上的像素道具：書本、時間氣泡、被撕下的日曆頁（全部用 R() 一格一格畫，沒有圖片也沒有文字） ===== */
  /* 3×5 像素數字，每個數字 15 格，由左到右、由上到下，1＝有顏色 */
  var DG = ["111101101101111", "010110010010111", "111001111100111", "111001111001111", "101101111001001", "111100111001111", "111100111101111", "111001001001001", "111101111101111", "111101111001111"];
  function tmBub() {
    var d = new Date(), hm = p2(d.getHours()) + p2(d.getMinutes()), D = "#062a6e";
    var s = R(1, 0, 21, 1, D) + R(1, 10, 21, 1, D) + R(0, 1, 1, 9, D) + R(22, 1, 1, 9, D) + R(1, 1, 21, 9, "#fff") +
      R(10, 10, 3, 1, "#fff") + R(10, 11, 1, 1, D) + R(11, 11, 1, 1, "#fff") + R(12, 11, 1, 1, D) + R(11, 12, 1, 1, D);
    [3, 7, 13, 17].forEach(function (x, i) {
      var g = DG[+hm.charAt(i)];
      for (var k = 0; k < 15; k++) if (g.charAt(k) === "1") s += R(x + (k % 3), 3 + Math.floor(k / 3), 1, 1, "#7b4fd6");
    });
    return '<g transform="translate(2,-19)">' + s + '<g class="rcl">' + R(11, 4, 1, 1, "#e0457b") + R(11, 6, 1, 1, "#e0457b") + "</g></g>";
  }
  /* 小人主動說話時頭上冒出的愛心泡泡（跟時鐘泡泡同位置；文字在房間下方那一行） */
  /* 小人和物品互動時的姿勢：up＝抬頭看／搖高處的東西，lw＝彎身靠近 */
  var UPS = { tube: 1, tubeR: 1, decal: 1, peek: 1, fwatch: 1, mwatch: 1 }, LWS = { cab: 1, water: 1, rose: 1, write: 1 };
  var HEART = ["0110110", "1111111", "1111111", "0111110", "0011100", "0001000"];
  function talkBub(k) {
    var D = "#062a6e", h = "";
    var s = R(1, 0, 21, 1, D) + R(1, 10, 21, 1, D) + R(0, 1, 1, 9, D) + R(22, 1, 1, 9, D) + R(1, 1, 21, 9, "#fff") +
      R(10, 10, 3, 1, "#fff") + R(10, 11, 1, 1, D) + R(11, 11, 1, 1, "#fff") + R(12, 11, 1, 1, D) + R(11, 12, 1, 1, D);
    if (k === "!") h = R(10, 2, 2, 5, "#e0457b") + R(10, 8, 2, 2, "#e0457b");
    else {
      HEART.forEach(function (r, y) { for (var x = 0; x < 7; x++) if (r.charAt(x) === "1") h += R(8 + x, 2 + y, 1, 1, "#e0457b"); });
      h += R(9, 3, 1, 1, "#ff8fb3");
    }
    return '<g transform="translate(2,-19)">' + s + '<g class="rth">' + h + "</g></g>";
  }
  function bkArt() {
    var base = R(0, 5, 12, 2, "#8b5a2b") + R(1, 1, 5, 4, "#fff") + R(5, 0, 2, 6, "#b87333") + R(2, 2, 3, 1, "#9aa3c7") + R(2, 4, 3, 1, "#9aa3c7");
    var mini = function (x, y, c, cls) {
      return '<g transform="translate(' + x + "," + y + ')"><g class="rbm ' + cls + '">' + R(0, 0, 4, 3, c) + R(1, 1, 2, 1, "#fff") + "</g></g>";
    };
    return '<g class="rmbk"><g transform="translate(7,-11)">' +
      '<g class="rbA">' + base + R(6, 1, 5, 4, "#fff") + R(7, 2, 3, 1, "#9aa3c7") + R(7, 4, 3, 1, "#9aa3c7") + "</g>" +
      '<g class="rbB">' + base + R(6, 0, 2, 5, "#fff") + R(8, 2, 3, 3, "#d4e9ff") + "</g></g>" +
      mini(0, -12, "#e0457b", "") + mini(22, -12, "#ffd23f", "d1") + mini(11, -17, "#2dbf8f", "d2") + "</g>";
  }
  /* 被撕下來的日曆頁：位置對應日曆（x42,y24）和小人停在 CLX 時的座標 */
  var CLX = 35;
  function pgArt() {
    return '<g class="rpg"><g transform="translate(' + (42 - CLX) + ",-42)\">" + R(0, 0, 12, 12, "#fff") + R(0, 0, 12, 4, "#e0457b") + (isNye() ? dgStr(3, 3, 5, "#0b2a5b") + dgStr(1, 7, 5, "#0b2a5b") : R(2, 6, 8, 1, "#9aa3c7") + R(2, 8, 8, 1, "#9aa3c7") + R(2, 10, 3, 1, "#e0457b")) + "</g></g>";
  }
  /* 小跑步時腳後面的像素灰塵（畫在翻轉群組裡，永遠在身後） */
  function dustArt() {
    var puff = function (x, y, d) { return '<g transform="translate(' + x + "," + y + ')"><g class="rdp ' + d + '">' + R(0, 0, 2, 2, "#e9dccb") + "</g></g>"; };
    return '<g class="rdu">' + puff(-1, 22, "") + puff(-4, 19, "d1") + puff(-2, 24, "d2") + "</g>";
  }
  /* 經過亮著的檯燈時，身上閃的像素光點 */
  function litArt() {
    var sp = function (x, y, d) { return '<g transform="translate(' + x + "," + y + ')"><g class="rsp ' + d + '">' + R(1, 0, 1, 3, "#fff1a8") + R(0, 1, 3, 1, "#fff1a8") + "</g></g>"; };
    return '<g class="rmlit">' + sp(-3, 6, "") + sp(24, 2, "d1") + sp(25, 16, "d2") + "</g>";
  }
  var DUST = dustArt();
  /* 6/13：小人捧著小蛋糕許願（.bl），吹熄後（.bo）火焰消失、冒出幾縷煙 */
  function cakeHeldArt() {
    var smoke = function (x, y, d) { return '<g transform="translate(' + x + "," + y + ')"><g class="rdp ' + d + '">' + R(0, 0, 1, 2, "#d5dbe8") + "</g></g>"; };
    return '<g class="rcb" transform="translate(9,17)">' + R(3, 0, 1, 2, "#ffd23f") + R(1, 2, 7, 2, "#fff") + R(0, 4, 9, 4, "#ff8fb3") + R(0, 6, 9, 1, "#e0457b") + R(0, 8, 9, 1, "#9aa3c7") +
      '<g class="rflm">' + FLAME + '</g><g class="rfo">' + smoke(3, -3, "") + smoke(4, -5, "d1") + smoke(2, -4, "d2") + "</g></g>";
  }
  /* 演唱會當天：小人手上多一支會閃的手燈（.ls） */
  function lightStickArt() {
    return '<g class="rls" transform="translate(21,12)"><g class="rlw">' + '<g class="rcl">' + R(-2, -2, 10, 9, "#b794ff", 0.28) + "</g>" + R(1, 0, 4, 5, "#b794ff") + R(2, 1, 2, 2, "#fff") + R(2, 5, 2, 4, "#444") + R(1, 9, 4, 2, "#222") + "</g></g>";
  }
  /* 前一天：地板上的行李包（票、手燈露出來），小人經過會停下來整理 */
  function bagArt() {
    return '<g transform="translate(118,79)" pointer-events="none">' + R(8, -3, 3, 4, "#b794ff") + R(2, 0, 3, 4, "#ffd23f") + R(1, 3, 11, 8, "#3b4a7a") + R(2, 4, 9, 2, "#4b5d94") + R(5, 6, 3, 2, "#ffd23f") + R(1, 11, 11, 1, "#262f55") + "</g>";
  }
  /* 演唱會當天：地板上的應援物（橫躺的手燈會閃、三張疊著的小卡）。只是裝飾，不擋點擊；節日／生日當天不畫，避免跟聖誕禮物、新年紅包擠在一起 */
  function tourGoodsArt(x) {
    var card = function (x, y, c) { return R(x, y, 6, 8, "#fff") + R(x + 1, y + 1, 4, 5, c) + R(x + 2, y + 2, 1, 1, "#ffffff", 0.8) + R(x + 1, y + 7, 4, 1, "#d9d9e8"); };
    return '<g transform="translate(' + (x || 122) + ',83)" pointer-events="none">' +
      R(0, 6, 15, 1, "#00000022") + '<g class="rcl">' + R(-2, -1, 9, 8, "#b794ff", 0.28) + "</g>" +
      R(0, 1, 5, 4, "#b794ff") + R(1, 2, 2, 2, "#fff") + R(5, 2, 1, 2, "#9d7be8") + R(6, 2, 6, 2, "#444") + R(12, 1, 2, 4, "#222") +
      card(18, 0, "#ff8fb3") + card(22, 2, "#6fb7ff") + card(27, 0, "#ffd23f") + "</g>";
  }
  /* 練習室左邊地板：搭著毛巾的水壺、一雙運動鞋（一隻歪倒）。平常就有，可以點（水壺跳一下、鞋子抖一下＋台詞），不算進完成度 */
  function practiceFloorArt() {
    var bottle = '<g transform="translate(12,77)">' + R(0, 9, 8, 1, "#00000022") + R(2, -1, 3, 1, "#444") + R(1, 0, 5, 9, "#6fb7ff") + R(2, 1, 1, 6, "#bfe3ff") +
      R(0, 1, 7, 2, "#fff") + R(0, 3, 2, 5, "#fff") + R(0, 5, 2, 1, "#b794ff") + "</g>";
    var shoes = '<g transform="translate(50,80)">' + R(0, 5, 17, 1, "#00000022") + R(0, 1, 6, 3, "#f3f3f8") + R(6, 2, 3, 2, "#f3f3f8") + R(1, 2, 3, 1, "#b794ff") + R(0, 4, 9, 1, "#9aa3c7") +
      R(11, 0, 3, 5, "#f3f3f8") + R(14, 0, 1, 5, "#9aa3c7") + R(11, 1, 3, 1, "#b794ff") + "</g>";
    return fxG("prbottle", bottle, [10, 75, 10, 12]) + fxG("prshoes", shoes, [49, 79, 19, 7]);
  }
  /* 演唱會前一天：地板上摺好的外套（紫色，上面一件白 T）＋牆上貼的「明天」便條。小窩跟練習室都有，位置各自避開原本的物品；只是裝飾，不擋點擊 */
  function eveGoodsArt(r2) {
    var jx = r2 ? 84 : 134, nx = r2 ? 124 : 99, ny = r2 ? 30 : 14;
    var jacket = '<g transform="translate(' + jx + ',84)">' + R(0, 7, 12, 1, "#00000022") + R(0, 2, 12, 5, "#7b4fd6") + R(0, 2, 12, 1, "#9d7be8") + R(0, 6, 12, 1, "#5f3bb0") + R(9, 3, 2, 2, "#ffd23f") +
      R(2, 0, 7, 2, "#fff") + R(3, 0, 5, 1, "#e6e8f2") + "</g>";
    var note = '<g transform="translate(' + nx + "," + ny + ')">' + R(2, 0, 3, 1, "#ffffff", 0.7) + R(0, 1, 7, 8, "#ffe27a") + R(0, 8, 7, 1, "#e0b84a") +
      '<text x="3.5" y="4.6" font-size="3.4" font-weight="700" text-anchor="middle" fill="#b3262e" shape-rendering="auto" font-family="\'Noto Sans TC\',\'Microsoft JhengHei\',sans-serif">明</text>' +
      '<text x="3.5" y="8" font-size="3.4" font-weight="700" text-anchor="middle" fill="#b3262e" shape-rendering="auto" font-family="\'Noto Sans TC\',\'Microsoft JhengHei\',sans-serif">天</text></g>';
    return '<g pointer-events="none">' + jacket + note + "</g>";
  }
  /* 演唱會前一天（只有小窩）：桌子底下，手燈插著充電（燈頭微亮、小綠燈），線接到牆上的插座 */
  function chargingStickArt() {
    return '<g transform="translate(124,58)" pointer-events="none">' + R(14, 2, 5, 6, "#c9c2b0") + R(15, 3, 3, 1, "#8a8372") + R(15, 5, 3, 1, "#8a8372") +
      R(5, 11, 10, 1, "#444") + R(15, 8, 1, 4, "#444") +
      '<g class="halo">' + R(-2, -2, 9, 8, "#b794ff", 0.18) + "</g>" + R(0, 0, 5, 4, "#9d7be8") + R(1, 1, 2, 1, "#d9c9ff") + R(1, 4, 3, 1, "#7b4fd6") + R(1, 5, 3, 7, "#444") + R(0, 12, 5, 2, "#222") +
      R(2, 8, 1, 1, "#2dbf8f") + "</g>";
  }
  /* 寫情書時小人手上的信紙和筆（.wr 才顯示，筆尖會左右抖） */
  function paperArt() {
    return '<g class="rmwr" transform="translate(19,12)">' + R(0, 2, 8, 9, "#fff") + R(0, 2, 8, 1, "#e0b8c8") + R(1, 5, 5, 1, "#e0b8c8") + R(1, 7, 4, 1, "#e0b8c8") + R(1, 9, 5, 1, "#e0b8c8") + '<g class="rpen">' + R(6, 0, 1, 5, "#e0457b") + R(6, 5, 1, 1, "#555") + "</g></g>";
  }
  var PROPS = bkArt() + pgArt() + litArt() + cakeHeldArt() + lightStickArt() + paperArt();

  function walker(S) {
    if (tourAway()) return "";
    var label = WN[S.mem] + (lang() === "zh" ? "，" : ", ") + t("散步的小人");
    var hat = isAnniv() || bdName() === WN[S.mem]
      ? '<g transform="rotate(-10 13 3)">' + R(12, -6, 2, 2, "#ffd23f") + R(11, -4, 4, 2, "#ff8fb3") + R(10, -2, 6, 2, "#fff") + R(9, 0, 8, 1, "#6fb7ff") + "</g>" : festHat(seasonKind());
    var zz = '<g class="rmzz"><text class="rz" x="23" y="3" font-size="5">Z</text><text class="rz" x="26" y="-1" font-size="6">Z</text><text class="rz" x="29" y="-5" font-size="7">Z</text></g>';
    var st = (S.wst === "dn" ? " dn" : S.wst === "pose" ? " po pz" : S.wst === "sleep" ? " slp pz" : S.wst === "look" || S.wst === "poster" || S.wst === "bdg" || S.wst === "bdb" ? " pz" : S.wst === "read" ? " rd pz" : S.wst === "cal" ? " cu pz" : S.wst === "clk" ? " ck pz" : S.wst === "blow" ? " bl pz" : S.wst === "pop" ? " pp pz" : S.wst === "pack" ? " pp pz" : S.wst === "talk" || S.wst === "letter" || S.wst === "mail" ? " tk pz" : S.wst === "tubeR" ? " tk up pz" : S.wst === "lamp" ? " pz" : S.wst === "lread" ? " rd pz" : UPS[S.wst] ? " up pz" : LWS[S.wst] ? " lw pz" : "") + (tourKind() === "today" ? " ls" : "");
    return '<g transform="translate(0,66)"><g class="rmwx' + st + '" transform="translate(' + S.wx.toFixed(2) + ',0)"><g class="rmwf"' + (S.wd < 0 ? ' transform="translate(26,0) scale(-1,1)"' : "") + '><g class="rmwk" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
      R(0, 0, 26, 26, "transparent") + '<g class="rmwb"><image class="rmwa" href="' + esc(avUrl(WN[S.mem])) + '" x="0" y="0" width="26" height="26" preserveAspectRatio="xMidYMax meet"/>' + hat + "</g></g>" + DUST + "</g>" + zz + '<g class="rmhm"><text class="rhn" x="24" y="4" font-size="6">♪</text><text class="rhn rhn2" x="29" y="-1" font-size="7">♫</text></g>' + PROPS + '<g class="rmck">' + (S.wst === "clk" ? tmBub() : "") + "</g>" + '<g class="rmtk">' + (S.wst === "talk" || S.wst === "letter" || S.wst === "mail" ? talkBub() : S.wst === "tubeR" ? talkBub("!") : "") + "</g></g></g>";
  }

  /* 情人節的愛心燈串：兩條下垂的線掛滿小燈，奇偶兩組交替閃（減少動態時全亮不閃），夜晚多一圈光暈 */
  function vdLights(night) {
    var s = "", a = "", b = "", x, y, i = 0, c, cols = ["#ff8fb3", "#fff1a8", "#e0457b", "#ffffff"], sg = 40;
    for (x = 0; x < 160; x += 2) s += R(x, 8 + Math.round(2 * Math.sin(Math.PI * (x % sg) / sg)), 2, 1, "#b07a8c");
    for (x = 4; x < 160; x += 8) {
      y = 9 + Math.round(2 * Math.sin(Math.PI * (x % sg) / sg));
      c = cols[i % 4];
      var bulb = (night ? R(x - 1, y - 1, 4, 4, c, 0.25) : "") + R(x, y, 2, 2, c);
      if (i % 2) b += bulb; else a += bulb;
      i++;
    }
    return '<g pointer-events="none">' + s + '<g class="rlA">' + a + '</g><g class="rlB">' + b + "</g></g>";
  }
  function scene(S, full) {
    var P = S.night ? PN : PD, i, s = '<svg id="rmsv"' + (S.lamp && S.st["f-s3"] ? ' class="lon"' : "") + ' viewBox="0 0 160 100" shape-rendering="crispEdges" role="group" aria-label="我的 ARMY 小窩">';
    s += R(0, 0, 160, 66, P.wall);
    for (i = 1; i < 10; i++) s += R(i * 16, 0, 1, 66, P.wl, 0.6);
    s += R(0, 66, 160, 34, P.fl);
    for (i = 0; i < 5; i++) s += R(0, 70 + i * 7, 160, 1, P.fll);
    s += R(0, 64, 160, 3, P.bs);
    var bn = bdName(), bw = bdWeekName(), ba = bdAfterName();
    if (isAnniv() || bn) s += buntArt(isAnniv() ? "" : bn);
    else if (bw) s += buntArt(bw);
    else if (annivWeek()) s += buntArt("");
    else if (seasonKind()) s += buntArt("", SEAS[seasonKind()].pal);
    else if (tourKind()) s += buntArt("", TOURPAL);
    s += win(S.night, full);
    if (seasonKind() === "vd") s += vdLights(S.night);
    s += R(102, 52, 56, 3, "#8b5a2b") + R(104, 55, 52, 2, "#a8743f") + R(104, 57, 3, 9, "#8b5a2b") + R(153, 57, 3, 9, "#8b5a2b");
    if (S.st["f-s3"]) {
      s += '<g class="rmlt">';
      for (var y = 44; y < 92; y += 2) s += R(112 - (6 + Math.floor((y - 44) / 2)), y, 2 * (6 + Math.floor((y - 44) / 2)), 2, seasonKind() === "vd" ? "#ff8fb3" : "#ffe27a", y >= 80 ? 0.2 : 0.1);
      s += "</g>";
    }
    ITEMS.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk") + (it.k === "lamp" ? " rmlamp" + (on && S.lamp ? " on" : "") : "");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + (it.k === "cal" && isNye() ? calNyArt() : it.art) + (it.k === "cake" && on && (isAnniv() || bn) ? FLAME : "") + "</g>" + (S.nw && S.nw[it.b] ? newMark(it) : "") + "</g>";
    });
    if (isFest()) s += letterBanner(isAnniv() ? 52 : 48, 0, bn);
    var p7 = full && isFest();
    if (tourKind() === "eve") s += bagArt();
    else if (tourKind() === "today" && !seasonKind() && !isFest()) s += tourGoodsArt();
    if (tourKind() === "eve" && !seasonKind() && !isFest()) s += eveGoodsArt(false) + chargingStickArt();
    if (p7 && !S.g7) { S.g7 = "in"; S.g7x = G7X.map(function (v, i) { return -24 - i * 12; }); S.g7t = 0; }
    return s + festProp() + (isFest() ? popperArt(bn ? 148 : 140, 80) : "") + (bn ? bdDeco(bn, 38, 80, 76) : bw ? bdDeco(bw, 38, 80, 76, 1) : ba ? bdDeco(ba, 38, 80, 76, 2) : "") + (p7 ? '<g id="rmwv7"' + (S.g7 === "done" ? "" : ' display="none"') + ">" + walker(S) + "</g>" + party7(S) : walker(S)) + (isFest() ? popBurstArt(bn ? 151 : 143, 79) : "") + (p7 ? popBurstArt(80, 72, "rpb7") : "") + (isAnniv() || bn ? confArt() : "") + snowArt() + "</svg>";
  }

  /* ===== 練習室的場景：鏡牆（小人的倒影）＋ 把杆 ＋ 木地板。小人的倒影只畫在鏡子裡（clip），100% 時七個人各有一個 ===== */
  var PD2 = { wall: "#f3ead8", wl: "#e2d6bd", fl: "#e8c48f", fll: "#c99f66", bs: "#ffffff", mir: "#cfe8f5", mirl: "#eaf7ff" };
  var PN2 = { wall: "#2b2f55", wl: "#232748", fl: "#7a5a45", fll: "#5f4535", bs: "#8aa0d8", mir: "#34427c", mirl: "#5666a8" };
  /* 七人隊形：每種 7 個點（成員 0～6 的圖左上角 x,y；圖 18×18，前排 y=76 腳踩在隊形貼紙上） */
  var FORM = [
    [[10, 76], [31, 76], [52, 76], [73, 76], [94, 76], [115, 76], [136, 76]],
    [[10, 64], [31, 68], [52, 72], [73, 76], [94, 72], [115, 68], [136, 64]],
    [[12, 76], [30, 64], [48, 76], [66, 64], [84, 76], [102, 64], [120, 76]],
    [[10, 76], [31, 74], [52, 72], [73, 70], [94, 68], [115, 66], [136, 64]]
  ];
  var HAT2 = '<g transform="rotate(-10 13 3)">' + R(12, -6, 2, 2, "#ffd23f") + R(11, -4, 4, 2, "#ff8fb3") + R(10, -2, 6, 2, "#fff") + R(9, 0, 8, 1, "#6fb7ff") + "</g>";
  function reflY(y) { return (50 + (y + 18 - 82) * 0.35 - 14).toFixed(2); }
  function initDz(S) {
    if (!S.dz) S.dz = FORM[S.fi].map(function (p, i) { return S.gp === "enter" ? { x: -24 - i * 12, y: p[1] } : { x: p[0], y: p[1] }; });
  }
  /* 成員生日當天：白板外框換成那位成員的顏色，再灑幾個彩點 */
  function bdBoardArt(n) {
    var c = MC[WN.indexOf(n) % 7];
    return R(0, 0, 20, 1, c) + R(0, 13, 20, 1, c) + R(0, 0, 1, 14, c) + R(19, 0, 1, 14, c) + R(3, 10, 1, 1, "#ffd23f") + R(8, 11, 1, 1, "#ff8fb3") + R(16, 10, 1, 1, "#6fb7ff");
  }
  /* 6/13 當天：牆邊多一支彩帶砲（只是裝飾，不能點） */
  function popperArt(px, py) {
    return '<g transform="translate(' + px + "," + py + ')">' + R(1, 4, 5, 5, "#ff8fb3") + R(0, 7, 7, 2, "#e0457b") + R(3, 1, 1, 1, MC[2]) + R(5, 0, 1, 1, MC[4]) + R(6, 2, 1, 1, MC[1]) + R(2, 2, 1, 1, MC[3]) + R(4, 3, 1, 1, MC[5]) + "</g>";
  }
  /* 拉彩帶砲的紙花：12 片從砲口往上、往兩邊噴開再落下；平常隱藏，tick 拉的瞬間加上 .go */
  function popBurstArt(x, y, id) {
    var s = '<g id="' + (id || "rpb") + '" class="rpb" transform="translate(' + x + "," + y + ')" pointer-events="none">';
    for (var i = 0; i < 12; i++) s += '<g class="rpbp" style="--dx:' + ((i - 5.5) * (id ? 10 : 4.5)).toFixed(1) + "px;--dy:" + (-(16 + (i % 3) * 8 + (i % 2) * 4)) + 'px">' + (i % 2 ? R(0, 0, 1, 2, MC[i % 7]) : R(0, 0, 2, 1, MC[i % 7])) + "</g>";
    return s + "</g>";
  }
  /* 6/13 小窩 100%：窗外不再是人影，七個人真的走進房間，排成一排戴著派對帽慶祝，之後一起走出右邊 */
  var G7X = [12, 33, 55, 76, 98, 119, 141];
  function party7(S) {
    var s = '<g id="rmg7"' + (S.g7 === "done" ? ' display="none"' : "") + ' pointer-events="none">';
    for (var i = 0; i < 7; i++) {
      var x = S.g7x ? S.g7x[i] : -24 - i * 12;
      s += '<g class="rmd7" data-i="' + i + '" transform="translate(' + x.toFixed(2) + ',70)"><g class="rmdb" style="animation-delay:-' + (i * 0.13).toFixed(2) + 's">' +
        '<image href="' + esc(avUrl(WN[i])) + '" x="0" y="0" width="18" height="18" preserveAspectRatio="xMidYMax meet"/><g transform="translate(-1,3) scale(.75)">' + HAT2 + "</g></g></g>";
    }
    return s + "</g>";
  }
  function mirrorRefl(S, full) {
    var s = '<g clip-path="url(#rmcp)">', hideS = (full && S.gp !== "away" && S.gp !== "enter") || tourAway();
    if (full) {
      s += '<g id="rmdrg" opacity=".4"' + (S.gp === "away" ? ' display="none"' : "") + ">";
      S.dz.forEach(function (d, i) {
        s += '<image class="rmdr" data-i="' + i + '" href="' + esc(avUrl(WN[i])) + '" x="' + (d.x + 2).toFixed(2) + '" y="' + reflY(d.y) + '" width="14" height="14" preserveAspectRatio="xMidYMax meet"/>';
      });
      s += "</g>";
    }
    s += '<g id="rmmr" opacity=".4"' + (hideS ? ' display="none"' : "") + ' transform="translate(' + (S.wx + 3).toFixed(2) + ',0)"><g class="rmmf"' + (S.wd > 0 ? ' transform="translate(20,0) scale(-1,1)"' : "") + '><image class="rmmra" href="' + esc(avUrl(WN[S.mem])) + '" x="0" y="38" width="20" height="20" preserveAspectRatio="xMidYMax meet"/></g></g>';
    return s + "</g>";
  }
  /* 100%：七個人站在隊形點上，依 y 由後排到前排畫（前排蓋住後排） */
  function dancers(S) {
    initDz(S);
    var s = '<g id="rmdz">';
    S.dz.map(function (d, i) { return i; }).sort(function (a, b) { return S.dz[a].y - S.dz[b].y; }).forEach(function (i) {
      var d = S.dz[i], hat = isAnniv() || bdName() === WN[i] ? '<g transform="translate(-1,3) scale(.75)">' + HAT2 + "</g>" : (seasonKind() ? '<g transform="translate(-1,3) scale(.75)">' + festHat(seasonKind()) + "</g>" : "");
      s += '<g class="rmdd" data-i="' + i + '" transform="translate(' + d.x.toFixed(2) + "," + d.y.toFixed(2) + ')" tabindex="0" role="button" aria-label="' + esc(WN[i]) + '"><g class="rmdb" style="animation-delay:-' + (i * 0.13).toFixed(2) + 's">' +
        R(0, 0, 18, 18, "transparent") + '<image href="' + esc(avUrl(WN[i])) + '" x="0" y="0" width="18" height="18" preserveAspectRatio="xMidYMax meet"/>' + hat + "</g></g>";
    });
    return s + "</g>";
  }
  function scene2(S, full) {
    var P = S.night ? PN2 : PD2, i, r, x, bn = bdName(), bw = bdWeekName(), ba = bdAfterName(), fest = isAnniv() || bn;
    if (!(full && S.gp === "enter")) S.wx = Math.max(6, Math.min(108, S.wx));
    initDz(S);
    var s = '<svg id="rmsv" viewBox="0 0 160 100" shape-rendering="crispEdges" role="group" aria-label="練習室"><defs><clipPath id="rmcp"><rect x="26" y="20" width="86" height="40"/></clipPath></defs>';
    s += R(0, 0, 160, 64, P.wall);
    for (i = 1; i < 10; i++) s += R(i * 16, 0, 1, 64, P.wl, 0.6);
    s += R(0, 66, 160, 34, P.fl);
    for (r = 0; r < 5; r++) {
      s += R(0, 70 + r * 7, 160, 1, P.fll);
      for (x = (r % 2) * 16 + 8; x < 160; x += 32) s += R(x, 71 + r * 7, 1, 6, P.fll, 0.5);
    }
    s += R(0, 64, 160, 3, P.bs);
    if (fest) s += buntArt(isAnniv() ? "" : bn);
    else if (bw) s += buntArt(bw);
    else if (annivWeek()) s += buntArt("");
    else if (seasonKind()) s += buntArt("", SEAS[seasonKind()].pal);
    else if (tourKind()) s += buntArt("", TOURPAL);
    if (seasonKind() === "vd") s += vdLights(S.night);
    /* 鏡牆：銀框、鏡面、兩道斜斜的反光 */
    s += R(24, 18, 90, 44, "#aab2c8") + R(26, 20, 86, 40, P.mir);
    for (i = 0; i < 40; i += 2) s += R(72 - i, 20 + i, 3, 2, P.mirl, 0.5) + R(92 - i, 20 + i, 2, 2, P.mirl, 0.35);
    s += mirrorRefl(S, full);
    /* 把杆（在鏡子前面） */
    s += R(24, 48, 90, 2, "#b07a45") + R(24, 50, 90, 1, "#8b5a2b") + R(30, 51, 2, 11, "#8b5a2b") + R(104, 51, 2, 11, "#8b5a2b");
    ITEMS2.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + (it.k === "pwin" ? pwinArt(on, S.night) : it.art) + (it.k === "pboard" && on && bn ? bdBoardArt(bn) : "") + "</g>" + (S.nw && S.nw[it.b] ? newMark(it) : "") + "</g>";
    });
    /* 練習室：彩帶砲在左邊（小人走到左端會拉），禮物在地板中間、氣球再右邊；運動鞋放在彩帶砲和禮物之間 */
    if (fest) s += popperArt(36, 80) + letterBanner(isAnniv() ? 40 : 36, 21, bn) + (bn ? bdDeco(bn, 76, 79, 20) : "");
    if (bw) s += bdDeco(bw, 76, 79, 20, 1);
    else if (ba) s += bdDeco(ba, 76, 79, 20, 2);
    s += festProp(true);
    s += practiceFloorArt();
    if (tourKind() === "today" && !seasonKind() && !isFest()) s += tourGoodsArt(84);
    if (tourKind() === "eve" && !seasonKind() && !isFest()) s += eveGoodsArt(true);
    if (full) {
      var wShow = S.gp === "away" || (S.gp === "enter" && S.wx < 168 && !S.gh);
      s += '<g id="rmwv"' + (wShow ? "" : ' display="none"') + ">" + walker(S) + "</g>";
      s += '<g id="rmdzw"' + (S.gp === "away" ? ' display="none"' : "") + ">" + dancers(S) + "</g>";
    } else s += walker(S);
    return s + (fest ? popBurstArt(39, 79) : "") + (fest ? confArt() : "") + snowArt() + "</svg>";
  }


  /* 應援街區（第 3 間）的場景：夜空或晴空、後面一排大樓、人行道和馬路；10 件物品站在街上（沒解鎖的是暗暗的剪影）。
     小人走在人行道前緣，經過已解鎖的物品會停下來；目前沒有節日、生日的佈置（之後再加）。 */
  function scene3(S, full) {
    var nt = S.night, s = '<svg id="rmsv" viewBox="0 0 160 100" shape-rendering="crispEdges" role="group" aria-label="' + esc(t("應援街區")) + '">', i, j, x, lit;
    s += R(0, 0, 160, 66, nt ? "#0c1238" : "#a8d8ff") + R(0, 28, 160, 20, nt ? "#141d52" : "#bfe2ff") + R(0, 46, 160, 20, nt ? "#1e2a66" : "#d7efff");
    if (nt) {
      [[14, 6], [38, 14], [74, 4], [88, 18], [112, 9], [148, 6], [154, 20], [6, 22], [60, 24], [132, 24]].forEach(function (p) { s += R(p[0], p[1], 1, 1, "#ffffff", 0.9); });
      s += R(147, 12, 5, 1, "#fff6c4") + R(146, 13, 7, 5, "#fff6c4") + R(147, 18, 5, 1, "#fff6c4") + R(149, 12, 5, 1, "#0c1238") + R(148, 13, 7, 5, "#0c1238") + R(149, 18, 5, 1, "#0c1238");
    } else {
      s += R(10, 8, 8, 8, "#fff1a8") + R(8, 10, 12, 4, "#fff1a8", 0.5) + R(30, 12, 14, 3, "#ffffff") + R(33, 10, 8, 2, "#ffffff") + R(108, 16, 16, 3, "#ffffff") + R(111, 14, 9, 2, "#ffffff");
    }
    [[0, 26, 26, 44, "#161c46", "#c5cbe3"], [26, 36, 22, 34, "#1b2354", "#d3d8ee"], [48, 8, 50, 62, "#141a40", "#b9bfdc"], [98, 28, 18, 42, "#1a2150", "#cdd3ea"], [116, 22, 44, 48, "#181e4a", "#c0c7e2"]].forEach(function (b) {
      s += R(b[0], b[1], b[2], b[3], nt ? b[4] : b[5]);
      for (j = b[1] + 4; j < 62; j += 6) for (i = b[0] + 3; i < b[0] + b[2] - 3; i += 5) { lit = (i * 7 + j * 13) % 5 < 2; s += R(i, j, 2, 2, nt ? (lit ? "#ffd86b" : "#232c63") : "#e8f0ff"); }
    });
    s += R(0, 66, 160, 8, nt ? "#4a5078" : "#b7bdd6") + R(0, 73, 160, 2, nt ? "#2a2f50" : "#8a90a8");
    for (x = 8; x < 160; x += 16) s += R(x, 66, 1, 7, nt ? "#3a4068" : "#a3aac8");
    s += R(0, 75, 160, 25, nt ? "#23273f" : "#555b78") + R(0, 97, 160, 3, nt ? "#1a1e33" : "#444a66");
    for (x = 6; x < 160; x += 20) s += R(x, 86, 10, 1, "#ffd23f", 0.8);
    ITEMS3.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + it.artf(nt) + "</g>" + (S.nw && S.nw[it.b] ? newMark(it) : "") + "</g>";
    });
    /* 小人：走在人行道的前緣（walker() 預設腳在 y=92，上移 16 讓腳站在 y≈76），畫在所有物品的前面 */
    s += '<g id="rmwv3" transform="translate(0,-16)">' + walker(S) + "</g>";
    return s + "</svg>";
  }

  /* ===== 狀態 ===== */
  function getBs() {
    var r = null;
    try { r = badgeSync(); } catch (e) {}
    return r && r.st ? r : { st: {}, L: [] };
  }
  function count(st, list) {
    var n = 0;
    (list || ITEMS).forEach(function (it) { if (st[it.b]) n++; });
    return n;
  }
  function dstr(v) {
    try { if (typeof bgDs === "function") return bgDs(v); } catch (e) {}
    return String(v || "");
  }
  /* 白天／夜晚：依「當地」日出日落判斷（不跳出定位詢問：用瀏覽器的時區猜城市座標，猜不到就用時區的經度、緯度 25° 左右；算不出來時退回舊規則 18:00–06:00 是夜晚） */
  var SUN_TZ = { "Asia/Taipei": [25.03, 121.56], "Asia/Seoul": [37.57, 126.98], "Asia/Tokyo": [35.68, 139.69], "Asia/Hong_Kong": [22.32, 114.17], "Asia/Macau": [22.2, 113.54], "Asia/Shanghai": [31.23, 121.47], "Asia/Singapore": [1.35, 103.82], "Asia/Kuala_Lumpur": [3.14, 101.69], "Asia/Bangkok": [13.75, 100.5], "Asia/Manila": [14.6, 120.98], "Asia/Jakarta": [-6.2, 106.85], "Asia/Ho_Chi_Minh": [10.82, 106.63], "Asia/Kolkata": [28.61, 77.21], "Asia/Dubai": [25.2, 55.27], "Europe/London": [51.51, -0.13], "Europe/Paris": [48.86, 2.35], "Europe/Berlin": [52.52, 13.4], "Europe/Madrid": [40.42, -3.7], "Europe/Rome": [41.9, 12.5], "Europe/Moscow": [55.76, 37.62], "America/New_York": [40.71, -74.0], "America/Chicago": [41.88, -87.63], "America/Denver": [39.74, -104.99], "America/Los_Angeles": [34.05, -118.24], "America/Vancouver": [49.28, -123.12], "America/Toronto": [43.65, -79.38], "America/Mexico_City": [19.43, -99.13], "America/Sao_Paulo": [-23.55, -46.63], "Australia/Sydney": [-33.87, 151.21], "Australia/Melbourne": [-37.81, 144.96], "Pacific/Auckland": [-36.85, 174.76], "Pacific/Honolulu": [21.31, -157.86] };
  function sunLoc() {
    var z = "";
    try { z = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
    return SUN_TZ[z] || [25, -new Date().getTimezoneOffset() / 60 * 15];
  }
  /* 太陽高度夠高（日出到日落之間）就回傳 true；用的是常見的 sunrise equation，誤差大約幾分鐘，這裡夠用 */
  function sunUp(ms, lat, lon) {
    var rad = Math.PI / 180, jd = ms / 86400000 + 2440587.5, n0 = Math.round(jd - 2451545.0 + 0.0008 + lon / 360), k, Js, M, C, lam, Jt, dec, arg, w;
    for (k = -1; k <= 1; k++) {
      Js = n0 + k - lon / 360;
      M = (357.5291 + 0.98560028 * Js) % 360;
      C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
      lam = (M + C + 180 + 102.9372) % 360;
      Jt = 2451545.0 + Js + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * lam * rad);
      dec = Math.asin(Math.sin(lam * rad) * Math.sin(23.4397 * rad));
      arg = (Math.sin(-0.833 * rad) - Math.sin(lat * rad) * Math.sin(dec)) / (Math.cos(lat * rad) * Math.cos(dec));
      w = arg <= -1 ? 0.5 : arg >= 1 ? 0 : Math.acos(arg) / (2 * Math.PI);
      if (jd >= Jt - w && jd <= Jt + w) return true;
    }
    return false;
  }
  function isNight(ms) {
    try { var c = sunLoc(); return !sunUp(ms || Date.now(), c[0], c[1]); }
    catch (e) { var h = new Date().getHours(); return h < 6 || h >= 18; }
  }

  /* ===== 首頁卡片的完成度標籤 ===== */
  function tag(r) {
    try {
      var b = document.getElementById("roomBtn");
      if (!ROOM_OPEN || !b || !r || !r.st) return;
      var et = b.querySelector(".et"), t = et && et.querySelector(".ftbd");
      if (!et) return;
      if (!t) { t = document.createElement("em"); et.appendChild(t); }
      /* 總完成度：把所有「已開放」的房間加總（沒開放的房間不算，所以一般使用者在第 2 間開放前看到的數字跟以前一樣） */
      var n = 0, tot = 0;
      ROOMS.forEach(function (rm, i) { if (roomOpen(i, r.st)) { n += roomN(i, r.st); tot += roomItems(i).length; } });
      var pct = Math.round((n / tot) * 100);
      t.className = "ftbd rmpb " + (pct >= 100 ? "done" : "todo");
      var hh = (pct >= 100 ? "<span>✓</span> " : "") + "<span>小窩完成度</span> <span>" + pct + '%</span><i class="rmpx" aria-hidden="true"><s style="width:' + pct + '%"></s></i>';
      if (t.__h !== hh) { t.__h = hh; t.innerHTML = hh; }
      /* 最外面的按鈕：有限定布置時，完成度下方多一條「限定布置」小標籤；沒有就移除 */
      var lt = limTag(), lb = et.querySelector(".rmlb");
      var ci = b.querySelector(".rmli"), ih = lt ? limIcon() : "";
      if (!ih) { if (ci) ci.remove(); }
      else {
        if (!ci) { ci = document.createElement("span"); ci.className = "rmli"; ci.setAttribute("aria-hidden", "true"); b.appendChild(ci); }
        if (ci.__h !== ih) { ci.__h = ih; ci.innerHTML = ih; }
        ci.title = lt[0] + (lt[1] ? " " + lt[1] : "");
      }
      if (!lt) { if (lb) lb.remove(); return; }
      if (!lb) { lb = document.createElement("em"); lb.className = "rmlb"; et.appendChild(lb); }
      var lh = '<span class="rmlc">限定布置</span> <span>' + lt[0] + "</span>" + (lt[1] ? " <b>" + esc(lt[1]) + "</b>" : "");
      if (lb.__h !== lh) { lb.__h = lh; lb.innerHTML = lh; }
    } catch (e) {}
  }
  try {
    var _bs = window.badgeSync;
    if (typeof _bs === "function" && !_bs.__room) {
      window.badgeSync = function () {
        var r = _bs.apply(this, arguments);
        tag(r);
        return r;
      };
      window.badgeSync.__room = 1;
    }
  } catch (e) {}

  /* ===== 樣式 ===== */
  var css = document.createElement("style");
  css.textContent =
    ".entry.room{border-left:10px solid #19b5c9}" +
    ".entry.room.lock{border-left-color:var(--line);filter:grayscale(1);opacity:.65;cursor:not-allowed}.entry.room.lock:hover,.entry.room.lock:active{transform:none;box-shadow:4px 4px 0 var(--line)}.entry.room.lock::after{display:none}" +
    "#rmo{position:fixed;inset:0;z-index:998;display:grid;place-items:center;padding:12px;background:rgba(6,24,58,.72)}" +
    ".rmc{width:100%;max-width:600px;max-height:94vh;max-height:94dvh;display:flex;flex-direction:column;overflow:hidden;background:var(--card);color:var(--ink);border:3px solid var(--dark);box-shadow:6px 6px 0 var(--line);padding:14px}" +
    ".rmh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:8px}.rmh b{font-size:18px;color:var(--dark)}.rmh span{font-size:13px;color:var(--sub)}" +
    ".rmt{display:flex;gap:6px;margin-bottom:8px}.rmt button{flex:1;font:inherit;font-size:13px;font-weight:800;padding:6px 4px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmt button[aria-selected=true]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}.rmt button:focus-visible,.rmf button:focus-visible,.rmx:focus-visible,.rmn:focus-visible{outline:3px solid var(--focus);outline-offset:2px}" +
    ".rmb{overflow:auto;flex:1;min-height:0}" +
    "#rmsv{display:block;width:100%;height:auto;border:3px solid var(--dark);image-rendering:pixelated;touch-action:manipulation;user-select:none;-webkit-user-select:none}" +
    ".rmi{cursor:pointer;transform-box:fill-box;transform-origin:50% 100%}.rmi:focus,.rmi:focus-visible{outline:none}" +
    ".rmi.lk{opacity:.4;filter:grayscale(1) brightness(.55)}" +
    ".rmlamp .glow,.halo{opacity:0;pointer-events:none}.rmlamp.on .glow{opacity:1}.rmlamp .sh rect{fill:#a89a4a}.rmlamp.on .sh rect{fill:#fff1a8}" +
    ".fish{animation:rmfish 9s linear infinite alternate}@keyframes rmfish{from{transform:translateX(0)}to{transform:translateX(18px)}}" +
    ".a-bounce{animation:rmbounce .5s steps(4)}@keyframes rmbounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-3px)}}" +
    ".a-sway{animation:rmsway .8s ease-in-out}@keyframes rmsway{0%,100%{transform:rotate(0)}25%{transform:rotate(-7deg)}75%{transform:rotate(7deg)}}" +
    ".a-shake{animation:rmshake .45s steps(6)}@keyframes rmshake{0%,100%{transform:translateX(0)}25%{transform:translateX(-1px)}75%{transform:translateX(1px)}}" +
    ".a-hop{animation:rmhop .5s steps(4)}@keyframes rmhop{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}" +
    ".a-glow .halo{animation:rmglow 1.4s ease-out}@keyframes rmglow{0%{opacity:0}30%{opacity:1}100%{opacity:0}}" +
    "@media(prefers-reduced-motion:reduce){.fish,.a-bounce,.a-sway,.a-shake,.a-hop,.a-glow .halo{animation:none}}" +
    ".rmcap{margin:8px 0 0;min-height:3.2em;padding:8px 10px;border:2px solid var(--line);background:var(--box);font-size:13px;line-height:1.5}.rmcap b{color:var(--dark)}.rmcap small{color:var(--sub)}" +
    ".rmbar{display:flex;gap:6px;align-items:center;margin-top:8px;flex-wrap:wrap}.rmbar .rmp{flex:1;min-width:120px;height:10px;border:2px solid var(--line);background:var(--box)}.rmbar .rmp s{display:block;height:100%;background:var(--dark)}.rmbar span{font-size:12px;font-weight:800;color:var(--dark)}" +
    ".rmn{font:inherit;font-size:12px;font-weight:800;padding:4px 8px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}" +
    ".rmf{display:flex;gap:6px;margin-bottom:8px}.rmf button{font:inherit;font-size:12px;font-weight:800;padding:4px 10px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmf button[aria-pressed=true]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}" +
    ".rml{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.rmk{border:2px solid var(--line);background:var(--box);padding:8px 6px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:4px}.rmk.on{border-color:var(--dark)}.rmk svg{width:100%;max-width:64px;height:48px;overflow:visible}.rmk svg.lk{opacity:.4;filter:grayscale(1) brightness(.55)}.rmk b{font-size:13px}.rmk small{font-size:11px;color:var(--sub);line-height:1.4}" +
    ".rmx{margin-top:10px;align-self:flex-end}" +
    ".ftbd.rmpb,.ftbd.rmpb.done,.entry .et .ftbd.rmpb{display:flex;flex-wrap:nowrap;align-items:center;gap:8px;width:min(300px,100%);box-sizing:border-box;padding:0;border:0;background:none}.ftbd.rmpb>span{display:block;flex:none;white-space:nowrap;line-height:1.3}.rmpx{display:block;position:relative;flex:1 1 auto;min-width:0;height:14px;margin-top:0;border:3px solid var(--dark);background:var(--box);overflow:hidden}.rmpx s{display:block;height:100%;background:var(--gold);text-decoration:none;transition:width .4s steps(8)}.rmpx::after,.rmbar .rmp::after{content:\"\";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 10px,var(--card) 10px 12px)}.ftbd.done .rmpx s{background:var(--ok)}" +
    ".rmbar .rmp{position:relative;overflow:hidden;height:14px;border:3px solid var(--dark)}.rmbar .rmp s{background:var(--gold)}" +
    "@media(prefers-reduced-motion:reduce){.rmpx s{transition:none}}" +
    ".rnw{pointer-events:none;animation:rmblink 1s steps(1) infinite}.rmnw{font-style:normal;font-size:10px;font-weight:800;padding:1px 4px;background:var(--gold);color:var(--dark)}" +
    "@media(prefers-reduced-motion:reduce){.rnw{animation:none}}" +
    "#rmng.wk .rmbw{animation:rmbob .5s steps(1) infinite}#rmng.mg:not(.wk) .rmbw{animation:rmlk 3.2s steps(1,end) infinite}@keyframes rmlk{0%{transform:rotate(0)}30%{transform:translateY(-1px) rotate(var(--d)) scaleY(1.06)}80%{transform:rotate(0)}100%{transform:rotate(0)}}" +
    ".rmwk{cursor:pointer}.rmwk:focus,.rmwk:focus-visible{outline:none}.rmnm{cursor:pointer}.rmnm:focus,.rmnm:focus-visible{outline:none}.rmbw{transform-box:fill-box;transform-origin:50% 100%;animation:rmbow 1.3s steps(1,end) infinite}@keyframes rmbow{0%{transform:translateY(0) scaleY(1)}40%{transform:translateY(1.5px) scaleY(.82)}70%{transform:translateY(0) scaleY(1)}100%{transform:translateY(0) scaleY(1)}}@media(prefers-reduced-motion:reduce){.rmbw{animation:none}}.rmfx{cursor:pointer;transform-box:fill-box;transform-origin:50% 100%}.rmfx:focus,.rmfx:focus-visible{outline:none}" +
    ".rmwb{animation:rmbob .5s steps(1,end) infinite}@keyframes rmbob{0%{transform:translateY(0)}50%{transform:translateY(-2px)}100%{transform:translateY(0)}}" +
    ".pz .rmwb{animation:none}.slp .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(9deg)}" +
    ".rmzz{display:none}.slp .rmzz{display:block}.rz{fill:#fff;stroke:#062a6e;stroke-width:.5;paint-order:stroke;font-weight:900;opacity:0;transform-box:fill-box;animation:rmz 2.4s ease-out infinite}.rz:nth-child(2){animation-delay:.8s}.rz:nth-child(3){animation-delay:1.6s}@keyframes rmz{0%{opacity:0;transform:translate(0,3px)}30%{opacity:1}100%{opacity:0;transform:translate(4px,-8px)}}" +
    "@media(prefers-reduced-motion:reduce){.rmwb,.rz{animation:none}.slp .rz{opacity:1}}" +
    ".rmbk,.rmck,.rpg{display:none;pointer-events:none}.rd .rmbk,.ck .rmck{display:block}" +
    ".rbA{opacity:1;animation:rmpa 1.2s steps(1) infinite}.rbB{opacity:0;animation:rmpb 1.2s steps(1) infinite}@keyframes rmpa{0%{opacity:1}50%{opacity:0}}@keyframes rmpb{0%{opacity:0}50%{opacity:1}}" +
    ".rbm{opacity:0;animation:rmbk 2.4s steps(6) infinite}.rbm.d1{animation-delay:.8s}.rbm.d2{animation-delay:1.6s}@keyframes rmbk{0%{opacity:0;transform:translate(0,3px)}25%{opacity:1}100%{opacity:0;transform:translate(0,-9px)}}" +
    ".cu .rmwb,.ck .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(-1px) rotate(-7deg)}" +
    ".tr .rpg{display:block;animation:rmpg 1.4s steps(3) forwards}@keyframes rmpg{0%{transform:translate(0,0)}25%{transform:translate(-2px,14px)}50%{transform:translate(4px,28px)}75%{transform:translate(-1px,42px)}100%{transform:translate(8px,56px)}}" +
    ".rcl{animation:rmblink 1s steps(1) infinite}@keyframes rmblink{50%{opacity:0}}" +
    ".rbal{animation:rmbal 2.4s steps(4) infinite alternate}.rbal.d1{animation-delay:-.8s}.rbal.d2{animation-delay:-1.6s}@keyframes rmbal{0%{transform:translateY(0)}100%{transform:translateY(-2px)}}" +
    ".rls{display:none;pointer-events:none}.ls .rls{display:block}" +
    ".rmwr{display:none;pointer-events:none}.wr .rmwr{display:block}.rpen{animation:rmpen .5s steps(2) infinite}@keyframes rmpen{0%{transform:translate(0,0)}50%{transform:translate(-2px,1px)}}@media(prefers-reduced-motion:reduce){.rpen{animation:none}}" +
    ".rmml .rmfu{display:none}.rmml.up .rmfu{display:block}.rmml.up .rmfd{display:none}" +
    ".rpb{display:none;pointer-events:none}.rpb.go{display:block}.rpb.go .rpbp{animation:rpbk 1.3s steps(8) forwards}@keyframes rpbk{0%{opacity:1;transform:translate(0,0)}60%{opacity:1;transform:translate(var(--dx),var(--dy))}100%{opacity:0;transform:translate(calc(var(--dx) * 1.2),calc(var(--dy) + 22px))}}" +
    ".pp .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateX(1px) rotate(7deg)}" +
    ".rcb{display:none;pointer-events:none}.bl .rcb{display:block}.rfo{display:none}.bo .rflm{display:none}.bo .rfo{display:block}" +
    ".rmlt{display:none;pointer-events:none}.lon .rmlt{display:block}" +
    ".lit .rmwb{filter:brightness(1.2) sepia(.25)}.rmlit,.rdu{display:none;pointer-events:none}.lit .rmlit,.jg .rdu{display:block}" +
    ".rsp{animation:rmsp 1.2s steps(1) infinite}.rsp.d1{animation-delay:.4s}.rsp.d2{animation-delay:.8s}@keyframes rmsp{0%{opacity:1}50%{opacity:0}}" +
    ".jg .rmwb{animation-duration:.25s}" +
    ".rdp{animation:rmdu .45s steps(3) infinite}.rdp.d1{animation-delay:.15s}.rdp.d2{animation-delay:.3s}@keyframes rmdu{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(-4px,-3px)}}" +
    ".rcfs{pointer-events:none}.rcf{animation:rmcf 6s steps(6) infinite}@keyframes rmcf{0%{transform:translate(0,-4px)}25%{transform:translate(2px,22px)}50%{transform:translate(-1px,48px)}75%{transform:translate(2px,74px)}100%{transform:translate(0,100px)}}.xlA{animation:rmxl 1.4s steps(1) infinite}.xlB{animation:rmxl 1.4s steps(1) infinite .7s}@keyframes rmxl{0%{opacity:1}50%{opacity:.2}}.wsn{animation:rmws 5s steps(14) infinite}@keyframes rmws{0%{transform:translate(0,0)}100%{transform:translate(3px,30px)}}#rmsa.go{animation:rmsa 7s steps(40) 1 forwards}@keyframes rmsa{0%{transform:translate(50px,19px)}50%{transform:translate(78px,13px)}100%{transform:translate(110px,19px)}}.mrs{animation:rmmr 30s steps(30) 1 forwards}@keyframes rmmr{0%{transform:translate(0,27px)}100%{transform:translate(0,0)}}.mrt{animation:rmmt 30s linear 1 forwards}@keyframes rmmt{0%{opacity:1}100%{opacity:0}}.rmhm{display:none}.hm .rmhm{display:block}.rhn{fill:#b794ff;animation:rmhn 1.6s steps(8) infinite}.rhn2{animation-delay:.8s}@keyframes rmhn{0%{transform:translate(0,4px);opacity:0}20%{opacity:1}100%{transform:translate(3px,-8px);opacity:0}}.hm .rlw{transform-box:fill-box;transform-origin:50% 100%;animation:rmlsw .8s steps(4) infinite}@keyframes rmlsw{0%{transform:rotate(-28deg)}50%{transform:rotate(28deg)}100%{transform:rotate(-28deg)}}" +
    ".rlA{animation:rmpa 1.4s steps(1) infinite}.rlB{opacity:0;animation:rmpb 1.4s steps(1) infinite}@media(prefers-reduced-motion:reduce){.rlA,.rlB{animation:none}.rlB{opacity:1}}" +
    ".rflA{opacity:1;animation:rmpa .6s steps(1) infinite}.rflB{opacity:0;animation:rmpb .6s steps(1) infinite}" +
    ".a-eq .rsb{animation:rseq .45s steps(3) 3}.rsb{transform-box:fill-box;transform-origin:50% 100%}@keyframes rseq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}" +
    ".rfl{opacity:0;pointer-events:none}.a-flash .rfl{animation:rflash .5s steps(2)}@keyframes rflash{0%,100%{opacity:0}30%,60%{opacity:1}}" +
    ".dn .rmwb{transform-box:fill-box;transform-origin:50% 100%;animation:rmdn .4s steps(1) infinite}@keyframes rmdn{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-3px) rotate(5deg)}}" +
    ".po .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(7deg)}" +
    ".lg .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(1px) rotate(10deg)}" +
    ".wp .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(1px) rotate(6deg)}.dk .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(-9deg)}" +
    ".rmdd{cursor:pointer}.rmdd:focus,.rmdd:focus-visible{outline:none}.rmdb{animation:rmbob .5s steps(1) infinite}" +
    ".rmrs{display:flex;gap:6px;margin-bottom:8px;overflow-x:auto;flex-wrap:nowrap;padding-bottom:4px;scrollbar-width:thin}.rmrs button{flex:0 0 auto;white-space:nowrap;display:inline-flex;align-items:center;gap:4px;font:inherit;font-size:12px;font-weight:800;padding:4px 10px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmrs .rmpc{font-style:normal;font-size:11px;opacity:.8}.rmrs button[aria-pressed=true]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}.rmrs button.nx:not([aria-pressed=true]){border-color:var(--gold)}.rmrs button:focus-visible,.rmna button:focus-visible{outline:3px solid var(--focus);outline-offset:2px}" +
    ".rmnx{position:absolute;inset:0;z-index:2;display:grid;place-items:center;padding:16px;background:rgba(6,24,58,.6)}.rmnc{width:100%;max-width:340px;background:var(--card);color:var(--ink);border:3px solid var(--dark);box-shadow:6px 6px 0 var(--line);padding:16px;text-align:center}.rmnc svg{width:64px;height:64px;margin-bottom:6px}.rmnc b{display:block;font-size:17px;color:var(--dark);margin-bottom:6px}.rmnc p{margin:0 0 12px;font-size:13px;line-height:1.5}.rmna{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.rmna button{font:inherit;font-size:13px;font-weight:800;padding:6px 12px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmna button[data-a=go]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}" +
    ".up .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(-1px) rotate(-7deg)}.lw .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:translateY(1px) rotate(7deg)}" +
    ".rmtk{display:none;pointer-events:none}.tk .rmtk{display:block}.rth{transform-box:fill-box;transform-origin:50% 50%;animation:rmth .6s steps(1) infinite}@keyframes rmth{0%{transform:scale(1)}50%{transform:scale(1.2)}}@media(prefers-reduced-motion:reduce){.rth{animation:none}}" +
    "@media(prefers-reduced-motion:reduce){.rpb.go{display:none}.rbal{animation:none}.rbA,.rbB,.rbm,.rcl,.tr .rpg,.rsp,.rdp,.rflA,.rflB{animation:none}.rbB,.rflB{opacity:0}.rbm{opacity:1}.rcfs{display:none}.xlA,.xlB,.wsn{animation:none}.mrs,.rhn,.hm .rlw,#rmng.mg:not(.wk) .rmbw{animation:none}.mrt{animation:none;opacity:0}}" +
    "@media(prefers-reduced-motion:reduce){.a-eq .rsb,.a-flash .rfl,.dn .rmwb,.rmdb{animation:none}}" +
    "#roomBtn{position:relative}.rmli{position:absolute;top:10px;right:10px;width:34px;height:34px;display:block;pointer-events:none}.rmli svg{display:block;width:100%;height:100%;image-rendering:pixelated}.entry .et em.rmlb{display:flex!important;flex-wrap:nowrap;align-items:center;gap:6px;background:none!important;border:0!important;padding:0!important;box-shadow:none!important;width:min(300px,100%)}.entry .et em.rmlb>span,.entry .et em.rmlb>b{display:inline-block!important;flex:none;width:auto!important;margin:0;background:none;border:0;white-space:nowrap}.entry .et em.rmlb>span.rmlc{background:#7b4fd6!important;color:#fff!important;padding:1px 6px!important}.entry .et em.rmpb{display:flex!important;flex-wrap:nowrap;align-items:center;gap:8px}.entry .et em.rmpb>span{display:inline-block!important;flex:none;width:auto!important;margin:0;white-space:nowrap}.entry .et em.rmpb>i.rmpx{flex:1 1 auto;min-width:0;margin-top:0}.rmlb{display:block;width:min(240px,100%);box-sizing:border-box;margin-top:6px;font-style:normal;font-size:12px;font-weight:800;line-height:1.5}.rmlc{background:#7b4fd6;color:#fff;padding:1px 6px;font-size:11px;letter-spacing:.5px}.rmlb b{font-weight:800}";
  document.head.appendChild(css);

  /* ===== 多房間：S.rm 是 ROOMS 的索引（0＝彩蛋小窩，1＝練習室…）。
     roomOpen(S.rm, st) 為 true 就顯示該房間的真場景，否則顯示 lockedRoom() 的上鎖畫面 ===== */
  var LOCK_SVG = '<svg viewBox="0 0 10 10" shape-rendering="crispEdges" width="10" height="10" aria-hidden="true" fill="currentColor"><rect x="3" y="0" width="4" height="1"/><rect x="2" y="1" width="1" height="3"/><rect x="7" y="1" width="1" height="3"/><rect x="1" y="4" width="8" height="5"/></svg>';
  /* 房間選擇器：每間一顆，開放的顯示完成度，鎖著的顯示鎖頭；前一間完成後，下一間的框會變金色。房間多了會左右捲動，方向鍵／Home／End 可在按鈕間移動 */
  function roomPicker(S) {
    var s = '<div class="rmrs" role="group" aria-label="' + esc(t("房間")) + '">';
    ROOMS.forEach(function (r, i) {
      var open = roomOpen(i, S.st), g = r.gate ? roomIx(r.gate) : -1, nx = g >= 0 && roomFull(g, S.st);
      s += '<button type="button" data-r="' + i + '"' + (nx ? ' class="nx"' : "") + ' aria-pressed="' + (S.rm === i) + '"><span>' + esc(r.chip) + "</span>" +
        (open ? '<em class="rmpc">' + roomPct(i, S.st) + "%</em>" : LOCK_SVG) + "</button>";
    });
    return s + "</div>";
  }
  function lockedRoom(i, st) {
    var r = ROOMS[i], g = r.gate ? roomIx(r.gate) : -1, gFull = g >= 0 && roomFull(g, st), lk = r.lock || { wait: "完成第一個房間後解鎖。", ready: "第一個房間已完成，新房間準備中。" };
    var G = "#2e3452", K = "#aab2c8";
    var sv = '<svg id="rmsv" viewBox="0 0 160 100" shape-rendering="crispEdges" role="img" aria-label="？？？">' +
      R(0, 0, 160, 66, "#3a4163") + R(0, 66, 160, 34, "#4b5273") + R(0, 64, 160, 3, "#59618a") +
      R(6, 16, 30, 50, G) + R(124, 10, 28, 28, G) + R(54, 76, 56, 16, G) + R(102, 52, 56, 3, G) +
      R(72, 30, 16, 4, K) + R(72, 34, 4, 12, K) + R(84, 34, 4, 12, K) +
      R(66, 46, 28, 22, K) + R(66, 46, 28, 2, "#c9cfe0") + R(78, 54, 4, 5, "#3a4163") + R(79, 59, 2, 5, "#3a4163") + "</svg>";
    return sv + '<div class="rmcap" aria-live="polite"><b>新房間即將推出</b><br>' +
      (gFull ? lk.ready : "<span>" + lk.wait + "</span> <small><span>" + (g >= 0 ? roomN(g, st) + " / " + roomItems(g).length : "") + "</span> <span>件</span></small>") + "</div>";
  }
  /* 「前往下一個房間」彈窗：ix＝剛完成的房間編號。標題用 ROOMS[ix].popTitle，下一間開放就顯示 ROOMS[ix+1].unlocked */
  function nextPop(ix, st) {
    var open2 = roomOpen(ix + 1, st);
    var door = R(3, 0, 10, 16, "#8b5a2b") + R(4, 1, 8, 14, "#c99a6b") + R(5, 2, 6, 6, "#b07a45") + R(5, 9, 6, 5, "#b07a45") + R(10, 8, 1, 2, "#ffd23f") + R(0, 2, 1, 1, "#ffd23f") + R(14, 5, 1, 1, "#ffd23f") + R(1, 12, 1, 1, "#fff") + R(14, 13, 1, 1, "#ffd23f");
    return '<div class="rmnx"><div class="rmnc" role="alertdialog" aria-modal="true" aria-labelledby="rmnt"><svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' + door + "</svg>" +
      '<b id="rmnt">' + ROOMS[ix].popTitle + '</b><p>' + (open2 ? ROOMS[ix + 1].unlocked : "下一個房間即將推出，敬請期待。") + '</p>' +
      '<div class="rmna"><button type="button" data-a="go">看看下一個房間</button><button type="button" data-a="cl">晚點再說</button></div></div></div>';
  }

  /* ===== 開啟專區 ===== */
  var opener = null;
  function open() {
    if (document.getElementById("rmo")) return;
    opener = document.activeElement;
    vdChoc = 6; vdMailUp = false; vdLetterN = 0; nyCalFlip = false; nyParty = false; xmasLit = false; hwLit = false;
    var bs = getBs(), L = bs.L, st = bs.st;
    /* ?preview=room2all：只在這次開啟，把練習室的物品全部當成已獲得（複製一份，不動 badgeSync 的資料） */
    var PALL = ROOMS.some(function (r) { return r.pvAll; });
    if (PALL) { st = Object.assign({}, st); var pd = new Date().toISOString().slice(0, 10); ROOMS.forEach(function (r) { if (r.pvAll) r.items.forEach(function (it) { if (!st[it.b]) st[it.b] = pd; }); }); }
    var S = { night: isNight(), lamp: isNight(), st: st, tab: "room", flt: "all", mem: Math.floor(Math.random() * WN.length), bias: false,
      wx: (window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) ? 66 : 20 + Math.floor(Math.random() * 80), wd: 1, wst: "walk", wuntil: 0, wj: 0, wrug: false, wwalk: 0, wcd: 0, wtr: 0, wtt: 0, wjn: 0, wju: 0, fwn: 0, fwb: null, rm: startRoom(), pop: false, fi: 0, fnx: 0, fc: 0, gp: "enter", gh: true, gpt: 0, dz: null, wdn: 0, capK: "", cph: 0 };
    /* 解鎖「偏心警告」（同一位成員打卡 5 個以上）就把那位本命固定放在房間裡，不再隨機、也不能換人 */
    (function () {
      var b = null;
      for (var i = 0; i < L.length; i++) if (L[i].id === "h-bias") b = L[i];
      var ix = b && st["h-bias"] ? WN.indexOf(b.bias) : -1;
      if (ix >= 0) { S.mem = ix; S.bias = true; }
    })();
    /* 優先順序：偏心警告的本命 > 今天生日的壽星 > 今天抽到的幸運籤成員 > 隨機 */
    if (!S.bias) {
      var bi = WN.indexOf(bdName());
      if (bi < 0) bi = WN.indexOf(drawnMem());
      if (bi >= 0) S.mem = bi;
    }
    /* 新獲得標記：跟 room-seen（已看過的物品）比對。
       第 1 間的物品打開小窩就算看過；第 2 間要等真的進到練習室才算（saveSeen(true)），
       所以練習室開放前就拿到的物品，開放後第一次進去仍會有 NEW 星星。
       第一次打開（還沒存過）第 1 間只建立基準，不會全部標成新的；預覽 room2all 的假資料不比對也不存 */
    S.nw = {};
    var seenOld = null, have = ROOMS.map(function (r) { return r.items.filter(function (it) { return st[it.b]; }).map(function (it) { return it.b; }); });
    /* ix＝剛進到的房間編號（-1＝沒有）；非 lazy 的房間打開就算看過，lazy 的房間只有進去那次（或之前已看過）才算 */
    function saveSeen(ix) {
      if (PALL) return;
      try {
        var keep = [];
        ROOMS.forEach(function (r, i) {
          have[i].forEach(function (b) { if (!r.lazy || i === ix || (seenOld && seenOld.indexOf(b) >= 0)) keep.push(b); });
        });
        localStorage.setItem("room-seen", JSON.stringify(keep));
        seenOld = keep;
      } catch (e) {}
    }
    if (!PALL) {
      try {
        var raw = localStorage.getItem("room-seen"), sn = raw ? JSON.parse(raw) : null;
        if (sn && typeof sn.indexOf === "function") seenOld = sn;
      } catch (e) {}
      ROOMS.forEach(function (r, i) {
        if (!r.lazy) { if (seenOld) have[i].forEach(function (b) { if (seenOld.indexOf(b) < 0) S.nw[b] = 1; }); }
        else if (roomOpen(i, st)) have[i].forEach(function (b) { if (!seenOld || seenOld.indexOf(b) < 0) S.nw[b] = 1; });
      });
      saveSeen(S.rm > 0 && roomOpen(S.rm, st) ? S.rm : -1);
    }
    /* 第一間全部解鎖：打開小窩時跳出「前往下一個房間」視窗。不存任何東西，所以每次載入網頁只跳一次 */
    /* 彈窗對象：最後一個「已完成、有 popTitle、下一間存在且還沒完成」的房間；每間房每次載入網頁只跳一次 */
    S.popIx = -1;
    window.__roomNextSeen = window.__roomNextSeen || {};
    ROOMS.forEach(function (r, i) {
      if (r.popTitle && i + 1 < ROOMS.length && roomOpen(i, st) && roomFull(i, st) && !roomFull(i + 1, st) && !window.__roomNextSeen[r.id]) S.popIx = i;
    });
    if (S.popIx >= 0) { S.pop = true; window.__roomNextSeen[ROOMS[S.popIx].id] = 1; }
    var nameOf = function (it) { for (var i = 0; i < L.length; i++) if (L[i].id === it.b) return L[i]; return null; };
    var o = document.createElement("div");
    o.id = "rmo";
    o.setAttribute("role", "dialog");
    o.setAttribute("aria-modal", "true");
    o.setAttribute("aria-label", "彩蛋小窩");
    document.body.appendChild(o);
    var prevOv = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function capFor(it) {
      var on = !!S.st[it.b], bd = nameOf(it);
      if (!on) {
        return it.hid
          ? "<b>？？？</b><br><small>隱藏物品，達成後才會揭曉。</small>"
          : "<b>" + esc(it.n) + "</b> <small>尚未解鎖</small><br>" + (bd ? esc(bd.desc) : ROOMS[S.rm].soft ? "<span>尚未開放：應援累積得夠多就會出現。</span>" : "<span>解鎖徽章：</span><span>" + esc(it.fb) + "</span>");
      }
      var say = it.say === "lamp" ? (S.lamp ? "檯燈亮了。" : "檯燈關了。") : (it.k === "tube" && drewToday() ? "今天已經抽過籤了，明天再來搖一搖。" : it.say);
      var tail = it.say === "clock" ? esc(clockSay()) : it.say === "pclock" ? esc(practiceClockSay()) : esc(say);
      return "<b>" + esc(it.n) + "</b> <small><span>來自徽章：</span><span>" + esc(bd ? bd.name : it.fb) + "</span> <span>·</span> <span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span></small><br>" + tail;
    }

    /* 換房間或換分頁時，把小人的動作重設成「散步」，避免帶著第 1 間的「看書、看日曆」狀態進到第 2 間 */
    function resetW() {
      S.wst = "walk"; S.wuntil = 0; S.wtt = 0; S.wtr = 0; S.wcd = 0; S.wdn = 0; S.wchain = [];
      if (S.wlOff === 1) { S.wlOff = 0; if (S.night) S.lamp = true; }
      if (S.gp !== "enter") S.wx = Math.max(6, Math.min(ROOMS[S.rm].wmax, S.wx));
    }
    function dzSay(i) {
      var cp = document.getElementById("rmcap");
      if (cp) cp.innerHTML = "<b>" + esc(WN[i]) + "</b><br>" + esc(t("隊形練習中，再練一遍。"));
      S.capK = ""; S.cph = performance.now() / 1000 + 3;
    }

    function draw() {
      var RM = ROOMS[S.rm], LIST = RM.items, locked = !roomOpen(S.rm, S.st), h;
      var n = roomN(S.rm, S.st), pct = roomPct(S.rm, S.st), full = roomFull(S.rm, S.st);
      var nn = 0; LIST.forEach(function (it) { if (S.nw[it.b]) nn++; });
      var NWM = "<b>有新物品！</b><br>閃爍的星星是新獲得的，點一下看看。";
      h = '<div class="rmc"><div class="rmh">' + (locked ? "<b>？？？</b><span></span>" : "<b>" + RM.name + "</b><span><span>" + n + " / " + roomItems(S.rm).length + "</span> <span>件</span></span>") + "</div>" + roomPicker(S) +
        (locked ? "" : '<div class="rmt" role="tablist"><button type="button" role="tab" data-t="room" aria-selected="' + (S.tab === "room") + '">房間</button><button type="button" role="tab" data-t="list" aria-selected="' + (S.tab === "list") + '">收藏清單</button></div>') + '<div class="rmb">';
      if (locked) {
        h += lockedRoom(S.rm, S.st);
      } else if (S.tab === "room") {
        h += RM.scene(S, full) + '<div class="rmcap" id="rmcap" aria-live="polite">' +
          (tourAway() ? tourCap(RM.alt) : tourBack() && !isAnniv() && !bdName() ? tourCap(RM.alt) : isAnniv() ? "<b>今天是 6/13，出道紀念日！</b><br>" + RM.cap.anniv : bdName() ? "<b>" + esc(bdName()) + "</b> <span>今天生日！</span><br>" + RM.cap.bd : bdWeekName() ? "<b>" + esc(bdWeekName()) + "</b> <span>" + esc(t("生日快到了！")) + "</span><br>" + esc(t(RM.cap.bw)) : annivWeek() ? "<b>" + esc(t(annivWeek() === 2 ? "出道紀念日剛過！" : "出道紀念日快到了！")) + "</b><br>" + esc(t(annivWeek() === 2 ? RM.cap.ax : RM.cap.aw)) : seasonKind() ? seasCap(RM.alt) : tourKind() ? tourCap(RM.alt) : isNye() ? "<b>" + esc(t("今天跨年！")) + "</b><br>" + esc(t(RM.cap.nye)) : bdAfterName() ? "<b>" + esc(bdAfterName()) + "</b> <span>" + esc(t("昨天生日！")) + "</span><br>" + esc(t("昨天的派對還有一點餘味。")) : nn ? NWM : full ? RM.cap.done : RM.cap.hint) + "</div>" +
          '<div class="rmbar"><div class="rmp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><s style="width:' + pct + '%"></s></div><span><span>' + RM.pct + "</span> <span>" + pct + '%</span></span><button type="button" class="rmn" id="rmdn">' + (S.night ? "☀ 切到白天" : "🌙 切到夜晚") + "</button></div>";
      } else {
        h += '<div class="rmf"><button type="button" data-f="all" aria-pressed="' + (S.flt === "all") + '">全部</button><button type="button" data-f="on" aria-pressed="' + (S.flt === "on") + '">已獲得</button><button type="button" data-f="off" aria-pressed="' + (S.flt === "off") + '">未獲得</button></div><div class="rml">';
        LIST.forEach(function (it) {
          var on = !!S.st[it.b];
          if ((S.flt === "on" && !on) || (S.flt === "off" && on)) return;
          var bd = nameOf(it);
          h += '<div class="rmk' + (on ? " on" : "") + '"><svg viewBox="0 0 ' + it.w + " " + it.h + '" shape-rendering="crispEdges" aria-hidden="true" class="' + (on ? "" : "lk") + '">' + it.art + "</svg><b>" + (on || !it.hid ? esc(it.n) : "？？？") + "</b>" + (S.nw[it.b] ? '<em class="rmnw">NEW</em>' : "") + "<small>" +
            (on ? "<span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span>" : it.hid ? "隱藏物品" : (bd ? esc(bd.desc) : ROOMS[S.rm].soft ? "<span>尚未開放：應援累積得夠多就會出現。</span>" : "<span>解鎖徽章：</span><span>" + esc(it.fb) + "</span>")) + "</small></div>";
        });
        h += "</div>";
      }
      h += '</div><button type="button" class="btn rmx">關閉</button></div>';
      if (S.pop) h += nextPop(S.popIx, S.st);
      o.innerHTML = h;
      var cur = o.querySelector('.rmrs button[aria-pressed="true"]');
      if (cur && cur.scrollIntoView) { try { cur.scrollIntoView({ block: "nearest", inline: "nearest" }); } catch (e) {} }
      S.capK = ""; S.cph = performance.now() / 1000 + 4; /* 剛畫好的提示文字先留 4 秒，再換成小人的動作文字 */
      try { window.I18N && I18N.refresh(); } catch (e) {}
      if (S.pop) { var pb = o.querySelector(".rmnc button"); if (pb) pb.focus(); }
    }

    function pop(g, it) {
      if (!it.an) return;
      var c = "a-" + it.an;
      g.classList.remove(c);
      void g.getBoundingClientRect();
      g.classList.add(c);
      setTimeout(function () { g.classList.remove(c); }, 1500);
    }
    function hit(g) {
      var k = g.getAttribute("data-k"), it = ALL.filter(function (x) { return x.k === k; })[0];
      if (!it) return;
      var on = !!S.st[it.b];
      if (on && S.nw[it.b]) {
        delete S.nw[it.b];
        var mk = g.parentNode && g.parentNode.querySelector(".rnw");
        if (mk) mk.remove();
      }
      if (on && it.k === "lamp") {
        S.lamp = !S.lamp;
        g.classList.toggle("on", S.lamp);
        var sv = document.getElementById("rmsv");
        if (sv) sv.classList.toggle("lon", S.lamp);
      }
      else if (on) pop(g, it);
      /* 有功能入口的物品：第一次點先顯示說明和「再點一次」提示，4 秒內再點一次才真的離開小窩去那個功能，避免誤觸跳走 */
      var ac = on ? actOf(it.k) : null, now = performance.now() / 1000;
      if (ac && S.armK === it.k && now < S.armT) { S.armK = ""; leaveAnd(ac.run); return; }
      S.armK = ac ? it.k : ""; S.armT = now + 4;
      var cap = document.getElementById("rmcap");
      if (cap) cap.innerHTML = capFor(it) + (ac ? "<br><b>" + esc(t(ac.hint)) + "</b>" : "");
      S.capK = ""; S.cph = now + 5;
      if (on && ((it.k === "tickets" && seasonKind() === "ny") || (it.k === "photo" && seasonKind() === "vd"))) ngStart(now);
    }

    /* 物品 → 站內功能。函式都是 app.js 的全域函式；讀不到（或功能沒開）就回傳 null，那個物品維持原本只講話 */
    function playGame() {
      var L = SONGS.filter(ftOK), P = L.filter(function (s) { return !gCleared(s); });
      if (!P.length) P = L;
      gos("songs");
      if (!P.length) return;
      var x = P[Math.floor(Math.random() * P.length)], m = memOf(x);
      VIEW = m ? "m" : "a"; MEM = m; ALB = albOf(x); SEL = x.t; SMODE = "g";
      try { sessionStorage.setItem("song-view", VIEW); localStorage.setItem("song-sel", SEL); } catch (e) {}
      songsR();
      window.scrollTo(0, 0);
    }
    function actOf(k) {
      try {
        if (k === "tube" && !drewToday() && typeof ftOpen === "function") return { hint: "再點一次，去抽今天的幸運籤", run: ftOpen };
        if ((k === "ball" || k === "pboard") && typeof predOpen === "function" && typeof predUrl === "function" && predUrl()) return { hint: "再點一次，去猜下一場的歌單", run: predOpen };
        if (k === "pspk" && typeof gos === "function" && typeof SONGS !== "undefined" && SONGS.some(ftOK)) return { hint: "再點一次，去玩應援遊戲", run: playGame };
      } catch (e) {}
      return null;
    }
    /* 關掉小窩去做某件事；如果那件事開了視窗（抽籤、歌單預測），視窗關掉後自動回到小窩，
       這樣抽完籤回來，房間裡站的就是剛抽到的成員。跳去別的頁面（例如應援遊戲）就不會再開回來 */
    function leaveAnd(fn) {
      close();
      try { fn(); } catch (e) { return; }
      var ids = ["ftn", "ftimg", "bgd", "stampPv"];
      var up = function () { return ids.some(function (i) { return document.getElementById(i); }); };
      if (!up()) return;
      var n = 0, iv = setInterval(function () {
        if (++n > 1500) { clearInterval(iv); return; }
        if (up()) return;
        clearInterval(iv);
        if (typeof sec !== "undefined" && sec === "home" && !document.getElementById("rmo")) open();
      }, 400);
    }

    function walk(g) {
      if (S.bias) {
        var cb = document.getElementById("rmcap");
        if (cb) cb.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t("本命一直都在小窩裡。"));
        S.capK = ""; S.cph = performance.now() / 1000 + 2.5;
        return;
      }
      S.mem = (S.mem + 1) % WN.length;
      var im = g.querySelector("image");
      if (im) im.setAttribute("href", avUrl(WN[S.mem]));
      var mi = o.querySelector(".rmmra");
      if (mi) mi.setAttribute("href", avUrl(WN[S.mem]));
      g.setAttribute("aria-label", WN[S.mem] + (lang() === "zh" ? "，" : ", ") + t("散步的小人"));
      var cap = document.getElementById("rmcap");
      if (cap) cap.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t("在小窩裡散步。"));
      S.capK = ""; S.cph = performance.now() / 1000 + 2.5;
    }

    /* 小人的動作由這個迴圈控制：左右走、踏上地毯跳一下、走到球鞋（有解鎖才會）停 2 秒、夜晚走一陣子就打瞌睡 5 秒 */
    var raf = 0, lastTs = 0, SPD = 12.5, QMIN = 15, QSPAN = 10; /* 每次停下來互動結束後，至少安靜 QMIN～QMIN+QSPAN 秒（15～25 秒）才會有下一次互動；想更久或更短就改這兩個數字（小窩、練習室共用） */
    var reduceM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
    /* 新動作：走到書架（左邊）看書、走到日曆／時鐘下（中間）抬頭看。解鎖對應物品才會做 */
    /* 萬聖節的糖果／掃帚：跳一下或抖一下；rand＝小人自己去玩時隨機挑一個 */
    function popFx(g) {
      var f = FXI[g.getAttribute("data-k")];
      if (!f) return;
      var c = "a-" + f.an;
      g.classList.remove(c);
      void g.getBoundingClientRect();
      g.classList.add(c);
      setTimeout(function () { g.classList.remove(c); }, 1500);
    }
    /* 新年拜年：七個人排排站、一起鞠躬約 6 秒。小人（單人）暫時隱藏，結束後回來；重畫畫面時 tick 會自動補回 */
    /* 淡入淡出：單人小人和七人交接時不要瞬間消失／出現 */
    function fadeEl(e, v) {
      if (e.__fo === v) return;
      e.__fo = v; e.style.transition = "opacity .8s linear"; e.style.opacity = v;
    }
    function ngSync() {
      var g = o.querySelector(".rmwx"), ng = o.querySelector("#rmng");
      if (S.ngA) {
        if (!ng) { var sv = o.querySelector("#rmsv"); if (sv) sv.insertAdjacentHTML("beforeend", ngHtml(S.ngP ? S.ngx : null)); }
        if (g) fadeEl(g, 0);
      } else {
        if (ng) ng.remove();
        if (g) fadeEl(g, 1);
        if (nyParty && !o.querySelector("#rmscrap")) { var sv2 = o.querySelector("#rmsv"); if (sv2) sv2.insertAdjacentHTML("beforeend", nyScrapArt()); }
      }
    }
    /* 七人進場（新年、情人節、中秋、跨年夜）改成一個小時一次：上一次進場的時間存在 localStorage: room-ng，重新開啟小窩也要等滿一小時（第一次或超過一小時沒進場，開啟後約 6 秒就會進場）。預覽（?preview=）時不限，維持每 25～45 秒一次方便測試；點車票／照片手動觸發不受限制 */
    function ngWait(now) {
      if (PV) return now + 6;
      var last = 0;
      try { last = +localStorage.getItem("room-ng") || 0; } catch (e) {}
      return now + Math.max(6, Math.min(3600, (last + 3600000 - Date.now()) / 1000));
    }
    function ngAfter(now) { return PV ? now + 25 + Math.random() * 20 : now + 3580; }
    function ngMark() { try { localStorage.setItem("room-ng", String(Date.now())); } catch (e) {} }
    function ngStart(now) {
      if (S.ngA || S.ngW || !ROOMS[S.rm].ng) return;
      /* 七人要進場前，一定要等單人已經離場：先讓單人往右走出畫面（ngW），走完才由 tick 呼叫 ngGo 讓七人進來 */
      if (!reduceM) {
        S.ngW = 1; S.ngNext = now + 1e9;
        S.wst = "out"; S.wot = 0; S.wd = 1; S.wuntil = 1e12; S.wdep = 1; S.wng = 1; S.wgiv = seasonKind() === "ny" ? 1 : 0;
        return;
      }
      ngGo(now);
    }
    function ngGo(now) {
      var vdg = seasonKind() === "vd";
      /* 情人節：七個人從左邊慢慢走進來、排好比愛心鞠躬 6 秒、再往右邊慢慢走出去（跟練習室、6/13 一樣）；新年維持原地拜年 6 秒 */
      S.ngx = WN.map(function (n, i) { return reduceM ? 8 + i * 21 : -24 - i * 12; });
      S.ngP = reduceM ? "hold" : "in";
      S.ngA = !reduceM ? 1e12 : now + 6;
      S.ngNext = !reduceM ? now + 1e9 : ngAfter(S.ngA);
      ngMark();
      var cap = document.getElementById("rmcap");
      if (seasonKind() === "mid") { if (cap) cap.innerHTML = "<b>" + esc(t("七個人一起賞月！")) + "</b><br>" + esc(t("中秋節快樂，月亮好圓。")); } else
      if (isNye() && !seasonKind()) { nyParty = true; if (cap) cap.innerHTML = "<b>" + esc(t("七個人一起跨年！")) + "</b><br>" + esc(t("乾杯，倒數完就是新的一年了。")); } else
      if (cap) cap.innerHTML = seasonKind() === "vd" ? "<b>" + esc(t("七個人一起送愛心！")) + "</b><br>" + esc(t("情人節快樂，愛心送給每一位 ARMY。")) : "<b>" + esc(t("七個人一起拜年！")) + "</b><br>" + esc(t("新年快樂，今年也請多多指教。"));
      S.capK = ""; S.cph = now + (!reduceM ? 16 : 6);
      ngSync();
      if (reduceM) setTimeout(function () { S.ngA = 0; S.ngP = ""; ngSync(); }, 6000);
    }
    function ngSay(i) {
      var L = seasonKind() === "vd" ? ["情人節快樂！", "愛心送給你！", "今天也要一起幸福！"] : seasonKind() === "mid" ? ["中秋節快樂！", "月亮好圓！", "月餅分你一半！"] : (isNye() && !seasonKind()) ? ["跨年快樂！", "乾杯！", "一起倒數！"] : ["新年快樂！", "恭喜發財！", "新年也要一起應援！"], cap = document.getElementById("rmcap");
      if (cap) cap.innerHTML = "<b>" + esc(WN[i]) + "</b><br>" + esc(t(L[Math.floor(Math.random() * L.length)]));
      S.capK = ""; S.cph = performance.now() / 1000 + 3;
    }
    function popFxK(k) {
      var l = o.querySelectorAll('.rmfx[data-k="' + k + '"]');
      if (l.length) popFx(l[Math.floor(Math.random() * l.length)]);
    }
    function fxHit(g) {
      var f = FXI[g.getAttribute("data-k")];
      if (!f) return;
      if (g.getAttribute("data-k") === "hwpump") { hwLit = !hwLit; g.innerHTML = hwPumpInner(); }
      if (g.getAttribute("data-k") === "xtree") {
        xmasLit = !xmasLit; g.innerHTML = xtreeInner();
        var ws = o.querySelector("#rmws"); if (ws) ws.style.display = xmasLit ? "" : "none";
      }
      popFx(g);
      var cap = document.getElementById("rmcap");
      var sy = g.getAttribute("data-k") === "vdchoc" && vdChoc <= 0 ? CAPS.chocE : (g.getAttribute("data-k") === "xtree" && !xmasLit) || (g.getAttribute("data-k") === "hwpump" && !hwLit) ? f.off : f.say;
      if (cap) cap.innerHTML = "<b>" + esc(t(f.n)) + "</b><br>" + esc(t(sy[Math.floor(Math.random() * sy.length)]));
      S.capK = ""; S.cph = performance.now() / 1000 + 5;
      /* 萬聖節：點亮南瓜的那一刻，小人（在散步、沒在忙別的）被嚇一跳：連跳兩下、頭上冒驚嘆號、轉向南瓜，下方文字換成他自己的反應 */
      if (g.getAttribute("data-k") === "hwpump" && hwLit && S.wst === "walk" && !S.ngA && !S.ngW && !S.pop) {
        var t1 = performance.now() / 1000, sc = CAPS.scare;
        enter("scare", t1);
        if (cap) cap.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t(sc[Math.floor(Math.random() * sc.length)]));
        S.capK = "scare"; S.cph = t1 + 4;
      }
    }
    /* 小人偷吃一顆：盒子裡最後那顆消失 */
    function chocEat() {
      if (vdChoc <= 0) return;
      vdChoc--;
      var e = o.querySelector('.rcp[data-i="' + vdChoc + '"]');
      if (e) e.remove();
    }
    /* 信寄出去了：旗子升起（投信那一刻就升了），地板上的情書換成新的一封 */
    function mailDone() {
      vdMailUp = true; vdLetterN++;
      var ml = o.querySelector(".rmml"), lg = o.querySelector('.rmfx[data-k="vdletter"]');
      if (ml) ml.classList.add("up");
      if (lg) {
        var ol = lg.querySelector(".rlt");
        lg.insertAdjacentHTML("beforeend", letterArt(vdLetterN, 138));
        if (ol) ol.remove();
      }
    }
    function popK(k) {
      var it = ALL.filter(function (x) { return x.k === k; })[0], gg = o.querySelector('.rmi[data-k="' + k + '"]');
      if (it && gg) pop(gg, it);
    }
    /* 動作變了就換下方文字；剛點過物品／換人時先讓出一小段時間，不會把台詞蓋掉 */
    function capSt(now, key) {
      var cp = document.getElementById("rmcap");
      if (!cp || now < S.cph || S.capK === key) return;
      if ((key === "out" || key === "back") && S.wng) key = key === "out" ? "outG" : "backG";
      if (key === "greet") key = "greet" + festKey();
      if (isNye()) { if (key === "cal") key = "calN"; else if (key === "tear") key = "tearN"; }
      if (S.capK === key) return;
      S.capK = key;
      if ((key === "walk" || key === "run" || key === "w2") && (isAnniv() || bdName())) {
        var r2 = key === "w2";
        cp.innerHTML = isAnniv()
          ? "<b>" + esc(t("今天是 6/13，出道紀念日！")) + "</b><br>" + esc(t(r2 ? "練習室也掛上彩旗了。" : "小窩也掛上彩旗了。"))
          : "<b>" + esc(bdName()) + "</b> <span>" + esc(t("今天生日！")) + "</span><br>" + esc(t(r2 ? "練習室為壽星布置好了。" : "小窩為壽星布置好了。"));
        return;
      }
      if (tourKind() && !seasonKind() && (key === "walk" || key === "run" || key === "w2")) {
        cp.innerHTML = tourCap(key === "w2");
        return;
      }
      var sk = seasonKind();
      if (sk && (key === "walk" || key === "run" || key === "w2")) {
        cp.innerHTML = "<b>" + esc(t(SEAS[sk].tt)) + "</b><br>" + esc(t(key === "w2" ? SEAS[sk].s2 : SEAS[sk].s1));
        return;
      }
      var tx;
      if (key === "clk") tx = S.wchm ? chimeSay() : clockSay();
      else {
        var a = CAPS[key === "poster" ? (tourKind() === "today" ? "posterT" : "posterE") : key];
        if (!a) return;
        var lo = 0;
        tx = t(a[lo + Math.floor(Math.random() * (a.length - lo))]);
      }
      cp.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(tx);
    }
    /* 練習室：開始走向毛巾（站在毛巾左邊）或水瓶（站在水瓶左邊），到了才由 enter() 接手 */
    function goTo(act) { S.wact = act; S.wtgt = act === "wipe" ? 18 : 90; S.wst = "go"; S.wuntil = 1e12; }
    function popBurst(id) {
      var b = o.querySelector("#" + (id || "rpb"));
      if (!b) return;
      b.classList.remove("go");
      void b.getBoundingClientRect();
      b.classList.add("go");
      setTimeout(function () { b.classList.remove("go"); }, 1500);
    }
    /* 小人主動說的話：依時間、小窩進度、有沒有新物品、今天抽籤了沒挑幾句，隨機選一句（不會連兩次一樣）。
       句子都要在 LT 裡有翻譯。想多加句子：在下面 P.push 補一句，再到 LT 補英韓日 */
    function talkLine() {
      var h = new Date().getHours(), P = [], pct = roomPct(S.rm, S.st), nw = false, k, c;
      for (k in S.nw) if (S.nw[k]) { nw = true; break; }
      c = h >= 5 && h < 11 ? "早安！今天也要元氣滿滿。" : h >= 11 && h < 14 ? "中午了，有好好吃飯嗎？" : h >= 14 && h < 18 ? "下午了，喝口水休息一下吧。" : h >= 18 && h < 22 ? "晚上好，今天過得怎麼樣？" : "這麼晚了，早點休息，晚安。";
      P.push(c, c);
      P.push(pct >= 100 ? "小窩完成了，我最喜歡這裡了。" : pct >= 40 ? "小窩越來越熱鬧了，謝謝你一直來。" : "房間還有好多空位，多打卡就會有新東西。");
      if (nw) P.push("好像有新東西耶，點閃閃的星星看看。", "好像有新東西耶，點閃閃的星星看看。");
      if (S.st["f-s7"] && !drewToday()) P.push("今天還沒抽籤喔，籤筒在等你。", "今天還沒抽籤喔，籤筒在等你。");
      if (S.night && S.lamp && S.st["f-s3"]) P.push("有檯燈在，晚上也不怕黑。");
      P.push("今天也辛苦了，有你在真好。", "記得多喝水，也要好好休息喔。", "今天有打卡了嗎？一起去看看應援吧。", "今天也一起加油吧！", "要不要一起聽歌？");
      P = P.filter(function (x) { return x !== S.wsl; });
      return P[Math.floor(Math.random() * P.length)];
    }
    function talkSay(now) {
      var line = talkLine(), cp = document.getElementById("rmcap");
      S.wsl = line;
      if (cp) cp.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t(line));
      S.capK = "talk"; S.cph = now + 4.2;
    }
    /* 檯燈開關（跟點檯燈同一套：房間的燈光範圍 .lon、檯燈本體 .on） */
    function lampSet(on) {
      S.lamp = on;
      var lg = o.querySelector(".rmlamp"), sv = document.getElementById("rmsv");
      if (lg) lg.classList.toggle("on", on);
      if (sv) sv.classList.toggle("lon", on);
    }
    /* 檯燈「睡一覺」：0～1.2 秒伸手關燈（1 秒時燈滅）→ 睡到 7.2 秒 → 伸手開燈（燈亮）→ 約 8.8 秒結束。白天或燈本來就沒開時只做動作，不會改燈 */
    function lampStep(now) {
      var le = now - S.wls;
      S.wlK = le < 1.2 ? "loff" : le < 7.2 ? "lsl" : "lon";
      if (le >= 1 && !S.wlOff) { S.wlOff = 1; if (S.lamp) lampSet(false); }
      if (le >= 7.2 && S.wlOff === 1) { S.wlOff = 2; if (S.night) lampSet(true); }
    }
    function enter(w, now) {
      S.wst = w;
      if (w === "talk") {
        S.wuntil = now + 4.2; S.wj = 0.5; S.wsn = now + 30 + Math.random() * 30;
        talkSay(now);
        var tb = o.querySelector(".rmtk");
        if (tb) tb.innerHTML = talkBub();
      } else
      if (w === "read") { S.wuntil = now + 3.4; popK("shelf"); }
      else if (w === "tube") { S.wuntil = now + 3.2; popK("tube"); }
      else if (w === "tubeR") { S.wuntil = now + 4.2; S.wtbs = now; S.wtbj = 0; popK("tube"); var tb2 = o.querySelector(".rmtk"); if (tb2) tb2.innerHTML = talkBub("!"); }
      else if (w === "lread") { S.wuntil = now + 3.8; S.wd = 1; }
      else if (w === "lamp") { S.wuntil = now + 8.8; S.wd = 1; S.wls = now; S.wlOff = 0; S.wlK = "loff"; }
      else if (w === "cab") { S.wuntil = now + 3.2; popK("cabinet"); }
      else if (w === "water") { S.wuntil = now + 3.2; S.wd = 1; popK("plant"); }
      else if (w === "peek") { S.wuntil = now + 3.2; S.wd = 1; popK("ball"); }
      else if (w === "decal") { S.wuntil = now + 3; S.wd = 1; popK("decal"); }
      else if (w === "poster") { S.wuntil = now + 3; }
      else if (w === "plog") { S.wuntil = now + 3.4; S.wd = 1; popK("plog"); }
      else if (w === "wipe") { S.wuntil = now + 2.8; S.wd = 1; popK("ptowel"); }
      else if (w === "drink") { S.wuntil = now + 3; S.wd = 1; popK("pwater"); popFxK("prbottle"); }
      else if (w === "bdb") { S.wuntil = now + 2.8; popFxK("bdballoon"); }
      else if (w === "bdg") { S.wuntil = now + 2.8; popFxK("bdgift"); }
      else if (w === "candy") { S.wuntil = now + 2.8; popFxK("hwcandy"); }
      else if (w === "broom") { S.wuntil = now + 3; popFxK("hwbroom"); }
      else if (w === "choc" || w === "chocL") { S.wuntil = now + 3; S.wd = -1; S.wchc = now + 1.2; popFxK("vdchoc"); }
      else if (w === "chocE") { S.wuntil = now + 2.6; S.wd = -1; popFxK("vdchoc"); }
      else if (w === "write") { S.wuntil = now + 3.4; S.wd = 1; popFxK("vdletter"); }
      else if (w === "mail") { S.wuntil = now + 2.8; S.wd = 1; S.wmd = now + 1.2; var mb = o.querySelector(".rmtk"); if (mb) mb.innerHTML = talkBub(); }
      else if (w === "rose") { S.wuntil = now + 3; S.wd = 1; popFxK("vdrose"); }
      else if (w === "letter") { S.wuntil = now + 3.6; S.wd = 1; popFxK("vdletter"); var lb2 = o.querySelector(".rmtk"); if (lb2) lb2.innerHTML = talkBub(); }
      else if (w === "cookie") { S.wuntil = now + 3.2; S.wd = -1; popFxK("xcookie"); }
      else if (w === "gift") { S.wuntil = now + 2.8; popFxK("xgift"); }
      else if (w === "sock") { S.wuntil = now + 2.8; popFxK("xsock"); }
      else if (w === "hb") { S.wuntil = now + 2.8; popFxK("nyhb"); }
      else if (w === "snack") { S.wuntil = now + 3; S.wd = 1; popFxK("nyesnack"); }
      else if (w === "fwatch") { S.wuntil = now + 5; S.wd = 1; }
      else if (w === "scare") { S.wuntil = now + 2.8; S.wd = S.wx > 36 ? -1 : 1; S.wj = 0.5; S.wsc = 1; var sb = o.querySelector(".rmtk"); if (sb) sb.innerHTML = talkBub("!"); }
      else if (w === "greet") { S.wuntil = now + 4; S.wd = 1; S.wj = 0.5; var gbb = o.querySelector(".rmtk"); if (gbb) gbb.innerHTML = talkBub(); }
      else if (w === "hbg") { S.wuntil = now + 3; S.wd = 1; S.wj = 0.5; }
      else if (w === "hum") { S.wuntil = now + 6.5; S.wd = 1; }
      else if (w === "mcake") { S.wuntil = now + 3.2; S.wd = -1; popFxK("midcake"); }
      else if (w === "mwatch") { S.wuntil = now + 5; S.wd = 1; }
      else if (w === "ingot") { S.wuntil = now + 3; S.wd = -1; popFxK("nyingot"); }
      else if (w === "pack") { S.wuntil = now + 3.4; S.wd = 1; S.wfc = now + 10; }
      else if (w === "pop") { S.wuntil = now + 2.8; S.wbl = now; S.wbj = 0; S.wd = 1; S.wfc = now + 12; }
      else if (w === "blow") { S.wuntil = now + 4; S.wbl = now; S.wbj = 0; S.wfc = now + 14; }
      else if (w === "clk") {
        S.wchm = !!S.wchmN; S.wchmN = 0;
        S.wuntil = now + (S.wchm ? 4 : 3.2);
        popK("clock");
        var bb = o.querySelector(".rmck");
        if (bb) bb.innerHTML = tmBub();
      } else if (w === "cal") {
        S.wuntil = now + 3.4;
        S.wtt = isNye() ? (nyCalFlip ? 0 : now + 1) : (Math.random() < 0.5 ? now + 1 : 0);
        S.wtr = 0;
      }
    }
    /* 練習室的動作迴圈（TICKS.prac，在練習室開放且被選到時由 tick 轉進來）：
       單人：左右散步；走到左端（有三腳架）擺姿勢拍照、走到右端（有音響）跳舞、平常每 7～15 秒隨機跳一小段、夜晚走一陣子就打瞌睡。
       100%：七人在 FORM 的四種隊形之間換位（每 3.6 秒換一次），鏡子裡的倒影同步移動。 */
    function vis(e, on) {
      if (e && e.__v !== on) { e.__v = on; if (on) e.removeAttribute("display"); else e.setAttribute("display", "none"); }
    }
    function tick2(now, dt) {
      var g = o.querySelector(".rmwx"), ds = o.querySelector("#rmdz"), i, ph = ds ? S.gp : "", sw = !ds || ph === "away" || ph === "enter";
      if (ds && ph === "away") {
        if (!S.gpw) S.gpw = now + 25 + Math.random() * 20;
        else if (!S.gclr && now >= S.gpw && S.wst === "walk") {
          /* 七人要進場前，先等單人完全離場：單人往右走出畫面（gclr），走完才換七人從左邊進來 */
          S.gclr = 1; S.wd = 1;
        }
        if (S.gclr && S.wx >= 168) {
          S.gclr = 0; S.gpw = 0; S.gp = ph = "enter"; S.wd = 1; S.fi = 0; S.capK = "";
          S.dz.forEach(function (d, k) { d.x = -24 - k * 12; d.y = FORM[0][k][1]; });
          sw = true;
        }
      }
      if (ds) {
        vis(o.querySelector("#rmwv"), sw && !(ph === "enter" && (S.wx >= 168 || S.gh)));
        vis(o.querySelector("#rmmr"), sw && !(ph === "enter" && (S.wx >= 168 || S.gh)));
        vis(o.querySelector("#rmdzw"), ph !== "away");
        vis(o.querySelector("#rmdrg"), ph !== "away");
      }
      if (g && sw) {
        if (S.wst === "walk" && !S.wdep && tourLeaving()) { S.wst = "out"; S.wot = 0; S.wd = 1; S.wuntil = 1e12; S.wdep = 1; }
        if (S.wst === "walk") {
          if (ph === "enter" || S.gclr) {
            S.wd = 1; S.wx += SPD * 1.5 * dt;
          } else {
            if (!S.wdn) S.wdn = now + 7 + Math.random() * 8;
            var px2 = S.wx, qok = now >= (S.wq || 0);
            S.wx += S.wd * SPD * dt;
            S.wwalk += dt;
            if (S.wx >= 108) {
              S.wx = 108; S.wd = -1;
              if (S.st["p-game"] && qok && Math.random() < 0.7) { S.wst = "dn"; S.wuntil = now + 3; popK("pspk"); }
            } else if (S.wx <= 6) {
              S.wx = 6; S.wd = 1;
              if (isFest() && qok && now >= (S.wfc || 0) && Math.random() < 0.5) enter("pop", now);
              else if (S.st["p-pass"] && qok && Math.random() < 0.7) { S.wst = "pose"; S.wuntil = now + 2.2; popK("ptripod"); }
            }
            if (S.wst === "walk" && isFest() && S.st["h-613"] && qok && now >= (S.wfc || 0) && ((px2 < 60 && S.wx >= 60) || (px2 > 60 && S.wx <= 60)) && Math.random() < 0.5) { S.wx = 60; enter("blow", now); }
            /* 成員生日：經過練習室的禮物堆（x≈84）、氣球（x≈106）前有機會停下來看一眼 */
            if (S.wst === "walk" && bdName() && qok && now >= (S.wgf || 0) && ((px2 < 72 && S.wx >= 72) || (px2 > 72 && S.wx <= 72)) && Math.random() < 0.5) { S.wx = 72; S.wgf = now + 15; enter("bdg", now); }
            if (S.wst === "walk" && bdName() && qok && now >= (S.wbf || 0) && ((px2 < 93 && S.wx >= 93) || (px2 > 93 && S.wx <= 93)) && Math.random() < 0.4) { S.wx = 93; S.wbf = now + 15; enter("bdb", now); }
            /* 練習日誌（解鎖才會）：往右走經過 x≈98，停在日誌左邊，低頭翻日誌、寫進度，日誌跳一下 */
            if (S.wst === "walk" && S.st["p-week"] && qok && now >= (S.wlf || 0) && px2 < 98 && S.wx >= 98 && Math.random() < 0.5) { S.wx = 98; S.wlf = now + 15; enter("plog", now); }
            if (S.wst === "walk" && tourBack() && qok && now >= (S.whm || 0)) { S.whm = now + 35 + Math.random() * 25; enter("hum", now); }
            if (S.wst === "walk" && qok && now >= S.wdn) { S.wst = "dn"; S.wuntil = now + 2.4; S.wdn = 0; if (S.st["p-game"]) popK("pspk"); }
            if (!S.wslT) S.wslT = 30 + Math.random() * 25;
            if (S.wst === "walk" && S.night && qok && S.wwalk > S.wslT) { S.wst = "sleep"; S.wuntil = now + 5; S.wwalk = 0; S.wslT = 0; if (S.st["p-late"]) popK("pclock"); }
          }
        } else if (S.wst === "go") {
          /* 走向毛巾／水瓶：到了就開始擦汗／喝水 */
          var gdx = S.wtgt - S.wx, gst = SPD * 1.4 * dt;
          if (Math.abs(gdx) <= gst) { S.wx = S.wtgt; S.wd = 1; enter(S.wact, now); }
          else { S.wd = gdx > 0 ? 1 : -1; S.wx += S.wd * gst; }
        } else if (S.wst === "out") {
          /* 演唱會：小人拿著手燈往右走出練習室；22:00 後從左邊走回來 */
          S.wd = 1;
          if (!S.wot) { S.wx += SPD * 1.3 * dt; if (S.wx >= 172) { S.wot = 1; S.wouti = now + 6; } }
          else if (S.wot === 1) { if (now >= S.wouti && !S.wdep) { S.wot = 2; S.wx = -30; } }
          else { S.wx += SPD * 1.3 * dt; if (S.wx >= 40) { S.wst = "walk"; S.wot = 0; S.wuntil = 0; S.wng = 0; S.wcd = now + 6; S.wq = now + QMIN + Math.random() * QSPAN;  if (S.wgiv) { S.wgiv = 0; enter("hbg", now); } else if (tourBack()) { S.whm = now + 40; enter("hum", now); } } }
        } else if (now >= S.wuntil) {
          var was = S.wst;
          S.wst = "walk"; S.wq = now + QMIN + Math.random() * QSPAN;
          /* 跳完舞：有機會先去擦汗（毛巾）、再去喝水（水瓶），各自要解鎖對應物品才會做 */
          if (was === "dn") {
            S.wchain = [];
            if (S.st["p-fav"] && Math.random() < 0.6) S.wchain.push("wipe");
            if (S.st["p-chk"] && Math.random() < 0.6) S.wchain.push("drink");
          }
          if (S.wchain && S.wchain.length) goTo(S.wchain.shift());
        } else if ((S.wst === "blow" && !S.wbj && now - S.wbl > 2.4) || (S.wst === "pop" && !S.wbj && now - S.wbl > 1)) { S.wbj = 1; S.wj = 0.5; if (S.wst === "pop") popBurst(); }
        if (!ds || ph === "away") capSt(now, S.wst === "walk" ? "w2" : S.wst === "out" && S.wot === 2 ? "back" : S.wst);
        var dy2 = 0;
        if (S.wj > 0) { S.wj -= dt; dy2 = S.wj > 0 ? -6 * Math.sin(Math.PI * (1 - S.wj / 0.5)) : 0; }
        g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + "," + dy2.toFixed(2) + ")");
        g.classList.toggle("bl", S.wst === "blow");
        g.classList.toggle("pp", S.wst === "pop");
        g.classList.toggle("bo", S.wst === "blow" && now - S.wbl > 1.8);
        g.classList.toggle("pz", S.wst === "sleep" || S.wst === "pose" || S.wst === "blow" || S.wst === "pop" || S.wst === "bdg" || S.wst === "bdb" || S.wst === "plog" || S.wst === "wipe" || S.wst === "drink" || S.wst === "hum");
        g.classList.toggle("hm", S.wst === "hum");
        g.classList.toggle("lg", S.wst === "plog");
        g.classList.toggle("wp", S.wst === "wipe");
        g.classList.toggle("dk", S.wst === "drink");
        if (S.wst === "out" && S.wot === 1) g.setAttribute("display", "none"); else g.removeAttribute("display");
        g.classList.toggle("slp", S.wst === "sleep");
        g.classList.toggle("dn", S.wst === "dn");
        g.classList.toggle("po", S.wst === "pose");
        var f = g.querySelector(".rmwf"), want = S.wd < 0;
        if (f && f.__fl !== want) {
          f.__fl = want;
          if (want) f.setAttribute("transform", "translate(26,0) scale(-1,1)"); else f.removeAttribute("transform");
        }
        var mr = o.querySelector("#rmmr");
        if (mr) {
          mr.setAttribute("transform", "translate(" + (S.wx + 3).toFixed(2) + ",0)");
          var mf = mr.querySelector(".rmmf"), mw = S.wd > 0;
          if (mf && mf.__fl !== mw) {
            mf.__fl = mw;
            if (mw) mf.setAttribute("transform", "translate(20,0) scale(-1,1)"); else mf.removeAttribute("transform");
          }
        }
      }
      if (ds && S.dz && ph !== "away") {
        var els = [], rf = [], fc = document.getElementById("rmcap"), kk = Math.min(1, dt * 4), d, tg;
        [].forEach.call(ds.querySelectorAll(".rmdd"), function (e) { els[+e.getAttribute("data-i")] = e; });
        [].forEach.call(o.querySelectorAll(".rmdr"), function (e) { rf[+e.getAttribute("data-i")] = e; });
        if (ph === "dance") {
          /* 偶爾一位成員慢慢走去水瓶（要解鎖水瓶）或毛巾（要解鎖毛巾），停幾秒再走回隊形 */
          if (!S.dzn) S.dzn = now + 10 + Math.random() * 10;
          if (!S.dzo && now >= S.dzn) {
            var dacts = [];
            if (S.st["p-chk"]) dacts.push({ a: "pwater", x: 96, y: 72, s: "去喝口水，馬上回來。" });
            if (S.st["p-fav"]) dacts.push({ a: "ptowel", x: 38, y: 72, s: "拿毛巾擦擦汗，再回去跳。" });
            if (dacts.length) {
              var da = dacts[Math.floor(Math.random() * dacts.length)], di = Math.floor(Math.random() * 7);
              S.dzo = { i: di, x: da.x, y: da.y, st: "go", until: 0, a: da.a, s: da.s };
              if (fc && now >= S.cph) { fc.innerHTML = "<b>" + esc(WN[di]) + "</b><br>" + esc(t(da.s)); S.capK = "dzo"; S.cph = now + 3.5; }
            } else S.dzn = now + 20;
          }
          if (!S.fnx) S.fnx = now + 2.5;
          if (now >= S.fnx) {
            if (S.fc + 1 >= FORM.length) {
              /* 四種隊形各跳過一輪：七個人一起往右邊走出畫面 */
              S.gp = ph = "leave"; S.dzo = null; S.dzn = 0; S.fc = 0; S.fnx = 0; S.capK = "gl";
              if (fc && now >= S.cph) fc.innerHTML = "<b>" + esc(t("七人隊形")) + "</b><br>" + esc(t("練習告一段落，大家先離開。"));
            } else {
              S.fc++;
              S.fi = (S.fi + 1) % FORM.length;
              S.fnx = now + 3.6;
              [0, 1, 2, 3, 4, 5, 6].sort(function (a, b) { return FORM[S.fi][a][1] - FORM[S.fi][b][1]; }).forEach(function (j) { if (els[j]) ds.appendChild(els[j]); });
            }
          }
          var fk = "f" + S.fi;
          if (ph === "dance" && fc && now >= S.cph && S.capK !== fk) {
            S.capK = fk;
            fc.innerHTML = "<b>" + esc(t("七人隊形")) + "</b><br>" + esc(t(CAPF[S.fi]));
          }
          for (i = 0; i < 7; i++) {
            d = S.dz[i]; tg = FORM[S.fi][i];
            var zo = S.dzo;
            if (zo && zo.i === i) {
              if (zo.st !== "stay") {
                if (zo.st === "go") tg = [zo.x, zo.y];
                var zdx = tg[0] - d.x, zdy = tg[1] - d.y, zd = Math.sqrt(zdx * zdx + zdy * zdy), zs = 22 * dt;
                if (zd <= zs) {
                  d.x = tg[0]; d.y = tg[1];
                  if (zo.st === "go") { zo.st = "stay"; zo.until = now + 3; popK(zo.a); }
                  else { S.dzo = null; S.dzn = now + 20 + Math.random() * 20; }
                } else { d.x += zdx / zd * zs; d.y += zdy / zd * zs; }
              } else if (now >= zo.until) zo.st = "back";
            } else {
              d.x += (tg[0] - d.x) * kk;
              d.y += (tg[1] - d.y) * kk;
            }
          }
        } else if (ph === "leave") {
          var gone = true;
          for (i = 0; i < 7; i++) {
            d = S.dz[i];
            d.x += 34 * dt;
            d.y += (76 - d.y) * kk;
            if (d.x < 162) gone = false;
          }
          if (gone) {
            S.gp = "away"; S.gpw = 0;
            S.wx = 6; S.wd = 1; S.wst = "walk"; S.wuntil = 0; S.wdn = 0; S.wwalk = 0; S.capK = "";
          }
        } else if (ph === "enter") {
          var here = true;
          for (i = 0; i < 7; i++) {
            d = S.dz[i]; tg = FORM[0][i];
            d.y = tg[1];
            if (d.x < tg[0]) { d.x = Math.min(tg[0], d.x + 36 * dt); if (d.x < tg[0]) here = false; }
          }
          if (here && (S.gh || S.wx >= 168)) {
            S.gh = false;
            S.gp = "dance"; S.fi = 0; S.fc = 0; S.fnx = now + 2.5; S.capK = "ge";
            [0, 1, 2, 3, 4, 5, 6].forEach(function (j) { if (els[j]) ds.appendChild(els[j]); });
          }
        }
        for (i = 0; i < 7; i++) {
          d = S.dz[i];
          if (els[i]) els[i].setAttribute("transform", "translate(" + d.x.toFixed(2) + "," + d.y.toFixed(2) + ")");
          if (rf[i]) { rf[i].setAttribute("x", (d.x + 2).toFixed(2)); rf[i].setAttribute("y", reflY(d.y)); }
        }
      }
    }

    /* 應援街區的動作迴圈（TICKS.street）：小人在人行道散步、經過已解鎖的物品會停下來；之後可以再加（廣告車開過、LED 螢幕跳動…） */
    /* 應援街區的小人停靠點：{k 物品代號, b 解鎖徽章, x 小人左邊界（小人寬 26，站在物品正前方）}，由左到右；只有解鎖的物品才會停 */
    var STSPOT = [{ k: "sexh", b: "t-展覽", x: 6 }, { k: "skm", b: "t-快閃店", x: 24 }, { k: "slb", b: "t-燈箱/看板", x: 34 }, { k: "scf", b: "t-咖啡廳", x: 52 }, { k: "sled", b: "t-LED電視牆", x: 66 }, { k: "sbus", b: "t-公車站牌", x: 91 }, { k: "scafe", b: "t-應援咖啡廳", x: 124 }];
    function tick3(now, dt) {
      var g = o.querySelector(".rmwx"), i, sp, px, qok, anyOn = false;
      if (!g) return;
      /* 從別的房間帶過來的動作（走向毛巾、出門…）在這裡沒有意義，直接回到散步 */
      if (S.wst !== "walk" && S.wst !== "sr") { S.wst = "walk"; S.wuntil = 0; S.wot = 0; S.wdep = 0; S.wd = S.wd || 1; }
      ITEMS3.forEach(function (it) { if (S.st[it.b]) anyOn = true; });
      px = S.wx; qok = now >= (S.wq || 0);
      if (S.wst === "walk") {
        S.wx += S.wd * SPD * dt;
        if (S.wx >= 128) { S.wx = 128; S.wd = -1; } else if (S.wx <= 6) { S.wx = 6; S.wd = 1; }
        /* 走過已解鎖物品的正前方，有機會停下來 3 秒，那個物品也會動一下 */
        if (qok && now >= (S.wsr || 0)) {
          for (i = 0; i < STSPOT.length; i++) {
            sp = STSPOT[i];
            if (S.st[sp.b] && ((px < sp.x && S.wx >= sp.x) || (px > sp.x && S.wx <= sp.x)) && Math.random() < 0.55) {
              S.wx = sp.x; S.wst = "sr"; S.wsk = sp.k; S.wuntil = now + 3.2; S.wsr = now + 10; popK(sp.k);
              break;
            }
          }
        }
      } else if (now >= S.wuntil) { S.wst = "walk"; S.wq = now + QMIN + Math.random() * QSPAN; }
      capSt(now, S.wst === "walk" ? (anyOn ? "w3" : "w3e") : "sr_" + S.wsk);
      g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + ",0)");
      g.classList.toggle("pz", S.wst === "sr");
      g.classList.toggle("po", S.wst === "sr" && S.wsk === "slb");
      g.classList.toggle("up", S.wst === "sr" && S.wsk === "sled");
      var f = g.querySelector(".rmwf"), want = S.wd < 0;
      if (f && f.__fl !== want) {
        f.__fl = want;
        if (want) f.setAttribute("transform", "translate(26,0) scale(-1,1)"); else f.removeAttribute("transform");
      }
    }
    /* 各房間專屬的動作迴圈（以房間 id 登記）。新房間要有自己的動作，就寫一個 tickX(now, dt) 加在這裡 */
    var TICKS = { prac: tick2, street: tick3 };

    function tick(ts) {
      if (!document.body.contains(o)) return;
      var awN = tourAway();
      if (S.awk === undefined) S.awk = awN;
      else if (S.awk !== awN) {
        S.awk = awN; S.capK = "";
        if (!awN) { S.wdep = 0; S.wst = "out"; S.wot = 2; S.wx = -30; S.wd = 1; S.wuntil = 1e12; }
        draw();
      }
      /* 白天／夜晚依當地日出日落自動切換（每 30 秒檢查一次）；這次開啟只要手動按過「切到夜晚／白天」就不再自動切 */
      if (!S.nman && ts / 1000 >= (S.nchk || 0)) {
        S.nchk = ts / 1000 + 30;
        var nn = isNight();
        if (nn !== S.night) { S.night = nn; S.lamp = nn; S.capK = ""; draw(); }
      }
      var dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000), now = ts / 1000, g = o.querySelector(".rmwx");
      lastTs = ts;
      /* 有自己動作迴圈的房間走 TICKS；沒登記的房間用預設迴圈（也就是第 1 間小窩的那一套）。鎖著的房間沒有小人，不跑任何迴圈 */
      if (!roomOpen(S.rm, S.st)) { raf = requestAnimationFrame(tick); return; }
      if (TICKS[ROOMS[S.rm].id]) { S.ngA = 0; TICKS[ROOMS[S.rm].id](now, dt); raf = requestAnimationFrame(tick); return; }
      if (seasonKind() === "ny" || seasonKind() === "vd" || seasonKind() === "mid" || isNye()) {
        if (!S.ngNext) S.ngNext = ngWait(now);
        if (!S.ngA && !S.ngW && S.wst === "walk" && now >= S.ngNext) ngStart(now);
      }
      if (S.ngW && S.wst === "out" && S.wot === 1) { S.ngW = 0; ngGo(now); } /* 單人已離場，七人才進場 */
      if (S.ngA && now >= S.ngA) S.ngA = 0;
      ngSync();
      /* 情人節七人送愛心的動線：in（走進來）→ hold（站好鞠躬 6 秒）→ out（往右走出去）→ 結束後單人回來 */
      if (S.ngA && S.ngP && S.ngx) {
        var nok = true, nk, nt, ngr = o.querySelector("#rmng"), nmm;
        if (S.ngP === "in") {
          for (nk = 0; nk < 7; nk++) { nt = 8 + nk * 21; if (S.ngx[nk] < nt) { S.ngx[nk] = Math.min(nt, S.ngx[nk] + 40 * dt); if (S.ngx[nk] < nt) nok = false; } }
          if (nok) { S.ngP = "hold"; S.ngT = now; }
        } else if (S.ngP === "hold") {
          if (now - S.ngT >= 6) S.ngP = "out";
        } else {
          for (nk = 0; nk < 7; nk++) { S.ngx[nk] += 40 * dt; if (S.ngx[nk] < 162) nok = false; }
          if (nok) {
            S.ngA = 0; S.ngP = ""; S.ngNext = ngAfter(now);
            /* 七人全部離場後，單人才從左邊走回來 */
            if (S.wdep && S.wst === "out") { S.wdep = 0; S.wot = 2; S.wx = -30; S.wd = 1; }
          }
        }
        if (ngr) {
          ngr.classList.toggle("wk", S.ngP !== "hold");
          [].forEach.call(ngr.querySelectorAll(".rmnm"), function (e) {
            nmm = +e.getAttribute("data-i");
            e.setAttribute("transform", "translate(" + S.ngx[nmm].toFixed(2) + "," + (73 + Math.abs(nmm - 3) * 1.5).toFixed(1) + ")");
          });
        }
      }
      /* 6/13 小窩 100%：七人走進來 → 排好慶祝（放三次紙花）→ 走出右邊 → 只剩單人 */
      var g7 = o.querySelector("#rmg7"), g7on = !!(g7 && S.g7 && S.g7 !== "done");
      if (g7) {
        var els7 = [].slice.call(g7.querySelectorAll(".rmd7")), fc7 = document.getElementById("rmcap"), i7, all7 = true;
        if (S.g7 === "in") {
          for (i7 = 0; i7 < 7; i7++) { if (S.g7x[i7] < G7X[i7]) { S.g7x[i7] = Math.min(G7X[i7], S.g7x[i7] + 40 * dt); if (S.g7x[i7] < G7X[i7]) all7 = false; } }
          if (all7) {
            S.g7 = "cheer"; S.g7t = now; S.g7b = 0; S.capK = "g7c";
            if (fc7 && now >= S.cph) fc7.innerHTML = bdName() && !isAnniv() ? "<b>" + esc(t("七個人一起幫 ")) + esc(bdName()) + esc(t(" 慶祝生日！")) + "</b>" : "<b>" + esc(t("七個人一起來慶祝了！出道紀念日快樂！")) + "</b>";
          }
        } else if (S.g7 === "cheer") {
          if (S.g7b < 3 && now - S.g7t >= S.g7b * 2.6) { S.g7b++; popBurst("rpb7"); }
          if (now - S.g7t > 8) { S.g7 = "out"; S.capK = "g7o"; if (fc7 && now >= S.cph) fc7.innerHTML = "<b>" + esc(t("派對告一段落，大家先離開。")) + "</b>"; }
        } else if (S.g7 === "out") {
          for (i7 = 0; i7 < 7; i7++) { S.g7x[i7] += 40 * dt; if (S.g7x[i7] < 162) all7 = false; }
          if (all7) { S.g7 = "done"; S.wx = 8; S.wd = 1; S.wst = "walk"; S.wuntil = 0; S.capK = ""; }
        }
        if (S.g7 !== "done") els7.forEach(function (e, k) { e.setAttribute("transform", "translate(" + S.g7x[k].toFixed(2) + ",70)"); });
        vis(g7, S.g7 !== "done");
        var w7 = o.querySelector("#rmwv7");
        if (w7) { if (S.g7 === "done") w7.removeAttribute("display"); fadeEl(w7, S.g7 === "done" ? 1 : 0); }
      }
      /* 跨年 00:00 小儀式（約 5.6 秒）：時鐘閃兩下、日曆翻成新的一年、三輪煙火「同時」爆開、字幕變「新年快樂」。真的跨過午夜才放（1/1 00:00–00:09 內第一次）；預覽 ?preview=nye 開啟 8 秒後放一次，之後每 45 秒一次。煙火要切到夜晚才看得到 */
      if (!S.nyr && ((nyeAfter() && !S.nyrDone) || (PV === "nye" && now >= (S.nyrNext || (S.nyrNext = now + 8))))) {
        S.nyrDone = 1; S.nyrNext = now + 45; S.nyr = { t: now, k: -1 }; S.fwb = null; S.fwn = now + 9;
        popK("clock");
        var nsv = o.querySelector("#rmsv"), nof = o.querySelector("#rmnyf");
        if (nof) nof.remove();
        if (nsv) nsv.insertAdjacentHTML("beforeend", '<g id="rmnyf" style="pointer-events:none">' + R(36, 2, 24, 24, "#ffd23f", 0.22) + R(41, 7, 14, 14, "#fff7c2", 0.8) + "</g>");
        if (!nyCalFlip) { nyCalFlip = true; var ncg = o.querySelector('.rmi[data-k="cal"]'); if (ncg) ncg.innerHTML = R(0, 0, 12, 14, "transparent") + calNyArt(); }
        var ncp = document.getElementById("rmcap");
        if (ncp) { ncp.innerHTML = "<b>" + esc(t("新年快樂！")) + "</b><br>" + esc(t("00:00，新的一年開始了。")); S.capK = ""; S.cph = now + 9; }
        if (S.wst === "walk") S.wj = 0.5;
      }
      if (S.nyr) {
        var nt = now - S.nyr.t, nfw = o.querySelector("#rmfw"), nfl = o.querySelector("#rmnyf");
        if (nfl) { nfl.style.opacity = (nt < 0.25 || (nt >= 0.4 && nt < 0.65)) ? "1" : "0"; if (nt > 0.8) nfl.remove(); }
        if (nfw && nt >= 0.4) {
          var nv = Math.floor((nt - 0.4) / 1.6), nf = Math.floor(((nt - 0.4) - nv * 1.6) / 0.18), nk = nv < 3 ? nv * 100 + Math.min(nf, 9) : -2;
          if (nk !== S.nyr.k) {
            S.nyr.k = nk;
            nfw.innerHTML = nv < 3 && nf <= 8 ? NYR[nv].map(function (b) { return fwHtml({ x: b[0], y: b[1], c: b[2] }, nf); }).join("") : "";
          }
        }
        if (nt > 5.6) { S.nyr = null; S.fwn = now + 3; var nfw2 = o.querySelector("#rmfw"); if (nfw2) nfw2.innerHTML = ""; }
      }
      /* 窗外煙火：小窩 100% 才有。每隔 5～12 秒放一發，每發約 1.4 秒 */
      var fw = o.querySelector("#rmfw");
      if (fw) {
        if (!S.fwn) S.fwn = now + 2.5 + Math.random() * 3;
        if (S.wst === "fwatch" && !S.fwb && !S.nyr && S.fwn > now + 1) S.fwn = now + 0.6;
        if (!S.fwb && now >= S.fwn) S.fwb = { t: now, x: 70 + Math.floor(Math.random() * 21), y: 15 + Math.floor(Math.random() * 10), c: Math.floor(Math.random() * 7), f: -1, h: seasonKind() === "vd" && Math.random() < 0.6 };
        if (S.fwb) {
          var ff = Math.floor((now - S.fwb.t) / 0.18);
          if (ff !== S.fwb.f) { S.fwb.f = ff; fw.innerHTML = fwHtml(S.fwb, ff); }
          if (ff >= 8) { S.fwb = null; S.fwn = now + (isNye() ? 2 + Math.random() * 3 : 5 + Math.random() * 7); fw.innerHTML = ""; }
        }
      }
      if (g && !g7on) {
        if (S.wst === "walk" && !S.wdep && tourLeaving()) { S.wst = "out"; S.wot = 0; S.wd = 1; S.wuntil = 1e12; S.wdep = 1; }
        var dy = 0;
        if (S.wst === "walk") {
          var px = S.wx, qok = now >= (S.wq || 0);
          /* 偶爾小跑步：每隔 8～20 秒跑 1.6～2.8 秒，速度 2.2 倍 */
          if (!S.wjn) S.wjn = now + 6 + Math.random() * 8;
          else if (now >= S.wjn) { S.wju = now + 1.6 + Math.random() * 1.2; S.wjn = S.wju + 8 + Math.random() * 12; }
          S.wx += S.wd * SPD * (now < S.wju ? 2.2 : 1) * dt;
          S.wwalk += dt;
          if (S.wx >= 112 && S.wd > 0) { S.wx = 112; S.wd = -1; if (isFest() && qok && now >= (S.wfc || 0) && Math.random() < 0.6) enter("pop", now);
            else if (tourKind() === "today" && qok && now >= (S.wfc || 0) && Math.random() < 0.5) { S.wst = "out"; S.wot = 0; S.wd = 1; S.wuntil = 1e12; S.wfc = now + 30; }
            /* 走到右端：看水晶球、七人壁貼 */
            if (S.wst === "walk" && qok && now >= (S.wif || 0)) {
              var rp = [];
              if (S.st["r-1"]) rp.push("peek");
              if (S.st["h-egg"]) rp.push("decal");
              if (rp.length && Math.random() < 0.5) { S.wif = now + 12; enter(rp[Math.floor(Math.random() * rp.length)], now); }
            } }
          else if (S.wx <= 8) {
            S.wx = 8;
            var lo = [];
            if (S.st["fp-1"]) lo.push("look");
            if (S.st["v-fav"]) lo.push("read");
            if (seasonKind() === "hw") lo.push("broom");
            var pk = lo.length && qok ? lo[Math.floor(Math.random() * lo.length)] : "";
            if (pk === "look") { S.wst = "look"; S.wuntil = now + 2.2; }
            else if (pk === "read") enter("read", now);
            else if (pk === "broom") enter("broom", now);
            else S.wd = 1;
          }
          /* 整點報時：整點過後，小人下次經過時鐘下方（x≈35）一定會停下來抬頭看時鐘，說現在幾點（不受安靜期限制） */
          var hr = new Date().getHours();
          if (S.wchime === undefined) S.wchime = hr;
          if (S.wst === "walk" && S.st["h-open"] && S.wchime !== hr && ((px < CLX && S.wx >= CLX) || (px > CLX && S.wx <= CLX))) { S.wx = CLX; S.wchime = hr; S.wchmN = 1; enter("clk", now); }
          /* 籤筒提醒：籤筒已解鎖、今天還沒抽籤時，經過籤筒下方有機會停下來搖籤筒提醒你；每次提醒後至少隔 90 秒（不受安靜期限制） */
          if (S.wst === "walk" && now >= (S.wtbn || 0) && S.st["f-s7"] && !drewToday() && ((px < CLX && S.wx >= CLX) || (px > CLX && S.wx <= CLX)) && Math.random() < 0.5) { S.wx = CLX; S.wtbn = now + 90; enter("tubeR", now); }
          if (S.wst === "walk" && now >= S.wcd && qok && ((px < CLX && S.wx >= CLX) || (px > CLX && S.wx <= CLX))) {
            var op = [];
            if (S.st["h-open"]) op.push("clk");
            if (S.st["h-last"]) op.push("cal");
            if (S.st["f-s7"]) op.push("tube");
            if (S.st["h-vow"]) op.push("cab");
            if (op.length && Math.random() < 0.6) { S.wx = CLX; enter(op[Math.floor(Math.random() * op.length)], now); }
          }
          if (S.wst === "walk" && seasonKind() === "hw" && S.wd > 0 && px < 104 && S.wx >= 104 && qok && now >= (S.wfc || 0) && Math.random() < 0.7) { S.wx = 104; S.wfc = now + 10; enter("candy", now); }
          if (S.wst === "walk" && isFest() && S.st["h-613"] && qok && now >= (S.wfc || 0) && ((px < 84 && S.wx >= 84) || (px > 84 && S.wx <= 84)) && Math.random() < 0.6) { S.wx = 84; enter("blow", now); }
          if (S.wst === "walk" && tourKind() === "eve" && qok && now >= (S.wfc || 0) && ((px < 92 && S.wx >= 92) || (px > 92 && S.wx <= 92)) && Math.random() < 0.6) { S.wx = 92; enter("pack", now); }
          /* 成員生日：經過禮物堆前（小窩 x≈46、練習室 x≈84）有機會停下來看一眼，禮物會跳一下 */
          var gX = 33;
          if (S.wst === "walk" && bdName() && qok && now >= (S.wgf || 0) && ((px < gX && S.wx >= gX) || (px > gX && S.wx <= gX)) && Math.random() < 0.5) { S.wx = gX; S.wgf = now + 15; enter("bdg", now); }
          var bX = 108;
          if (S.wst === "walk" && bdName() && qok && now >= (S.wbf || 0) && ((px < bX && S.wx >= bX) || (px > bX && S.wx <= bX)) && Math.random() < 0.4) { S.wx = bX; S.wbf = now + 15; enter("bdb", now); }
          /* 演唱會前一天／當天：經過海報前（小人中心對到海報 x≈72）有機會停下來抬頭看，看完繼續往原方向走 */
          if (S.wst === "walk" && tourKind() && !seasonKind() && S.st["f-1"] && qok && now >= (S.wpf || 0) && ((px < 59 && S.wx >= 59) || (px > 59 && S.wx <= 59)) && Math.random() < 0.5) { S.wx = 59; S.wpf = now + 15; enter("poster", now); }
          var sk2 = seasonKind();
          if (S.wst === "walk" && sk2 === "vd" && qok && now >= (S.wfc || 0) && ((px < 42 && S.wx >= 42) || (px > 42 && S.wx <= 42)) && Math.random() < 0.3) { S.wx = 42; S.wfc = now + 10; enter(vdChoc > 1 ? "choc" : vdChoc === 1 ? "chocL" : "chocE", now); }
          if (S.wst === "walk" && sk2 === "vd" && S.wd > 0 && px < 104 && S.wx >= 104 && qok && now >= (S.wfc || 0) && Math.random() < 0.6) { S.wx = 104; S.wfc = now + 10; var rv = Math.random(); enter(rv < 0.34 ? "rose" : rv < 0.67 ? "letter" : "write", now); }
          if (S.wst === "walk" && (sk2 === "xmas" || sk2 === "ny") && qok && now >= (S.wfc || 0)) {
            if (S.wd > 0 && px < 104 && S.wx >= 104 && Math.random() < 0.7) { S.wx = 104; S.wfc = now + 10; enter(sk2 === "ny" ? "hb" : (Math.random() < 0.5 ? "gift" : "sock"), now); }
            else if (((px < 48 && S.wx >= 48) || (px > 48 && S.wx <= 48)) && Math.random() < 0.2) { S.wx = 48; S.wfc = now + 10; enter(sk2 === "ny" ? "ingot" : "cookie", now); }
          }
          /* 聖誕節的半夜（23:00–04:00，預覽 ?preview=xmas 不限時間）：切到夜晚後，聖誕老人的雪橇每隔 45～90 秒從窗外飛過 */
          if (sk2 === "xmas" && S.night && !reduceM && o.querySelector("#rmsa") && (PV === "xmas" || new Date().getHours() >= 23 || new Date().getHours() < 4)) {
            if (!S.santa) S.santa = now + 4;
            if (now >= S.santa) {
              var sa = o.querySelector("#rmsa"); sa.classList.remove("go"); void sa.getBoundingClientRect(); sa.classList.add("go");
              S.santa = now + 45 + Math.random() * 45;
              var scp = document.getElementById("rmcap");
              if (scp && S.wst === "walk" && !S.ngA && !S.ngW && now >= S.cph) { scp.innerHTML = "<b>" + esc(t("聖誕老人")) + "</b><br>" + esc(t("窗外有雪橇飛過，是來送禮物的嗎？")); S.capK = ""; S.cph = now + 4; }
            }
          }
          /* 中秋節：走過月餅旁（x≈48）有機會停下來切月餅吃；夜晚經過窗戶前（x≈67）有機會停下來賞月 */
          if (S.wst === "walk" && sk2 === "mid" && qok && now >= (S.wfc || 0) && ((px < 48 && S.wx >= 48) || (px > 48 && S.wx <= 48)) && Math.random() < 0.3) { S.wx = 48; S.wfc = now + 10; enter("mcake", now); }
          if (S.wst === "walk" && sk2 === "mid" && S.night && qok && now >= (S.wwf || 0) && ((px < 67 && S.wx >= 67) || (px > 67 && S.wx <= 67)) && Math.random() < 0.7) { S.wx = 67; S.wwf = now + 12; enter("mwatch", now); }
          /* 跨年夜：右邊有零食桌，往右走到 x≈100 有機會停下來吃一口；夜晚經過窗戶前（x≈67）有機會停下來看煙火 */
          if (S.wst === "walk" && isNye() && !seasonKind() && S.wd > 0 && px < 100 && S.wx >= 100 && qok && now >= (S.wfc || 0) && Math.random() < 0.6) { S.wx = 100; S.wfc = now + 10; enter("snack", now); }
          if (S.wst === "walk" && isNye() && S.night && o.querySelector("#rmfw") && qok && now >= (S.wwf || 0) && ((px < 67 && S.wx >= 67) || (px > 67 && S.wx <= 67)) && Math.random() < 0.7) { S.wx = 67; S.wwf = now + 12; S.fwn = Math.min(S.fwn || now, now + 0.5); enter("fwatch", now); }
          /* 解鎖物品的互動：走過盆栽旁（x≈82）有機會停下來澆水；每次互動後 12 秒內不會再有下一次 */
          if (S.wst === "walk" && qok && now >= (S.wif || 0) && ((px < 82 && S.wx >= 82) || (px > 82 && S.wx <= 82))) {
            var ip = [];
            if (S.st["x-app"]) ip.push("water");
            if (ip.length && Math.random() < 0.5) { S.wx = 82; S.wif = now + 12; enter(ip[Math.floor(Math.random() * ip.length)], now); }
          }
          /* 檯燈：夜晚燈亮著時，走到燈下（x≈99）有機會停下來看書，或把燈關掉睡一覺、醒來再開燈 */
          if (S.wst === "walk" && S.night && S.lamp && S.st["f-s3"] && qok && now >= S.cph && now >= (S.wif || 0) && ((px < 99 && S.wx >= 99) || (px > 99 && S.wx <= 99)) && Math.random() < 0.6) { S.wx = 99; S.wif = now + 12; enter(Math.random() < 0.5 ? "lread" : "lamp", now); }
          var ctr = S.wx + 13, inRug = ctr >= 58 && ctr <= 106;
          if (inRug && !S.wrug && S.wj <= 0) S.wj = 0.5;
          S.wrug = inRug;
          if (!S.wslT) S.wslT = 30 + Math.random() * 25;
          if (S.wst === "walk" && S.night && qok && S.wwalk > S.wslT) { S.wst = "sleep"; S.wuntil = now + 5; S.wwalk = 0; S.wslT = 0; }
          /* 小人主動說話：安靜期過了、沒有其他互動、剛才沒點過東西時，停下來跳一下、頭上冒愛心，下方文字講一句（每 30～60 秒一次；第一次在開啟後約 10～18 秒） */
          if (!S.wsn) S.wsn = now + 10 + Math.random() * 8;
          /* 節日第一次開啟：小人先說一句應景的話（每個節日每年一次；預覽 ?preview=xmas 等每次開啟都會說） */
          if (!S.gdn) { S.gdn = 1; var fk0 = festKey(); if (fk0 && (PV || !festSeen(fk0))) { if (!PV) festMark(fk0); S.gpend = now + 1.2; } }
          if (S.gpend && S.wst === "walk" && !S.ngA && !S.ngW && !S.pop && now >= S.gpend) { S.gpend = 0; enter("greet", now); }
          if (S.wst === "walk" && !S.pop && now >= S.wsn && now >= S.cph && qok) enter("talk", now);
          /* 演唱會回來之後（22:00 起，預覽 ?preview=tourback）：小人偶爾停下來邊揮手燈邊哼歌 */
          if (S.wst === "walk" && tourBack() && qok && now >= (S.whm || 0)) { S.whm = now + 35 + Math.random() * 25; enter("hum", now); }
        } else {
          if (S.wst === "blow" && !S.wbj && now - S.wbl > 2.4) { S.wbj = 1; S.wj = 0.5; }
          if (S.wst === "pop" && !S.wbj && now - S.wbl > 1) { S.wbj = 1; S.wj = 0.5; popBurst(); }
          /* 演唱會當天：小人拿著手燈往右走出房間，過一會兒再從左邊回來 */
          if (S.wst === "out") {
            S.wd = 1;
            if (!S.wot) { S.wx += SPD * 1.3 * dt; if (S.wx >= 172) { S.wot = 1; S.wouti = now + 6; } }
            else if (S.wot === 1) { if (now >= S.wouti && !S.wdep) { S.wot = 2; S.wx = -30; } }
            else { S.wx += SPD * 1.3 * dt; if (S.wx >= 40) { S.wst = "walk"; S.wot = 0; S.wuntil = 0; S.wng = 0; S.wcd = now + 6; S.wq = now + QMIN + Math.random() * QSPAN;  if (S.wgiv) { S.wgiv = 0; enter("hbg", now); } else if (tourBack()) { S.whm = now + 40; enter("hum", now); } } }
          }
          if (S.wst === "tubeR" && !S.wtbj && now - S.wtbs > 1.6) { S.wtbj = 1; popK("tube"); }
          if (S.wst === "lamp") lampStep(now);
          if ((S.wst === "choc" || S.wst === "chocL") && S.wchc && now >= S.wchc) { S.wchc = 0; chocEat(); }
          if (S.wst === "mailgo") {
            var mdx = 124 - S.wx, mst = SPD * 1.4 * dt;
            if (Math.abs(mdx) <= mst) { S.wx = 124; S.wd = 1; enter("mail", now); } else { S.wd = mdx > 0 ? 1 : -1; S.wx += S.wd * mst; }
          }
          if (S.wst === "mail" && S.wmd && now >= S.wmd) {
            S.wmd = 0; vdMailUp = true; popFxK("vdmail");
            var mfl = o.querySelector(".rmml");
            if (mfl) mfl.classList.add("up");
          }
          if (S.wst === "write" && now >= S.wuntil) { S.wst = "mailgo"; S.wuntil = 1e12; }
          if (S.wst === "cal" && S.wtt && now >= S.wtt) {
            S.wtt = 0; S.wtr = now + 1.5; popK("cal");
            if (isNye() && !nyCalFlip) { nyCalFlip = true; var cg = o.querySelector('.rmi[data-k="cal"]'); if (cg) cg.innerHTML = R(0, 0, 12, 14, "transparent") + calNyArt(); }
          }
          if (now >= S.wuntil) {
            if (S.wst === "look" || S.wst === "read" || S.wst === "broom") S.wd = 1;
            if (S.wst === "pop") S.wd = -1;
            /* 打瞌睡不算互動：夜晚每走 8 秒就會睡一覺，如果睡醒也進安靜期，夜晚就永遠輪不到任何互動 */
            var wasSlp = S.wst === "sleep", wasMail = S.wst === "mail";
            S.wst = "walk";
            S.wtt = 0;
            S.wtr = 0;
            S.wcd = now + 6; if (!wasSlp) S.wq = now + QMIN + Math.random() * QSPAN;
            if (wasMail) { S.wd = -1; mailDone(); }
          }
        }
        if (S.wj > 0) {
          S.wj -= dt;
          dy = S.wj > 0 ? -6 * Math.sin(Math.PI * (1 - S.wj / 0.5)) : 0;
        } else if (S.wsc && S.wst === "scare") { S.wsc = 0; S.wj = 0.5; } /* 被嚇到：第一下跳完再跳第二下 */
        capSt(now, S.wst === "walk" ? (now < S.wju ? "run" : "walk") : (S.wst === "cal" && now < S.wtr) ? "tear" : S.wst === "out" && S.wot === 2 ? "back" : S.wst === "lamp" ? (S.wlK || "loff") : S.wst);
        g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + "," + dy.toFixed(2) + ")");
        g.classList.toggle("pz", S.wst !== "walk" && S.wst !== "out" && S.wst !== "mailgo");
        g.classList.toggle("wr", S.wst === "write" || (S.wst === "mail" && !!S.wmd));
        if (S.wst === "out" && S.wot === 1) g.setAttribute("display", "none"); else g.removeAttribute("display");
        g.classList.toggle("slp", S.wst === "sleep" || (S.wst === "lamp" && S.wlK === "lsl"));
        g.classList.toggle("rd", S.wst === "read" || S.wst === "lread");
        g.classList.toggle("cu", S.wst === "cal");
        g.classList.toggle("ck", S.wst === "clk");
        g.classList.toggle("tk", S.wst === "talk" || S.wst === "tubeR" || S.wst === "letter" || (S.wst === "mail" && !S.wmd));
        g.classList.toggle("up", !!UPS[S.wst] || (S.wst === "lamp" && (S.wlK === "loff" || S.wlK === "lon")));
        g.classList.toggle("lw", !!LWS[S.wst]);
        g.classList.toggle("tr", S.wst === "cal" && now < S.wtr);
        g.classList.toggle("bl", S.wst === "blow");
        g.classList.toggle("pp", S.wst === "pop" || S.wst === "pack");
        g.classList.toggle("bo", S.wst === "blow" && now - S.wbl > 1.8);
        g.classList.toggle("jg", S.wst === "walk" && now < S.wju);
        g.classList.toggle("hm", S.wst === "hum");
        g.classList.toggle("lit", !!(S.lamp && S.st["f-s3"] && S.wx + 13 >= 96));
        var f = g.querySelector(".rmwf"), want = S.wd < 0;
        if (f && f.__fl !== want) {
          f.__fl = want;
          if (want) f.setAttribute("transform", "translate(26,0) scale(-1,1)"); else f.removeAttribute("transform");
        }
      }
      raf = requestAnimationFrame(tick);
    }

    var close = function () {
      cancelAnimationFrame(raf);
      o.remove();
      document.removeEventListener("keydown", ky);
      document.body.style.overflow = prevOv;
      try { tag(getBs()); } catch (e) {}
      if (opener && opener.focus) opener.focus();
    };
    var ky = function (ev) {
      if (ev.key !== "Escape") return;
      if (S.pop) { S.pop = false; draw(); var xb = o.querySelector(".rmx"); if (xb) xb.focus(); } else close();
    };
    o.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === o || (t.closest && t.closest(".rmx"))) return close();
      if (t.classList && t.classList.contains("rmnx")) { S.pop = false; draw(); return; }
      var pab = t.closest && t.closest("[data-a]");
      if (pab) { if (pab.getAttribute("data-a") === "go") { S.rm = S.popIx + 1; resetW(); if (roomOpen(S.rm, S.st)) saveSeen(S.rm); } S.pop = false; draw(); return; }
      var rsb = t.closest && t.closest("[data-r]");
      if (rsb) { S.rm = +rsb.getAttribute("data-r"); resetW(); if (S.rm > 0 && roomOpen(S.rm, S.st)) saveSeen(S.rm); draw(); return; }
      var tb = t.closest && t.closest("[data-t]");
      if (tb) { S.tab = tb.getAttribute("data-t"); draw(); return; }
      var ft = t.closest && t.closest("[data-f]");
      if (ft) { S.flt = ft.getAttribute("data-f"); draw(); return; }
      if (t.closest && t.closest("#rmdn")) { S.nman = true; S.night = !S.night; S.lamp = S.night; draw(); return; }
      var dd = t.closest && t.closest(".rmdd");
      if (dd) { dzSay(+dd.getAttribute("data-i")); return; }
      var w = t.closest && t.closest(".rmwk");
      if (w) { walk(w); return; }
      var nm = t.closest && t.closest(".rmnm");
      if (nm) { ngSay(+nm.getAttribute("data-i")); return; }
      var fx = t.closest && t.closest(".rmfx");
      if (fx) { fxHit(fx); return; }
      var g = t.closest && t.closest(".rmi");
      if (g) hit(g);
    });
    o.addEventListener("keydown", function (ev) {
      /* 房間選擇器：左右方向鍵、Home、End 在按鈕之間移動焦點（按 Enter／空白才真的切換） */
      var rb = ev.target.closest && ev.target.closest(".rmrs button");
      if (rb && (ev.key === "ArrowLeft" || ev.key === "ArrowRight" || ev.key === "Home" || ev.key === "End")) {
        var bs = [].slice.call(o.querySelectorAll(".rmrs button")), ci = bs.indexOf(rb);
        var ni = ev.key === "Home" ? 0 : ev.key === "End" ? bs.length - 1 : (ci + (ev.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length;
        ev.preventDefault();
        bs[ni].focus();
        return;
      }
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var g = ev.target.closest && ev.target.closest(".rmi,.rmwk,.rmdd,.rmfx,.rmnm");
      if (g) { ev.preventDefault(); if (g.classList.contains("rmnm")) ngSay(+g.getAttribute("data-i")); else if (g.classList.contains("rmfx")) fxHit(g); else if (g.classList.contains("rmwk")) walk(g); else if (g.classList.contains("rmdd")) dzSay(+g.getAttribute("data-i")); else hit(g); }
    });
    document.addEventListener("keydown", ky);
    draw();
    if (!reduceM) raf = requestAnimationFrame(tick);
    o.querySelector(".rmx").focus();
  }

  /* ===== 掛到首頁 ===== */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#roomBtn");
    if (b && ROOM_OPEN) open();
  });
  setTimeout(function () { try { tag(getBs()); } catch (e) {} }, 1200);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) { try { tag(getBs()); } catch (e) {} } });

  /* 註冊到網站的翻譯機制。全部／關閉原本就有翻譯，不重複加，避免蓋掉其他地方的用法 */
  try {
    Object.keys(LT).forEach(function (k) {
      if (k === "全部" || k === "關閉") return;
      var v = LT[k];
      I18N.add(k, v[0], v[1], v[2]);
    });
    I18N.add("徽章、籤卡圖鑑和稱號都收在這裡，看看自己收集到哪了。", "Badges, fortune cards and titles are all here. See how far you've collected.", "배지, 운세 카드, 칭호가 모두 여기에 있어요. 수집 현황을 확인해 보세요.", "バッジ、おみくじカード、称号がここに集まっています。収集の進み具合を見てみましょう。");
    I18N.refresh();
  } catch (e) {}
})();
