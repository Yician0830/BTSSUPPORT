/* ===== 網站設定 =====
SHEET_CSV_URL：把 Google 試算表「發布到網路」的 CSV 連結貼在引號裡，網站就會改讀試算表。
留空 "" 的話，就用下面這份內建資料（也是試算表讀不到時的備案）。 */
const SHEET_CSV_URL="";

/* ===== 怎麼新增或修改應援（只需要改這個檔案） =====
1. 複製下面任一筆 {...}，貼在最後一筆後面（筆與筆之間要有逗號），再改裡面的文字。
2. 有圖片：把圖片上傳到 img 資料夾，並在該筆加上  img:"img/檔名.jpg"，沒有圖就不用寫。
3. 最後把檔案最下面的 UPDATED 改成當天日期。
id      每筆唯一的英文代號，不可重複（打卡紀錄靠它記）
sec     巡演不用填；生日應援填 "birthday"
city    巡演才需要："kh" 高雄、"hk" 香港
member  生日應援才需要：BTS（出道周年）/ RM / Jin / SUGA / j-hope / Jimin / V / Jungkook
type    例如 ["公車站牌"]，可選：應援企劃、LED廣告車、公車站牌、LED電視牆、應援咖啡廳、咖啡廳、快閃店、展覽
title / by / desc    名稱 / 主辦 / 簡介
dates   屬於演唱會哪幾天，例如 ["11/19","11/21"]；整段期間都有就填 []
start / end   開始與結束日，格式 "2026-11-01"；填了之後狀態和倒數會自動算
status  沒填 start/end 時才用：即將開始 / 進行中 / 已結束 / 待補充
tags    例如 ["免費","需填表單"]
place / time / tip / map   地點 / 時間 / 備註 / 地圖搜尋用的地址
links   [{t:"公告",u:"網址"}]
img     選填，圖片路徑，例如 "img/xxx.jpg"
upd     選填，資訊有更新時填更新日期 "2026-10-16"，卡片會在 7 天內顯示「資訊更新」標記
ll      選填，地圖總覽用的座標，例如 [[22.6879,120.3086]]；多個地點就放多組。沒填就不會出現在地圖上
added   數字，越大代表越新
刪除一筆：整個 {...} 連同後面的逗號一起刪掉。
注意：逗號、引號漏掉會讓整個網站空白，改完先看一眼網頁有沒有正常。 */
const DATA=[
{id:"jk-bus-stop",img:"img/jk-bus-stop.jpg",ll:[[22.7046,120.2945]],city:"kh",type:["公車站牌"],title:"JUNGKOOK 柾國公車站牌",by:"@to_jungkook.97",desc:"公車站牌應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:["免費"],added:2,place:"高雄市楠梓區左楠路1號左楠路上",time:"11/1–11/30，24 小時",tip:"捷運世運站4號出口北邊約 60 公尺",map:"高雄市楠梓區左楠路1號",links:[{t:"公告",u:"https://www.threads.com/share/FpRzVDxGp/"},{t:"主辦 Threads",u:"https://www.threads.com/@to_jungkook.97"}]},
{id:"jm-bus-stop",img:"img/jm-bus-stop.jpg",ll:[[22.7046,120.2945]],city:"kh",type:["公車站牌"],title:"JIMIN 智旻公車站牌",by:"@fang.xiii13",desc:"高雄世運公車站候車亭應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-10-20",end:"2026-11-30",tags:["免費"],added:3,place:"高雄市楠梓區左楠路1號左楠路上",time:"10/20–11/30，24 小時",tip:"捷運世運站4號出口北邊約 60 公尺",map:"高雄市楠梓區左楠路1號",links:[{t:"公告",u:"https://www.threads.com/share/D8rrFUxdC/"},{t:"主辦 Threads",u:"https://www.threads.com/@fang.xiii13"}]},
{id:"tk-bus-stop",img:"img/tk-bus-stop.jpg",ll:[[22.7040,120.2960]],city:"kh",type:["公車站牌"],title:"柾泰公車站牌",by:"@team.taekookie、@v.k_snow、@kookv_taiwan",desc:"公車站牌應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:["免費"],added:4,place:"高雄世運R17世運站（左楠路上近宏毅一路）",time:"11/1–11/30，24 小時",tip:"—",map:"高雄 世運站 左楠路 宏毅一路",links:[{t:"公告",u:"https://www.threads.com/share/HfOqBdr15/"},{t:"@team.taekookie",u:"https://www.threads.com/@team.taekookie"},{t:"@v.k_snow",u:"https://www.threads.com/@v.k_snow"},{t:"@kookv_taiwan",u:"https://www.threads.com/@kookv_taiwan"}]},
{id:"jin-exhibit",img:"img/jin-exhibit.jpg",ll:[[22.6211,120.2805]],city:"kh",type:["展覽"],title:"小勇敢 JIN’S LOVE QUEST",by:"@ourbabyjin92",desc:"JIN 攝影展，付費報名入場。",dates:["11/20","11/21","11/22"],status:"即將開始",start:"2026-11-20",end:"2026-11-22",tags:["付費報名入場"],added:5,place:"Pinway 8號倉庫（高雄市鹽埕區瀨南街8號二樓）",time:"11/20、11/21 10:00–19:00，11/22 10:00–14:30",tip:"—",map:"高雄市鹽埕區瀨南街8號",links:[{t:"公告",u:"https://www.threads.com/share/GMpU7TnnA/"},{t:"主辦 Threads",u:"https://www.threads.com/@ourbabyjin92"}]},
{id:"jm-led-truck",img:"img/jm-led-truck.jpg",city:"kh",type:["LED廣告車"],title:"JIMIN LED廣告車",by:"@chang_sasha",desc:"JIMIN 高雄應援大卡車，預計於演唱會期間在高雄市區巡迴。",dates:["11/21","11/22"],status:"即將開始",start:"2026-11-21",end:"2026-11-22",tags:["免費"],added:6,upd:"2026-10-16",ll:[[22.6879,120.3086],[22.6693,120.3029],[22.7046,120.2936]],place:"高雄市區巡迴（高鐵左營站、漢神巨蛋、高雄國家體育館周邊）",time:"11/21–11/22 10:30–19:30（依巡迴時段）",tip:"預計 10:30–12:00 高鐵左營站｜12:30–14:00 漢神巨蛋周邊｜14:30–19:30 高雄國家體育館周邊。實際路線與時間依當日交通管制調整，以主辦公告為準",map:"高雄國家體育館",links:[{t:"公告",u:"https://www.threads.com/share/D1qT3D_pj/"},{t:"主辦 Threads",u:"https://www.threads.com/@chang_sasha"}]},
{id:"jm-cafe",city:"kh",type:["應援咖啡廳"],title:"JIMIN 應援咖啡廳",by:"@ethereal__jimin",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:7,ll:[[22.7036,120.3013]],place:"沐沐茶飲專賣店（高雄市楠梓區宏毅一路6號）",time:"11/19–11/22",tip:"—",map:"高雄市楠梓區宏毅一路6號",links:[{t:"公告",u:"https://www.threads.com/share/Efzbr3r4M/"},{t:"主辦 Threads",u:"https://www.threads.com/@ethereal__jimin"}]},
{id:"bts-cafe-luxe",img:"img/bts-cafe-luxe.jpg",city:"kh",type:["應援咖啡廳"],title:"BTS應援咖啡廳",by:"@dai_an_23、@anya_shhhee",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:8,ll:[[22.6603,120.3040]],place:"魯克思咖啡（高雄市左營區新上里修明街166號）",time:"11/19–11/22 10:00–19:30",tip:"已開放預約",map:"高雄市左營區修明街166號",links:[{t:"公告",u:"https://www.threads.com/share/P0ghJE2r6/"},{t:"@dai_an_23",u:"https://www.threads.com/@dai_an_23"},{t:"@anya_shhhee",u:"https://www.threads.com/@anya_shhhee"}]},
{id:"tae-cafe",img:"img/tae-cafe.jpg",city:"kh",type:["應援咖啡廳"],title:"FOR US金泰亨應援咖啡廳",by:"@forus.tae",desc:"需配合店家低銷，已開放預約。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:9,ll:[[22.6691,120.2998]],place:"MISS MIMI COFFEE（高雄市左營區新下里新勝街21號）",time:"—",tip:"已開放預約",map:"高雄市左營區新勝街21號",links:[{t:"公告",u:"https://www.threads.com/share/HvwPc8SH6/"},{t:"主辦 Threads",u:"https://www.threads.com/@forus.tae"}]},
{id:"tae-cafe-golden-vibe",city:"kh",type:["應援咖啡廳"],title:"金泰亨應援咖啡廳",by:"@maya1230taetae",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:10,ll:[[22.6629,120.3034]],place:"GOLDEN VIBE 甜甜圈 · 咖啡 · 啤酒（高雄市左營區新上里博愛二路312號）",time:"11/19–11/22",tip:"—",map:"高雄市左營區博愛二路312號",links:[{t:"公告",u:"https://www.threads.com/share/Dsg5Pc2lx/"},{t:"主辦 Threads",u:"https://www.threads.com/@maya1230taetae"}]},
{id:"lador-popup",img:"img/lador-popup.jpg",city:"kh",type:["快閃店"],title:"LADOR高雄快閃店",by:"@lador_tw",desc:"LADOR 高雄快閃店。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:[],added:11,ll:[[22.6701,120.3030]],place:"高雄漢神巨蛋（高雄市左營區新下里博愛二路777號）",time:"11/1–11/30",tip:"—",map:"高雄市左營區博愛二路777號",links:[{t:"主辦 Threads",u:"https://www.threads.com/@lador_tw"}]},
{id:"compose-coffee-kh",img:"img/compose-coffee-kh.jpg",city:"kh",type:["咖啡廳"],title:"COMPOSE COFFEE高雄篤敬店",by:"@composecoffeday_kh",desc:"COMPOSE COFFEE 高雄篤敬店。",dates:[],status:"進行中",tags:[],added:12,ll:[[22.6646,120.3023]],place:"COMPOSE COFFEE高雄篤敬店（高雄市鼓山區篤敬路37號1樓）",time:"—",tip:"營業時間 07:30–19:30",map:"高雄市鼓山區篤敬路37號",links:[{t:"主辦 Threads",u:"https://www.threads.com/@composecoffeday_kh"}]},
{id:"fan-banner",img:"img/fan-banner.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/19"],status:"即將開始",start:"2026-11-19",end:"2026-11-19",tags:[],added:13,place:"高雄國家體育場（場內）",time:"—",tip:"於指定歌曲響起時，全場同步高舉手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/GXvDHqrLi/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"fan-banner-1121",img:"img/fan-banner-1121.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/21"],status:"即將開始",start:"2026-11-21",end:"2026-11-21",tags:[],added:14,place:"高雄國家體育場（場內）",time:"—",tip:"於指定歌曲響起時，全場同步高舉手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/HcQCal4BS/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"fan-banner-1122",img:"img/fan-banner-1122.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/22"],status:"即將開始",start:"2026-11-22",end:"2026-11-22",tags:[],added:15,place:"高雄國家體育場（場內）",time:"—",tip:"於成員們坐在旋轉舞台上說話時，全場同步舉起手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/GgxCIAdFZ/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"v-bday-with-tae",img:"img/v-bday-with-tae.jpg",sec:"birthday",member:"V",type:["應援咖啡廳"],title:"V 生日應援咖啡廳｜With you, with TAE",by:"@luv_kimbear",desc:"KAJIMA CAFE 가지마 카페 咖機馬 V 生日應援咖啡廳，需配合店家低銷。",dates:["12/26","12/27","12/28","12/29","12/30"],status:"即將開始",start:"2026-12-26",end:"2026-12-31",tags:["須配合店家低銷"],added:100,ll:[[25.05787718879996,121.53247424990992]],place:"KAJIMA CAFE 가지마 카페 咖機馬（臺北市中山區松江路204巷11號1樓）",time:"12/26–12/31 11:00–21:00（12/30 為 V 生日）",tip:"—",map:"臺北市中山區松江路204巷11號",links:[{t:"公告",u:"https://www.threads.com/share/F5QuoXv8s/"},{t:"主辦 Threads",u:"https://www.threads.com/@luv_kimbear"}]},
{id:"jimin-land-cafe",img:"img/jimin-land-cafe.jpg",sec:"birthday",member:"Jimin",type:["應援咖啡廳"],title:"JIMIN 生日應援咖啡廳｜Jimin Land",by:"@kajima__cafe",desc:"KAJIMA CAFE 가지마 카페 咖機馬 JIMIN 生日應援咖啡廳。",dates:["10/10","10/11","10/12","10/13"],status:"已結束",start:"2026-10-10",end:"2026-10-13",tags:["須配合店家低銷"],added:101,ll:[[25.05787718879996,121.53247424990992]],place:"KAJIMA CAFE 가지마 카페 咖機馬（臺北市中山區松江路204巷11號1樓）",time:"10/10–10/13 11:00–21:00",tip:"—",map:"臺北市中山區松江路204巷11號",links:[{t:"公告",u:"https://www.threads.com/share/Haz-ojOHM/"},{t:"主辦 Threads",u:"https://www.threads.com/@kajima__cafe"}]}
];
let UPDATED="2026-10-16"; /* 每次更新內容後，把這個日期改成當天 */
