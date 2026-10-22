/* 彩蛋小窩：像素房間。解鎖徽章／彩蛋，房間就會多一件物品。
   新增物品：在 ITEMS 加一筆 {k 代號, b 對應徽章代號, n 名稱, hid 是否隱藏, x,y,w,h 固定位置與大小, art 像素圖, an 點擊動畫, say 點擊台詞}
   只讀取 badgeSync() 的結果，不改任何徽章資料。唯一會存的東西是 localStorage: room-seen（已看過的物品代號，用來標「新獲得」的閃爍星星）；檯燈開關、晝夜切換只在這次開啟有效。 */
(function () {
  "use strict";
  if (window.__roomLoaded) return;
  window.__roomLoaded = true;
  /* 網址的 ?preview= 在載入當下就先記下來（網站之後如果改掉網址列，預覽也不會消失） */
  var PV = "";
  try { PV = window.__PV || new URLSearchParams(location.search).get("preview") || ""; } catch (e) {}

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
    "七個人，一張合照。": ["Seven of them, one photo.", "일곱 명, 한 장의 단체 사진.", "7人、1枚の集合写真。"],
    "6/13 的蛋糕，出道紀念日快樂！": ["A 6/13 cake — happy debut anniversary!", "6/13 케이크, 데뷔 기념일 축하해요!", "6/13のケーキ。デビュー記念日おめでとう！"],
    "水晶球裡好像看到了……下一場的歌單？": ["I think I see something in the crystal ball... the next setlist?", "수정구 안에 뭔가 보이는 것 같아요… 다음 공연 세트리스트?", "水晶玉に何か見える……次のセットリスト？"],
    "盆栽沙沙搖，歡迎常常回來。": ["The plant rustles — come back often!", "화분이 살랑살랑, 자주 놀러 오세요.", "鉢植えがさわさわ揺れてる。また来てね。"],
    "星星海報：今天的運勢，抽籤才知道。": ["Star poster: you'll only know today's fortune by drawing one.", "별 포스터: 오늘의 운세는 뽑아 봐야 알아요.", "星のポスター：今日の運勢は、引いてからのお楽しみ。"],
    "手燈亮起來了 💜": ["The light stick is glowing 💜", "응원봉이 환하게 켜졌어요 💜", "ペンライトが光ったよ 💜"],
    "有新物品！": ["New items!", "새 아이템이 있어요!", "新しいアイテムがあります！"],
    "閃爍的星星是新獲得的，點一下看看。": ["The blinking stars mark new items — tap to take a look.", "반짝이는 별은 새로 얻은 아이템이에요. 눌러서 확인해 보세요.", "点滅する星は新しく獲得したアイテム。タップしてみよう。"],
    "全部": ["All", "전체", "すべて"],
    "在小窩裡散步，再點一下換下一位。": ["Taking a stroll around the room — tap again for the next one.", "방 안을 산책 중이에요. 한 번 더 누르면 다음 멤버예요.", "お部屋を散歩中。もう一度タップすると次のメンバーに交代します。"],
    "本命一直都在小窩裡。": ["Your bias is always here in the room.", "최애는 언제나 방에 있어요.", "本命はいつもお部屋にいます。"],
    "散步的小人": ["Little walker", "산책하는 꼬마", "お散歩ミニキャラ"],
    "關閉": ["Close", "닫기", "閉じる"],
    "今天是 6/13，出道紀念日！": ["It's 6/13 — debut anniversary!", "오늘은 6/13, 데뷔 기념일!", "今日は6/13、デビュー記念日！"],
    "小窩也掛上彩旗了。": ["The room put up bunting too.", "방에도 깃발을 달았어요.", "お部屋にもガーランドを飾りました。"],
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
    "對著三腳架擺姿勢，看鏡頭！": ["Striking a pose for the tripod — look at the camera!", "삼각대 앞에서 포즈 중, 카메라를 봐요!", "三脚の前でポーズ。カメラを見て！"],
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
    "小窩也布置好聖誕裝飾了。": ["The room is decked out for Christmas too.", "방도 크리스마스 장식으로 꾸며졌어요.", "お部屋もクリスマスの飾りつけをしました。"],
    "練習室也布置好聖誕裝飾了。": ["The practice room is decked out for Christmas too.", "연습실도 크리스마스 장식으로 꾸며졌어요.", "練習室もクリスマスの飾りつけをしました。"],
    "新年快樂！": ["Happy New Year!", "새해 복 많이 받으세요!", "あけましておめでとう！"],
    "小窩也掛上新年彩旗了。": ["The room put up New Year bunting too.", "방에도 새해 깃발을 달았어요.", "お部屋にもお正月のガーランドを飾りました。"],
    "練習室也掛上新年彩旗了。": ["The practice room put up New Year bunting too.", "연습실에도 새해 깃발을 달았어요.", "練習室にもお正月のガーランドを飾りました。"]
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
  function clockSay() {
    var d = new Date(), L = lang(), M = d.getMonth() + 1, D = d.getDate(), W = d.getDay(), hm = p2(d.getHours()) + ":" + p2(d.getMinutes());
    if (L === "en") return "Today is " + ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][W] + ", " + M + "/" + D + ". It's " + hm + " now.";
    if (L === "ko") return "오늘은 " + M + "월 " + D + "일(" + "일월화수목금토".charAt(W) + ")이에요. 지금은 " + hm + "예요.";
    if (L === "ja") return "今日は" + M + "月" + D + "日（" + "日月火水木金土".charAt(W) + "）、今は" + hm + "です。";
    return "今天是 " + M + "/" + D + "（週" + "日一二三四五六".charAt(W) + "），現在 " + hm + "。";
  }
  /* 小人的動作 → 下方那行文字。每個動作有幾句，進入動作時隨機挑一句（第 1 句是「點一下換人」的提示，本命固定時不用） */
  var CAPS = {
    walk: ["在小窩裡散步，再點一下換下一位。", "慢慢晃來晃去，心情不錯。", "東看看西看看，巡視自己的小窩。"],
    run: ["突然想跑一下！", "小跑步中，小心別撞到家具。"],
    look: ["盯著球鞋看，好想出門走走。", "看著球鞋發呆，想起下一場應援。"],
    read: ["在書架前翻書，看得入迷。", "挑了一本書，安靜閱讀中。"],
    cal: ["在日曆前研究日子，數著還有幾天。"],
    tear: ["唰——撕掉一頁日曆。"],
    sleep: ["正在休息，zZ…", "打瞌睡中，夜深了。", "趴著睡著了，zzZ…"],
    w2: ["在練習室裡熱身走動。", "一邊走一邊默默數拍子。"],
    dn: ["跳舞中，節拍跟上！", "練舞練到停不下來。"],
    pose: ["對著三腳架擺姿勢，看鏡頭！"]
  };
  var CAPF = ["排成一排，整整齊齊。", "拉成弧形，中間的往前站。", "高低交錯，換成錯位隊形。", "排成斜線，一階一階往上。"];
  /* 彩蛋小窩開關：跟「藝人同款足跡」一樣的鎖法。
     ROOM_PUBLIC=false＝對一般使用者鎖起來（首頁入口灰色＋鎖頭＋「新功能／暫未開放」）；要正式開放就改成 true，並把 sw.js 的 VER 換一個值。
     自己預覽：用 ?preview=room 開一次，這台裝置就會解鎖（存在 localStorage: room-preview）；用 ?preview=off 關掉預覽 */
  var ROOM_PUBLIC = false;
  var ROOM_OPEN = ROOM_PUBLIC || (function () {
    try {
      var v = PV;
      if (v === "room" || v === "room2") localStorage.setItem("room-preview", "1");
      if (v === "room2") localStorage.setItem("room2-preview", "1");
      else if (v === "off") { localStorage.removeItem("room-preview"); localStorage.removeItem("room2-preview"); }
      if (v === "613" || v === "room2all" || v === "hw" || v === "xmas" || v === "ny" || v.indexOf("bd-") === 0) return true; /* 只預覽 6/13、成員生日：這次直接開放小窩，不用先 ?preview=room，也不存任何東西 */
      return localStorage.getItem("room-preview") === "1";
    } catch (e) { return false; }
  })();
  /* 練習室（第 2 間）開關。
     ROOM2_PUBLIC=false＝一般使用者看到的第 2 間還是上鎖畫面；要正式開放就改成 true（開放後仍要先完成第 1 間才進得去），並把 sw.js 的 VER 換一個值。
     自己預覽：用 ?preview=room2 開一次，這台裝置就能直接進練習室（存在 localStorage: room2-preview，也會一併解鎖小窩入口）；
     ?preview=room2all 只在這次開啟把練習室 13 件物品全部當成已解鎖（含七人隊形），不存任何東西；?preview=off 會把兩個預覽都關掉 */
  var ROOM2_PUBLIC = false;
  var P2ALL = PV === "room2all";
  var ROOM2_PV = P2ALL || PV === "room2" || (function () {
    try { return localStorage.getItem("room2-preview") === "1"; } catch (e) { return false; }
  })();
  function room2Open(st) { return ROOM2_PV || (ROOM2_PUBLIC && count(st, ITEMS) >= ITEMS.length); }

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
  function artTickets() {
    var s = R(0, 0, 22, 1, "#8b5a2b"), c = ["#ffd23f", "#ff8fb3", "#6fb7ff"];
    [1, 8, 15].forEach(function (x, i) {
      s += R(x + 2, 1, 1, 1, "#8b5a2b") + R(x, 2, 5, 10, c[i]) + R(x + 1, 4, 3, 1, "#fff") + R(x + 1, 6, 3, 1, "#fff", 0.7) + R(x, 8, 1, 1, "#00000022");
    });
    return s;
  }
  function artLamp() {
    return (
      '<g class="glow">' + R(-8, -4, 28, 26, "#ffe27a", 0.1) + R(-5, -2, 22, 20, "#ffe27a", 0.12) + R(-2, 0, 16, 15, "#ffe27a", 0.14) + "</g>" +
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
  /* 今天生日的成員（MEMBERS 是 app.js 的成員生日表）；預覽：網址加 ?preview=bd-Jimin */
  function bdName() {
    if (PV.indexOf("bd-") === 0 && WN.indexOf(PV.slice(3)) >= 0) return PV.slice(3);
    for (var i = 0; i < WN.length; i++) if (bdToday(WN[i])) return WN[i];
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
  /* 節日造型（跟首頁彩蛋、桌寵同一批日期）：10/31 萬聖節、12/24–25 聖誕、1/1 新年。
     預覽：網址加 ?preview=hw／xmas／ny。6/13 和成員生日的布置優先，節日不會疊上去 */
  function seasonKind() {
    if (isAnniv() || bdName()) return "";
    var d = new Date(), m = d.getMonth() + 1, dy = d.getDate();
    if (PV === "hw" || (m === 10 && dy === 31)) return "hw";
    if (PV === "xmas" || (m === 12 && (dy === 24 || dy === 25))) return "xmas";
    if (PV === "ny" || (m === 1 && dy === 1)) return "ny";
    return "";
  }
  /* pal＝彩旗顏色；hat＝帽子像素（10 格寬的小圖）；hy＝帽子最下面一排要貼在頭頂（y=0）所需的位移；tt／s1／s2＝下方文字 */
  var SEAS = {
    hw: { pal: ["#ff8a1f", "#7b4fd6", "#ff8a1f", "#2b2f3a"], hy: -5, tt: "今天是萬聖節！", s1: "小窩也掛上南瓜旗了。", s2: "練習室也掛上南瓜旗了。",
      hat: R(4, 0, 2, 1, "#7b4fd6") + R(3, 1, 4, 2, "#7b4fd6") + R(2, 3, 6, 1, "#ffd23f") + R(2, 4, 6, 1, "#7b4fd6") + R(0, 5, 10, 1, "#7b4fd6") },
    xmas: { pal: ["#e0453a", "#2dbf8f", "#ffffff", "#2dbf8f"], hy: -4, tt: "聖誕快樂！", s1: "小窩也布置好聖誕裝飾了。", s2: "練習室也布置好聖誕裝飾了。",
      hat: R(6, 0, 2, 1, "#fff") + R(3, 1, 4, 1, "#e0453a") + R(2, 2, 6, 2, "#e0453a") + R(1, 4, 8, 1, "#fff") },
    ny: { pal: ["#ffd23f", "#e0453a", "#ffd23f", "#ffffff"], hy: -5, tt: "新年快樂！", s1: "小窩也掛上新年彩旗了。", s2: "練習室也掛上新年彩旗了。",
      hat: R(1, 2, 2, 3, "#ffd23f") + R(4, 1, 2, 4, "#ffd23f") + R(7, 2, 2, 3, "#ffd23f") + R(1, 5, 8, 1, "#e0a800") + R(4, 3, 2, 1, "#e0453a") }
  };
  /* 節日帽：座標系跟派對帽一樣（以小人 26×26 的圖左上角為原點），傾斜角度也一樣 */
  function festHat(k) {
    var h = SEAS[k];
    return h ? '<g transform="rotate(-10 13 3)"><g transform="translate(8,' + h.hy + ')">' + h.hat + "</g></g>" : "";
  }
  /* 地板上的小擺飾（只是裝飾，不能點）：萬聖節南瓜、聖誕樹；新年只有彩旗和皇冠 */
  function festProp() {
    var k = seasonKind(), s = "";
    if (k === "hw") s = R(5, 0, 2, 2, "#2dbf8f") + R(2, 2, 8, 1, "#ff8a1f") + R(1, 3, 10, 6, "#ff8a1f") + R(2, 9, 8, 1, "#ff8a1f") + R(5, 3, 1, 6, "#d9610f") + R(3, 4, 2, 2, "#2b2f3a") + R(7, 4, 2, 2, "#2b2f3a") + R(4, 7, 4, 1, "#ffd23f");
    else if (k === "xmas") s = R(5, 0, 2, 1, "#ffd23f") + R(5, 1, 2, 1, "#2dbf8f") + R(4, 2, 4, 2, "#2dbf8f") + R(3, 4, 6, 2, "#2dbf8f") + R(2, 6, 8, 2, "#2dbf8f") + R(1, 8, 10, 2, "#2dbf8f") + R(5, 10, 2, 2, "#8b5a2b") + R(4, 5, 1, 1, "#e0453a") + R(7, 7, 1, 1, "#ffd23f") + R(3, 9, 1, 1, "#6fb7ff");
    return (s ? '<g transform="translate(30,78)" pointer-events="none">' + s + "</g>" : "") + (k === "hw" ? candyArt() + broomArt() : "");
  }
  /* 萬聖節：斜靠在書架旁的掃帚（棕色柄、紫色綁帶、黃色掃帚頭；只是裝飾，不能點） */
  function broomArt() {
    var s = "", i, j, x0;
    for (i = 0; i < 20; i++) s += R(10 - Math.floor(i * 0.35), 64 + i, 2, 1, "#2e1a0c");
    s += R(2, 83, 5, 1, "#7b4fd6");
    for (j = 0; j < 9; j++) {
      x0 = 2 - Math.floor(j * 0.3);
      s += R(x0, 84 + j, 5 + Math.floor(j * 0.4), 1, "#e0a800") + R(x0 + 2, 84 + j, 1, 1, "#b87333");
    }
    return '<g pointer-events="none">' + s + "</g>";
  }
  /* 萬聖節：地板上散落的糖果和一根棒棒糖（只是裝飾，不能點、不擋點擊） */
  function candyArt() {
    var cd = function (x, y, c, e) { return R(x + 1, y, 3, 2, c) + R(x, y, 1, 2, e) + R(x + 4, y, 1, 2, e); };
    return '<g pointer-events="none">' +
      cd(116, 86, "#ff8a1f", "#ffd9a8") + cd(125, 91, "#7b4fd6", "#cdb8ff") + cd(134, 85, "#ff8fb3", "#ffd6e4") + cd(143, 92, "#ff8a1f", "#ffd9a8") + cd(46, 94, "#7b4fd6", "#cdb8ff") +
      '<g transform="translate(120,76)">' + R(1, 0, 3, 5, "#ff8fb3") + R(0, 1, 5, 3, "#ff8fb3") + R(2, 1, 1, 3, "#fff") + R(1, 2, 3, 1, "#fff") + R(2, 5, 1, 5, "#e8e8e8") + "</g>" +
      "</g>";
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
    { k: "tickets", b: "h-w3", fb: "三日全勤", hid: 1, n: "票根串", x: 108, y: 24, w: 22, h: 12, an: "sway", say: "三天全勤的票根，一張都沒少。", art: artTickets() },
    { k: "moon", b: "h-nt", fb: "夜貓應援", hid: 1, n: "月亮貼紙", x: 136, y: 22, w: 12, h: 11, an: "bounce", say: "夜深了，小窩陪你一起熬夜。", art: artMoon() },
    { k: "lamp", b: "f-s3", fb: "連抽三天", n: "檯燈", x: 106, y: 36, w: 12, h: 16, an: "", say: "lamp", art: artLamp() },
    { k: "photo", b: "h-egg2", fb: "合照時間", hid: 1, n: "合照相框", x: 122, y: 42, w: 12, h: 10, an: "bounce", say: "七個人，一張合照。", art: artPhoto() },
    { k: "cake", b: "h-613", fb: "出道紀念日", hid: 1, n: "小蛋糕", x: 138, y: 43, w: 9, h: 9, an: "bounce", say: "6/13 的蛋糕，出道紀念日快樂！",
      art: R(3, 0, 1, 2, "#ffd23f") + R(1, 2, 7, 2, "#fff") + R(0, 4, 9, 4, "#ff8fb3") + R(0, 6, 9, 1, "#e0457b") + R(0, 8, 9, 1, "#9aa3c7") },
    { k: "ball", b: "r-1", fb: "初次預測", n: "水晶球", x: 148, y: 42, w: 10, h: 10, an: "glow", say: "水晶球裡好像看到了……下一場的歌單？",
      art: R(2, 0, 6, 1, "#b794ff") + R(1, 1, 8, 6, "#b794ff") + R(0, 2, 10, 4, "#b794ff") + R(2, 2, 2, 2, "#fff") + R(1, 8, 8, 2, "#7b4fd6") + R(2, 7, 6, 1, "#7b4fd6") },
    { k: "plant", b: "x-app", fb: "常駐站民", n: "盆栽", x: 92, y: 32, w: 10, h: 14, an: "sway", say: "盆栽沙沙搖，歡迎常常回來。",
      art: R(4, 2, 2, 7, "#2dbf8f") + R(2, 4, 3, 3, "#2dbf8f") + R(5, 3, 3, 3, "#2dbf8f") + R(3, 1, 2, 2, "#2dbf8f") + R(2, 9, 6, 5, "#d9482f") + R(1, 9, 8, 1, "#b8381f") },
    { k: "poster", b: "f-1", fb: "初次抽籤", n: "星星海報", x: 64, y: 50, w: 16, h: 14, an: "shake", say: "星星海報：今天的運勢，抽籤才知道。",
      art: R(0, 0, 16, 14, "#7b4fd6") + R(1, 1, 14, 12, "#9d7be8") + R(7, 3, 2, 2, "#ffd23f") + R(4, 5, 8, 2, "#ffd23f") + R(5, 7, 6, 2, "#ffd23f") + R(4, 9, 3, 2, "#ffd23f") + R(9, 9, 3, 2, "#ffd23f") },
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
    { k: "pphone", b: "p-luck", fb: "排進行程", n: "手機架", x: 104, y: 76, w: 8, h: 12, an: "bounce", say: "今天的運勢，順便排進練習表。", art: artPphone() },
    { k: "pclock", b: "p-late", fb: "練到深夜", hid: 1, n: "掛鐘", x: 68, y: 5, w: 12, h: 12, an: "shake", say: "還沒走嗎？再一遍就好。", art: artPclock() },
    { k: "pwin", b: "p-dawn", fb: "練到天亮", hid: 1, n: "日出窗", x: 138, y: 8, w: 20, h: 20, an: "bounce", say: "不知不覺，天亮了。", art: artPwin() },
    { k: "prack", b: "p-seven", fb: "七件同款", hid: 1, n: "練習服掛架", x: 1, y: 8, w: 21, h: 12, an: "sway", say: "七件，一件不少。", art: artPrack() },
    { k: "plog", b: "p-week", fb: "每日練習", hid: 1, n: "練習日誌", x: 122, y: 72, w: 12, h: 7, an: "hop", say: "今天也有好好練習。", art: artPlog() },
    { k: "psched", b: "m10", fb: "應援高手", n: "練習課表", x: 30, y: 3, w: 22, h: 14, an: "shake", say: "這週的課表排得滿滿的，照表操課。", art: artPsched() }
  ];
  var ALL = ITEMS.concat(ITEMS2);

  /* ===== 窗外煙火（只有小窩 100% 才有）：一格一格的像素，共 8 影格——前 3 格火箭上升，後 5 格爆開、變淡 ===== */
  function fwHtml(b, f) {
    var s = "", c1 = MC[b.c], c2 = MC[(b.c + 3) % 7];
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
    s += R(64, 38, 32, 4, night ? "#3a4a7a" : "#f0d9a0") + R(66, 34, 1, 4, "#2dbf8f") + R(67, 33, 1, 3, "#2dbf8f") + R(92, 35, 1, 3, "#2dbf8f");
    if (full) {
      /* 煙火層：夾在天空和人影之間，用 clipPath 切在窗框內，內容由 tick 每幀換 */
      s += '<clipPath id="rmwc"><rect x="64" y="10" width="32" height="28"/></clipPath><g id="rmfw" clip-path="url(#rmwc)"></g>';
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
    return '<g class="rpg"><g transform="translate(' + (42 - CLX) + ",-42)\">" + R(0, 0, 12, 12, "#fff") + R(0, 0, 12, 4, "#e0457b") + R(2, 6, 8, 1, "#9aa3c7") + R(2, 8, 8, 1, "#9aa3c7") + R(2, 10, 3, 1, "#e0457b") + "</g></g>";
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
  var PROPS = bkArt() + pgArt() + litArt();

  function walker(S) {
    var label = WN[S.mem] + (lang() === "zh" ? "，" : ", ") + t("散步的小人");
    var hat = isAnniv() || bdName() === WN[S.mem]
      ? '<g transform="rotate(-10 13 3)">' + R(12, -6, 2, 2, "#ffd23f") + R(11, -4, 4, 2, "#ff8fb3") + R(10, -2, 6, 2, "#fff") + R(9, 0, 8, 1, "#6fb7ff") + "</g>" : festHat(seasonKind());
    var zz = '<g class="rmzz"><text class="rz" x="23" y="3" font-size="5">Z</text><text class="rz" x="26" y="-1" font-size="6">Z</text><text class="rz" x="29" y="-5" font-size="7">Z</text></g>';
    var st = S.wst === "dn" ? " dn" : S.wst === "pose" ? " po pz" : S.wst === "sleep" ? " slp pz" : S.wst === "look" ? " pz" : S.wst === "read" ? " rd pz" : S.wst === "cal" ? " cu pz" : S.wst === "clk" ? " ck pz" : "";
    return '<g transform="translate(0,66)"><g class="rmwx' + st + '" transform="translate(' + S.wx.toFixed(2) + ',0)"><g class="rmwf"' + (S.wd < 0 ? ' transform="translate(26,0) scale(-1,1)"' : "") + '><g class="rmwk" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
      R(0, 0, 26, 26, "transparent") + '<g class="rmwb"><image class="rmwa" href="' + esc(avUrl(WN[S.mem])) + '" x="0" y="0" width="26" height="26" preserveAspectRatio="xMidYMax meet"/>' + hat + "</g></g>" + DUST + "</g>" + zz + PROPS + '<g class="rmck">' + (S.wst === "clk" ? tmBub() : "") + "</g></g></g>";
  }

  function scene(S, full) {
    var P = S.night ? PN : PD, i, s = '<svg id="rmsv"' + (S.lamp && S.st["f-s3"] ? ' class="lon"' : "") + ' viewBox="0 0 160 100" shape-rendering="crispEdges" role="group" aria-label="我的 ARMY 小窩">';
    s += R(0, 0, 160, 66, P.wall);
    for (i = 1; i < 10; i++) s += R(i * 16, 0, 1, 66, P.wl, 0.6);
    s += R(0, 66, 160, 34, P.fl);
    for (i = 0; i < 5; i++) s += R(0, 70 + i * 7, 160, 1, P.fll);
    s += R(0, 64, 160, 3, P.bs);
    var bn = bdName();
    if (isAnniv() || bn) s += buntArt(isAnniv() ? "" : bn);
    else if (seasonKind()) s += buntArt("", SEAS[seasonKind()].pal);
    s += win(S.night, full);
    s += R(102, 52, 56, 3, "#8b5a2b") + R(104, 55, 52, 2, "#a8743f") + R(104, 57, 3, 9, "#8b5a2b") + R(153, 57, 3, 9, "#8b5a2b");
    if (S.st["f-s3"]) {
      s += '<g class="rmlt">';
      for (var y = 44; y < 92; y += 2) s += R(112 - (6 + Math.floor((y - 44) / 2)), y, 2 * (6 + Math.floor((y - 44) / 2)), 2, "#ffe27a", y >= 80 ? 0.2 : 0.1);
      s += "</g>";
    }
    ITEMS.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk") + (it.k === "lamp" ? " rmlamp" + (on && S.lamp ? " on" : "") : "");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + it.art + (it.k === "cake" && on && (isAnniv() || bn) ? FLAME : "") + "</g>" + (S.nw && S.nw[it.b] ? newMark(it) : "") + "</g>";
    });
    return s + festProp() + walker(S) + (isAnniv() || bn ? confArt() : "") + "</svg>";
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
    if (!S.dz) S.dz = FORM[S.fi].map(function (p) { return { x: p[0], y: p[1] }; });
  }
  /* 成員生日當天：白板外框換成那位成員的顏色，再灑幾個彩點 */
  function bdBoardArt(n) {
    var c = MC[WN.indexOf(n) % 7];
    return R(0, 0, 20, 1, c) + R(0, 13, 20, 1, c) + R(0, 0, 1, 14, c) + R(19, 0, 1, 14, c) + R(3, 10, 1, 1, "#ffd23f") + R(8, 11, 1, 1, "#ff8fb3") + R(16, 10, 1, 1, "#6fb7ff");
  }
  /* 6/13 當天：牆邊多一支彩帶砲（只是裝飾，不能點） */
  function popperArt() {
    return '<g transform="translate(10,80)">' + R(1, 4, 5, 5, "#ff8fb3") + R(0, 7, 7, 2, "#e0457b") + R(3, 1, 1, 1, MC[2]) + R(5, 0, 1, 1, MC[4]) + R(6, 2, 1, 1, MC[1]) + R(2, 2, 1, 1, MC[3]) + R(4, 3, 1, 1, MC[5]) + "</g>";
  }
  function mirrorRefl(S, full) {
    var s = '<g clip-path="url(#rmcp)">';
    if (full) {
      s += '<g opacity=".4">';
      S.dz.forEach(function (d, i) {
        s += '<image class="rmdr" data-i="' + i + '" href="' + esc(avUrl(WN[i])) + '" x="' + (d.x + 2).toFixed(2) + '" y="' + reflY(d.y) + '" width="14" height="14" preserveAspectRatio="xMidYMax meet"/>';
      });
      s += "</g>";
    } else {
      s += '<g id="rmmr" opacity=".4" transform="translate(' + (S.wx + 3).toFixed(2) + ',0)"><g class="rmmf"' + (S.wd > 0 ? ' transform="translate(20,0) scale(-1,1)"' : "") + '><image class="rmmra" href="' + esc(avUrl(WN[S.mem])) + '" x="0" y="38" width="20" height="20" preserveAspectRatio="xMidYMax meet"/></g></g>';
    }
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
    var P = S.night ? PN2 : PD2, i, r, x, bn = bdName(), fest = isAnniv() || bn;
    S.wx = Math.max(6, Math.min(108, S.wx));
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
    else if (seasonKind()) s += buntArt("", SEAS[seasonKind()].pal);
    /* 鏡牆：銀框、鏡面、兩道斜斜的反光 */
    s += R(24, 18, 90, 44, "#aab2c8") + R(26, 20, 86, 40, P.mir);
    for (i = 0; i < 40; i += 2) s += R(72 - i, 20 + i, 3, 2, P.mirl, 0.5) + R(92 - i, 20 + i, 2, 2, P.mirl, 0.35);
    s += mirrorRefl(S, full);
    /* 把杆（在鏡子前面） */
    s += R(24, 48, 90, 2, "#b07a45") + R(24, 50, 90, 1, "#8b5a2b") + R(30, 51, 2, 11, "#8b5a2b") + R(104, 51, 2, 11, "#8b5a2b");
    ITEMS2.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + it.art + (it.k === "pboard" && on && bn ? bdBoardArt(bn) : "") + "</g>" + (S.nw && S.nw[it.b] ? newMark(it) : "") + "</g>";
    });
    if (isAnniv()) s += popperArt();
    s += festProp();
    s += full ? dancers(S) : walker(S);
    return s + (fest ? confArt() : "") + "</svg>";
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
  function isNight() { var h = new Date().getHours(); return h < 6 || h >= 18; }

  /* ===== 首頁卡片的完成度標籤 ===== */
  function tag(r) {
    try {
      var b = document.getElementById("roomBtn");
      if (!ROOM_OPEN || !b || !r || !r.st) return;
      var et = b.querySelector(".et"), t = et && et.querySelector(".ftbd");
      if (!et) return;
      if (!t) { t = document.createElement("em"); et.appendChild(t); }
      var n = count(r.st), pct = Math.round((n / ITEMS.length) * 100);
      t.className = "ftbd rmpb " + (pct >= 100 ? "done" : "todo");
      var hh = (pct >= 100 ? "<span>✓</span> " : "") + "<span>小窩完成度</span> <span>" + pct + '%</span><i class="rmpx" aria-hidden="true"><s style="width:' + pct + '%"></s></i>';
      if (t.__h !== hh) { t.__h = hh; t.innerHTML = hh; }
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
    ".ftbd.rmpb,.ftbd.rmpb.done{display:block;width:min(240px,100%);box-sizing:border-box;padding:0;border:0;background:none}.rmpx{display:block;position:relative;height:14px;margin-top:4px;border:3px solid var(--dark);background:var(--box);overflow:hidden}.rmpx s{display:block;height:100%;background:var(--gold);text-decoration:none;transition:width .4s steps(8)}.rmpx::after,.rmbar .rmp::after{content:\"\";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 10px,var(--card) 10px 12px)}.ftbd.done .rmpx s{background:var(--ok)}" +
    ".rmbar .rmp{position:relative;overflow:hidden;height:14px;border:3px solid var(--dark)}.rmbar .rmp s{background:var(--gold)}" +
    "@media(prefers-reduced-motion:reduce){.rmpx s{transition:none}}" +
    ".rnw{pointer-events:none;animation:rmblink 1s steps(1) infinite}.rmnw{font-style:normal;font-size:10px;font-weight:800;padding:1px 4px;background:var(--gold);color:var(--dark)}" +
    "@media(prefers-reduced-motion:reduce){.rnw{animation:none}}" +
    ".rmwk{cursor:pointer}.rmwk:focus,.rmwk:focus-visible{outline:none}" +
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
    ".rmlt{display:none;pointer-events:none}.lon .rmlt{display:block}" +
    ".lit .rmwb{filter:brightness(1.2) sepia(.25)}.rmlit,.rdu{display:none;pointer-events:none}.lit .rmlit,.jg .rdu{display:block}" +
    ".rsp{animation:rmsp 1.2s steps(1) infinite}.rsp.d1{animation-delay:.4s}.rsp.d2{animation-delay:.8s}@keyframes rmsp{0%{opacity:1}50%{opacity:0}}" +
    ".jg .rmwb{animation-duration:.25s}" +
    ".rdp{animation:rmdu .45s steps(3) infinite}.rdp.d1{animation-delay:.15s}.rdp.d2{animation-delay:.3s}@keyframes rmdu{0%{opacity:1;transform:translate(0,0)}100%{opacity:0;transform:translate(-4px,-3px)}}" +
    ".rcfs{pointer-events:none}.rcf{animation:rmcf 6s steps(6) infinite}@keyframes rmcf{0%{transform:translate(0,-4px)}25%{transform:translate(2px,22px)}50%{transform:translate(-1px,48px)}75%{transform:translate(2px,74px)}100%{transform:translate(0,100px)}}" +
    ".rflA{opacity:1;animation:rmpa .6s steps(1) infinite}.rflB{opacity:0;animation:rmpb .6s steps(1) infinite}" +
    ".a-eq .rsb{animation:rseq .45s steps(3) 3}.rsb{transform-box:fill-box;transform-origin:50% 100%}@keyframes rseq{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}" +
    ".rfl{opacity:0;pointer-events:none}.a-flash .rfl{animation:rflash .5s steps(2)}@keyframes rflash{0%,100%{opacity:0}30%,60%{opacity:1}}" +
    ".dn .rmwb{transform-box:fill-box;transform-origin:50% 100%;animation:rmdn .4s steps(1) infinite}@keyframes rmdn{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-3px) rotate(5deg)}}" +
    ".po .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(7deg)}" +
    ".rmdd{cursor:pointer}.rmdd:focus,.rmdd:focus-visible{outline:none}.rmdb{animation:rmbob .5s steps(1) infinite}" +
    ".rmrs{display:flex;gap:6px;margin-bottom:8px}.rmrs button{display:inline-flex;align-items:center;gap:4px;font:inherit;font-size:12px;font-weight:800;padding:4px 10px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmrs button[aria-pressed=true]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}.rmrs button.nx:not([aria-pressed=true]){border-color:var(--gold)}.rmrs button:focus-visible,.rmna button:focus-visible{outline:3px solid var(--focus);outline-offset:2px}" +
    ".rmnx{position:absolute;inset:0;z-index:2;display:grid;place-items:center;padding:16px;background:rgba(6,24,58,.6)}.rmnc{width:100%;max-width:340px;background:var(--card);color:var(--ink);border:3px solid var(--dark);box-shadow:6px 6px 0 var(--line);padding:16px;text-align:center}.rmnc svg{width:64px;height:64px;margin-bottom:6px}.rmnc b{display:block;font-size:17px;color:var(--dark);margin-bottom:6px}.rmnc p{margin:0 0 12px;font-size:13px;line-height:1.5}.rmna{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}.rmna button{font:inherit;font-size:13px;font-weight:800;padding:6px 12px;border:2px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}.rmna button[data-a=go]{background:var(--dark);border-color:var(--dark);color:var(--darkInk)}" +
    "@media(prefers-reduced-motion:reduce){.rbA,.rbB,.rbm,.rcl,.tr .rpg,.rsp,.rdp,.rflA,.rflB{animation:none}.rbB,.rflB{opacity:0}.rbm{opacity:1}.rcfs{display:none}}" +
    "@media(prefers-reduced-motion:reduce){.a-eq .rsb,.a-flash .rfl,.dn .rmwb,.rmdb{animation:none}}";
  document.head.appendChild(css);

  /* ===== 多房間：S.rm 0＝第一間（彩蛋小窩），1＝第二間（尚未推出，先顯示上鎖畫面）。
     第 2 間（練習室）開放後，room2Open() 為 true 就顯示真場景，否則還是 lockedRoom() 的上鎖畫面 ===== */
  var LOCK_SVG = '<svg viewBox="0 0 10 10" shape-rendering="crispEdges" width="10" height="10" aria-hidden="true" fill="currentColor"><rect x="3" y="0" width="4" height="1"/><rect x="2" y="1" width="1" height="3"/><rect x="7" y="1" width="1" height="3"/><rect x="1" y="4" width="8" height="5"/></svg>';
  function chips(S, full, open2) {
    return '<div class="rmrs" role="group"><button type="button" data-r="0" aria-pressed="' + (S.rm === 0) + '"><span>第 1 間</span></button>' +
      '<button type="button" data-r="1" class="' + (full ? "nx" : "") + '" aria-pressed="' + (S.rm === 1) + '"><span>第 2 間</span>' + (open2 ? "" : LOCK_SVG) + "</button></div>";
  }
  function lockedRoom(full, n) {
    var G = "#2e3452", K = "#aab2c8";
    var sv = '<svg id="rmsv" viewBox="0 0 160 100" shape-rendering="crispEdges" role="img" aria-label="？？？">' +
      R(0, 0, 160, 66, "#3a4163") + R(0, 66, 160, 34, "#4b5273") + R(0, 64, 160, 3, "#59618a") +
      R(6, 16, 30, 50, G) + R(124, 10, 28, 28, G) + R(54, 76, 56, 16, G) + R(102, 52, 56, 3, G) +
      R(72, 30, 16, 4, K) + R(72, 34, 4, 12, K) + R(84, 34, 4, 12, K) +
      R(66, 46, 28, 22, K) + R(66, 46, 28, 2, "#c9cfe0") + R(78, 54, 4, 5, "#3a4163") + R(79, 59, 2, 5, "#3a4163") + "</svg>";
    return sv + '<div class="rmcap" aria-live="polite"><b>新房間即將推出</b><br>' +
      (full ? "第一個房間已完成，新房間準備中。" : "<span>完成第一個房間後解鎖。</span> <small><span>" + n + " / " + ITEMS.length + "</span> <span>件</span></small>") + "</div>";
  }
  function nextPop(open2) {
    var door = R(3, 0, 10, 16, "#8b5a2b") + R(4, 1, 8, 14, "#c99a6b") + R(5, 2, 6, 6, "#b07a45") + R(5, 9, 6, 5, "#b07a45") + R(10, 8, 1, 2, "#ffd23f") + R(0, 2, 1, 1, "#ffd23f") + R(14, 5, 1, 1, "#ffd23f") + R(1, 12, 1, 1, "#fff") + R(14, 13, 1, 1, "#ffd23f");
    return '<div class="rmnx"><div class="rmnc" role="alertdialog" aria-modal="true" aria-labelledby="rmnt"><svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">' + door + "</svg>" +
      '<b id="rmnt">第一個房間完成了！</b><p>' + (open2 ? "練習室開放了，快去看看。" : "下一個房間即將推出，敬請期待。") + '</p>' +
      '<div class="rmna"><button type="button" data-a="go">看看下一個房間</button><button type="button" data-a="cl">晚點再說</button></div></div></div>';
  }

  /* ===== 開啟專區 ===== */
  var opener = null;
  function open() {
    if (document.getElementById("rmo")) return;
    opener = document.activeElement;
    var bs = getBs(), L = bs.L, st = bs.st;
    /* ?preview=room2all：只在這次開啟，把練習室的物品全部當成已獲得（複製一份，不動 badgeSync 的資料） */
    if (P2ALL) { st = Object.assign({}, st); var pd = new Date().toISOString().slice(0, 10); ITEMS2.forEach(function (it) { if (!st[it.b]) st[it.b] = pd; }); }
    var S = { night: isNight(), lamp: isNight(), st: st, tab: "room", flt: "all", mem: Math.floor(Math.random() * WN.length), bias: false,
      wx: (window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) ? 66 : 20 + Math.floor(Math.random() * 80), wd: 1, wst: "walk", wuntil: 0, wj: 0, wrug: false, wwalk: 0, wcd: 0, wtr: 0, wtt: 0, wjn: 0, wju: 0, fwn: 0, fwb: null, rm: (PV.indexOf("room2") === 0 ? 1 : 0), pop: false, fi: 0, fnx: 0, dz: null, wdn: 0, capK: "", cph: 0 };
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
    var seenOld = null, have1 = [], have2 = [];
    ITEMS.forEach(function (it) { if (st[it.b]) have1.push(it.b); });
    ITEMS2.forEach(function (it) { if (st[it.b]) have2.push(it.b); });
    function saveSeen(v2) {
      if (P2ALL) return;
      try {
        var keep = have1.slice();
        have2.forEach(function (b) { if (v2 || (seenOld && seenOld.indexOf(b) >= 0)) keep.push(b); });
        localStorage.setItem("room-seen", JSON.stringify(keep));
        seenOld = keep;
      } catch (e) {}
    }
    if (!P2ALL) {
      try {
        var raw = localStorage.getItem("room-seen"), sn = raw ? JSON.parse(raw) : null;
        if (sn && typeof sn.indexOf === "function") seenOld = sn;
      } catch (e) {}
      if (seenOld) have1.forEach(function (b) { if (seenOld.indexOf(b) < 0) S.nw[b] = 1; });
      if (room2Open(st)) have2.forEach(function (b) { if (!seenOld || seenOld.indexOf(b) < 0) S.nw[b] = 1; });
      saveSeen(S.rm === 1 && room2Open(st));
    }
    /* 第一間全部解鎖：打開小窩時跳出「前往下一個房間」視窗。不存任何東西，所以每次載入網頁只跳一次 */
    if (count(st) >= ITEMS.length && !window.__roomNextSeen) { S.pop = true; window.__roomNextSeen = 1; }
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
          : "<b>" + esc(it.n) + "</b> <small>尚未解鎖</small><br>" + (bd ? esc(bd.desc) : "<span>解鎖徽章：</span><span>" + esc(it.fb) + "</span>");
      }
      var say = it.say === "lamp" ? (S.lamp ? "檯燈亮了。" : "檯燈關了。") : (it.k === "tube" && drewToday() ? "今天已經抽過籤了，明天再來搖一搖。" : it.say);
      var tail = it.say === "clock" ? esc(clockSay()) : esc(say);
      return "<b>" + esc(it.n) + "</b> <small><span>來自徽章：</span><span>" + esc(bd ? bd.name : it.fb) + "</span> <span>·</span> <span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span></small><br>" + tail;
    }

    /* 換房間或換分頁時，把小人的動作重設成「散步」，避免帶著第 1 間的「看書、看日曆」狀態進到第 2 間 */
    function resetW() {
      S.wst = "walk"; S.wuntil = 0; S.wtt = 0; S.wtr = 0; S.wcd = 0; S.wdn = 0;
      S.wx = Math.max(6, Math.min(S.rm === 1 ? 108 : 112, S.wx));
    }
    function dzSay(i) {
      var cp = document.getElementById("rmcap");
      if (cp) cp.innerHTML = "<b>" + esc(WN[i]) + "</b><br>" + esc(t("隊形練習中，再練一遍。"));
      S.capK = ""; S.cph = performance.now() / 1000 + 3;
    }

    function draw() {
      var n = count(S.st), pct = Math.round((n / ITEMS.length) * 100), full = n >= ITEMS.length, h;
      var r2 = room2Open(S.st), p2 = S.rm === 1 && r2, LIST = S.rm === 1 ? ITEMS2 : ITEMS;
      var n2 = count(S.st, ITEMS2), pct2 = Math.round((n2 / ITEMS2.length) * 100), full2 = n2 >= ITEMS2.length;
      var nn = 0; LIST.forEach(function (it) { if (S.nw[it.b]) nn++; });
      var NWM = "<b>有新物品！</b><br>閃爍的星星是新獲得的，點一下看看。";
      h = '<div class="rmc"><div class="rmh">' + (S.rm === 1 && !r2 ? "<b>？？？</b><span></span>" : "<b>" + (p2 ? "練習室" : "彩蛋小窩") + "</b><span><span>" + (p2 ? n2 : n) + " / " + (p2 ? ITEMS2.length : ITEMS.length) + "</span> <span>件</span></span>") + "</div>" + chips(S, full, r2) +
        (S.rm === 1 && !r2 ? "" : '<div class="rmt" role="tablist"><button type="button" role="tab" data-t="room" aria-selected="' + (S.tab === "room") + '">房間</button><button type="button" role="tab" data-t="list" aria-selected="' + (S.tab === "list") + '">收藏清單</button></div>') + '<div class="rmb">';
      if (S.rm === 1 && !r2) {
        h += lockedRoom(full, n);
      } else if (S.tab === "room") {
        h += (p2 ? scene2(S, full2) : scene(S, full)) + '<div class="rmcap" id="rmcap" aria-live="polite">' +
          (p2
            ? (isAnniv() ? "<b>今天是 6/13，出道紀念日！</b><br>練習室也掛上彩旗了。" : bdName() ? "<b>" + esc(bdName()) + "</b> <span>今天生日！</span><br>練習室為壽星布置好了。" : seasonKind() ? seasCap(true) : nn ? NWM : full2 ? "<b>練習室完成！</b><br>七個人站好位置了，準備開跳。" : "點練習室裡的東西看看。暗暗的剪影是還沒解鎖的物品。")
            : (isAnniv() ? "<b>今天是 6/13，出道紀念日！</b><br>小窩也掛上彩旗了。" : bdName() ? "<b>" + esc(bdName()) + "</b> <span>今天生日！</span><br>小窩為壽星布置好了。" : seasonKind() ? seasCap(false) : nn ? NWM : full ? "<b>小窩完成！</b><br>窗外好像有七個人影在揮手……" : "點房間裡的東西看看。暗暗的剪影是還沒解鎖的物品。")) + "</div>" +
          '<div class="rmbar"><div class="rmp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + (p2 ? pct2 : pct) + '"><s style="width:' + (p2 ? pct2 : pct) + '%"></s></div><span><span>' + (p2 ? "練習室完成度" : "小窩完成度") + "</span> <span>" + (p2 ? pct2 : pct) + '%</span></span><button type="button" class="rmn" id="rmdn">' + (S.night ? "☀ 切到白天" : "🌙 切到夜晚") + "</button></div>";
      } else {
        h += '<div class="rmf"><button type="button" data-f="all" aria-pressed="' + (S.flt === "all") + '">全部</button><button type="button" data-f="on" aria-pressed="' + (S.flt === "on") + '">已獲得</button><button type="button" data-f="off" aria-pressed="' + (S.flt === "off") + '">未獲得</button></div><div class="rml">';
        LIST.forEach(function (it) {
          var on = !!S.st[it.b];
          if ((S.flt === "on" && !on) || (S.flt === "off" && on)) return;
          var bd = nameOf(it);
          h += '<div class="rmk' + (on ? " on" : "") + '"><svg viewBox="0 0 ' + it.w + " " + it.h + '" shape-rendering="crispEdges" aria-hidden="true" class="' + (on ? "" : "lk") + '">' + it.art + "</svg><b>" + (on || !it.hid ? esc(it.n) : "？？？") + "</b>" + (S.nw[it.b] ? '<em class="rmnw">NEW</em>' : "") + "<small>" +
            (on ? "<span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span>" : it.hid ? "隱藏物品" : (bd ? esc(bd.desc) : "<span>解鎖徽章：</span><span>" + esc(it.fb) + "</span>")) + "</small></div>";
        });
        h += "</div>";
      }
      h += '</div><button type="button" class="btn rmx">關閉</button></div>';
      if (S.pop) h += nextPop(r2);
      o.innerHTML = h;
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
      if (cap) cap.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t("在小窩裡散步，再點一下換下一位。"));
      S.capK = ""; S.cph = performance.now() / 1000 + 2.5;
    }

    /* 小人的動作由這個迴圈控制：左右走、踏上地毯跳一下、走到球鞋（有解鎖才會）停 2 秒、夜晚走一陣子就打瞌睡 5 秒 */
    var raf = 0, lastTs = 0, SPD = 12.5;
    var reduceM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
    /* 新動作：走到書架（左邊）看書、走到日曆／時鐘下（中間）抬頭看。解鎖對應物品才會做 */
    function popK(k) {
      var it = ALL.filter(function (x) { return x.k === k; })[0], gg = o.querySelector('.rmi[data-k="' + k + '"]');
      if (it && gg) pop(gg, it);
    }
    /* 動作變了就換下方文字；剛點過物品／換人時先讓出一小段時間，不會把台詞蓋掉 */
    function capSt(now, key) {
      var cp = document.getElementById("rmcap");
      if (!cp || now < S.cph || S.capK === key) return;
      S.capK = key;
      if ((key === "walk" || key === "run" || key === "w2") && (isAnniv() || bdName())) {
        var r2 = key === "w2";
        cp.innerHTML = isAnniv()
          ? "<b>" + esc(t("今天是 6/13，出道紀念日！")) + "</b><br>" + esc(t(r2 ? "練習室也掛上彩旗了。" : "小窩也掛上彩旗了。"))
          : "<b>" + esc(bdName()) + "</b> <span>" + esc(t("今天生日！")) + "</span><br>" + esc(t(r2 ? "練習室為壽星布置好了。" : "小窩為壽星布置好了。"));
        return;
      }
      var sk = seasonKind();
      if (sk && (key === "walk" || key === "run" || key === "w2")) {
        cp.innerHTML = "<b>" + esc(t(SEAS[sk].tt)) + "</b><br>" + esc(t(key === "w2" ? SEAS[sk].s2 : SEAS[sk].s1));
        return;
      }
      var tx;
      if (key === "clk") tx = clockSay();
      else {
        var a = CAPS[key];
        if (!a) return;
        var lo = (key === "walk" && S.bias) ? 1 : 0;
        tx = t(a[lo + Math.floor(Math.random() * (a.length - lo))]);
      }
      cp.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(tx);
    }
    function enter(w, now) {
      S.wst = w;
      if (w === "read") { S.wuntil = now + 3.4; popK("shelf"); }
      else if (w === "clk") {
        S.wuntil = now + 3.2;
        popK("clock");
        var bb = o.querySelector(".rmck");
        if (bb) bb.innerHTML = tmBub();
      } else if (w === "cal") {
        S.wuntil = now + 3.4;
        S.wtt = Math.random() < 0.5 ? now + 1 : 0;
        S.wtr = 0;
      }
    }
    /* 練習室的動作迴圈（S.rm === 1 時由 tick 轉進來）：
       單人：左右散步；走到左端（有三腳架）擺姿勢拍照、走到右端（有音響）跳舞、平常每 7～15 秒隨機跳一小段、夜晚走一陣子就打瞌睡。
       100%：七人在 FORM 的四種隊形之間換位（每 3.6 秒換一次），鏡子裡的倒影同步移動。 */
    function tick2(now, dt) {
      var g = o.querySelector(".rmwx"), ds = o.querySelector("#rmdz"), i;
      if (g) {
        if (S.wst === "walk") {
          if (!S.wdn) S.wdn = now + 7 + Math.random() * 8;
          S.wx += S.wd * SPD * dt;
          S.wwalk += dt;
          if (S.wx >= 108) {
            S.wx = 108; S.wd = -1;
            if (S.st["p-game"] && Math.random() < 0.7) { S.wst = "dn"; S.wuntil = now + 3; popK("pspk"); }
          } else if (S.wx <= 6) {
            S.wx = 6; S.wd = 1;
            if (S.st["p-pass"] && Math.random() < 0.7) { S.wst = "pose"; S.wuntil = now + 2.2; popK("ptripod"); }
          }
          if (S.wst === "walk" && now >= S.wdn) { S.wst = "dn"; S.wuntil = now + 2.4; S.wdn = 0; if (S.st["p-game"]) popK("pspk"); }
          if (S.wst === "walk" && S.night && S.wwalk > 8) { S.wst = "sleep"; S.wuntil = now + 5; S.wwalk = 0; if (S.st["p-late"]) popK("pclock"); }
        } else if (now >= S.wuntil) {
          S.wst = "walk";
        }
        capSt(now, S.wst === "walk" ? "w2" : S.wst);
        g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + ",0)");
        g.classList.toggle("pz", S.wst === "sleep" || S.wst === "pose");
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
      if (ds && S.dz) {
        var els = [], rf = [];
        [].forEach.call(ds.querySelectorAll(".rmdd"), function (e) { els[+e.getAttribute("data-i")] = e; });
        [].forEach.call(o.querySelectorAll(".rmdr"), function (e) { rf[+e.getAttribute("data-i")] = e; });
        if (!S.fnx) S.fnx = now + 2.5;
        if (now >= S.fnx) {
          S.fi = (S.fi + 1) % FORM.length;
          S.fnx = now + 3.6;
          [0, 1, 2, 3, 4, 5, 6].sort(function (a, b) { return FORM[S.fi][a][1] - FORM[S.fi][b][1]; }).forEach(function (j) { if (els[j]) ds.appendChild(els[j]); });
        }
        var fk = "f" + S.fi, fc = document.getElementById("rmcap");
        if (fc && now >= S.cph && S.capK !== fk) {
          S.capK = fk;
          fc.innerHTML = "<b>" + esc(t("七人隊形")) + "</b><br>" + esc(t(CAPF[S.fi]));
        }
        var kk = Math.min(1, dt * 4);
        for (i = 0; i < 7; i++) {
          var d = S.dz[i], tg = FORM[S.fi][i];
          d.x += (tg[0] - d.x) * kk;
          d.y += (tg[1] - d.y) * kk;
          if (els[i]) els[i].setAttribute("transform", "translate(" + d.x.toFixed(2) + "," + d.y.toFixed(2) + ")");
          if (rf[i]) { rf[i].setAttribute("x", (d.x + 2).toFixed(2)); rf[i].setAttribute("y", reflY(d.y)); }
        }
      }
    }

    function tick(ts) {
      if (!document.body.contains(o)) return;
      var dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000), now = ts / 1000, g = o.querySelector(".rmwx");
      lastTs = ts;
      if (S.rm === 1) { tick2(now, dt); raf = requestAnimationFrame(tick); return; }
      /* 窗外煙火：小窩 100% 才有。每隔 5～12 秒放一發，每發約 1.4 秒 */
      var fw = o.querySelector("#rmfw");
      if (fw) {
        if (!S.fwn) S.fwn = now + 2.5 + Math.random() * 3;
        if (!S.fwb && now >= S.fwn) S.fwb = { t: now, x: 70 + Math.floor(Math.random() * 21), y: 15 + Math.floor(Math.random() * 10), c: Math.floor(Math.random() * 7), f: -1 };
        if (S.fwb) {
          var ff = Math.floor((now - S.fwb.t) / 0.18);
          if (ff !== S.fwb.f) { S.fwb.f = ff; fw.innerHTML = fwHtml(S.fwb, ff); }
          if (ff >= 8) { S.fwb = null; S.fwn = now + 5 + Math.random() * 7; fw.innerHTML = ""; }
        }
      }
      if (g) {
        var dy = 0;
        if (S.wst === "walk") {
          var px = S.wx;
          /* 偶爾小跑步：每隔 8～20 秒跑 1.6～2.8 秒，速度 2.2 倍 */
          if (!S.wjn) S.wjn = now + 6 + Math.random() * 8;
          else if (now >= S.wjn) { S.wju = now + 1.6 + Math.random() * 1.2; S.wjn = S.wju + 8 + Math.random() * 12; }
          S.wx += S.wd * SPD * (now < S.wju ? 2.2 : 1) * dt;
          S.wwalk += dt;
          if (S.wx >= 112) { S.wx = 112; S.wd = -1; }
          else if (S.wx <= 8) {
            S.wx = 8;
            var lo = [];
            if (S.st["fp-1"]) lo.push("look");
            if (S.st["v-fav"]) lo.push("read");
            var pk = lo.length ? lo[Math.floor(Math.random() * lo.length)] : "";
            if (pk === "look") { S.wst = "look"; S.wuntil = now + 2.2; }
            else if (pk === "read") enter("read", now);
            else S.wd = 1;
          }
          if (S.wst === "walk" && now >= S.wcd && ((px < CLX && S.wx >= CLX) || (px > CLX && S.wx <= CLX))) {
            var op = [];
            if (S.st["h-open"]) op.push("clk");
            if (S.st["h-last"]) op.push("cal");
            if (op.length && Math.random() < 0.6) { S.wx = CLX; enter(op[Math.floor(Math.random() * op.length)], now); }
          }
          var ctr = S.wx + 13, inRug = ctr >= 58 && ctr <= 106;
          if (inRug && !S.wrug && S.wj <= 0) S.wj = 0.5;
          S.wrug = inRug;
          if (S.wst === "walk" && S.night && S.wwalk > 8) { S.wst = "sleep"; S.wuntil = now + 5; S.wwalk = 0; }
        } else {
          if (S.wst === "cal" && S.wtt && now >= S.wtt) { S.wtt = 0; S.wtr = now + 1.5; popK("cal"); }
          if (now >= S.wuntil) {
            if (S.wst === "look" || S.wst === "read") S.wd = 1;
            S.wst = "walk";
            S.wtt = 0;
            S.wtr = 0;
            S.wcd = now + 6;
          }
        }
        if (S.wj > 0) {
          S.wj -= dt;
          dy = S.wj > 0 ? -6 * Math.sin(Math.PI * (1 - S.wj / 0.5)) : 0;
        }
        capSt(now, S.wst === "walk" ? (now < S.wju ? "run" : "walk") : (S.wst === "cal" && now < S.wtr) ? "tear" : S.wst);
        g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + "," + dy.toFixed(2) + ")");
        g.classList.toggle("pz", S.wst !== "walk");
        g.classList.toggle("slp", S.wst === "sleep");
        g.classList.toggle("rd", S.wst === "read");
        g.classList.toggle("cu", S.wst === "cal");
        g.classList.toggle("ck", S.wst === "clk");
        g.classList.toggle("tr", S.wst === "cal" && now < S.wtr);
        g.classList.toggle("jg", S.wst === "walk" && now < S.wju);
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
      if (pab) { if (pab.getAttribute("data-a") === "go") { S.rm = 1; resetW(); if (room2Open(S.st)) saveSeen(true); } S.pop = false; draw(); return; }
      var rsb = t.closest && t.closest("[data-r]");
      if (rsb) { S.rm = +rsb.getAttribute("data-r"); resetW(); if (S.rm === 1 && room2Open(S.st)) saveSeen(true); draw(); return; }
      var tb = t.closest && t.closest("[data-t]");
      if (tb) { S.tab = tb.getAttribute("data-t"); draw(); return; }
      var ft = t.closest && t.closest("[data-f]");
      if (ft) { S.flt = ft.getAttribute("data-f"); draw(); return; }
      if (t.closest && t.closest("#rmdn")) { S.night = !S.night; S.lamp = S.night; draw(); return; }
      var dd = t.closest && t.closest(".rmdd");
      if (dd) { dzSay(+dd.getAttribute("data-i")); return; }
      var w = t.closest && t.closest(".rmwk");
      if (w) { walk(w); return; }
      var g = t.closest && t.closest(".rmi");
      if (g) hit(g);
    });
    o.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var g = ev.target.closest && ev.target.closest(".rmi,.rmwk,.rmdd");
      if (g) { ev.preventDefault(); if (g.classList.contains("rmwk")) walk(g); else if (g.classList.contains("rmdd")) dzSay(+g.getAttribute("data-i")); else hit(g); }
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
