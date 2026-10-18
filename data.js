/* ===== 網站設定 =====
SHEET_CSV_URL：把 Google 試算表「發布到網路」的 CSV 連結貼在引號裡，網站就會改讀試算表。
留空 "" 的話，就只用下面這份內建資料。
注意：下面的 DATA 是從試算表複製出來的「備用資料」（2026-10-16 同步），平常網站以試算表為準，只有試算表讀不到時才會用到；試算表有大改時，需要重新同步一次。 */
const SHEET_CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vSA6rfBSfMh__qX2Ox4F5EgZsbLODscmo-9jCiczF_S5r0eBsmjSyKuezQyhJ0UU_rRPfgMCVCuCUOe/pub?gid=1813070755&single=true&output=csv";
const SONGS_CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-1vSYFXr-s_NJnlAYGhBtZZLs_Ue5skP0Ag0CxkTiPHvK5tBhngeNsnO5A_bCF3vzMg/pub?gid=65916696&single=true&output=csv";
/* SUBMIT_URL：投稿應援資訊的連結（Google 表單、Threads 或 IG 私訊網址都可以）。填了之後，「還沒有收錄」的畫面會多一顆「我要提供應援資訊」按鈕；留空 "" 就不顯示。 */
const SUBMIT_URL="https://forms.gle/er9iQ4miu4wsfALZ7";

/* ===== 演唱會歌單（選用；平常在歌曲試算表加「演唱會」欄就好，不用改這裡） =====
SETLISTS：每場演唱會一個歌單，歌名照演出順序排，歌名要跟試算表「歌名」欄一樣（大小寫不拘）。
CONCERT_COVERS：演唱會封面圖。也可以直接在試算表「演唱會封面」欄填「演唱會名稱=圖片網址」，試算表有填的優先；都沒填就顯示彩色底加名稱。
要啟用：把下面兩段前後的註解符號拿掉，再改成自己的內容。試算表的「演唱會」欄和這裡可以混用。
const SETLISTS={
  "ARIRANG":["Swim","Hooligan"],
  "第二場演唱會名稱":["歌名1","歌名2"]
};
const CONCERT_COVERS={
  "ARIRANG":"IMG/xxx.png"
};
*/

