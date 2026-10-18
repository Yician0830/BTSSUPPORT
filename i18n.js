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
"已複製，可以貼到社群":["Copied. Paste it on social media.","복사되었습니다. SNS에 붙여넣으세요."],"地圖載入失敗，請檢查網路":["Map failed to load. Check your connection.","지도를 불러오지 못했습니다. 네트워크를 확인하세요."],"已儲存圖片":["Image saved","이미지를 저장했습니다"],
"演唱會歌曲空耳／應援":["Concert Songs: Soramimi & Fanchants","콘서트 곡 空耳·응원법"],
"整理每首歌的空耳和應援法，現場跟著喊":["Soramimi and fanchants for each song, to follow along live","곡별 空耳(음차 가사)와 응원법 정리, 현장에서 함께 외쳐요"],
"歌曲空耳／應援":["Songs: Soramimi & Fanchants","곡 空耳·응원법"],
"演唱會歌曲的空耳與應援法整理":["Soramimi and fanchants for concert songs","콘서트 곡의 空耳와 응원법 정리"],
"搜尋歌名、專輯、演唱會、空耳或應援":["Search song, album, concert or chant…","곡명, 앨범, 콘서트, 응원법 검색"],
"搜尋歌曲":["Search songs","곡 검색"],
"選擇歌曲":["Choose song","곡 선택"],
"還沒有收錄歌曲":["No songs yet","등록된 곡이 없습니다"],
"找不到符合的歌曲":["No matching songs","일치하는 곡이 없습니다"],
"空耳":["Soramimi","空耳(음차 가사)"],
"應援法":["Fanchants","응원법"],
"影片／參考 ↗":["Video / reference ↗","영상/참고 ↗"],
"藍色＝大聲喊　紅色＝跟著唱":["Blue = shout loudly　Red = sing along","파랑 = 크게 외치기　빨강 = 따라 부르기"],
"從 7 秒開始，依序喊成員全名：":["From 7 seconds, shout each member's full name in order:","7초부터 멤버 풀네임을 차례로 외쳐요:"],
"？導覽":["? Guide","? 가이드"],
"重看導覽":["Replay guide","가이드 다시 보기"],
"詳情 ›":["Details ›","자세히 ›"],
"全部公告 ›":["All announcements ›","전체 공지 ›"],
"關閉公告":["Close announcement","공지 닫기"],
"略過":["Skip","건너뛰기"],
"‹ 上一步":["‹ Back","‹ 이전"],
"下一步 ›":["Next ›","다음 ›"],
"開始逛":["Start browsing","시작하기"],
"完成":["Done","완료"],
"巡演應援":["Tour Projects","투어 응원"],
"ARIRANG 巡演各城市的應援整理，依日期和類型找。":["Projects for each ARIRANG tour city. Browse by date and type.","ARIRANG 투어 도시별 응원 정리. 날짜와 유형으로 찾아보세요."],
"各成員生日與出道周年的應援整理。":["Birthday and debut anniversary projects by member.","멤버별 생일·데뷔 기념일 응원 정리."],
"每首歌的應援法，現場照著喊。藍色是大聲喊，紅色是跟著唱。":["Fanchants for each song to follow live. Blue = shout loudly, red = sing along.","곡별 응원법을 현장에서 따라 하세요. 파랑은 크게 외치기, 빨강은 따라 부르기."],
"加到手機桌面":["Add to Home Screen","홈 화면에 추가"],
"像 App 一樣一點就開，全螢幕、沒有網址列。":["Opens with one tap like an app — full screen, no address bar.","앱처럼 한 번에 열리고 전체 화면, 주소창이 없어요."],
"你現在是在 Threads／IG／LINE 這類 App 裡面開的，這裡不能加到桌面。":["You're in an in-app browser (Threads / IG / LINE), which can't add to the home screen.","지금 Threads·IG·LINE 같은 앱 안에서 열려 있어 홈 화면에 추가할 수 없어요."],
"先點右上角的選單，選「用瀏覽器開啟」，再照下面做：":["Tap the menu at the top right, choose “Open in browser”, then follow these steps:","오른쪽 위 메뉴에서 '브라우저로 열기'를 선택한 뒤 아래를 따라 하세요:"],
"照下面做就可以：":["Just follow these steps:","아래를 따라 하세요:"],
"用 Safari 開啟這個網頁":["Open this page in Safari","Safari로 이 페이지를 엽니다"],
"點畫面下方的「分享」鈕（方框加向上箭頭）":["Tap the “Share” button at the bottom (a box with an up arrow)","화면 아래의 '공유' 버튼(상자와 위쪽 화살표)을 누릅니다"],
"往下滑，點「加入主畫面」":["Scroll down and tap “Add to Home Screen”","아래로 스크롤해 '홈 화면에 추가'를 누릅니다"],
"右上角按「新增」，桌面就會出現圖示":["Tap “Add” at the top right and the icon appears on your home screen","오른쪽 위 '추가'를 누르면 홈 화면에 아이콘이 생겨요"],
"用 Chrome 開啟這個網頁":["Open this page in Chrome","Chrome으로 이 페이지를 엽니다"],
"點右上角的「⋮」選單":["Tap the “⋮” menu at the top right","오른쪽 위 '⋮' 메뉴를 누릅니다"],
"點「加到主畫面」或「安裝應用程式」":["Tap “Add to Home screen” or “Install app”","'홈 화면에 추가' 또는 '앱 설치'를 누릅니다"],
"按「新增」或「安裝」，桌面就會出現圖示":["Tap “Add” or “Install” and the icon appears on your home screen","'추가' 또는 '설치'를 누르면 홈 화면에 아이콘이 생겨요"],
"切換城市":["Switch city","도시 전환"],
"先選你要看的城市，每個城市有各自的應援清單。":["Pick a city first. Each city has its own project list.","먼저 도시를 선택하세요. 도시마다 응원 목록이 따로 있어요."],
"選日期":["Pick a date","날짜 선택"],
"再選演唱會日期，只看當天可以去的應援。":["Then pick a concert date to see only projects you can visit that day.","공연 날짜를 고르면 그날 갈 수 있는 응원만 보여요."],
"這排可以左右滑，選咖啡廳、LED 廣告車等類型。":["Swipe this row sideways to choose cafés, LED ad trucks and other types.","이 줄은 좌우로 밀 수 있어요. 카페, LED 광고 차량 등 유형을 고르세요."],
"地圖、路線、搜尋":["Map, route, search","지도·경로·검색"],
"地圖總覽看位置，路線規劃排行程，搜尋及排序找特定活動。":["Map shows locations, route planner organizes your trip, search and sort find specific projects.","지도로 위치 확인, 경로 계획으로 일정 짜기, 검색·정렬로 원하는 응원 찾기."],
"點愛心收藏，之後按上方「我的收藏」就能只看這些。":["Tap the heart to save, then tap “Favorites” at the top to see only those.","하트를 눌러 저장하고, 위의 '즐겨찾기'를 누르면 저장한 것만 볼 수 있어요."],
"打卡集章":["Check in & collect stamps","체크인·스탬프"],
"去過就按打卡，會蓋章，也會記下日期。":["Tap check-in after you visit to get a stamp and record the date.","다녀온 뒤 체크인을 누르면 도장이 찍히고 날짜가 기록돼요."],
"存成圖片":["Save as image","이미지로 저장"],
"把集章簿存成圖片，分享到社群。":["Save your stamp book as an image and share it on social media.","스탬프북을 이미지로 저장해 SNS에 공유하세요."],
"選成員":["Choose member","멤버 선택"],
"選要看的成員，預設是最近要生日的那位。":["Choose a member. The default is whoever has the next birthday.","볼 멤버를 고르세요. 기본값은 생일이 가장 가까운 멤버예요."],
"選地區":["Choose region","지역 선택"],
"再依地區縮小範圍。":["Then narrow it down by region.","지역으로 범위를 좁혀 보세요."],
"搜尋":["Search","검색"],
"輸入歌名、專輯、演唱會、空耳或應援內容，快速找到想看的歌。":["Type a song, album, concert, soramimi or chant text to quickly find a song.","곡명, 앨범, 콘서트, 空耳, 응원 내용을 입력해 원하는 곡을 빠르게 찾으세요."],
"選歌曲":["Pick a song","곡 선택"],
"點歌名按鈕切換，一次只顯示一首。":["Tap a song button to switch. One song is shown at a time.","곡명 버튼을 눌러 전환하세요. 한 번에 한 곡만 표시돼요."],
"空耳與應援法":["Soramimi & fanchants","空耳와 응원법"],
"點標題可以展開或收合。藍色＝大聲喊，紅色＝跟著唱，橘色是提醒。":["Tap a heading to expand or collapse. Blue = shout loudly, red = sing along, orange = reminder.","제목을 누르면 펼치고 접을 수 있어요. 파랑=크게 외치기, 빨강=따라 부르기, 주황=안내."],
"官方應援（不含空耳）":["Official fanchant (no soramimi)","공식 응원법 (空耳 제외)"],
"影片／參考連結":["Video / reference link","영상/참고 링크"],
"點這個按鈕開啟影片或參考網址，會另開新分頁。":["Tap this button to open the video or reference page. It opens in a new tab.","이 버튼을 누르면 영상이나 참고 페이지가 새 탭에서 열려요."],
"把 BTS 應援地圖加到主畫面":["Add BTS Fan Project Map to your Home Screen","BTS 응원 지도를 홈 화면에 추가"],
"像 App 一樣一點就開，全螢幕沒有網址列":["Opens with one tap like an app — full screen, no address bar","앱처럼 한 번에 열리고 전체 화면, 주소창이 없어요"],
"怎麼加？":["How?","추가 방법"],
"收起":["Hide","접기"],
"關閉":["Close","닫기"],
"一般模式":["Normal mode","일반 모드"],
"KTV 模式":["KTV mode","KTV 모드"],
"跟著影片自動捲動　點兩下跳到那一句":["Scrolls with the video — double-tap a line to jump to it","영상에 맞춰 자동 스크롤 · 두 번 탭하면 그 줄로 이동"],
"這首歌還沒有時間碼，暫時無法使用 KTV 模式":["This song has no timecodes yet, so KTV mode isn't available","이 곡은 아직 타임코드가 없어 KTV 모드를 쓸 수 없어요"],
"背景音樂":["Background music","배경 음악"],
"進站會自動播放背景音樂（手機要先點一下畫面才會出聲）。不想聽就點這個 ♪ 關掉，之後不會再自動播。":["Background music plays automatically (on phones, tap the screen once to hear it). Tap this ♪ to turn it off — it won't autoplay again next time.","배경 음악이 자동으로 재생돼요 (휴대폰에서는 화면을 한 번 터치해야 소리가 나요). 듣기 싫으면 이 ♪를 눌러 끄세요. 다음부터는 자동 재생되지 않아요."],
"開啟背景音樂":["Turn on background music","배경 음악 켜기"],
"關閉背景音樂":["Turn off background music","배경 음악 끄기"],
"官方應援歌詞 ↗":["Official fanchant lyrics ↗","공식 응원법 가사 ↗"],
"有附影片的歌可以切換成 KTV 模式，歌詞會跟著影片自動捲動，點兩下某一句就跳到那裡。":["Songs with a video can switch to KTV mode: lyrics scroll along with the video — double-tap a line to jump to it.","영상이 있는 곡은 KTV 모드로 전환할 수 있어요. 가사가 영상에 맞춰 자동 스크롤되고, 한 줄을 두 번 탭하면 그 부분으로 이동해요."],
"官方應援歌詞":["Official fanchant lyrics","공식 응원법 가사"],
"點這個按鈕開啟官方公布的應援歌詞，會另開新分頁。":["Tap this button to open the officially released fanchant lyrics. It opens in a new tab.","이 버튼을 누르면 공식 공개된 응원법 가사가 새 탭에서 열려요."],
"← 全部專輯":["← All albums","← 전체 앨범"],
"點封面進去，就會看到那張專輯或那場演唱會的歌曲。":["Tap a cover to see the songs of that album or concert.","커버를 누르면 해당 앨범 또는 콘서트의 곡이 나와요."],
"選專輯／演唱會":["Choose album or concert","앨범·콘서트 선택"],
"離線中，顯示的是上次存下來的內容":["Offline — showing the last saved content","오프라인 — 마지막으로 저장된 내용을 표시 중"],
"離線中：影片和 KTV 模式要有網路才能用，下面的空耳與應援法還是可以看。":["Offline: video and KTV mode need a connection. The soramimi and fanchant text below is still available.","오프라인: 영상과 KTV 모드는 네트워크가 필요해요. 아래 空耳·응원법은 그대로 볼 수 있어요."],
"字級":["Text size","글자 크기"],"縮小字級":["Smaller text","글자 작게"],"放大字級":["Larger text","글자 크게"],
"依專輯":["By album","앨범별"],"依演唱會":["By concert","콘서트별"],
"← 全部演唱會":["← All concerts","← 전체 콘서트"],
"全選":["Select all","전체 선택"],"全不選":["Deselect all","전체 해제"],"列入路線":["Include in route","경로에 포함"],
"依專輯／依演唱會":["By album / By concert","앨범별 / 콘서트별"],
"切換分類：依專輯看每張專輯的歌，依演唱會看每一場的演出歌單，歌名前面的編號是演出順序。":["Switch the grouping: by album, or by concert to see each show's setlist. The number before a song is its show order.","분류를 전환해요. 앨범별은 앨범의 곡, 콘서트별은 공연별 셋리스트이며 곡명 앞 번호가 공연 순서예요."],
"按 A− 或 A＋ 調整歌詞大小，現場看不清楚時可以放大。":["Tap A− or A＋ to resize the lyrics. Handy when it's hard to read at the venue.","A− 또는 A＋로 가사 크기를 조절하세요. 현장에서 잘 안 보일 때 유용해요."],
"上一首":["Previous song","이전 곡"],
"下一首":["Next song","다음 곡"],
"選擇專輯":["Choose an album","앨범 선택"],
"其他":["Other","기타"],
"↓ 回到目前這句":["↓ Back to current line","↓ 현재 줄로 돌아가기"],
"沒有更多應援了":["No more fanchants","더 이상 응원법이 없어요"],
"下一個：":["Next: ","다음: "],
"藍・大聲喊":["Blue · shout loudly","파랑 · 크게 외치기"],
"紅・跟著唱":["Red · sing along","빨강 · 따라 부르기"],
"橘・提醒":["Orange · reminder","주황 · 안내"],
"點一下跳到那裡；彩色刻度是應援位置":["Tap to jump there. Colored ticks mark fanchant spots.","탭하면 그 위치로 이동해요. 색 눈금은 응원 위치예요."],
"練習":["Practice","연습"],
"播放影片後，音符落到線上時，點下面對應的按鈕（鍵盤：F／J 或 ←／→）":["Play the video, then tap the matching button when a note reaches the line (keyboard: F / J or ← / →)","영상을 재생한 뒤 음표가 선에 닿을 때 아래 해당 버튼을 누르세요 (키보드: F／J 또는 ←／→)"],
"這首歌還沒有可以練習的應援（要有影片和藍／紅色時間碼）":["No fanchants to practice for this song yet (needs a video and blue/red timecodes)","이 곡은 아직 연습할 응원법이 없어요 (영상과 파랑/빨강 타임코드가 필요해요)"],
"今日應援籤":["Today's Fanchant Fortune","오늘의 응원 운세"],
"每天抽一張，看今天的應援運勢和練習任務":["Draw one a day for your fanchant luck and a practice mission.","하루에 한 장, 오늘의 응원 운세와 연습 미션을 확인해요."],
"應援運勢":["Fanchant luck","응원 운세"],
"幸運應援":["Lucky chant","행운의 응원"],
"今日任務":["Today's mission","오늘의 미션"],
"今日推薦歌":["Song of the day","오늘의 추천곡"],
"去練這首":["Practice this song","이 곡 연습하기"],
"複製文字":["Copy text","텍스트 복사"],
"已複製":["Copied","복사됨"],
"把一首歌的藍色應援全部背熟":["Memorize every blue chant of one song","한 곡의 파랑 응원법을 전부 외우기"],
"完整練一次應援，不看字幕":["Run through a full fanchant without the captions","자막 없이 응원법을 한 번 끝까지 연습하기"],
"約一位朋友，一起對喊一次":["Ask a friend to chant it together once","친구와 함께 한 번 외쳐 보기"],
"檢查應援棒的電量和配對":["Check your lightstick's battery and pairing","응원봉 배터리와 페어링 확인하기"],
"喝杯水，顧好明天要喊的嗓子":["Drink some water and look after your voice","물 한 잔 마시고 목 챙기기"],
"在練習模式拿到 A 以上":["Get an A or higher in Practice mode","연습 모드에서 A 이상 받기"],
"大吉":["Great luck","대길"],
"中吉":["Good luck","중길"],
"小吉":["Small luck","소길"],
"吉":["Luck","길"],
"末吉":["Slight luck","말길"],
"把一首歌的紅色段落完整跟唱一遍":["Sing along to every red part of one song","한 곡의 빨강 구간을 끝까지 따라 부르기"],
"錄下自己喊應援的聲音，聽聽節奏準不準":["Record yourself chanting and check your timing","응원하는 목소리를 녹음해 박자 확인하기"],
"整理好演唱會要帶的東西":["Pack everything you need for the concert","콘서트에 가져갈 물건 챙기기"],
"把今天的應援運勢分享給一位 ARMY 朋友":["Share today's fortune with an ARMY friend","오늘의 응원 운세를 ARMY 친구에게 공유하기"],
"在歌曲頁找一首沒練過的歌":["Find a song you haven't practiced yet","아직 연습 안 한 곡 하나 찾아보기"],
"睡前再複習一次明天要喊的部分":["Review tomorrow's chants once more before bed","자기 전에 내일 외칠 부분 한 번 더 복습하기"],
"連續抽籤":["Draw streak","연속 뽑기"],
"成員圖鑑":["Member collection","멤버 도감"],
"天":["days","일"],
"成員圖鑑集滿了！":["Collection complete!","도감을 모두 모았어요!"],
"生日週特別籤":["Birthday-week special","생일 주간 특별 운세"],
"去生日應援頁，看看有哪些應援":["Check out the birthday projects","생일 응원 페이지에서 응원을 확인하기"],
"去看生日應援":["See birthday projects","생일 응원 보기"]
};
const P=[
[/^(\d+) 首歌$/,n=>[n+(n==="1"?" song":" songs"),n+"곡"]],
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
[/^勾選要排進路線的地點，沒勾的不會列入。已選 (\d+) \/ (\d+) 個$/,(a,b)=>["Tick the stops to include; unticked ones are left out. Selected "+a+" / "+b,"경로에 넣을 장소를 체크하세요. 체크 해제한 곳은 제외돼요. 선택 "+a+" / "+b+"곳"]],
[/^🎂 今天是 (.+) 的生日！$/,m=>["🎂 Today is "+m+"'s birthday!","🎂 오늘은 "+m+"의 생일!"]],
[/^🎉 下一個：BTS 出道 (\d+) 週年 (\S+)，還有 (\d+) 天$/,(y,d,k)=>["🎉 Next: BTS "+y+"th debut anniversary "+d+" — "+k+" days to go","🎉 다음: BTS 데뷔 "+y+"주년 "+d+" — "+k+"일 남음"]],
[/^🎉 今天是 BTS 出道 (\d+) 週年！$/,y=>["🎉 Today is BTS's "+y+"th debut anniversary!","🎉 오늘은 BTS 데뷔 "+y+"주년!"]]
];
let L=localStorage.getItem("lang");
try{const q=new URLSearchParams(location.search).get("lang");if(q)L=q}catch(e){}
if(!LANGS.some(x=>x[0]===L)){const n=(navigator.language||"zh").toLowerCase();L=n.startsWith("ko")?"ko":n.startsWith("ja")?"ja":n.startsWith("zh")?"zh":"en"}
const JA={};Object.keys(D).forEach((k,i)=>JA[k]=["BTS 応援マップ", "ARIRANG ツアー ファン応援マップ", "BTS バースデー応援マップ", "このページは非公式のファン有志による応援情報のまとめです。主催者の見解は当サイトを代表するものではありません。各主催者の最新のお知らせや会場のルールに従い、ご自身の判断でご参加ください。", "見たい応援を選んでください", "メンバー別の誕生日・BTSデビュー記念日の応援まとめ", "高雄国家体育場（ワールドゲームズ主競技場）・MRTレッドラインR17 世運駅", "啓德メインスタジアム（啓德スポーツパーク）", "♡ お気に入り", "♥ お気に入り", "ご注意", "使い方", "応援スポットへ向かう際は交通安全にご注意ください。写真のために車道へ出たり、バス停や歩道に長時間とどまったりしないでください。", "通路をふさいだり、他の方やお店の出入りを妨げたりしないでください。", "お店や他のファンを尊重し、列では秩序を守ってください。予約や証明が必要な応援は主催者の規定に従ってください。", "撮影・チェックイン後はゴミを持ち帰り、装飾・ステッカー・展示物を壊したりぶつけたりしないでください。", "応援の内容・時間・場所は急に変更されることがあります。出発前に主催者の最新のお知らせをご確認ください。", "カード右上のハートでお気に入りに保存し、上部の「お気に入り」を押すと保存した応援だけを表示できます。", "応援スポットに着いたら「💣 チェックイン」を押すとカードにスタンプが押され、スタンプ帳にも進み具合が記録されます。", "お気に入りとチェックインの記録はお使いのブラウザにのみ保存され、アップロードされません。", "端末やブラウザを変えたり、閲覧データを消去したり、プライベートモードを使うと記録は表示されません。Threads・IG・LINEなどのアプリ内ブラウザも通常のブラウザと異なる場合があります。同じブラウザでの利用をおすすめします。", "ARIRANG ツアー応援", "高雄・香港公演の応援マップ。日付タブとチェックインスタンプ付き", "誕生日応援", "メンバー別の誕生日とBTSデビュー記念日の応援まとめ（カウントダウン付き）", "← ホームへ", "高雄", "香港", "🗺 マップ", "🧭 ルート作成", "🔍 検索・並べ替え", "カテゴリ", "ステータス", "並べ替え", "開始が近い順", "新着順", "日付順", "名前", "適用", "リセット", "絞り込みを解除", "すべて", "全日程", "開催中", "開催予定", "終了", "未定", "応援企画", "LED広告トラック", "バス停広告", "LEDビジョン", "応援カフェ", "カフェ", "ポップアップ", "展示", "無料", "受取条件なし", "フォーム入力必須", "チケット提示必須", "ファン証明必須", "郵送可", "代理受取可", "情報追って追加", "実物写真あり", "店舗の最低利用額あり", "場所", "時間", "備考", "💣 チェックイン", "🎂 チェックイン", "✔ チェックイン済み", "📍 地図", "🖼 画像で保存", "お気に入り", "トップへ戻る", "都市を選択", "日付を選択", "メンバーを選択", "地域を選択", "タイプで絞り込み", "応援名・主催・場所・タグで検索…", "🏆 思い出の壁", "現在、開催中・開催予定の応援はありません。下の思い出の壁をご覧ください。", "お気に入りはまだありません", "該当する応援がありません。条件を変えてお試しください。", "誕生日応援はまだ登録されていません。情報提供をお待ちしています！", "この都市の応援はまだ登録されていません。情報提供をお待ちしています！", "応援情報を提供する", "徒歩", "公共交通機関", "車", "移動手段", "Googleマップでルートを開く", "1番目から最後まで順に回ります。同じ場所は自動的にまとめられ、Googleマップは最大10か所まで対応します。お気に入りと順番はこのブラウザにのみ保存されます。", "現在の絞り込み結果のうち座標のある応援を表示します。位置はおおよそのものですので、正確な場所はGoogleマップでご確認ください。", "当サイトは非公式のまとめです。情報は各主催者のお知らせを基準としてください。", "コピーしました。SNSに貼り付けてください", "地図を読み込めませんでした。ネットワークをご確認ください", "画像を保存しました","コンサート曲 空耳・応援法","曲ごとの空耳と応援法をまとめました。現場で一緒に叫ぼう","曲の空耳・応援法","コンサート曲の空耳と応援法のまとめ","曲名・アルバム・コンサート・応援で検索","曲を検索","曲を選択","まだ曲が登録されていません","該当する曲がありません","空耳","応援法","動画・参考 ↗","青＝大きな声で叫ぶ　赤＝一緒に歌う","7秒から、メンバーのフルネームを順に叫ぶ：","? ガイド","ガイドをもう一度見る","詳細 ›","お知らせ一覧 ›","お知らせを閉じる","スキップ","‹ 戻る","次へ ›","見てみる","完了","ツアー応援","ARIRANGツアー各都市の応援まとめ。日付とタイプで探せます。","メンバー別の誕生日とデビュー記念日の応援まとめ。","曲ごとの応援法を現場で一緒に。青は大きな声で叫ぶ、赤は一緒に歌う。","ホーム画面に追加","アプリのようにワンタップで開き、全画面でアドレスバーもありません。","今はThreads・IG・LINEなどのアプリ内で開いているため、ホーム画面に追加できません。","右上のメニューから「ブラウザで開く」を選び、以下の手順に従ってください：","以下の手順で追加できます：","Safariでこのページを開く","画面下の「共有」ボタン（四角と上向き矢印）をタップ","下にスクロールして「ホーム画面に追加」をタップ","右上の「追加」を押すと、ホーム画面にアイコンが表示されます","Chromeでこのページを開く","右上の「⋮」メニューをタップ","「ホーム画面に追加」または「アプリをインストール」をタップ","「追加」または「インストール」を押すと、ホーム画面にアイコンが表示されます","都市を切り替え","まず都市を選んでください。都市ごとに応援リストがあります。","日付を選ぶ","次に公演日を選ぶと、その日に行ける応援だけが表示されます。","この列は左右にスワイプできます。カフェやLED広告トラックなどのタイプを選べます。","マップ・ルート・検索","マップで場所を確認、ルート作成で行程を組み、検索・並べ替えで特定の応援を探せます。","ハートでお気に入りに保存し、上の「お気に入り」を押すと保存したものだけ表示されます。","チェックインとスタンプ","行ったらチェックインを押すとスタンプが押され、日付も記録されます。","画像で保存","スタンプ帳を画像で保存してSNSでシェアできます。","メンバーを選ぶ","見たいメンバーを選びます。初期設定は次に誕生日を迎えるメンバーです。","地域を選ぶ","さらに地域で絞り込めます。","検索","曲名・アルバム・コンサート・空耳・応援の内容を入力して、見たい曲をすばやく探せます。","曲を選ぶ","曲名ボタンで切り替えます。一度に表示されるのは1曲です。","空耳と応援法","見出しをタップで開閉できます。青＝大きな声で叫ぶ、赤＝一緒に歌う、オレンジ＝お知らせ。","公式応援（空耳なし）","動画・参考リンク","このボタンで動画や参考ページを開きます。新しいタブで開きます。","BTS 応援マップをホーム画面に追加","アプリのようにワンタップで開き、全画面でアドレスバーも表示されません","追加方法","閉じる","閉じる","通常モード","KTVモード","動画に合わせて自動スクロール。ダブルタップでその行へジャンプ","この曲はまだタイムコードがないため、KTVモードは使えません","バックグラウンドミュージック","BGMが自動で流れます（スマホでは画面を一度タップすると音が出ます）。聴きたくないときはこの♪をタップしてオフにしてください。次回からは自動再生されません。","BGMをオンにする","BGMをオフにする","公式応援歌詞 ↗","動画付きの曲はKTVモードに切り替えられます。歌詞が動画に合わせて自動スクロールし、行をダブルタップするとその場面へジャンプします。","公式応援歌詞","このボタンで公式の応援歌詞を開きます。新しいタブで開きます。","← すべてのアルバム","ジャケットをタップすると、そのアルバムやコンサートの曲が表示されます。","アルバム／コンサートを選ぶ","オフライン中：最後に保存した内容を表示しています","オフライン中：動画とKTVモードにはネット接続が必要です。下の空耳と応援法はそのまま見られます。","文字サイズ","文字を小さく","文字を大きく","アルバム別","コンサート別","← すべてのコンサート","すべて選択","すべて解除","ルートに含める","アルバム別／コンサート別","分類を切り替えます。アルバム別はアルバムごとの曲、コンサート別は公演ごとのセットリストで、曲名の前の番号が演奏順です。","A−／A＋で歌詞の大きさを調整できます。会場で見づらいときに便利です。","前の曲","次の曲","アルバムを選ぶ","その他","↓ 現在の行に戻る","これ以上の応援はありません","次：","青・大きな声で叫ぶ","赤・一緒に歌う","オレンジ・お知らせ","タップでその位置へジャンプ。色つきの目盛りは応援の位置です。","練習","動画を再生し、ノーツがラインに来たら下の対応ボタンをタップ（キーボード：F／J または ←／→）","この曲にはまだ練習できる応援がありません（動画と青／赤のタイムコードが必要です）","今日の応援おみくじ","1日1枚、今日の応援運と練習ミッションをチェック。","応援運","ラッキー応援","今日のミッション","今日のおすすめ曲","この曲を練習","テキストをコピー","コピーしました","1曲分の青い応援を全部覚える","字幕なしで応援を最後まで通して練習する","友達を誘って一緒にコールしてみる","ペンライトの電池とペアリングを確認する","水を一杯飲んで喉をいたわる","練習モードでA以上を取る","大吉","中吉","小吉","吉","末吉","1曲分の赤い部分を最後まで一緒に歌う","応援する声を録音してタイミングを確認する","コンサートに持っていく物を準備する","今日の応援運をARMYの友達にシェアする","まだ練習していない曲を1曲探す","寝る前に明日叫ぶ部分をもう一度復習する","連続で引いた日数","メンバー図鑑","日","図鑑をコンプリート！","バースデーウィーク特別おみくじ","誕生日応援ページで応援をチェックする","誕生日応援を見る"][i]);
window.I18N={add(k,e,o,j){if(!k)return;if(e||o)D[k]=[e||k,o||e||k];if(j)JA[k]=j},refresh(){try{pass()}catch(e){}}};
/* 應援籤新增字串（用 add 加，不會影響上面日文的對應順序） */
I18N.add("每天抽一張，看今天的應援運勢和練習任務。","Draw one a day to see today's fanchant fortune and practice mission.","하루에 한 장 뽑아 오늘의 응원 운세와 연습 미션을 확인해요.","1日1枚引いて、今日の応援運勢と練習ミッションをチェックしよう。");
I18N.add("抽籤中…","Drawing…","뽑는 중…","引いています…");
I18N.add("點一下可略過","Tap to skip","눌러서 건너뛰기","タップでスキップ");
I18N.add("點上面的成員，自選今天的籤","Tap a member above to choose today's fortune","위 멤버를 눌러 오늘의 운세를 직접 고르세요","上のメンバーをタップして今日のおみくじを選べます");
I18N.add("✓ 今日已抽","✓ Drawn today","✓ 오늘 뽑음","✓ 今日は引いた");
I18N.add("● 今天還沒抽","● Not drawn yet","● 아직 안 뽑음","● まだ引いていない");
I18N.add("去看巡演應援","Go to tour projects","투어 응원 보러 가기","ツアー応援を見に行く");
I18N.add("去看進行中的生日應援","See ongoing birthday projects","진행 중인 생일 응원 보기","開催中の誕生日応援を見る");
I18N.add("挑一首歌，只看歌詞不看影片喊一次","Pick a song and call the chant from the lyrics alone, without the video","노래 한 곡을 골라 영상 없이 가사만 보고 응원법을 외쳐 보세요","1曲選んで、動画なしで歌詞だけ見てコールしてみよう");
I18N.add("用練習模式挑戰一首新歌","Try a new song in practice mode","연습 모드에서 새로운 노래에 도전하세요","練習モードで新しい曲に挑戦しよう");
I18N.add("把今天推薦的歌完整練一遍","Practice today's recommended song all the way through","오늘의 추천곡을 처음부터 끝까지 연습하세요","今日のおすすめ曲を最後まで練習しよう");
I18N.add("跟著影片，把紅色段落唱兩遍","Sing along with the video and do the red parts twice","영상을 따라 빨간색 구간을 두 번 불러 보세요","動画に合わせて赤い部分を2回歌おう");
I18N.add("戴上耳機，專心練一首歌的應援","Put on headphones and focus on one song's chants","이어폰을 끼고 한 곡의 응원법에 집중해 보세요","イヤホンをつけて、1曲のコールに集中しよう");
I18N.add("把藍色和紅色的差別，講給朋友聽","Explain the blue vs. red parts to a friend","파란색과 빨간색의 차이를 친구에게 설명해 보세요","青と赤の違いを友達に説明してみよう");
I18N.add("用 KTV 模式唱一首喜歡的歌","Sing a favorite song in KTV mode","KTV 모드로 좋아하는 노래를 불러 보세요","KTVモードで好きな曲を歌おう");
I18N.add("試著把應援棒配對一次","Try pairing your lightstick once","응원봉 페어링을 한번 해 보세요","ペンライトのペアリングを一度試そう");
I18N.add("確認票券、證件和手機電量","Check your ticket, ID, and phone battery","티켓, 신분증, 휴대폰 배터리를 확인하세요","チケット・身分証・スマホの充電を確認しよう");
I18N.add("查好從住處到場館的交通方式","Look up how to get from home to the venue","집에서 공연장까지 가는 교통편을 알아 두세요","自宅から会場までの行き方を調べておこう");
I18N.add("準備好零錢、行動電源和小包包","Pack coins, a power bank and a small bag","잔돈, 보조배터리, 작은 가방을 챙기세요","小銭・モバイルバッテリー・小さなバッグを準備しよう");
I18N.add("看一下天氣，決定要穿什麼","Check the weather and plan your outfit","날씨를 확인하고 입을 옷을 정하세요","天気を見て服装を決めよう");
I18N.add("確認手機有足夠的儲存空間可以拍照","Make sure your phone has enough storage for photos","사진을 찍을 수 있게 휴대폰 저장 공간을 확인하세요","写真用にスマホの空き容量を確認しよう");
I18N.add("和朋友約好集合地點","Agree on a meeting spot with friends","친구와 모일 장소를 정해 두세요","友達と待ち合わせ場所を決めておこう");
I18N.add("傳一首今天推薦的歌給朋友","Send a friend today's recommended song","오늘의 추천곡을 친구에게 보내 주세요","今日のおすすめ曲を友達に送ろう");
I18N.add("在收藏裡加入一個想去的應援","Add a project you want to visit to your favorites","가고 싶은 응원 하나를 즐겨찾기에 추가하세요","行きたい応援を1つお気に入りに追加しよう");
I18N.add("看看生日應援頁，找一位成員的應援","Browse the birthday projects page and find one for a member","생일 응원 페이지에서 멤버 한 명의 응원을 찾아보세요","誕生日応援ページでメンバー1人の応援を探そう");
I18N.add("用「存成圖片」把今天的籤分享出去","Share today's fortune with “Save as image”","'이미지로 저장'으로 오늘의 운세를 공유하세요","「画像として保存」で今日のおみくじをシェアしよう");
I18N.add("給一位 ARMY 朋友一句鼓勵的話","Say something encouraging to an ARMY friend","ARMY 친구에게 응원의 한마디를 건네세요","ARMYの友達に励ましの一言を送ろう");
I18N.add("做 5 分鐘的伸展，讓身體放鬆","Do 5 minutes of stretching","5분 스트레칭으로 몸을 풀어 주세요","5分間ストレッチして体をほぐそう");
I18N.add("早點睡，明天才有精神","Go to bed early for more energy tomorrow","내일을 위해 일찍 자요","明日のために早めに寝よう");
I18N.add("出門走一走，順便練體力","Take a walk to build up stamina","산책하며 체력을 길러 보세요","散歩して体力をつけよう");
I18N.add("深呼吸三次，再喊一次最大聲的段落","Take three deep breaths, then call out the loudest part","심호흡 세 번 후, 가장 큰 소리로 외치는 구간을 해 보세요","深呼吸を3回して、一番大きく叫ぶ部分をやってみよう");
I18N.add("今天吃好一點，補充體力","Eat a good meal to keep your energy up","든든하게 먹고 체력을 보충하세요","しっかり食べて体力を補給しよう");
I18N.add("去今天進行中的應援地點打卡","Visit a project that's running today and check in","오늘 진행 중인 응원 장소에 가서 체크인하세요","今日開催中の応援スポットでチェックインしよう");
I18N.add("把快開始的應援加入收藏","Favorite a project that starts soon","곧 시작하는 응원을 즐겨찾기에 추가하세요","もうすぐ始まる応援をお気に入りに追加しよう");
I18N.add("去看正在進行的生日應援","Check out the birthday projects running now","진행 중인 생일 응원을 확인하세요","開催中の誕生日応援をチェックしよう");
I18N.add("確認演出日的交通和集合時間","Confirm transport and meet-up time for show day","공연 당일 교통편과 모이는 시간을 확인하세요","公演日の交通と集合時間を確認しよう");
I18N.add("演唱會就在這週，把應援再複習一次","The show is this week — review your chants once more","공연이 이번 주예요. 응원법을 한 번 더 복습하세요","公演は今週！コールをもう一度おさらいしよう");
I18N.add("規劃演唱會前後要去哪些應援","Plan which projects to visit before or after the show","공연 전후에 갈 응원을 계획하세요","公演前後に回る応援を計画しよう");
I18N.add("今天就是演唱會！記得喝水、顧好嗓子","Show day! Stay hydrated and look after your voice","공연 당일이에요! 물 많이 마시고 목을 아끼세요","いよいよ公演日！水分補給して喉をいたわろう");
I18N.add("你抽到什麼？","What did you draw?","당신은 무엇을 뽑았나요?","あなたは何を引いた？");
I18N.add("幸運色","Lucky color","행운의 색","ラッキーカラー");
I18N.add("幸運號碼","Lucky number","행운의 숫자","ラッキーナンバー");
I18N.add("今日語錄","Quote of the day","오늘의 한마디","今日のひとこと");
I18N.add("粉紅","Pink","분홍","ピンク");
I18N.add("薰衣草紫","Lavender","라벤더","ラベンダー");
I18N.add("天空藍","Sky blue","하늘색","スカイブルー");
I18N.add("薄荷綠","Mint","민트","ミント");
I18N.add("奶油黃","Butter yellow","버터 옐로","バターイエロー");
I18N.add("蜜桃橘","Peach","피치","ピーチ");
I18N.add("銀灰","Silver","실버","シルバー");
I18N.add("今天的你，聲音一定傳得到","Today, your voice will carry","오늘 당신의 목소리는 분명 닿을 거예요","今日のあなたの声は、きっと届く");
I18N.add("慢慢來，節奏會跟上你","Take your time — the rhythm will catch up","천천히 하세요, 리듬이 따라올 거예요","ゆっくりで大丈夫、リズムはついてくる");
I18N.add("和大家一起喊，就不會緊張","Chant together and the nerves fade","다 같이 외치면 긴장이 풀려요","みんなで叫べば緊張もほぐれる");
I18N.add("今天適合開口大聲喊","A good day to shout it out","오늘은 크게 외치기 좋은 날","今日は大きな声を出すのにぴったり");
I18N.add("多聽一次，就會多記住一句","Every listen sticks one more line","한 번 더 들으면 한 구절 더 기억해요","もう一度聴けば、また一節覚えられる");
I18N.add("好心情是最棒的應援棒","A good mood is the best lightstick","좋은 기분이 최고의 응원봉이에요","いい気分は最高のペンライト");
I18N.add("今天會遇到一起應援的好夥伴","You may meet a great fellow fan today","오늘 함께 응원할 좋은 친구를 만날지도 몰라요","今日は一緒に応援する仲間に出会えるかも");
I18N.add("不用完美，開心最重要","No need to be perfect — enjoy it","완벽하지 않아도 괜찮아요, 즐기는 게 제일이에요","完璧じゃなくていい、楽しむことが一番");
I18N.add("出門前再檢查一次口袋","Check your pockets once more before you go","나가기 전에 주머니를 한 번 더 확인하세요","出かける前にもう一度ポケットを確認しよう");
I18N.add("等待的時間，也是應援的一部分","The waiting is part of the cheering too","기다리는 시간도 응원의 일부예요","待つ時間も応援の一部");
I18N.add("今天的你，剛剛好","You're just right today","오늘의 당신, 딱 좋아요","今日のあなたは、ちょうどいい");
I18N.add("把喜歡的歌再聽一遍吧","Play your favorite song one more time","좋아하는 노래를 한 번 더 들어 보세요","好きな曲をもう一度聴いてみよう");
I18N.add("今天適合約朋友一起練習","A good day to practice with friends","오늘은 친구와 함께 연습하기 좋아요","今日は友達と一緒に練習するのにぴったり");
I18N.add("喉嚨喝點溫水會更舒服","Warm water will soothe your throat","따뜻한 물이 목에 좋아요","温かい飲み物で喉をいたわろう");
I18N.add("一點小小的勇氣，就是很大的力量","A little courage goes a long way","작은 용기가 큰 힘이 돼요","小さな勇気が大きな力になる");
I18N.add("今天的幸運，從翻開這一頁開始","Today's luck starts the moment you open this page","오늘의 행운은 이 페이지를 연 순간부터 시작돼요","今日の幸運は、このページを開いた瞬間から");
I18N.add("手機長按圖片可儲存或分享；電腦請按右鍵另存圖片","On a phone, press and hold the image to save or share it. On a computer, right-click to save.","휴대폰에서는 이미지를 길게 눌러 저장하거나 공유하세요. 컴퓨터에서는 오른쪽 클릭으로 저장하세요.","スマホでは画像を長押しして保存・共有できます。パソコンでは右クリックで保存してください。");
I18N.add("應援遊戲","Fanchant Game","응원 게임","応援ゲーム");
I18N.add("獲得新徽章","New badge earned","새 배지 획득","新しいバッジを獲得");
I18N.add("★ 隱藏徽章解鎖！ ★","★ Hidden badge unlocked! ★","★ 숨겨진 배지 해제! ★","★ 隠しバッジ解除！ ★");
I18N.add("同時還解鎖了其他徽章","Other badges were unlocked too","다른 배지도 함께 해제됐어요","ほかのバッジも同時に解除されました");
I18N.add("查看徽章","View badges","배지 보기","バッジを見る");
I18N.add("演唱會制霸","Concert Conqueror","콘서트 정복","コンサート制覇");
I18N.add("演唱會分類的徽章全部解鎖","Unlock every Concert badge","콘서트 배지를 모두 해제","コンサートのバッジをすべて解除");
I18N.add("生日制霸","Birthday Conqueror","생일 정복","誕生日制覇");
I18N.add("生日分類的徽章全部解鎖","Unlock every Birthday badge","생일 배지를 모두 해제","誕生日のバッジをすべて解除");
I18N.add("幸運籤制霸","Lucky Draw Conqueror","행운 뽑기 정복","おみくじ制覇");
I18N.add("幸運籤分類的徽章全部解鎖","Unlock every Lucky Draw badge","행운 뽑기 배지를 모두 해제","おみくじのバッジをすべて解除");
I18N.add("遊戲制霸","Game Conqueror","게임 정복","ゲーム制覇");
I18N.add("應援遊戲分類的徽章全部解鎖","Unlock every Cheer Game badge","응원 게임 배지를 모두 해제","応援ゲームのバッジをすべて解除");
I18N.add("隱藏獵人","Hidden Hunter","숨겨진 배지 헌터","隠しバッジハンター");
I18N.add("解鎖所有隱藏徽章","Unlock every hidden badge","숨겨진 배지를 모두 해제","隠しバッジをすべて解除");
I18N.add("開幕第一人","Opening Day Crew","개막 첫 주자","初日の一番乗り");
I18N.add("在應援開始的第一天打卡","Check in on a project's very first day","응원 시작 첫날에 체크인","応援の初日にチェックイン");
I18N.add("壓線達陣","Photo Finish","막판 스퍼트","ギリギリセーフ");
I18N.add("在應援結束的最後一天打卡","Check in on a project's very last day","응원 마지막 날에 체크인","応援の最終日にチェックイン");
I18N.add("三日全勤","Perfect Attendance","3일 개근","3日皆勤");
I18N.add("在同一座城市，每一場演唱會日當天都打卡","Check in on every concert day in the same city","같은 도시의 모든 공연일 당일에 체크인","同じ都市の全公演日に当日チェックイン");
I18N.add("言出必行","Walk the Talk","말한 대로 실천","有言実行");
I18N.add("收藏的應援全部都打過卡（至少收藏 5 個）","Check in on every project you've favorited (at least 5 saved)","즐겨찾기한 응원을 모두 체크인 (최소 5개)","お気に入りの応援を全部チェックイン（5件以上）");
I18N.add("收藏家","Collector","수집가","コレクター");
I18N.add("收藏 10 個應援","Favorite 10 projects","응원 10개 즐겨찾기","応援を10件お気に入り");
I18N.add("常駐站民","Home Screen Resident","상주 주민","常駐ユーザー");
I18N.add("把網站加到手機桌面，並從桌面圖示開啟","Add the site to your home screen and open it from the icon","사이트를 홈 화면에 추가하고 아이콘으로 열기","サイトをホーム画面に追加し、アイコンから開く");
I18N.add("在同一座城市，每一場演唱會日都現場報到","Check in on-site on every concert day in the same city","같은 도시의 모든 공연일에 현장 체크인","同じ都市のすべての公演日に現地でチェックイン");
I18N.add("雙城現場","Both Cities Live","두 도시 현장","二都市現場");
I18N.add("高雄和香港的演唱會都現場報到過","Checked in on-site at both the Kaohsiung and Hong Kong concerts","가오슝과 홍콩 콘서트 모두 현장 체크인","高雄と香港のコンサートの両方で現地チェックイン");
I18N.add("一日制霸","One-Day Sweep","하루 제패","1日制覇");
I18N.add("把任一天分頁的應援全部打卡","Check in every project on any one day tab","하루 탭의 응원을 모두 체크인","いずれか1日のタブの応援を全部チェックイン");
I18N.add("連抽三天","3-Day Draw Streak","3일 연속 뽑기","3日連続おみくじ");
I18N.add("連抽七天","7-Day Draw Streak","7일 연속 뽑기","7日連続おみくじ");
I18N.add("熱心站民","Helpful Member","열정 멤버","お助けメンバー");
I18N.add("點開「我要投稿」或「錯誤回報」表單","Open the “Submit a project” or “Report an error” form","'응원 정보 제보' 또는 '오류 신고' 양식 열기","「投稿する」または「エラー報告」フォームを開く");
I18N.add("普通","Common","일반","ノーマル");
I18N.add("稀有","Rare","희귀","レア");
I18N.add("★ 隱藏","★ Hidden","★ 히든","★ 隠し");
I18N.add("已解鎖","Unlocked","해제됨","解除済み");
I18N.add("沒有符合的徽章","No matching badges","해당하는 배지가 없어요","該当するバッジはありません");
I18N.add("分類","Category","분류","カテゴリ");
I18N.add("進度","Progress","진행도","進み具合");
I18N.add("銅級","Bronze tier","동 등급","銅ランク");
I18N.add("銀級","Silver tier","은 등급","銀ランク");
I18N.add("金級","Gold tier","금 등급","金ランク");
I18N.add("有新版本，點此更新","New version available — tap to update","새 버전이 있어요. 눌러서 업데이트","新しいバージョンがあります。タップして更新");
I18N.add("更新中…","Updating…","업데이트 중…","更新中…");
I18N.add("初次通關","First Clear","첫 클리어","初クリア");
I18N.add("在應援遊戲通關（B 級以上）1 首歌","Clear 1 song (rank B or higher) in the cheer game","응원 게임에서 1곡 클리어 (B 등급 이상)","応援ゲームで1曲クリア（Bランク以上）");
I18N.add("通關 3 首","3 Songs Cleared","3곡 클리어","3曲クリア");
I18N.add("在應援遊戲通關（B 級以上）3 首歌","Clear 3 songs (rank B or higher) in the cheer game","응원 게임에서 3곡 클리어 (B 등급 이상)","応援ゲームで3曲クリア（Bランク以上）");
I18N.add("零 MISS","Zero MISS","MISS 제로","ノーMISS");
I18N.add("在應援遊戲打出零 MISS","Finish a song with zero MISS in the cheer game","응원 게임에서 MISS 없이 클리어","応援ゲームでノーMISSを達成");
I18N.add("全 PERFECT","All PERFECT","올 퍼펙트","オールPERFECT");
I18N.add("在應援遊戲打出全 PERFECT","Get all PERFECT in the cheer game","응원 게임에서 올 퍼펙트 달성","応援ゲームでオールPERFECTを達成");
I18N.add("遊戲四星","Four Stars","별 4개","星4つ");
I18N.add("同一首歌拿滿 4 個 ★ 成就","Earn all 4 ★ achievements on one song","한 곡에서 ★ 업적 4개 모두 달성","1曲で★実績を4つ全部獲得");
I18N.add("在應援遊戲拿到 A 以上","Get an A or higher in the Fanchant Game","응원 게임에서 A 이상 받기","応援ゲームでA以上を取る");
I18N.add("用應援遊戲挑戰一首新歌","Try a new song in the Fanchant Game","응원 게임으로 새로운 노래에 도전하세요","応援ゲームで新しい曲に挑戦しよう");
I18N.add("這首歌還沒有可以玩的應援遊戲（要有影片和藍／紅色時間碼）","This song has no Fanchant Game yet (it needs a video and blue/red timecodes)","이 곡은 아직 응원 게임이 없어요 (영상과 파랑/빨강 타임코드가 필요해요)","この曲にはまだ応援ゲームがありません（動画と青／赤のタイムコードが必要です）");
I18N.add("來玩這首","Play this song","이 곡 플레이하기","この曲で遊ぶ");
I18N.add("新紀錄！","New record!","신기록!","新記録！");
I18N.add("首次成績","First result","첫 기록","初記録");
I18N.add("最佳成績","Best","최고 기록","ベスト");
I18N.add("遊戲最佳成績","Game best","게임 최고 기록","ゲームのベスト");
I18N.add("遊戲成績","Game results","게임 기록","ゲームの成績");
I18N.add("歌詞裡的藍色、紅色段落會變成音符，影片播到哪音符就落到哪；音符到線時點對應的按鈕，結束後會評等級並記下最佳成績。","Blue and red parts of the lyrics become notes that fall as the video plays. Tap the matching button when a note reaches the line. You get a grade at the end, and your best result is saved.","가사의 파랑·빨강 구간이 음표가 되어 영상에 맞춰 떨어져요. 음표가 선에 닿으면 해당 버튼을 누르세요. 끝나면 등급이 매겨지고 최고 기록이 저장돼요.","歌詞の青・赤の部分がノーツになり、動画に合わせて落ちてきます。ノーツがラインに来たら対応するボタンをタップ。終了後に評価が出て、ベストが保存されます。");
I18N.add("玩過應援遊戲的歌，歌名旁會顯示最佳等級（S、A、B、C）。","For songs you've played, the best grade (S, A, B, C) shows next to the song name.","플레이한 곡은 곡명 옆에 최고 등급(S, A, B, C)이 표시돼요.","プレイした曲は、曲名の横にベスト評価（S・A・B・C）が表示されます。");
I18N.add("通關","Cleared","클리어","クリア");
I18N.add("全曲通關","All cleared","전곡 클리어","全曲クリア");
I18N.add("通關進度","Clear progress","클리어 진행도","クリア進行度");
I18N.add("全曲通關！","All songs cleared!","전곡 클리어!","全曲クリア！");
I18N.add("B 級以上算通關，只計算有應援遊戲的歌","B rank or higher counts as cleared. Only songs with a Fanchant Game are counted.","B 등급 이상이면 클리어예요. 응원 게임이 있는 곡만 계산돼요.","B評価以上でクリア。応援ゲームのある曲のみ対象です。");
I18N.add("演唱會全曲通關！","Concert fully cleared!","콘서트 전곡 클리어!","コンサート全曲クリア！");
I18N.add("演唱會通關","Concert clear","콘서트 클리어","コンサートクリア");
I18N.add("在演唱會裡，把每首有應援遊戲的歌都玩到 B 級以上，就能全曲通關。","In a concert, get B rank or higher on every song with a Fanchant Game to clear the whole setlist.","콘서트에서 응원 게임이 있는 모든 곡을 B 등급 이상으로 클리어하면 전곡 클리어예요.","コンサートで、応援ゲームのある全曲をB評価以上にするとセットリスト全曲クリアです。");
I18N.add("選出這次演唱會最期待聽到的三首歌","Pick the three songs you most want to hear at the concert","이번 콘서트에서 가장 듣고 싶은 노래 세 곡을 골라 보세요","今回のコンサートで一番聴きたい曲を3曲選ぼう");
I18N.add("把演唱會當天的集合資訊整理到手機備忘錄","Save the show-day meet-up info in your phone's notes","공연 당일 모이는 정보를 휴대폰 메모에 정리해 두세요","公演当日の集合情報をスマホのメモにまとめよう");
I18N.add("演唱會結束後，記錄今天最難忘的一個瞬間","After the show, write down your most unforgettable moment of the day","공연이 끝나면 오늘 가장 잊을 수 없는 순간을 기록하세요","公演後、今日いちばん忘れられない瞬間を記録しよう");
I18N.add("把這次演唱會的回憶整理成一張照片或一段文字","Turn your concert memories into a photo or a few lines of text","이번 콘서트의 추억을 사진 한 장이나 글로 정리해 보세요","今回のコンサートの思い出を1枚の写真か短い文章にまとめよう");
I18N.add("分享一首最近最想在演唱會聽到的 BTS 歌曲","Share one BTS song you most want to hear at the concert lately","요즘 콘서트에서 가장 듣고 싶은 BTS 노래 한 곡을 공유하세요","最近コンサートで一番聴きたいBTSの曲を1曲シェアしよう");
I18N.add("問一位 ARMY 朋友最喜歡哪一首演唱會曲目","Ask an ARMY friend which concert song they love most","ARMY 친구에게 가장 좋아하는 콘서트 곡이 무엇인지 물어보세요","ARMYの友達に、コンサートで一番好きな曲を聞いてみよう");
I18N.add("回顧一次讓自己印象深刻的追星回憶","Look back on a fan memory that left a deep impression on you","인상 깊었던 팬 활동 추억을 한 번 돌아보세요","印象に残っているファン活動の思い出を振り返ってみよう");
I18N.add("推薦一首自己認為值得更多人認識的 BTS 歌曲","Recommend a BTS song you think more people should know","더 많은 사람이 알았으면 하는 BTS 노래 한 곡을 추천해 보세요","もっと多くの人に知ってほしいBTSの曲を1曲おすすめしよう");
I18N.add("新手村村民","Newbie Village Resident","초보 마을 주민","初心者の村の住人");
I18N.add("阿米棒點燈人","ARMY Bomb Lighter","아미밤 점등자","ARMY BOMB点灯係");
I18N.add("七色圖鑑解鎖者","Seven-Color Collection Unlocker","일곱 빛깔 도감 해금자","七色図鑑アンロッカー");
I18N.add("敲碗巡演先鋒","Tour-Craving Pioneer","투어를 애타게 기다리는 선봉","ツアー待望の先鋒");
I18N.add("紫色狂熱份子","Purple Fanatic","보라빛 광팬","紫の熱狂ファン");
I18N.add("每日精神糧食獲得者","Daily Soul Food Recipient","매일 마음의 양식을 얻은 사람","毎日の心の糧を得た人");
I18N.add("Hope World 榮譽永久居民","Hope World Honorary Permanent Resident","Hope World 명예 영구 거주민","Hope World 名誉永住民");
I18N.add("陪伴彼此的永恆星星","The Eternal Star Beside Each Other","서로의 곁을 지키는 영원한 별","寄り添い合う永遠の星");
I18N.add("阿米棒點燈人・連續 3 天","ARMY Bomb Lighter · 3-day streak","아미밤 점등자 · 3일 연속","ARMY BOMB点灯係・3日連続");
I18N.add("七色圖鑑解鎖者・連續 7 天","Seven-Color Collection Unlocker · 7-day streak","일곱 빛깔 도감 해금자 · 7일 연속","七色図鑑アンロッカー・7日連続");
I18N.add("敲碗巡演先鋒・連續 14 天","Tour-Craving Pioneer · 14-day streak","투어를 애타게 기다리는 선봉 · 14일 연속","ツアー待望の先鋒・14日連続");
I18N.add("紫色狂熱份子・連續 30 天","Purple Fanatic · 30-day streak","보라빛 광팬 · 30일 연속","紫の熱狂ファン・30日連続");
I18N.add("每日精神糧食獲得者・連續 50 天","Daily Soul Food Recipient · 50-day streak","매일 마음의 양식을 얻은 사람 · 50일 연속","毎日の心の糧を得た人・50日連続");
I18N.add("Hope World 榮譽永久居民・連續 100 天","Hope World Honorary Permanent Resident · 100-day streak","Hope World 명예 영구 거주민 · 100일 연속","Hope World 名誉永住民・100日連続");
I18N.add("陪伴彼此的永恆星星・連續 365 天","The Eternal Star Beside Each Other · 365-day streak","서로의 곁을 지키는 영원한 별 · 365일 연속","寄り添い合う永遠の星・365日連続");
I18N.add("七色圖鑑解鎖者・連續 7 天且集滿成員圖鑑","Seven-Color Collection Unlocker · 7-day streak and a complete member collection","일곱 빛깔 도감 해금자 · 7일 연속 + 멤버 도감 완성","七色図鑑アンロッカー・7日連続＋メンバー図鑑コンプリート");
I18N.add("解鎖新稱號！","New title unlocked!","새 칭호 해금!","新しい称号を獲得！");
I18N.add("稱號","Title","칭호","称号");
I18N.add("幸運色・號碼","Lucky color & number","행운의 색・숫자","ラッキーカラー・ナンバー");
I18N.add("今日幸運曲","Lucky song of the day","오늘의 행운의 곡","今日のラッキーソング");
I18N.add("查看圖鑑","View collection","도감 보기","図鑑を見る");
I18N.add("大聲喊","Shout loudly","크게 외치기","大きな声で叫ぶ");
I18N.add("大聲唱","Sing loudly","크게 부르기","大きな声で歌う");
I18N.add("今日幸運籤","Today's Lucky Fortune","오늘의 행운 운세","今日のラッキーおみくじ");
I18N.add("★ GOLDEN HOUR・今天是限定大吉 ★","★ GOLDEN HOUR · Today's special Great Luck ★","★ GOLDEN HOUR · 오늘은 한정 대길 ★","★ GOLDEN HOUR・今日は限定大吉 ★");
I18N.add("我的收藏","My collection","내 컬렉션","マイコレクション");
I18N.add("下一個稱號","Next title","다음 칭호","次の称号");
I18N.add("應援新手","Fanchant Rookie","응원 새내기","応援ビギナー");
I18N.add("應援見習生","Fanchant Trainee","응원 연습생","応援見習い");
I18N.add("應援達人","Fanchant Pro","응원 달인","応援達人");
I18N.add("應援傳說","Fanchant Legend","응원 전설","応援レジェンド");
I18N.add("應援見習生・連續 3 天","Fanchant Trainee · 3-day streak","응원 연습생 · 3일 연속","応援見習い・3日連続");
I18N.add("應援達人・連續 7 天","Fanchant Pro · 7-day streak","응원 달인 · 7일 연속","応援達人・7日連続");
I18N.add("應援傳說・連續 30 天","Fanchant Legend · 30-day streak","응원 전설 · 30일 연속","応援レジェンド・30日連続");
/* 今日語錄擴充 */
I18N.add("今天也辛苦了，喝口水再繼續","Good work today, have some water first","오늘도 수고했어요, 물 한 모금 마시고 이어가요","今日もおつかれさま。水を一口飲んでから続けよう");
I18N.add("在同一個地方喊出來的聲音，會變成同一首歌","Voices shouted together become one song","같은 곳에서 외친 목소리가 하나의 노래가 돼요","同じ場所で叫んだ声は、ひとつの歌になる");
I18N.add("今天適合把應援棒擦乾淨","A good day to wipe your light stick clean","오늘은 응원봉을 깨끗이 닦기 좋은 날이에요","今日は応援棒をきれいに拭くのにぴったり");
I18N.add("先從最熟的那首開始練就對了","Just start with the song you know best","가장 익숙한 노래부터 연습하면 돼요","まずは一番よく知っている曲から練習しよう");
I18N.add("慢慢跟，總有一個瞬間會突然合拍","Follow slowly, and one moment it all clicks","천천히 따라가면 어느 순간 딱 맞아요","ゆっくりついていけば、ふっと合う瞬間が来る");
I18N.add("今天的你，值得一首喜歡的歌","You deserve a favorite song today","오늘의 당신은 좋아하는 노래 한 곡을 들을 자격이 있어요","今日のあなたには、好きな曲が似合う");
I18N.add("緊張也沒關係，大家都是一起的","Nerves are fine, everyone's in this together","긴장해도 괜찮아요, 모두 함께니까요","緊張しても大丈夫、みんな一緒だから");
I18N.add("今天適合認識一位新的 ARMY 朋友","A good day to meet a new ARMY friend","오늘은 새로운 아미 친구를 만나기 좋은 날이에요","今日は新しいARMYの友だちに出会えそう");
I18N.add("把想說的話，留給最大聲的那一段","Save what you want to say for the loudest part","하고 싶은 말은 가장 크게 외치는 구간에 담아요","言いたいことは、一番大きな声の場面に取っておこう");
I18N.add("好好休息，也是準備的一部分","Resting well is part of preparing","잘 쉬는 것도 준비의 일부예요","しっかり休むのも準備のうち");
I18N.add("今天走過的每一步，都會變成現場的力氣","Every step today becomes strength for the show","오늘 걸은 걸음마다 현장의 힘이 돼요","今日歩いた一歩一歩が、現場の力になる");
I18N.add("今天適合把心情寫下來","A good day to write your feelings down","오늘은 마음을 적어 두기 좋은 날이에요","今日は気持ちを書き留めるのにぴったり");
I18N.add("你的喜歡，是別人也看得見的光","Your love is a light others can see","당신의 좋아하는 마음은 다른 사람에게도 보이는 빛이에요","あなたの「好き」は、誰かにも見える光");
I18N.add("不用跟上所有人，跟上自己的節奏就好","No need to match everyone, just keep your own rhythm","모두를 따라갈 필요 없어요, 내 리듬만 지켜요","みんなに合わせなくていい、自分のリズムでOK");
I18N.add("今天的好運，藏在一首很久沒聽的歌裡","Today's luck hides in a song you haven't heard in ages","오늘의 행운은 오랫동안 못 들은 노래 속에 숨어 있어요","今日の幸運は、久しぶりに聴く曲の中にある");
I18N.add("出門前，對自己說一聲加油","Before heading out, cheer yourself on","나가기 전에 스스로에게 파이팅을 외쳐요","出かける前に、自分に「頑張れ」と声をかけよう");
I18N.add("今天適合把照片整理一下","A good day to sort through your photos","오늘은 사진을 정리하기 좋은 날이에요","今日は写真を整理するのにぴったり");
I18N.add("再等一下，期待也是一種快樂","Wait a little more, anticipation is joy too","조금만 더 기다려요, 기대하는 것도 즐거움이에요","もう少し待とう、楽しみにする時間も幸せ");
I18N.add("今天的你，已經很努力了","You've already tried hard today","오늘의 당신은 이미 충분히 노력했어요","今日のあなたは、もう十分頑張ってる");
I18N.add("今天適合跟朋友聊聊最近的推歌","A good day to share your latest song picks with a friend","오늘은 친구와 요즘 추천곡을 이야기하기 좋은 날이에요","今日は友だちと最近のおすすめ曲を話すのにいい日");
I18N.add("喊出口的那一刻，緊張就會變成期待","The moment you shout, nerves turn into excitement","소리 내는 순간 긴장이 설렘으로 바뀌어요","声に出した瞬間、緊張はワクワクに変わる");
I18N.add("今天適合早一點出門，從容一點","A good day to leave a bit early and stay calm","오늘은 조금 일찍 나서서 여유를 가지기 좋은 날이에요","今日は少し早めに出て、余裕を持とう");
I18N.add("好好照顧自己，才能好好應援","Take care of yourself so you can cheer well","나를 잘 돌봐야 응원도 잘할 수 있어요","自分を大切にしてこそ、いい応援ができる");
I18N.add("今天適合重聽一次最喜歡的現場","A good day to rewatch your favorite live stage","오늘은 가장 좋아하는 라이브를 다시 보기 좋은 날이에요","今日は一番好きなライブをもう一度見る日");
I18N.add("一個小小的應援，也會被好好收下","Even a small cheer will be received warmly","작은 응원도 따뜻하게 전해져요","小さな応援でも、ちゃんと届く");
I18N.add("今天的每一次呼吸，都很適合喊出藍色","Every breath today is a good one for shouting blue","오늘의 모든 숨은 파란색을 외치기 좋아요","今日の呼吸は全部、青を叫ぶのにぴったり");
/* 今日語錄：一般生活語錄 */
I18N.add("今天先做好一件小事就好","Just do one small thing well today","오늘은 작은 일 하나만 잘 해내면 돼요","今日は小さなことをひとつやれば十分");
I18N.add("累了就停一下，路還在那裡","If you're tired, pause. The road will still be there","지치면 잠깐 멈춰요, 길은 그대로 있어요","疲れたら少し休もう、道はそこにあるから");
I18N.add("你已經走了比想像中更遠","You've come farther than you think","생각보다 훨씬 멀리 왔어요","思っているより、ずっと遠くまで来ている");
I18N.add("今天的天空，值得抬頭看一眼","Today's sky is worth a glance upward","오늘의 하늘은 한 번 올려다볼 만해요","今日の空は、見上げる価値がある");
I18N.add("對自己溫柔一點，也是一種勇氣","Being gentle with yourself takes courage too","나에게 다정해지는 것도 용기예요","自分にやさしくするのも、勇気のひとつ");
I18N.add("不急，好事都會慢慢到","No rush, good things arrive in their own time","서두르지 않아도 좋은 일은 천천히 와요","焦らなくていい、いいことはゆっくり来る");
I18N.add("今天適合吃一頓喜歡的東西","A good day to eat something you love","오늘은 좋아하는 음식을 먹기 좋은 날이에요","今日は好きなものを食べるのにぴったり");
I18N.add("把今天的開心記下來，以後會很有用","Write down today's happy moment, it'll help later","오늘의 기쁨을 적어 두면 나중에 큰 힘이 돼요","今日のうれしいことを書き留めておくと、あとで役に立つ");
I18N.add("沒做完的事，明天還有一次機會","What's unfinished gets another chance tomorrow","못 끝낸 일은 내일 또 기회가 있어요","終わらなかったことは、明日もう一度チャンスがある");
I18N.add("你不需要一直很厲害，也值得被喜歡","You don't have to be great all the time to deserve love","늘 대단하지 않아도 사랑받을 자격이 있어요","いつもすごくなくても、好きでいてもらっていい");
I18N.add("今天適合散個步，讓腦袋放空","A good day for a walk to clear your head","오늘은 산책하며 머리를 비우기 좋은 날이에요","今日は散歩して頭を空っぽにするのにいい日");
I18N.add("一點點進步，也是進步","A little progress is still progress","조금의 발전도 발전이에요","少しの進歩も、ちゃんと進歩");
I18N.add("難過的時候，先把水喝掉","When you're down, start by drinking some water","속상할 땐 먼저 물부터 마셔요","つらいときは、まず水を飲もう");
I18N.add("把手機放下十分鐘，看看四周","Put your phone down for ten minutes and look around","휴대폰을 10분만 내려놓고 주위를 둘러봐요","スマホを10分置いて、まわりを見てみよう");
I18N.add("今天的你，比昨天多懂了一點","Today you understand a little more than yesterday","오늘의 당신은 어제보다 조금 더 알게 됐어요","今日のあなたは、昨日より少しだけ分かっている");
I18N.add("小小的快樂，累積起來就很大","Small joys add up to something big","작은 기쁨이 모이면 아주 커져요","小さな楽しみも、積み重なれば大きくなる");
I18N.add("願你今天遇到的人都很溫柔","May everyone you meet today be kind","오늘 만나는 사람들이 모두 다정하길 바라요","今日出会う人が、みんなやさしい人でありますように");
I18N.add("睡一覺，事情會看起來不一樣","After a good sleep, things look different","푹 자고 나면 일이 다르게 보여요","ひと眠りすれば、物事は違って見える");
I18N.add("今天適合對自己說一聲辛苦了","A good day to tell yourself you did well","오늘은 스스로에게 수고했다고 말해 주기 좋은 날이에요","今日は自分に「おつかれさま」と言ってあげる日");
I18N.add("做得不完美，也算做到了","Not perfect still counts as done","완벽하지 않아도 해낸 거예요","完璧じゃなくても、やり遂げたことに変わりはない");
/* 成員語錄 */
I18N.add("找到你的名字，找到你的聲音，從說出自己開始","Find your name, find your voice by speaking yourself.","당신의 이름을 찾고, 스스로를 말하며 당신의 목소리를 찾으세요.","あなたの名前を見つけて。自分を語ることで、自分の声を見つけよう。");
I18N.add("昨天的我，也還是我","Yesterday's me is still me.","어제의 나도 여전히 나예요.","昨日の自分も、やっぱり自分。");
I18N.add("星星在夜最黑的時候最亮","Stars shine brightest when the night is darkest.","별은 밤이 가장 어두울 때 가장 밝게 빛나요.","星は夜が最も暗いときに一番輝く。");
I18N.add("七個來自韓國的男孩，因為對音樂的愛而在一起","Seven boys from Korea, united by love for music.","음악에 대한 사랑으로 하나 된 한국의 일곱 소년.","音楽への愛で結ばれた、韓国の7人の少年。");
I18N.add("好好珍惜自己、鼓勵自己、讓自己開心，是最重要的","Cherishing yourself, encouraging yourself and keeping yourself happy is the most important.","자신을 소중히 여기고, 스스로를 격려하고, 행복하게 지키는 것이 가장 중요해요.","自分を大切にして、励まして、幸せでいさせることが一番大事。");
I18N.add("面對改變，這一代不是害怕，而是說一聲「歡迎」","instead of fearing change, this generation says 'Welcome!'","변화를 두려워하는 대신 이 세대는 '환영해!'라고 말해요.","変化を恐れる代わりに、この世代は「ウェルカム！」と言う。");
I18N.add("那是一段珍貴的時光，雖然不是我們想要的，卻值得歡迎","It was a precious time, unwanted but welcome.","원치 않았지만 반가운, 소중한 시간이었어요.","望んだわけではなかったけれど、貴重な時間でした。");
I18N.add("我們只是相信自己、盡力而為、熱愛自己做的事","trust ourselves, and do my best, and love what I do","우리 자신을 믿고, 최선을 다하고, 하는 일을 사랑했어요.","自分を信じて、ベストを尽くして、していることを愛してきた。");
I18N.add("你們就是我們的宇宙","You're our universe.","여러분은 우리의 유니버스예요.","あなたたちは私たちのユニバース。");
I18N.add("我們互相安慰，一起想著可以做些什麼","We comforted each other and talked about what we could do together.","우리는 서로를 위로하며 함께 할 수 있는 일을 이야기했어요.","私たちは慰め合い、一緒にできることを話し合った。");
I18N.add("如果我在這裡放棄，我就不是自己人生的主角了","If I give up here, then I'm not the star of my life.","여기서 포기하면 나는 내 인생의 주인공이 아니야.","ここで諦めたら、自分の人生の主役じゃなくなる。");
I18N.add("我們的歌，成了我們想對彼此說的故事","Our songs became the stories we wanted to tell each other.","우리의 노래는 서로에게 하고 싶은 이야기가 됐어요.","私たちの歌は、お互いに伝えたい物語になった。");
I18N.add("我們只是想用音樂讓大家開心","We just wanted to make people happy with our music.","우리는 그저 음악으로 사람들을 행복하게 하고 싶었어요.","ただ音楽でみんなを幸せにしたかった。");
I18N.add("— 2018 聯合國演說（意譯）","— 2018 UN speech","— 2018 UN 연설 (의역)","— 2018年 国連スピーチ（意訳）");
I18N.add("— 2020 聯合國演說（意譯）","— 2020 UN speech","— 2020 UN 연설 (의역)","— 2020年 国連スピーチ（意訳）");
I18N.add("— 2021 聯合國演說（意譯）","— 2021 UN speech","— 2021 UN 연설 (의역)","— 2021年 国連スピーチ（意訳）");
I18N.add("— 2021 美國音樂獎（意譯）","— 2021 American Music Awards","— 2021 AMA 수상 소감 (의역)","— 2021年 AMA スピーチ（意訳）");
/* RM 語錄 */
I18N.add("也許我昨天犯了錯，但昨天的我還是我。今天，我就是我，帶著我所有的缺點與過錯。","Maybe I made mistakes yesterday, but yesterday's me is still me. Today, I am who I am, with all my faults and mistakes.","어제 실수를 했을지도 모르지만, 어제의 나도 여전히 나예요. 오늘의 나는 모든 결점과 잘못을 안고 있는 그대로의 나예요.","昨日は間違いを犯したかもしれないけれど、昨日の自分も自分。今日の自分は、欠点も過ちもすべて抱えた自分です。");
I18N.add("我們必須試著記得自己是誰，並正視真正的自己。","We must try to remember who we are, and face who we really are.","우리가 누구인지 기억하고, 진짜 나 자신을 마주하려고 노력해야 해요.","私たちは自分が何者かを思い出し、本当の自分と向き合わなければなりません。");
I18N.add("生活是有趣的，而活著更美好。","Life is fun, and being alive is even better.","삶은 재미있고, 살아 있다는 건 더 멋져요.","人生は面白い。そして、生きていることはもっと素晴らしい。");
I18N.add("勇敢說出自己，找回你的名字，也找回你的聲音。","Bravely speak yourself, find your name, and find your voice.","용기 내어 자신을 말하고, 당신의 이름과 목소리를 되찾아요.","勇気を出して自分を語り、あなたの名前を、そしてあなたの声を取り戻そう。");
/* Jin 語錄 */
I18N.add("誰知道呢？也許這一刻是給我們的機會。","Who knows? Maybe this moment is a chance for us.","누가 알겠어요? 어쩌면 이 순간이 우리에게 주어진 기회일지도 몰라요.","誰にも分からない。もしかしたら、この瞬間は私たちへのチャンスかもしれない。");
I18N.add("你的辛苦只要你知道就行了。","It's enough that you know how hard you've worked.","당신이 얼마나 고생했는지는 당신만 알면 충분해요.","あなたの頑張りは、あなた自身が知っていればそれでいい。");
I18N.add("努力不懈的人會成功的。","Those who keep working hard will succeed.","꾸준히 노력하는 사람은 성공할 거예요.","努力を続ける人は、きっと成功する。");
I18N.add("I'm the one I should love。","I'm the one I should love.","내가 사랑해야 할 사람은 바로 나예요.","私が愛すべきなのは、私自身。");
I18N.add("我生活在現在，是為了真實地感受我的感受。","I live in the present to truly feel what I feel.","나는 내 감정을 진짜로 느끼기 위해 지금을 살아요.","私は、自分の気持ちをありのままに感じるために、今を生きている。");
I18N.add("When something is delicious, it's zero calories.","When something is delicious, it's zero calories.","맛있는 건 0칼로리예요.","おいしいものは、ゼロカロリー。");
/* SUGA 語錄 */
I18N.add("沒有夢想也是正常的","It's perfectly normal not to have a dream.","꿈이 없는 것도 정상이에요.","夢がないのも普通のこと。");
I18N.add("雖害怕墜落，但不畏懼著陸","I may fear the fall, but I'm not afraid of landing.","추락은 두렵지만, 착지는 두렵지 않아요.","落ちるのは怖いけれど、着地は怖くない。");
I18N.add("因為有結局，所以過程才有意義","Because there's an ending, the journey has meaning.","결말이 있기에 과정에 의미가 있어요.","終わりがあるからこそ、過程に意味がある。");
I18N.add("害怕看到結局就什麼都做不了","If you fear seeing the ending, you can't do anything.","결말을 볼까 두려워하면 아무것도 할 수 없어요.","結末を見るのが怖くて、何もできなくなってしまう。");
/* j-hope 語錄 */
I18N.add("I'm your hope, you're my hope, I'm J-hope!","I'm your hope, you're my hope, I'm J-hope!","나는 너의 희망, 너는 나의 희망, 나는 제이홉!","I'm your hope, you're my hope, I'm J-hope!");
I18N.add("不要害怕失敗，因為無論何時，隨隨便便放棄的夢想，不是真正的夢想。","Don't be afraid of failure. A dream you can give up on so easily was never a real dream.","실패를 두려워하지 마세요. 아무 때나 쉽게 포기할 수 있는 꿈은 진짜 꿈이 아니에요.","失敗を恐れないで。いつでも簡単に諦められる夢は、本当の夢じゃない。");
I18N.add("愛自己所愛，愛自己所能！","Love what you love, love what you can do!","내가 사랑하는 것을 사랑하고, 내가 할 수 있는 것을 사랑해요!","自分が好きなものを愛し、自分にできることを愛そう！");
I18N.add("不努力就不會迎來美好果實","Without effort, there are no sweet fruits.","노력하지 않으면 좋은 열매도 맺지 못해요.","努力しなければ、いい実りは訪れない。");
/* Jimin 語錄 */
I18N.add("人生最珍貴的，絕對是緣分！","What's most precious in life is, without a doubt, the bonds we share!","인생에서 가장 소중한 건 단연코 인연이에요!","人生で一番大切なものは、間違いなくご縁！");
I18N.add("世上沒有白走的路，也沒有白吃的午餐！","No path walked is ever wasted, and there's no such thing as a free lunch!","세상에 헛걸음은 없고, 공짜 점심도 없어요!","この世に無駄な道はなく、タダのランチもない！");
/* V 語錄 */
I18N.add("只要是在努力的路上，就不會孤單！","As long as you're on the road of effort, you're never alone!","노력하는 길 위에 있다면 외롭지 않아요!","努力の道の上にいる限り、独りじゃない！");
I18N.add("I PURPLE YOU","I PURPLE YOU","I PURPLE YOU","I PURPLE YOU");
I18N.add("不是每天都要閃閃發光，能撐過今天就已經很厲害了。","You don't have to shine every day. Making it through today is already impressive.","매일 반짝일 필요는 없어요. 오늘을 버텨낸 것만으로도 충분히 대단해요.","毎日輝かなくてもいい。今日を乗り越えただけで、もうすごいこと。");
I18N.add("哪怕不站在高處也沒關係，即使和別人不一樣也沒關係，只要你幸福就好。","It's okay not to stand on high ground, and okay to be different from others. All that matters is that you're happy.","높은 곳에 서 있지 않아도, 남들과 달라도 괜찮아요. 당신이 행복하면 그걸로 충분해요.","高いところに立っていなくても、人と違っても大丈夫。あなたが幸せならそれでいい。");
/* Jungkook 語錄 */
I18N.add("如果改變不了，那就去享受，會享受的人是無法被戰勝的。","If you can't change it, enjoy it. Those who enjoy themselves can't be beaten.","바꿀 수 없다면 즐기세요. 즐기는 사람은 이길 수 없어요.","変えられないなら、楽しめばいい。楽しむ人には誰も勝てない。");
I18N.add("人生的花樣年華終會來臨。","The most beautiful moments of life will surely come.","인생의 화양연화는 반드시 찾아올 거예요.","人生の花様年華は、きっと訪れる。");
I18N.add("會成為大家的太陽，會成為一直閃閃發光的人！","I'll be everyone's sun, someone who always shines!","모두의 태양이 되고, 늘 반짝이는 사람이 될게요!","みんなの太陽になって、ずっと輝き続ける人になる！");
I18N.add("一開始我是黃金，然後發現我的身邊成了一片金黃。","At first I was the gold, and then I found everything around me turned golden.","처음엔 내가 황금이었는데, 어느새 내 주변이 온통 황금빛이 되었어요.","最初は自分が金だったのに、気づけば周りが一面の黄金色になっていた。");
/* 金閃卡 */
I18N.add("★ 金閃卡！今天是限定大吉 ★","★ Golden Shiny Card! Today's special Great Luck ★","★ 골든 샤이니 카드! 오늘은 한정 대길 ★","★ 金色シャイニーカード！今日は限定の大吉 ★");
I18N.add("閃卡圖鑑","Shiny collection","샤이니 도감","シャイニー図鑑");
I18N.add("金閃圖鑑集滿了！","Shiny collection complete!","샤이니 도감을 모두 모았어요!","シャイニー図鑑がそろいました！");
I18N.add("特別稱號","Special title","특별 칭호","特別称号");
I18N.add("金閃收藏家","Golden Shiny Collector","골든 샤이니 컬렉터","ゴールデンシャイニーコレクター");
I18N.add("★ 金閃卡 ★","★ Golden Shiny ★","★ 골든 샤이니 ★","★ ゴールデンシャイニー ★");
/* 場次限定卡 */
I18N.add("★ 高雄場限定卡 ★","★ Kaohsiung Show Limited Card ★","★ 가오슝 공연 한정 카드 ★","★ 高雄公演 限定カード ★");
I18N.add("★ 香港場限定卡 ★","★ Hong Kong Show Limited Card ★","★ 홍콩 공연 한정 카드 ★","★ 香港公演 限定カード ★");
I18N.add("高雄場限定卡","Kaohsiung limited cards","가오슝 한정 카드","高雄 限定カード");
I18N.add("香港場限定卡","Hong Kong limited cards","홍콩 한정 카드","香港 限定カード");
I18N.add("高雄場限定卡集滿了！","Kaohsiung limited cards complete!","가오슝 한정 카드를 모두 모았어요!","高雄の限定カードがそろいました！");
I18N.add("香港場限定卡集滿了！","Hong Kong limited cards complete!","홍콩 한정 카드를 모두 모았어요!","香港の限定カードがそろいました！");
I18N.add("高雄場見證者","Kaohsiung Show Witness","가오슝 공연 증인","高雄公演の見届け人");
I18N.add("香港場見證者","Hong Kong Show Witness","홍콩 공연 증인","香港公演の見届け人");

