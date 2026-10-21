/* 彩蛋小窩：像素房間。解鎖徽章／彩蛋，房間就會多一件物品。
   新增物品：在 ITEMS 加一筆 {k 代號, b 對應徽章代號, n 名稱, hid 是否隱藏, x,y,w,h 固定位置與大小, art 像素圖, an 點擊動畫, say 點擊台詞}
   只讀取 badgeSync() 的結果，不改任何徽章資料，也不存任何東西（檯燈開關、晝夜切換只在這次開啟有效）。 */
(function () {
  "use strict";
  if (window.__roomLoaded) return;
  window.__roomLoaded = true;

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
    "全部": ["All", "전체", "すべて"],
    "在小窩裡散步，再點一下換下一位。": ["Taking a stroll around the room — tap again for the next one.", "방 안을 산책 중이에요. 한 번 더 누르면 다음 멤버예요.", "お部屋を散歩中。もう一度タップすると次のメンバーに交代します。"],
    "本命一直都在小窩裡。": ["Your bias is always here in the room.", "최애는 언제나 방에 있어요.", "本命はいつもお部屋にいます。"],
    "散步的小人": ["Little walker", "산책하는 꼬마", "お散歩ミニキャラ"],
    "關閉": ["Close", "닫기", "閉じる"]
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
  /* 彩蛋小窩開關：跟「藝人同款足跡」一樣的鎖法。
     ROOM_PUBLIC=false＝對一般使用者鎖起來（首頁入口灰色＋鎖頭＋「新功能／暫未開放」）；要正式開放就改成 true，並把 sw.js 的 VER 換一個值。
     自己預覽：用 ?preview=room 開一次，這台裝置就會解鎖（存在 localStorage: room-preview）；用 ?preview=off 關掉預覽 */
  var ROOM_PUBLIC = false;
  var ROOM_OPEN = ROOM_PUBLIC || (function () {
    try {
      var v = new URLSearchParams(location.search).get("preview");
      if (v === "room") localStorage.setItem("room-preview", "1");
      else if (v === "off") localStorage.removeItem("room-preview");
      return localStorage.getItem("room-preview") === "1";
    } catch (e) { return false; }
  })();
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
    { k: "plant", b: "x-app", fb: "常駐站民", n: "盆栽", x: 86, y: 32, w: 10, h: 14, an: "sway", say: "盆栽沙沙搖，歡迎常常回來。",
      art: R(4, 2, 2, 7, "#2dbf8f") + R(2, 4, 3, 3, "#2dbf8f") + R(5, 3, 3, 3, "#2dbf8f") + R(3, 1, 2, 2, "#2dbf8f") + R(2, 9, 6, 5, "#d9482f") + R(1, 9, 8, 1, "#b8381f") },
    { k: "poster", b: "f-1", fb: "初次抽籤", n: "星星海報", x: 64, y: 50, w: 16, h: 14, an: "shake", say: "星星海報：今天的運勢，抽籤才知道。",
      art: R(0, 0, 16, 14, "#7b4fd6") + R(1, 1, 14, 12, "#9d7be8") + R(7, 3, 2, 2, "#ffd23f") + R(4, 5, 8, 2, "#ffd23f") + R(5, 7, 6, 2, "#ffd23f") + R(4, 9, 3, 2, "#ffd23f") + R(9, 9, 3, 2, "#ffd23f") },
    { k: "stick", b: "h-live", fb: "現場見證", hid: 1, n: "手燈", x: 88, y: 48, w: 8, h: 18, an: "glow", say: "手燈亮起來了 💜",
      art: '<g class="halo">' + R(-4, -3, 16, 14, "#b794ff", 0.25) + R(-2, -1, 12, 10, "#b794ff", 0.25) + "</g>" + R(1, 0, 6, 5, "#b794ff") + R(2, 5, 4, 1, "#9d7be8") + R(3, 6, 2, 10, "#444") + R(2, 16, 4, 2, "#222") }
  ];

  /* ===== 窗外的海（白天／夜晚），集滿 100% 會多七個人影 ===== */
  function win(night, full) {
    var s = night
      ? R(64, 10, 32, 28, "#0b1f4d") + R(64, 26, 32, 12, "#10306e") + R(68, 14, 1, 1, "#fff") + R(90, 13, 1, 1, "#fff") + R(74, 18, 1, 1, "#7cf2ff") + R(86, 22, 1, 1, "#7cf2ff") +
        '<g class="fish">' + R(70, 22, 4, 3, "#c9a7ff") + R(71, 25, 1, 3, "#c9a7ff") + R(73, 25, 1, 2, "#c9a7ff") + "</g>"
      : R(64, 10, 32, 28, "#7cc4ff") + R(64, 10, 32, 8, "#9bd3ff") + R(70, 10, 3, 28, "#fff", 0.15) + R(84, 10, 3, 28, "#fff", 0.12) + R(75, 16, 1, 1, "#fff") + R(90, 20, 1, 1, "#fff") +
        '<g class="fish">' + R(68, 24, 4, 2, "#ff8a5b") + R(72, 23, 1, 4, "#ff8a5b") + R(67, 25, 1, 1, "#fff") + "</g>";
    s += R(64, 38, 32, 4, night ? "#3a4a7a" : "#f0d9a0") + R(66, 34, 1, 4, "#2dbf8f") + R(67, 33, 1, 3, "#2dbf8f") + R(92, 35, 1, 3, "#2dbf8f");
    if (full) {
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
  function walker(S) {
    var label = WN[S.mem] + (lang() === "zh" ? "，" : ", ") + t("散步的小人");
    var hat = S.bias && bdToday(WN[S.mem])
      ? '<g transform="rotate(-10 13 3)">' + R(12, -6, 2, 2, "#ffd23f") + R(11, -4, 4, 2, "#ff8fb3") + R(10, -2, 6, 2, "#fff") + R(9, 0, 8, 1, "#6fb7ff") + "</g>" : "";
    var zz = '<g class="rmzz"><text class="rz" x="23" y="3" font-size="5">Z</text><text class="rz" x="26" y="-1" font-size="6">Z</text><text class="rz" x="29" y="-5" font-size="7">Z</text></g>';
    var st = S.wst === "sleep" ? " slp pz" : S.wst === "look" ? " pz" : "";
    return '<g transform="translate(0,66)"><g class="rmwx' + st + '" transform="translate(' + S.wx.toFixed(2) + ',0)"><g class="rmwf"' + (S.wd < 0 ? ' transform="translate(26,0) scale(-1,1)"' : "") + '><g class="rmwk" tabindex="0" role="button" aria-label="' + esc(label) + '">' +
      R(0, 0, 26, 26, "transparent") + '<g class="rmwb"><image class="rmwa" href="' + esc(avUrl(WN[S.mem])) + '" x="0" y="0" width="26" height="26" preserveAspectRatio="xMidYMax meet"/>' + hat + "</g></g></g>" + zz + "</g></g>";
  }

  function scene(S, full) {
    var P = S.night ? PN : PD, i, s = '<svg id="rmsv" viewBox="0 0 160 100" shape-rendering="crispEdges" role="group" aria-label="我的 ARMY 小窩">';
    s += R(0, 0, 160, 66, P.wall);
    for (i = 1; i < 10; i++) s += R(i * 16, 0, 1, 66, P.wl, 0.6);
    s += R(0, 66, 160, 34, P.fl);
    for (i = 0; i < 5; i++) s += R(0, 70 + i * 7, 160, 1, P.fll);
    s += R(0, 64, 160, 3, P.bs);
    s += win(S.night, full);
    s += R(102, 52, 56, 3, "#8b5a2b") + R(104, 55, 52, 2, "#a8743f") + R(104, 57, 3, 9, "#8b5a2b") + R(153, 57, 3, 9, "#8b5a2b");
    ITEMS.forEach(function (it) {
      var on = !!S.st[it.b], cls = "rmi" + (on ? "" : " lk") + (it.k === "lamp" ? " rmlamp" + (on && S.lamp ? " on" : "") : "");
      var label = (on || !it.hid ? t(it.n) : "???") + (lang() === "zh" ? "，" : ", ") + t(on ? "已解鎖" : "未解鎖");
      s += '<g transform="translate(' + it.x + "," + it.y + ')"><g class="' + cls + '" data-k="' + it.k + '" tabindex="0" role="button" aria-label="' + esc(label) + '">' + R(0, 0, it.w, it.h, "transparent") + it.art + "</g></g>";
    });
    return s + walker(S) + "</svg>";
  }

  /* ===== 狀態 ===== */
  function getBs() {
    var r = null;
    try { r = badgeSync(); } catch (e) {}
    return r && r.st ? r : { st: {}, L: [] };
  }
  function count(st) {
    var n = 0;
    ITEMS.forEach(function (it) { if (st[it.b]) n++; });
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
    ".rmi{cursor:pointer;transform-box:fill-box;transform-origin:50% 100%}.rmi:focus-visible{outline:2px solid var(--focus)}" +
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
    ".rmwk{cursor:pointer}.rmwk:focus-visible{outline:2px solid var(--focus)}" +
    ".rmwb{animation:rmbob .5s steps(1,end) infinite}@keyframes rmbob{0%{transform:translateY(0)}50%{transform:translateY(-2px)}100%{transform:translateY(0)}}" +
    ".pz .rmwb{animation:none}.slp .rmwb{transform-box:fill-box;transform-origin:50% 100%;transform:rotate(9deg)}" +
    ".rmzz{display:none}.slp .rmzz{display:block}.rz{fill:#fff;stroke:#062a6e;stroke-width:.5;paint-order:stroke;font-weight:900;opacity:0;transform-box:fill-box;animation:rmz 2.4s ease-out infinite}.rz:nth-child(2){animation-delay:.8s}.rz:nth-child(3){animation-delay:1.6s}@keyframes rmz{0%{opacity:0;transform:translate(0,3px)}30%{opacity:1}100%{opacity:0;transform:translate(4px,-8px)}}" +
    "@media(prefers-reduced-motion:reduce){.rmwb,.rz{animation:none}.slp .rz{opacity:1}}";
  document.head.appendChild(css);

  /* ===== 開啟專區 ===== */
  var opener = null;
  function open() {
    if (document.getElementById("rmo")) return;
    opener = document.activeElement;
    var bs = getBs(), L = bs.L, st = bs.st;
    var S = { night: isNight(), lamp: isNight(), st: st, tab: "room", flt: "all", mem: Math.floor(Math.random() * WN.length), bias: false,
      wx: (window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches) ? 66 : 20 + Math.floor(Math.random() * 80), wd: 1, wst: "walk", wuntil: 0, wj: 0, wrug: false, wwalk: 0 };
    /* 解鎖「偏心警告」（同一位成員打卡 5 個以上）就把那位本命固定放在房間裡，不再隨機、也不能換人 */
    (function () {
      var b = null;
      for (var i = 0; i < L.length; i++) if (L[i].id === "h-bias") b = L[i];
      var ix = b && st["h-bias"] ? WN.indexOf(b.bias) : -1;
      if (ix >= 0) { S.mem = ix; S.bias = true; }
    })();
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
      var say = it.say === "lamp" ? (S.lamp ? "檯燈亮了。" : "檯燈關了。") : it.say;
      var tail = it.say === "clock" ? esc(clockSay()) : esc(say);
      return "<b>" + esc(it.n) + "</b> <small><span>來自徽章：</span><span>" + esc(bd ? bd.name : it.fb) + "</span> <span>·</span> <span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span></small><br>" + tail;
    }

    function draw() {
      var n = count(S.st), pct = Math.round((n / ITEMS.length) * 100), full = n >= ITEMS.length, h;
      h = '<div class="rmc"><div class="rmh"><b>彩蛋小窩</b><span><span>' + n + " / " + ITEMS.length + "</span> <span>件</span></span></div>" +
        '<div class="rmt" role="tablist"><button type="button" role="tab" data-t="room" aria-selected="' + (S.tab === "room") + '">房間</button><button type="button" role="tab" data-t="list" aria-selected="' + (S.tab === "list") + '">收藏清單</button></div><div class="rmb">';
      if (S.tab === "room") {
        h += scene(S, full) + '<div class="rmcap" id="rmcap" aria-live="polite">' +
          (full ? "<b>小窩完成！</b><br>窗外好像有七個人影在揮手……" : "點房間裡的東西看看。暗暗的剪影是還沒解鎖的物品。") + "</div>" +
          '<div class="rmbar"><div class="rmp" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><s style="width:' + pct + '%"></s></div><span><span>小窩完成度</span> <span>' + pct + '%</span></span><button type="button" class="rmn" id="rmdn">' + (S.night ? "☀ 切到白天" : "🌙 切到夜晚") + "</button></div>";
      } else {
        h += '<div class="rmf"><button type="button" data-f="all" aria-pressed="' + (S.flt === "all") + '">全部</button><button type="button" data-f="on" aria-pressed="' + (S.flt === "on") + '">已獲得</button><button type="button" data-f="off" aria-pressed="' + (S.flt === "off") + '">未獲得</button></div><div class="rml">';
        ITEMS.forEach(function (it) {
          var on = !!S.st[it.b];
          if ((S.flt === "on" && !on) || (S.flt === "off" && on)) return;
          var bd = nameOf(it);
          h += '<div class="rmk' + (on ? " on" : "") + '"><svg viewBox="0 0 ' + it.w + " " + it.h + '" shape-rendering="crispEdges" aria-hidden="true" class="' + (on ? "" : "lk") + '">' + it.art + "</svg><b>" + (on || !it.hid ? esc(it.n) : "？？？") + "</b><small>" +
            (on ? "<span>獲得於</span> <span>" + esc(dstr(S.st[it.b])) + "</span>" : it.hid ? "隱藏物品" : (bd ? esc(bd.desc) : "<span>解鎖徽章：</span><span>" + esc(it.fb) + "</span>")) + "</small></div>";
        });
        h += "</div>";
      }
      h += '</div><button type="button" class="btn rmx">關閉</button></div>';
      o.innerHTML = h;
      try { window.I18N && I18N.refresh(); } catch (e) {}
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
      var k = g.getAttribute("data-k"), it = ITEMS.filter(function (x) { return x.k === k; })[0];
      if (!it) return;
      var on = !!S.st[it.b];
      if (on && it.k === "lamp") { S.lamp = !S.lamp; g.classList.toggle("on", S.lamp); }
      else if (on) pop(g, it);
      var cap = document.getElementById("rmcap");
      if (cap) cap.innerHTML = capFor(it);
    }

    function walk(g) {
      if (S.bias) {
        var cb = document.getElementById("rmcap");
        if (cb) cb.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t("本命一直都在小窩裡。"));
        return;
      }
      S.mem = (S.mem + 1) % WN.length;
      var im = g.querySelector("image");
      if (im) im.setAttribute("href", avUrl(WN[S.mem]));
      g.setAttribute("aria-label", WN[S.mem] + (lang() === "zh" ? "，" : ", ") + t("散步的小人"));
      var cap = document.getElementById("rmcap");
      if (cap) cap.innerHTML = "<b>" + esc(WN[S.mem]) + "</b><br>" + esc(t("在小窩裡散步，再點一下換下一位。"));
    }

    /* 小人的動作由這個迴圈控制：左右走、踏上地毯跳一下、走到球鞋（有解鎖才會）停 2 秒、夜晚走一陣子就打瞌睡 5 秒 */
    var raf = 0, lastTs = 0, SPD = 12.5;
    var reduceM = !!(window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches);
    function tick(ts) {
      if (!document.body.contains(o)) return;
      var dt = Math.min(0.05, (ts - (lastTs || ts)) / 1000), now = ts / 1000, g = o.querySelector(".rmwx");
      lastTs = ts;
      if (g) {
        var dy = 0;
        if (S.wst === "walk") {
          S.wx += S.wd * SPD * dt;
          S.wwalk += dt;
          if (S.wx >= 112) { S.wx = 112; S.wd = -1; }
          else if (S.wx <= 8) {
            S.wx = 8;
            if (S.st["fp-1"]) { S.wst = "look"; S.wuntil = now + 2.2; } else S.wd = 1;
          }
          var ctr = S.wx + 13, inRug = ctr >= 58 && ctr <= 106;
          if (inRug && !S.wrug && S.wj <= 0) S.wj = 0.5;
          S.wrug = inRug;
          if (S.night && S.wwalk > 8) { S.wst = "sleep"; S.wuntil = now + 5; S.wwalk = 0; }
        } else if (now >= S.wuntil) {
          if (S.wst === "look") S.wd = 1;
          S.wst = "walk";
        }
        if (S.wj > 0) {
          S.wj -= dt;
          dy = S.wj > 0 ? -6 * Math.sin(Math.PI * (1 - S.wj / 0.5)) : 0;
        }
        g.setAttribute("transform", "translate(" + S.wx.toFixed(2) + "," + dy.toFixed(2) + ")");
        g.classList.toggle("pz", S.wst !== "walk");
        g.classList.toggle("slp", S.wst === "sleep");
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
    var ky = function (ev) { if (ev.key === "Escape") close(); };
    o.addEventListener("click", function (ev) {
      var t = ev.target;
      if (t === o || (t.closest && t.closest(".rmx"))) return close();
      var tb = t.closest && t.closest("[data-t]");
      if (tb) { S.tab = tb.getAttribute("data-t"); draw(); return; }
      var ft = t.closest && t.closest("[data-f]");
      if (ft) { S.flt = ft.getAttribute("data-f"); draw(); return; }
      if (t.closest && t.closest("#rmdn")) { S.night = !S.night; S.lamp = S.night; draw(); return; }
      var w = t.closest && t.closest(".rmwk");
      if (w) { walk(w); return; }
      var g = t.closest && t.closest(".rmi");
      if (g) hit(g);
    });
    o.addEventListener("keydown", function (ev) {
      if (ev.key !== "Enter" && ev.key !== " ") return;
      var g = ev.target.closest && ev.target.closest(".rmi,.rmwk");
      if (g) { ev.preventDefault(); if (g.classList.contains("rmwk")) walk(g); else hit(g); }
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
