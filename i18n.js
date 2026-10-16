/* 多語言切換：介面文字翻譯（試算表內的活動內容維持原文）。
   新增語言：在 LANGS 加一項。en、ko 的翻譯放在 D 每行的陣列裡；ja 因為是後加的，集中放在下方 JAL 清單（順序與 D 的條目相同）。 */
(function(){
const LANGS=[["zh","繁體中文"],["en","English"],["ko","한국어"],["ja","日本語"]];
const D={
"BTS 應援地圖":["BTS Fan Project Map","BTS 응원 지도"],
"ARIRANG 巡演粉絲應援地圖":["ARIRANG Tour Fan Project Map","ARIRANG 투어 팬 응원 지도"],
"BTS 生日應援地圖":["BTS Birthday Project Map","BTS 생일 응원 지도"],
"本頁為非官方的應援資訊整理與分享。內容與主辦單位立場不代表本站，請依各主辦最新公告與現場規定參加，並自行評估。":["Unofficial fan-made listing. Organizers' statements do not represent this site. Please follow each organizer's latest announcements and on-site rules, and use your own judgment.","비공식 팬 정보 정리 페이지입니다. 주최측의 입장은 본 사이트와 무관하며, 각 주최측의 최신 공지와 현장 규정을 따라 주시고 본인 판단하에 참여해 주세요."],
"選擇你想看的應援":["Choose what you'd like to see","보고 싶은 응원을 선택하세요"],
"各成員生日與 BTS 出道周年應援整理":["Birthday and BTS debut anniversary projects by member","멤버별 생일 및 BTS 데뷔 기념일 응원 정리"],
"高雄國家體育場（世運主場館）・捷運紅線 R17 世運站":["Kaohsiung National Stadium · MRT Red Line R17 World Games","가오슝 국가체육장 · MRT 레드라인 R17 월드게임즈역"],
"啟德主場館（啟德體育園）":["Kai Tak Main Stadium (Kai Tak Sports Park)","카이탁 메인 스타디움 (카이탁 스포츠 파크)"],
"♡ 我的收藏":["♡ Favorites","♡ 즐겨찾기"],"♥ 我的收藏":["♥ Favorites","♥ 즐겨찾기"],
"注意事項":["Notes","유의사항"],"使用說明":["How to use","사용 방법"],
"前往應援地點請注意交通安全，不要為了拍照走進車道，或在站牌、人行道停留太久。":["Mind traffic safety. Don't step into the road for photos or linger too long at bus stops and sidewalks.","교통안전에 유의하세요. 사진을 위해 차도에 들어가거나 정류장·보도에 오래 머물지 마세요."],
"不要佔用通道，也不要擋住其他民眾或店家出入。":["Don't block walkways or entrances of other people and shops.","통로를 막거나 다른 사람·매장의 출입을 방해하지 마세요."],
"尊重店家和其他粉絲，排隊時保持秩序，需要預約或出示憑證的應援請依主辦規定。":["Respect shops and fellow fans, queue in order, and follow organizers' rules for reservations or proof requirements.","매장과 다른 팬을 존중하고 줄을 서서 질서를 지켜 주세요. 예약·증빙이 필요한 응원은 주최측 규정을 따르세요."],
"拍照打卡後請把垃圾帶走，不要破壞或碰撞裝置、貼紙與布置。":["Take your trash with you and don't damage or bump displays, stickers or decorations.","쓰레기는 가져가시고 설치물·스티커·장식을 훼손하지 마세요."],
"應援內容、時間與地點可能臨時調整，出發前請再確認主辦單位的最新公告。":["Details, times and locations may change. Check the organizer's latest announcement before you go.","응원 내용·시간·장소는 변경될 수 있습니다. 출발 전 주최측의 최신 공지를 확인하세요."],
"點卡片右上角的愛心可以收藏，再點標題區的「我的收藏」，就只看收藏的應援。":["Tap the heart on a card to save it, then tap “Favorites” at the top to see only saved projects.","카드 오른쪽 위 하트로 저장하고, 상단의 '즐겨찾기'를 누르면 저장한 응원만 볼 수 있어요."],
"到了應援地點後按「💣 我打卡了」，卡片上會蓋章，集章簿也會記錄進度。":["After you visit a spot, tap “💣 I checked in” to stamp the card and track progress in your stamp book.","응원 장소에 도착하면 '💣 체크인'을 눌러 카드에 도장을 찍고 스탬프북에 기록하세요."],
"收藏和打卡紀錄只存在你自己手機或電腦的瀏覽器裡，不會上傳。":["Favorites and check-ins are stored only in your own browser and are never uploaded.","즐겨찾기와 체크인 기록은 내 기기의 브라우저에만 저장되며 업로드되지 않습니다."],
"換裝置、換瀏覽器、清除瀏覽資料或用無痕模式，紀錄就會看不到。從 Threads、IG、LINE 等 App 內建瀏覽器開啟，也可能跟平常的瀏覽器不同。建議固定用同一個瀏覽器開啟。":["Records won't show if you switch device or browser, clear browsing data, or use private mode. In-app browsers (Threads, IG, LINE) may also differ. Stick to one browser.","기기·브라우저를 바꾸거나 인터넷 기록을 지우거나 시크릿 모드를 쓰면 기록이 보이지 않습니다. Threads·IG·LINE 인앱 브라우저도 다를 수 있으니 같은 브라우저를 사용하세요."],
"ARIRANG 巡演應援":["ARIRANG Tour Projects","ARIRANG 투어 응원"],
"高雄、香港場次的應援地圖，附日期分頁與打卡集章":["Project maps for Kaohsiung and Hong Kong shows, with date tabs and stamp check-ins","가오슝·홍콩 공연 응원 지도 (날짜 탭, 체크인 스탬프)"],
"生日應援":["Birthday Projects","생일 응원"],
"依成員整理的生日與 BTS 出道周年應援，有倒數":["Birthday and debut anniversary projects by member, with countdowns","멤버별 생일·BTS 데뷔 기념일 응원 (카운트다운 포함)"],
"← 回首頁":["← Home","← 홈으로"],"高雄":["Kaohsiung","가오슝"],"香港":["Hong Kong","홍콩"],
"🗺 地圖總覽":["🗺 Map","🗺 지도"],"🧭 路線規劃":["🧭 Route planner","🧭 경로 계획"],"🔍 搜尋及排序":["🔍 Search & sort","🔍 검색·정렬"],
"類別":["Category","카테고리"],"活動狀態":["Status","상태"],"排序":["Sort","정렬"],
"倒數時間最近":["Soonest first","임박순"],"最新發布":["Newest","최신순"],"日期由近到遠":["By date","날짜순"],"名稱":["Name","이름"],
"套用":["Apply","적용"],"清除條件":["Reset","초기화"],"清除篩選":["Clear filters","필터 해제"],
"全部":["All","전체"],"全部日期":["All dates","전체 날짜"],"進行中":["Ongoing","진행 중"],"即將開始":["Upcoming","시작 예정"],"已結束":["Ended","종료"],"待補充":["TBA","미정"],
"應援企劃":["Fan project","응원 기획"],"LED廣告車":["LED ad truck","LED 광고 차량"],"公車站牌":["Bus stop ad","버스 정류장"],"LED電視牆":["LED video wall","LED 전광판"],"應援咖啡廳":["Fan café","응원 카페"],"咖啡廳":["Café","카페"],"快閃店":["Pop-up store","팝업 스토어"],"展覽":["Exhibition","전시"],
"免費":["Free","무료"],"無領取條件":["No conditions","수령 조건 없음"],"需填表單":["Form required","폼 작성 필요"],"需出示門票":["Ticket required","티켓 제시 필요"],"需部分粉絲證明":["Fan proof required","팬 인증 필요"],"可另外寄送":["Shipping available","배송 가능"],"可代領":["Proxy pickup OK","대리 수령 가능"],"尚待補充":["Info pending","정보 보완 예정"],"有實體圖":["Photo available","실물 사진 있음"],"須配合店家低銷":["Minimum spend applies","매장 최소 주문 필요"],
"地點":["Place","장소"],"時間":["Time","시간"],"備註":["Notes","비고"],
"💣 我打卡了":["💣 I checked in","💣 체크인"],"🎂 我打卡了":["🎂 I checked in","🎂 체크인"],"✔ 已打卡":["✔ Checked in","✔ 체크인 완료"],"📍 地圖":["📍 Map","📍 지도"],"🖼 存成圖片":["🖼 Save as image","🖼 이미지로 저장"],
"收藏":["Favorite","즐겨찾기"],"回到頂端":["Back to top","맨 위로"],"選擇城市":["Choose city","도시 선택"],"選擇日期":["Choose date","날짜 선택"],"選擇成員":["Choose member","멤버 선택"],"選擇地區":["Choose region","지역 선택"],"依類型篩選":["Filter by type","유형 필터"],
"應援名稱、主辦、地點或標籤關鍵字…":["Project, organizer, place or tag…","응원명, 주최, 장소, 태그 검색…"],
"🏆 回顧紀念牆":["🏆 Wall of memories","🏆 추억의 벽"],
"目前沒有進行中或即將開始的應援，可以看看下方的回顧紀念牆":["Nothing ongoing or upcoming right now. See the wall of memories below.","진행 중이거나 예정된 응원이 없습니다. 아래 추억의 벽을 확인해 보세요."],
"還沒有收藏的活動":["No favorites yet","저장한 응원이 없습니다"],"沒有符合的活動，換個條件試試":["No matches. Try other filters.","조건에 맞는 응원이 없습니다. 다른 조건을 시도해 보세요."],
"還沒有收錄生日應援，歡迎提供資料":["No birthday projects yet. Submissions welcome!","등록된 생일 응원이 없습니다. 제보 환영!"],"這個城市還沒有收錄應援，歡迎提供資料":["No projects for this city yet. Submissions welcome!","이 도시의 응원이 아직 없습니다. 제보 환영!"],
"我要提供應援資訊":["Submit a project","응원 정보 제보하기"],
"步行":["Walking","도보"],"大眾運輸":["Transit","대중교통"],"開車":["Driving","자동차"],"交通方式":["Travel mode","이동 수단"],
"在 Google 地圖開啟路線":["Open route in Google Maps","Google 지도에서 경로 열기"],
"依序從第 1 個走到最後一個。相同地點會自動合併；Google 地圖最多支援 10 個停靠點。收藏和順序只存在這個瀏覽器。":["Visits go from #1 to the last. Duplicate places are merged; Google Maps supports up to 10 stops. Favorites and order are stored only in this browser.","1번부터 마지막까지 순서대로 이동합니다. 같은 장소는 합쳐지며 Google 지도는 최대 10개 정류지를 지원합니다. 즐겨찾기와 순서는 이 브라우저에만 저장됩니다."],
"地圖顯示目前篩選結果中已有座標的應援，座標為大略位置，實際地點請點「Google 地圖」確認。":["Shows filtered projects that have coordinates. Positions are approximate; confirm the exact place in Google Maps.","현재 필터 결과 중 좌표가 있는 응원을 표시합니다. 위치는 대략적이니 Google 지도에서 확인하세요."],
"本站為非官方整理，資訊以各主辦單位公告為準。":["Unofficial fan-made site. Organizers' announcements take precedence.","비공식 팬 정리 사이트입니다. 정보는 각 주최측 공지를 기준으로 합니다."],
"已複製，可以貼到社群":["Copied. Paste it on social media.","복사되었습니다. SNS에 붙여넣으세요."],"地圖載入失敗，請檢查網路":["Map failed to load. Check your connection.","지도를 불러오지 못했습니다. 네트워크를 확인하세요."],"已儲存圖片":["Image saved","이미지를 저장했습니다"]
};
const P=[
[/^(\d+) 個活動$/,n=>[n+" projects",n+"개 응원"]],
[/^(\d+) 個已結束的應援$/,n=>[n+" ended projects","종료된 응원 "+n+"개"]],
[/^⏳ 倒數 (\d+) 天$/,n=>["⏳ "+n+" days left","⏳ D-"+n]],
[/^⏳ 明天開始$/,()=>["⏳ Starts tomorrow","⏳ 내일 시작"]],
[/^集章簿 (\d+) \/ (\d+)$/,(a,b)=>["Stamp book "+a+" / "+b,"스탬프북 "+a+" / "+b]],
[/^🔔 資訊更新 (\S+)$/,d=>["🔔 Updated "+d,"🔔 "+d+" 업데이트"]],
[/^資訊更新於 (\S+)$/,d=>["Last updated "+d,d+" 업데이트"]],
[/^主辦：(.*)$/,h=>["Host: "+h,"주최: "+h]],
[/^🧭 路線規劃（收藏的 (\d+) 個地點）$/,n=>["🧭 Route planner ("+n+" favorites)","🧭 경로 계획 (즐겨찾기 "+n+"곳)"]],
[/^🎂 下一個生日：(.+) (\S+)，還有 (\d+) 天$/,(m,d,k)=>["🎂 Next birthday: "+m+" "+d+" — "+k+" days to go","🎂 다음 생일: "+m+" "+d+" — "+k+"일 남음"]],
[/^🎂 今天是 (.+) 的生日！$/,m=>["🎂 Today is "+m+"'s birthday!","🎂 오늘은 "+m+"의 생일!"]],
[/^🎉 下一個：BTS 出道 (\d+) 週年 (\S+)，還有 (\d+) 天$/,(y,d,k)=>["🎉 Next: BTS "+y+"th debut anniversary "+d+" — "+k+" days to go","🎉 다음: BTS 데뷔 "+y+"주년 "+d+" — "+k+"일 남음"]],
[/^🎉 今天是 BTS 出道 (\d+) 週年！$/,y=>["🎉 Today is BTS's "+y+"th debut anniversary!","🎉 오늘은 BTS 데뷔 "+y+"주년!"]]
];
let L=localStorage.getItem("lang");
try{const q=new URLSearchParams(location.search).get("lang");if(q)L=q}catch(e){}
if(!LANGS.some(x=>x[0]===L)){const n=(navigator.language||"zh").toLowerCase();L=n.startsWith("ko")?"ko":n.startsWith("ja")?"ja":n.startsWith("zh")?"zh":"en"}
const JA={};Object.keys(D).forEach((k,i)=>JA[k]=["BTS 応援マップ", "ARIRANG ツアー ファン応援マップ", "BTS バースデー応援マップ", "このページは非公式のファン有志による応援情報のまとめです。主催者の見解は当サイトを代表するものではありません。各主催者の最新のお知らせや会場のルールに従い、ご自身の判断でご参加ください。", "見たい応援を選んでください", "メンバー別の誕生日・BTSデビュー記念日の応援まとめ", "高雄国家体育場（ワールドゲームズ主競技場）・MRTレッドラインR17 世運駅", "啓德メインスタジアム（啓德スポーツパーク）", "♡ お気に入り", "♥ お気に入り", "ご注意", "使い方", "応援スポットへ向かう際は交通安全にご注意ください。写真のために車道へ出たり、バス停や歩道に長時間とどまったりしないでください。", "通路をふさいだり、他の方やお店の出入りを妨げたりしないでください。", "お店や他のファンを尊重し、列では秩序を守ってください。予約や証明が必要な応援は主催者の規定に従ってください。", "撮影・チェックイン後はゴミを持ち帰り、装飾・ステッカー・展示物を壊したりぶつけたりしないでください。", "応援の内容・時間・場所は急に変更されることがあります。出発前に主催者の最新のお知らせをご確認ください。", "カード右上のハートでお気に入りに保存し、上部の「お気に入り」を押すと保存した応援だけを表示できます。", "応援スポットに着いたら「💣 チェックイン」を押すとカードにスタンプが押され、スタンプ帳にも進み具合が記録されます。", "お気に入りとチェックインの記録はお使いのブラウザにのみ保存され、アップロードされません。", "端末やブラウザを変えたり、閲覧データを消去したり、プライベートモードを使うと記録は表示されません。Threads・IG・LINEなどのアプリ内ブラウザも通常のブラウザと異なる場合があります。同じブラウザでの利用をおすすめします。", "ARIRANG ツアー応援", "高雄・香港公演の応援マップ。日付タブとチェックインスタンプ付き", "誕生日応援", "メンバー別の誕生日とBTSデビュー記念日の応援まとめ（カウントダウン付き）", "← ホームへ", "高雄", "香港", "🗺 マップ", "🧭 ルート作成", "🔍 検索・並べ替え", "カテゴリ", "ステータス", "並べ替え", "開始が近い順", "新着順", "日付順", "名前", "適用", "リセット", "絞り込みを解除", "すべて", "全日程", "開催中", "開催予定", "終了", "未定", "応援企画", "LED広告トラック", "バス停広告", "LEDビジョン", "応援カフェ", "カフェ", "ポップアップ", "展示", "無料", "受取条件なし", "フォーム入力必須", "チケット提示必須", "ファン証明必須", "郵送可", "代理受取可", "情報追って追加", "実物写真あり", "店舗の最低利用額あり", "場所", "時間", "備考", "💣 チェックイン", "🎂 チェックイン", "✔ チェックイン済み", "📍 地図", "🖼 画像で保存", "お気に入り", "トップへ戻る", "都市を選択", "日付を選択", "メンバーを選択", "地域を選択", "タイプで絞り込み", "応援名・主催・場所・タグで検索…", "🏆 思い出の壁", "現在、開催中・開催予定の応援はありません。下の思い出の壁をご覧ください。", "お気に入りはまだありません", "該当する応援がありません。条件を変えてお試しください。", "誕生日応援はまだ登録されていません。情報提供をお待ちしています！", "この都市の応援はまだ登録されていません。情報提供をお待ちしています！", "応援情報を提供する", "徒歩", "公共交通機関", "車", "移動手段", "Googleマップでルートを開く", "1番目から最後まで順に回ります。同じ場所は自動的にまとめられ、Googleマップは最大10か所まで対応します。お気に入りと順番はこのブラウザにのみ保存されます。", "現在の絞り込み結果のうち座標のある応援を表示します。位置はおおよそのものですので、正確な場所はGoogleマップでご確認ください。", "当サイトは非公式のまとめです。情報は各主催者のお知らせを基準としてください。", "コピーしました。SNSに貼り付けてください", "地図を読み込めませんでした。ネットワークをご確認ください", "画像を保存しました"][i]);
const PJ=[
[/^(\d+) 個活動$/,n=>n+"件の応援"],
[/^(\d+) 個已結束的應援$/,n=>"終了した応援 "+n+"件"],
[/^⏳ 倒數 (\d+) 天$/,n=>"⏳ あと"+n+"日"],
[/^⏳ 明天開始$/,()=>"⏳ 明日開始"],
[/^集章簿 (\d+) \/ (\d+)$/,(a,b)=>"スタンプ帳 "+a+" / "+b],
[/^🔔 資訊更新 (\S+)$/,d=>"🔔 "+d+" 更新"],
[/^資訊更新於 (\S+)$/,d=>d+" 更新"],
[/^主辦：(.*)$/,h=>"主催："+h],
[/^🧭 路線規劃（收藏的 (\d+) 個地點）$/,n=>"🧭 ルート作成（お気に入り"+n+"か所）"],
[/^🎂 下一個生日：(.+) (\S+)，還有 (\d+) 天$/,(m,d,k)=>"🎂 次の誕生日："+m+" "+d+"（あと"+k+"日）"],
[/^🎂 今天是 (.+) 的生日！$/,m=>"🎂 今日は"+m+"の誕生日！"],
[/^🎉 下一個：BTS 出道 (\d+) 週年 (\S+)，還有 (\d+) 天$/,(y,d,k)=>"🎉 次：BTSデビュー"+y+"周年 "+d+"（あと"+k+"日）"],
[/^🎉 今天是 BTS 出道 (\d+) 週年！$/,y=>"🎉 今日はBTSデビュー"+y+"周年！"]
];
const idx=()=>LANGS.findIndex(x=>x[0]===L)-1;
function tr(s){const t=s.trim();if(L==="zh"||!t)return s;let v;
if(L==="ja"){v=JA[t];if(!v)for(const[re,f]of PJ){const m=t.match(re);if(m){v=f(...m.slice(1));break}}}
else{let r=D[t];if(!r)for(const[re,f]of P){const m=t.match(re);if(m){r=f(...m.slice(1));break}}v=r&&r[idx()]}
return v?s.replace(t,()=>v):s}
const IC={"💣": "bomb", "🎂": "cake", "📍": "pin", "🗺": "map", "🧭": "compass", "🔍": "search", "🖼": "image", "⏳": "hourglass", "🔔": "bell", "🏆": "trophy", "🎉": "party"};
const ICON_RE=new RegExp("^\\s*("+Object.keys(IC).join("|")+")\\uFE0F?\\s*");
const AT=["placeholder","aria-label","title"];
function pass(){ob.disconnect();
const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),L2=[];let n;
while(n=w.nextNode()){if(!/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))L2.push(n)}
L2.forEach(n=>{const v=n.nodeValue,o=n.__t===v?n.__o:v;n.__o=o;let r=tr(o);
const pv=n.previousSibling,mine=pv&&pv.__ic?pv:null,m=r.match(ICON_RE);
if(m){let s=mine;if(!s){s=document.createElement("span");s.__ic=1;s.setAttribute("aria-hidden","true");n.parentNode.insertBefore(s,n)}s.className="pxi "+IC[m[1]];r=r.slice(m[0].length)}
else if(mine)mine.remove();
n.__t=r;if(r!==v)n.nodeValue=r});
document.querySelectorAll("[placeholder],[aria-label],[title]").forEach(e=>AT.forEach(a=>{if(!e.hasAttribute(a))return;
const v=e.getAttribute(a),k="__t_"+a,ok="__o_"+a,o=e[k]===v?e[ok]:v;e[ok]=o;const r=tr(o);e[k]=r;if(r!==v)e.setAttribute(a,r)}));
document.documentElement.lang=L==="zh"?"zh-Hant":L;
ob.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AT})}
let raf=0;const ob=new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(pass)});
const st=document.createElement("style");
st.textContent=".pxi{display:inline-block;width:1.1em;height:1.1em;vertical-align:-.2em;margin-right:.35em;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat}.btn .pxi,.sbtn .pxi{margin-right:0}.pxi.bomb{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='3' y='3' width='4' height='1'/%3E%3Crect x='2' y='4' width='6' height='1'/%3E%3Crect x='1' y='5' width='8' height='3'/%3E%3Crect x='2' y='8' width='6' height='1'/%3E%3Crect x='3' y='9' width='4' height='1'/%3E%3Crect x='4' y='2' width='2' height='1'/%3E%3Crect x='5' y='1' width='1' height='1'/%3E%3Crect x='6' y='0' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.cake{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='4' y='1' width='2' height='2'/%3E%3Crect x='1' y='3' width='8' height='2'/%3E%3Crect x='0' y='6' width='10' height='3'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.pin{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='3' y='0' width='4' height='1'/%3E%3Crect x='2' y='1' width='6' height='1'/%3E%3Crect x='2' y='2' width='2' height='2'/%3E%3Crect x='6' y='2' width='2' height='2'/%3E%3Crect x='2' y='4' width='6' height='1'/%3E%3Crect x='3' y='5' width='4' height='1'/%3E%3Crect x='3' y='6' width='4' height='1'/%3E%3Crect x='4' y='7' width='2' height='2'/%3E%3Crect x='4' y='9' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.map{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='0' y='2' width='10' height='1'/%3E%3Crect x='0' y='8' width='10' height='1'/%3E%3Crect x='0' y='3' width='1' height='5'/%3E%3Crect x='9' y='3' width='1' height='5'/%3E%3Crect x='3' y='3' width='1' height='5'/%3E%3Crect x='6' y='3' width='1' height='5'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.compass{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='3' y='1' width='1' height='1'/%3E%3Crect x='6' y='1' width='1' height='1'/%3E%3Crect x='2' y='2' width='1' height='1'/%3E%3Crect x='7' y='2' width='1' height='1'/%3E%3Crect x='1' y='3' width='1' height='1'/%3E%3Crect x='8' y='3' width='1' height='1'/%3E%3Crect x='0' y='4' width='1' height='2'/%3E%3Crect x='9' y='4' width='1' height='2'/%3E%3Crect x='1' y='6' width='1' height='1'/%3E%3Crect x='8' y='6' width='1' height='1'/%3E%3Crect x='2' y='7' width='1' height='1'/%3E%3Crect x='7' y='7' width='1' height='1'/%3E%3Crect x='3' y='8' width='1' height='1'/%3E%3Crect x='6' y='8' width='1' height='1'/%3E%3Crect x='4' y='9' width='2' height='1'/%3E%3Crect x='4' y='4' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.search{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='2' y='0' width='4' height='1'/%3E%3Crect x='1' y='1' width='1' height='1'/%3E%3Crect x='6' y='1' width='1' height='1'/%3E%3Crect x='0' y='2' width='1' height='3'/%3E%3Crect x='7' y='2' width='1' height='3'/%3E%3Crect x='1' y='5' width='1' height='1'/%3E%3Crect x='6' y='5' width='1' height='1'/%3E%3Crect x='2' y='6' width='4' height='1'/%3E%3Crect x='7' y='6' width='1' height='1'/%3E%3Crect x='8' y='7' width='1' height='1'/%3E%3Crect x='8' y='8' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.image{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='0' y='1' width='10' height='1'/%3E%3Crect x='0' y='8' width='10' height='1'/%3E%3Crect x='0' y='2' width='1' height='6'/%3E%3Crect x='9' y='2' width='1' height='6'/%3E%3Crect x='2' y='6' width='2' height='1'/%3E%3Crect x='3' y='5' width='2' height='1'/%3E%3Crect x='4' y='6' width='3' height='1'/%3E%3Crect x='6' y='3' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.hourglass{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='1' y='0' width='8' height='1'/%3E%3Crect x='2' y='1' width='1' height='1'/%3E%3Crect x='7' y='1' width='1' height='1'/%3E%3Crect x='3' y='2' width='1' height='1'/%3E%3Crect x='6' y='2' width='1' height='1'/%3E%3Crect x='4' y='3' width='2' height='2'/%3E%3Crect x='3' y='5' width='1' height='1'/%3E%3Crect x='6' y='5' width='1' height='1'/%3E%3Crect x='2' y='6' width='1' height='1'/%3E%3Crect x='7' y='6' width='1' height='1'/%3E%3Crect x='1' y='7' width='1' height='2'/%3E%3Crect x='8' y='7' width='1' height='2'/%3E%3Crect x='1' y='9' width='8' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.bell{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='3' y='1' width='4' height='1'/%3E%3Crect x='2' y='2' width='6' height='3'/%3E%3Crect x='1' y='5' width='8' height='2'/%3E%3Crect x='0' y='7' width='10' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.trophy{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='2' y='0' width='6' height='4'/%3E%3Crect x='0' y='1' width='2' height='2'/%3E%3Crect x='8' y='1' width='2' height='2'/%3E%3Crect x='3' y='4' width='4' height='1'/%3E%3Crect x='4' y='5' width='2' height='2'/%3E%3Crect x='3' y='7' width='4' height='1'/%3E%3Crect x='2' y='8' width='6' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.party{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='2'/%3E%3Crect x='0' y='4' width='2' height='2'/%3E%3Crect x='8' y='4' width='2' height='2'/%3E%3Crect x='4' y='8' width='2' height='2'/%3E%3Crect x='3' y='3' width='4' height='4'/%3E%3C/g%3E%3C/svg%3E\")}"+"#lang{position:absolute;top:14px;right:16px;z-index:3;font:700 13px/1.4 inherit;color:#fff;background:rgba(6,40,110,.45);border:1px solid rgba(255,255,255,.5);border-radius:99px;padding:5px 12px;cursor:pointer}#lang option{color:#0b2a5b;background:#fff}#lang:focus-visible{outline:3px solid #e0245e;outline-offset:2px}";
document.head.appendChild(st);
const sel=document.createElement("select");sel.id="lang";sel.setAttribute("aria-label","Language");
sel.innerHTML=LANGS.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join("");sel.value=L;
sel.onchange=()=>{L=sel.value;try{localStorage.setItem("lang",L)}catch(e){}pass()};
document.querySelector(".hero").appendChild(sel);
window.addEventListener("load",pass);pass();
})();