/* ===== 怎麼新增或修改應援（只需要改這個檔案） =====
1. 複製下面任一筆 {...}，貼在最後一筆後面（筆與筆之間要有逗號），再改裡面的文字。
2. 有圖片：把圖片上傳到 IMG 資料夾，並在該筆加上  img:"IMG/檔名.jpg"，沒有圖就不用寫。
3. 最後把檔案最下面的 UPDATED 改成當天日期。
id      每筆唯一的英文代號，不可重複（打卡紀錄靠它記）
sec     巡演不用填；生日應援填 "birthday"
city    巡演："kh" 高雄、"hk" 香港；生日應援：填城市或國家都可以，例如 台北、香港、東京、首爾（不填算台灣）
member  生日應援才需要：BTS（出道周年）/ RM / Jin / SUGA / j-hope / Jimin / V / Jungkook
type    例如 ["公車站牌"]，可選：應援企劃、LED廣告車、公車站牌、LED電視牆、燈箱/看板、應援咖啡廳、咖啡廳、快閃店、展覽
title / by / desc    名稱 / 主辦 / 簡介
dates   屬於演唱會哪幾天，例如 ["11/19","11/21"]；整段期間都有就填 []
start / end   開始與結束日，格式 "2026-11-01"；填了之後狀態和倒數會自動算
status  沒填 start/end 時才用：即將開始 / 進行中 / 已結束 / 待補充
tags    例如 ["免費","需填表單"]
place / time / tip / map   地點 / 時間 / 備註 / 地圖搜尋用的地址
links   [{t:"公告",u:"網址"}]
img     選填，圖片路徑，例如 "IMG/xxx.jpg"
upd     選填，資訊有更新時填更新日期 "2026-10-16"，卡片會在 7 天內顯示「資訊更新」標記
ll      選填，地圖總覽用的座標，例如 [[22.6879,120.3086]]；多個地點就放多組。沒填就不會出現在地圖上
added   數字，越大代表越新
刪除一筆：整個 {...} 連同後面的逗號一起刪掉。
注意：逗號、引號漏掉會讓整個網站空白，改完先看一眼網頁有沒有正常。 */
const DATA=[
{id:"jk-bus-stop",img:"IMG/806505481_18030556316906794_1048511043942678951_n.jpg",city:"kh",type:["公車站牌"],title:"JUNGKOOK 柾國公車站牌",by:"@to_jungkook.97",desc:"公車站牌應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:["免費"],added:2,ll:[[22.7046,120.2945]],place:"高雄市楠梓區左楠路1號左楠路上",time:"11/1–11/30，24 小時",tip:"捷運世運站4號出口北邊約 60 公尺",map:"高雄市楠梓區左楠路1號",links:[{t:"公告",u:"https://www.threads.com/share/FpRzVDxGp/"},{t:"主辦 Threads",u:"https://www.threads.com/@to_jungkook.97"}]},
{id:"jm-bus-stop",img:"IMG/809812549_17897250789603050_6231045360812889400_n.jpg",city:"kh",type:["公車站牌"],title:"JIMIN 智旻公車站牌",by:"@fang.xiii13",desc:"高雄世運公車站候車亭應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-10-20",end:"2026-11-30",tags:["免費"],added:3,ll:[[22.7046,120.2945]],place:"高雄市楠梓區左楠路1號左楠路上",time:"10/20–11/30，24 小時",tip:"捷運世運站4號出口北邊約 60 公尺",map:"高雄市楠梓區左楠路1號",links:[{t:"公告",u:"https://www.threads.com/share/D8rrFUxdC/"},{t:"主辦 Threads",u:"https://www.threads.com/@fang.xiii13"}]},
{id:"tk-bus-stop",img:"IMG/790268631_18105739856608617_6299199928404236863_n.jpg",city:"kh",type:["公車站牌"],title:"柾泰公車站牌",by:"@team.taekookie、@v.k_snow、@kookv_taiwan",desc:"公車站牌應援，歡迎前往拍照打卡。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:["免費"],added:4,ll:[[22.704,120.296]],place:"高雄世運R17世運站（左楠路上近宏毅一路）",time:"11/1–11/30，24 小時",tip:"—",map:"高雄 世運站 左楠路 宏毅一路",links:[{t:"公告",u:"https://www.threads.com/share/HfOqBdr15/"},{t:"@team.taekookie",u:"https://www.threads.com/@team.taekookie"},{t:"@v.k_snow",u:"https://www.threads.com/@v.k_snow"},{t:"@kookv_taiwan",u:"https://www.threads.com/@kookv_taiwan"}]},
{id:"jin-exhibit",img:"IMG/825324186_18126159376675812_4242290280187784984_n.webp",city:"kh",type:["展覽"],title:"小勇敢 JIN’S LOVE QUEST",by:"@ourbabyjin92",desc:"JIN 攝影展，付費報名入場。",dates:["11/20","11/21","11/22"],status:"即將開始",start:"2026-11-20",end:"2026-11-22",tags:["付費報名入場"],added:5,ll:[[22.6211,120.2805]],place:"Pinway 8號倉庫（高雄市鹽埕區瀨南街8號二樓）",time:"11/20、11/21 10:00–19:00，11/22 10:00–14:30",tip:"—",map:"高雄市鹽埕區瀨南街8號",links:[{t:"公告",u:"https://www.threads.com/share/GMpU7TnnA/"},{t:"主辦 Threads",u:"https://www.threads.com/@ourbabyjin92"}]},
{id:"jm-led-truck",img:"IMG/849194280_17974202868148919_6295494021129378764_n.jpg",city:"kh",type:["LED廣告車"],title:"JIMIN LED廣告車",by:"@chang_sasha",desc:"JIMIN 高雄應援大卡車，預計於演唱會期間在高雄市區巡迴。",dates:["11/21","11/22"],status:"即將開始",start:"2026-11-21",end:"2026-11-22",tags:["免費"],added:6,upd:"2026-10-16",ll:[[22.6879,120.3086],[22.6693,120.3029],[22.7046,120.2936]],place:"高雄市區巡迴（高鐵左營站、漢神巨蛋、高雄國家體育館周邊）",time:"11/21–11/22 10:30–19:30（依巡迴時段）",tip:"預計 10:30–12:00 高鐵左營站｜12:30–14:00 漢神巨蛋周邊｜14:30–19:30 高雄國家體育館周邊。實際路線與時間依當日交通管制調整，以主辦公告為準",map:"高雄國家體育館",links:[{t:"公告",u:"https://www.threads.com/share/D1qT3D_pj/"},{t:"主辦 Threads",u:"https://www.threads.com/@chang_sasha"}]},
{id:"jm-cafe",city:"kh",type:["應援咖啡廳"],title:"JIMIN 應援咖啡廳",by:"@ethereal__jimin",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:7,ll:[[22.7036,120.3013]],place:"沐沐茶飲專賣店（高雄市楠梓區宏毅一路6號）",time:"11/19–11/22",tip:"—",map:"高雄市楠梓區宏毅一路6號",links:[{t:"公告",u:"https://www.threads.com/share/Efzbr3r4M/"},{t:"主辦 Threads",u:"https://www.threads.com/@ethereal__jimin"}]},
{id:"bts-cafe-luxe",img:"IMG/bts-cafe-luxe.jpg",city:"kh",type:["應援咖啡廳"],title:"BTS應援咖啡廳",by:"@dai_an_23、@anya_shhhee",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:8,ll:[[22.6603,120.304]],place:"魯克思咖啡（高雄市左營區新上里修明街166號）",time:"11/19–11/22 10:00–19:30",tip:"已開放預約",map:"高雄市左營區修明街166號",links:[{t:"公告",u:"https://www.threads.com/share/P0ghJE2r6/"},{t:"@dai_an_23",u:"https://www.threads.com/@dai_an_23"},{t:"@anya_shhhee",u:"https://www.threads.com/@anya_shhhee"}]},
{id:"tae-cafe",img:"IMG/810051501_18063278075602146_979523277784588039_n.jpg",city:"kh",type:["應援咖啡廳"],title:"FOR US金泰亨應援咖啡廳",by:"@forus.tae",desc:"需配合店家低銷，已開放預約。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:9,ll:[[22.6691,120.2998]],place:"MISS MIMI COFFEE（高雄市左營區新下里新勝街21號）",time:"—",tip:"已開放預約",map:"高雄市左營區新勝街21號",links:[{t:"公告",u:"https://www.threads.com/share/HvwPc8SH6/"},{t:"主辦 Threads",u:"https://www.threads.com/@forus.tae"}]},
{id:"tae-cafe-golden-vibe",city:"kh",type:["應援咖啡廳"],title:"金泰亨應援咖啡廳",by:"@maya1230taetae",desc:"需配合店家低銷。",dates:["11/19","11/20","11/21","11/22"],status:"即將開始",start:"2026-11-19",end:"2026-11-22",tags:["須配合店家低銷"],added:10,ll:[[22.6629,120.3034]],place:"GOLDEN VIBE 甜甜圈 · 咖啡 · 啤酒（高雄市左營區新上里博愛二路312號）",time:"11/19–11/22",tip:"—",map:"高雄市左營區博愛二路312號",links:[{t:"公告",u:"https://www.threads.com/share/Dsg5Pc2lx/"},{t:"主辦 Threads",u:"https://www.threads.com/@maya1230taetae"}]},
{id:"lador-popup",img:"IMG/845808106_17963512746219674_4729747783214989718_n.jpg",city:"kh",type:["快閃店"],title:"LADOR高雄快閃店",by:"@lador_tw",desc:"LADOR 高雄快閃店。",dates:[],status:"即將開始",start:"2026-11-01",end:"2026-11-30",tags:[],added:11,ll:[[22.6701,120.303]],place:"高雄漢神巨蛋（高雄市左營區新下里博愛二路777號）",time:"11/1–11/30",tip:"—",map:"高雄市左營區博愛二路777號",links:[{t:"主辦 Threads",u:"https://www.threads.com/@lador_tw"}]},
{id:"compose-coffee-kh",img:"IMG/847225999_18108450872222477_37507237930206172_n.jpg",city:"kh",type:["咖啡廳"],title:"COMPOSE COFFEE高雄篤敬店",by:"@composecoffeday_kh",desc:"COMPOSE COFFEE 高雄篤敬店。",dates:[],status:"進行中",tags:[],added:12,ll:[[22.6646,120.3023]],place:"COMPOSE COFFEE高雄篤敬店（高雄市鼓山區篤敬路37號1樓）",time:"07:30–19:30",tip:"—",map:"高雄市鼓山區篤敬路37號",links:[{t:"主辦 Threads",u:"https://www.threads.com/@composecoffeday_kh"}]},
{id:"fan-banner",img:"IMG/830281752_18150677017579771_3171909249337657901_n.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/19"],status:"即將開始",start:"2026-11-19",end:"2026-11-19",tags:[],added:13,place:"高雄國家體育場（場內）",time:"—",tip:"於指定歌曲響起時，全場同步高舉手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/GXvDHqrLi/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"fan-banner-1121",img:"IMG/834417973_18092506643427891_4968849942675241539_n.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/21"],status:"即將開始",start:"2026-11-21",end:"2026-11-21",tags:[],added:14,place:"高雄國家體育場（場內）",time:"—",tip:"於指定歌曲響起時，全場同步高舉手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/HcQCal4BS/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"fan-banner-1122",img:"IMG/843089713_18093128282427891_975955073299742983_n.jpg",city:"kh",type:["應援企劃"],title:"場內手幅",by:"@bts_tw_base",desc:"演唱會場內應援手幅。",dates:["11/22"],status:"即將開始",start:"2026-11-22",end:"2026-11-22",tags:[],added:15,place:"高雄國家體育場（場內）",time:"—",tip:"於成員們坐在旋轉舞台上說話時，全場同步舉起手幅！",map:"高雄國家體育場",links:[{t:"公告",u:"https://www.threads.com/share/GgxCIAdFZ/"},{t:"主辦 Threads",u:"https://www.threads.com/@bts_tw_base"}]},
{id:"v-bday-with-tae",img:"IMG/825325243_18097245773280482_523418552028897855_n.jpg",sec:"birthday",city:"台北",member:"V",type:["應援咖啡廳"],title:"V 生日應援咖啡廳｜With you, with TAE",by:"@luv_kimbear",desc:"KAJIMA CAFE 가지마 카페 咖機馬 V 生日應援咖啡廳，需配合店家低銷。",dates:["12/26","12/27","12/28","12/29","12/30"],status:"尚未開始",start:"2026-12-26",end:"2026-12-31",tags:["須配合店家低銷"],added:100,ll:[[25.05787718879996,121.53247424990992]],place:"KAJIMA CAFE 가지마 카페 咖機馬（臺北市中山區松江路204巷11號1樓）",time:"12/26–12/31 11:00–21:00（12/30 為 V 生日）",tip:"—",map:"臺北市中山區松江路204巷11號",links:[{t:"公告",u:"https://www.threads.com/share/F5QuoXv8s/"},{t:"主辦 Threads",u:"https://www.threads.com/@luv_kimbear"}]},
{id:"jimin-land-cafe",img:"IMG/825326223_18123145468858019_5162367266971675506_n.jpg",sec:"birthday",city:"台北",member:"Jimin",type:["應援咖啡廳"],title:"JIMIN 生日應援咖啡廳｜Jimin Land",by:"@kajima__cafe",desc:"KAJIMA CAFE 가지마 카페 咖機馬 JIMIN 生日應援咖啡廳。",dates:["10/10","10/11","10/12","10/13"],status:"已結束",start:"2026-10-10",end:"2026-10-13",tags:["須配合店家低銷"],added:101,ll:[[25.05787718879996,121.53247424990992]],place:"KAJIMA CAFE 가지마 카페 咖機馬（臺北市中山區松江路204巷11號1樓）",time:"10/10–10/13 11:00–21:00",tip:"—",map:"臺北市中山區松江路204巷11號",links:[{t:"公告",u:"https://www.threads.com/share/Haz-ojOHM/"},{t:"主辦 Threads",u:"https://www.threads.com/@kajima__cafe"}]},
{id:"jimin-cafe",img:"IMG/848587197_17989838727108317_2408629795203620199_n.jpg",sec:"birthday",city:"香港",member:"Jimin",type:["應援咖啡廳"],title:"SERENDIPITY W/ ST JIMIN",by:"@_mikoyiyut_",desc:"JIMIN 生日應援咖啡廳",dates:[],status:"進行中",start:"2026-10-11",end:"2026-10-17",tags:["須配合店家低銷"],added:102,ll:[[22.306687182815704,114.16852340408352]],place:"Pastime Cafe Jordan（香港九龍佐敦炮台街 29-31 號地下，G/F, 29-31 Battery Street, Jordan）",time:"10/11-10/17 09:00 – 22:00",tip:"—",map:"香港九龍佐敦炮台街",links:[{t:"公告",u:"https://www.threads.com/share/GfB5jZP5i/"},{t:"主辦 Threads",u:"https://www.threads.com/@_mikoyiyut_"}]},
{id:"jimin-cafe1",img:"IMG/825815365_17907641433515197_6374730516099589552_n.jpg",sec:"birthday",city:"台中",member:"Jimin",type:["應援咖啡廳"],title:"WHO IS HEART WAITING FOR?",by:"@btsfswt_0613",desc:"JIMIN 生日應援咖啡廳",dates:["10/9","10/10","10/11","10/12","10/13"],status:"已結束",start:"2026-10-09",end:"2026-10-13",tags:["須配合店家低銷"],added:103,ll:[[24.148399966941284,120.65206018785456]],place:"MIO_未央生花研(403臺中市西區公正里大昌街245號)",time:"10/9-10/13 10:00~20:00",tip:"—",map:"403臺中市西區公正里大昌街245號",links:[{t:"公告",u:"https://www.threads.com/share/HD-ZDb1o8/"},{t:"主辦 Threads",u:"https://www.threads.com/@btsfswt_0613"}]}
];
let UPDATED="2026-10-16"; /* 每次更新內容後，把這個日期改成當天 */