const PJ=[
[/^(\d+) 首歌$/,n=>n+"曲"],
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
[/^勾選要排進路線的地點，沒勾的不會列入。已選 (\d+) \/ (\d+) 個$/,(a,b)=>"ルートに入れる場所にチェック。外したものは含まれません。選択 "+a+" / "+b+" か所"],
[/^🎂 今天是 (.+) 的生日！$/,m=>"🎂 今日は"+m+"の誕生日！"],
[/^🎉 下一個：BTS 出道 (\d+) 週年 (\S+)，還有 (\d+) 天$/,(y,d,k)=>"🎉 次：BTSデビュー"+y+"周年 "+d+"（あと"+k+"日）"],
[/^🎉 今天是 BTS 出道 (\d+) 週年！$/,y=>"🎉 今日はBTSデビュー"+y+"周年！"]
];
/* 後加的翻譯集中放在這裡，不要插進上面的 D：日文（JA）是依 D 的順序對應，中間插入會讓後面全部錯位。格式：原文:[英文,韓文,日文] */
(function(){
const X={
"燈箱/看板":["Lightbox / Billboard","라이트박스/보드","ライトボックス／看板"],
"我要投稿":["Submit info","제보하기","情報を投稿"],
"錯誤回報":["Report an error","오류 신고","誤りを報告"],
"我要投稿／錯誤回報":["Submit info / Report an error","제보 / 오류 신고","投稿／誤り報告"],
"這排可以左右滑，選燈箱/看板、咖啡廳、LED 廣告車等類型。":["Swipe this row sideways to choose lightboxes/billboards, cafés, LED ad trucks and other types.","이 줄은 좌우로 밀 수 있어요. 라이트박스/보드, 카페, LED 광고 차량 등 유형을 고르세요.","この行は左右にスワイプできます。ライトボックス／看板、カフェ、LED広告車などの種類を選べます。"],
"有新的應援資訊想提供，或發現資料有誤，點頁尾這兩顆按鈕填表單告訴我們。":["Have new project info, or spotted a mistake? Tap these two buttons in the footer to fill in a form.","새 응원 정보를 제보하거나 오류를 발견했다면 하단의 두 버튼으로 양식을 작성해 주세요.","新しい応援情報の提供や誤りに気づいたら、フッターの2つのボタンからフォームでお知らせください。"],
"徽章":["Badges","배지","バッジ"],
"集章達標會解鎖徽章，點這裡看全部徽章和進度。":["Hit stamp goals to unlock badges. Tap here to see all badges and your progress.","스탬프 목표를 달성하면 배지가 열려요. 여기서 전체 배지와 진행도를 확인하세요.","スタンプの目標を達成するとバッジが解放されます。ここで全バッジと進み具合を確認できます。"],
"成就圖鑑":["Achievements","업적 도감","実績図鑑"],
"徽章、籤卡圖鑑和稱號，收集進度一次看":["Badges, fortune cards and titles — all your progress in one place","배지, 운세 카드, 칭호를 한눈에","バッジ・おみくじカード・称号の収集状況をまとめて確認"],
"徽章、籤卡圖鑑和稱號都收在這裡，看看自己收集到哪了。":["Badges, fortune cards and titles all live here. See how far you've collected.","배지, 운세 카드, 칭호가 모두 여기에 있어요. 얼마나 모았는지 확인해 보세요.","バッジ・おみくじカード・称号はここにまとまっています。どこまで集めたか確認しましょう。"],
"籤卡圖鑑":["Fortune cards","운세 카드 도감","おみくじ図鑑"],
"目前稱號":["Current title","현재 칭호","現在の称号"],
"還沒抽過幸運籤，抽一次就會開始收集圖鑑。":["You haven't drawn a fortune yet. Draw once to start your collection.","아직 운세를 뽑지 않았어요. 한 번 뽑으면 도감 수집이 시작돼요.","まだおみくじを引いていません。1回引くと図鑑の収集が始まります。"],
"稱號看連續抽籤天數，中斷一天會重新計算。":["Titles follow your draw streak. Missing a day resets it.","칭호는 연속 뽑기 일수에 따라 정해져요. 하루 빠지면 다시 계산돼요.","称号は連続で引いた日数で決まります。1日空くとリセットされます。"],
"集滿閃卡圖鑑":["Complete the shiny collection","샤이니 도감 완성","シャイニー図鑑をコンプリート"],
"我的徽章":["My badges","내 배지","マイバッジ"],
"徽章依目前的打卡進度計算，取消打卡後，未達標的徽章會一併收回。":["Badges follow your current check-ins. If you un-check items and no longer meet a badge's goal, that badge is removed.","배지는 현재 체크인 진행도에 따라 정해져요. 체크인을 취소해 조건을 채우지 못하면 해당 배지도 사라져요.","バッジは現在のチェックイン状況で決まります。チェックインを取り消して条件を満たさなくなると、そのバッジも外れます。"],
"初次打卡":["First check-in","첫 체크인","初チェックイン"],
"完成第 1 次打卡":["Make your first check-in","첫 체크인 완료","初めてのチェックインをする"],
"打卡新星":["Rising star","떠오르는 신인","チェックイン新星"],
"應援高手":["Cheer pro","응원 고수","応援の達人"],
"應援大師":["Cheer master","응원 마스터","応援マスター"],
"全類型收集":["All types","전 유형 수집","全タイプ収集"],
"每種類型都至少打卡 1 個":["Check in at least 1 of every type","모든 유형에서 1개 이상 체크인","全タイプで1つ以上チェックイン"],
"遊戲 S 級":["Game rank S","게임 S 등급","ゲームSランク"],
"在應援遊戲拿到 S 級":["Get rank S in the cheer game","응원 게임에서 S 등급 받기","応援ゲームでSランクを取る"],
"？？？":["???","???","???"],
"隱藏徽章，達成後才會揭曉":["Hidden badge — revealed once unlocked","숨겨진 배지 — 달성하면 공개돼요","隠しバッジ。達成すると明らかになります"],
"未解鎖":["Locked","잠김","未解除"],
"現場見證":["Live Witness","현장 목격자","現場の目撃者"],
"投票決定明天的背景音樂":["Vote for tomorrow's background music","내일의 배경음악 투표","明日のBGMに投票"],
"投票":["Vote","투표","投票"],
"預設歌曲":["Default song","기본 곡","デフォルト曲"],
"每天 00:00（台北時間）結算，得票最高的是隔天的背景音樂。一天一票，可以改投。":["Votes close daily at 00:00 (Taipei time); the top song plays the next day. One vote per day, and you can change it.","매일 00:00(타이베이 시간)에 마감하며 최다 득표 곡이 다음 날 재생됩니다. 하루 한 표, 변경 가능.","毎日0:00（台北時間）に締め切り、最多得票曲が翌日のBGMになります。1日1票、変更可能。"],
"還沒有候選歌，來提名第一首吧！":["No candidates yet. Nominate the first song!","아직 후보곡이 없어요. 첫 곡을 추천해 보세요!","まだ候補曲がありません。最初の1曲を推薦しよう！"],
"提名一首 YouTube 歌曲（每天一次，審核通過後才會出現在名單）":["Nominate a YouTube song (once a day; it appears after approval)","YouTube 곡 추천 (하루 한 번, 승인 후 목록에 표시)","YouTube曲を推薦（1日1回、承認後にリストへ表示）"],
"貼上 YouTube 網址":["Paste a YouTube link","YouTube 링크 붙여넣기","YouTubeのリンクを貼り付け"],
"提名":["Nominate","추천","推薦"],
"今天已提名":["Nominated today","오늘 추천 완료","本日は推薦済み"],
"投給它":["Vote","투표","投票する"],
"已投票":["Voted","투표 완료","投票しました"],
"已送出提名":["Nomination sent","추천을 보냈습니다","推薦を送信しました"],
"已送出提名，審核通過後會出現在名單":["Nomination sent. It will appear after approval.","추천을 보냈습니다. 승인 후 목록에 표시됩니다.","推薦を送信しました。承認後にリストへ表示されます。"],
"送出中…":["Sending…","전송 중…","送信中…"],
"檢查影片中…":["Checking the video…","영상 확인 중…","動画を確認中…"],
"載入中…":["Loading…","불러오는 중…","読み込み中…"],
"請貼上 YouTube 網址":["Please paste a YouTube link","YouTube 링크를 붙여넣어 주세요","YouTubeのリンクを貼り付けてください"],
"投票失敗":["Vote failed","투표 실패","投票に失敗しました"],
"提名失敗":["Nomination failed","추천 실패","推薦に失敗しました"],
"網路不穩，請稍後再試":["Network unstable, please try again later","네트워크가 불안정합니다. 잠시 후 다시 시도하세요","ネットワークが不安定です。しばらくしてからお試しください"],
"暫時連不上投票服務，請稍後再試":["Voting service unreachable, please try again later","투표 서비스에 연결할 수 없습니다. 잠시 후 다시 시도하세요","投票サービスに接続できません。しばらくしてからお試しください"],
"請貼上 YouTube 影片網址":["Please paste a YouTube video link","YouTube 영상 링크를 붙여넣어 주세요","YouTube動画のリンクを貼り付けてください"],
"今天已經提名過了，明天再來吧":["You already nominated today. Come back tomorrow!","오늘은 이미 추천했습니다. 내일 다시 오세요!","本日はすでに推薦済みです。また明日！"],
"這首歌已經被提名過了":["This song has already been nominated","이미 추천된 곡입니다","この曲はすでに推薦されています"],
"找不到這支影片，或影片不允許嵌入播放":["Video not found, or it does not allow embedding","영상을 찾을 수 없거나 퍼가기가 허용되지 않습니다","動画が見つからないか、埋め込みが許可されていません"],
"這首歌不在候選名單":["This song is not in the candidate list","후보 목록에 없는 곡입니다","この曲は候補リストにありません"],
"身分無效，請重新整理頁面":["Invalid session, please refresh the page","세션이 유효하지 않습니다. 새로고침하세요","セッションが無効です。ページを再読み込みしてください"],
"伺服器忙碌，請稍後再試":["Server busy, please try again later","서버가 바쁩니다. 잠시 후 다시 시도하세요","サーバーが混雑しています。しばらくしてからお試しください"],
"在演唱會當天完成打卡":["Check in on a concert day","콘서트 당일에 체크인","コンサート当日にチェックイン"],
"演唱會當天在現場報到（定位或現場暗號）":["Check in on-site on a concert day (location or on-site code)","콘서트 당일 현장 체크인 (위치 또는 현장 암호)","コンサート当日に現地でチェックイン（位置情報または現地コード）"],
"現場報到":["On-site check-in","현장 체크인","現地チェックイン"],
"人到現場了嗎？報到就能解鎖「現場見證」徽章。":["Are you at the venue? Check in to unlock the Live Witness badge.","현장에 도착하셨나요? 체크인하면 '현장 목격자' 배지를 얻을 수 있어요.","会場に着きましたか？チェックインすると「現場の目撃者」バッジが解除されます。"],
"稍後":["Later","나중에","あとで"],
"用定位報到":["Check in with location","위치로 체크인","位置情報でチェックイン"],
"只在這台手機上比對位置，不會上傳或儲存座標。":["Your location is only compared on this device; coordinates are never uploaded or saved.","위치는 이 기기에서만 비교하며 업로드·저장하지 않습니다.","位置はこの端末内でのみ照合し、送信・保存しません。"],
"輸入現場暗號":["Enter on-site code","현장 암호 입력","現地コードを入力"],
"送出暗號":["Submit code","암호 제출","コードを送信"],
"暗號不對":["Wrong code","암호가 틀렸습니다","コードが違います"],
"請輸入暗號":["Please enter the code","암호를 입력하세요","コードを入力してください"],
"現場報到成功":["On-site check-in done","현장 체크인 완료","現地チェックイン完了"],
"定位中…":["Locating…","위치 확인 중…","位置を取得中…"],
"定位失敗，請稍後再試":["Location failed, please try again","위치 확인 실패, 다시 시도하세요","位置情報の取得に失敗しました"],
"沒有定位權限，請在瀏覽器允許定位，或改用現場暗號":["Location permission denied. Allow it in your browser, or use the on-site code.","위치 권한이 없습니다. 브라우저에서 허용하거나 현장 암호를 사용하세요.","位置情報の許可がありません。ブラウザで許可するか、現地コードをご利用ください。"],
"這個瀏覽器無法驗證暗號":["This browser cannot verify the code","이 브라우저에서는 암호를 확인할 수 없습니다","このブラウザではコードを確認できません"],
"這場還沒有開放報到方式。":["No check-in method is open for this show yet.","이 공연은 아직 체크인 방식이 열리지 않았습니다.","この公演はまだチェックイン方法が開放されていません。"],
"一日走透透":["Day Tripper","하루 종일 투어","一日まるごと巡り"],
"同一天完成 3 個打卡":["Check in at 3 places in one day","하루에 3곳 체크인","1日で3か所チェックイン"],
"準時祝福":["Right on Time","정시 축하","ぴったりのお祝い"],
"在成員生日（或 BTS 出道周年）當天，打卡他的應援":["Check in a member's project on their birthday (or BTS's debut anniversary)","멤버 생일(또는 BTS 데뷔 기념일) 당일에 해당 응원 체크인","メンバーの誕生日（またはBTSのデビュー記念日）当日に、その応援をチェックイン"],
"全員到齊":["All Together","전원 집합","全員集合"],
"BTS 和七位成員的應援都打過卡":["Checked in projects for BTS and all seven members","BTS와 멤버 7명의 응원을 모두 체크인","BTSとメンバー7人の応援をすべてチェックイン"],
"跨海應援":["Across the Sea","바다 건너 응원","海を越えた応援"],
"台灣和海外的應援都打過卡":["Checked in projects in both Taiwan and overseas","대만과 해외 응원을 모두 체크인","台湾と海外の応援の両方でチェックイン"],
"演唱會":["Concert","콘서트","コンサート"],
"生日":["Birthday","생일","誕生日"],
"幸運籤":["Lucky Draw","행운 뽑기","おみくじ"],
"打卡天數":["Check-in Days","체크인 일수","チェックイン日数"],
"終極挑戰":["Ultimate Challenge","궁극의 도전","究極チャレンジ"],
"打卡 3 天":["3 Check-in Days","3일 체크인","3日チェックイン"],
"在 3 個不同的日子打卡":["Check in on 3 different days","서로 다른 3일에 체크인","異なる3日でチェックイン"],
"打卡 7 天":["7 Check-in Days","7일 체크인","7日チェックイン"],
"在 7 個不同的日子打卡":["Check in on 7 different days","서로 다른 7일에 체크인","異なる7日でチェックイン"],
"初次抽籤":["First Draw","첫 뽑기","初めてのおみくじ"],
"抽一次幸運籤":["Draw a lucky fortune once","행운 뽑기 한 번 하기","おみくじを1回引く"],
"成員收集家":["Member Collector","멤버 수집가","メンバーコレクター"],
"集滿幸運籤的成員圖鑑":["Complete the lucky-draw member collection","행운 뽑기 멤버 도감 완성","おみくじのメンバー図鑑をコンプリート"],
"閃卡收集家":["Shiny Collector","샤이니 카드 수집가","キラカードコレクター"],
"集滿幸運籤的閃卡圖鑑":["Complete the lucky-draw shiny-card collection","행운 뽑기 샤이니 카드 도감 완성","おみくじのキラカード図鑑をコンプリート"],
"雙城巡演":["Two-City Tour","두 도시 투어","二都市ツアー"],
"高雄和香港的巡演應援都打過卡":["Checked in tour projects in both Kaohsiung and Hong Kong","가오슝과 홍콩 투어 응원을 모두 체크인","高雄と香港のツアー応援の両方でチェックイン"],
"環島應援":["Island Tour","섬 일주 응원","島一周応援"],
"在 3 個不同的台灣城市打卡":["Check in in 3 different Taiwan cities","대만의 서로 다른 3개 도시에서 체크인","台湾の異なる3都市でチェックイン"],
"環球應援":["Global Cheer","세계 응원","世界応援"],
"在 2 個不同的海外城市或地區打卡":["Check in in 2 different overseas cities or regions","해외 2개 도시 또는 지역에서 체크인","海外の異なる2都市・地域でチェックイン"],
"偏心警告":["Playing Favorites","편애 경보","推し一筋"],
"同一位成員的應援打卡 5 個以上":["Check in 5+ projects for the same member","같은 멤버의 응원 5곳 이상 체크인","同じメンバーの応援を5か所以上チェックイン"],
"完美主義者":["Perfectionist","완벽주의자","完璧主義者"],
"解鎖其他所有徽章":["Unlock every other badge","다른 모든 배지 해제","ほかのすべてのバッジを解除"],
"BTS 出道周年集滿":["BTS anniversary complete","BTS 데뷔 기념일 완성","BTSデビュー記念日コンプリート"],
"把 BTS 的出道周年應援全部打卡":["Check in every BTS debut anniversary project","BTS 데뷔 기념일 응원을 모두 체크인","BTSデビュー記念日の応援を全部チェックイン"]
};
Object.keys(X).forEach(k=>{D[k]=[X[k][0],X[k][1]];JA[k]=X[k][2]});
const CN={"高雄":["Kaohsiung","가오슝","高雄"],"香港":["Hong Kong","홍콩","香港"]};
const nm=(x,k)=>CN[x]?CN[x][k]:(k<2?(D[x]?D[x][k]:x):(JA[x]||x));
const TYS="應援企劃|燈箱/看板|LED電視牆|公車站牌|應援咖啡廳|LED廣告車|咖啡廳|快閃店|展覽";
const BD=[
[new RegExp("^("+TYS+")達人$"),x=>[nm(x,0)+" Pro",nm(x,1)+" 달인",nm(x,2)+"の達人"]],
[/^(高雄|香港)集滿$/,x=>[nm(x,0)+" complete",nm(x,1)+" 완성",nm(x,2)+"コンプリート"]],
[/^(.+) 生日集滿$/,x=>[x+" birthday complete",x+" 생일 완성",x+" 誕生日コンプリート"]],
[/^累計打卡 (\d+) 個$/,n=>["Check in "+n+" in total","총 "+n+"개 체크인","累計"+n+"か所チェックイン"]],
[/^把(高雄|香港)的應援全部打卡$/,x=>["Check in every project in "+nm(x,0),nm(x,1)+"의 응원을 모두 체크인",nm(x,2)+"の応援を全部チェックイン"]],
[/^把 (.+) 的生日應援全部打卡$/,x=>["Check in every "+x+" birthday project",x+" 생일 응원을 모두 체크인",x+"の誕生日応援を全部チェックイン"]],
[/^「(.+)」類型打卡 (\d+) 個$/,(x,n)=>["Check in "+n+" × "+nm(x,0),"「"+nm(x,1)+"」 "+n+"개 체크인","「"+nm(x,2)+"」を"+n+"か所チェックイン"]],
[/^已獲得 (\d+) \/ (\d+) 個$/,(a,b)=>["Earned "+a+" / "+b,a+" / "+b+"개 획득","獲得 "+a+" / "+b+" 個"]],
[/^獲得於 (\S+)$/,d=>["Earned "+d,d+" 획득",d+" 獲得"]],
[/^今天播放：(.+)$/,t=>["Now playing: "+t,"오늘 재생: "+t,"今日の再生: "+t]],
[/^(\d+) 票$/,n=>[n+(n==="1"?" vote":" votes"),n+"표",n+"票"]],
[/^今天是 (\S+) 演唱會！$/,c=>["Today is the "+c+" concert!","오늘은 "+c+" 콘서트 날!","今日は"+c+"公演の日！"]],
[/^🏆 徽章 (\d+) \/ (\d+)$/,(a,b)=>["🏆 Badges "+a+" / "+b,"🏆 배지 "+a+" / "+b,"🏆 バッジ "+a+" / "+b]],
[/^連續抽籤 (\d+) 天$/,n=>["Draw streak: "+n+" days","연속 뽑기 "+n+"일","連続で引く："+n+"日"]],
[/^連續抽籤 (\d+) 天且集滿成員圖鑑$/,n=>["Draw streak: "+n+" days and a complete member collection","연속 뽑기 "+n+"일 + 멤버 도감 완성","連続で引く："+n+"日＋メンバー図鑑コンプリート"]],
[/^集滿(高雄|香港)場限定卡$/,x=>["Complete the "+nm(x,0)+" limited cards","완성: "+nm(x,1)+" 한정 카드",nm(x,2)+"の限定カードをコンプリート"]],
[/^(高雄|香港)場見證者$/,x=>["Show Witness: "+nm(x,0),nm(x,1)+" 공연 증인",nm(x,2)+"公演の見届け人"]],
[/^獲得 (\d+) 個新徽章$/,n=>[n+" new badges earned","새 배지 "+n+"개 획득","新しいバッジを"+n+"個獲得"]]
];
const tn=(x,k)=>{if(k<2&&D[x])return D[x][k];if(k===2&&JA[x])return JA[x];for(const[re,f]of BD){const m=x.match(re);if(m)return f(...m.slice(1))[k]}return x};
BD.push([/^獲得新徽章：(.+)$/,x=>["New badge: "+tn(x,0),"새 배지: "+tn(x,1),"新しいバッジ："+tn(x,2)]]);
P.push(...BD.map(([re,f])=>[re,(...a)=>f(...a).slice(0,2)]));
PJ.push(...BD.map(([re,f])=>[re,(...a)=>f(...a)[2]]));
})();
const idx=()=>LANGS.findIndex(x=>x[0]===L)-1;
function tr(s){const t=s.trim();if(L==="zh"||!t)return s;let v;
if(L==="ja"){v=JA[t];if(!v)for(const[re,f]of PJ){const m=t.match(re);if(m){v=f(...m.slice(1));break}}}
else{let r=D[t];if(!r)for(const[re,f]of P){const m=t.match(re);if(m){r=f(...m.slice(1));break}}v=r&&r[idx()]}
return v?s.replace(t,()=>v):s}
const IC={"💣": "bomb", "🎂": "cake", "📍": "pin", "🗺": "map", "🧭": "compass", "🔍": "search", "🖼": "image", "⏳": "hourglass", "🔔": "bell", "🏆": "trophy", "🎉": "party", "✔": "check", "↺": "undo", "♡": "heart", "♥": "heartf", "←": "left", "→": "right", "↑": "up", "↓": "down", "♪": "note", "⚠": "warn"};
const SY="✔↺♡♥←→↑↓♪⚠";
const ICON_RE=new RegExp("^\\s*("+Object.keys(IC).filter(k=>SY.indexOf(k)<0).join("|")+")\\uFE0F?\\s*");
/* 文字符號只在按鈕、標籤、異動提示裡換成像素圖示，試算表的活動文字、歌詞維持原樣 */
const SYM_RE=new RegExp("^\\s*(["+SY+"])[\\uFE0E\\uFE0F]?\\s*");
const isUI=n=>!!(n.parentNode&&n.parentNode.closest&&n.parentNode.closest("button,.pill,.chg-alert"));
const AT=["placeholder","aria-label","title"];
function pass(){ob.disconnect();
const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),L2=[];let n;
while(n=w.nextNode()){if(!/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))L2.push(n)}
L2.forEach(n=>{const v=n.nodeValue,o=n.__t===v?n.__o:v;n.__o=o;let r=tr(o);
const pv=n.previousSibling,mine=pv&&pv.__ic?pv:null,m=r.match(ICON_RE)||(isUI(n)?r.match(SYM_RE):null);
if(m){let s=mine;if(!s){s=document.createElement("span");s.__ic=1;s.setAttribute("aria-hidden","true");n.parentNode.insertBefore(s,n)}s.className="pxi "+IC[m[1]];r=r.slice(m[0].length)}
else if(mine)mine.remove();
n.__t=r;if(r!==v)n.nodeValue=r});
document.querySelectorAll("[placeholder],[aria-label],[title]").forEach(e=>AT.forEach(a=>{if(!e.hasAttribute(a))return;
const v=e.getAttribute(a),k="__t_"+a,ok="__o_"+a,o=e[k]===v?e[ok]:v;e[ok]=o;const r=tr(o);e[k]=r;if(r!==v)e.setAttribute(a,r)}));
document.documentElement.lang=L==="zh"?"zh-Hant":L;
ob.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:AT})}
let raf=0;const ob=new MutationObserver(()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(pass)});
const st=document.createElement("style");
st.textContent=".pxi{display:inline-block;width:1.1em;height:1.1em;vertical-align:-.2em;margin-right:.35em;background:currentColor;-webkit-mask:var(--ic) center/contain no-repeat;mask:var(--ic) center/contain no-repeat}.btn .pxi,.sbtn .pxi{margin-right:0}.pxi.bomb{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='3' y='3' width='4' height='1'/%3E%3Crect x='2' y='4' width='6' height='1'/%3E%3Crect x='1' y='5' width='8' height='3'/%3E%3Crect x='2' y='8' width='6' height='1'/%3E%3Crect x='3' y='9' width='4' height='1'/%3E%3Crect x='4' y='2' width='2' height='1'/%3E%3Crect x='5' y='1' width='1' height='1'/%3E%3Crect x='6' y='0' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.cake{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='4' y='1' width='2' height='2'/%3E%3Crect x='1' y='3' width='8' height='2'/%3E%3Crect x='0' y='6' width='10' height='3'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.pin{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='3' y='0' width='4' height='1'/%3E%3Crect x='2' y='1' width='6' height='1'/%3E%3Crect x='2' y='2' width='2' height='2'/%3E%3Crect x='6' y='2' width='2' height='2'/%3E%3Crect x='2' y='4' width='6' height='1'/%3E%3Crect x='3' y='5' width='4' height='1'/%3E%3Crect x='3' y='6' width='4' height='1'/%3E%3Crect x='4' y='7' width='2' height='2'/%3E%3Crect x='4' y='9' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.map{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='0' y='2' width='10' height='1'/%3E%3Crect x='0' y='8' width='10' height='1'/%3E%3Crect x='0' y='3' width='1' height='5'/%3E%3Crect x='9' y='3' width='1' height='5'/%3E%3Crect x='3' y='3' width='1' height='5'/%3E%3Crect x='6' y='3' width='1' height='5'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.compass{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='3' y='1' width='1' height='1'/%3E%3Crect x='6' y='1' width='1' height='1'/%3E%3Crect x='2' y='2' width='1' height='1'/%3E%3Crect x='7' y='2' width='1' height='1'/%3E%3Crect x='1' y='3' width='1' height='1'/%3E%3Crect x='8' y='3' width='1' height='1'/%3E%3Crect x='0' y='4' width='1' height='2'/%3E%3Crect x='9' y='4' width='1' height='2'/%3E%3Crect x='1' y='6' width='1' height='1'/%3E%3Crect x='8' y='6' width='1' height='1'/%3E%3Crect x='2' y='7' width='1' height='1'/%3E%3Crect x='7' y='7' width='1' height='1'/%3E%3Crect x='3' y='8' width='1' height='1'/%3E%3Crect x='6' y='8' width='1' height='1'/%3E%3Crect x='4' y='9' width='2' height='1'/%3E%3Crect x='4' y='4' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.search{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='2' y='0' width='4' height='1'/%3E%3Crect x='1' y='1' width='1' height='1'/%3E%3Crect x='6' y='1' width='1' height='1'/%3E%3Crect x='0' y='2' width='1' height='3'/%3E%3Crect x='7' y='2' width='1' height='3'/%3E%3Crect x='1' y='5' width='1' height='1'/%3E%3Crect x='6' y='5' width='1' height='1'/%3E%3Crect x='2' y='6' width='4' height='1'/%3E%3Crect x='7' y='6' width='1' height='1'/%3E%3Crect x='8' y='7' width='1' height='1'/%3E%3Crect x='8' y='8' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.image{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='0' y='1' width='10' height='1'/%3E%3Crect x='0' y='8' width='10' height='1'/%3E%3Crect x='0' y='2' width='1' height='6'/%3E%3Crect x='9' y='2' width='1' height='6'/%3E%3Crect x='2' y='6' width='2' height='1'/%3E%3Crect x='3' y='5' width='2' height='1'/%3E%3Crect x='4' y='6' width='3' height='1'/%3E%3Crect x='6' y='3' width='2' height='2'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.hourglass{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='1' y='0' width='8' height='1'/%3E%3Crect x='2' y='1' width='1' height='1'/%3E%3Crect x='7' y='1' width='1' height='1'/%3E%3Crect x='3' y='2' width='1' height='1'/%3E%3Crect x='6' y='2' width='1' height='1'/%3E%3Crect x='4' y='3' width='2' height='2'/%3E%3Crect x='3' y='5' width='1' height='1'/%3E%3Crect x='6' y='5' width='1' height='1'/%3E%3Crect x='2' y='6' width='1' height='1'/%3E%3Crect x='7' y='6' width='1' height='1'/%3E%3Crect x='1' y='7' width='1' height='2'/%3E%3Crect x='8' y='7' width='1' height='2'/%3E%3Crect x='1' y='9' width='8' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.bell{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='3' y='1' width='4' height='1'/%3E%3Crect x='2' y='2' width='6' height='3'/%3E%3Crect x='1' y='5' width='8' height='2'/%3E%3Crect x='0' y='7' width='10' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.trophy{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='2' y='0' width='6' height='4'/%3E%3Crect x='0' y='1' width='2' height='2'/%3E%3Crect x='8' y='1' width='2' height='2'/%3E%3Crect x='3' y='4' width='4' height='1'/%3E%3Crect x='4' y='5' width='2' height='2'/%3E%3Crect x='3' y='7' width='4' height='1'/%3E%3Crect x='2' y='8' width='6' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.party{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='2'/%3E%3Crect x='0' y='4' width='2' height='2'/%3E%3Crect x='8' y='4' width='2' height='2'/%3E%3Crect x='4' y='8' width='2' height='2'/%3E%3Crect x='3' y='3' width='4' height='4'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.check{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='8' y='2' width='2' height='1'/%3E%3Crect x='7' y='3' width='2' height='1'/%3E%3Crect x='1' y='4' width='2' height='1'/%3E%3Crect x='6' y='4' width='2' height='1'/%3E%3Crect x='2' y='5' width='2' height='1'/%3E%3Crect x='5' y='5' width='2' height='1'/%3E%3Crect x='3' y='6' width='3' height='1'/%3E%3Crect x='4' y='7' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.undo{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='3' y='0' width='1' height='1'/%3E%3Crect x='2' y='1' width='2' height='1'/%3E%3Crect x='5' y='1' width='4' height='1'/%3E%3Crect x='1' y='2' width='3' height='1'/%3E%3Crect x='9' y='2' width='1' height='1'/%3E%3Crect x='2' y='3' width='2' height='1'/%3E%3Crect x='9' y='3' width='1' height='1'/%3E%3Crect x='3' y='4' width='1' height='1'/%3E%3Crect x='9' y='4' width='1' height='1'/%3E%3Crect x='0' y='5' width='1' height='1'/%3E%3Crect x='9' y='5' width='1' height='1'/%3E%3Crect x='0' y='6' width='1' height='1'/%3E%3Crect x='9' y='6' width='1' height='1'/%3E%3Crect x='1' y='7' width='1' height='1'/%3E%3Crect x='8' y='7' width='1' height='1'/%3E%3Crect x='2' y='8' width='1' height='1'/%3E%3Crect x='7' y='8' width='1' height='1'/%3E%3Crect x='3' y='9' width='4' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.left{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='1' width='1' height='1'/%3E%3Crect x='3' y='2' width='2' height='1'/%3E%3Crect x='2' y='3' width='3' height='1'/%3E%3Crect x='1' y='4' width='9' height='1'/%3E%3Crect x='1' y='5' width='9' height='1'/%3E%3Crect x='2' y='6' width='3' height='1'/%3E%3Crect x='3' y='7' width='2' height='1'/%3E%3Crect x='4' y='8' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.up{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='1' width='2' height='1'/%3E%3Crect x='3' y='2' width='4' height='1'/%3E%3Crect x='2' y='3' width='6' height='1'/%3E%3Crect x='1' y='4' width='8' height='1'/%3E%3Crect x='4' y='5' width='2' height='1'/%3E%3Crect x='4' y='6' width='2' height='1'/%3E%3Crect x='4' y='7' width='2' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3Crect x='4' y='9' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.down{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='4' y='1' width='2' height='1'/%3E%3Crect x='4' y='2' width='2' height='1'/%3E%3Crect x='4' y='3' width='2' height='1'/%3E%3Crect x='4' y='4' width='2' height='1'/%3E%3Crect x='1' y='5' width='8' height='1'/%3E%3Crect x='2' y='6' width='6' height='1'/%3E%3Crect x='3' y='7' width='4' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.heart{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='1' y='1' width='3' height='1'/%3E%3Crect x='6' y='1' width='3' height='1'/%3E%3Crect x='0' y='2' width='1' height='1'/%3E%3Crect x='4' y='2' width='2' height='1'/%3E%3Crect x='9' y='2' width='1' height='1'/%3E%3Crect x='0' y='3' width='1' height='1'/%3E%3Crect x='9' y='3' width='1' height='1'/%3E%3Crect x='0' y='4' width='1' height='1'/%3E%3Crect x='9' y='4' width='1' height='1'/%3E%3Crect x='1' y='5' width='1' height='1'/%3E%3Crect x='8' y='5' width='1' height='1'/%3E%3Crect x='2' y='6' width='1' height='1'/%3E%3Crect x='7' y='6' width='1' height='1'/%3E%3Crect x='3' y='7' width='1' height='1'/%3E%3Crect x='6' y='7' width='1' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.heartf{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='1' y='1' width='3' height='1'/%3E%3Crect x='6' y='1' width='3' height='1'/%3E%3Crect x='0' y='2' width='10' height='1'/%3E%3Crect x='0' y='3' width='10' height='1'/%3E%3Crect x='0' y='4' width='10' height='1'/%3E%3Crect x='1' y='5' width='8' height='1'/%3E%3Crect x='2' y='6' width='6' height='1'/%3E%3Crect x='3' y='7' width='4' height='1'/%3E%3Crect x='4' y='8' width='2' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.warn{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='0' width='2' height='1'/%3E%3Crect x='3' y='1' width='4' height='1'/%3E%3Crect x='3' y='2' width='4' height='1'/%3E%3Crect x='2' y='3' width='2' height='1'/%3E%3Crect x='6' y='3' width='2' height='1'/%3E%3Crect x='2' y='4' width='2' height='1'/%3E%3Crect x='6' y='4' width='2' height='1'/%3E%3Crect x='1' y='5' width='3' height='1'/%3E%3Crect x='6' y='5' width='3' height='1'/%3E%3Crect x='1' y='6' width='3' height='1'/%3E%3Crect x='6' y='6' width='3' height='1'/%3E%3Crect x='0' y='7' width='10' height='1'/%3E%3Crect x='0' y='8' width='4' height='1'/%3E%3Crect x='6' y='8' width='4' height='1'/%3E%3Crect x='0' y='9' width='10' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.note{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='4' y='1' width='5' height='1'/%3E%3Crect x='4' y='2' width='1' height='1'/%3E%3Crect x='8' y='2' width='1' height='1'/%3E%3Crect x='4' y='3' width='1' height='1'/%3E%3Crect x='8' y='3' width='1' height='1'/%3E%3Crect x='4' y='4' width='1' height='1'/%3E%3Crect x='8' y='4' width='1' height='1'/%3E%3Crect x='4' y='5' width='1' height='1'/%3E%3Crect x='7' y='5' width='3' height='1'/%3E%3Crect x='2' y='6' width='3' height='1'/%3E%3Crect x='7' y='6' width='3' height='1'/%3E%3Crect x='2' y='7' width='3' height='1'/%3E%3Crect x='2' y='8' width='3' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.pxi.right{--ic:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 10' shape-rendering='crispEdges'%3E%3Cg fill='black'%3E%3Crect x='5' y='1' width='1' height='1'/%3E%3Crect x='5' y='2' width='2' height='1'/%3E%3Crect x='5' y='3' width='3' height='1'/%3E%3Crect x='0' y='4' width='9' height='1'/%3E%3Crect x='0' y='5' width='9' height='1'/%3E%3Crect x='5' y='6' width='3' height='1'/%3E%3Crect x='5' y='7' width='2' height='1'/%3E%3Crect x='5' y='8' width='1' height='1'/%3E%3C/g%3E%3C/svg%3E\")}.snav .pxi,.heart .pxi,#top .pxi,#bgm .pxi,.route li button .pxi{margin-right:0;vertical-align:middle}"+"#lang{position:absolute;top:14px;right:16px;z-index:3;font:700 13px/1.4 inherit;color:#fff;background:rgba(6,40,110,.45);border:1px solid rgba(255,255,255,.5);border-radius:99px;padding:5px 12px;cursor:pointer}#lang option{color:#0b2a5b;background:#fff}#lang:focus-visible{outline:3px solid var(--focus);outline-offset:2px}";
document.head.appendChild(st);
const sel=document.createElement("select");sel.id="lang";sel.setAttribute("aria-label","Language");
sel.innerHTML=LANGS.map(x=>`<option value="${x[0]}">${x[1]}</option>`).join("");sel.value=L;
sel.onchange=()=>{L=sel.value;try{localStorage.setItem("lang",L)}catch(e){}pass()};
document.querySelector(".hero").appendChild(sel);
window.addEventListener("load",pass);pass();
})();
