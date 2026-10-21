/* 活動資料在 data.js，新增活動請改那個檔案 */
/* 巡演城市只在這裡維護：加一個城市就多一組 {…}。y＝開演年份，al＝試算表「城市」欄可以填的寫法（代碼、中文名都行），showDays＝開演日；演唱會限定卡、成就、歌單預測、試算表判斷都從這份清單自動長出來 */
const MEMBERS=[["BTS",6,13],["RM",9,12],["Jin",12,4],["SUGA",3,9],["j-hope",2,18],["Jimin",10,13],["V",12,30],["Jungkook",9,1]];

const TYPES=["應援企劃","燈箱/看板","LED電視牆","公車站牌","應援咖啡廳","LED廣告車","咖啡廳","快閃店","展覽"];
const WD={"11/19":"週四","11/21":"週六","11/22":"週日","3/4":"週四","3/6":"週六","3/7":"週日"};
const rd=k=>{try{return new Set(JSON.parse(localStorage.getItem(k)||"[]"))}catch(e){return new Set()}};
const STATUS=["全部","進行中","即將開始","已結束","待補充"];
const TAGS=["免費","無領取條件","需填表單","需出示門票","需部分粉絲證明","可另外寄送","可代領","尚待補充","有實體圖"];
/* 打卡完整時間：kh-donetime 記每個打卡的「年-月-日T時:分」（本機時間），dd 仍只記月/日給畫面顯示用；之後要做依時段或跨年的功能就讀這個 */
let ddT=(()=>{try{const o=JSON.parse(localStorage.getItem("kh-donetime")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}})();
function tmNow(){const n=new Date(),p=v=>String(v).padStart(2,"0");return n.getFullYear()+"-"+p(n.getMonth()+1)+"-"+p(n.getDate())+"T"+p(n.getHours())+":"+p(n.getMinutes())}
function tmSave(){try{localStorage.setItem("kh-donetime",JSON.stringify(ddT))}catch(e){}}
let favs=rd("kh-fav"),done=rd("kh-done"),dd=(()=>{try{const o=JSON.parse(localStorage.getItem("kh-donedate")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}})(),cur="全部",onlyFav=false,kw="",st="全部",so="soon",tagSel=new Set();
/* 藝人同款足跡開關：FOOT_PUBLIC=false＝對一般使用者鎖起來（首頁入口灰色＋鎖頭＋「新功能／暫未開放」，連 ?section=foot 也進不去）；要正式開放就改成 true，並把 sw.js 的 VER 換一個值。
   自己預覽：用 ?section=foot&preview=foot 開一次，這台裝置就會解鎖（存在 localStorage）；用 ?preview=off 關掉預覽 */
const FOOT_PUBLIC=false;
const FOOT_OPEN=FOOT_PUBLIC||(()=>{try{const v=new URLSearchParams(location.search).get("preview");if(v==="foot")localStorage.setItem("foot-preview","1");else if(v==="off")localStorage.removeItem("foot-preview");return localStorage.getItem("foot-preview")==="1"}catch(e){return false}})();
if(!FOOT_OPEN){const b=document.querySelector(".entry.foot");if(b){b.removeAttribute("data-go");b.classList.add("lock");b.setAttribute("aria-disabled","true");b.title="新功能／暫未開放";const ic=b.querySelector(".ic");if(ic)ic.innerHTML='<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true" fill="#8a93a8"><rect x="3" y="0" width="4" height="1"/><rect x="2" y="1" width="1" height="3"/><rect x="7" y="1" width="1" height="3"/><rect x="1" y="4" width="8" height="5"/><rect x="4" y="5" width="2" height="2" fill="#fff"/><rect x="4" y="7" width="2" height="1" fill="#fff"/></svg>';const sp=b.querySelector(".et span");if(sp)sp.textContent="新功能／暫未開放";b.addEventListener("click",()=>{if(typeof toast==="function")toast("新功能，暫未開放")})}}
let lastStamp="",day="全部",city="kh",mem="全部",reg="全部",sec="home";try{const q=new URLSearchParams(location.search);const c=q.get("city");if(c&&CITIES[c]){city=c;sec="tour"}const z=q.get("section");if(z==="tour"||z==="birthday"||z==="songs"||(z==="foot"&&FOOT_OPEN))sec=z}catch(e){}
function head(){
document.body.dataset.sec=sec;
const home=sec==="home",tour=sec==="tour",bd=sec==="birthday";
$("#homeBox").hidden=!home;$("#notesBox").hidden=!home;{const an=$("#ann");if(an){if(!home)an.hidden=true;else try{annR()}catch(e){}}}$("#app").hidden=home||sec==="songs"||sec==="foot";$("#songs").hidden=sec!=="songs";$("#foot").hidden=sec!=="foot";$("#favBtn").hidden=home||sec==="songs"||sec==="foot";
$("#cities").hidden=!tour;$("#days").hidden=!tour;$("#members").hidden=!bd;$("#regions").hidden=!bd;$("#nextBd").hidden=!bd;
const h=document.querySelector(".hero h1");
if(home){try{entSync()}catch(e){}$("#intro").textContent="";h.textContent="BTS 應援地圖";$("#scr").textContent="ARMY FAN PROJECTS";$("#show").innerHTML="<span>選擇你想看的應援</span>";document.title="BTS 應援地圖";return}
if(sec==="foot"){h.textContent="藝人同款足跡";$("#scr").textContent="FOOTPRINTS";$("#intro").textContent="整理成員去過的店家與景點，去過就按「我去過了」留下紀錄";$("#show").innerHTML="<span>成員去過的店家與景點</span>";document.title="藝人同款足跡｜BTS 應援地圖";try{fpR()}catch(e){}return}
if(sec==="songs"){h.textContent="歌曲空耳／應援";$("#scr").textContent="SONG GUIDE";$("#intro").textContent="整理每首歌的空耳和應援法，現場跟著喊";$("#show").innerHTML="<span>演唱會歌曲的空耳與應援法整理</span>";document.title="歌曲空耳／應援｜BTS 應援地圖";try{songsR()}catch(e){}return}
if(bd){h.textContent="BTS 生日應援地圖";$("#scr").textContent="Happy Birthday";$("#intro").textContent="依成員整理的生日與 BTS 出道周年應援";$("#show").innerHTML="<span>各成員生日與 BTS 出道周年應援整理</span>";document.title="BTS 生日應援地圖";members();regions();return}
const c=CITIES[city];h.textContent="ARIRANG 巡演粉絲應援地圖";$("#show").innerHTML=c.show.map(x=>`<span>${x}</span>`).join("");$("#scr").textContent="ARIRANG in "+c.en;$("#intro").textContent="ARIRANG場次的應援地圖，附日期分頁與打卡集章";document.title="ARIRANG 巡演粉絲應援地圖｜"+c.name;
$("#cities").innerHTML=Object.keys(CITIES).map(k=>`<button class="chip" aria-pressed="${k===city}" data-city="${k}">${CITIES[k].name}</button>`).join("");days()}
function skey(d){const t=stat(d);if(t==="進行中")return -1;if(t==="即將開始"&&d.start)return Math.round((day0(d.start)-today0())/864e5);return t==="即將開始"?9998:9999}
function wallR(a){const w=$("#wall");w.hidden=!a.length;if(!a.length){w.innerHTML="";return}
w.innerHTML=`<h2>🏆 回顧紀念牆<small>${a.length} 個已結束的應援</small></h2><div class="wgrid">${a.map(d=>`<div class="tile"><div class="tp">${d.img?`<img src="${d.img}" alt="${esc(d.title)}" loading="lazy" decoding="async">`:`<span class="ph">${stamp(DATA.indexOf(d),true)}</span>`}${done.has(d.id)?`<span class="stamp">${stamp(DATA.indexOf(d))}</span>`:""}</div><b>${esc(d.title)}</b><span>${esc(d.time)}</span>${d.links&&d.links[0]?`<a href="${esc(d.links[0].u)}" target="_blank" rel="noopener">回顧貼文 ↗</a>`:""}</div>`).join("")}</div>`}
function inSec(d){return (d.sec||"tour")===sec&&(sec==="birthday"||d.city===city)}
function gos(z){if(z==="foot"&&!FOOT_OPEN)return;if(z==="foot"){fpCt="";fpCity="";fpMem="全部";fpCat="全部";fpOnly=false;fpQ="";try{sessionStorage.removeItem("fp-state")}catch(e){}}if(z==="songs"){ALB="";try{MEM="";VIEW="a";sessionStorage.setItem("song-view","a")}catch(e){}try{document.getElementById("sq").value=""}catch(e){}}sec=z;day="全部";cur="全部";mem=z==="birthday"?nearestMem():"全部";reg="全部";onlyFav=false;resetPanel();$("#favBtn").setAttribute("aria-pressed",false);$("#favBtn").textContent="♡ 我的收藏";try{const u=z==="home"?"?":"?section="+z+(z==="tour"?"&city="+city:"");z==="home"?history.replaceState(null,"",u):history.pushState({in:1},"",u)}catch(x){}head();if(z!=="songs"&&z!=="foot"){chips();render()}window.scrollTo(0,0);if(z!=="songs"&&typeof songStop==="function")songStop();if(typeof a2hsSync==="function")a2hsSync();tourAuto(z)}
function bdDays(m){const t=today0();let d=new Date(t.getFullYear(),m[1]-1,m[2]);if(d<t)d=new Date(t.getFullYear()+1,m[1]-1,m[2]);return Math.round((d-t)/864e5)}
function members(){$("#members").innerHTML=MEMBERS.map(m=>{const x=m[0],k=bdDays(m),t=k===0?"🎂 今天":k+" 天";return `<button class="chip" aria-pressed="${x===mem}" data-mem="${x}" aria-label="${x}，${x==="BTS"?"出道周年":"生日"}${k===0?"就是今天":"還有 "+k+" 天"}">${x}<span class="cdn">${t}</span>${k===0?'<svg class="bdbd" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="2" height="1" fill="#ffd23f"/><rect x="4" y="1" width="2" height="2" fill="#ff8fb3"/><rect x="3" y="3" width="4" height="2" fill="#fff"/><rect x="2" y="5" width="6" height="2" fill="#6fb7ff"/><rect x="1" y="7" width="8" height="1" fill="#ffd23f"/></svg>':""}</button>`}).join("");
const n=[...MEMBERS].sort((a,b)=>bdDays(a)-bdDays(b))[0];const k=bdDays(n);const ay=new Date(today0().getTime()+k*864e5).getFullYear()-2013;$("#nextBd").textContent=n[0]==="BTS"?(k===0?`🎉 今天是 BTS 出道 ${ay} 週年！`:`🎉 下一個：BTS 出道 ${ay} 週年 ${n[1]}/${n[2]}，還有 ${k} 天`):(k===0?`🎂 今天是 ${n[0]} 的生日！`:`🎂 下一個生日：${n[0]} ${n[1]}/${n[2]}，還有 ${k} 天`)}
/* 預設成員：先看有沒有「進行中」的生日應援（生日已過也算），有就選那位；都沒有才選最近的下一個生日 */
function nearestMem(){
const act=new Set(DATA.filter(d=>d.sec==="birthday"&&stat(d)==="進行中").map(d=>d.member));
const cyc=m=>Math.min(bdDays(m),365-bdDays(m));
const pool=MEMBERS.filter(m=>act.has(m[0]));
return (pool.length?[...pool].sort((a,b)=>cyc(a)-cyc(b)):[...MEMBERS].sort((a,b)=>bdDays(a)-bdDays(b)))[0][0]}
/* 生日應援的地區：試算表「城市」欄填城市或國家都可以，下表把常見城市歸到國家；
   沒列在表裡的，就直接用填的字當成一個地區。不填算台灣。要新增對照，在下面加一行即可 */
const REG_MAP={};
[["台灣","tw 台灣 臺灣 台北 臺北 新北 桃園 新竹 台中 臺中 台南 臺南 高雄"],["香港","hk 香港"],["日本","jp 日本 東京 大阪 京都 名古屋 福岡 札幌"],["韓國","kr 韓國 南韓 首爾 釜山"],["新加坡","sg 新加坡"],["泰國","th 泰國 曼谷"],["馬來西亞","my 馬來西亞 吉隆坡"],["澳門","澳門"],["美國","us 美國 紐約 洛杉磯"]].forEach(([n,s])=>s.split(" ").forEach(k=>REG_MAP[k]=n));
const regOf=d=>{const v=String(d.city||"").trim();return v?(REG_MAP[v.toLowerCase()]||v):"台灣"};
function regionList(){const a=[];DATA.filter(d=>d.sec==="birthday"&&(mem==="全部"||d.member===mem)&&stat(d)!=="已結束").forEach(d=>{const r=regOf(d);if(!a.includes(r))a.push(r)});
const first=["台灣","香港"].filter(r=>a.includes(r));return [...first,...a.filter(r=>!first.includes(r))]}
function regions(){const L=regionList();if(reg!=="全部"&&!L.includes(reg))reg="全部";
$("#regions").hidden=!(sec==="birthday"&&L.length>1);
$("#regions").innerHTML=L.map(r=>`<button class="chip" aria-pressed="${r===reg}" data-reg="${esc(r)}">${esc(r)}</button>`).join("")}
function day0(s){const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d)}
function today0(){const n=new Date();return new Date(n.getFullYear(),n.getMonth(),n.getDate())}
function stat(d){if(d.start&&d.end){const t=today0();if(t<day0(d.start))return"即將開始";if(t>day0(d.end))return"已結束";return"進行中"}return d.status}
function timeTxt(d){const ok=v=>v&&v!=="—",t=ok(d.time)?d.time:"";if(/\d+\/\d+/.test(t)||!(d.dates||[]).length)return t||"—";const a=d.dates,r=a.length>1?a[0]+"–"+a[a.length-1]:a[0];return t?r+" "+t:r}
function tipTxt(d){const ok=v=>v&&v!=="—",p=[];if((d.tags||[]).includes("須配合店家低銷"))p.push("須配合店家低銷");if(ok(d.tip))p.push(d.tip);return p.length?p.join("、"):"—"}
function descTxt(d){let t=d.desc||"";const nz=x=>x.replace(/[\s。，,、]/g,"").toLowerCase();if(nz(t)&&(nz(d.title).includes(nz(t))||nz(t)===nz(d.title)))return"";(d.tags||[]).forEach(g=>{t=t.replace(g,"").replace(g.replace("須","需"),"")});if(d.tip&&t.includes("已開放預約")&&d.tip.includes("已開放預約"))t=t.replace("已開放預約","");return t.replace(/^[，,、\s]+|[，,、\s]+$/g,"").replace(/^。+$/,"").replace(/[，,]。/g,"。").trim()}
function cd(d){if(stat(d)==="進行中"&&d.end){const m=Math.round((day0(d.end)-today0())/864e5);if(m>3)return"";return`<span class="pill cd endsoon">⏰ ${m<=0?'今天結束':m===1?'明天結束':'剩 '+m+' 天'}</span>`}if(stat(d)!=="即將開始"||!d.start)return"";const n=Math.round((day0(d.start)-today0())/864e5);return`<span class="pill cd">⏳ ${n===1?"明天開始":"倒數 "+n+" 天"}</span>`}
function nw(d){if(!d.upd)return"";const n=Math.round((today0()-day0(d.upd))/864e5);if(n<0||n>7)return"";const p=d.upd.split("-");return`<span class="pill nw">🔔 資訊更新 ${p[1]*1}/${p[2]*1}</span>`}
function days(){const c=CITIES[city];$("#days").innerHTML=c.days.map(x=>`<button class="chip" aria-pressed="${x===day}" data-day="${x}">${x==="全部"?"全部日期":x}</button>`).join("")}
function stamp(i,faint){if(DATA[i]&&DATA[i].sec==="birthday"){const c=(x,y)=>faint?"#e6f6ff":x;return `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"${faint?' opacity=".5"':""}><rect x="4" y="0" width="2" height="1" fill="${c("#ffd23f")}"/><rect x="4" y="1" width="2" height="2" fill="${c("#6ec6ff")}"/><rect x="1" y="3" width="8" height="2" fill="${c("#ff8fb5")}"/><rect x="1" y="5" width="8" height="3" fill="${c("#e8b27a")}"/><rect x="1" y="6" width="8" height="1" fill="${c("#c2255c")}"/><rect x="0" y="8" width="10" height="1" fill="${c("#4b3f9e")}"/></svg>`}
const b=faint?"#e6f6ff":"#4b3f9e";return `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"${faint?' opacity=".5"':""}><g fill="${b}"><rect x="3" y="3" width="4" height="1"/><rect x="2" y="4" width="6" height="1"/><rect x="1" y="5" width="8" height="3"/><rect x="2" y="8" width="6" height="1"/><rect x="3" y="9" width="4" height="1"/></g><rect x="4" y="2" width="2" height="1" fill="#9aa3c7"/><rect x="2" y="5" width="2" height="1" fill="#fff"/><rect x="2" y="6" width="1" height="1" fill="#fff"/><g fill="#c9a06a"><rect x="5" y="1" width="1" height="1"/><rect x="6" y="0" width="1" height="1"/></g><g fill="#ffd23f"><rect x="7" y="0" width="1" height="1"/><rect x="9" y="0" width="1" height="1"/><rect x="8" y="1" width="1" height="1"/><rect x="7" y="2" width="1" height="1"/><rect x="9" y="2" width="1" height="1"/></g></svg>`}
/* 生日集章簿：只算「這一次生日」的場次：生日月還沒過，就算今年的；生日月一過，就換成明年的（沒有場次時集章簿自動隱藏，往年場次仍可在清單與回顧牆看，明年生日月是全新的一本）；依選到的成員與地區算格數（地區選「全部」時只算一個地區：有台灣就算台灣，沒有就算香港或其他第一個有場次的地區，避免不同國家混在一起永遠集不滿），已結束的也算一格；巡演維持原本只算未結束或已打卡的 */
function bookCy(){const m=MEMBERS.find(x=>x[0]===mem),n=new Date(),y=n.getFullYear();return m&&m[1]<n.getMonth()+1?y+1:y}
function bookYr(d){const v=d.start||d.end;return !!v&&+String(v).slice(0,4)===bookCy()}
function bookReg(){if(reg!=="全部")return reg;const a=[];DATA.filter(d=>d.sec==="birthday"&&(mem==="全部"||d.member===mem)&&bookYr(d)).forEach(d=>{const r=regOf(d);if(!a.includes(r))a.push(r)});return ["台灣","香港"].find(r=>a.includes(r))||a[0]||"台灣"}
function bookItems(){const bd=sec==="birthday",r=t=>{const i=Math.min(...[].concat(t).map(x=>{const j=TYPES.indexOf(x);return j<0?TYPES.length:j}));return isFinite(i)?i:TYPES.length};return DATA.filter(d=>inSec(d)&&(bd?(d.member===mem&&bookYr(d)&&regOf(d)===bookReg()):(stat(d)!=="已結束"||done.has(d.id)))).map((d,i)=>[d,i]).sort((a,b)=>r(a[0].type)-r(b[0].type)||a[1]-b[1]).map(a=>a[0])}
/* ===== 護照徽章：打卡達標就解鎖；取消打卡或取消收藏會收回打卡類徽章（localStorage: kh-badges 只記獲得日期） ===== */
function bgRd(){try{const o=JSON.parse(localStorage.getItem("kh-badges")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}}
/* ===== 現場報到 ===== */
function liveRd(){try{const o=JSON.parse(localStorage.getItem("kh-live")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}}
function liveHash(c,d,t){const b=new TextEncoder().encode(c+"|"+d+"|"+String(t||"").trim().toLowerCase());return crypto.subtle.digest("SHA-256",b).then(h=>[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join(""))}
window.khCode=(c,d,t)=>liveHash(c,d,t).then(h=>{console.log(h);return h});/* 產生暗號雜湊：在瀏覽器主控台輸入 khCode("kh","11/19","暗號") */
function liveDist(a,b,c,d){const R=6371000,r=x=>x*Math.PI/180,h=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
function liveOpen(){const old=document.getElementById("bgd");if(old)old.remove();
const n=new Date(),day=(n.getMonth()+1)+"/"+n.getDate(),opener=document.activeElement,c=Object.keys(CITIES).find(k=>(CITIES[k].showDays||[]).includes(day)),C=c&&CITIES[c],key=c+"|"+day,done=!!(c&&liveRd()[key]);
const o=document.createElement("div");o.id="bgd";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","現場報到");
const hasG=!!(C&&C.venue&&navigator.geolocation),hasC=!!(C&&C.codes&&C.codes[day]);
let body;
if(!C)body=`<span>今天（${day}）不是演唱會日，演唱會當天才能現場報到。</span>`;
else if(done)body=`<span>${esc(C.name)} ${day} 已經報到過了。</span>`;
else body=`<span>${esc(C.name)} ${day} 演唱會　請選擇報到方式</span>${hasG?`<button type="button" class="btn main lvg">用定位報到</button><small class="lvh">只在這台手機上比對位置，不會上傳或儲存座標。</small>`:""}${hasC?`<input class="lvi" type="text" inputmode="text" autocomplete="off" placeholder="輸入現場暗號" aria-label="現場暗號"><button type="button" class="btn lvc">送出暗號</button>`:""}${!hasG&&!hasC?`<span>這場還沒有開放報到方式。</span>`:""}<em class="bgds lvm" role="status" aria-live="polite"></em>`;
o.innerHTML=`<div class="bgdc" style="--bc:#2a7de1"><b>現場報到</b>${body}<button type="button" class="btn bgdx">關閉</button></div>`;
const cl=()=>{o.remove();document.removeEventListener("keydown",ky);opener&&opener.focus&&opener.focus()},ky=ev=>{if(ev.key==="Escape")cl()},msg=t=>{const m=o.querySelector(".lvm");if(m)m.textContent=t};
const ok=how=>{const r=liveRd();r[key]=how;try{localStorage.setItem("kh-live",JSON.stringify(r))}catch(e){}cl();toast("現場報到成功");try{badgeSync()}catch(e){}};
o.addEventListener("click",ev=>{if(ev.target===o||ev.target.closest(".bgdx")){cl();return}
if(ev.target.closest(".lvg")){const bt=ev.target.closest(".lvg");bt.disabled=true;msg("定位中…");navigator.geolocation.getCurrentPosition(pos=>{const d=liveDist(pos.coords.latitude,pos.coords.longitude,C.venue.lat,C.venue.lng);if(d<=C.venue.r)ok("gps");else{bt.disabled=false;msg("你好像不在場館附近（距離約 "+(d>=1000?(d/1000).toFixed(1)+" 公里":Math.round(d)+" 公尺")+"）")}},er=>{bt.disabled=false;msg(er&&er.code===1?"沒有定位權限，請在瀏覽器允許定位，或改用現場暗號":"定位失敗，請稍後再試")},{enableHighAccuracy:true,timeout:15000,maximumAge:0});return}
if(ev.target.closest(".lvc")){const v=o.querySelector(".lvi").value;if(!v.trim()){msg("請輸入暗號");return}if(!(window.crypto&&crypto.subtle)){msg("這個瀏覽器無法驗證暗號");return}liveHash(c,day,v).then(h=>{if(h===C.codes[day])ok("code");else msg("暗號不對")})}});
document.addEventListener("keydown",ky);document.body.appendChild(o);(o.querySelector(".lvg,.lvi,.bgdx")).focus()}
/* 演唱會當天 10:00–23:00 開頁面會問一次要不要現場報到（已報到、已問過、或這場沒開放任何報到方式就不問）；按「稍後」今天不再問，之後仍可從徽章詳情報到 */
function liveAsk(){try{const n=new Date(),day=(n.getMonth()+1)+"/"+n.getDate(),c=Object.keys(CITIES).find(k=>(CITIES[k].showDays||[]).includes(day));if(!c)return;if(n.getHours()<10||n.getHours()>=23)return;const C=CITIES[c],key=c+"|"+day;
if(liveRd()[key])return;if(!((C.venue&&navigator.geolocation)||(C.codes&&C.codes[day])))return;
let asked="";try{asked=localStorage.getItem("kh-live-ask")||""}catch(e){}if(asked===key)return;
if(document.getElementById("bgd")||document.getElementById("bgp")||document.getElementById("bgo"))return;
try{localStorage.setItem("kh-live-ask",key)}catch(e){}
const o=document.createElement("div");o.id="bgd";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","現場報到");
o.innerHTML=`<div class="bgdc" style="--bc:#2a7de1"><b>今天是 ${esc(C.name)} 演唱會！</b><span>人到現場了嗎？報到就能解鎖「現場見證」徽章。</span><button type="button" class="btn main bglv">現場報到</button><button type="button" class="btn bgdx">稍後</button></div>`;
const cl=()=>{o.remove();document.removeEventListener("keydown",ky)},ky=ev=>{if(ev.key==="Escape")cl()};
o.addEventListener("click",ev=>{if(ev.target.closest(".bglv")){cl();liveOpen();return}if(ev.target===o||ev.target.closest(".bgdx"))cl()});
document.addEventListener("keydown",ky);document.body.appendChild(o);o.querySelector(".bglv").focus()}catch(e){}}
window.addEventListener("load",()=>setTimeout(liveAsk,1500));
function bgList(){
const col=f=>DATA.filter(d=>f(d)&&(d.sec==="birthday"||stat(d)!=="已結束"||done.has(d.id)));
const dn=f=>col(f).filter(d=>done.has(d.id)).length,L=[];
const add=(id,fam,name,desc,k,n)=>L.push({id,fam,name,desc,k:Math.min(k,n),n});
const all=DATA.filter(d=>done.has(d.id)).length;
[[1,"初次打卡","完成第 1 次打卡"],[5,"打卡新星","累計打卡 5 個"],[10,"應援高手","累計打卡 10 個"],[20,"應援大師","累計打卡 20 個"]].forEach(([n,nm,ds])=>add("m"+n,"m",nm,ds,all,n));
Object.keys(CITIES).forEach(c=>{const f=d=>(d.sec||"tour")==="tour"&&d.city===c,n=col(f).length,nm=CITIES[c].name;if(n>=2)add("c-"+c,"c",nm+"集滿","把"+nm+"的應援全部打卡",dn(f),n)});
const has=(d,t)=>[].concat(d.type).includes(t);
TYPES.forEach(t=>{const f=d=>has(d,t),tot=col(f).length;if(tot>=2){const n=Math.min(3,tot);add("t-"+t,"t",t+"達人","「"+t+"」類型打卡 "+n+" 個",dn(f),n)}});
const pr=TYPES.filter(t=>col(d=>has(d,t)).length>0);
if(pr.length>=3)add("t-all","t","全類型收集","每種類型都至少打卡 1 個",pr.filter(t=>dn(d=>has(d,t))>0).length,pr.length);
MEMBERS.forEach(([m])=>{const f=d=>d.sec==="birthday"&&d.member===m,n=col(f).length;if(n>=1)add("b-"+m,"b",m==="BTS"?"BTS 出道周年集滿":m+" 生日集滿",m==="BTS"?"把 BTS 的出道周年應援全部打卡":"把 "+m+" 的生日應援全部打卡",dn(f),n);L[L.length-1].col=(typeof FT_MC!=="undefined"&&FT_MC[m])||"#7b4fd6"});
try{add("g-s","g","遊戲 S 級","在應援遊戲拿到 S 級",Object.values(gBest()).some(x=>x&&x.g==="S")?1:0,1)}catch(e){}
try{const B=Object.values(gBest()),A=Object.values(gAch()),cl=B.filter(x=>x&&x.a>=G_PASS).length,has=f=>A.some(o=>o&&f(o))?1:0;
add("g-1","g","初次通關","在應援遊戲通關（B 級以上）1 首歌",cl,1);
add("g-3","g","通關 3 首","在應援遊戲通關（B 級以上）3 首歌",cl,3);
add("g-nm","g","零 MISS","在應援遊戲打出零 MISS",has(o=>o.nm),1);
add("g-ap","g","全 PERFECT","在應援遊戲打出全 PERFECT",has(o=>o.ap),1);
add("g-4","g","遊戲四星","同一首歌拿滿 4 個 ★ 成就",has(o=>o.nm&&o.ap&&o.tr&&o.lg),1)}catch(e){}
/* 隱藏徽章：沒解鎖前只顯示「？？？」，不透露條件；要新增就在這裡 addH(代號,名稱,說明,條件是否達成)。徽章名稱和說明如果要多語言，記得到 i18n.js 補翻譯。 */
try{const dn2=DATA.filter(d=>done.has(d.id)),dt=d=>dd[d.id]||"",tw=d=>{const v=String(d.city||"").trim();return !v||/^(kh|台|臺|高雄|新北|桃園|新竹|嘉義|彰化|宜蘭|花蓮|基隆|屏東|苗栗|南投|雲林)/.test(v)};
const addH=(id,name,desc,ok)=>L.push({id,fam:"h",name,desc,k:ok?1:0,n:1,hid:1});
{const pl=d=>(d.sec||"tour")==="tour"?(CITIES[d.city]?CITIES[d.city].name:String(d.city||"")):regOf(d),
twS=new Set(dn2.filter(tw).map(pl)),owS=new Set(dn2.filter(d=>!tw(d)).map(pl)),tr=new Set(dn2.filter(d=>(d.sec||"tour")==="tour"&&!!CITIES[d.city]).map(d=>d.city));
add("p-two","c","多城巡演","每一座巡演城市的應援都打過卡",tr.size,Object.keys(CITIES).length);
add("p-tw","c","環島應援","在 3 個不同的台灣城市打卡",twS.size,3);
add("p-ow","c","環球應援","在 2 個不同的海外城市或地區打卡",owS.size,2);
{const lv=liveRd(),ct=Object.keys(CITIES).filter(c=>(CITIES[c].showDays||[]).length);if(ct.length>=2)add("p-live","c","多城現場","每一座巡演城市的演唱會都現場報到過",ct.filter(c=>Object.keys(lv).some(k=>k.startsWith(c+"|"))).length,ct.length)}}
{const dS=new Set(dn2.map(dt).filter(Boolean)),fx=fxSt(),Mm=MEMBERS.filter(m=>m[0]!=="BTS").map(m=>m[0]),ar=k=>Array.isArray(fx[k])?fx[k]:[];
add("d-3","m","打卡 3 天","在 3 個不同的日子打卡",dS.size,3);
add("d-7","m","打卡 7 天","在 7 個不同的日子打卡",dS.size,7);
add("f-1","t","初次抽籤","抽一次幸運籤",fx.last?1:0,1);
add("f-col","t","成員收集家","集滿幸運籤的成員圖鑑",Mm.filter(m=>ar("col").includes(m)).length,Mm.length);
add("f-sh","g","閃卡收集家","集滿幸運籤的閃卡圖鑑",Mm.filter(m=>ar("sh").includes(m)).length,Mm.length)}
/* 現場見證：要在演唱會當天用「現場報到」（定位在場館附近，或輸入現場暗號）才算，紀錄存在 localStorage: kh-live，不受取消打卡影響 */
addH("h-live","現場見證","演唱會當天在現場報到（定位或現場暗號）",Object.keys(liveRd()).length>0);
const byDay={};dn2.forEach(d=>{const k=dt(d);if(k)byDay[k]=(byDay[k]||0)+1});
addH("h-day3","一日走透透","同一天完成 3 個打卡",Object.values(byDay).some(v=>v>=3));
addH("h-bd","準時祝福","在成員生日（或 BTS 出道周年）當天，打卡他的應援",dn2.some(d=>d.sec==="birthday"&&MEMBERS.some(m=>m[0]===d.member&&dt(d)===m[1]+"/"+m[2])));
{const mg=MEMBERS.map(m=>m[0]).filter(n=>dn2.some(d=>d.sec==="birthday"&&d.member===n));L.push({id:"h-mem",fam:"h",name:"全員到齊",desc:"BTS 和七位成員的應援都打過卡",k:mg.length,n:MEMBERS.length,hid:mg.length?0:1,mg})}
addH("h-sea","跨海應援","台灣和海外的應援都打過卡",dn2.some(tw)&&dn2.some(d=>!tw(d)));
const byMem={};dn2.forEach(d=>{if(d.sec==="birthday"&&d.member&&d.member!=="BTS")byMem[d.member]=(byMem[d.member]||0)+1});
addH("h-bias","偏心警告","同一位成員的應援打卡 5 個以上",Object.values(byMem).some(v=>v>=5));
/* 打卡／收藏類徽章都跟著現況走（取消打卡或取消收藏就收回）；連抽、熱心站民、常駐站民的資料本身不會因取消打卡而消失，仍保留 */
{const S0=bgRd(),kp=(id,ok)=>ok,iso=s=>{const m=String(s||"").match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);return m?m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0"):""},md=s=>{const m=iso(s);return m?(+m.slice(5,7))+"/"+(+m.slice(8,10)):""},onDay=(d,s)=>{const v=iso(s);if(!v)return false;const t=(ddT[d.id]||"").slice(0,10);return t?t===v:dt(d)===md(s)};
addH("h-open","開幕第一人","在應援開始的第一天打卡",kp("h-open",dn2.some(d=>onDay(d,d.start))));
addH("h-last","壓線達陣","在應援結束的最後一天打卡",kp("h-last",dn2.some(d=>onDay(d,d.end))));
const sd=c=>{const s=String((CITIES[c].show||[])[0]||"").replace(/^\d{4}\//,"").replace(/\s\d{1,2}:\d{2}.*$/,"");return s.match(/\d{1,2}\/\d{1,2}/g)||[]};
addH("h-w3","三日全勤","在同一座城市，每一場演唱會日都現場報到",kp("h-w3",Object.keys(CITIES).some(c=>{const a=CITIES[c].showDays||sd(c),L=liveRd();return a.length>=3&&a.every(x=>L[c+"|"+x])})));
const fv=DATA.filter(d=>favs.has(d.id)),fv2=fv.filter(d=>!(d.chg&&/^取消/.test(d.chg)));
addH("h-vow","言出必行","收藏的應援全部都打過卡（至少收藏 5 個）",kp("h-vow",fv2.length>=5&&fv2.every(d=>done.has(d.id))));
add("v-fav","b","收藏家","收藏 10 個應援",Math.min(fv.length,10),10);
/* 一日制霸：任一天分頁（依各城市演唱會日）的應援全部打卡，沒有日期的整段期間應援每天都算 */
{let bk=null;Object.keys(CITIES).forEach(c=>(CITIES[c].days||[]).forEach(x=>{const f=d=>(d.sec||"tour")==="tour"&&d.city===c&&(!(d.dates||[]).length||d.dates.includes(x)),n=col(f).length,k=dn(f);if(n>=2&&(!bk||k/n>bk.k/bk.n))bk={k,n}}));
if(bk)add("c-day","c","一日制霸","把任一天分頁的應援全部打卡",bk.k,bk.n)}
/* 幸運籤連續：看 ftn-st 的連續抽籤天數 n，解鎖後保留 */
{const fn=+fxSt().n||0;[[3,"連抽三天"],[7,"連抽七天"]].forEach(([n,nm])=>add("f-s"+n,"t",nm,"連續抽籤 "+n+" 天",S0["f-s"+n]?n:Math.min(fn,n),n))}
{const dc=+fxSt().dc||0;add("f-task","t","任務達人","完成今日任務 10 次",Math.min(dc,10),10)}
/* 熱心站民：點開頁尾或空白頁的投稿、錯誤回報表單就記下（localStorage: kh-help） */
{let hp=0;try{hp=localStorage.getItem("kh-help")==="1"?1:0}catch(e){}
add("x-help","m","熱心站民","點開「我要投稿」或「錯誤回報」表單",kp("x-help",hp)?1:0,1)}
/* 常駐站民：從手機桌面圖示開啟（standalone）或觸發 appinstalled 就記下，之後永久保留（localStorage: kh-app） */
try{if((window.matchMedia&&matchMedia("(display-mode: standalone)").matches)||navigator.standalone)localStorage.setItem("kh-app","1")}catch(e){}
let ap=0;try{ap=localStorage.getItem("kh-app")==="1"?1:0}catch(e){}
add("x-app","m","常駐站民","把網站加到手機桌面，並從桌面圖示開啟",kp("x-app",ap)?1:0,1)}
/* 點歌徽章：提名成功送出就記下影片代號（localStorage: kh-nom）；今天播的歌是自己提名的就記 kh-nomwin。只認這支手機上的提名 */
{let nm=[],nw=0;try{nm=JSON.parse(localStorage.getItem("kh-nom")||"[]");nw=localStorage.getItem("kh-nomwin")==="1"?1:0}catch(e){}
add("s-nom","c","點歌新手","提名一首 YouTube 歌曲當背景音樂",Array.isArray(nm)&&nm.length?1:0,1);
add("s-win","c","點歌成功","你提名的歌被票選為背景音樂",nw,1)}
/* 歌單預測徽章：參加過的活動、單場最高猜中數、是否拿過第 1 名都記在 localStorage kh-pred（predRec 寫入），解鎖後保留 */
{let pr={j:[],b:0,t:0};try{const o=JSON.parse(localStorage.getItem("kh-pred")||"{}");if(o&&typeof o==="object")pr={j:Array.isArray(o.j)?o.j:[],b:+o.b||0,t:+o.t||0}}catch(e){}
add("r-1","c","初次預測","送出一次歌單預測",Math.min(pr.j.length,1),1);
add("r-3","c","預測常客","參加 3 場歌單預測",Math.min(pr.j.length,3),3);
add("r-hit","c","神預測","單場歌單預測猜中 5 首以上",Math.min(pr.b,5),5);
add("r-top","c","預測王","在歌單預測拿到第 1 名（至少 2 人參加）",pr.t?1:0,1)}
/* 連投徽章：投票成功當天記在 kh-vstk（台北日期）；解鎖後保留 */
{const S1=bgRd(),vn=voteStkN();[[3,"連投三天"],[7,"連投七天"]].forEach(([n,nm])=>add("s-v"+n,"c",nm,"連續 "+n+" 天投票",S1["s-v"+n]?n:Math.min(vn,n),n))}
/* 足跡徽章：來自「藝人同款足跡」的「我去過了」（localStorage: fp-visited）。這裡直接讀 localStorage，因為 FPV 定義在更後面。足跡徽章解鎖後就保留（試算表比較晚載入、或某一列被改掉，都不會把徽章收回）；id 以 test- 開頭的測試資料不算，已歇業又沒去過的不列入集滿的分母 */
try{const S2=bgRd(),FV=(()=>{try{const o=JSON.parse(localStorage.getItem("fp-visited")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}})(),ids=Object.keys(FV).filter(k=>!/^test-/.test(k)),nv=ids.length,
FL=fpL().filter(d=>d&&d.id&&!/^test-/.test(d.id)),ok=d=>!!FV[d.id],pool=FL.filter(d=>!(fpClosed(d)&&!ok(d))),
sk=(id,k,n)=>Math.min(k,n),fa=(id,name,desc,k,n)=>{add(id,"c",name,desc,sk(id,k,n),n);L[L.length-1].col="#2dbf8f"};
fa("fp-1","初次足跡","去過 1 個藝人同款足跡",nv,1);
fa("fp-5","足跡新星","累計去過 5 個藝人同款足跡",nv,5);
fa("fp-10","足跡達人","累計去過 10 個藝人同款足跡",nv,10);
fa("fp-w","跨國足跡","在 2 個不同的國家留下足跡",new Set(FL.filter(ok).map(fpCtOf)).size,2);
{const by={};pool.forEach(d=>{const c=fpCtOf(d);(by[c]=by[c]||[]).push(d)});
Object.keys(by).filter(c=>c!=="其他"&&by[c].length>=2).forEach(c=>fa("fp-c-"+c,c+"走透透","把"+c+"的足跡全部去過",by[c].filter(ok).length,by[c].length))}
{const bc={};pool.forEach(d=>{if(d.cat)(bc[d.cat]=bc[d.cat]||[]).push(d)});Object.keys(bc).filter(c=>bc[c].length>=2).forEach(c=>{const n=Math.min(3,bc[c].length);fa("fp-t-"+c,c+"達人","「"+c+"」類別的足跡去過 "+n+" 個",bc[c].filter(ok).length,n)})}
{try{Object.keys(FPAV).forEach(m=>{const ds=pool.filter(d=>fpMs(d).indexOf(m)>=0);if(ds.length>=3)fa("fp-m-"+m,m+"的足跡收集家","去過 "+Math.min(5,ds.length)+" 個 "+m+" 同款足跡",ds.filter(ok).length,Math.min(5,ds.length))})}catch(e){}}
{const fd={};ids.forEach(k=>{const cy=new Date().getFullYear()+"/",r=String(FV[k]),v=r.startsWith(cy)?r.slice(cy.length):r;fd[v]=(fd[v]||0)+1});
L.push({id:"h-fp3",fam:"h",name:"足跡一日遊",desc:"同一天去過 3 個足跡",k:Object.values(fd).some(v=>v>=3)?1:0,n:1,hid:1})}
{const rx=/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,same=FL.some(d=>{if(!ok(d))return false;const a=rx.exec(String(d.date||"")),b=rx.exec(String(FV[d.id]||""));return !!(a&&b&&+a[2]===+b[2]&&+a[3]===+b[3])});
L.push({id:"h-fp-day",fam:"h",name:"同日同款",desc:"在成員去過那裡的同月同日，你也去同一個地方打卡",k:same?1:0,n:1,hid:1})}}catch(e){}
try{addH("h-egg","七人大遊行","連點首頁標題 7 次，讓七位小人排隊跑過畫面",localStorage.getItem("egg7")==="1");addH("h-egg2","合照時間","連點首頁標題 7 次，運氣好會看到七位小人站成一排合照",localStorage.getItem("egg7p")==="1");addH("h-613","出道紀念日","6/13 當天打開網站，一起慶祝出道紀念日",localStorage.getItem("egg613")==="1");addH("h-nt","夜貓應援","凌晨 0 點到 4 點還在逛站",(()=>{try{if(new Date().getHours()<4)localStorage.setItem("eggnt","1");return localStorage.getItem("eggnt")==="1"}catch(e){return false}})());addH("h-hrt","我紫你","長按首頁標題 3 秒，讓紫色愛心灑滿整個畫面",localStorage.getItem("egghrt")==="1");addH("h-skit","路過的小人","停在首頁一陣子，也許會看到小人們從畫面底部路過",localStorage.getItem("skit")==="1")}catch(e){}
{const vis=c=>L.filter(b=>!b.hid&&bgCat(b.id)===c),okn=a=>a.filter(b=>b.k>=b.n).length;
[["u-ev","演唱會制霸","演唱會分類的徽章全部解鎖","演唱會"],["u-bd","生日制霸","生日分類的徽章全部解鎖","生日"],["u-fx","幸運籤制霸","幸運籤分類的徽章全部解鎖","幸運籤"],["u-gm","遊戲制霸","應援遊戲分類的徽章全部解鎖","應援遊戲"],["u-fp","足跡制霸","足跡分類的徽章全部解鎖","足跡"]].forEach(([id,nm,ds,c])=>{const a=vis(c);if(a.length)add(id,"h",nm,ds,okn(a),a.length)});
const H=L.filter(b=>b.hid);if(H.length)L.push({id:"h-hunt",fam:"h",name:"隱藏獵人",desc:"解鎖所有隱藏徽章",k:Math.min(okn(H),H.length),n:H.length,hid:1})}
addH("h-final","完美主義者","解鎖其他所有徽章",L.length>0&&L.every(b=>b.k>=b.n))}catch(e){}
return L.map(b=>(b.ok=b.k>=b.n,b))}
/* 徽章分類：圖鑑的徽章分頁依這裡分組。新增徽章時，如果代號沒對到，會放進「打卡天數」 */
const BG_TIER={"r-3":1,"s-v3":1,"s-v7":2,m5:1,m10:2,m20:3,"d-3":1,"d-7":2,"g-1":1,"g-3":2,"f-s3":1,"f-s7":2,"fp-5":1,"fp-10":2};
function bgRar(b){return b.hid?["h","★ 隱藏"]:(BG_TIER[b.id]>=2||/^(u-|p-live$|g-ap$|g-4$|f-col$|f-sh$|s-win$|r-hit$|r-top$)/.test(b.id))?["r","稀有"]:["n","普通"]}
const BG_CATS=["演唱會","生日","幸運籤","應援遊戲","打卡天數","收藏","背景音樂","歌單預測","足跡","終極挑戰"];
function bgCat(id){return id==="h-final"||id==="h-hunt"||id==="h-egg"||id==="h-egg2"||id==="h-hrt"||id==="h-nt"||id==="h-613"||/^u-/.test(id)?"終極挑戰":/^(fp-|h-fp)/.test(id)?"足跡":/^r-/.test(id)?"歌單預測":/^(v-|h-vow)/.test(id)?"收藏":/^(c-|t-|p-two|p-live|h-live|h-w3)/.test(id)?"演唱會":/^g-/.test(id)?"應援遊戲":/^(b-|p-tw|p-ow|h-bd|h-mem|h-bias|h-sea)/.test(id)?"生日":/^f-/.test(id)?"幸運籤":/^s-/.test(id)?"背景音樂":"打卡天數"}
/* 解鎖徽章時跳出的獲得卡片；隱藏徽章用金色版本。點空白處、按關閉，或 7 秒後自動關閉 */
/* 每枚徽章各自的像素圖示：BG_PX 是 10×10 的圖案（# 是主色，+ 是亮點）；BG_MAP 依徽章代號挑圖案，對不到就用兔子 */
const BG_PX={
moon:["...####...","..####....",".####.....",".####.....",".####.....",".####.....",".#####....","..#######.","...#######","....#####."],
note:["..########", "..########", "..#......#", "..#......#", "..#......#", ".##.....##", "###....###", "###....###", ".#......#.", ".........."],
star:["....##....", "....##....", "...####...", "##########", ".########.", "..######..", "..######..", ".###..###.", ".##....##.", "#........#"],
heart:[".##....##.", "####..####", "###+######", "##########", "##########", ".########.", "..######..", "...####...", "....##....", ".........."],
flag:["#######...", "#########.", "#########.", "#######...", "#.........", "#.........", "#.........", "#.........", "#.........", "#........."],
crown:["#...##...#", "##..##..##", "###.##.###", "##########", "##+#######", "##########", "##########", "..........", "..........", ".........."],
trophy:["##########", "#.######.#", "#.######.#", ".########.", "..######..", "...####...", "....##....", "....##....", "..######..", "..######.."],
pin:["...####...", "..######..", ".###..###.", ".###..###.", "..######..", "..######..", "...####...", "....##....", "....##....", ".....#...."],
globe:["..######..", ".########.", "####..####", "##########", "#.######.#", "#.######.#", "##########", "####..####", ".########.", "..######.."],
cal:["..#....#..", "##########", "##########", "##.#.#.#.#", "##########", "##.#.#.#.#", "##########", "##.#.#.#.#", "##########", "##########"],
cake:["....#.....", "....#.....", "..######..", "..######..", "##########", "##########", "#.#.#.#.##", "##########", "##########", "##########"],
spark:["....##....", "....##....", "...####...", "##########", "##########", "...####...", "....##....", "....##....", ".#......#.", "#.#....#.#"],
target:["..######..", ".##....##.", "##.####.##", "#.##..##.#", "#.#.##.#.#", "#.#.##.#.#", "#.##..##.#", "##.####.##", ".##....##.", "..######.."],
shield:["##########", "##########", "##########", "##########", "##########", ".########.", ".########.", "..######..", "...####...", "....##...."],
people:["..##..##..", "..##..##..", "...#..#...", ".########.", "##########", "##.####.##", "##.####.##", "##..##..##", "##..##..##", "##..##..##"],
gem:["..######..", ".########.", "##########", "##+#######", "##########", ".########.", "..######..", "...####...", "....##....", ".........."],
mic:["...####...", "..######..", "..######..", "..######..", "..######..", "#..####..#", "#...##...#", ".#..##..#.", "..######..", "....##...."],
foot:["..........", "..##......", "..###.....", "..###.....", "..####....", "..#######.", ".#########", "##########", "##########", ".........."],
pad:["..........", "..........", ".########.", "##.#####.#", "#...##.#.#", "##.#####.#", "##########", "##########", ".##....##.", ".........."],
clover:[".##....##.", "####..####", "####..####", ".##.##.##.", "....##....", "##.####.##", "####..####", "####..####", ".##.##.##.", "....##...."],
bunny:["..##..##..", "..##..##..", "..##..##..", "...####...", "..######..", ".########.", ".########.", ".########.", "..######..", "...####..."],
bolt:[".....####.","....####..","...####...","..#######.","....####..","...####...","..####....","..###.....",".##.......",".#........"],
hourglass:["##########",".########.","..######..","...####...","....##....","....##....","...#++#...","..######..",".########.","##########"],
check:["..........",".........#","........##",".......##.","#.....##..","##...##...",".##.##....","..###.....","...#......",".........."],
flame:["....#.....","...##.....","...###..#.","..####.##.",".#####.##.",".########.",".########.",".###++###.","..######..","...####..."],
mail:["..........","##########","###....###","#.##..##.#","#..####..#","#...##...#","#........#","#........#","##########",".........."],
q:["..######..",".##....##.",".##....##.","......###.","....###...","....##....","....##....","..........","....##....","....##...."],
phone:["...####...","..######..","..#....#..","..#....#..","..#....#..","..#....#..","..#....#..","..######..","..##++##..","..######.."],
bookmark:["..######..","..######..","..######..","..######..","..######..","..######..","..######..","..##..##..","..#....#..",".........."],
ribbon:["..######..", ".########.", ".###++###.", "..######..", "...####...", "..##..##..", "..##..##..", ".##....##.", ".#......#.", "##......##"]};
const BG_MAP=[[/^h-nt$/,"moon"],[/^h-613$/,"cake"],[/^h-hrt$/,"heart"],[/^fp-w$/,"globe"],[/^fp-c-/,"pin"],[/^fp-t-/,"ribbon"],[/^h-fp-day$/,"cal"],[/^(fp-|h-fp)/,"foot"],[/^r-1$/,"pad"],[/^r-3$/,"star"],[/^r-hit$/,"target"],[/^r-top$/,"crown"],[/^s-v3$/,"flame"],[/^s-v7$/,"crown"],[/^s-nom$/,"note"],[/^s-win$/,"trophy"],[/^c-day$/,"target"],[/^f-s3$/,"flame"],[/^f-s7$/,"crown"],[/^x-help$/,"mail"],[/^x-app$/,"phone"],[/^h-open$/,"bolt"],[/^h-last$/,"hourglass"],[/^h-w3$/,"cal"],[/^h-vow$/,"check"],[/^v-fav$/,"bookmark"],[/^m1$/,"flag"],[/^m5$/,"star"],[/^m10$/,"trophy"],[/^m20$/,"crown"],[/^c-/,"pin"],[/^t-all$/,"gem"],[/^t-/,"ribbon"],[/^p-two$/,"pin"],[/^p-live$/,"mic"],[/^p-tw$/,"foot"],[/^p-ow$/,"globe"],[/^b-/,"heart"],[/^d-/,"cal"],[/^f-1$/,"clover"],[/^f-col$/,"star"],[/^f-sh$/,"spark"],[/^g-s$/,"trophy"],[/^g-1$/,"flag"],[/^g-3$/,"star"],[/^g-nm$/,"shield"],[/^g-ap$/,"target"],[/^g-4$/,"pad"],[/^h-live$/,"mic"],[/^h-day3$/,"foot"],[/^h-bd$/,"cake"],[/^h-mem$/,"people"],[/^h-sea$/,"globe"],[/^h-bias$/,"spark"],[/^h-final$/,"crown"],[/^u-/,"trophy"],[/^h-hunt$/,"gem"]];
function bgIco(id){if(id==="h-egg"&&typeof FPAV!=="undefined"&&FPAV.Jungkook)return `<img class="bgav" src="${FPAV.Jungkook}" alt="" aria-hidden="true">`;if(id==="h-egg2"&&typeof FPAV!=="undefined"&&FPAV.RM)return `<img class="bgav" src="${FPAV.RM}" alt="" aria-hidden="true">`;{const mm=/^fp-m-(.+)$/.exec(id);if(mm&&typeof FPAV!=="undefined"&&FPAV[mm[1]])return `<img class="bgav" src="${FPAV[mm[1]]}" alt="" aria-hidden="true">`}const m=BG_MAP.find(a=>a[0].test(id)),g=BG_PX[id==="?"?"q":(m?m[1]:"bunny")];let r="";g.forEach((row,y)=>{const re=/#+|\++/g;let q;while(q=re.exec(row))r+=`<rect x="${q.index}" y="${y}" width="${q[0].length}" height="1"${q[0][0]==="+"?' fill="#fff" opacity=".75"':""}/>`});return `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`}
function bgMem(g){const F=typeof FPAV!=="undefined"?FPAV:{};return `<div class="bgm" role="img" aria-label="已打卡 ${g.length} / ${MEMBERS.length}">${MEMBERS.map(m=>{const n=m[0],on=g.includes(n);return n==="BTS"||!F[n]?`<span class="bgm1 t${on?" on":""}">${n}</span>`:`<span class="bgm1${on?" on":""}" title="${n}"><img src="${F[n]}" alt="" aria-hidden="true"></span>`}).join("")}</div>`}
let BGP_T=0;
function badgePop(nw){if(!nw.length)return;const b=nw.find(x=>x.hid)||nw[0],hd=!!b.hid,C={m:"#e0a800",c:"#2a7de1",t:"#7b4fd6",b:"#e0457b",g:"#d9482f",h:"#7b4fd6"},col=b.col||({1:"#b87333",2:"#9aa7b4",3:"#e0a800"})[BG_TIER[b.id]]||C[b.fam]||"#2a7de1";
const old=document.getElementById("bgp");if(old)old.remove();clearTimeout(BGP_T);
const o=document.createElement("div");o.id="bgp";o.className=hd?"hid":"";o.setAttribute("role","dialog");o.setAttribute("aria-label","獲得新徽章");
o.innerHTML=`<div class="bgpc" style="--bc:${col}"><small>${hd?"★ 隱藏徽章解鎖！ ★":"獲得新徽章"}</small><i>${bgIco(b.id)}</i><b>${esc(b.name)}</b><u class="${bgRar(b)[0]}">${bgRar(b)[1]}</u><span>${esc(b.desc)}</span>${nw.length>1?`<em>同時還解鎖了其他徽章</em>`:""}<div class="bgpb"><button type="button" class="btn main" data-a="v">查看徽章</button><button type="button" class="btn" data-a="x">關閉</button></div></div>`;
/* 像素彩帶：解鎖時從上往下掉的小方塊和細長彩帶，隱藏徽章用金色；系統開了「減少動態效果」就不放 */
try{if(!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)){const P=hd?["#e0a800","#ffd666","#fff3b0","#b27c00","#f5c542"]:["#2a7de1","#e0457b","#e0a800","#3fbf7f","#7b4fd6","#4aa8ff"],n=hd?56:36,r=Math.random;let s="";for(let k=0;k<n;k++){const rb=r()<.35;s+=`<s style="left:${(r()*100).toFixed(1)}%;width:${rb?4:6}px;height:${rb?12:6}px;background:${P[k%P.length]};--dx:${Math.round(r()*80-40)}px;animation-duration:${(2.2+r()*1.6).toFixed(2)}s;animation-delay:${(r()*.9).toFixed(2)}s"></s>`}o.insertAdjacentHTML("afterbegin",`<div class="bgcf" aria-hidden="true">${s}</div>`)}}catch(e){}
const cl=()=>{clearTimeout(BGP_T);o.remove()};
o.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest("[data-a]");if(a&&a.dataset.a==="v"){cl();achOpen("b");return}if(e.target===o||a)cl()});
document.body.appendChild(o);BGP_T=setTimeout(cl,7000)}
/* 徽章獲得日期新資料帶年份（2026/10/18）；舊資料只有月/日。顯示時，今年的省略年份 */
function bgDs(v){v=String(v||"");const m=v.match(/^(\d{4})\/(\d{1,2}\/\d{1,2})$/);return m&&+m[1]===new Date().getFullYear()?m[2]:v}
function badgeSync(){const st=bgRd(),L=bgList(),nw=[],n=new Date(),ds=n.getFullYear()+"/"+(n.getMonth()+1)+"/"+n.getDate();
let rv=false;
/* 活動資料還沒載入（或載入失敗）時 DATA 是空的，所有打卡類徽章都會算成未達標；這時只解鎖、不收回，避免誤刪 */
const safe=Array.isArray(DATA)&&DATA.length>0&&!window.__dataFail;
L.forEach(b=>{if(b.ok&&!st[b.id]){st[b.id]=ds;nw.push(b)}else if(safe&&!b.ok&&st[b.id]&&!(/^(fp-|h-fp)/.test(b.id)&&!fpL().length)){delete st[b.id];rv=true}});
if(rv&&!nw.length){try{localStorage.setItem("kh-badges",JSON.stringify(st))}catch(e){}}
if(nw.length){try{localStorage.setItem("kh-badges",JSON.stringify(st))}catch(e){}try{badgePop(nw)}catch(e){toast(nw.length===1?"獲得新徽章："+nw[0].name:"獲得 "+nw.length+" 個新徽章")}}
return{st,L}}
document.addEventListener("click",e=>{const a=e.target.closest&&e.target.closest('a[href*="forms.gle"]');if(a){try{localStorage.setItem("kh-help","1")}catch(x){}setTimeout(()=>{try{badgeSync()}catch(x){}},300)}});
window.addEventListener("appinstalled",()=>{try{localStorage.setItem("kh-app","1");badgeSync()}catch(e){}});
function fxSt(){try{const o=JSON.parse(localStorage.getItem("ftn-st")||"{}");return o&&typeof o==="object"?o:{}}catch(e){return{}}}
/* 成就圖鑑：把集章徽章（kh-badges）和幸運籤的成員圖鑑、閃卡、場次限定卡、稱號（ftn-st）放在同一個畫面，只讀取，不改幸運籤的資料 */
function achOpen(tab){if(document.getElementById("bgo"))return;const{st,L}=badgeSync(),f=fxSt(),opener=document.activeElement;
const M=MEMBERS.filter(m=>m[0]!=="BTS").map(m=>m[0]),ar=k=>Array.isArray(f[k])?f[k]:[],col=ar("col"),sh=ar("sh"),lm=ar("lm");
const full=M.every(m=>col.includes(m)),n=+f.n||0;
const TT=FT_TIERS.map(t=>({name:t[1],need:"連續抽籤 "+t[0]+" 天"+(t[2]?"且集滿成員圖鑑":""),on:n>=t[0]&&(!t[2]||full)}));
TT.push({name:"金閃收藏家",need:"集滿閃卡圖鑑",on:M.every(m=>sh.includes(m)),sp:1});
FT_LC.forEach(c=>TT.push({name:c[1]+"場見證者",need:"集滿"+c[1]+"場限定卡",on:c[4].every(x=>lm.includes(c[0]+"-"+x)),sp:1}));
let cur=-1;TT.forEach((t,i)=>{if(!t.sp&&t.on)cur=i});
const bOn=L.filter(x=>st[x.id]).length,mOn=M.filter(m=>col.includes(m)).length,sOn=M.filter(m=>sh.includes(m)).length,lOn=FT_LC.reduce((s,c)=>s+c[4].filter(x=>lm.includes(c[0]+"-"+x)).length,0),lAll=FT_LC.reduce((s,c)=>s+c[4].length,0),tOn=TT.filter(t=>t.on).length;
const ico='<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="0" width="2" height="3"/><rect x="6" y="0" width="2" height="3"/><rect x="3" y="3" width="4" height="1"/><rect x="2" y="4" width="6" height="1"/><rect x="1" y="5" width="8" height="3"/><rect x="2" y="8" width="6" height="1"/><rect x="3" y="9" width="4" height="1"/><rect x="4" y="5" width="2" height="2" fill="#fff" opacity=".75"/></svg>';
const T=[["b","徽章",bOn+" / "+L.length],["c","籤卡圖鑑",(mOn+sOn+lOn)+" / "+(M.length*2+lAll)],["t","稱號",tOn+" / "+TT.length]];
const chips=(arr,on,pre)=>`<div class="agg">${arr.map(m=>`<span class="agc${on(m)?" on":""}${pre==="★"&&on(m)?" shn":""}"${on(m)&&FT_MC[m]?` style="color:${FT_MC[m]}"`:""}>${ftAv(m,on(m),pre==="★")}${pre||""}${esc(m)}</span>`).join("")}</div>`;
const body={
b:()=>{const S=[...L].sort((x,y)=>(st[y.id]?1:0)-(st[x.id]?1:0)),card=x=>{const on=!!st[x.id],hd=x.hid&&!on;const cs=x.col&&on?` style="border-color:${x.col};box-shadow:3px 3px 0 ${x.col}"`:"",ci=x.col&&on?` style="color:${x.col}"`:"";return `<div class="bgi ${x.fam}${on?" on":""}${x.mg&&!hd&&!on?" pg":""}${BG_TIER[x.id]?" t"+BG_TIER[x.id]:""}"${cs} data-bid="${x.id}" tabindex="0" role="button"><i${ci}>${bgIco(hd?"?":x.id)}</i><b>${hd?"？？？":esc(x.name)}</b><small>${hd?"隱藏徽章，達成後才會揭曉":esc(x.desc)}</small>${x.mg&&!hd?bgMem(x.mg):""}<em>${on?"獲得於 "+esc(bgDs(st[x.id])):hd?"未解鎖":x.k+" / "+x.n}</em></div>`};const cats=BG_CATS.filter(c=>S.some(x=>bgCat(x.id)===c));if(bc!=="全部"&&!cats.includes(bc))bc="全部";const G0=bc==="全部"?S:S.filter(x=>bgCat(x.id)===bc),G=bs==="已解鎖"?G0.filter(x=>st[x.id]):bs==="未解鎖"?G0.filter(x=>!st[x.id]):G0;return `<div class="bgcat" role="group" aria-label="徽章分類">${["全部",...cats].map(c=>`<button type="button" class="chip" data-bc="${c}" aria-pressed="${c===bc}">${c}</button>`).join("")}</div><div class="bgst" role="group" aria-label="解鎖狀態">${["全部","已解鎖","未解鎖"].map(c=>`<button type="button" class="chip" data-bs="${c}" aria-pressed="${c===bs}">${c}</button>`).join("")}</div><div class="bgg">${G.map(card).join("")}</div>${G.length?"":`<p class="bgn">沒有符合的徽章</p>`}<p class="bgn">徽章依目前的打卡進度計算，取消打卡後，未達標的徽章會一併收回。</p>`},
c:()=>`${f.last?"":`<p class="bgn">還沒抽過幸運籤，抽一次就會開始收集圖鑑。</p>`}<h3 class="agh"><span>成員圖鑑</span><b>${mOn} / ${M.length}</b></h3>${chips(M,m=>col.includes(m))}<h3 class="agh"><span>閃卡圖鑑</span><b>${sOn} / ${M.length}</b></h3>${chips(M,m=>sh.includes(m),"★")}${FT_LC.map(c=>{const g=c[4].filter(x=>lm.includes(c[0]+"-"+x)).length;return `<h3 class="agh"><span>${c[1]}場限定卡</span><b>${g} / ${c[4].length}</b></h3>${chips(c[4],x=>lm.includes(c[0]+"-"+x))}`}).join("")}`,
t:()=>`<p class="bgn">連續抽籤 <b>${n}</b> 天</p><div class="agr">${TT.map((t,i)=>`<div class="agt${t.on?" on":""}${i===cur?" cur":""}"><b>${esc(t.name)}</b><small>${esc(t.need)}</small>${i===cur?"<em>目前稱號</em>":""}</div>`).join("")}</div><p class="bgn">稱號看連續抽籤天數，中斷一天會重新計算。</p>`};
const ov=document.createElement("div");ov.id="bgo";ov.setAttribute("role","dialog");ov.setAttribute("aria-modal","true");ov.setAttribute("aria-label","成就圖鑑");
let tb=T.some(x=>x[0]===tab)?tab:"b",bc="全部",bs="全部";
const draw=()=>{ov.querySelector(".bgt").innerHTML=T.map(x=>`<button type="button" role="tab" data-t="${x[0]}" aria-selected="${x[0]===tb}">${x[1]} <em>${x[2]}</em></button>`).join("");ov.querySelector(".bgb").innerHTML=body[tb]()};
ov.innerHTML=`<div class="bgc"><div class="bgh"><b>成就圖鑑</b></div><div class="bgt" role="tablist"></div><div class="bgb"></div><button type="button" class="btn main bgx">關閉</button></div>`;
draw();
const prev=document.body.style.overflow;document.body.style.overflow="hidden";
const close=()=>{ov.remove();document.body.style.overflow=prev;document.removeEventListener("keydown",key);opener&&opener.focus&&opener.focus()};
const key=ev=>{if(ev.key==="Escape"&&!document.getElementById("ftn")&&!document.getElementById("bgd"))close()};
ov.addEventListener("click",ev=>{const t=ev.target.closest&&ev.target.closest(".bgt button");if(t){tb=t.dataset.t;draw();return}const cb=ev.target.closest&&ev.target.closest(".bgcat button");if(cb){bc=cb.dataset.bc;draw();return}const sb=ev.target.closest&&ev.target.closest(".bgst button");if(sb){bs=sb.dataset.bs;draw();return}const cd=ev.target.closest&&ev.target.closest(".bgi[data-bid]");if(cd){const bb=L.find(z=>z.id===cd.dataset.bid);if(bb)bgDetail(bb,st);return}if(ev.target===ov||ev.target.closest(".bgx"))close()});
ov.addEventListener("keydown",ev=>{if((ev.key==="Enter"||ev.key===" ")&&ev.target.matches&&ev.target.matches(".bgi[data-bid]")){ev.preventDefault();ev.target.click()}});document.addEventListener("keydown",key);document.body.appendChild(ov);ov.querySelector(".bgt [aria-selected=true]").focus()}
/* 點徽章卡片看詳情：獲得日期、條件、進度、分類、稀有度、分級；沒解鎖的隱藏徽章只顯示分類，不透露條件 */
function bgDetail(b,st){const old=document.getElementById("bgd");if(old)old.remove();
const on=!!st[b.id],hd=!!b.hid&&!on,tier=BG_TIER[b.id]||0,C={m:"#e0a800",c:"#2a7de1",t:"#7b4fd6",b:"#e0457b",g:"#d9482f",h:"#7b4fd6"},col=b.col||(b.hid&&on?"#e0a800":"")||({1:"#b87333",2:"#9aa7b4",3:"#e0a800"})[tier]||C[b.fam]||"#2a7de1",rar=bgRar(b),opener=document.activeElement,pct=b.n?Math.round(Math.min(b.k,b.n)/b.n*100):0;
const o=document.createElement("div");o.id="bgd";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label",hd?"？？？":b.name);
o.innerHTML=`<div class="bgdc" style="--bc:${col}"><i class="${on?"":"lk"}">${bgIco(hd?"?":b.id)}</i><b>${hd?"？？？":esc(b.name)}</b><u class="${rar[0]}">${rar[1]}</u><span>${hd?"隱藏徽章，達成後才會揭曉":esc(b.desc)}</span>${b.mg&&!hd?bgMem(b.mg):""}${hd?"":`<div class="bgdp"><s style="width:${pct}%"></s></div>`}<em class="bgds">${on?"獲得於 "+esc(bgDs(st[b.id])):"未解鎖"}</em><p class="bgdr"><em>分類</em><span>${bgCat(b.id)}</span></p>${hd?"":`<p class="bgdr"><em>進度</em><span>${Math.min(b.k,b.n)} / ${b.n}</span></p>`}${tier&&!hd?`<p class="bgdr"><em class="bgdm">${["","🥉","🥈","🥇"][tier]}</em><span>${["","銅級","銀級","金級"][tier]}</span></p>`:""}${b.id==="h-live"&&!on?`<button type="button" class="btn main bglv">現場報到</button>`:""}<button type="button" class="btn bgdx">關閉</button></div>`;
const cl=()=>{o.remove();document.removeEventListener("keydown",ky);opener&&opener.focus&&opener.focus()},ky=ev=>{if(ev.key==="Escape")cl()};
o.addEventListener("click",ev=>{if(ev.target.closest(".bglv")){cl();liveOpen();return}if(ev.target===o||ev.target.closest(".bgdx"))cl()});
document.addEventListener("keydown",ky);document.body.appendChild(o);o.querySelector(".bgdx").focus()}
function badgeOpen(){achOpen("b")}
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("#badgeBtn,#achBtn");if(t)achOpen("b")});
function xmark(){return `<svg viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true" fill="#9aa3c7">${[1,2,3,4,5,6,7,8].map(i=>`<rect x="${i}" y="${i}" width="1" height="1"/><rect x="${9-i}" y="${i}" width="1" height="1"/>`).join("")}</svg>`}
function book(){let bs={st:{},L:[]};try{bs=badgeSync()}catch(x){}const L=bookItems();$("#book").hidden=!L.length||(sec==="birthday"&&mem==="全部");const k=L.filter(d=>done.has(d.id)).length;$("#book").innerHTML=`<span>集章簿${sec==="birthday"?"（"+bookReg()+"）":""} ${k} / ${L.length}</span><span class="slots">${L.map(d=>`<span class="slot ${done.has(d.id)?"on":stat(d)==="已結束"?"miss":""}" title="${esc(d.title)}${!done.has(d.id)&&stat(d)==="已結束"?"（已結束，未打卡）":""}">${done.has(d.id)?stamp(DATA.indexOf(d)):stat(d)==="已結束"?xmark():""}</span>`).join("")}</span><button class="sbtn" id="allOn" type="button">✔ 一鍵打卡</button><button class="sbtn" id="allOff" type="button">↺ 取消全部打卡</button><button class="sbtn" id="saveImg" type="button">🖼 存成圖片</button><button class="sbtn" id="badgeBtn" type="button">🏆 徽章 ${bs.L.filter(b=>bs.st[b.id]).length} / ${bs.L.length}</button>`}
const $=s=>document.querySelector(s);
const wr=(k,s)=>{try{localStorage.setItem(k,JSON.stringify([...s]))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function toast(t){const e=$("#toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),1800)}
function typeList(){return sec==="birthday"?TYPES.filter(t=>t!=="咖啡廳"):TYPES}
function chips(){if(cur!=="全部"&&!typeList().includes(cur))cur="全部";const o=["全部",...typeList()];$("#cat").innerHTML=o.map(t=>`<option>${t}</option>`).join("");$("#cat").value=cur;$("#chips").innerHTML=o.slice(1).map(t=>`<button class="chip" aria-pressed="${t===cur}" data-t="${t}">${t}</button>`).join("")}
/* 沒有活動可顯示時的說明文字；生日頁選到還沒收錄任何應援的成員，會顯示距離生日的天數和投稿連結（SUBMIT_URL 在 data.js 設定） */
function emptyHTML(past){
if(onlyFav)return "還沒有收藏的活動<br>點卡片右上角的 ♡ 就能加進來";
if(past.length)return "目前沒有進行中或即將開始的應援，可以看看下方的回顧紀念牆";
if(sec==="birthday"&&mem!=="全部"&&!DATA.some(d=>d.sec==="birthday"&&d.member===mem)){
const m=MEMBERS.find(x=>x[0]===mem),k=m?bdDays(m):-1;
const when=m?`${mem==="BTS"?"出道周年":"生日"} ${m[1]}/${m[2]}，${k===0?"就是今天":"還有 "+k+" 天"}。`:"";
const link=typeof SUBMIT_URL==="string"&&SUBMIT_URL?`<br><a class="btn main" style="margin-top:12px" target="_blank" rel="noopener" href="${esc(SUBMIT_URL)}">我要提供應援資訊</a>`:"";
return `<b>還沒有收錄 ${esc(mem)} 的${mem==="BTS"?"出道周年":"生日"}應援</b><br>${when}看到應援資訊的話，歡迎提供給我們。${link}`}
if(DATA.some(inSec))return "沒有符合的活動，換個條件試試";
return sec==="birthday"?"還沒有收錄生日應援，歡迎提供資料":"這個城市還沒有收錄應援，歡迎提供資料"}
/* 把目前的篩選條件寫進網址，方便分享連結或重新整理後保留 */
function syncUrl(){try{if(sec==="home"){history.replaceState(history.state,"","?");return}
const p=new URLSearchParams();p.set("section",sec);
if(sec==="tour"){p.set("city",city);if(day!=="全部")p.set("day",day)}
else{p.set("member",mem==="全部"?"all":mem);if(reg!=="全部")p.set("region",reg)}
if(cur!=="全部")p.set("type",cur);
history.replaceState(history.state,"","?"+p.toString())}catch(e){}}
function render(){if(sec==="birthday")regions();syncUrl();
const dt=d=>d.dates.length?d.dates[0]:"99/99";
const items=DATA.filter(d=>inSec(d)&&(mem==="全部"||d.member===mem)&&(sec!=="birthday"||reg==="全部"||regOf(d)===reg)&&(day==="全部"||!d.dates.length||d.dates.includes(day))&&(cur==="全部"||d.type.includes(cur))&&(!onlyFav||favs.has(d.id))&&(st==="全部"||stat(d)===st)&&(!tagSel.size||(d.tags||[]).some(x=>tagSel.has(x)))&&(!kw||(d.title+d.by+d.place+d.desc+(d.tags||[]).join("")).toLowerCase().includes(kw)));
items.sort(so==="soon"?(a,b)=>skey(a)-skey(b)||((regOf(a)==="台灣"?0:1)-(regOf(b)==="台灣"?0:1))||regOf(a).localeCompare(regOf(b),"zh-Hant")||a.title.localeCompare(b.title,"zh-Hant"):so==="name"?(a,b)=>a.title.localeCompare(b.title,"zh-Hant"):so==="date"?(a,b)=>dt(a).localeCompare(dt(b)):(a,b)=>(b.added||0)-(a.added||0));
const live=items.filter(d=>stat(d)!=="已結束"),past=items.filter(d=>stat(d)==="已結束");
book();window.afterRender&&afterRender(live);{const fl=DATA.filter(d=>inSec(d)&&favs.has(d.id)),fc=k=>fl.filter(d=>stat(d)===k).length;$("#favBtn").textContent=(onlyFav?"♥":"♡")+" 我的收藏"+(fl.length?" ("+fl.length+")":"");$("#n").textContent=onlyFav?`收藏 ${fl.length} 個・進行中 ${fc("進行中")}・即將開始 ${fc("即將開始")}・已結束 ${fc("已結束")}`:`${live.length} 個活動`}wallR(past);
$("#list").innerHTML=live.length?live.map(d=>`<article class="card ${done.has(d.id)?"done":""}${d.chg?" chg":""}${d.chg&&/^取消/.test(d.chg)?" cancel":""}" data-id="${esc(String(d.id))}"><div class="pic ${d.img?"has":""}">${d.img?`<img class="pbg" src="${d.img}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img src="${d.img}" alt="${esc(d.title)}" loading="lazy" decoding="async">`:`<span class="ph">${stamp(DATA.indexOf(d),true)}</span>`}${done.has(d.id)?`<span class="stamp ${lastStamp===d.id?"pop":""}">${stamp(DATA.indexOf(d))}</span>`:""}<div class="badges">${stat(d)?`<span class="pill st st-${{"進行中":"on","即將開始":"soon","已結束":"end"}[stat(d)]||"x"}">${stat(d)}</span>`:""}${d.chg?`<span class="pill chgb">${/^取消/.test(d.chg)?"已取消":"⚠ 有異動"}</span>`:""}${cd(d)}</div></div>
<div class="hd"><div class="top"><div class="tags">${d.type.map(t=>`<span class="tag">${t}</span>`).join("")}${nw(d)}${(d.tags||[]).filter(x=>x!=="免費"&&x!=="須配合店家低銷").map(x=>`<span class="pill">${x}</span>`).join("")}</div>
<button class="heart" data-f="${d.id}" aria-pressed="${favs.has(d.id)}" aria-label="收藏">${favs.has(d.id)?"♥":"♡"}</button></div>
<h2>${esc(d.title)}</h2><div class="by">主辦：${esc(d.by)}</div>${descTxt(d)?`<p class="desc">${esc(descTxt(d))}</p>`:""}</div>
${d.chg?`<div class="chg-alert" role="alert"><b>⚠ 異動</b><span>${esc(d.chg)}</span></div>`:""}
<div class="box">${[["地點",d.place],["時間",timeTxt(d)],["備註",tipTxt(d)]].filter(r=>r[1]&&r[1]!=="—").map(r=>`<div><span>${r[0]}</span><span>${esc(r[1])}</span></div>`).join("")}</div>
<div class="act">${d.chg&&/^取消/.test(d.chg)&&!done.has(d.id)?"":`<button class="btn ${done.has(d.id)?"ok":"main"}" data-c="${d.id}">${done.has(d.id)?"✔ 已打卡"+(dd[d.id]?" "+dd[d.id]:""):(d.sec==="birthday"?"🎂 我打卡了":"💣 我打卡了")}</button>`}
${d.map?`<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.map)}">📍 地圖</a>`:""}

${(d.links||[]).map(l=>`<a class="btn" target="_blank" rel="noopener" href="${esc(l.u)}">${esc(l.t)} ↗</a>`).join("")}</div></article>`).join(""):`<div class="empty">${emptyHTML(past)}</div>`}
document.addEventListener("click",async e=>{
const t=e.target.closest("[data-t]"),f=e.target.closest("[data-f]"),c=e.target.closest("[data-c]"),s=e.target.closest("[data-s]");
const go=e.target.closest("[data-go]");

if(go){const z=go.dataset.go;if(z==="home"&&history.state&&history.state.in){history.back();return}gos(z);return}
const mm=e.target.closest("[data-mem]");
if(mm){mem=mem===mm.dataset.mem?"全部":mm.dataset.mem;members();render()}
const rg=e.target.closest("[data-reg]");
if(rg){reg=reg===rg.dataset.reg?"全部":rg.dataset.reg;regions();render()}
const dy=e.target.closest("[data-day]");
if(dy){day=day===dy.dataset.day?"全部":dy.dataset.day;days();render()}
const ct=e.target.closest("[data-city]");
if(ct){city=ct.dataset.city;day="全部";try{history.replaceState(history.state,"","?section=tour&city="+city)}catch(x){}head();render()}
if(t){cur=cur===t.dataset.t?"全部":t.dataset.t;chips();$("#cat").value=cur;render()}
if(f){const i=f.dataset.f;favs.has(i)?favs.delete(i):favs.add(i);wr("kh-fav",favs);render()}
if(c){const i=c.dataset.c;if(done.has(i)){done.delete(i);delete dd[i];delete ddT[i];lastStamp=""}else{done.add(i);const n=new Date();dd[i]=(n.getMonth()+1)+"/"+n.getDate();ddT[i]=tmNow();lastStamp=i}wr("kh-done",done);try{localStorage.setItem("kh-donedate",JSON.stringify(dd))}catch(e){}tmSave();render();lastStamp=""}
if(s){const d=DATA.find(x=>x.id===s.dataset.s);const text=`${d.title}｜${d.place}\n${sec==="birthday"?"BTS 生日應援地圖":"ARIRANG 巡演粉絲應援地圖｜"+CITIES[city].name}`;let url="";try{url=location.href}catch(x){}
try{if(navigator.share){await navigator.share({title:d.title,text,url});return}}catch(x){return}
try{await navigator.clipboard.writeText(text+"\n"+url);toast("已複製，可以貼到社群")}catch(x){toast("請手動複製網址分享")}}
});
$("#favBtn").onclick=()=>{onlyFav=!onlyFav;$("#favBtn").setAttribute("aria-pressed",onlyFav);$("#favBtn").textContent=(onlyFav?"♥":"♡")+" 我的收藏";render()};
$("#cat").innerHTML=["全部",...TYPES].map(t=>`<option>${t}</option>`).join("");
$("#st").innerHTML=STATUS.map(t=>`<option>${t}</option>`).join("");
function resetPanel(){kw="";st="全部";so="soon";tagSel.clear();$("#q").value="";$("#cat").value="全部";$("#st").value="全部";$("#so").value="soon";document.querySelectorAll("#tags input").forEach(i=>i.checked=false)}
$("#tgl").onclick=()=>{const p=$("#panel");p.hidden=!p.hidden;$("#tgl").setAttribute("aria-expanded",!p.hidden)};
$("#ap").onclick=()=>{kw=$("#q").value.trim().toLowerCase();cur=$("#cat").value;st=$("#st").value;so=$("#so").value;tagSel=new Set([...document.querySelectorAll("#tags input:checked")].map(i=>i.value));chips();render();$("#panel").hidden=true;$("#tgl").setAttribute("aria-expanded",false)};
$("#rs").onclick=()=>{resetPanel();cur="全部";chips();render()};
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter")$("#ap").click()});
$("#clr").onclick=()=>{cur="全部";resetPanel();day="全部";days();mem="全部";reg="全部";if(sec==="birthday"){members();regions()}onlyFav=false;$("#favBtn").setAttribute("aria-pressed",false);$("#favBtn").textContent="♡ 我的收藏";chips();render()};
{const[,m,d]=UPDATED.split("-");$("#upd").textContent="資訊更新於 "+(m*1)+"/"+(d*1)}

/* ===== 地圖總覽 / 路線規劃 ===== */
let leafletP=null,map=null,layer=null,lastLive=[],rt=[];
try{rt=JSON.parse(localStorage.getItem("kh-route")||"[]")}catch(e){}
let rtOff=new Set();try{rtOff=new Set(JSON.parse(localStorage.getItem("kh-route-off")||"[]"))}catch(e){}
function rtSave(){try{localStorage.setItem("kh-route-off",JSON.stringify([...rtOff]))}catch(e){}}
function loadLeaflet(){if(window.L)return Promise.resolve();if(leafletP)return leafletP;
leafletP=new Promise((ok,no)=>{const l=document.createElement("link");l.rel="stylesheet";l.href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";document.head.appendChild(l);
const j=document.createElement("script");j.src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";j.onload=ok;j.onerror=()=>{leafletP=null;no()};document.head.appendChild(j)});return leafletP}
function drawMap(){if(!map||!window.L)return;layer.clearLayers();const pts=[];
lastLive.forEach(d=>(d.ll||[]).forEach(p=>{pts.push(p);
L.circleMarker(p,{radius:9,color:"#08439a",weight:3,fillColor:"#e0245e",fillOpacity:.95}).addTo(layer).bindPopup(`<b>${esc(d.title)}</b><br>${esc(d.place)}<br><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.map)}">Google 地圖 ↗</a>`)}));
if(pts.length)map.fitBounds(pts,{padding:[30,30],maxZoom:15});else map.setView([22.65,120.3],11)}
$("#mapTgl").onclick=async()=>{const b=$("#mapBox");b.hidden=!b.hidden;$("#mapTgl").setAttribute("aria-expanded",!b.hidden);if(b.hidden)return;
try{await loadLeaflet()}catch(e){b.hidden=true;$("#mapTgl").setAttribute("aria-expanded",false);toast("地圖載入失敗，請檢查網路");return}
if(!map){map=L.map("map");L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap"}).addTo(map);layer=L.layerGroup().addTo(map)}
setTimeout(()=>{map.invalidateSize();drawMap()},0)};
function routeItems(){const L2=DATA.filter(d=>inSec(d)&&favs.has(d.id)&&stat(d)!=="已結束");
const ord=rt.filter(i=>L2.some(d=>d.id===i));L2.forEach(d=>{if(!ord.includes(d.id))ord.push(d.id)});return ord.map(i=>L2.find(d=>d.id===i))}
function routeR(){const b=$("#route");if(b.hidden)return;const L2=routeItems();
if(!L2.length){b.innerHTML="<h3>🧭 路線規劃</h3><small>先在卡片右上角按愛心收藏想去的應援，這裡就會列出來，可以調整順序後一次開啟 Google 地圖路線。</small>";return}
let nn=0;const sel=L2.filter(d=>!rtOff.has(d.id)).length;
b.innerHTML=`<h3>🧭 路線規劃（收藏的 ${L2.length} 個地點）</h3><small class="rsel">勾選要排進路線的地點，沒勾的不會列入。已選 ${sel} / ${L2.length} 個</small><div class="rrow rall"><button type="button" class="btn" data-all="1">全選</button><button type="button" class="btn" data-all="0">全不選</button></div><ol>${L2.map((d,i)=>{const off=rtOff.has(d.id);return `<li${off?' class="off"':''}><input type="checkbox" data-ck="${esc(d.id)}"${off?"":" checked"} aria-label="列入路線"><i>${off?"–":++nn}</i><b>${esc(d.title)}<br><small>${esc(d.place)}</small></b><button data-rm="${i}" data-dir="-1" aria-label="上移">↑</button><button data-rm="${i}" data-dir="1" aria-label="下移">↓</button></li>`}).join("")}</ol>
<div class="rrow"><select id="rmode" aria-label="交通方式"><option value="walking">步行</option><option value="transit">大眾運輸</option><option value="driving">開車</option></select><button class="btn main" id="rgo">在 Google 地圖開啟路線</button></div><small>依序從第 1 個走到最後一個。相同地點會自動合併；Google 地圖最多支援 10 個停靠點。收藏和順序只存在這個瀏覽器。</small>`}
$("#routeTgl").onclick=()=>{const b=$("#route");b.hidden=!b.hidden;$("#routeTgl").setAttribute("aria-expanded",!b.hidden);routeR()};
$("#route").addEventListener("click",e=>{const ck=e.target.closest("[data-ck]");if(ck){if(ck.checked)rtOff.delete(ck.dataset.ck);else rtOff.add(ck.dataset.ck);rtSave();routeR();return}
const al=e.target.closest("[data-all]");if(al){const ids=routeItems().map(d=>d.id);if(al.dataset.all==="1")ids.forEach(i=>rtOff.delete(i));else ids.forEach(i=>rtOff.add(i));rtSave();routeR();return}
const m=e.target.closest("[data-rm]");
if(m){const L2=routeItems().map(d=>d.id),i=+m.dataset.rm,j=i+ +m.dataset.dir;if(j<0||j>=L2.length)return;[L2[i],L2[j]]=[L2[j],L2[i]];rt=L2;try{localStorage.setItem("kh-route",JSON.stringify(rt))}catch(x){}routeR();return}
if(e.target.id==="rgo"){const q=[];routeItems().filter(d=>!rtOff.has(d.id)).forEach(d=>{if(q[q.length-1]!==d.map)q.push(d.map)});
if(q.length<2){toast("至少要兩個不同地點才能規劃路線");return}const s=q.slice(0,10),u="https://www.google.com/maps/dir/?api=1&travelmode="+$("#rmode").value+"&origin="+encodeURIComponent(s[0])+"&destination="+encodeURIComponent(s[s.length-1])+(s.length>2?"&waypoints="+s.slice(1,-1).map(encodeURIComponent).join("%7C"):"");window.open(u,"_blank","noopener")}});
/* 導覽小人：render 之後替每張卡片補一句提示。依 stat()／日期／tags／時間組句，最多兩句 */
function guideR(){try{const F=typeof FPAV!=="undefined"?FPAV:{};document.querySelectorAll("#list .card").forEach(c=>{if(c.querySelector(".gd"))return;const d=DATA.find(x=>String(x.id)===c.dataset.id),bx=c.querySelector(".box");if(!d||!bx||(d.chg&&/^取消/.test(d.chg)))return;
const t=today0(),o=[],sv=stat(d),tg=d.tags||[];
if(sv==="進行中"){if(d.end){const n=Math.round((day0(d.end)-t)/864e5);o.push(n<=0?"今天是最後一天，要去就趁今天":"進行中，還剩 "+(n+1)+" 天")}else o.push("正在進行中")}
else if(sv==="即將開始"){if(d.start){const n=Math.round((day0(d.start)-t)/864e5);o.push(n<=0?"今天開始":n===1?"明天就開始":"還有 "+n+" 天開始")}else o.push("快開始了")}
else return;
if(tg.includes("須配合店家低銷"))o.push("要配合店家低銷，先看一下菜單");else if(tg.includes("免費"))o.push("免費，直接去就好");
if(o.length<2){const tm=timeTxt(d);if(tm&&tm!=="—")o.push("記得確認時間")}
const g=document.createElement("div");g.className="gd";g.setAttribute("aria-hidden","true");g.innerHTML=(F[d.member]?`<img src="${F[d.member]}" alt="" decoding="async">`:"<i>💜</i>")+"<b>"+esc(o.slice(0,2).join("，"))+"</b>";bx.before(g)})}catch(e){}}
function afterRender(live){lastLive=live;guideR();if(!$("#mapBox").hidden)drawMap();routeR()}
/* 從網址還原篩選條件：?section=birthday&member=Jimin&region=香港&type=應援咖啡廳（巡演為 city、day、type） */
try{const q=new URLSearchParams(location.search);
if(sec==="birthday"){const m=q.get("member");mem=m==="all"?"全部":(m&&MEMBERS.some(x=>x[0]===m)?m:nearestMem());const r=q.get("region");if(r)reg=r}
const dd=q.get("day");if(sec==="tour"&&dd&&CITIES[city].days.includes(dd))day=dd;
const ty=q.get("type");if(ty&&TYPES.includes(ty))cur=ty}catch(e){if(sec==="birthday")mem=nearestMem()}
head();if(sec!=="songs"&&sec!=="foot"){chips();render()}


/* 系統返回鍵／上一頁：依網址還原所在分頁與篩選（切換分頁時用 pushState 留下紀錄） */
addEventListener("popstate",()=>{try{const q=new URLSearchParams(location.search),z=q.get("section");
sec=(z==="tour"||z==="birthday"||z==="songs"||(z==="foot"&&FOOT_OPEN))?z:"home";
const c=q.get("city");if(c&&CITIES[c])city=c;
day="全部";cur="全部";reg="全部";mem="全部";onlyFav=false;resetPanel();
if(sec==="birthday"){const m=q.get("member");mem=m==="all"?"全部":(m&&MEMBERS.some(x=>x[0]===m)?m:nearestMem());const r=q.get("region");if(r)reg=r}
const dd=q.get("day");if(sec==="tour"&&dd&&CITIES[city].days.includes(dd))day=dd;
const ty=q.get("type");if(ty&&TYPES.includes(ty))cur=ty;
$("#favBtn").setAttribute("aria-pressed",false);$("#favBtn").textContent="♡ 我的收藏";
tourEnd();head();if(sec!=="songs"&&sec!=="foot"){chips();render()}
window.scrollTo(0,0);if(sec!=="songs")songStop();
a2hsSync();tourAuto(sec)}catch(e){console.error(e)}});

/* 新手導覽（每個頁面第一次進入時自動出現，可用「？導覽」重看） */
const IA=/Instagram|Barcelona|Threads|\bLine\/|FBAN|FBAV|FB_IAB|MicroMessenger/i.test(navigator.userAgent),IOS=/iPhone|iPad|iPod/.test(navigator.userAgent),STANDALONE=(()=>{try{return navigator.standalone===true||matchMedia("(display-mode: standalone)").matches}catch(e){return false}})();
const A2HS=()=>{const L4=a=>`<ol>${a.map(x=>`<li>${x}</li>`).join("")}</ol>`;
const ios=IOS?L4(["用 Safari 開啟這個網頁","點畫面下方的「分享」鈕（方框加向上箭頭）","往下滑，點「加入主畫面」","右上角按「新增」，桌面就會出現圖示"]):L4(["用 Chrome 開啟這個網頁","點右上角的「⋮」選單","點「加到主畫面」或「安裝應用程式」","按「新增」或「安裝」，桌面就會出現圖示"]);
return `<div class="tr-note">${IA?`<div><b>你現在是在 Threads／IG／LINE 這類 App 裡面開的，這裡不能加到桌面。</b></div><div>先點右上角的選單，選「用瀏覽器開啟」，再照下面做：</div>`:`<div>照下面做就可以：</div>`}${ios}</div>`};
const TOURS={
home:[[".entry.tour","巡演應援","ARIRANG 巡演各城市的應援整理，依日期和類型找。"],[".entry.bd","生日應援","各成員生日與出道周年的應援整理。"],[".entry.songs","歌曲空耳／應援","每首歌的應援法，現場照著喊。藍色是大聲喊，紅色是跟著唱。"],["#ftnBtn","今日幸運籤","每天抽一張，看今天的應援運勢和練習任務。"],["#achBtn","成就圖鑑","徽章、籤卡圖鑑和稱號都收在這裡，看看自己收集到哪了。"],["#bgm","背景音樂","進站會自動播放背景音樂（手機要先點一下畫面才會出聲）。不想聽就點這個 ♪ 關掉，之後不會再自動播。"],["#bgv","投票選明天的音樂","點「投票」可以選明天要播的背景音樂，也能提名想聽的 YouTube 歌曲。投票時間每天 08:00–23:59（台北時間），00:00 結算，得票最高的就是隔天的歌。"],[null,"加到手機桌面","像 App 一樣一點就開，全螢幕、沒有網址列。",A2HS]],
songs:[["#sq","搜尋","輸入歌名、專輯、演唱會、空耳或應援內容，快速找到想看的歌。"],["#svt","依專輯／依成員／依演唱會","切換分類：依專輯看每張專輯的歌，依成員看各成員的個人專輯，依演唱會看每一場的演出歌單，歌名前面的編號是演出順序。"],["#swall","選專輯／演唱會","點封面進去，就會看到那張專輯或那場演唱會的歌曲。"],[".prb","歌單預測","在「依演唱會」裡，演唱會前先猜會唱哪些歌，公布實際歌單後自動算分，還有排行榜。點「開始猜」就能參加。"],["#stabs","選歌曲","點歌名按鈕切換，一次只顯示一首。"],["#sprog","演唱會通關","在演唱會裡，把每首有應援遊戲的歌都玩到 B 級以上，就能全曲通關。"],[".smode","KTV 模式","有附影片的歌可以切換成 KTV 模式，歌詞會跟著影片自動捲動，點兩下某一句就跳到那裡。"],[".smode [data-m=\"g\"]","應援遊戲","歌詞裡的藍色、紅色段落會變成音符，影片播到哪音符就落到哪；音符到線時點對應的按鈕，結束後會評等級並記下最佳成績。"],["#stabs .gsg","遊戲成績","玩過應援遊戲的歌，歌名旁會顯示最佳等級（S、A、B、C）。"],["#slist .fsz","字級","按 A− 或 A＋ 調整歌詞大小，現場看不清楚時可以放大。"],["#slist .sg","空耳與應援法","點標題可以展開或收合。藍色＝大聲喊，紅色＝跟著唱，橘色是提醒。"],["#slist .act a.of","官方應援歌詞","點這個按鈕開啟官方公布的應援歌詞，會另開新分頁。"],["#slist .act a:not(.of)","影片／參考連結","點這個按鈕開啟影片或參考網址，會另開新分頁。"]],
tour:[["#cities","切換城市","先選你要看的城市，每個城市有各自的應援清單。"],["#days","選日期","再選演唱會日期，只看當天可以去的應援。"],["#chips","依類型篩選","這排可以左右滑，選燈箱/看板、咖啡廳、LED 廣告車等類型。"],[".tbtns","地圖、路線、搜尋","地圖總覽看位置，路線規劃排行程，搜尋及排序找特定活動。"],["#list .heart","收藏","點愛心收藏，之後按上方「我的收藏」就能只看這些。"],["#list [data-c]","打卡集章","去過就按打卡，會蓋章，也會記下日期。"],["#badgeBtn","徽章","集章達標會解鎖徽章，點這裡看全部徽章和進度。"],["#saveImg","存成圖片","把集章簿存成圖片，分享到社群。"],["footer","我要投稿／錯誤回報","有新的應援資訊想提供，或發現資料有誤，點頁尾這兩顆按鈕填表單告訴我們。"]],
birthday:[["#members","選成員","選要看的成員，預設是最近要生日的那位。"],["#regions","選地區","再依地區縮小範圍。"],["#chips","依類型篩選","這排可以左右滑，選燈箱/看板、咖啡廳、LED 廣告車等類型。"],[".tbtns","地圖、路線、搜尋","地圖總覽看位置，路線規劃排行程，搜尋及排序找特定活動。"],["#list .heart","收藏","點愛心收藏，之後按上方「我的收藏」就能只看這些。"],["#list [data-c]","打卡集章","去過就按打卡，會蓋章，也會記下日期。"],["#badgeBtn","徽章","集章達標會解鎖徽章，點這裡看全部徽章和進度。"],["#saveImg","存成圖片","把集章簿存成圖片，分享到社群。"],["footer","我要投稿／錯誤回報","有新的應援資訊想提供，或發現資料有誤，點頁尾這兩顆按鈕填表單告訴我們。"]],
foot:[["#fpm","選成員","先選要看哪位成員去過的地方，預設是全部。"],["#fpw","選國家","點國家進去看那個國家的足跡，進去之後還能再依類別、城市縮小範圍。"],["#fpn","我去過幾個","這裡會顯示收錄了幾個足跡，以及你已經去過幾個。"],["#fpc","依類別篩選","這排可以左右滑，依類別縮小範圍。"],["#fpcity","選城市","同一個國家裡，再依城市縮小範圍。"],["#fpl [data-fv]","我去過了","去過就按「我去過了」，會記下日期，也會累積足跡徽章。再按一次可以取消。"],["#fpl .act a","地圖與連結","點「地圖」直接用 Google 地圖開啟，有出處連結的也在這裡，會另開新分頁。"],["footer","我要投稿／錯誤回報","有新的足跡資訊想提供，或發現資料有誤，點頁尾這兩顆按鈕填表單告訴我們。"]]};
let TR=null;
function tourEls(){return document.querySelectorAll(".tr-hl,.tr-block,.tr-card")}
function tourEnd(){document.body.classList.remove("tr-on");tourEls().forEach(e=>e.remove());if(TR){cancelAnimationFrame(TR.raf);window.removeEventListener("scroll",TR.sync);window.removeEventListener("resize",TR.sync);document.removeEventListener("keydown",TR.key)}TR=null}
function tourStart(z){
if(TR)tourEnd();
const L=(TOURS[z]||[]).filter(t=>{if(!t[0])return !STANDALONE;const e=document.querySelector(t[0]);return e&&e.getClientRects().length&&!e.closest("[hidden]")});
if(!L.length)return;
try{localStorage.setItem("kh-tour-"+z,"1")}catch(e){}
const hl=document.createElement("div");hl.className="tr-hl";
const bl=document.createElement("div");bl.className="tr-block";
const cd=document.createElement("div");cd.className="tr-card";cd.setAttribute("role","dialog");cd.setAttribute("aria-live","polite");
document.body.classList.add("tr-on");document.body.append(bl,hl,cd);
let i=0;
let hv="";const setHl=v=>{if(v!==hv){hv=v;hl.style.cssText=v}};
const place=()=>{const e=L[i][0]?document.querySelector(L[i][0]):null;if(!e){setHl("top:"+(scrollY+innerHeight/2)+"px;left:"+(scrollX+innerWidth/2)+"px;width:0;height:0;border-color:transparent;outline-color:transparent");return}const r=e.getBoundingClientRect(),p=6;
setHl("top:"+(r.top+scrollY-p)+"px;left:"+(r.left+scrollX-p)+"px;width:"+(r.width+2*p)+"px;height:"+(r.height+2*p)+"px")};
const show=()=>{const t=L[i],e=t[0]?document.querySelector(t[0]):null;
cd.innerHTML=`<div class="tr-h"><b>${t[1]}</b><span>${i+1} / ${L.length}</span></div><p>${t[2]}</p>${t[3]?t[3]():""}<div class="tr-a"><button type="button" class="tr-skip">略過</button><span><button type="button" class="btn tr-prev"${i?"":' style="display:none"'}>‹ 上一步</button><button type="button" class="btn main tr-next">${i===L.length-1?(z==="home"?"開始逛":"完成"):"下一步 ›"}</button></span></div>`;
if(e){const r=e.getBoundingClientRect(),vh=innerHeight,cardH=cd.offsetHeight+16;
const want=r.top+scrollY-Math.max(80,(vh-cardH-r.height)/3);
if(r.top<60||r.bottom>vh-cardH-24)window.scrollTo({top:Math.max(0,want),behavior:"auto"})}
cd.querySelector(".tr-skip").onclick=tourEnd;
cd.querySelector(".tr-prev").onclick=()=>{i--;show()};
cd.querySelector(".tr-next").onclick=()=>{if(i>=L.length-1){tourEnd();return}i++;show()};
requestAnimationFrame(place);setTimeout(place,120);setTimeout(place,350)};
TR={raf:0,sync:place,key:e=>{if(e.key==="Escape")tourEnd()}};
window.addEventListener("scroll",place,{passive:true});window.addEventListener("resize",place);document.addEventListener("keydown",TR.key);
const loop=()=>{if(!TR)return;place();TR.raf=requestAnimationFrame(loop)};TR.raf=requestAnimationFrame(loop);
bl.onclick=e=>{const x=e.clientX,y=e.clientY;tourEnd();const t=document.elementFromPoint(x,y),g=t&&t.closest("[data-go]");if(g)g.click()};
show()}
function tourAuto(z){if(!TOURS[z])return;let seen=false;try{seen=localStorage.getItem("kh-tour-"+z)==="1"}catch(e){}if(seen)return;setTimeout(()=>{if(sec===z)tourStart(z)},450)}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#tourBtn,.tourBtn2"))tourStart(sec)});

function a2hsSync(){const b=document.getElementById("a2hs");if(!b)return;let x=false;try{x=localStorage.getItem("kh-a2hs-x")==="1"}catch(e){}
if(STANDALONE||x||sec!=="home"){b.hidden=true;b.innerHTML="";return}
if(!b.hidden&&b.firstChild)return;
b.hidden=false;let open=false;
const draw=()=>{b.innerHTML=`<div class="a2hs-row"><div class="a2hs-t"><b>把 BTS 應援地圖加到主畫面</b><span>像 App 一樣一點就開，全螢幕沒有網址列</span></div><button type="button" class="a2hs-go">${open?"收起":"怎麼加？"}</button><button type="button" class="a2hs-x" aria-label="關閉">×</button></div>${open?A2HS():""}`};
draw();
b.onclick=e=>{if(e.target.closest(".a2hs-go")){open=!open;draw()}else if(e.target.closest(".a2hs-x")){try{localStorage.setItem("kh-a2hs-x","1")}catch(x){}b.hidden=true;b.innerHTML=""}}}
if(sec==="home")tourAuto("home");
a2hsSync();

/* 公告列：改下面的 ANN 就能新增公告（新的放最前面，id 不可重複） */
/* 公告翻譯：每則公告的 tr 放英、韓、日的 [標題, 內容]；新增公告時一起填，沒填的語言就顯示中文原文。 */
const ANN=[
{id:"a7",date:"10/20",t:"尋找小彩蛋！小人們偷偷躲在站內",d:"成員小人們溜進網站啦！有人躲在螢幕邊邊偷看你，有時候還在呼呼大睡……聽說首頁的標題很怕癢，多戳幾下也許會有驚喜；找到彩蛋還能拿到隱藏徽章喔。提示就這麼多，剩下的靠你的手指了！",tr:{en:["Easter egg hunt! The little ones are hiding in the site","The member avatars have sneaked into the site! One peeks at you from the edge of the screen, and sometimes he's fast asleep... They say the home title is very ticklish, so poke it a few times and you might get a surprise. Finding it even earns you a hidden badge. That's all the hints you get, the rest is up to your fingers!"],ko:["이스터에그를 찾아라! 캐릭터들이 사이트에 숨었어요","멤버 캐릭터들이 몰래 사이트에 들어왔어요! 화면 가장자리에서 빼꼼 쳐다보는 친구도 있고, 쿨쿨 자고 있을 때도 있어요... 홈 제목은 간지럼을 많이 탄대요. 여러 번 콕콕 눌러 보면 깜짝 선물이 있을지도요! 찾으면 숨겨진 배지도 받을 수 있어요. 힌트는 여기까지, 나머지는 여러분의 손가락에 달렸어요!"],ja:["イースターエッグを探せ！ミニキャラがサイトに隠れているよ","メンバーのミニキャラがこっそりサイトに入り込みました！画面の端からのぞいている子もいれば、ぐっすり眠っている時も……。ホームのタイトルはくすぐったがりらしいので、何度かつついてみると、いいことがあるかも。見つけると隠しバッジももらえます。ヒントはここまで、あとは指先しだい！"]}},
{id:"a6",date:"10/18",t:"新增「背景音樂投票」，一起決定明天播哪首",d:"左下角的「投票」可以投給喜歡的歌，也能提名想聽的 YouTube 歌曲，審核通過後會出現在名單。投票時間每天 08:00–23:59（台北時間），00:00 結算，得票最高的就是隔天的背景音樂。一天一票，可以改投。",tr:{en:["Added background music voting: pick tomorrow's song together","Tap “Vote” at the bottom left to vote for a song you like, or nominate a YouTube song; it joins the list after approval. Voting is open daily 08:00–23:59 (Taipei time), results are tallied at 00:00, and the top song plays the next day. One vote per day, and you can change it."],ko:["배경음악 투표 추가: 내일 들을 곡을 함께 정해요","왼쪽 아래의 '투표'를 눌러 좋아하는 곡에 투표하거나 YouTube 곡을 추천할 수 있어요. 승인 후 목록에 표시돼요. 투표 시간은 매일 08:00–23:59(타이베이 시간), 00:00에 집계하며 최다 득표 곡이 다음 날의 배경음악이 돼요. 하루 한 표, 변경 가능해요."],ja:["BGM投票を追加：明日の曲をみんなで決めよう","左下の「投票」で好きな曲に投票できます。聴きたいYouTube曲の推薦もでき、承認後にリストへ表示されます。投票時間は毎日08:00〜23:59（台北時間）、00:00に集計し、最多得票の曲が翌日のBGMになります。1日1票で、変更もできます。"]}},
{id:"a5",date:"10/18",t:"新增「今日幸運籤」，每天抽一張",d:"首頁點「今日幸運籤」，每天抽一張，有運勢、幸運色、練習任務和推薦歌，連續抽籤還能解鎖稱號。抽完可以存成圖片，長按就能儲存或分享。",tr:{en:["Added “Today's Fanchant Fortune” — draw one a day", "Tap “Today's Fanchant Fortune” on the home page to draw one a day: luck, lucky color, a practice mission and a recommended song. Keep a streak to unlock titles. Save it as an image, then press and hold to save or share."],ko:["'오늘의 응원 운세' 추가 — 하루에 한 장 뽑기", "홈에서 '오늘의 응원 운세'를 눌러 하루에 한 장 뽑아 보세요. 운세, 행운의 색, 연습 미션, 추천곡을 볼 수 있고 연속으로 뽑으면 칭호를 얻어요. 이미지로 저장한 뒤 길게 눌러 저장하거나 공유하세요."],ja:["「今日の応援おみくじ」を追加。1日1枚引けます", "ホームの「今日の応援おみくじ」から1日1枚引けます。運勢・ラッキーカラー・練習ミッション・おすすめ曲に加え、連続で引くと称号も獲得。画像として保存したら、長押しで保存・共有できます。"]}},
{id:"a4",date:"10/16",t:"新增「演唱會歌曲空耳／應援」，先收錄 Hooligan 官方應援",d:"首頁新增歌曲空耳／應援入口，點歌名按鈕就能切換歌曲；藍色是大聲喊，紅色是跟著唱。",tr:{en:["Added “Concert Songs: Soramimi & Fanchants”, starting with the official Hooligan fanchant", "The home page has a new entrance for song soramimi and fanchants. Tap a song button to switch songs. Blue = shout loudly, red = sing along."],ko:["'콘서트 곡 空耳·응원법' 추가, 먼저 Hooligan 공식 응원법 수록", "홈에 곡별 空耳·응원법 입구가 생겼어요. 곡명 버튼을 눌러 곡을 전환하세요. 파랑은 크게 외치기, 빨강은 따라 부르기예요."],ja:["「コンサート曲 空耳・応援法」を追加。まずHooliganの公式応援を収録", "ホームに曲ごとの空耳・応援法の入口を追加しました。曲名ボタンで曲を切り替えられます。青は大きな声で叫ぶ、赤は一緒に歌う。"]}},
{id:"a3",date:"10/16",t:"BTS高雄大型應援已更新",d:"高雄的大型應援資訊已更新，出發前可以再看一下各活動的時間與地點。",tr:{en:["BTS Kaohsiung major projects updated", "Info on the major Kaohsiung projects has been updated. Check each project's time and place again before you go."],ko:["BTS 가오슝 대형 응원 업데이트", "가오슝 대형 응원 정보가 업데이트되었어요. 출발 전에 각 응원의 시간과 장소를 다시 확인하세요."],ja:["BTS高雄の大型応援を更新しました", "高雄の大型応援情報を更新しました。出発前に各応援の時間と場所をもう一度ご確認ください。"]}},
{id:"a2",date:"10/16",t:"應援資訊持續更新中，有異動會標紅色提醒",d:"活動改期或取消時，卡片會出現「⚠ 有異動」或「已取消」。出發前建議再確認一次主辦的貼文。",tr:{en:["Info is updated continuously; changes are flagged in red", "When a project is rescheduled or canceled, its card shows “⚠ Changed” or “Canceled”. Please check the organizer's post once more before you go."],ko:["응원 정보는 계속 업데이트되며 변경 사항은 빨간색으로 표시돼요", "응원이 일정 변경되거나 취소되면 카드에 '⚠ 변경됨' 또는 '취소됨'이 표시돼요. 출발 전 주최측 게시물을 한 번 더 확인하세요."],ja:["応援情報は随時更新中。変更は赤で表示します", "応援の日程変更や中止があると、カードに「⚠ 変更あり」または「中止」と表示されます。出発前に主催者の投稿をもう一度ご確認ください。"]}},
{id:"a1",date:"10/16",t:"新增集章簿、收藏與新手導覽",d:"打卡會記下日期，集章簿可以存成圖片分享。第一次進入各頁會有導覽，之後可按「？導覽」重看。",tr:{en:["Added stamp book, favorites and a beginner's guide", "Check-ins record the date, and your stamp book can be saved as an image to share. The first time you open each page there's a guide; tap “? Guide” to replay it."],ko:["스탬프북, 즐겨찾기, 초보자 가이드 추가", "체크인하면 날짜가 기록되고, 스탬프북은 이미지로 저장해 공유할 수 있어요. 각 페이지에 처음 들어가면 가이드가 나오고, 이후에는 '? 가이드'를 눌러 다시 볼 수 있어요."],ja:["スタンプ帳・お気に入り・初心者ガイドを追加", "チェックインすると日付が記録され、スタンプ帳は画像で保存してシェアできます。各ページの初回表示ではガイドが出ます。あとから「? ガイド」で見直せます。"]}}];
try{ANN.forEach(a=>{if(a.tr&&window.I18N){["t","d"].forEach((f,k)=>I18N.add(a[f],a.tr.en[k],a.tr.ko[k],a.tr.ja[k]))}});window.I18N&&I18N.refresh()}catch(e){}
/* 成員生日、BTS 出道周年（6/13）當天自動出現的公告，不用手動新增。每則每年各算一次，關掉後當年不會再出現。 */
function bdT(n){return "HAPPY "+n.toUpperCase()+" DAY！祝 "+n+" 生日快樂"}
function bdD(n){return "今天是 "+n+" 的生日！一起為 "+n+" 送上祝福，也可以到「生日應援」看各地的應援。"}
function anT(a){return "HAPPY BTS DAY！祝 BTS 出道 "+a+" 週年快樂"}
function anD(a){return "今天是 BTS 出道 "+a+" 週年！一起為 BTS 送上祝福，也可以到「生日應援」看各地的應援。"}
function bdToday(){const t=today0(),mo=t.getMonth()+1,da=t.getDate(),y=t.getFullYear();return MEMBERS.filter(m=>m[1]===mo&&m[2]===da).map(m=>m[0]==="BTS"?{id:"bd"+y+"-BTS",bd:1,date:mo+"/"+da,t:anT(y-2013),d:anD(y-2013)}:{id:"bd"+y+"-"+m[0],bd:1,date:mo+"/"+da,t:bdT(m[0]),d:bdD(m[0])})}
try{const KO={RM:"RM",Jin:"진",SUGA:"슈가","j-hope":"제이홉",Jimin:"지민",V:"뷔",Jungkook:"정국"},JP={RM:"RM",Jin:"ジン",SUGA:"シュガ","j-hope":"j-hope",Jimin:"ジミン",V:"V",Jungkook:"ジョングク"};
MEMBERS.forEach(m=>{const n=m[0];if(n==="BTS"||!window.I18N)return;const k=KO[n]||n,j=JP[n]||n,H="HAPPY "+n.toUpperCase()+" DAY";
I18N.add(bdT(n),H+"! Happy birthday, "+n+"!",H+"! "+k+", 생일 축하해요!",H+"！"+j+"、お誕生日おめでとう！");
I18N.add(bdD(n),"Today is "+n+"'s birthday! Send him your wishes, and check “Birthday Projects” for fan projects in each city.","오늘은 "+k+"의 생일이에요! 함께 축하해 주세요. '생일 응원'에서 각 지역의 응원도 확인해 보세요.","今日は"+j+"の誕生日です！みんなでお祝いしましょう。「誕生日応援」で各地の応援もご覧ください。")});
if(window.I18N)for(let a=1;a<=60;a++){const o=a%100>=11&&a%100<=13?"th":({1:"st",2:"nd",3:"rd"})[a%10]||"th";
I18N.add(anT(a),"HAPPY BTS DAY! Happy "+a+o+" anniversary, BTS!","HAPPY BTS DAY! BTS 데뷔 "+a+"주년 축하해요!","HAPPY BTS DAY！BTSデビュー"+a+"周年おめでとう！");
I18N.add(anD(a),"Today is BTS's "+a+o+" debut anniversary! Send your wishes, and check “Birthday Projects” for fan projects in each city.","오늘은 BTS 데뷔 "+a+"주년이에요! 함께 축하해 주세요. '생일 응원'에서 각 지역의 응원도 확인해 보세요.","今日はBTSデビュー"+a+"周年です！みんなでお祝いしましょう。「誕生日応援」で各地の応援もご覧ください。")}
window.I18N&&I18N.refresh()}catch(e){}
function annFit(){const t=document.querySelector("#ann .ann-t"),m=t&&t.firstElementChild;if(!m)return;m.classList.remove("run");m.style.animationDuration="";
if(matchMedia("(prefers-reduced-motion:reduce)").matches)return;
if(m.scrollWidth>t.clientWidth+1){m.classList.add("run");m.style.animationDuration=Math.max(8,(m.scrollWidth+t.clientWidth*2)/55)+"s"}}
addEventListener("resize",()=>{try{annFit()}catch(e){}});try{document.fonts.ready.then(()=>annFit())}catch(e){}
function annR(){const box=document.getElementById("ann");if(!box)return;
if(sec!=="home"){box.hidden=true;return}
let hid="",hb="";try{hid=localStorage.getItem("kh-ann")||"";hb=localStorage.getItem("kh-ann-bd")||""}catch(e){}
const bl=bdToday(),top=bl.find(x=>x.id!==hb)||(ANN[0]&&ANN[0].id!==hid?ANN[0]:null);if(!top){box.hidden=true;box.innerHTML="";return}
box.hidden=false;
box.innerHTML=`<div class="ann-row"><i class="ann-dot"></i><span class="ann-new">NEW</span><span class="ann-t"><span class="ann-m">${esc(top.t)}</span></span><button type="button" class="ann-l" data-a="d">詳情 ›</button><button type="button" class="ann-l" data-a="all">全部公告 ›</button><button type="button" class="ann-x" data-a="x" aria-label="關閉公告">×</button></div><div class="ann-more" hidden></div>`;
annFit();
box.onclick=e=>{const b=e.target.closest("[data-a]");if(!b)return;const a=b.dataset.a,m=box.querySelector(".ann-more");
if(a==="x"){try{localStorage.setItem(top.bd?"kh-ann-bd":"kh-ann",top.id)}catch(x){}annR();return}
const mode=m.dataset.m;
if(a==="d"){if(mode==="d"){m.hidden=true;m.dataset.m="";return}m.dataset.m="d";m.hidden=false;m.innerHTML=`<p>${esc(top.d||"")}</p>`}
if(a==="all"){if(mode==="all"){m.hidden=true;m.dataset.m="";return}m.dataset.m="all";m.hidden=false;const hi=ANN.findIndex(y=>y.id===hid),nw=hi>0?hi:1;m.innerHTML=bl.concat(ANN).map((x,xi)=>`<div class="ann-i">${(x.bd?x.id!==hb:xi-bl.length<nw)?'<span class="ann-new">NEW</span>':""}<b>${esc(x.date||"")}</b> ${esc(x.t)}<p>${esc(x.d||"")}</p></div>`).join("")}}}
annR();

/* 歌曲空耳／應援：改下面的 SONGS 就能新增歌曲（t 歌名、a 專輯或場次、h 空耳、c 應援法，換行用 \n，u 影片或參考連結） */
const TL=/^(\d{1,2}):(\d{2})(?:(\.\d+))?\s+/;
/* 唱段小人：時間碼後面可加「@成員」標記，例如「0:07 @Jimin,V [紅] 歌詞」；多位用逗號或斜線分開，@全員 ＝ 七人。KTV 模式該句上方會顯示這幾位的小人，唱到時亮起來 */
const MTAG=/^@([^\s]+)\s*/,MORD=["Jin","SUGA","j-hope","RM","Jimin","V","Jungkook"];
const MALI={jin:"Jin",seokjin:"Jin",碩珍:"Jin",金碩珍:"Jin",suga:"SUGA",yoongi:"SUGA",玧其:"SUGA",閔玧其:"SUGA",sg:"SUGA","j-hope":"j-hope",jhope:"j-hope",hoseok:"j-hope",jh:"j-hope",號錫:"j-hope",鄭號錫:"j-hope",rm:"RM",namjoon:"RM",南俊:"RM",金南俊:"RM",jimin:"Jimin",jm:"Jimin",智旻:"Jimin",朴智旻:"Jimin",v:"V",taehyung:"V",泰亨:"V",金泰亨:"V",jungkook:"Jungkook",jk:"Jungkook",jeongguk:"Jungkook",柾國:"Jungkook",田柾國:"Jungkook"};
function memParse(l){const m=String(l).match(MTAG);if(!m)return{l:l,m:[]};const o=[];m[1].split(/[,，、\/]+/).forEach(w=>{const k=w.trim().toLowerCase();if(k==="全員"||k==="all"||k==="bts")MORD.forEach(n=>o.indexOf(n)<0&&o.push(n));else if(MALI[k]&&o.indexOf(MALI[k])<0)o.push(MALI[k])});return{l:String(l).replace(MTAG,""),m:o}}
function kAv(items){const F=typeof FPAV!=="undefined"?FPAV:null;if(!F)return"";const u=[];items.forEach(t=>(t.m||[]).forEach(n=>u.indexOf(n)<0&&u.push(n)));const L=MORD.filter(n=>u.indexOf(n)>=0&&F[n]);if(!L.length)return"";return `<div class="kav${L.length>3?" all":L.length<3?" sm s"+L.length:""}" role="img" aria-label="演唱：${L.join("、")}">${L.map(n=>`<img src="${F[n]}" alt="" aria-hidden="true" decoding="async">`).join("")}</div>`}
const SONGS=[
{t:"Hooligan",a:"官方應援（不含空耳）",h:"",c:"藍色＝大聲喊　紅色＝跟著唱\n\n從 7 秒開始，依序喊成員全名：\n[藍] Kim Namjoon! Kim Seokjin! Min Yoongi! Jeong Hoseok!\n[藍] Park Jimin! Kim Taehyung! Jeon Jungkook! BTS!",u:""}];
function sfmt(t){const inl=x=>esc(x).replace(/\{(藍|紅|橘)\|([^{}]*)\}/g,(m,c,v)=>`<span class="${c==="藍"?"ib":c==="紅"?"ir":"io"}">${v}</span>`);return String(t).split("\n").map(l=>{l=l.replace(TL,"");if(MTAG.test(l))l=l.replace(MTAG,"");const m=l.match(/^\[(藍|紅|橘|靜)(?:[長名]?[\d.]*)\]\s?(.*)$/);if(m)return `<div class="cl ${m[1]==="藍"?"b":m[1]==="紅"?"r":m[1]==="靜"?"q":"o"}">${inl(m[2])||"&nbsp;"}</div>`;return `<div>${inl(l)||"&nbsp;"}</div>`}).join("")}
let SEL="";try{SEL=localStorage.getItem("song-sel")||""}catch(e){}
let ALB="";
const FS=[.85,1];let FSI=1;try{const v=+localStorage.getItem("song-fs");if(v>=0&&v<FS.length&&localStorage.getItem("song-fs")!==null)FSI=v}catch(e){}
function fsApply(){document.documentElement.style.setProperty("--sfs",FS[FSI]);const o=document.getElementById("fso");if(o)o.textContent=Math.round(FS[FSI]*100)+"%";[["fs-","-1"],["fs+","1"]].forEach(([id,d])=>{const b=document.querySelector('[data-fs="'+d+'"]');if(b)b.disabled=FS[FSI+ +d]===undefined})}
fsApply();
let SMODE="n";try{SMODE=localStorage.getItem("song-mode")==="k"?"k":"n"}catch(e){}
const YTID=u=>{const m=String(u||"").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/);return m?m[1]:""};
function songVid(x){const vu=YTID(x.u),vk=YTID(x.k);return SMODE==="k"||SMODE==="g"?(vk||vu):(vu||vk)}
function songTimed(x){const o=[];[["h",x.h],["c",x.c]].forEach(([k,v])=>String(v||"").split("\n").forEach(l=>{const m=l.match(TL);if(m){const q=memParse(l.replace(TL,""));o.push({s:+m[1]*60+ +m[2]+(m[3]?+m[3]:0),k,l:q.l,m:q.m})}}));return o.sort((a,b)=>(a.s-b.s)||(a.k<b.k?-1:a.k>b.k?1:0))}
function songGroups(T){const G=[];T.forEach(t=>{const g=G[G.length-1];if(g&&g.s===t.s)g.i.push(t);else G.push({s:t.s,i:[t]})});return G}
function songLinks(x){const ok=v=>/^https?:\/\//.test(v||""),b=[],v=x.u||x.k;if(ok(v))b.push(`<a class="btn" target="_blank" rel="noopener" href="${esc(v)}">影片／參考 ↗</a>`);if(ok(x.o))b.push(`<a class="btn of" target="_blank" rel="noopener" href="${esc(x.o)}">官方應援歌詞 ↗</a>`);return b.length?`<div class="act">${b.join("")}</div>`:""}
function srAlign(){try{const c=document.querySelector("#slist .card.song"),sr=c&&c.querySelector(".sr"),yt=c&&c.querySelector(".yt");if(!sr)return;sr.style.paddingTop="";if(!yt||!matchMedia("(min-width:1000px)").matches||c.classList.contains("ktvm")||sr.querySelector(".gm,#gm"))return;const d=yt.getBoundingClientRect().top-sr.getBoundingClientRect().top-(sr.querySelector(".sg")?10:0);if(d>40)sr.style.paddingTop=d+"px"}catch(e){}}
addEventListener("resize",srAlign);try{document.fonts&&document.fonts.ready.then(srAlign)}catch(e){}
function songCard(x){const off=navigator.onLine===false,vid=songVid(x),T=vid?songTimed(x):[],k=vid&&!off&&SMODE==="k",g=vid&&!off&&SMODE==="g";
const media=vid?(off?`<div class="khint">離線中：影片和 KTV 模式要有網路才能用，下面的空耳與應援法還是可以看。</div>`:`<div class="smode"><button type="button" class="chip" data-m="n" aria-pressed="${!k&&!g}">一般模式</button><button type="button" class="chip" data-m="k" aria-pressed="${k}">KTV 模式</button><button type="button" class="chip" data-m="g" aria-pressed="${g}">應援遊戲</button></div><div class="yt"><div id="ytp"></div></div>${k?`<div class="kinfo"><span id="kt0">0:00</span><span id="knx"></span><span id="kt1">0:00</span></div><div class="kbar" id="kbar" title="點一下跳到那裡；彩色刻度是應援位置"></div>`:""}`):"";
const body=g?gameHTML(T,x):k?(T.length?`<div class="khint">跟著影片自動捲動　點兩下跳到那一句</div><div class="ktv" id="ktv">${songGroups(T).map((g,j,A)=>`<div class="kb" data-s="${g.s}" data-e="${A[j+1]?A[j+1].s:g.s+6}">${kAv(g.i)}${g.i.map(t=>`<div class="kl ${t.k}">${sfmt(t.l)}</div>`).join("")}</div>`).join("")}</div>`:`<div class="empty">這首歌還沒有時間碼，暫時無法使用 KTV 模式</div>`):`${x.c?`<details class="sg" open><summary>應援法</summary><div class="sgt">${sfmt(x.c)}</div></details>`:""}`;
return `<article class="card song${k?" ktvm":""}"><div class="topr"><div class="fsz"><span>字級</span><button type="button" class="chip" data-fs="-1" aria-label="縮小字級" title="縮小字級">A−</button><output id="fso" aria-live="polite"></output><button type="button" class="chip" data-fs="1" aria-label="放大字級" title="放大字級">A＋</button></div>${songLinks(x)}</div><div class="sl"><h2>${esc(x.t)}</h2>${x.a?`<div class="by">${esc(x.a)}</div>`:""}${media}<div class="fpbk">${fpBack(x)}</div></div><div class="sr">${body}</div></article>`}
let GR=0,GN=[],GL=0,GC=0,GF=false;let YP=null,YT_T=0,PT=0,KA=-1,LC=0,LE=null,KS=false,KU=0;
/* 手動滑動歌詞後，暫停自動捲動 5 秒；按「回到目前這句」或時間到就恢復 */
/* 影片下方進度條：彩色刻度＝應援位置（藍/紅/橘），點一下跳到那裡（靠近刻度會吸附到該刻度前 1 秒） */
function kfmt(t){t=Math.max(0,Math.floor(t));return Math.floor(t/60)+":"+String(t%60).padStart(2,"0")}
function ktvBarUpd(t){const b=document.getElementById("kbar"),k=document.getElementById("ktv");if(!b||!k||!YP||!YP.getDuration)return;const d=YP.getDuration();if(!d)return;
if(b.dataset.d!==String(d)){let h='<div class="kf"></div>';[...k.children].forEach(el=>{const q=el.querySelector(".cl.b,.cl.r,.cl.o,.ib,.ir,.io");if(!q)return;const c=q.classList.contains("b")||q.classList.contains("ib")?"b":q.classList.contains("r")||q.classList.contains("ir")?"r":"o";h+=`<i class="${c}" data-c="${c}" style="left:${(+el.dataset.s/d*100).toFixed(2)}%" data-s="${el.dataset.s}"></i>`});b.innerHTML=h+'<div class="kn"></div>';b.dataset.d=String(d);b._n=-2;const e1=document.getElementById("kt1");if(e1)e1.textContent=kfmt(d)}
const W=b.clientWidth,pc=Math.min(1,Math.max(0,t/d));b.querySelector(".kf").style.width=Math.round(pc*W/8)*8+"px";b.querySelector(".kn").style.left=pc*100+"%";
const e0=document.getElementById("kt0");if(e0)e0.textContent=kfmt(t);
const ts=b.querySelectorAll("i");let nx=-1;for(let i=0;i<ts.length;i++){if(+ts[i].dataset.s>t+.2){nx=i;break}}
if(b._n!==nx){b._n=nx;ts.forEach((el,i)=>{el.classList.toggle("p",nx===-1||i<nx);el.classList.toggle("nx",i===nx)});const x=document.getElementById("knx");if(x){if(nx<0)x.textContent=ts.length?"沒有更多應援了":"";else{const el=ts[nx],c=el.dataset.c,N={b:["藍","大聲喊"],r:["紅","跟著唱"],o:["橘","提醒"]}[c];x.innerHTML=`下一個：<b class="kc-${c}">${N[0]}・${N[1]}</b> ${kfmt(+el.dataset.s)}`}}}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("#kbar");if(!b||!YP||!YP.seekTo)return;const d=+b.dataset.d;if(!d)return;const x=e.clientX-b.getBoundingClientRect().left;let t=x/b.clientWidth*d,bd=1e9,bs=null;b.querySelectorAll("i").forEach(i=>{const dd=Math.abs(i.offsetLeft+i.offsetWidth/2-x);if(dd<bd){bd=dd;bs=i}});if(bs&&bd<14)t=Math.max(0,+bs.dataset.s-1);KU=0;ktvBtn(false);KA=-1;YP.seekTo(t,true);YP.playVideo&&YP.playVideo()});
function ktvBtn(on){let b=document.getElementById("ktvBack");if(!b){if(!on)return;b=document.createElement("button");b.id="ktvBack";b.type="button";b.textContent="↓ 回到目前這句";b.addEventListener("click",e=>{e.stopPropagation();KU=0;KA=-1;ktvBtn(false);try{ktvTick()}catch(x){}});document.body.appendChild(b)}b.classList.toggle("on",!!on)}
function ktvPause(e){if(!e.target.closest||!e.target.closest("#ktv")||!YP)return;KU=Date.now()+5000;ktvBtn(true)}
document.addEventListener("wheel",ktvPause,{passive:true});document.addEventListener("touchmove",ktvPause,{passive:true});
function ytLoad(cb){if(window.YT&&YT.Player)return cb();const p=window.onYouTubeIframeAPIReady;window.onYouTubeIframeAPIReady=()=>{p&&p();cb()};if(!document.getElementById("yt-api")){const e=document.createElement("script");e.id="yt-api";e.src="https://www.youtube.com/iframe_api";document.head.appendChild(e)}}
/* 背景音樂：預設是下面這個 YouTube 網址；要換歌改這裡，或在 data.js 設定 BGM_URL（YouTube 或 mp3 網址）。瀏覽器不允許自動出聲，所以預設開啟：進站就嘗試播放，被瀏覽器擋掉時第一次點或觸碰畫面就會開始；關掉之後會記住，下次不再自動播。 */
/* 背景音樂投票（Google Apps Script 後端，部署方式見 vote-setup.md）：把部署後的網址貼在下面；留空就不顯示投票功能，音樂維持預設那首。 */
const VOTE_DEFAULT="https://script.google.com/macros/s/AKfycbxM9u-6eAQUQdaMYmXym_c0ufR1P4v-eIXrpKflfqH34kHzN35Jj94iOmcVN95E1t9U/exec";
const VOTE=String(window.VOTE_URL||VOTE_DEFAULT).trim();let VS=null;
function voteUid(){let u="";try{u=localStorage.getItem("kh-uid")||""}catch(e){}if(!/^[A-Za-z0-9_-]{8,64}$/.test(u)){const a=new Uint8Array(16);try{crypto.getRandomValues(a)}catch(e){for(let i=0;i<16;i++)a[i]=Math.random()*256}u=[...a].map(x=>x.toString(36).padStart(2,"0")).join("");try{localStorage.setItem("kh-uid",u)}catch(e){}}return u}
function voteGet(ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms||8000);return fetch(VOTE+(VOTE.includes("?")?"&":"?")+"uid="+encodeURIComponent(voteUid()),{signal:c.signal}).then(r=>r.json()).then(j=>{clearTimeout(t);if(!j||!j.ok)throw 0;VS=j;voteWin(j);try{localStorage.setItem("kh-vs",JSON.stringify({d:j.day,p:j.playing}))}catch(e){}return j})}
function votePost(o){o.uid=voteUid();return fetch(VOTE,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(o)}).then(r=>r.json()).then(j=>{if(j&&j.state){VS=j.state;voteWin(j.state);try{localStorage.setItem("kh-vs",JSON.stringify({d:j.state.day,p:j.state.playing}))}catch(e){}}return j})}
/* 今天要播的歌：票選結果（最多等 2.5 秒）→ 今天已存的結果 → 預設 */
function voteOn(){try{return parseInt(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Taipei",hour:"2-digit",hourCycle:"h23"}).format(new Date()),10)>=8}catch(e){return true}}
function voteNom(u){try{const id=YTID(u);if(!id)return;let a=JSON.parse(localStorage.getItem("kh-nom")||"[]");if(!Array.isArray(a))a=[];if(!a.includes(id))a.push(id);localStorage.setItem("kh-nom",JSON.stringify(a.slice(-50)))}catch(e){}setTimeout(()=>{try{badgeSync()}catch(e){}},300)}
function voteStk(){try{const t=voteDay();let o=JSON.parse(localStorage.getItem("kh-vstk")||"null");if(!o||typeof o!=="object")o={n:0,l:""};if(o.l!==t){const y=new Date(t+"T00:00:00Z");y.setUTCDate(y.getUTCDate()-1);o.n=o.l===y.toISOString().slice(0,10)?(+o.n||0)+1:1;o.l=t;localStorage.setItem("kh-vstk",JSON.stringify(o))}}catch(e){}setTimeout(()=>{try{badgeSync()}catch(e){}},300)}
function voteStkN(){try{const o=JSON.parse(localStorage.getItem("kh-vstk")||"null");if(!o)return 0;const t=voteDay(),y=new Date(t+"T00:00:00Z");y.setUTCDate(y.getUTCDate()-1);return o.l===t||o.l===y.toISOString().slice(0,10)?(+o.n||0):0}catch(e){return 0}}
function voteWin(s){try{const p=s&&s.playing;if(!p||!p.id||localStorage.getItem("kh-nomwin")==="1")return;const a=JSON.parse(localStorage.getItem("kh-nom")||"[]");if(Array.isArray(a)&&a.includes(p.id)){localStorage.setItem("kh-nomwin","1");setTimeout(()=>{try{badgeSync()}catch(e){}},1500)}}catch(e){}}
/* 生日特別歌：成員生日（或 BTS 出道周年 6/13）當天，背景音樂改播這裡填的 YouTube 網址；留空就照票選。鍵是成員名稱：RM、Jin、SUGA、j-hope、Jimin、V、Jungkook、BTS。 */
const BD_BGM={RM:"",Jin:"",SUGA:"","j-hope":"",Jimin:"",V:"",Jungkook:"",BTS:""};
function bdSpecial(){try{const m=window.BD_BGM||BD_BGM;for(const x of bdToday()){const n=String(x.id).replace(/^bd\d+-/,""),u=String(m[n]||"").trim();if(u&&YTID(u))return{n,u}}}catch(e){}return null}
function voteDay(){return new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Taipei"}).format(new Date())}
function voteBoot(){if(!VOTE)return Promise.resolve("");try{const c=JSON.parse(localStorage.getItem("kh-vs")||"null");if(c&&c.d===voteDay()&&c.p&&c.p.id){voteGet().catch(()=>{});return Promise.resolve("https://youtu.be/"+c.p.id)}}catch(e){}return Promise.race([voteGet(2500),new Promise((_,r)=>setTimeout(r,2600))]).then(j=>j.playing?"https://youtu.be/"+j.playing.id:"").catch(()=>"")}
function voteOpen(){const old=document.getElementById("bgd");if(old)old.remove();const opener=document.activeElement,o=document.createElement("div");o.id="bgd";if(!matchMedia("(prefers-reduced-motion:reduce)").matches)o.style.animation="bgfade .2s ease-out";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","投票決定明天的背景音樂");
let iv=0,busy=false;const cl=()=>{clearInterval(iv);o.remove();document.removeEventListener("keydown",ky);opener&&opener.focus&&opener.focus()},ky=ev=>{if(ev.key==="Escape")cl()};
const msg=t=>{const m=o.querySelector(".vm");if(m)m.textContent=t||""};
let tab="vote",nv="";
const draw=()=>{const s=VS;if(!s){o.innerHTML=`<div class="bgdc vt" style="--bc:#2a7de1"><h3>投票決定明天的背景音樂</h3><div class="pxload"><span class="pxd"></span><span class="pxd"></span><span class="pxd"></span><p>載入中…</p></div><button type="button" class="btn bgdx">關閉</button></div>`;return}
const old=o.querySelector(".vi");if(old)nv=old.value;
const closed=!voteOn(),bs=bdSpecial();
const mx=Math.max(1,...s.candidates.map(c=>c.votes));
const rows=s.candidates.map((c,i)=>{const rk=s.candidates.findIndex(x=>x.votes===c.votes)+1;return `<li class="vr${c.id===s.myVote?" mine":""}${rk===1&&c.votes>0?" top":""}" style="--p:${Math.round(c.votes/mx*100)}%"><span class="vk">${rk}</span><span class="vt1" id="vtt${i}" title="${esc(c.title)}">${esc(c.title)}</span><span class="vn">${c.votes} 票</span>${c.id===s.myVote?`<span class="vn">✓</span>`:`<button type="button" class="btn" data-v="${esc(c.id)}" aria-describedby="vtt${i}"${closed?" disabled":""}>投給它</button>`}</li>`}).join("");
const have=new Set(Array.isArray(s.nomIds)?s.nomIds:[]),seen={},sl=[];(typeof SONGS!=="undefined"&&Array.isArray(SONGS)?SONGS:[]).forEach(x=>{const id=YTID(x.u)||YTID(x.k);if(id&&!seen[id]){seen[id]=1;sl.push({id,t:String(x.t||""),a:albOf(x)})}});
const pick=sl.length?`<input class="vi2 vq" type="search" autocomplete="off" placeholder="搜尋歌名" aria-label="搜尋歌名"><ul class="vl vsl">${sl.map(x=>`<li class="vr" data-q="${esc((x.t+" "+x.a).toLowerCase())}"><span class="vt1" title="${esc(x.t)}">${esc(x.t)}</span>${have.has(x.id)?`<span class="vn">今天已被提名</span>`:`<button type="button" class="btn" data-n="${esc(x.id)}"${s.nominated?" disabled":""}>提名</button>`}</li>`).join("")}</ul>`:`<p>歌單裡還沒有附影片的歌</p>`;
const tabs=`<div class="vtb" role="group">${[["vote","投票"],["nom","提名"]].map(a=>`<button type="button" class="btn vtab" data-t="${a[0]}" aria-pressed="${tab===a[0]}">${a[1]}</button>`).join("")}</div>`;
const body=tab==="vote"?`<p>投票時間每天 08:00–23:59（台北時間），00:00 結算，得票最高的是隔天的背景音樂。一天一票，可以改投。</p>${bs?`<p>生日特別日：今天播放特別歌曲，投票照常進行，結果決定明天的歌。</p>`:""}${closed?`<p class="vclosed">目前不在投票時間，每天 08:00 開放投票。</p>`:""}<ul class="vl">${rows||`<li><p>還沒有候選歌，來提名第一首吧！</p></li>`}</ul>`:`<p>提名一首 YouTube 歌曲（每天一次，審核通過後才會出現在名單）</p><p>今天提名的歌，審核通過後會出現在明天的投票名單。每天 00:00 重置，隔天可以再提名一首</p>${s.nominated?`<p class="vclosed">今天已提名</p>`:""}<p>從歌單選一首</p>${pick}<p>或貼上 YouTube 網址</p><input class="vi" type="text" inputmode="url" autocomplete="off" placeholder="貼上 YouTube 網址" aria-label="YouTube 網址" value="${esc(nv)}"${s.nominated?" disabled":""}><button type="button" class="btn vn1"${s.nominated?" disabled":""}>${s.nominated?"今天已提名":"提名"}</button>`;
o.innerHTML=`<div class="bgdc vt" style="--bc:#2a7de1"><h3>投票決定明天的背景音樂</h3><div class="vnow">${bs?`今天播放：${bs.n==="BTS"?"BTS 出道周年":esc(bs.n)+" 生日"}特別歌曲`:`今天播放：${s.playing?esc(s.playing.title):"預設歌曲"}`}</div>${tabs}${body}<em class="vm" role="status" aria-live="polite"></em><button type="button" class="btn bgdx">關閉</button></div>`};
draw();
o.addEventListener("click",ev=>{if(ev.target===o||ev.target.closest(".bgdx")){cl();return}
const nb=ev.target.closest("[data-n]");if(nb){if(nb.dataset.a!=="1"){o.querySelectorAll('[data-n][data-a="1"]').forEach(x=>{clearTimeout(x._t);x.dataset.a="";x.textContent="提名"});nb.dataset.a="1";nb.textContent="再點確認";msg("再點一次確認，今天只能提名一次");nb._t=setTimeout(()=>{nb.dataset.a="";nb.textContent="提名"},4000);return}
clearTimeout(nb._t);const u="https://youtu.be/"+nb.dataset.n,rs=()=>{nb.disabled=false;nb.dataset.a="";nb.textContent="提名"};nb.disabled=true;msg("檢查影片中…");votePost({action:"nominate",url:u}).then(j=>{if(j&&j.ok){nv="";voteNom(u);draw();msg("已送出提名，審核通過後會加入候選名單，參加之後的投票");toast("已送出提名")}else{rs();msg((j&&j.error)||"提名失敗")}}).catch(()=>{rs();msg("網路不穩，請稍後再試")});return}
const tb=ev.target.closest("[data-t]");if(tb){tab=tb.dataset.t;draw();const f=o.querySelector('[data-t="'+tab+'"]');f&&f.focus();return}
const v=ev.target.closest("[data-v]");if(v){if(!voteOn()){msg("目前不在投票時間，每天 08:00 開放投票。");draw();return}if(busy)return;busy=true;const id=v.dataset.v,snap=JSON.stringify(VS),fx=()=>{const f=o.querySelector('.vtab[aria-pressed="true"]');f&&f.focus()},bk=()=>{busy=false};
VS.candidates.forEach(x=>{if(x.id===VS.myVote)x.votes=Math.max(0,x.votes-1);if(x.id===id)x.votes++});VS.myVote=id;VS.candidates.sort((a,b)=>b.votes-a.votes);draw();fx();msg("送出中…");
votePost({action:"vote",id}).then(j=>{bk();if(j&&j.ok){voteStk();draw();fx();msg("已投票");toast("已投票")}else{if(!(j&&j.state))VS=JSON.parse(snap);draw();fx();msg((j&&j.error)||"投票失敗")}}).catch(()=>{bk();VS=JSON.parse(snap);draw();fx();msg("網路不穩，請稍後再試")});return}
if(ev.target.closest(".vn1")){const i=o.querySelector(".vi"),u=i.value.trim();if(!u){msg("請貼上 YouTube 網址");return}const bt=ev.target.closest(".vn1");bt.disabled=true;msg("檢查影片中…");votePost({action:"nominate",url:u}).then(j=>{if(j&&j.ok){nv="";voteNom(u);draw();msg("已送出提名，審核通過後會加入候選名單，參加之後的投票");toast("已送出提名")}else{bt.disabled=false;msg((j&&j.error)||"提名失敗")}}).catch(()=>{bt.disabled=false;msg("網路不穩，請稍後再試")})}});
o.addEventListener("input",ev=>{const q=ev.target.closest&&ev.target.closest(".vq");if(!q)return;const k=q.value.trim().toLowerCase();o.querySelectorAll(".vsl li").forEach(li=>{li.hidden=!!k&&!li.dataset.q.includes(k)})});
document.addEventListener("keydown",ky);document.body.appendChild(o);o.querySelector(".bgdx").focus();
voteGet().then(()=>{if(document.body.contains(o))draw()}).catch(()=>{if(!VS&&document.body.contains(o)){o.querySelector("p").textContent="暫時連不上投票服務，請稍後再試"}});
iv=setInterval(()=>{if(!document.body.contains(o)){clearInterval(iv);return}if(document.hidden||busy||tab!=="vote")return;const b4=JSON.stringify(VS&&[VS.candidates,VS.myVote,VS.playing]);voteGet().then(()=>{if(document.body.contains(o)&&!busy&&tab==="vote"&&JSON.stringify(VS&&[VS.candidates,VS.myVote,VS.playing])!==b4)draw()}).catch(()=>{})},30000)}
/* 投票提醒：每天 08:00 後第一次打開網站，跳出一次「可以投票了」。已投過票、今天沒有候選歌、或今天已經提醒過就不跳（localStorage: kh-vrm 記錄提醒的日期）；有其他視窗開著就等它關掉再跳 */
function voteRemind(){if(!VOTE||!voteOn()||window.__vrm)return;let d="";try{d=voteDay();if(localStorage.getItem("kh-vrm")===d)return}catch(e){return}
window.__vrm=1;
voteGet(6000).then(j=>{window.__vrm=0;if(!j||!Array.isArray(j.candidates))return;if(j.myVote){try{localStorage.setItem("kh-vrm",d)}catch(e){}return}if(!j.candidates.length)return;
const show=n=>{if(!voteOn()||localStorage.getItem("kh-vrm")===d)return;if(document.hidden||document.getElementById("bgd")){if(n<20)setTimeout(()=>show(n+1),1500);return}
if(window.petRemind&&window.petRemind()){try{localStorage.setItem("kh-vrm",d)}catch(e){}return}
try{localStorage.setItem("kh-vrm",d)}catch(e){}
const o=document.createElement("div");o.id="bgd";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","今天可以投票了！");
o.innerHTML='<div class="bgdc vt" style="--bc:#2a7de1"><h3>今天可以投票了！</h3><div class="vnow">今天 08:00–23:59 開放投票（台北時間）</div><p>投給你最想聽的一首，得票最高的會是明天的背景音樂。</p><button type="button" class="btn main vgo">去投票</button><button type="button" class="btn bgdx">稍後再說</button></div>';
const cl=()=>{o.remove();document.removeEventListener("keydown",ky)},ky=ev=>{if(ev.key==="Escape")cl()};
o.addEventListener("click",ev=>{if(ev.target===o||ev.target.closest(".bgdx")){cl();return}if(ev.target.closest(".vgo")){cl();voteOpen()}});
document.addEventListener("keydown",ky);document.body.appendChild(o);o.querySelector(".vgo").focus()};show(0)}).catch(()=>{window.__vrm=0})}
const BGM=String(window.BGM_URL||"https://youtu.be/H2HQWHKDREI").trim();let BP=null,BON=true,BREADY=false,BDAY="",BCUR="";try{BON=localStorage.getItem("bgm")!=="0"}catch(e){}
function bgmUI(){const b=document.getElementById("bgm");if(!b)return;b.className=BON?"on":"off";b.setAttribute("aria-pressed",BON);b.title=BON?"關閉背景音樂":"開啟背景音樂"}
function bgmGo(){try{if(!BP)return;if(BON){BP.play?BP.play().catch(()=>{}):BP.playVideo&&BP.playVideo()}else{BP.pause?BP.pause():BP.pauseVideo&&BP.pauseVideo()}}catch(e){}}
function bgmSet(v){BON=v;try{localStorage.setItem("bgm",v?"1":"0")}catch(e){}bgmUI();bgmGo()}
function bgmInit(){if(!BGM||document.getElementById("bgm"))return;const b=document.createElement("button");b.id="bgm";b.type="button";b.textContent="♪";document.body.appendChild(b);bgmUI();
b.addEventListener("click",e=>{e.stopPropagation();bgmSet(!BON)});
const start=url=>{const vid=YTID(url);let fb=0;BDAY=voteDay();BCUR=url;
if(vid){const d=document.createElement("div");d.id="bgmp";d.innerHTML='<div id="bgmy"></div>';document.body.appendChild(d);ytLoad(()=>{BP=new YT.Player("bgmy",{videoId:vid,playerVars:{playsinline:1,loop:1,playlist:vid,controls:0},events:{onReady:()=>{BREADY=true;if(BON)bgmGo()},onStateChange:e=>{if(e.data===0&&BON)BP.playVideo()},onError:()=>{if(fb)return;fb=1;const dv=YTID(BGM);if(dv&&vid===dv)return;try{if(dv){BON?BP.loadVideoById(dv):BP.cueVideoById(dv)}else{BP.destroy();BP=new Audio(BGM);BP.loop=true;BP.preload="auto";if(BON)bgmGo()}}catch(e){}}}})})}
else{BP=new Audio(url);BP.loop=true;BP.preload="auto";BREADY=true;if(BON)bgmGo()}};
const bs=bdSpecial();if(bs){voteBoot().catch(()=>{});start(bs.u)}else voteBoot().then(u=>start(u||BGM));
/* 跨過台北 00:00 不用重開網站：偵測日期變了就重抓今天的歌（生日／周年特別歌優先），不同的話直接換；每 30 秒和回到分頁時檢查 */
const roll=()=>{try{const d=voteDay();if(!BP||!BREADY||!BDAY||d===BDAY)return;const go=u=>{u=u||BGM;BDAY=d;if(u===BCUR)return;const v=YTID(u);if(v&&BP.loadVideoById){BCUR=u;BON?BP.loadVideoById(v):BP.cueVideoById(v)}else if(!v&&typeof BP.src==="string"){BCUR=u;BP.src=u;if(BON)bgmGo()}};const b2=bdSpecial();if(b2)go(b2.u);else if(VOTE)voteGet(6000).then(j=>go(j&&j.playing&&j.playing.id?"https://youtu.be/"+j.playing.id:"")).catch(()=>{});else go("")}catch(e){}};
setInterval(roll,30000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(roll,500)});
if(VOTE&&!document.getElementById("bgv")){const v=document.createElement("button");v.id="bgv";v.type="button";v.textContent="投票";v.title="投票決定明天的背景音樂";v.addEventListener("click",e=>{e.stopPropagation();voteOpen()});document.body.appendChild(v)}
if(VOTE){setTimeout(voteRemind,1500);document.addEventListener("visibilitychange",()=>{if(!document.hidden)setTimeout(voteRemind,600)})}
const pl=()=>{try{return BP&&(BP.paused===undefined?BP.getPlayerState&&BP.getPlayerState()===1:!BP.paused)}catch(e){return false}};["pointerdown","touchend","keydown"].forEach(ev=>document.addEventListener(ev,()=>{if(BON&&!pl())bgmGo()},{capture:true}))}
bgmInit();
function songStop(){cancelAnimationFrame(GR);GN=[];PT++;KS=false;KU=0;ktvBtn(false);clearInterval(YT_T);try{YP&&YP.destroy()}catch(e){}YP=null}
function songPlayer(vid){songStop();KA=-1;if(!vid)return;if(BON){BON=false;bgmUI();bgmGo()}const tk=PT;ytLoad(()=>{const el=document.getElementById("ytp");if(tk!==PT||!el)return;YP=new YT.Player(el,{videoId:vid,playerVars:{playsinline:1,rel:0},events:{onReady:()=>{if(tk===PT)YT_T=setInterval(ktvTick,250)}}})})}
function ktvFit(){const k=document.getElementById("ktv");if(!k)return;const yt=document.querySelector("#slist .yt");
k.style.marginTop="";k.style.height="";k.style.maxHeight="";
if(yt&&matchMedia("(min-width:1000px)").matches){const dy=yt.getBoundingClientRect().top-k.getBoundingClientRect().top;k.style.marginTop=Math.max(0,dy)+"px";k.style.height=yt.offsetHeight+"px";k.style.maxHeight="none"}
const h=k.clientHeight;k.style.paddingBottom=(h/2)+"px";k.style.paddingTop=(KS?h/2:6)+"px"}
window.addEventListener("resize",()=>{try{ktvFit()}catch(e){}});
function ktvTick(){const k=document.getElementById("ktv");if(!k||!YP||!YP.getCurrentTime)return;const t=YP.getCurrentTime(),ls=k.children;let a=-1;for(let i=0;i<ls.length;i++){if(+ls[i].dataset.s<=t+.2)a=i;else break}
try{ktvBarUpd(t)}catch(e){}if(KU&&Date.now()>=KU){KU=0;KA=-1;ktvBtn(false)}if(a===KA)return;KA=a;[...ls].forEach((e,i)=>{const d=Math.abs(i-a);e.classList.toggle("on",d===0);e.classList.toggle("n1",d===1);e.classList.toggle("n2",d===2)});if(a>=0){let add=0;if(!KS){KS=true;const o=parseFloat(k.style.paddingTop)||6;ktvFit();add=(parseFloat(k.style.paddingTop)||o)-o}const e=ls[a];if(Date.now()>=KU)k.scrollTo({top:Math.max(0,e.offsetTop+add-k.clientHeight*.38+e.clientHeight/2),behavior:"smooth"})}}
document.getElementById("slist").addEventListener("click",e=>{const fb=e.target.closest("[data-fs]");if(fb){const n=FSI+ +fb.dataset.fs;if(n>=0&&n<FS.length){FSI=n;try{localStorage.setItem("song-fs",n)}catch(x){}fsApply();try{ktvFit();KA=-1}catch(x){}}return}const m=e.target.closest("[data-m]");if(m){SMODE=m.dataset.m;try{localStorage.setItem("song-mode",SMODE)}catch(x){}songsR();return}
const l=e.target.closest(".kb");if(!l||!YP||!YP.seekTo)return;const n=Date.now();if(LE===l&&n-LC<400){KU=0;ktvBtn(false);YP.seekTo(+l.dataset.s,true);YP.playVideo&&YP.playVideo();LE=null}else{LE=l;LC=n}});

/* 練習模式：用藍／紅色的時間碼當譜面，影片播到哪音符就落到哪；音符到線時點對應按鈕 */
const GY=190,GV=180;const GTRAP=/^\[靜([\d.]*)\]\s?(.*)$/;const GCUE=/^\[(藍|紅)(?:(長)([\d.]*)|(名)([\d.]*))?\]\s?(.*)$/;let GH={b:false,r:false},GG={b:0,r:0},GFT=0;
/* 應援遊戲成績：每首歌記最高分（命中率）和等級，只存在這台裝置的瀏覽器 */
function gBest(){try{return JSON.parse(localStorage.getItem("song-best")||"{}")||{}}catch(e){return{}}}
function gAch(){try{return JSON.parse(localStorage.getItem("song-ach")||"{}")||{}}catch(e){return{}}}
const GAN={nm:"零 MISS",ap:"全 PERFECT",tr:"陷阱全過",lg:"長條全滿"};
function gAchRun(){const k={},T=GN.filter(n=>n.c==="t"),Lg=GN.filter(n=>n.d&&n.c!=="t");if(GN.length&&GN.every(n=>n.st===1||n.st===2))k.nm=1;if(GN.length&&GN.every(n=>n.st===1))k.ap=1;if(T.length&&T.every(n=>n.st===1))k.tr=1;if(Lg.length&&Lg.every(n=>n.st===1))k.lg=1;return k}
function gLn(tx,w){const i=tx.indexOf(w);return i<0?["",tx,""]:[tx.slice(0,i),w,tx.slice(i+w.length)]}
function gAud(){const a=document.getElementById("gaud");if(!a)return;const f=GC>=20,m=document.getElementById("gm"),fv=document.getElementById("gfv");if(f&&!gAud.f)gJ("FEVER!","t");gAud.f=f;if(m)m.classList.toggle("fever",f);if(fv)fv.hidden=!f;const n=f?12:Math.min(12,Math.floor(GC/2));[...a.children].map((e,k)=>[Math.abs(k-5.5),e]).sort((p,q)=>p[0]-q[0]).forEach(([,e],k)=>e.classList.toggle("on",k<n))}
function gGrade(a){return a>=.95?"S":a>=.85?"A":a>=.7?"B":"C"}
let GT="";
/* 演唱會通關：這場歌單裡「有應援遊戲」的歌，每首都拿到 B 級（70%）以上就算全曲通關 */
const G_PASS=.7;
function gCleared(x){const b=gBest()[x.t];return!!b&&b.a>=G_PASS}
function gProg(name){const L=SONGS.filter(x=>songCons(x).some(c=>c.n===name)&&ftOK(x));return{n:L.length,k:L.filter(gCleared).length}}
function gBadges(){try{return JSON.parse(localStorage.getItem("song-badge")||"{}")||{}}catch(e){return{}}}
function gProgHTML(g){return`<div class="gpt"><span><em>通關進度</em> ${g.k}/${g.n}</span>${g.k>=g.n?`<b>全曲通關！</b>`:""}</div><div class="gpb"><i style="width:${Math.round(g.k/g.n*100)}%"></i></div><small>B 級以上算通關，只計算有應援遊戲的歌</small>`}
function gProgUpd(){const pr=document.getElementById("sprog");if(!pr||pr.hidden||!ALB)return;const g=gProg(ALB);if(g.n)pr.innerHTML=gProgHTML(g)}
function gameHTML(T,x){if(!T.some(t=>GCUE.test(t.l)||GTRAP.test(t.l)||/\{(?:藍|紅)\|/.test(t.l)))return`<div class="empty">這首歌還沒有可以玩的應援遊戲（要有影片和藍／紅色時間碼）</div>`;
return`<div class="gm" id="gm"><div class="ghud"><span>SCORE <b id="gs">0</b></span><span>COMBO <b id="gc">0</b></span>${x&&gBest()[x.t]?`<span>BEST <b>${gBest()[x.t].g}</b> ${Math.round(gBest()[x.t].a*100)}%</span>`:""}${x&&Object.keys(gAch()[x.t]||{}).length?`<span>★ ${Object.keys(gAch()[x.t]).length}/4</span>`:""}</div><div class="gly" id="gly" aria-hidden="true"></div><div class="gl" id="gl"><div class="gln b" data-l="b"></div><div class="gln r" data-l="r"></div><i class="ghl"></i><div class="gj" id="gj"></div><div class="gcd" id="gcd" hidden></div><div class="gfv" id="gfv" hidden>FEVER ×2</div><div class="gres" id="gres" hidden></div></div><div class="gb"><button type="button" class="gbtn b" data-l="b">藍・大聲喊</button><button type="button" class="gbtn r" data-l="r">紅・跟著唱</button></div><div class="gaud" id="gaud" aria-hidden="true">${"<i></i>".repeat(12)}</div><div class="khint">播放影片後，音符落到線上時，點下面對應的按鈕（鍵盤：F／J 或 ←／→）</div></div>`}
function gameInit(x){const L=document.getElementById("gl");if(!L)return;GT=x.t;
const TT=songTimed(x);GN=TT.flatMap((t,i)=>{const mt=t.l.match(GTRAP);if(mt){const d=parseFloat(mt[1]),o={s:t.s,c:"t",x:(mt[2]||"").replace(/\{(?:藍|紅|橘)\|([^{}]*)\}/g,"$1").trim()||"別喊！",st:0,e:null,a:0};if(d>0)o.d=Math.min(Math.max(d,1),8);o.w0=o.d?o.s:o.s-.35;o.w1=o.d?o.s+o.d:o.s+.35;return[o]}const m=t.l.match(GCUE),nx=TT.slice(i+1).find(z=>z.s>t.s+.3),D=Math.min(Math.max(nx?nx.s-t.s:3,1),4),src=m?m[6]:t.l,tx=src.replace(/\{(?:藍|紅|橘)\|([^{}]*)\}/g,"$1"),out=[];if(m){const c=m[1]==="藍"?"b":"r";if(m[4]){const cl=src.replace(/\{(?:藍|紅)\|[^{}]*\}/g,"").replace(/\{橘\|([^{}]*)\}/g,"$1"),w=[...cl.matchAll(/[^!！,，]+[!！,，]?/g)].map(mm=>{const r=mm[0],z=r.replace(/[,，]\s*$/,"").trim(),a=mm.index+r.length-r.trimStart().length;return z&&/[\p{L}\p{N}]/u.test(z)?{z,ln:[cl.slice(0,a),z,cl.slice(a+z.length)]}:null}).filter(Boolean);let st=parseFloat(m[5]);if(!(st>0))st=nx?(nx.s-t.s)/w.length:.8;st=Math.min(Math.max(st,.3),1.2);w.forEach((q,k)=>out.push({s:t.s+k*st,c,x:q.z,ln:q.ln,st:0,e:null,a:0}))}else{const o={s:t.s,c,x:src.replace(/\{(?:藍|紅)\|[^{}]*\}/g,"").replace(/\{橘\|([^{}]*)\}/g,"$1").replace(/\s+/g," ").trim()||tx,st:0,e:null,a:0};o.ln=gLn(tx,o.x);if(m[2]){let d=parseFloat(m[3]);if(!(d>0))d=nx?nx.s-t.s:3;o.d=Math.min(Math.max(d,1),8)}out.push(o)}}const re=/\{(藍|紅)\|([^{}]*)\}/g;let k;while(k=re.exec(src)){const z=k[2].trim(),pre=src.slice(0,k.index).replace(/\{(?:藍|紅|橘)\|([^{}]*)\}/g,"$1").length;if(z)out.push({s:t.s+pre/Math.max(tx.length,1)*D,c:k[1]==="藍"?"b":"r",x:z,ln:[tx.slice(0,pre+k[2].length-k[2].trimStart().length),z,tx.slice(pre+k[2].length-k[2].trimStart().length+z.length)],st:0,e:null,a:0})}return out}).sort((p,q)=>p.s-q.s);
GL=0;GC=0;GF=false;GFT=GN.length?Math.min(...GN.map(n=>n.s)):0;
GN.forEach(n=>{const e=document.createElement("div");e.className="gn "+(n.c==="t"?"tr":n.c)+(n.d?" lg":"");const p=document.createElement("span");p.textContent=n.x;e.appendChild(p);(n.c==="t"?L:L.querySelector(".gln."+n.c)).appendChild(e);n.e=e});
gStat();cancelAnimationFrame(GR);GR=requestAnimationFrame(gTick)}
function gStat(){let sc=0;GN.forEach(n=>{sc+=(n.st===1?100:n.st===2?60:0)*(n.f?2:1)});const a=document.getElementById("gs"),b=document.getElementById("gc");if(a)a.textContent=sc;if(b)b.textContent=GC;gAud()}
function gSet(n,st){n.st=st;if(!st)n.a=0;n.f=(st===1||st===2)&&GC>=20?1:0;n.e.classList.toggle("ok",st===1||st===2);n.e.classList.toggle("ms",st===3)}
function gJ(t,c){const j=document.getElementById("gj");if(!j)return;j.textContent=t;j.className="gj "+c+" on";clearTimeout(gJ.t);gJ.t=setTimeout(()=>j.classList.remove("on"),420)}
function gMark(t){const g=(gBest()[t]||{}).g;if(!g)return;document.querySelectorAll("#stabs .chip").forEach(c=>{if(c.dataset.t!==t)return;let s=c.querySelector(".gsg");if(!s){s=document.createElement("em");s.className="gsg";c.appendChild(s)}s.textContent=g});const o=[...document.querySelectorAll("#ssel option")].find(o=>o.value===t);if(o)o.textContent=o.textContent.replace(/ ・ [SABC]$/,"")+" ・ "+g}
function gEnd(){const r=document.getElementById("gres");if(!r)return;let p=0,g=0,m=0;GN.forEach(n=>{n.st===1?p++:n.st===2?g++:m++});const a=GN.length?(p*100+g*60)/(GN.length*100):0,gr=gGrade(a),B=gBest(),old=B[GT],nw=GT&&(!old||a>old.a);if(nw){B[GT]={g:gr,a:Math.round(a*1000)/1000,d:Date.now()};try{localStorage.setItem("song-best",JSON.stringify(B))}catch(e){}gMark(GT);try{badgeSync()}catch(x){}}const bs=B[GT];let bd="";if(nw){gProgUpd();const x0=SONGS.find(z=>z.t===GT),BG=gBadges();if(x0)songCons(x0).forEach(c=>{const g=gProg(c.n);if(g.n&&g.k>=g.n&&!BG[c.n]){BG[c.n]=Date.now();bd+=`<span class="gnew">演唱會全曲通關！</span><span>${esc(c.n)}</span>`;try{localStorage.setItem("song-badge",JSON.stringify(BG))}catch(e){}}})}
const R=gAchRun(),AC=gAch(),hv=AC[GT]||{},an=[],ao=[];Object.keys(R).forEach(k=>{(hv[k]?ao:an).push("★ "+GAN[k]);hv[k]=hv[k]||Date.now()});if(an.length||ao.length){AC[GT]=hv;try{localStorage.setItem("song-ach",JSON.stringify(AC))}catch(e){}}const ah=(an.length?`<span class="gnew">新成就！${an.join("　")}</span>`:"")+(ao.length?`<span>${ao.join("　")}</span>`:"");
r.innerHTML=`<b>${gr}</b><span>PERFECT ${p}　GOOD ${g}　MISS ${m}</span><span>${Math.round(a*100)}%</span>${nw?`<span class="gnew">${old?"新紀錄！":"首次成績"}</span>`:bs?`<span><em>最佳成績</em> ${bs.g} ${Math.round(bs.a*100)}%</span>`:""}${bd}${ah}`;r.hidden=false}
function gHit(c){GH[c]=true;GG[c]=performance.now();if(!GN.length||!YP||!YP.getCurrentTime)return;const t=YP.getCurrentTime();GN.forEach(n=>{if(n.c==="t"&&!n.st&&t>=n.w0&&t<=n.w1){gSet(n,3);GC=0;gJ("別喊！","r");gStat()}});let b=null,bd=9;GN.forEach(n=>{if(n.c===c&&!n.st&&!n.d){const d=Math.abs(n.s-t);if(d<bd){bd=d;b=n}}});
const btn=document.querySelector('.gbtn[data-l="'+c+'"]');if(btn){btn.classList.add("hit");setTimeout(()=>btn.classList.remove("hit"),90)}
if(!b||bd>.35)return;if(bd<=.15){gSet(b,1);GC++;gJ("PERFECT",c)}else{gSet(b,2);GC++;gJ("GOOD",c)}gStat()}
function gTick(){GR=requestAnimationFrame(gTick);if(!YP||!YP.getCurrentTime||!GN.length)return;const t=YP.getCurrentTime();
if(t<GL-.6){GC=0;GN.forEach(n=>{if(n.st&&n.s>t-.2)gSet(n,0)});GF=false;const r=document.getElementById("gres");if(r)r.hidden=true;gStat()}
const dt=t-GL,nw=performance.now();GL=t;let ms=false;{const g=document.getElementById("gly");if(g){let bi=-1,bd=9;GN.forEach((n,i)=>{if(n.ln){const d=n.s-t;if(d<2&&t-(n.s+(n.d||0))<1.2&&Math.abs(d)<bd){bd=Math.abs(d);bi=i}}});const b=bi<0?null:GN[bi],hit=!!b&&t>=b.s-.05,key=bi<0?"":bi+(hit?"h":"w");if(g.dataset.k!==key){g.dataset.k=key;g.innerHTML=b?`<span class="gp">${esc(b.ln[0])}</span><span class="gw ${b.c}${hit?" on":""}">${esc(b.ln[1])}</span><span class="gp">${esc(b.ln[2])}</span>`:""}}}{const c=document.getElementById("gcd");if(c){const rem=GFT-t;if(rem>0&&rem<=3){const k=Math.ceil(rem);if(c.dataset.k!=k){c.dataset.k=k;c.innerHTML=`<b>${k}</b><div class="g2"><span class="cb">藍・大聲喊</span><span class="cr">紅・跟著唱</span></div>`}c.hidden=false}else if(!c.hidden){c.hidden=true;c.dataset.k=""}}}
GN.forEach(n=>{const d=n.s-t;if(n.c==="t"){if(!n.st){if(t>=n.w0&&t<=n.w1&&(GH.b||GH.r)){gSet(n,3);GC=0;gJ("別喊！","r");ms=true}else if(t>n.w1){gSet(n,1);GC++;gJ("SAFE","t");ms=true}}const bt=GY-d*GV;if(n.d){const tp=bt-n.d*GV;n.e.style.height=(n.d*GV)+"px";n.e.style.display=tp>GY+100||bt<-40?"none":"";n.e.style.transform="translateY("+tp+"px)"}else{n.e.style.display=bt<-40||bt>GY+100?"none":"";n.e.style.transform="translateY("+(bt-18)+"px)"}return}if(n.d){if(!n.st){const on=t>=n.s&&t<=n.s+n.d&&(GH[n.c]||nw-GG[n.c]<260);if(on&&dt>0&&dt<.25)n.a+=dt;n.e.classList.toggle("act",on);if(t>n.s+n.d){const r=n.a/n.d;n.e.classList.remove("act");if(r>=.75){gSet(n,1);GC++;gJ("PERFECT",n.c)}else if(r>=.4){gSet(n,2);GC++;gJ("GOOD",n.c)}else{gSet(n,3);GC=0;gJ("MISS","m")}ms=true}}const bt=GY-d*GV,tp=bt-n.d*GV;n.e.style.height=(n.d*GV)+"px";n.e.style.display=tp>GY+100||bt<-40?"none":"";n.e.style.transform="translateY("+tp+"px)";return}if(!n.st&&d<-.35){gSet(n,3);GC=0;ms=true;gJ("MISS","m")}const y=GY-d*GV;n.e.style.display=y<-40||y>GY+100?"none":"";n.e.style.transform="translateY("+(y-18)+"px)"});
if(ms)gStat();
if(!GF&&t>Math.max(...GN.map(n=>n.s+(n.d||0)))+1.2){GF=true;gEnd()}}
document.getElementById("slist").addEventListener("pointerdown",e=>{const b=e.target.closest("[data-l]");if(b){e.preventDefault();gHit(b.dataset.l)}});
document.addEventListener("keydown",e=>{if(!document.getElementById("gm")||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key.toLowerCase();if(e.repeat&&["f","j","arrowleft","arrowright"].includes(k)){e.preventDefault();return}if(k==="f"||k==="arrowleft")gHit("b");else if(k==="j"||k==="arrowright")gHit("r");else return;e.preventDefault()});
document.addEventListener("keyup",e=>{const k=e.key.toLowerCase();if(k==="f"||k==="arrowleft")GH.b=false;else if(k==="j"||k==="arrowright")GH.r=false});
document.addEventListener("pointerup",e=>{const b=e.target.closest&&e.target.closest("[data-l]");if(b)GH[b.dataset.l]=false;else GH.b=GH.r=false});
document.addEventListener("pointercancel",()=>{GH.b=GH.r=false});window.addEventListener("blur",()=>{GH.b=GH.r=false});

/* 今日幸運籤：用「日期＋這台裝置的隨機代號」當亂數種子，每個人抽到的不同，同一個人同一天重開還是同一張 */
const FT_TASKS=["完整練一次應援，不看字幕", "檢查應援棒的電量和配對", "喝杯水，顧好明天要喊的嗓子", "在應援遊戲拿到 A 以上", "把今天的應援運勢分享給一位 ARMY 朋友", "在歌曲頁找一首沒練過的歌", "睡前再複習一次明天要喊的部分", "挑一首歌，只看歌詞不看影片喊一次", "用應援遊戲挑戰一首新歌", "把今天推薦的歌完整練一遍", "戴上耳機，專心練一首歌的應援", "用 KTV 模式唱一首喜歡的歌", "傳一首今天推薦的歌給朋友", "在收藏裡加入一個想去的應援", "看看生日應援頁，找一位成員的應援", "用「存成圖片」把今天的籤分享出去", "給一位 ARMY 朋友一句鼓勵的話", "做 5 分鐘的伸展，讓身體放鬆", "早點睡，明天才有精神", "出門走一走，順便練體力", "深呼吸三次，再喊一次最大聲的段落", "今天吃好一點，補充體力", "分享一首最近最想在演唱會聽到的 BTS 歌曲", "問一位 ARMY 朋友最喜歡哪一首演唱會曲目", "回顧一次讓自己印象深刻的追星回憶", "推薦一首自己認為值得更多人認識的 BTS 歌曲", "回聽一首歌，把喜歡的一句歌詞記下來", "試試背景音樂投票", "回想第一次喜歡上他們的契機", "把手機桌布換成最近喜歡的照片"];
/* 只在特定日期才會進候選：[任務, 距開演最多幾天（負數＝開演後）, 最少幾天（預設 -3＝演出到 11/22）, 權重（預設 1）]；開演日 11/19 算 0 */
const FT_GATE=[["查好從住處到場館的交通方式", 7], ["整理好演唱會要帶的東西", 7], ["確認票券、證件和手機電量", 7], ["準備好零錢、行動電源和小包包", 7], ["看一下天氣，決定要穿什麼", 3], ["確認手機有足夠的儲存空間可以拍照", 3], ["選出這次演唱會最期待聽到的三首歌", 99999, 1], ["把演唱會當天的集合資訊整理到手機備忘錄", 7, -3, 2], ["演唱會結束後，記錄今天最難忘的一個瞬間", -3, -3, 6], ["把這次演唱會的回憶整理成一張照片或一段文字", -4, -10, 3], ["確認住宿、交通都訂好了", 30, 3], ["開始準備應援手幅、道具或衣服", 30, 3], ["把想去的應援地點先排成路線", 30, 1], ["決定演唱會當天的穿搭", 14, 1]];
/* 和應援資料、演唱會日期連動的任務：有對應情況才會進候選（約 2/3 機率抽到），按鈕帶去對應頁面 */
function ftCtx(){const L=[],t=today0(),k0=new Date(2026,10,19),k1=new Date(2026,10,22),dt=Math.round((k0-t)/864e5);let live=[],soon=[],bl=[];try{live=DATA.filter(d=>d.sec!=="birthday"&&stat(d)==="進行中");soon=DATA.filter(d=>d.sec!=="birthday"&&stat(d)==="即將開始"&&d.start&&Math.round((day0(d.start)-t)/864e5)<=3);bl=DATA.filter(d=>d.sec==="birthday"&&stat(d)==="進行中")}catch(e){}
if(live.length)L.push({t:"去今天進行中的應援地點打卡",go:"tour"});if(soon.length)L.push({t:"把快開始的應援加入收藏",go:"tour"});if(bl.length)L.push({t:"去看正在進行的生日應援",go:"bd"});
if(dt>=1&&dt<=7){L.push({t:"確認演出日的交通和集合時間"});L.push({t:"演唱會就在這週，把應援再複習一次"})}if(dt>=1&&dt<=14)L.push({t:"規劃演唱會前後要去哪些應援",go:"tour"});
if(t>=k0&&t<=k1)L.push({t:"今天就是演唱會！記得喝水、顧好嗓子"});return L}
/* 任務抽選：依「最近出現過幾次」調整機率。
   昨天抽過 → 先排除（沒有其他任務可抽才會放回）｜最近 3 天抽過 → 機率 ×0.25｜最近 7 天都沒抽過 → 機率 ×2｜
   最近 2 天抽過同類型（身體、社群…）→ 機率 ×0.5｜特定日期的任務（FT_GATE、連動任務）不符合條件就不會進候選。
   同一天用同一個種子，所以重開不會換。 */
const FT_CATS={body:["喝杯水，顧好明天要喊的嗓子","做 5 分鐘的伸展，讓身體放鬆","早點睡，明天才有精神","出門走一走，順便練體力","今天吃好一點，補充體力","深呼吸三次，再喊一次最大聲的段落"],social:["把今天的應援運勢分享給一位 ARMY 朋友","傳一首今天推薦的歌給朋友","給一位 ARMY 朋友一句鼓勵的話","用「存成圖片」把今天的籤分享出去","分享一首最近最想在演唱會聽到的 BTS 歌曲","問一位 ARMY 朋友最喜歡哪一首演唱會曲目","回顧一次讓自己印象深刻的追星回憶","推薦一首自己認為值得更多人認識的 BTS 歌曲"],site:["在收藏裡加入一個想去的應援","看看生日應援頁，找一位成員的應援","在歌曲頁找一首沒練過的歌","試試背景音樂投票"],mood:["回想第一次喜歡上他們的契機","把手機桌布換成最近喜歡的照片"],game:["在應援遊戲拿到 A 以上","用應援遊戲挑戰一首新歌"],prep:FT_GATE.map(g=>g[0])};
function ftCat(t){for(const k in FT_CATS)if(FT_CATS[k].includes(t))return k;return"practice"}
function ftWPick(L,key,H){const td=today0(),ago=h=>{const a=String(h.d).split("-").map(Number);return Math.round((td-new Date(a[0],a[1]-1,a[2]))/864e5)},hs=(H||[]).map(h=>({a:ago(h),t:h.t})).filter(h=>h.a>=1),cats=new Set(hs.filter(h=>h.a<=2).map(h=>ftCat(h.t))),ok=L.filter(z=>!hs.some(h=>h.a===1&&h.t===z.t));if(!ok.length)return null;
const W=ok.map(z=>{const a=hs.filter(h=>h.t===z.t).map(h=>h.a);let w=1;if(a.some(x=>x<=3))w*=.25;else if(!a.some(x=>x<=7))w*=2;if(cats.has(ftCat(z.t)))w*=.5;return w*(z.w||1)});
let r=fth(key+"t")/4294967296*W.reduce((p,c)=>p+c,0);for(let i=0;i<ok.length;i++){r-=W[i];if(r<0)return ok[i]}return ok[ok.length-1]}
function ftTask(key,H){const C=ftCtx(),dt=Math.round((new Date(2026,10,19)-today0())/864e5),P=FT_TASKS.map(t=>({t})).concat(FT_GATE.filter(g=>dt<=g[1]&&dt>=(g[2]===undefined?-3:g[2])).map(g=>({t:g[0],w:g[3]||1})));
if(C.length&&fth(key+"x")%3!==0){const r=ftWPick(C,key+"u",H);if(r)return r}
return ftWPick(P,key,H)||ftWPick(C,key+"u",H)||P[fth(key+"t")%P.length]}
/* 今天的任務：同一天重開維持同一條；歷史記在 ftn-st.th（最近 14 天） */
function ftTaskOf(key,d){const td=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();let st={};try{st=JSON.parse(localStorage.getItem("ftn-st")||"{}")||{}}catch(e){}
const k=st.tk;if(k&&k.d===td&&k.t)return k.go?{t:k.t,go:k.go}:{t:k.t};return ftTask(key,Array.isArray(st.th)?st.th:[])}
const FT_COL=[["粉紅", "#ff8fb3"], ["薰衣草紫", "#8e6fe0"], ["天空藍", "#6fb7ff"], ["薄荷綠", "#2dbf8f"], ["奶油黃", "#ffd23f"], ["蜜桃橘", "#ff8a5b"], ["銀灰", "#b8c0d0"]];
const FT_WORDS=["今天的你，聲音一定傳得到", "慢慢來，節奏會跟上你", "多聽一次，就會多記住一句", "不用完美，開心最重要", "今天的你，剛剛好", "把喜歡的歌再聽一遍吧", "一點小小的勇氣，就是很大的力量", "今天的幸運，從翻開這一頁開始", "今天也辛苦了，喝口水再繼續", "慢慢跟，總有一個瞬間會突然合拍", "今天的你，值得一首喜歡的歌", "緊張也沒關係，大家都是一起的", "好好休息，也是準備的一部分", "今天適合把心情寫下來", "你的喜歡，是別人也看得見的光", "不用跟上所有人，跟上自己的節奏就好", "今天的好運，藏在一首很久沒聽的歌裡", "出門前，對自己說一聲加油", "今天適合把照片整理一下", "再等一下，期待也是一種快樂", "今天的你，已經很努力了", "今天適合早一點出門，從容一點", "今天先做好一件小事就好", "累了就停一下，路還在那裡", "你已經走了比想像中更遠", "今天的天空，值得抬頭看一眼", "對自己溫柔一點，也是一種勇氣", "不急，好事都會慢慢到", "今天適合吃一頓喜歡的東西", "把今天的開心記下來，以後會很有用", "沒做完的事，明天還有一次機會", "你不需要一直很厲害，也值得被喜歡", "今天適合散個步，讓腦袋放空", "一點點進步，也是進步", "把手機放下十分鐘，看看四周", "今天的你，比昨天多懂了一點", "小小的快樂，累積起來就很大", "願你今天遇到的人都很溫柔", "睡一覺，事情會看起來不一樣", "今天適合對自己說一聲辛苦了", "做得不完美，也算做到了"];
let FTID="";function ftId(){if(FTID)return FTID;try{FTID=localStorage.getItem("ftn-id")||""}catch(e){}if(!FTID){FTID=Math.random().toString(36).slice(2,10);try{localStorage.setItem("ftn-id",FTID)}catch(e){}}return FTID}
function fth(t){let h=2166136261;for(const c of t){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
/* 推薦歌：只從「有影片又有藍／紅時間碼」（能進練習模式）的歌挑，沒有就退回全部；每個人有自己的輪替順序，連續兩天不會抽到同一首，輪完一圈才重複 */
function ftOK(x){return!!(YTID(x.u)||YTID(x.k))&&songTimed(x).some(t=>GCUE.test(t.l))}
function ftKey(d){return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+":"+ftId()}
function ftPick(d){if(!SONGS.length)return null;let P=SONGS.filter(ftOK);if(!P.length)P=SONGS.slice();const id=ftId();P.sort((a,b)=>fth(id+a.t)-fth(id+b.t));return P[Math.floor(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/864e5)%P.length]}
function ftSync(){const b=document.getElementById("ftnBtn");if(!b)return;let seen=false;try{const d=new Date(),st=JSON.parse(localStorage.getItem("ftn-st")||"{}")||{};seen=st.last===d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}catch(e){}const et=b.querySelector(".et");if(!et)return;let t=et.querySelector(".ftbd");if(!t){t=document.createElement("em");et.appendChild(t)}t.className="ftbd "+(seen?"done":"todo");t.textContent=seen?"✓ 今日已抽":"● 今天還沒抽"}
/* 首頁入口卡片的即時資訊小標：巡演（進行中／即將開始幾個）、生日（下一位幾天後）、足跡（去過幾個，開放後才顯示） */
function entBadge(sel,txt){const et=document.querySelector(sel+" .et");if(!et)return;let b=et.querySelector(".entbd");if(!txt){if(b)b.remove();return}if(!b){b=document.createElement("em");b.className="ftbd done entbd";et.appendChild(b)}if(b.textContent!==txt)b.textContent=txt}
function entSync(){
if(sec!=="home")return;
try{const T=DATA.filter(d=>(d.sec||"tour")==="tour"),on=T.filter(d=>stat(d)==="進行中").length,sn=T.filter(d=>stat(d)==="即將開始").length;entBadge(".entry.tour",on?"進行中 "+on+" 個":sn?"即將開始 "+sn+" 個":"")}catch(e){}
try{const n=[...MEMBERS].sort((a,b)=>bdDays(a)-bdDays(b))[0],k=bdDays(n);entBadge(".entry.bd",n[0]==="BTS"?(k===0?"🎉 今天是出道周年":"BTS 出道周年，還有 "+k+" 天"):(k===0?"🎂 今天是 "+n[0]+" 的生日":"下一位："+n[0]+"，還有 "+k+" 天"))}catch(e){}
try{if(FOOT_OPEN){const L=fpL();entBadge(".entry.foot",L.length?"去過 "+L.filter(d=>FPV[d.id]).length+" / "+L.length:"")}}catch(e){}}
function ftClose(){const o=document.getElementById("ftn");if(o){document.body.style.overflow="";o.remove();const b=document.getElementById("ftnBtn");if(b)b.focus()}ftSync()}

function ftWrap(x,t,px,y,mw,lh){const T=t.match(/[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]|[^\s\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]+\s*|\s+/g)||[];let l="";for(const k of T){if(l&&x.measureText(l+k).width>mw){x.fillText(l.trim(),px,y);y+=lh;l=k.trimStart()}else l+=k}if(l.trim()){x.fillText(l.trim(),px,y);y+=lh}return y}
/* 存成圖片：9:16（1080×1920）直式圖卡，直接顯示在畫面上，讓使用者用手機內建選單儲存或分享；內容太多會自動縮小以符合 9:16 */
const FT_MC={RM:"#8e6fe0",Jin:"#ff8fb3",SUGA:"#5f7aa8","j-hope":"#ff8a5b",Jimin:"#f2c46a",V:"#2dbf8f",Jungkook:"#4a90e2"};
const FT_SP=[[".##...##.|#oo#.#oo#|#ooo#ooo#|.#oo#oo#.|..##.##..|....#....|....#....|....#....|...###...","#2dbf8f"],["..#####..|.#ooooo#.|#ooooooo#|#ooooooo#|.#ooooo#.|..#####..|...#o#...|...#o#...|...#o#...|..#####..","#8e6fe0"],[".##...##.|#oo#.#oo#|#ooo#ooo#|#ooooooo#|.#ooooo#.|..#ooo#..|...#o#...|....#....","#ff8fb3"],[".....#.....|....#o#....|....#o#....|#####o#####|#ooooooooo#|.#ooooooo#.|..#ooooo#..|..#oo#oo#..|.#oo#.#oo#.|.##.....##.","#ffd23f"],["#....#....#|##..###..##|#o##ooo##o#|#ooooooooo#|#ooooooooo#|#ooo#o#ooo#|###########","#ffd23f"]];
const FT_TW=["......##..|.....#oo#.|....#ooo#.|...#oooo##|...#ooooo#|..#oooooo#|..#ooooo#.|..#ooooo#.|..#oooo#..|..#kkoo#..|...#ooo#..|...#ooo#..|...#oo#...|....#o#...|....##....","#e0245e"];
const FT_TEA=".......SS.....|.......SS.....|....KKKSSKKK..|...KLLLSSLLLK.|..KLLLLLLLLLLK|..KKKKKKKKKKKK|...KHMMMMMMMK.|...KHMMMMMMMK.|...KMMMMMMMMK.|...KTTTTTTTTK.|...KTTTTTTTTK.|....KTTTTTTK..|....KTTTTTTK..|....KTPTTPTK..|....KPPTPPPK..|....KPPPPPPK..|.....KKKKKK...",FT_CHK="....KKKKKKKK......|..KKOOOOOOOOKKK...|.KOOYYOOYOOOOOOKK.|KOOYOOOOOROOYOOOOK|KOOOOYOOOOOOOOYOOK|KOYOOOOROOOYOOOOOK|KOOOOOOOYOOOOROOOK|KOOYOOOOOOOOYOOOOK|.KOOOROOOYOOOOOOK.|.KOOOOOYOOOOROODK.|..KDOOOOOOYOOODDK.|...KKDDOOOOODDKK..|.....KKKKKKKKK....";
const FT_PC={K:"#4a2c1c",S:"#e0245e",L:"#cfe8ff",H:"#fff3d6",M:"#f0d0a0",T:"#cd965a",P:"#3b2418",O:"#f2a93b",Y:"#ffd36b",R:"#c2410c",D:"#b8741a",o:"#e0245e",k:"#ffd23f"};
function ftPc(c,dk){return c==="#"?dk:FT_PC[c]||""}
function ftPxSvg(str,st){const R=str.split("|"),w=R[0].length;let r="";R.forEach((l,j)=>[...l].forEach((c,i)=>{const f=ftPc(c,"#7a1030");if(f)r+=`<rect x="${i}" y="${j}" width="1.02" height="1.02" fill="${f}"/>`}));return`<svg class="twp" style="${st||""}" viewBox="0 0 ${w} ${R.length}" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`}
function ftMix(a,b,t){const f=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)),A=f(a),B=f(b);return"#"+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,"0")).join("")}
function ftImgClose(){const g=document.getElementById("ftimg");if(g){const i=g.querySelector("img");if(i)URL.revokeObjectURL(i.src);g.remove()}const b=document.querySelector('#ftn [data-f="img"]');if(b)b.focus()}
function ftImgShow(blob){ftImgClose();const g=document.createElement("div");g.id="ftimg";g.setAttribute("role","dialog");g.setAttribute("aria-modal","true");
g.innerHTML=`<img alt="今日幸運籤"><div class="fth2">手機長按圖片可儲存或分享；電腦請按右鍵另存圖片</div><button type="button" class="btn">關閉</button>`;
g.querySelector("img").src=URL.createObjectURL(blob);g.addEventListener("click",e=>{if(e.target.tagName!=="IMG")ftImgClose()});document.body.appendChild(g);g.querySelector("button").focus()}
async function ftImg(o){try{await Promise.all([document.fonts.load('400 40px "DotGothic16"'),document.fonts.load('700 30px "Noto Sans TC"')])}catch(e){}
const W=720,FH=1280,K=1.5,F='"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif',PF='"DotGothic16",'+F,q=s=>(o.querySelector(s)||{}).textContent||"",NV=o.querySelector(".ftc.lm")?"#5a0f2a":o.querySelector(".ftc.sh")?"#4a3500":"#0b2a5b",SB=o.querySelector(".ftc.lm")?"#a0486a":o.querySelector(".ftc.sh")?"#8a6a1c":"#4a6a96",mem=q(".ftm"),AC=(o.querySelector(".ftc.lm .lmb")?"#e0245e":o.querySelector(".ftc.sh")?"#d29a00":FT_MC[mem])||"#4a90e2",shn=o.querySelector(".ftc").classList.contains("sh"),lmt=(o.querySelector(".ftc.lm .lmb")||{}).textContent||"",full=o.querySelector(".ftc").classList.contains("fl")||shn||!!lmt,ns=((o.querySelector(".fts")||{}).textContent||"").split("★").length-1,sp=o.querySelector(".ftc.kh")?FT_TW:FT_SP[Math.min(4,Math.max(1,ns))-1],DK=ftMix(AC,NV,.5);
/* 畫卡片本體：回傳卡片需要的高度（含上下 40 的邊） */
const card=(x,H)=>{x.fillStyle="#fff";x.fillRect(40,40,W-80,H-80);x.lineWidth=8;x.strokeStyle=DK;x.strokeRect(40,40,W-80,H-80);
x.fillStyle=AC;x.fillRect(44,44,W-88,130);x.textBaseline="top";x.textAlign="center";x.fillStyle="#fff";{const ht=lmt||(shn?"★ GOLDEN HOUR ★":q(".fth b"));let fs=46;x.font="400 "+fs+"px "+PF;while(fs>26&&x.measureText(ht).width>W-130){fs-=2;x.font="400 "+fs+"px "+PF}x.fillText(ht,W/2,66+(46-fs)/2)};x.font="500 28px "+F;x.fillText(q(".fth span"),W/2,126);
const rows=sp[0].split("|"),cw=Math.max(...rows.map(r=>r.length)),kh=!!o.querySelector(".ftc.kh"),ps=rows.length>10?9:13,sx=Math.round((W-cw*ps)/2),sy=196;
if(kh){let sd2=fth(q(".fth span")+mem+"px")||5;const rn=()=>(sd2=Math.imul(sd2,1664525)+1013904223>>>0)/4294967296,ZH=17*8,T=FT_TEA.split("|"),C=FT_CHK.split("|"),TW=sp[0].split("|"),sw=rn()<.5,dr=(R,pp,cx,cy)=>R.forEach((r,j)=>[...r].forEach((ch,i)=>{const c=ftPc(ch,DK);if(!c)return;x.fillStyle=c;x.fillRect(Math.round(cx-R[0].length*pp/2)+i*pp,Math.round(cy-R.length*pp/2)+j*pp,pp,pp)})),cy0=sy+ZH/2;
dr(TW,9,W/2,cy0);dr(sw?T:C,6,176+Math.floor(rn()*30)-15,cy0+Math.floor(rn()*24)-12);dr(sw?C:T,6,544+Math.floor(rn()*30)-15,cy0+Math.floor(rn()*24)-12);
[[262,0],[458,0],[116,1],[604,1]].forEach(a=>{if(rn()<.75){const cx=a[0]+Math.floor(rn()*16)-8,cy=sy+14+Math.floor(rn()*(ZH-28));x.fillStyle="#ffd23f";[[0,0],[-1,0],[1,0],[0,-1],[0,1]].forEach(d=>x.fillRect(cx+d[0]*6,cy+d[1]*6,6,6))}})}
else rows.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==="."||ch===" ")return;x.fillStyle=ch==="#"?DK:ch==="k"?"#ffd23f":sp[1];x.fillRect(sx+i*ps,sy+j*ps,ps,ps)}));
const by=sy+(kh?17*8:rows.length>10?rows.length*ps+4:10*ps)+16,bh=150;let g=ftMix(AC,"#ffffff",.82);if(full){const gr=x.createLinearGradient(80,0,W-80,0);[["0","#ffd9e6"],[".35","#fff2b8"],[".7","#d4ebff"],["1","#e6dcff"]].forEach(a=>gr.addColorStop(+a[0],a[1]));g=gr}
x.fillStyle=g;x.fillRect(80,by,W-160,bh);x.setLineDash(full?[]:[14,10]);x.lineWidth=6;x.strokeStyle=lmt?"#e0245e":full?"#e0a800":ftMix(AC,"#ffffff",.3);x.strokeRect(80,by,W-160,bh);x.setLineDash([]);
x.fillStyle=DK;const big=mem.length>6;x.font="400 "+(big?64:88)+"px "+PF;x.fillText(mem,W/2,by+(big?44:30));
let y=by+bh+30;o.querySelectorAll(".ftr:not(.ftx)").forEach(r=>{const l=r.children[0].textContent,v=r.children[1].textContent.replace(/\s+/g," ").trim();x.textAlign="left";x.fillStyle=SB;x.font="500 23px "+F;x.fillText(l,90,y);
x.font="700 26px "+F;const vw=x.measureText(v).width;x.font="500 23px "+F;const st=r.classList.contains("v")||x.measureText(l).width+vw+40>W-180;
if(st){y+=34;x.fillStyle=NV;x.font="700 24px "+F;y=ftWrap(x,v,90,y,W-180,34)+26}
else{x.textAlign="right";x.fillStyle=r.querySelector(".fts")?"#e0a800":NV;x.font="700 26px "+F;x.fillText(v,W-90,y-2);const sw=r.querySelector(".ftsw");if(sw){x.fillStyle=sw.style.background;x.fillRect(W-90-vw-34,y+1,22,22);x.lineWidth=3;x.strokeStyle=DK;x.strokeRect(W-90-vw-34,y+1,22,22)}y+=50}});
x.textAlign="center";x.fillStyle=DK;x.font="700 32px "+F;x.fillText(q(".ftq"),W/2,y+8);return y+8+32+90};
const t=document.createElement("canvas");t.width=W;t.height=3000;const Hc=card(t.getContext("2d"),3000),s=Math.min(1,FH/Hc),c=document.createElement("canvas");c.width=W*K;c.height=FH*K;const x=c.getContext("2d");x.scale(K,K);
x.fillStyle=ftMix(AC,"#ffffff",.8);x.fillRect(0,0,W,FH);
let sd=fth(q(".fth span")+mem)||7;const rnd=()=>(sd=Math.imul(sd,1664525)+1013904223>>>0)/4294967296;x.fillStyle=ftMix(AC,"#ffffff",.55);for(let i=0;i<70;i++){const px=Math.floor(rnd()*W/12)*12,py=Math.floor(rnd()*FH/12)*12;if(px>20&&px<W-44&&py>20&&py<FH-44)continue;x.fillRect(px,py,12,12);if(i%3===0){x.fillRect(px-12,py,12,12);x.fillRect(px+12,py,12,12);x.fillRect(px,py-12,12,12);x.fillRect(px,py+12,12,12)}}
x.save();x.translate((W-W*s)/2,(FH-Hc*s)/2);x.scale(s,s);card(x,Hc);x.restore();
c.toBlob(b=>{if(b)ftImgShow(b)},"image/png")}
function ftBd(d){let r=null;const t0=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);MEMBERS.forEach(m=>{if(m[0]==="BTS")return;[-1,0,1].forEach(o=>{const k=Math.round((new Date(d.getFullYear()+o,m[1]-1,m[2],12)-t0)/864e5);if(Math.abs(k)<=3&&(!r||Math.abs(k)<Math.abs(r.k)))r={m:m[0],k}})});return r}
/* 成員語錄：只收公開演說、領獎感言裡可查證的短句（中文為意譯），抽到該成員時有一半機率從這裡抽 */
const FT_MQ={"RM": [["也許我昨天犯了錯，但昨天的我還是我。今天，我就是我，帶著我所有的缺點與過錯。", ""], ["我們必須試著記得自己是誰，並正視真正的自己。", ""], ["生活是有趣的，而活著更美好。", ""], ["勇敢說出自己，找回你的名字，也找回你的聲音。", ""]], "Jin": [["誰知道呢？也許這一刻是給我們的機會。", ""], ["你的辛苦只要你知道就行了。", ""], ["努力不懈的人會成功的。", ""], ["I'm the one I should love。", ""], ["我生活在現在，是為了真實地感受我的感受。", ""], ["When something is delicious, it's zero calories.", ""]], "SUGA": [["沒有夢想也是正常的", ""], ["雖害怕墜落，但不畏懼著陸", ""], ["因為有結局，所以過程才有意義", ""], ["害怕看到結局就什麼都做不了", ""]], "j-hope": [["I'm your hope, you're my hope, I'm J-hope!", ""], ["不要害怕失敗，因為無論何時，隨隨便便放棄的夢想，不是真正的夢想。", ""], ["愛自己所愛，愛自己所能！", ""], ["不努力就不會迎來美好果實", ""]], "Jimin": [["人生最珍貴的，絕對是緣分！", ""], ["世上沒有白走的路，也沒有白吃的午餐！", ""]], "V": [["只要是在努力的路上，就不會孤單！", ""], ["I PURPLE YOU", ""], ["不是每天都要閃閃發光，能撐過今天就已經很厲害了。", ""], ["哪怕不站在高處也沒關係，即使和別人不一樣也沒關係，只要你幸福就好。", ""]], "Jungkook": [["如果改變不了，那就去享受，會享受的人是無法被戰勝的。", ""], ["人生的花樣年華終會來臨。", ""], ["會成為大家的太陽，會成為一直閃閃發光的人！", ""], ["一開始我是黃金，然後發現我的身邊成了一片金黃。", ""]]};
/* 連續抽籤稱號：第 1、3、7、14、30、50、100、365 天各升一階；第三個欄位為 1 的稱號，還要集滿成員圖鑑才拿得到 */
const FT_TIERS=[[1,"新手村村民"],[3,"阿米棒點燈人"],[7,"七色圖鑑解鎖者",1],[14,"敲碗巡演先鋒"],[30,"紫色狂熱份子"],[50,"每日精神糧食獲得者"],[100,"Hope World 榮譽永久居民"],[365,"陪伴彼此的永恆星星"]];
function ftTier(n,full){let i=0;FT_TIERS.forEach((t,k)=>{if(n>=t[0]&&(!t[2]||full))i=k});return i}
/* 演唱會當天限定卡：只在開演日（和各城市場次日期一致）抽到，固定大吉；抽過的場次會記起來，結束後留作回顧 */
const FT_LC=Object.keys(CITIES).map(k=>{const c=CITIES[k],a=c.showDays||[];return[k,c.name,c.y,+String(a[0]||"1/1").split("/")[0],a]}).filter(x=>x[4].length);
function ftLM(d){const y=d.getFullYear(),ds=(d.getMonth()+1)+"/"+d.getDate();for(const c of FT_LC)if(c[2]===y&&c[4].includes(ds))return{k:c[0]+"-"+ds,name:c[1]};return null}
function ftLmHtml(st){let o="";FT_LC.forEach(c=>{const g=c[4].filter(x=>st.lm.includes(c[0]+"-"+x));if(!g.length)return;o+=`<div class="ftr ftx"><span>${c[1]}場限定卡</span><b>${g.length}/${c[4].length}</b></div><div class="ftg">${c[4].map(x=>`<span class="ftl${g.includes(x)?" on":""}">${x}</span>`).join("")}</div>`;if(g.length>=c[4].length)o+=`<div class="ftb lmb">${c[1]}場限定卡集滿了！</div><div class="ftr"><span>特別稱號</span><b>${c[1]}場見證者</b></div>`});return o}
function ftShow(){const d=new Date(),key=ftKey(d),M=MEMBERS.filter(m=>m[0]!=="BTS"),bd=ftBd(d),mb0=bd?bd.m:M[fth(key+"m")%M.length][0],SH=fth(key+"s")%20===0,LM=ftLM(d),n=(bd||SH||LM)?5:2+fth(key+"r")%4,rk=(bd||SH||LM)?"大吉":["吉","小吉","中吉","大吉"][fth(key+"r")%4],tk=bd?{t:"去生日應援頁，看看有哪些應援"}:ftTaskOf(key,d),t=tk.t,sg=ftPick(d),lc=FT_COL[fth(key+"k")%FT_COL.length],ln=1+fth(key+"n")%99,wd0=FT_WORDS[fth(key+"w")%FT_WORDS.length];
let wd=wd0,wsrc="";{const mp=FT_MQ[mb0]||[];if(mp.length&&fth(key+"q")%2===0){const z=mp[fth(key+"w")%mp.length];wd=z[0];wsrc=z[1]}}
const td=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate(),yd=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1);let st={};try{st=JSON.parse(localStorage.getItem("ftn-st")||"{}")||{}}catch(e){}
st.tk={d:td,t:tk.t,go:tk.go||"",ok:st.tk&&st.tk.d===td&&st.tk.ok?1:0};st.th=(Array.isArray(st.th)?st.th:[]).filter(h=>h.d!==td).concat({d:td,t:tk.t}).slice(-14);
if(st.last!==td){st.n=st.last===yd.getFullYear()+"-"+(yd.getMonth()+1)+"-"+yd.getDate()?(st.n||0)+1:1;st.last=td}
st.col=Array.isArray(st.col)?st.col:[];if(!st.col.includes(mb0))st.col.push(mb0);st.sh=Array.isArray(st.sh)?st.sh:[];if(SH&&!st.sh.includes(mb0))st.sh.push(mb0);const shf=st.sh.length>=M.length;st.lm=Array.isArray(st.lm)?st.lm:[];if(LM&&!st.lm.includes(LM.k))st.lm.push(LM.k);const full=st.col.length>=M.length,mb=mb0,sn=st.n||1,ti=ftTier(sn,full),ts0=st.ts;st.ts=ts0&&ts0.d===td?{d:td,i:ti,p:ts0.p}:{d:td,i:ti,p:ts0?ts0.i:0};try{localStorage.setItem("ftn-st",JSON.stringify(st))}catch(e){}setTimeout(()=>{try{badgeSync()}catch(x){}},700);
ftClose();const o=document.createElement("div");o.id="ftn";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
const nx=FT_TIERS[ti+1],KH=[FT_TEA,FT_TW[0],FT_CHK],kr=fth(key+"px"),ka=kr%3,kb=(ka+1+(kr>>3)%2)%3,kst=n=>{const v=fth(key+"px"+n);return`transform:translateY(${v%9-4}px) rotate(${(v>>5)%31-15}deg)`};
o.innerHTML=`<div class="ftc dr${ti?" t"+(ti<3?1:ti<5?2:3):""}${full?" fl":""}${SH?" sh":""}${LM?" lm"+(LM.name==="高雄"?" kh":""):""}"><div class="fth"><b>今日幸運籤</b><span>${d.getMonth()+1}/${d.getDate()}</span></div>${LM?`<div class="ftb lmb">${LM.name==="高雄"?ftPxSvg(KH[ka],kst(1)):""}<span>${LM.name==="高雄"?"ARIRANG IN KAOHSIUNG":"★ "+LM.name+"場限定卡 ★"}</span>${LM.name==="高雄"?ftPxSvg(KH[kb],kst(2)):""}</div>`:""}${SH?`<div class="ftb shb">★ GOLDEN HOUR・今天是限定大吉 ★</div>`:""}${bd?`<div class="ftb">${bd.k===0?"🎂 今天是 "+esc(mb)+" 的生日！":"🎂 生日週特別籤"}</div>`:""}<div class="ftm">${ftMainAv(mb,SH,!!(bd&&bd.k===0&&bd.m===mb))}${esc(mb)}</div><div class="ftr"><span>應援運勢</span><b class="fts">${"★".repeat(n)}${"☆".repeat(5-n)} <em>${rk}</em></b></div><div class="ftr"><span>幸運色・號碼</span><b><i class="ftsw" style="background:${lc[1]}"></i><span>${lc[0]}</span> ・ ${ln}</b></div><div class="ftr v ftt"><span>今日任務</span><b>${t}${st.tk.ok?" ✓":""}</b></div><div class="ftr v"><span>今日語錄</span><b>${wd}</b></div><div class="ftr"><span>連續抽籤</span><b><i>${st.n||1}</i> 天</b></div>${st.ts.i>st.ts.p?`<div class="ftb">解鎖新稱號！</div>`:""}<div class="ftr"><span>稱號</span><b>${FT_TIERS[ti][1]}</b></div><div class="ftd" hidden>${nx?`<div class="ftr ftx"><span>下一個稱號</span><b>${nx[1]}・連續 ${nx[0]} 天${nx[2]?"且集滿成員圖鑑":""}</b></div>`:""}<div class="ftr ftx"><span>成員圖鑑</span><b>${st.col.length}/${M.length}</b></div><div class="ftg">${M.map(m=>{const on=st.col.includes(m[0]);return `<span class="ftl${on?" on":""}">${ftAv(m[0],on)}${esc(m[0])}</span>`}).join("")}</div>${full?`<div class="ftb">成員圖鑑集滿了！</div>`:""}<div class="ftr ftx"><span>閃卡圖鑑</span><b>${st.sh.length}/${M.length}</b></div><div class="ftg">${M.map(m=>{const on=st.sh.includes(m[0]);return `<span class="ftl${on?" on shn":""}">${ftAv(m[0],on,1)}★${esc(m[0])}</span>`}).join("")}</div>${shf?`<div class="ftb shb">金閃圖鑑集滿了！</div><div class="ftr"><span>特別稱號</span><b>金閃收藏家</b></div>`:""}${ftLmHtml(st)}</div>${sg?`<div class="ftr"><span>今日幸運曲</span><b>${esc(sg.t)}</b></div>${gBest()[sg.t]?`<div class="ftr ftx"><span>遊戲最佳成績</span><b>${gBest()[sg.t].g}</b></div>`:""}<button type="button" class="btn" data-f="go">來玩這首</button>`:""}<div class="ftq" hidden>你抽到什麼？</div><div class="fta">${tk.go==="tour"?`<button type="button" class="btn" data-f="gt">去看巡演應援</button>`:tk.go==="bd"?`<button type="button" class="btn" data-f="gb">去看進行中的生日應援</button>`:""}${bd?`<button type="button" class="btn" data-f="bd">去看生日應援</button>`:""}<button type="button" class="btn" data-f="done"${st.tk.ok?" disabled":""}>${st.tk.ok?"✓ 今日任務已完成":"完成今日任務"}</button><button type="button" class="btn" data-f="img">存成圖片</button><button type="button" class="btn" data-f="col">查看圖鑑</button><button type="button" class="btn" data-f="x">關閉</button></div></div>`;
o.addEventListener("click",e=>{if(e.target===o){ftClose();return}const b=e.target.closest("[data-f]");if(!b)return;const f=b.dataset.f;
if(f==="x")ftClose();
else if(f==="done"){let s={};try{s=JSON.parse(localStorage.getItem("ftn-st")||"{}")||{}}catch(e){}const dd=new Date(),k=dd.getFullYear()+"-"+(dd.getMonth()+1)+"-"+dd.getDate();if(s.tk&&s.tk.d===k&&!s.tk.ok){s.tk.ok=1;s.dc=(+s.dc||0)+1;try{localStorage.setItem("ftn-st",JSON.stringify(s))}catch(e){}b.disabled=true;b.textContent="✓ 今日任務已完成";const r=o.querySelector(".ftt b");if(r)r.textContent+=" ✓";try{toast("今日任務完成！")}catch(e){}setTimeout(()=>{try{badgeSync()}catch(x){}},300)}}
else if(f==="img")ftImg(o);
else if(f==="gt"){ftClose();gos("tour");window.scrollTo(0,0)}
else if(f==="gb"){ftClose();gos("birthday");window.scrollTo(0,0)}
else if(f==="bd"){ftClose();gos("birthday");try{mem=mb;head();chips();render()}catch(x){}window.scrollTo(0,0)}
else if(f==="go"&&sg){ftClose();gos("songs");ALB=albOf(sg);SEL=sg.t;try{localStorage.setItem("song-sel",SEL)}catch(x){}if(ftOK(sg))SMODE="g";songsR();window.scrollTo(0,0)}
else if(f==="col"){const d=o.querySelector(".ftd");if(d){d.hidden=!d.hidden;if(!d.hidden)d.scrollIntoView({block:"nearest",behavior:"smooth"})}}});
document.body.style.overflow="hidden";document.body.appendChild(o);const x=o.querySelector('[data-f="x"]');if(x)x.focus()}
/* 今天第一次抽才播抽籤動畫（約 1.3 秒，點一下可略過）；抽過或系統設定減少動態就直接顯示 */
function ftOpen(){let seen=false,rm=false;try{const d=new Date(),st=JSON.parse(localStorage.getItem("ftn-st")||"{}")||{};seen=st.last===d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()}catch(e){}try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
if(seen||rm){ftShow();return}
ftClose();const o=document.createElement("div");o.id="ftn";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");
o.innerHTML=`<div class="ftc ftdraw"><svg viewBox="0 0 20 20" shape-rendering="crispEdges" aria-hidden="true"><rect x="6" y="1" width="1" height="8" fill="#e0a800"/><rect x="9" y="0" width="1" height="9" fill="#ff8fb3"/><rect x="12" y="2" width="1" height="7" fill="#6fb7ff"/><rect x="4" y="9" width="12" height="9" fill="#ffd23f"/><rect x="4" y="9" width="12" height="1" fill="#0b4fa8"/><rect x="4" y="17" width="12" height="1" fill="#0b4fa8"/><rect x="4" y="9" width="1" height="9" fill="#0b4fa8"/><rect x="15" y="9" width="1" height="9" fill="#0b4fa8"/><rect x="8" y="12" width="4" height="3" fill="#fff"/></svg><b>抽籤中…</b><small>點一下可略過</small></div>`;
document.body.style.overflow="hidden";document.body.appendChild(o);
let t=0;const go=()=>{clearTimeout(t);if(document.getElementById("ftn")===o)ftShow()};t=setTimeout(go,1300);o.addEventListener("click",go)}
document.getElementById("ftnBtn").addEventListener("click",ftOpen);ftSync();document.addEventListener("visibilitychange",ftSync);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){if(document.getElementById("ftimg"))ftImgClose();else if(document.getElementById("ftn"))ftClose()}});
function albOf(x){return(x.a||"").trim()||"其他"}
/* 專輯封面：試算表「封面」欄優先；沒填就用這裡的對照（專輯名: 圖片路徑） */
const ALBUM_COVERS={"ARIRANG":"IMG/IMG_1293.png"};
/* 「成員 solo」每位成員的封面照片（成員名: 圖片路徑，例如 "RM":"IMG/rm.png"）；沒填就用他第一張專輯的封面 */
const MEMBER_COVERS={"RM":"IMG/652612703_17931699165208596_8366189534887424123_n.webp","Jin":"IMG/651933029_17931699156208596_1227118128472260971_n.webp","SUGA":"IMG/650404387_17931699186208596_3870988750215656133_n.webp","j-hope":"IMG/650997368_17931699138208596_6134925757819154766_n.webp","Jimin":"IMG/652805150_17931699174208596_6495491243096633283_n.webp","V":"IMG/651183676_17931699150208596_4211223512292756611_n.webp","Jungkook":"IMG/651007172_17931699192208596_8969327553735820868_n.webp"};
function albCover(n){const x=SONGS.find(x=>albOf(x)===n&&(x.p||"").trim());if(!x)return ALBUM_COVERS[n]||"";const p=x.p.trim();return /^https?:\/\//i.test(p)||p.includes("%")?p:encodeURI(p)}
/* 專輯排序：依發行日期。試算表加一欄「發行日」（例如 2026-03-20）優先；沒填就用下面的 ALBUM_DATES 對照（專輯名: "YYYY-MM-DD"）。沒有日期的專輯排在最後。
   ALBUM_ORDER："new"＝新到舊，"old"＝舊到新 */
const ALBUM_DATES={};
const ALBUM_ORDER="new";
function albTime(n){let t=NaN;for(const x of SONGS){if(albOf(x)!==n)continue;const s=String(x.rd||"").trim().replace(/[\/.]/g,"-").replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/,(m,y,a,b)=>y+"-"+a.padStart(2,"0")+"-"+b.padStart(2,"0")),v=Date.parse(s);if(isFinite(v)){t=v;break}}if(!isFinite(t)&&ALBUM_DATES[n])t=Date.parse(ALBUM_DATES[n]);return t}
/* 演唱會排序：依舉辦日。試算表加一欄「演唱會日期」，格式「演唱會名稱=2026-11-19」（多場用「、」或換行隔開；多天的演唱會填第一天）；沒填就看 data.js 的 CONCERT_DATES={"ARIRANG":"2026-11-19"}。沒有日期的排在最後，順序維持原本。CONCERT_ORDER："new"＝新到舊，"old"＝舊到新 */
const CONCERT_ORDER="new";
function conTime(n){let t=NaN;const nd=s=>Date.parse(String(s||"").trim().replace(/[\/.]/g,"-").replace(/^(\d{4})-(\d{1,2})-(\d{1,2})$/,(m,y,a,b)=>y+"-"+a.padStart(2,"0")+"-"+b.padStart(2,"0")));
for(const x of SONGS){for(const q of String(x.cd||"").split(/[、\n]+/)){const s=q.trim(),i=s.indexOf("=");if(i>0&&s.slice(0,i).trim()===n){const v=nd(s.slice(i+1));if(isFinite(v)){t=v;break}}}if(isFinite(t))break}
if(!isFinite(t)&&typeof CONCERT_DATES!=="undefined"&&CONCERT_DATES&&CONCERT_DATES[n])t=nd(CONCERT_DATES[n]);return t}
/* 同一巡演多天的歌單差異：演唱會名稱最後面的日期（例如「…(12/8)」「… 12/9」）拿掉後相同，就視為同一個巡演的不同天，比對兩天各有哪些歌 */
const conKey=n=>String(n).replace(/\s*[(（]\s*\d{1,2}\/\d{1,2}\s*[)）]\s*$/,"").replace(/\s+\d{1,2}\/\d{1,2}\s*$/,"").trim();
const conLab=n=>{const m=String(n).match(/\d{1,2}\/\d{1,2}\s*[)）]?\s*$/);return m?m[0].replace(/[)）\s]/g,""):String(n)};
function conDiff(name,CL){const key=conKey(name),sibs=CL.filter(c=>c!==name&&conKey(c)===key),r={html:"",only:new Set()};if(!sibs.length||key===name)return r;
const set=n=>new Set(SONGS.filter(x=>songCons(x).some(c=>c.n===n)).map(x=>x.t)),mine=set(name),ord=n=>x=>{const c=songCons(x).find(c=>c.n===n);return c?c.o:SORTMAX};
const list=(S,n)=>SONGS.filter(x=>S.has(x.t)).sort((a,b)=>ord(n)(a)-ord(n)(b)).map(x=>`<i>${esc(x.t)}</i>`).join("")||"<i>—</i>";
let h=`<b class="sdt">歌單差異</b>`;
sibs.forEach(s=>{const o=set(s),a=new Set([...mine].filter(t=>!o.has(t))),b=new Set([...o].filter(t=>!mine.has(t)));a.forEach(t=>r.only.add(t));
h+=`<p class="sdp"><em>對照</em> <b>${esc(conLab(s))}</b></p>`+(a.size||b.size?`<p class="sdo me"><span class="sdl"><em>只在這場</em></span><span class="sdc">${list(a,name)}</span></p><p class="sdo ot"><span class="sdl"><em>只在</em> <b>${esc(conLab(s))}</b></span><span class="sdc">${list(b,s)}</span></p>`:`<p><em>歌單完全相同</em></p>`)});
r.html=h;return r}
function albHue(n){let h=0;for(const c of n)h=(h*31+c.charCodeAt(0))%360;return h}
/* 演唱會歌單（每場演唱會各有自己的歌單，跟專輯分類互不影響）：
   ① 試算表加一欄「演唱會」，填這首歌有唱的演唱會，用「、」隔開；順序寫在名稱後面，例如「ARIRANG:3、SWIM Tour:12」＝在 ARIRANG 是第 3 首、在 SWIM Tour 是第 12 首；不寫順序就照試算表列的先後排。沒填的歌只出現在專輯。
   ② 或在 data.js 設定 SETLISTS={"ARIRANG":["歌名1","歌名2"],"SWIM Tour":[…]}，照陣列順序排。可選：CONCERT_COVERS={"ARIRANG":"圖片網址"} 給演唱會封面。 */
let VIEW="a",MEM="";try{const v0=sessionStorage.getItem("song-view");VIEW=v0==="s"||v0==="m"?v0:"a"}catch(e){}try{ALB=sessionStorage.getItem("song-alb")||"";MEM=sessionStorage.getItem("song-mem")||""}catch(e){}/* 從首頁點進來一律重設成依專輯（見 gos）；沒回首頁之前，切換、重新整理都會記住 */
const SORTMAX=1e9;
/* 演唱會封面：試算表「演唱會封面」欄，直接填圖片網址或路徑＝給這一列這首歌所屬的演唱會用；一首歌屬於好幾場、要分開指定時寫「演唱會名稱=圖片」（多場用「、」或換行隔開）；沒填再看 data.js 的 CONCERT_COVERS；都沒有就顯示彩色底加名稱。 */
function conCover(n){for(const x of SONGS)for(const q of String(x.cc||"").split(/[、\n]+/)){const t=q.trim();if(!t)continue;const i=t.indexOf("=");
if(i>0&&!/^https?:/i.test(t.slice(0,i))&&t.slice(0,i).trim()===n){const u=t.slice(i+1).trim();if(u)return u}
else if((i<0||/^https?:/i.test(t.slice(0,i)))&&songCons(x).some(c=>c.n===n))return t}return(window.CONCERT_COVERS||{})[n]||""}
function rawCons(x){const r=[];String(x.s||"").split(/[、，,；;\n]+/).forEach(q=>{q=q.trim();if(!q)return;const m=q.match(/^(.*?)\s*[:：]\s*(\d+(?:\.\d+)?)$/);r.push(m?{n:m[1].trim(),o:+m[2]}:{n:q,o:SORTMAX})});
const S=window.SETLISTS;if(S&&typeof S==="object")Object.keys(S).forEach(k=>{const i=(Array.isArray(S[k])?S[k]:[]).findIndex(t=>String(t).trim().toLowerCase()===String(x.t).trim().toLowerCase());if(i>=0&&!r.some(c=>c.n===k))r.push({n:k,o:i+1})});return r.filter(c=>c.n)}
/* 同一巡演多天：名稱後面有日期的（例如「…(12/8)」「…(12/9)」）算同一個巡演的不同天。
   某首歌只寫巡演名稱、不帶日期（例如「LOVE YOURSELF:3」），就代表每一天都唱，會自動複製到所有天；只有某一天才唱或順序不同的，再另外寫「LOVE YOURSELF(12/9):4」，同一天有寫的以寫的為準。 */
function conDays(){const m={};SONGS.forEach(x=>rawCons(x).forEach(c=>{const k=conKey(c.n);if(k&&k!==c.n)(m[k]=m[k]||new Set()).add(c.n)}));return m}
function songCons(x){const r=rawCons(x),D=conDays(),out=r.slice();r.forEach(c=>{const ds=D[c.n];if(ds)ds.forEach(d=>{if(!out.some(o=>o.n===d))out.push({n:d,o:c.o})})});return out.filter(c=>!D[c.n])}
/* 歌單預測：演唱會前猜會唱哪些歌，公布實際歌單後算分、排行（後端是 Apps Script，部署方式見 pred-setup.md；data.js 的 PRED_URL 留空就不顯示這個功能） */
function predUrl(){return String(typeof PRED_URL!=="undefined"?PRED_URL:"").trim()}
var PRS=null;
const prN=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,"");
function predRec(j){try{if(!j||!Array.isArray(j.events))return;let o={j:[],b:0,t:0};try{const x=JSON.parse(localStorage.getItem("kh-pred")||"{}");if(x&&typeof x==="object")o={j:Array.isArray(x.j)?x.j:[],b:+x.b||0,t:+x.t||0}}catch(e){}
let ch=false;j.events.forEach(e=>{const m=e.mine;if(!m)return;if(!o.j.includes(e.id)){o.j.push(e.id);ch=true}
if(e.status==="settled"){const sc=+m.score||0;if(sc>o.b){o.b=sc;ch=true}if(m.rank===1&&sc>0&&(+e.total||0)>=2&&!o.t){o.t=1;ch=true}}});
if(ch){o.j=o.j.slice(-50);localStorage.setItem("kh-pred",JSON.stringify(o));setTimeout(()=>{try{badgeSync()}catch(e){}},300)}}catch(e){}}
function predGet(){const u=predUrl();return fetch(u+(u.includes("?")?"&":"?")+"uid="+encodeURIComponent(voteUid())).then(r=>r.json()).then(j=>{if(!j||!j.ok)throw 0;PRS=j;predRec(j);return j})}
function predPost(o){o.uid=voteUid();return fetch(predUrl(),{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(o)}).then(r=>r.json())}
function predBar(){return`<div class="cdb prb"><i class="pri" aria-hidden="true"><svg viewBox="0 0 10 10" shape-rendering="crispEdges"><g fill="currentColor"><rect x="3" y="0" width="4" height="1"/><rect x="1" y="1" width="8" height="1"/><rect x="0" y="2" width="10" height="5"/><rect x="1" y="7" width="8" height="1"/><rect x="3" y="8" width="4" height="1"/></g><g fill="#fff" opacity=".75"><rect x="2" y="2" width="2" height="1"/><rect x="2" y="3" width="1" height="1"/></g><rect x="6" y="4" width="2" height="1" fill="#ffd23f"/><rect x="7" y="3" width="1" height="3" fill="#ffd23f"/><rect x="1" y="9" width="8" height="1" fill="#e0a800"/></svg></i><div class="prt"><small>歌單預測</small><b>猜猜這次會唱哪些歌</b><em>演唱會前先猜，公布歌單後算分、排行</em></div><button type="button" class="btn main" data-pr="1">開始猜</button></div>`}
try{if(window.I18N){I18N.add("在「依演唱會」裡，演唱會前先猜會唱哪些歌，公布實際歌單後自動算分，還有排行榜。點「開始猜」就能參加。","In “By concert”, guess the setlist before the show; it is scored automatically once the real setlist is out, with a leaderboard. Tap “Start guessing” to join.","「공연별」에서 공연 전에 셋리스트를 예측하면, 실제 셋리스트 공개 후 자동으로 채점되고 순위도 나와요. 「시작하기」를 눌러 참여하세요.","「公演別」で公演前にセットリストを予想すると、発表後に自動採点＆ランキングが出ます。「予想する」をタップして参加しよう。");I18N.add("歌名寫法不同（例如中文翻譯）的猜測，會由主辦人人工確認後計分。","Guesses written differently (e.g. a translated title) are checked and scored manually by the organizer.","표기가 다른 예측(예: 번역된 곡명)은 운영자가 직접 확인해 채점해요.","表記が異なる予想（例：翻訳タイトル）は主催者が確認して採点します。");I18N.add("歌單預測","Setlist Prediction","셋리스트 예측","セットリスト予想");I18N.add("初次預測","First Prediction","첫 예측","初予想");I18N.add("送出一次歌單預測","Submit a setlist prediction once","셋리스트 예측을 한 번 제출","セットリスト予想を1回送信");I18N.add("預測常客","Regular Predictor","예측 단골","予想常連");I18N.add("參加 3 場歌單預測","Join 3 setlist predictions","셋리스트 예측 3회 참여","セットリスト予想に3回参加");I18N.add("神預測","Oracle","신의 예측","神予想");I18N.add("單場歌單預測猜中 5 首以上","Get 5 or more songs right in one prediction","한 번의 예측에서 5곡 이상 적중","1回の予想で5曲以上的中");I18N.add("預測王","Prediction King","예측왕","予想王");I18N.add("在歌單預測拿到第 1 名（至少 2 人參加）","Rank #1 in a setlist prediction (2+ participants)","셋리스트 예측 1위 달성(참가자 2명 이상)","セットリスト予想で1位（参加者2人以上）");I18N.add("這個暱稱已經有人用了，請換一個","This nickname is already taken. Please pick another.","이미 사용 중인 닉네임이에요. 다른 닉네임을 써 주세요.","このニックネームは既に使われています。別のものにしてください。");I18N.add("演唱會前先猜，公布歌單後算分、排行","Guess before the show; scored once the setlist is out","공연 전에 예측하고, 셋리스트 공개 후 점수와 순위가 나와요","公演前に予想、セットリスト発表後に採点・ランキング");I18N.refresh&&I18N.refresh()}}catch(e){}
window.addEventListener("load",()=>setTimeout(()=>{try{if(predUrl()&&localStorage.getItem("kh-pred"))predGet().catch(()=>{})}catch(e){}},4000));
/* 排行榜：前 5 名（同分並列名次），自己那一列標「你」；自己不在前 5 名時，底下補一列自己的名次。
   後端回傳的每一筆有 me 欄位（見 pred-backend.gs）；舊版後端沒有 me，就用名次加分數去對。 */
function prBoard(e,m){const all=e.top||[],T=all.slice(0,5);if(!T.length)return`<ul class="vl"><li><p>沒有人參加</p></li></ul>`;
const flag=all.some(x=>"me"in x);let RK=0,found=false;
const rows=T.map((x,i,a)=>{if(!i||x.s<a[i-1].s)RK=i+1;let me=!!x.me;if(!flag&&m&&!found&&m.rank===RK&&m.score===x.s)me=true;if(me)found=true;return`<li class="vr${me?" mine":""}"><span class="vk">${RK}</span><span class="vt1">${esc(x.n)}${me?` <em class="vme">你</em>`:""}</span><span class="vn">${x.s} 首</span></li>`}).join("");
const ex=m&&m.rank&&!found?`<li class="vr mine gap"><span class="vk">${m.rank}</span><span class="vt1"><em class="vme">你</em></span><span class="vn">${m.score} 首</span></li>`:"";
return`<ul class="vl">${rows}${ex}</ul>`}
/* 系列總排行（例如高雄三天）：每場得分加總，沒參加的場次算 0 分，只計已公布結果的場次 */
function prSeries(s){const mn=s.mine;
return`<p><b>${esc(s.name)}</b>・總排行</p><p class="pr-n">把這個系列每一場的得分加起來，沒參加的場次算 0 分；只計算已公布結果的場次。</p>${mn?`<div class="vnow">你累計猜中 ${mn.score} 首，第 ${mn.rank} 名（共 ${s.total} 人參加）</div>`:`<p>你還沒參加這個系列的任何一場（共 ${s.total} 人參加）</p>`}<div class="pr-h">各場得分</div><ul class="vl">${s.days.map(d=>`<li class="vr"><span class="vt1">${esc(d.name)}</span><span class="vn">${d.status==="settled"?(d.score==null?"—":d.score+" 首"):"尚未公布"}</span></li>`).join("")}</ul><div class="pr-h">總排行榜</div>${prBoard({top:s.top},mn)}`}
function predOpen(){const old=document.getElementById("bgd");if(old)old.remove();
const opener=document.activeElement,o=document.createElement("div");o.id="bgd";if(!matchMedia("(prefers-reduced-motion:reduce)").matches)o.style.animation="bgfade .2s ease-out";o.setAttribute("role","dialog");o.setAttribute("aria-modal","true");o.setAttribute("aria-label","歌單預測");
let cur=0,busy=false;const pk={},nk={};
const cl=()=>{o.remove();document.removeEventListener("keydown",ky);opener&&opener.focus&&opener.focus()},ky=ev=>{if(ev.key==="Escape")cl()};
const msg=t=>{const m=o.querySelector(".vm");if(m)m.textContent=t||""};
const fmt=iso=>{try{return new Intl.DateTimeFormat("zh-TW",{timeZone:"Asia/Taipei",month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(new Date(iso))}catch(e){return iso}};
const shell=h=>`<div class="bgdc vt prd" style="--bc:#2a7de1"><h3>歌單預測</h3>${h}<em class="vm" role="status" aria-live="polite"></em><button type="button" class="btn bgdx">關閉</button></div>`;
/* 輸入時的建議歌名：這場有設定候選歌就用候選歌，沒有就用網站上所有的歌；打的字對得上就自動換成標準寫法 */
const known=e=>{const m=new Map();(e.candidates&&e.candidates.length?e.candidates:SONGS.map(x=>x.t)).forEach(t=>{const k=prN(t);if(k&&!m.has(k))m.set(k,t)});return m};
const rl=()=>{const e=PRS&&PRS.events[cur];if(!e||!pk[e.id])return;const P=pk[e.id],K=known(e),box=o.querySelector(".pcs"),c=o.querySelector(".pcn");if(box)box.innerHTML=P.length?P.map((t,i)=>`<button type="button" data-x="${i}" class="${K.has(prN(t))?"":"unk"}" title="點一下移除">${esc(t)} ✕</button>`).join(""):`<span class="pr-e">還沒加入任何歌</span>`;if(c){c.textContent="已選 "+P.length+"/"+e.max;c.style.setProperty("--p",Math.round(P.length/e.max*100)+"%")}};
const add=()=>{const e=PRS&&PRS.events[cur],inp=o.querySelector(".vgi");if(!e||!inp)return;const v=inp.value.trim().slice(0,80);if(!v)return;const P=pk[e.id],k=prN(v);if(!k){msg("請輸入歌名");return}if(P.some(t=>prN(t)===k)){msg("這首已經加過了");inp.value="";return}if(P.length>=e.max){msg("最多猜 "+e.max+" 首");return}P.push(known(e).get(k)||v);inp.value="";msg("");rl();inp.focus()};
const draw=()=>{if(!PRS){o.innerHTML=shell(`<div class="pxload"><span class="pxd"></span><span class="pxd"></span><span class="pxd"></span><p>載入中…</p></div>`);return}
const E=PRS.events||[],SR=PRS.series||[];if(!E.length){o.innerHTML=shell(`<p>目前沒有進行中的預測活動</p>`);return}
if(cur>=E.length+SR.length)cur=0;
const tabs=E.length+SR.length>1?`<div class="vtb" role="group" style="--n:${E.length<=4?Math.max(1,E.length):Math.ceil(E.length/2)}">${E.map(x=>x.name).concat(SR.map(s=>s.name+" 總排行")).map((nm,i)=>`<button type="button" class="btn vtab${i>=E.length?" vser":""}" data-e="${i}" aria-pressed="${i===cur}">${esc(nm)}</button>`).join("")}</div>`:"";
if(cur>=E.length){o.innerHTML=shell(tabs+prSeries(SR[cur-E.length]));return}
const e=E[cur],m=e.mine,mp=m?m.picks:[];
let body="",RK=0;
if(e.status==="open"){if(!pk[e.id])pk[e.id]=mp.slice();
body=`<p><b>${esc(e.name)}</b>・${esc(fmt(e.closeAt))} 截止，截止前可以修改。最多猜 ${e.max} 首。</p><div class="pgr"><input class="vi2 vgi" list="prdl" maxlength="80" autocomplete="off" placeholder="輸入歌名，按 Enter 或「加入」" aria-label="輸入歌名"><button type="button" class="btn vadd">加入</button></div><datalist id="prdl">${[...known(e).values()].map(t=>`<option value="${esc(t)}">`).join("")}</datalist><div class="pcs"></div><div class="vnow pcn"></div><p class="pr-n">虛線框的歌不在網站的歌單裡，請確認拼法；拼錯會算沒猜中。大小寫、空格和標點不影響。</p><input class="vi2 vnk" maxlength="12" placeholder="暱稱（選填，排行榜會顯示）" aria-label="暱稱" value="${esc(nk[e.id]||"")}"><button type="button" class="btn main vsub">${m?"更新預測":"送出預測"}</button>`}
else if(e.status==="upcoming"){body=`<p><b>${esc(e.name)}</b>・尚未開放</p><div class="vnow">⏳ ${esc(fmt(e.openAt))} 開放${e.closeAt?`，${esc(fmt(e.closeAt))} 截止`:""}</div><p>開放後就能輸入歌名，到時再回來猜。</p>`}
else if(e.status==="settled"){const A=new Set((e.actual||[]).map(prN)),P=new Set(mp.map(prN)),HP=m&&m.hit?new Set(m.hit.map(prN)):null,HA=m&&m.hitA?new Set(m.hitA.map(prN)):null;
body=`<p><b>${esc(e.name)}</b>・歌單已公布</p>${m?`<div class="vnow">你猜中 ${m.score}/${e.actual.length} 首${m.rank?`，第 ${m.rank} 名`:""}（共 ${e.total} 人參加）</div>`:`<p>你沒有參加這場預測（共 ${e.total} 人參加）</p>`}<p class="pr-n">歌名寫法不同（例如中文翻譯）的猜測，會由主辦人人工確認後計分。</p><div class="pr-h">實際歌單</div><div class="pcs pc-m">${e.actual.map(t=>`<i class="${(HA?HA.has(prN(t)):P.has(prN(t)))?"hit":""}">${esc(t)}</i>`).join("")}</div>${m?`<div class="pr-h">你猜的</div><div class="pcs pc-m">${mp.map(t=>`<i class="${(HP?HP.has(prN(t)):A.has(prN(t)))?"hit":"miss"}">${esc(t)}</i>`).join("")}</div>`:""}<div class="pr-h">排行榜</div>${prBoard(e,m)}`}
else{body=`<p><b>${esc(e.name)}</b>・已截止，公布實際歌單後會算分。（目前 ${e.total} 人參加）</p>${m?`<div class="pr-h">你猜的</div><div class="pcs pc-m">${mp.map(t=>`<i>${esc(t)}</i>`).join("")}</div>`:`<p>你沒有參加這場預測</p>`}${(e.hot||[]).length?`<div class="pr-h">大家最常猜的</div><ul class="vl">${e.hot.map((x,i)=>`<li class="vr"><span class="vk">${i+1}</span><span class="vt1">${esc(x.t)}</span><span class="vn">${x.n} 人</span></li>`).join("")}</ul>`:""}`}
o.innerHTML=shell(tabs+body);if(e.status==="open")rl()};
draw();
o.addEventListener("click",ev=>{if(ev.target===o||ev.target.closest(".bgdx")){cl();return}
const t=ev.target.closest("[data-e]");if(t){cur=+t.dataset.e;draw();return}
if(ev.target.closest(".vadd")){add();return}
const x=ev.target.closest("[data-x]");if(x&&PRS){const e=PRS.events[cur];if(pk[e.id]){pk[e.id].splice(+x.dataset.x,1);msg("");rl()}return}
const sb=ev.target.closest(".vsub");if(sb&&PRS){if(busy)return;const e=PRS.events[cur],picks=(pk[e.id]||[]).slice();if(!picks.length){msg("至少猜 1 首");return}busy=true;sb.disabled=true;msg("送出中…");const nick=(o.querySelector(".vnk")||{}).value||"";
predPost({action:"pred_submit",event:e.id,picks,nick}).then(j=>{busy=false;if(j&&j.ok){if(j.state){PRS=j.state;predRec(j.state)}draw();msg("已儲存，截止前可以再改");toast("已送出預測")}else{sb.disabled=false;if(j&&j.state){PRS=j.state;draw()}msg((j&&j.error)||"送出失敗")}}).catch(()=>{busy=false;sb.disabled=false;msg("網路不穩，請稍後再試")})}});
o.addEventListener("keydown",ev=>{if(ev.key!=="Enter"||ev.isComposing||ev.keyCode===229)return;if(ev.target.closest&&ev.target.closest(".vgi")){ev.preventDefault();setTimeout(add,0)}});
o.addEventListener("input",ev=>{const n=ev.target.closest&&ev.target.closest(".vnk");if(n&&PRS){const e=PRS.events[cur];if(e)nk[e.id]=n.value}});
document.addEventListener("keydown",ky);document.body.appendChild(o);o.querySelector(".bgdx").focus();
predGet().then(()=>{if(document.body.contains(o))draw()}).catch(()=>{if(!PRS&&document.body.contains(o)){const p=o.querySelector("p");if(p)p.textContent="暫時連不上預測服務，請稍後再試"}})}
/* 演唱會倒數：有日期的演唱會，牆上顯示「倒數 N 天」，最近的一場在最上面放「下一場」卡片，已辦完的標「已結束」並稍微變淡 */
function cdDays(n){const t=conTime(n);if(!isFinite(t))return NaN;const d=new Date(),u=Date.UTC(d.getFullYear(),d.getMonth(),d.getDate());return Math.round((t-u)/864e5)}
function cdTxt(d){return d===0?"🎉 就是今天":d===1?"⏳ 明天開始":"⏳ 倒數 "+d+" 天"}
function cdTag(n){const d=cdDays(n);if(!isFinite(d))return"";return d<0?`<span class="cd end">已結束</span>`:`<span class="cd">${cdTxt(d)}</span>`}
function cdBanner(G){let best=null,bd=1e9;G.forEach(n=>{const d=cdDays(n);if(isFinite(d)&&d>=0&&d<bd){bd=d;best=n}});if(!best)return"";return`<div class="cdb"><small>下一場</small><b>${esc(best)}</b><span>${cdTxt(bd)}</span></div>`}
/* 多天演唱會合併成一張卡片：名稱最後面的日期拿掉後相同的場次算同一組（見 conKey），列表只顯示一張，點進去用日期按鈕切換 */
function conChrono(ds){const k=n=>{const t=conTime(n);if(isFinite(t))return t;const m=String(n).match(/(\d{1,2})\/(\d{1,2})\s*[)）]?\s*$/);return m?+m[1]*100+ +m[2]:1e12};return ds.slice().sort((a,b)=>k(a)-k(b))}
function conSongsOf(ds){return SONGS.filter(x=>songCons(x).some(c=>ds.includes(c.n)))}
function conCoverG(ds){for(const d of ds){const c=conCover(d);if(c)return c}return""}
function gProgG(ds){const L=conSongsOf(ds).filter(ftOK);return{n:L.length,k:L.filter(gCleared).length}}
function cdDaysG(ds){let b=NaN,any=false;ds.forEach(n=>{const d=cdDays(n);if(!isFinite(d))return;any=true;if(d>=0&&!(b<=d))b=d});return isFinite(b)?b:any?-1:NaN}
function cdTagG(ds){const d=cdDaysG(ds);if(!isFinite(d))return"";return d<0?`<span class="cd end">已結束</span>`:`<span class="cd">${cdTxt(d)}</span>`}
function conOpenDay(ds){const c=conChrono(ds);let b=null,bd=1e9;c.forEach(n=>{const d=cdDays(n);if(isFinite(d)&&d>=0&&d<bd){bd=d;b=n}});return b||c[0]}
/* 成員 solo：歌曲試算表多一欄「成員」，有填的歌就歸到「成員 solo」分頁（不再出現在「依專輯」）。成員名稱可填 RM、Jin、SUGA、j-hope、Jimin、V、Jungkook，中文本名或韓文藝名也認得 */
const SOLO_M=["RM","Jin","SUGA","j-hope","Jimin","V","Jungkook"];
const MEM_AL={};[["RM","rm","rapmonster","namjoon","kimnamjoon","金南俊","南俊","김남준","남준","알엠"],["Jin","jin","seokjin","kimseokjin","金碩珍","碩珍","김석진","석진","진"],["SUGA","suga","agustd","minyoongi","閔玧其","玧其","민윤기","윤기","슈가"],["j-hope","jhope","hobi","junghoseok","鄭號錫","號錫","정호석","호석","제이홉"],["Jimin","jimin","parkjimin","朴智旻","智旻","박지민","지민"],["V","v","taehyung","kimtaehyung","金泰亨","泰亨","김태형","태형","뷔"],["Jungkook","jungkook","jk","jeonjungkook","田柾國","柾國","전정국","정국"]].forEach(a=>a.slice(1).forEach(k=>MEM_AL[k]=a[0]));
function memOf(x){const v=String(x.m||"").trim();if(!v)return"";return MEM_AL[v.toLowerCase().replace(/[\s\-_.·]/g,"")]||v}
function memWall(B){const ex=[];B.forEach(x=>{const m=memOf(x);if(!SOLO_M.includes(m)&&!ex.includes(m))ex.push(m)});
return SOLO_M.concat(ex).map((m,i)=>{const mc=typeof FT_MC!=="undefined"&&FT_MC[m]||"#2f7be0",S=B.filter(x=>memOf(x)===m),al=[...new Set(S.map(albOf))],n=S.length,c=(MEMBER_COVERS[m]||"").trim()||(al.length?albCover(al[0]):"");
return `<button type="button" class="alb${n?"":" past"}" data-mb="${esc(m)}" style="--mc:${mc}"${n?"":" disabled"}><span class="cv" data-no="${String(i+1).padStart(2,"0")}"><span class="ph" style="--h:${albHue(m)}">${esc(m)}</span>${c?`<img src="${esc(c)}" alt="" loading="lazy" onerror="this.remove()">`:""}</span><b>${esc(m)}</b>${n?`<span class="n">${al.length} 張專輯</span><span class="n">${n} 首歌</span>`:`<span class="n soon">即將收錄</span>`}</button>`}).join("")}
try{[["依成員","By member","멤버별","メンバー別"],["依專輯／依成員／依演唱會","By album / By member / By concert","앨범별 / 멤버별 / 콘서트별","アルバム別 / メンバー別 / コンサート別"],["切換分類：依專輯看每張專輯的歌，依成員看各成員的個人專輯，依演唱會看每一場的演出歌單，歌名前面的編號是演出順序。","Switch the grouping: by album, by member for each member's solo albums, or by concert to see each show's setlist. The number before a song is its show order.","분류를 전환해요. 앨범별은 앨범의 곡, 멤버별은 멤버의 솔로 앨범, 콘서트별은 공연별 셋리스트이며 곡명 앞 번호가 공연 순서예요.","分類を切り替えます。アルバム別はアルバムの曲、メンバー別は各メンバーのソロアルバム、コンサート別は公演ごとのセットリストで、曲名の前の番号は演奏順です。"],["← 全部成員","← All members","← 전체 멤버","← 全メンバー"],["即將收錄","Coming soon","수록 예정","収録予定"]].forEach(a=>window.I18N&&I18N.add(a[0],a[1],a[2],a[3]))}catch(e){}
function songsR(){const box=document.getElementById("slist"),tabs=document.getElementById("stabs"),wall=document.getElementById("swall"),view=document.getElementById("sview");if(!box)return;songStop();try{sessionStorage.setItem("song-alb",ALB);sessionStorage.setItem("song-mem",MEM)}catch(e){}
const kw=(document.getElementById("sq").value||"").trim().toLowerCase();
const SOLO=VIEW==="m",ABASE=SONGS.filter(x=>SOLO?(MEM?memOf(x)===MEM:!!memOf(x)):!memOf(x));
const AL=[];ABASE.forEach(x=>{const a=albOf(x);if(!AL.includes(a))AL.push(a)});
AL.sort((a,b)=>{const x=albTime(a),y=albTime(b),fx=isFinite(x),fy=isFinite(y);if(fx&&fy)return ALBUM_ORDER==="old"?x-y:y-x;return fx?-1:fy?1:0});
const CL=[],CN={};SONGS.forEach(x=>songCons(x).forEach(c=>{CN[c.n]=(CN[c.n]||0)+1;if(!CL.includes(c.n))CL.push(c.n)}));
if(window.SETLISTS&&typeof SETLISTS==="object")CL.sort((a,b)=>{const k=Object.keys(SETLISTS),x=k.indexOf(a),y=k.indexOf(b);return(x<0?1e3:x)-(y<0?1e3:y)});
CL.sort((a,b)=>{const x=conTime(a),y=conTime(b),fx=isFinite(x),fy=isFinite(y);if(fx&&fy)return CONCERT_ORDER==="new"?y-x:x-y;return fx?-1:fy?1:0});
const GR=[],GM={};CL.forEach(n=>{const k=conKey(n)||n;if(!GM[k]){GM[k]={k,d:[]};GR.push(GM[k])}GM[k].d.push(n)});GR.forEach(g=>{g.d=conChrono(g.d)});
const SV=VIEW==="s"&&CL.length>0,G=SV?CL:AL,LB=SV||(kw&&!SOLO)?SONGS:ABASE;
if(ALB&&!G.includes(ALB))ALB="";
{const sd=document.getElementById("sdays");if(sd){const g=SV&&ALB?GM[conKey(ALB)||ALB]:null;if(g&&g.d.length>1){sd.hidden=false;sd.innerHTML=`<b class="sdn">${esc(g.k)}</b>`+g.d.map(n=>`<button type="button" class="chip" data-d="${esc(n)}" aria-pressed="${n===ALB}">${esc(conLab(n))}</button>`).join("")}else{sd.hidden=true;sd.innerHTML=""}}}
{const g=document.getElementById("svt");g.hidden=false;const cv=SV?"s":SOLO?"m":"a";g.querySelectorAll("[data-v]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.v===cv)))}
const wallOn=!ALB&&!kw;wall.hidden=!wallOn;view.hidden=wallOn;wall.classList.toggle("mw",SOLO&&!MEM);
{const sb=document.getElementById("sback");sb.hidden=!(ALB||kw||(SOLO&&MEM));const tx=SV?"← 全部演唱會":SOLO&&MEM&&!ALB&&!kw?"← 全部成員":"← 全部專輯";if(sb.dataset.t!==tx){sb.textContent=tx;sb.dataset.t=tx}}
if(wallOn){document.getElementById("sn").textContent=G.length||SOLO?(SV?SONGS.filter(x=>songCons(x).length).length:ABASE.length)+" 首歌":"";
wall.innerHTML=SOLO&&!MEM?memWall(ABASE):G.length?(SV?cdBanner(G):"")+(SV&&predUrl()?predBar():"")+(SV?GR:AL).map(g=>{const ds=SV?g.d:null,a=SV?conOpenDay(ds):g,nm=SV?g.k:a,n=SV?conSongsOf(ds).length:ABASE.filter(x=>albOf(x)===a).length,c=SV?conCoverG(ds):albCover(a),pg=SV?gProgG(ds):null;return `<button type="button" class="alb${SV&&cdDaysG(ds)<0?" past":""}" data-a="${esc(a)}"><span class="cv"><span class="ph" style="--h:${albHue(nm)}">${esc(nm)}</span>${c?`<img src="${esc(c)}" alt="" loading="lazy" onerror="this.remove()">`:""}</span><b>${esc(nm)}</b><span class="n">${n} 首歌</span>${SV&&ds.length>1?`<span class="n">${ds.length} 場</span>`:""}${pg&&pg.n?(pg.k>=pg.n?`<span class="gp full">全曲通關</span>`:`<span class="gp"><em>通關</em> ${pg.k}/${pg.n}</span>`):""}${SV?cdTagG(ds):""}</button>`}).join(""):`<div class="empty">還沒有收錄歌曲</div>`;
box.innerHTML="";tabs.innerHTML="";return}
const L=LB.filter(x=>(SV?(ALB?songCons(x).some(c=>c.n===ALB):songCons(x).length>0):(!ALB||albOf(x)===ALB))&&(!kw||(x.t+(x.a||"")+(x.c||"")+" "+songCons(x).map(c=>c.n).join(" ")).toLowerCase().includes(kw)));if(SV&&ALB){const o=x=>songCons(x).find(c=>c.n===ALB).o;L.sort((a,b)=>o(a)-o(b))}else if(!SV&&ALB){const o=x=>{const n=parseFloat(x.tn);return isFinite(n)?n:SORTMAX};L.sort((a,b)=>o(a)-o(b))}
document.getElementById("sn").textContent=L.length+" 首歌";
{const pr=document.getElementById("sprog");if(pr){const g=SV&&ALB?gProg(ALB):null;if(g&&g.n){pr.hidden=false;pr.innerHTML=gProgHTML(g)}else pr.hidden=true}}
const CDF=SV&&ALB?conDiff(ALB,CL):{html:"",only:new Set()};
{const df=document.getElementById("sdiff");if(df){df.hidden=!CDF.html;df.innerHTML=CDF.html}}
if(!L.length){tabs.innerHTML="";box.innerHTML=`<div class="empty">${kw?"找不到符合的歌曲":"還沒有收錄歌曲"}</div>`;return}
if(!L.some(x=>x.t===SEL))SEL=L[0].t;
{const ci=Math.max(0,L.findIndex(x=>x.t===SEL)),nm=(x,i)=>(SV&&ALB?(i+1)+". ":"")+esc(x.t),gb=x=>(gBest()[x.t]||{}).g||"";
tabs.innerHTML=`<div class="snav"><button type="button" class="sbtn" data-sn="-1" aria-label="上一首" title="上一首"${ci<=0?" disabled":""}>←</button><select id="ssel" aria-label="選擇歌曲">${L.map((x,i)=>`<option value="${esc(x.t)}"${i===ci?" selected":""}>${nm(x,i)}${gb(x)?" ・ "+gb(x):""}</option>`).join("")}</select><button type="button" class="sbtn" data-sn="1" aria-label="下一首" title="下一首"${ci>=L.length-1?" disabled":""}>→</button></div>`+L.map((x,i)=>`<button type="button" class="chip" data-t="${esc(x.t)}" aria-pressed="${x.t===SEL}">${nm(x,i)}${gb(x)?`<em class="gsg">${gb(x)}</em>`:""}${CDF.only.has(x.t)?`<em class="odn">僅此場</em>`:""}</button>`).join("")}
{const x=L.find(x=>x.t===SEL);box.innerHTML=songCard(x);fsApply();ktvFit();srAlign();songPlayer(navigator.onLine===false?"":songVid(x));try{gameInit(x)}catch(e){}}}
const pickSong=v=>{SEL=v;try{localStorage.setItem("song-sel",SEL)}catch(x){}songsR()};
document.getElementById("stabs").addEventListener("change",e=>{if(!e.target.closest("#ssel"))return;pickSong(e.target.value);const s=document.getElementById("ssel");if(s)s.focus()});
document.getElementById("stabs").addEventListener("click",e=>{const b=e.target.closest("[data-sn]");if(!b||b.disabled)return;const s=document.getElementById("ssel");if(!s)return;const i=s.selectedIndex+ +b.dataset.sn;if(i<0||i>=s.options.length)return;pickSong(s.options[i].value);const nb=document.querySelector('#stabs [data-sn="'+b.dataset.sn+'"]');(nb&&!nb.disabled?nb:document.getElementById("ssel")).focus()});
document.getElementById("stabs").addEventListener("click",e=>{const b=e.target.closest(".chip");if(!b)return;SEL=b.dataset.t;try{localStorage.setItem("song-sel",SEL)}catch(x){}songsR()});
document.getElementById("swall").addEventListener("click",e=>{if(e.target.closest("[data-pr]"))predOpen()});
document.getElementById("swall").addEventListener("click",e=>{const b=e.target.closest(".alb");if(!b)return;const w=document.getElementById("swall");if(w.classList.contains("leaving"))return;
const go=()=>{w.classList.remove("leaving");b.classList.remove("pick");if(b.dataset.mb!==undefined)MEM=b.dataset.mb;else ALB=b.dataset.a;songsR();window.scrollTo(0,0)};
let rm=false;try{rm=matchMedia("(prefers-reduced-motion:reduce)").matches}catch(x){}
if(rm){go();return}
w.classList.add("leaving");b.classList.add("pick");setTimeout(go,280)});
document.getElementById("sback").addEventListener("click",()=>{const q=document.getElementById("sq");if(VIEW==="m"&&MEM&&!ALB&&!q.value.trim())MEM="";else ALB="";q.value="";songsR();window.scrollTo(0,0)});
document.getElementById("svt").addEventListener("click",e=>{const b=e.target.closest("[data-v]");if(!b)return;VIEW=b.dataset.v;ALB="";MEM="";try{sessionStorage.setItem("song-view",VIEW)}catch(x){}songsR();window.scrollTo(0,0)});
document.getElementById("sdays").addEventListener("click",e=>{const b=e.target.closest("[data-d]");if(!b||b.dataset.d===ALB)return;ALB=b.dataset.d;songsR()});
document.getElementById("sq").addEventListener("input",songsR);
if(sec==="songs")songsR();

/* KTV 模式：「連結」欄放 YouTube 網址；空耳／應援法的每一行前面加時間碼，例如「0:07 [藍] Kim Namjoon!」，沒時間碼的行只出現在一般模式。唱段小人：時間碼後面加 @成員，例如「0:07 @Jimin,V [紅] 歌詞」，@全員 ＝ 七人 */
/* 歌曲也可以從試算表讀取：在 data.js 設定 SONGS_CSV_URL（歌曲分頁發布成 CSV 的網址），欄位：歌名、專輯／場次、空耳、應援法、連結。讀不到就用上面的 SONGS */
function songsParse(t){const R=SheetLoader.csv(t);if(R.length<2)return[];
const M={"歌名":"t","專輯":"a","場次":"a","專輯／場次":"a","應援":"c","應援法":"c","連結":"u","KTV連結":"k","KTV":"k","官方應援歌詞連結":"o","官方應援歌詞":"o","官方歌詞連結":"o","官方歌詞":"o","封面":"p","專輯封面":"p","封面圖":"p","演唱會":"s","演唱會歌單":"s","巡演":"s","曲序":"tn","專輯曲序":"tn","曲目順序":"tn","演唱會封面":"cc","演唱會封面圖":"cc","發行日":"rd","發行日期":"rd","發售日":"rd","發行":"rd","演唱會日期":"cd","演唱會舉辦日":"cd","舉辦日":"cd","舉辦日期":"cd","成員":"m","歌手":"m","Solo成員":"m","solo成員":"m","Solo 成員":"m"};
const hd=R[0].map(x=>M[x.trim()]||"");
return R.slice(1).map(r=>{const o={};hd.forEach((k,j)=>{if(k&&!o[k])o[k]=String(r[j]||"").trim()});return o}).filter(o=>o.t)}
function covPre(){if(navigator.onLine===false)return;try{const seen=new Set();[...new Set(SONGS.map(albOf))].forEach(n=>{const c=albCover(n);if(c&&!/^https?:/i.test(c)&&!seen.has(c)){seen.add(c);fetch(c).catch(()=>{})}})}catch(e){}}
function songsSet(L){SONGS.length=0;L.forEach(x=>SONGS.push(x));songsR();covPre()}
async function songsLoad(){if(typeof SONGS_CSV_URL!=="string"||!SONGS_CSV_URL)return;
try{const c=localStorage.getItem("songs-cache");if(c){const L=songsParse(c);if(L.length)songsSet(L)}}catch(e){}
try{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);
const r=await fetch(SONGS_CSV_URL+(SONGS_CSV_URL.includes("?")?"&":"?")+"t="+Date.now(),{signal:ac.signal});clearTimeout(tm);
if(!r.ok)throw 0;const txt=await r.text();const L=songsParse(txt);if(!L.length)throw 0;
try{localStorage.setItem("songs-cache",txt)}catch(e){}songsSet(L)}catch(e){}}
songsLoad();
try{[["歌單差異","Setlist differences","세트리스트 차이","セットリストの違い"],["對照","Compared with","비교 대상","比較"],["只在這場","Only in this show","이번 공연에만","この公演のみ"],["只在","Only in","에만","のみ"],["歌單完全相同","Identical setlists","세트리스트가 동일해요","セットリストは同じです"],["僅此場","Only here","단독","限定"]].forEach(a=>window.I18N&&I18N.add(a[0],a[1],a[2],a[3]));window.I18N&&I18N.refresh()}catch(e){}
function offSync(){const b=document.getElementById("offb");if(b)b.hidden=navigator.onLine!==false}
covPre();offSync();addEventListener("online",()=>{offSync();if(sec==="songs")songsR()});addEventListener("offline",()=>{offSync();if(sec==="songs")songsR()});
/* 回到頂端 */
{const t=document.getElementById("top");if(t){const f=()=>t.classList.toggle("on",window.scrollY>400);window.addEventListener("scroll",f,{passive:true});f();t.addEventListener("click",()=>{const r=matchMedia("(prefers-reduced-motion:reduce)").matches;window.scrollTo({top:0,behavior:r?"auto":"smooth"})})}}

/* 儲存集章簿圖片（9:16） */
if(window.CanvasRenderingContext2D&&!CanvasRenderingContext2D.prototype.roundRect)CanvasRenderingContext2D.prototype.roundRect=function(x,y,w,h){this.rect(x,y,w,h)};
const PAL={o:"#0b2a5b",b:"#2f7be0",c:"#9fd6ff",w:"#fff",y:"#ffd23f",r:"#e0245e",g:"#9aa3c7",k:"#8a5a2b"};
const PIX={
mega:["....o.y.","...obo.y","oobbbo..","obbbbo.y","oobbbo..",".ooobo.y","..oo.o..","........"],
truck:["........","oooooo..","obbbboo.","obbbbowo","oooooooo",".oo..oo.",".oo..oo.","........"],
bus:["oooooooo","occoccco","occoccco","oooooooo","obbbbbbo","oooooooo",".oo..oo.",".oo..oo."],
tv:[".o....o.","..o..o..","oooooooo","occccbbo","occccbbo","occccbbo","oooooooo",".o....o."],
cafe:["..w..w..","...w..w.","oooooo..","okkkkoo.","okkkko.o","okkkkoo.",".oooo...","oooooo.."],
sign:["oooooooo","obccccbo","obcyycbo","obccccbo","oooooooo","...oo...","...oo...","..oooo.."],
shop:["..oooo..",".o....o.",".o....o.","oooooooo","orrrrrro","orrwwrro","orrrrrro","oooooooo"],
expo:["oooooooo","occccyco","occcyyco","occcyyco","occggcco","ocggggco","oooooooo",".o....o."]};
async function saveCard(){
const bd=sec==="birthday",L=bookItems().filter(d=>!bd||mem==="全部"||d.member===mem),n=L.length;if(!n)return;
try{await Promise.all([document.fonts.load('700 40px "Noto Sans TC"'),document.fonts.load('500 40px "Noto Sans TC"'),document.fonts.load('40px "DotGothic16"')])}catch(e){}
const F='"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif',PF='"DotGothic16",'+F,W=1080,H=1920,P=56;
const cs=getComputedStyle(document.documentElement),V=(n,d)=>cs.getPropertyValue(n).trim()||d;
const C={bg:V("--bg","#e6f5ff"),card:V("--card","#fff"),ink:V("--ink","#0b2a5b"),sub:V("--sub","#4a6a96"),line:V("--line","#b9dcf5"),dark:V("--dark","#0b4fa8"),ok:V("--pur","#7b4fd6"),okbg:V("--purbg","#efe7ff"),pill:V("--pill","#d6edff")},HB="#062a6e";
const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
const cnt={};L.forEach(d=>cnt[d.title]=(cnt[d.title]||0)+1);
const name=d=>cnt[d.title]>1?(d.dates.length===1?d.title+" "+d.dates[0]:d.title+"（"+String(d.place||"").split("（")[0]+"）"):d.title;
const k=L.filter(d=>done.has(d.id)).length,pct=Math.round(k/n*100);
x.fillStyle=C.bg;x.fillRect(0,0,W,H);
x.globalAlpha=.55;x.fillStyle=C.line;for(let gy=430;gy<H;gy+=48)for(let gx=24;gx<W;gx+=48)x.fillRect(gx,gy,5,5);x.globalAlpha=1;
{const hx=24,hy=24,hw=W-48,hh=356;x.fillStyle="rgba(6,42,110,.35)";x.fillRect(hx+10,hy+10,hw,hh);
const g=x.createLinearGradient(0,hy,0,hy+hh);g.addColorStop(0,"#2a8cff");g.addColorStop(1,"#0a4fb8");x.fillStyle=g;x.fillRect(hx,hy,hw,hh);
x.fillStyle="rgba(255,255,255,.28)";[[700,60,12],[820,130,8],[940,84,10],[620,170,6],[990,170,8],[760,330,8]].forEach(([a,b,r])=>{x.fillRect(a-r/2,b-r*1.5,r,r*3);x.fillRect(a-r*1.5,b-r/2,r*3,r)});
x.lineWidth=6;x.strokeStyle=HB;x.strokeRect(hx+3,hy+3,hw-6,hh-6)}
const bk="ARMY 應援護照",tag=bd?bk+" · "+bookReg():"ARIRANG in "+((CITIES[city]||{}).en||""),ttl=bd?"HAPPY "+(mem==="全部"?"BTS":String(mem).toUpperCase())+" DAY":bk;
x.textBaseline="middle";x.font="400 36px "+PF;const tw=x.measureText(tag).width+56;
x.fillStyle="rgba(6,40,110,.45)";x.fillRect(P,68,tw,64);x.lineWidth=4;x.strokeStyle="rgba(255,255,255,.6)";x.strokeRect(P+2,70,tw-4,60);
x.fillStyle="#fff";x.fillText(tag,P+28,101);
let tp=92;x.font="400 "+tp+"px "+PF;const mw0=W-2*P-250;if(x.measureText(ttl).width>mw0){tp=Math.floor(tp*mw0/x.measureText(ttl).width);x.font="400 "+tp+"px "+PF}
x.fillStyle="rgba(6,40,110,.55)";x.fillText(ttl,P+4,234);x.fillStyle="#fff";x.fillText(ttl,P,230);
x.font="400 48px "+PF;x.fillStyle="#d6edff";x.fillText("已打卡 "+k+" / "+n+" 個應援",P,314);
{const bw2=200,bx2=W-P-bw2+10,by2=115;x.fillStyle="rgba(6,42,110,.45)";x.fillRect(bx2+8,by2+8,bw2,bw2);
x.fillStyle=C.card;x.fillRect(bx2,by2,bw2,bw2);x.lineWidth=8;x.strokeStyle=pct===100?"#f2b600":HB;x.strokeRect(bx2+4,by2+4,bw2-8,bw2-8);
x.textAlign="center";x.fillStyle=C.ink;x.font="400 72px "+PF;x.fillText(pct+"%",bx2+bw2/2,by2+bw2/2-14);
x.font="400 30px "+PF;x.fillStyle=C.sub;x.fillText(pct===100?"全部集滿":"完成度",bx2+bw2/2,by2+bw2/2+52);x.textAlign="left"}
const top=430,bot=1700,cols=n>22?2:1,per=Math.ceil(n/cols),cw=(W-2*P)/cols,rh=Math.min(100,(bot-top)/per);
const fs0=Math.max(26,Math.min(44,Math.round(rh*.48))),fs=cols>1?Math.max(20,Math.min(fs0,Math.floor((rh-26)/2.3))):fs0,ic=Math.round(rh*.78);
const wrapN=(t,mw,mx)=>{const ch=Array.from(t),o=[];let i=0;while(i<ch.length&&o.length<mx){let j=i;while(j<ch.length&&x.measureText(ch.slice(i,j+1).join("")).width<=mw)j++;if(j===i)j=i+1;let nx=j,line;if(j>=ch.length){line=ch.slice(i).join("");nx=ch.length}else if(o.length===mx-1){line=ch.slice(i,j).join("");while(line.length>1&&x.measureText(line+"…").width>mw)line=line.slice(0,-1);line+="…";nx=ch.length}else{let b=-1;for(let q=j-1;q>i;q--){if(ch[q]===" "||ch[q]==="（"||ch[q]==="("){b=q;break}}if(b>i+(j-i)*.4){line=ch.slice(i,b).join("");nx=ch[b]===" "?b+1:b}else line=ch.slice(i,j).join("")}o.push(line.trim());i=nx}return o};
L.forEach((d,i)=>{const col=Math.floor(i/per),row=i%per,ox=P+col*cw,cy=top+row*rh+rh/2,dn=done.has(d.id);
const cwid=cw-(cols>1?12:0),chh=rh-12,cxx=ox-16,cyy=cy-chh/2;
x.globalAlpha=dn?1:.62;x.fillStyle=C.line;x.fillRect(cxx+6,cyy+6,cwid,chh);
x.fillStyle=dn?C.okbg:C.card;x.fillRect(cxx,cyy,cwid,chh);x.lineWidth=4;x.strokeStyle=dn?C.ok:C.dark;x.strokeRect(cxx+2,cyy+2,cwid-4,chh-4);
x.globalAlpha=dn?1:.55;
const bx=ox,by=cy-ic/2;
if(!dn){x.fillStyle=C.card;x.fillRect(bx,by,ic,ic);x.lineWidth=5;x.strokeStyle=C.line;x.setLineDash([12,10]);x.strokeRect(bx+2.5,by+2.5,ic-5,ic-5);x.setLineDash([])}
if(dn){x.fillStyle=C.card;x.fillRect(bx,by,ic,ic);x.lineWidth=Math.max(4,ic*.08);x.strokeStyle=C.ok;x.strokeRect(bx+2,by+2,ic-4,ic-4);
const u=ic/10;x.fillStyle=C.ok;[[2,5],[3,6],[4,7],[5,6],[6,5],[7,4],[8,3]].forEach(([px,py])=>x.fillRect(bx+px*u-u*.5,by+py*u-u*1.4,u,u*1.5));
x.fillRect(bx+u*1.2,by+u*1.2,u*.7,u*.7);x.fillRect(bx+ic-u*1.9,by+ic-u*1.9,u*.7,u*.7)}
else if(stat(d)==="已結束"){x.fillStyle="#9aa3c7";const u=ic*.11;for(let j=0;j<5;j++){x.fillRect(bx+ic*.2+j*u*1.1,by+ic*.2+j*u*1.1,u*1.1,u*1.1);x.fillRect(bx+ic*.8-u*1.1-j*u*1.1,by+ic*.2+j*u*1.1,u*1.1,u*1.1)}}
x.font="400 "+fs+"px "+PF;x.fillStyle=C.ink;x.textBaseline="middle";
const ty=String(d.type||""),em=ty.includes("廣告車")?"truck":ty.includes("公車")?"bus":ty.includes("電視牆")?"tv":ty.includes("燈箱")||ty.includes("看板")?"sign":ty.includes("咖啡")?"cafe":ty.includes("快閃")?"shop":ty.includes("展覽")?"expo":ty.includes("企劃")?"mega":"",pu=Math.max(2,Math.floor(fs0*.95/8)),ew=em?pu*8+16:0;
const dts=dn&&dd[d.id]?dd[d.id]:"";let dw=0;if(dts){x.font="400 "+Math.max(24,Math.round(fs*.78))+"px "+PF;dw=x.measureText(dts).width+28}
x.font="400 "+fs+"px "+PF;
let t=name(d);const mw=cw-ic-52-(cols>1?24:0)-dw-ew;let lines=[t];
if(x.measureText(t).width>mw){const f=Math.max(20,Math.min(fs,Math.floor((chh-14)/2.3)));x.font="400 "+f+"px "+PF;lines=wrapN(t,mw,2)}
if(lines.length>1){const lh=Math.round(parseInt(x.font.replace(/^\D*/,""))*1.18);lines.forEach((ln,li)=>x.fillText(ln,bx+ic+20+ew,cy+2+(li?lh/2:-lh/2)))}else x.fillText(lines[0],bx+ic+20+ew,cy+2);if(em){const g=PIX[em],px0=bx+ic+20,py0=Math.round(cy-pu*4);g.forEach((row,ry)=>{for(let rx=0;rx<8;rx++){const ch=row[rx];if(ch!=="."&&PAL[ch]){x.fillStyle=PAL[ch];x.fillRect(px0+rx*pu,py0+ry*pu,pu,pu)}}})}
if(dts){const f2=Math.max(24,Math.round(fs*.78)),pw=dw-4,ph=f2+16,px=cxx+cwid-pw-14,py=cy-ph/2;x.fillStyle=C.ok;x.fillRect(px,py,pw,ph);x.fillStyle=C.card;x.font="400 "+f2+"px "+PF;x.textAlign="center";x.fillText(dts,px+pw/2,cy+2);x.textAlign="left"}
x.globalAlpha=1});
const fy=1772,fw=W-2*P;x.fillStyle=C.line;x.fillRect(P+6,fy+6,fw,32);x.fillStyle=C.pill;x.fillRect(P,fy,fw,32);
if(pct>0){x.fillStyle=C.ok;x.fillRect(P,fy,Math.max(24,fw*pct/100),32);x.fillStyle=C.pill;for(let gx=P+24;gx<P+fw*pct/100;gx+=24)x.fillRect(gx,fy,4,32)}
x.lineWidth=4;x.strokeStyle=C.dark;x.strokeRect(P+2,fy+2,fw-4,28);
x.fillStyle=C.sub;x.font="400 40px "+PF;x.textBaseline="alphabetic";x.fillText("完成 "+pct+"%",P,1870);
x.textAlign="right";x.fillText("BTS 應援地圖",W-P,1870);x.textAlign="left";
c.toBlob(b=>{if(!b){toast("儲存失敗，請再試一次");return}stampShow(b)},"image/png")}
/* 集章圖：先顯示圖片，再按按鈕叫出手機內建分享選單（可選社群或「儲存影像」）；不支援分享的瀏覽器改成下載，長按圖片也能存 */
function stampShow(b){
const url=URL.createObjectURL(b),file=new File([b],"stamp-book.png",{type:"image/png"});
let can=false;try{can=!!(navigator.canShare&&navigator.canShare({files:[file]}))}catch(e){}
const old=document.getElementById("stampPv");if(old)old.remove();
const o=document.createElement("div");o.id="stampPv";o.setAttribute("role","dialog");o.setAttribute("aria-label","應援集章圖片");
o.innerHTML='<div class="spv-box"><img src="'+url+'" alt="應援集章"><p class="spv-tip">長按圖片也可以直接儲存</p><div class="spv-act"><button type="button" class="btn main" data-a="go">'+(can?"分享／儲存":"下載圖片")+'</button><button type="button" class="btn" data-a="x">關閉</button></div></div>';
const close=()=>{o.remove();document.removeEventListener("keydown",esc);setTimeout(()=>URL.revokeObjectURL(url),4000)},esc=e=>{if(e.key==="Escape")close()};
o.addEventListener("click",async e=>{const t=e.target.closest("[data-a]");
if(e.target===o||(t&&t.dataset.a==="x")){close();return}
if(t&&t.dataset.a==="go"){
if(can){try{await navigator.share({files:[file],title:"應援集章"})}catch(x){}}
else{const a=document.createElement("a");a.href=url;a.download="stamp-book.png";document.body.appendChild(a);a.click();a.remove();toast("已儲存圖片")}}});
document.addEventListener("keydown",esc);document.body.appendChild(o)}
document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest("#saveImg"))saveCard()});
/* 像素風確認視窗，取代瀏覽器內建的 confirm() */
function pxConfirm(msg,okText,noText){return new Promise(res=>{const [a,...r]=String(msg).split("\n"),o=document.createElement("div");o.className="pxc";o.setAttribute("role","alertdialog");o.setAttribute("aria-modal","true");
const box=document.createElement("div");box.className="pxc-box";
const ic=document.createElement("div");ic.className="pxc-ic";ic.setAttribute("aria-hidden","true");ic.textContent="!";
const t=document.createElement("div");t.className="pxc-t";t.textContent=a;box.append(ic,t);
if(r.length){const q=document.createElement("div");q.className="pxc-s";q.textContent=r.join(" ");box.appendChild(q)}
const bs=document.createElement("div");bs.className="pxc-b";const no=document.createElement("button"),ok=document.createElement("button");no.type=ok.type="button";no.className="btn";ok.className="btn main";no.textContent=noText||"取消";ok.textContent=okText||"確定";bs.append(no,ok);box.appendChild(bs);o.appendChild(box);
const fin=v=>{document.removeEventListener("keydown",kd,true);o.remove();res(v)},kd=e=>{if(e.key==="Escape"){e.preventDefault();fin(false)}};
no.addEventListener("click",()=>fin(false));ok.addEventListener("click",()=>fin(true));o.addEventListener("click",e=>{if(e.target===o)fin(false)});
document.addEventListener("keydown",kd,true);document.body.appendChild(o);no.focus()})}
document.addEventListener("click",async e=>{const t=e.target.closest&&e.target.closest("#allOn,#allOff");if(!t)return;const L=bookItems();
if(t.id==="allOn"){const n=new Date(),ds=(n.getMonth()+1)+"/"+n.getDate();let c=0;L.forEach(d=>{if(done.has(d.id)||stat(d)==="已結束"||(d.chg&&/^取消/.test(d.chg)))return;done.add(d.id);dd[d.id]=ds;ddT[d.id]=tmNow();c++});if(!c){toast("沒有可打卡的項目");return}
wr("kh-done",done);try{localStorage.setItem("kh-donedate",JSON.stringify(dd))}catch(x){}tmSave();render();toast("已一鍵打卡 "+c+" 個")}
else{const c=L.filter(d=>done.has(d.id));if(!c.length){toast("目前沒有已打卡的項目");return}if(!await pxConfirm("確定要取消全部打卡（"+c.length+" 個）？\n相關的打卡徽章也會一併收回。\nClear all "+c.length+" check-ins? Related badges will be revoked too.","確定取消","保留"))return;c.forEach(d=>{done.delete(d.id);delete dd[d.id];delete ddT[d.id]});
wr("kh-done",done);try{localStorage.setItem("kh-donedate",JSON.stringify(dd))}catch(x){}tmSave();render();toast("已取消全部打卡")}});
try{[["✔ 一鍵打卡","✔ Check in all","✔ 한 번에 체크인","✔ ワンタップで全部チェックイン"],["↺ 取消全部打卡","↺ Clear all check-ins","↺ 체크인 전체 취소","↺ チェックインを全部取り消す"],["沒有可打卡的項目","Nothing to check in","체크인할 항목이 없어요","チェックインできる項目がありません"],["目前沒有已打卡的項目","No check-ins to clear","취소할 체크인이 없어요","取り消せるチェックインはありません"],["已取消全部打卡","All check-ins cleared","체크인을 모두 취소했어요","チェックインを全部取り消しました"],["上一首","Previous song","이전 곡","前の曲"],["下一首","Next song","다음 곡","次の曲"],["顏色說明","Color guide","색상 안내","色の見方"],["藍色＝大聲喊","Blue = shout loud","파랑 = 크게 외치기","青＝大声で叫ぶ"],["紅色＝跟著唱","Red = sing along","빨강 = 따라 부르기","赤＝一緒に歌う"]].forEach(a=>window.I18N&&I18N.add(a[0],a[1],a[2],a[3]));window.I18N&&I18N.refresh()}catch(e){}

function eq(){const L=[...document.querySelectorAll("#list .card")],K=[".hd",".box",".act"];L.forEach(c=>K.forEach(k=>{const e=c.querySelector(k);if(e)e.style.minHeight=""}));if(innerWidth<720)return;
/* 先把每列要用的高度全部量完，再一次寫入：避免「量一列、改一列」造成整頁反覆重排而卡頓 */
const g={};L.forEach(c=>{(g[c.offsetTop]=g[c.offsetTop]||[]).push(c)});const W=[];
for(const k of K)Object.values(g).forEach(a=>{const E=a.map(c=>c.querySelector(k)).filter(Boolean);if(E.length)W.push([E,Math.max(...E.map(e=>e.offsetHeight))])});
W.forEach(([E,m])=>E.forEach(e=>e.style.minHeight=m+"px"))}
new MutationObserver(()=>requestAnimationFrame(eq)).observe(document.getElementById("list"),{childList:true});
addEventListener("resize",eq);addEventListener("load",eq);document.fonts&&document.fonts.ready.then(eq);

/* ===== 藝人同款足跡：資料在 data.js 的 FOOTPRINTS；「我去過了」只存在這個瀏覽器的 localStorage（fp-visited） ===== */
var fpMem="全部",fpCat="全部",fpOnly=false,fpQ="",fpCt="",fpCity="";
try{const o=JSON.parse(sessionStorage.getItem("fp-state")||"{}");if(o.ct)fpCt=String(o.ct);if(o.city)fpCity=String(o.city);if(o.mem)fpMem=String(o.mem);if(o.cat)fpCat=String(o.cat);fpOnly=false;if(o.q)fpQ=String(o.q)}catch(e){}
window.__fpReady=1;
const FPF={"韓國":"🇰🇷","日本":"🇯🇵","台灣":"🇹🇼","美國":"🇺🇸","英國":"🇬🇧","法國":"🇫🇷","泰國":"🇹🇭","香港":"🇭🇰","新加坡":"🇸🇬","澳洲":"🇦🇺","德國":"🇩🇪","義大利":"🇮🇹","西班牙":"🇪🇸","加拿大":"🇨🇦","越南":"🇻🇳","菲律賓":"🇵🇭","印尼":"🇮🇩","馬來西亞":"🇲🇾","中國":"🇨🇳","沙烏地阿拉伯":"🇸🇦","阿拉伯聯合大公國":"🇦🇪"};
/* 像素風國旗（21×14）：目前有韓國、日本、台灣、香港；其他國家先用 emoji，要新增就在 FPX 補一個同名的 svg */
const FPX={"韓國": "<svg class=\"fpf\" viewBox=\"0 0 21 14\" shape-rendering=\"crispEdges\" aria-hidden=\"true\"><rect x=\"0\" y=\"0\" width=\"21\" height=\"14\" fill=\"#ffffff\"/><rect x=\"9\" y=\"4\" width=\"3\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"8\" y=\"5\" width=\"5\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"7\" y=\"6\" width=\"4\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"11\" y=\"6\" width=\"3\" height=\"1\" fill=\"#1f3a8a\"/><rect x=\"7\" y=\"7\" width=\"3\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"10\" y=\"7\" width=\"4\" height=\"1\" fill=\"#1f3a8a\"/><rect x=\"8\" y=\"8\" width=\"5\" height=\"1\" fill=\"#1f3a8a\"/><rect x=\"9\" y=\"9\" width=\"3\" height=\"1\" fill=\"#1f3a8a\"/><rect x=\"1\" y=\"1\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"1\" y=\"3\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"1\" y=\"5\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"1\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"18\" y=\"1\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"3\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"5\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"18\" y=\"5\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"1\" y=\"8\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"1\" y=\"10\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"4\" y=\"10\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"1\" y=\"12\" width=\"5\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"8\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"18\" y=\"8\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"10\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"18\" y=\"10\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"15\" y=\"12\" width=\"2\" height=\"1\" fill=\"#222\"/><rect x=\"18\" y=\"12\" width=\"2\" height=\"1\" fill=\"#222\"/></svg>", "日本": "<svg class=\"fpf\" viewBox=\"0 0 21 14\" shape-rendering=\"crispEdges\" aria-hidden=\"true\"><rect x=\"0\" y=\"0\" width=\"21\" height=\"14\" fill=\"#ffffff\"/><rect x=\"8\" y=\"3\" width=\"5\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"7\" y=\"4\" width=\"7\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"6\" y=\"5\" width=\"9\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"6\" y=\"6\" width=\"9\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"6\" y=\"7\" width=\"9\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"6\" y=\"8\" width=\"9\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"7\" y=\"9\" width=\"7\" height=\"1\" fill=\"#e03a3e\"/><rect x=\"8\" y=\"10\" width=\"5\" height=\"1\" fill=\"#e03a3e\"/></svg>", "台灣": "<svg class=\"fpf\" viewBox=\"0 0 21 14\" shape-rendering=\"crispEdges\" aria-hidden=\"true\"><rect x=\"0\" y=\"0\" width=\"21\" height=\"14\" fill=\"#e03a3e\"/><rect x=\"0\" y=\"0\" width=\"11\" height=\"7\" fill=\"#1f3a8a\"/><rect x=\"4\" y=\"1\" width=\"3\" height=\"1\" fill=\"#ffffff\"/><rect x=\"3\" y=\"2\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"3\" y=\"3\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"3\" y=\"4\" width=\"5\" height=\"1\" fill=\"#ffffff\"/><rect x=\"4\" y=\"5\" width=\"3\" height=\"1\" fill=\"#ffffff\"/></svg>", "香港": "<svg class=\"fpf\" viewBox=\"0 0 21 14\" shape-rendering=\"crispEdges\" aria-hidden=\"true\"><rect x=\"0\" y=\"0\" width=\"21\" height=\"14\" fill=\"#e03a3e\"/><rect x=\"10\" y=\"3\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"4\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"4\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"4\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"5\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"6\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"14\" y=\"6\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"10\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"7\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"8\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"9\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"11\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"9\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"7\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"8\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"12\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/><rect x=\"13\" y=\"10\" width=\"1\" height=\"1\" fill=\"#ffffff\"/></svg>"};
const FPC={"首爾":"韓國","釜山":"韓國","濟州":"韓國","仁川":"韓國","大邱":"韓國","東京":"日本","大阪":"日本","京都":"日本","札幌":"日本","福岡":"日本","名古屋":"日本","沖繩":"日本","台北":"台灣","新北":"台灣","台中":"台灣","台南":"台灣","高雄":"台灣","曼谷":"泰國","紐約":"美國","洛杉磯":"美國","拉斯維加斯":"美國","倫敦":"英國","巴黎":"法國","雪梨":"澳洲"};
function fpCtOf(d){return d.country||FPC[d.city]||"其他"}const FPV=(()=>{try{return JSON.parse(localStorage.getItem("fp-visited")||"{}")||{}}catch(e){return{}}})();
/* 首頁桌寵（用 setTimeout 等 FPAV 小人表在下方賦值後才啟動）：右下角站一位成員小人。今天抽過幸運籤＝醒著（今天抽到的成員），還沒抽＝灰階睡著（昨天的成員，不會劇透今天的籤）。點小人會說一句話，有連結的話點對話框可前往 */
setTimeout(function(){try{const h=document.querySelector(".hero h1");if(!h||h.textContent.trim()!=="BTS 應援地圖")return;const F=typeof FPAV!=="undefined"?FPAV:null;if(!F)return;
const p=document.createElement("div");p.className="pet";p.hidden=true;p.innerHTML='<div class="petb" role="status" aria-live="polite" hidden></div><button type="button" class="petbtn"><span class="petw"><img alt="" decoding="async"><i class="petl" aria-hidden="true"></i><i class="peth" aria-hidden="true"></i></span><i class="petz" aria-hidden="true"><s>z</s><s>z</s><s>Z</s></i><i class="petc" aria-hidden="true"><s>★</s><s>✦</s><s>★</s><s>✦</s><s>★</s></i></button>';document.body.appendChild(p);
const pth=p.querySelector(".peth");let pthK="";
/* 右下角小人的節日／紀念日造型：成員生日、6/13 出道紀念日→派對帽；10/31→女巫帽；12/24–25→聖誕帽；1/1→金皇冠。帽子位置不準的話，調 .peth 的 top／left／width */
const PHT={party:'<rect x="4" y="0" width="2" height="1" fill="#ffd23f"/><rect x="4" y="1" width="2" height="2" fill="#ff8fb3"/><rect x="3" y="3" width="4" height="2" fill="#fff"/><rect x="2" y="5" width="6" height="2" fill="#6fb7ff"/><rect x="1" y="7" width="8" height="1" fill="#ffd23f"/>',witch:'<rect x="4" y="0" width="2" height="1" fill="#7b4fd6"/><rect x="3" y="1" width="4" height="2" fill="#7b4fd6"/><rect x="2" y="3" width="6" height="1" fill="#ffd23f"/><rect x="2" y="4" width="6" height="1" fill="#7b4fd6"/><rect x="0" y="5" width="10" height="1" fill="#7b4fd6"/>',santa:'<rect x="6" y="0" width="2" height="1" fill="#fff"/><rect x="3" y="1" width="4" height="1" fill="#e0453a"/><rect x="2" y="2" width="6" height="2" fill="#e0453a"/><rect x="1" y="4" width="8" height="1" fill="#fff"/>',crown:'<rect x="1" y="2" width="2" height="3" fill="#ffd23f"/><rect x="4" y="1" width="2" height="4" fill="#ffd23f"/><rect x="7" y="2" width="2" height="3" fill="#ffd23f"/><rect x="1" y="5" width="8" height="1" fill="#e0a800"/><rect x="4" y="3" width="2" height="1" fill="#e0453a"/>'};
const hatKind=(E,T)=>{const mo=T.getMonth()+1,dy=T.getDate();if(E&&E[1]===mo&&E[2]===dy)return"party";if(mo===6&&dy===13)return"party";if(mo===10&&dy===31)return"witch";if(mo===12&&(dy===24||dy===25))return"santa";if(mo===1&&dy===1)return"crown";return""};
const bt=p.querySelector(".petb"),bn=p.querySelector(".petbtn"),im=bn.querySelector("img");let cur="",aw=null,k=0,tm=0,ht=0,act=null,nt=false;const night=()=>{const h=new Date().getHours();return h>=23||h<5};
const day=()=>{const t=new Date();t.setHours(0,0,0,0);return t},ld=()=>{try{return JSON.parse(localStorage.getItem("ftn-st")||"{}")||{}}catch(e){return{}}};
const memFor=d=>{const M=MEMBERS.filter(m=>m[0]!=="BTS"),b=ftBd(d);return b?b.m:M[fth(ftKey(d)+"m")%M.length][0]};
const awake=()=>{const d=new Date();return ld().last===d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()};
const shows=()=>{const o=[];try{Object.keys(CITIES).forEach(k=>{const c=CITIES[k];if(!c||!c.y)return;(c.showDays||[]).forEach(d=>{const q=String(d).split("/").map(Number);if(q.length===2&&q[0]&&q[1])o.push({t:new Date(c.y,q[0]-1,q[1])})})})}catch(e){}return o};
function refresh(){try{const a=awake(),y=day();y.setDate(y.getDate()-1);const m=a?memFor(new Date()):memFor(y);if(!F[m]){p.hidden=true;return}p.hidden=false;if(m!==cur){cur=m;im.src=F[m]}p.dataset.m=m;aw=a;nt=night();p.classList.toggle("sl",!a||nt);{const E=MEMBERS.find(x=>x[0]===m),T=new Date();p.classList.toggle("bd",!!(a&&E&&E[1]===T.getMonth()+1&&E[2]===T.getDate()));p.classList.toggle("cc",!!(a&&shows().some(x=>+x.t===+day())));const hk=hatKind(E,T);if(hk!==pthK){pthK=hk;pth.innerHTML=hk?'<svg viewBox="0 0 10 10" shape-rendering="crispEdges">'+PHT[hk]+'</svg>':"";pth.classList.toggle("on",!!hk)}}bn.setAttribute("aria-label",a&&!nt?m+" 小人，點一下聽他說話":"睡著的 "+m+" 小人，點一下")}catch(e){}}
const MQ={"Jin":["今天吃飽了嗎？","來，一起深呼吸，放輕鬆"],"SUGA":["累的話就休息一下，不急","今天的進度，慢慢來就好"],"j-hope":["來點元氣！今天也動一動","心情不好的話，跟著節奏晃一晃"],"RM":["今天有學到什麼新東西嗎？","慢慢來，一步一步走"],"Jimin":["今天也辛苦了，給自己一點掌聲","笑一個，今天會順利"],"V":["天氣好的話，出去走走吧","今天有看到什麼漂亮的東西嗎？"],"Jungkook":["今天也要全力以赴","來比賽，看誰先抽到好籤"]};
const MS={10:"被你戳了 10 次，我們開始變熟了",30:"第 30 次！你真的很喜歡我欸",100:"100 次！你是我的頭號粉絲"};
const pn=()=>{try{return +localStorage.getItem("pet-n")||0}catch(e){return 0}},pnAdd=()=>{try{const n=pn()+1;localStorage.setItem("pet-n",n);return n}catch(e){return 0}};
function msgs(){const o=[],t=day(),ent=MEMBERS.find(x=>x[0]===cur);
if(ent){const n=new Date(t.getFullYear(),ent[1]-1,ent[2]);if(n<t)n.setFullYear(t.getFullYear()+1);const dd=Math.round((n-t)/864e5);o.push(dd===0?{t:"今天是我的生日！去生日應援看看大家準備了什麼",go:".entry.bd"}:{t:"離我的生日還有 "+dd+" 天"+(dd<=30?"，去生日應援看看":""),go:dd<=30?".entry.bd":null})}
const s=ld();if(s.n>=2)o.push({t:"你已經連續抽籤 "+s.n+" 天了，明天也要來"});
try{const lv=DATA.filter(d=>d.sec!=="birthday"&&stat(d)==="進行中").length;if(lv)o.push({t:"現在有 "+lv+" 個巡演應援進行中，去打卡吧",go:".entry.tour"});const bl=DATA.filter(d=>d.sec==="birthday"&&stat(d)==="進行中").length;if(bl)o.push({t:"有 "+bl+" 個生日應援正在進行",go:".entry.bd"})}catch(e){}
{const S=shows().map(x=>Math.round((x.t-t)/864e5)).filter(n=>n>=0).sort((u,v)=>u-v),dc=S.length?S[0]:-1;if(dc>1&&dc<=60)o.push({t:"離演唱會開演還有 "+dc+" 天"});else if(dc===1)o.push({t:"明天就是演唱會了！今晚早點睡，螢光棒記得帶"});else if(dc===0){const hh=new Date().getHours();o.push({t:hh<12?"今天要見面了！出門前再檢查一次票和螢光棒":"今天就是演唱會！記得喝水、顧好嗓子"})}}
try{if(vneed())o.push({t:"今天還沒投票，來投給你想聽的歌",go:"#bgv"})}catch(e){}
(MQ[cur]||[]).forEach(x=>o.push({t:x}));
{const h=new Date().getHours();o.unshift({t:h>=5&&h<11?"早安！今天也要元氣滿滿":h>=11&&h<14?"午安，記得吃飯喔":h>=14&&h<18?"下午了，喝口水休息一下":h>=18&&h<23?"晚上好，今天辛苦了":"這麼晚了，早點睡，明天再來"})}try{const n=NWG();if(n){if(n.nw.length)o.unshift(newMsg(n));if(n.ch.length)o.unshift(chgMsg(n))}}catch(e){}if(!o.length)o.push({t:"今天也一起加油"});return o}
function hide(){p.classList.remove("out");if(bt.hidden)return;bt.classList.add("fd");clearTimeout(ht);ht=setTimeout(()=>{bt.hidden=true;bt.classList.remove("fd")},260)}
function say(x,go){clearTimeout(ht);bt.classList.remove("fd");p.classList.add("out");bt.textContent=x;bt.classList.toggle("lk",!!go);if(go){bt.tabIndex=0;bt.setAttribute("role","button")}else{bt.removeAttribute("tabindex");bt.setAttribute("role","status")}bt.hidden=false;clearTimeout(tm);tm=setTimeout(hide,5000)}
/* 投票提醒：開放投票、而且這位使用者今天還沒投時，小人會主動提醒一句，投完就安靜；voteRemind() 會先呼叫 window.petRemind，小人不在的頁面才退回原本的跳窗 */
const vneed=()=>{try{if(!VOTE||!voteOn()||!VS||!Array.isArray(VS.candidates)||!VS.candidates.length||VS.myVote)return false;if(VS.day&&VS.day!==voteDay())return false;const o=JSON.parse(localStorage.getItem("kh-vstk")||"null");return!(o&&o.l===voteDay())}catch(e){return false}};
window.petRemind=function(){try{if(p.hidden||!vneed())return false;refresh();act=()=>{voteOpen()};say(aw&&!nt?"今天可以投票了，投給你最想聽的一首":"zzZ… 夢到今天還沒投票…",1);return true}catch(e){return false}};
const ck=[];bn.addEventListener("click",()=>{refresh();if(aw&&!nt){const n=Date.now();ck.push(n);while(ck.length&&n-ck[0]>2000)ck.shift();if(ck.length>=5){ck.length=0;p.classList.add("dz");setTimeout(()=>p.classList.remove("dz"),900);say("暈了啦…別戳了");return}}
if(nt){if(aw){act=null;say("zzZ… 好睏，明天再聊");return}act=()=>{const b=document.getElementById("ftnBtn");if(b)b.click()};say("zzZ… 好睏，想抽籤的話點這裡叫醒我",1);return}
if(!aw){act=()=>{const b=document.getElementById("ftnBtn");if(b)b.click()};say("zzZ… 今天還沒抽幸運籤，點這裡叫醒我",1);return}
const cn=pnAdd();if(MS[cn]){act=null;say(MS[cn]);return}
const L=msgs(),x=L[k++%L.length],sel=x.go;act=sel?()=>{if(x.ok)x.ok();const b=document.querySelector(sel);if(b)b.click()}:null;say(x.t,sel)});
bt.addEventListener("click",()=>{if(bt.classList.contains("lk")&&act)act();hide()});bt.addEventListener("keydown",e=>{if(e.key==="Enter"&&bt.classList.contains("lk")){e.preventDefault();bt.click()}});
document.addEventListener("click",e=>{if(!p.contains(e.target))hide()});
{let st=0,sy=window.scrollY;addEventListener("scroll",()=>{if(p.classList.contains("out"))return;const y=window.scrollY;if(Math.abs(y-sy)<4)return;sy=y;p.classList.add("hd");clearTimeout(st);st=setTimeout(()=>p.classList.remove("hd"),700)},{passive:true})}/* 待機動作排程：醒著、白天、沒在說話、沒被捲動收起來、分頁在前景、沒開「減少動態」才會動 */
{const rm=matchMedia("(prefers-reduced-motion:reduce)");const idle=()=>{try{if(!p.hidden&&aw&&!nt&&!document.hidden&&!rm.matches&&!p.classList.contains("out")&&!p.classList.contains("hd")&&!p.classList.contains("dz")){p.classList.add("idl");setTimeout(()=>p.classList.remove("idl"),3100)}}catch(e){}setTimeout(idle,18000+Math.random()*22000)};setTimeout(idle,7000+Math.random()*6000)}
/* 新增／異動提醒：網站讀完試算表後，跟這位使用者「上次看過的清單」（localStorage: pet-seen）比對——有沒看過的新應援、或異動內容變了（含取消），小人就提醒。第一次來只記下目前的清單，不會把全部當成新的；點小人的提醒（或自動跳出的對話框）才算看過。自動跳出每天最多一次（pet-nws） */
const NWS=()=>{try{return JSON.parse(localStorage.getItem("pet-seen")||"null")}catch(e){return null}};
const NWG=()=>{if(!window.__sheetReady)return null;try{let s=NWS();if(!s||!Array.isArray(s.ids)||!s.chg){s={ids:DATA.map(d=>d.id),chg:{}};localStorage.setItem("pet-seen",JSON.stringify(s))}const ids=new Set(s.ids),L=DATA.filter(d=>d&&d.id&&stat(d)!=="已結束");return{nw:L.filter(d=>!ids.has(d.id)),ch:L.filter(d=>d.chg&&s.chg[d.id]!==d.chg)}}catch(e){return null}};
const NWK=(nw,ch)=>{try{const s=NWS()||{ids:[],chg:{}};nw.forEach(d=>{if(!s.ids.includes(d.id))s.ids.push(d.id)});ch.forEach(d=>{s.chg[d.id]=d.chg});s.ids=s.ids.slice(-400);localStorage.setItem("pet-seen",JSON.stringify(s))}catch(e){}};
const NWSEL=L=>L.some(d=>d.sec!=="birthday")?".entry.tour":".entry.bd";
const chgMsg=n=>{const c=n.ch.filter(d=>/^取消/.test(d.chg)).length,m=n.ch.length-c;return{t:c&&m?"有 "+c+" 個應援取消了、"+m+" 個有異動，出發前看一下":c?"有 "+c+" 個應援取消了，出發前看一下":"有 "+m+" 個應援有異動，出發前看一下",go:NWSEL(n.ch),ok:()=>NWK([],n.ch)}};
const newMsg=n=>{const t=String(n.nw[0].title||"").replace(/\s*[(（].*$/,"");return{t:n.nw.length===1?"新增了「"+(t.length>14?t.slice(0,14)+"…":t)+"」，去看看":"新增了 "+n.nw.length+" 個應援，去看看",go:NWSEL(n.nw),ok:()=>NWK(n.nw,[])}};
function pushNews(){try{if(p.hidden||!bt.hidden||document.hidden||document.getElementById("bgd"))return;const n=NWG();if(!n||(!n.nw.length&&!n.ch.length))return;const d=new Date(),sig=d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()+"|"+n.nw.length+"|"+n.ch.length;if(localStorage.getItem("pet-nws")===sig)return;localStorage.setItem("pet-nws",sig);refresh();let m;if(n.nw.length&&n.ch.length){const a=chgMsg(n),b=newMsg(n);m={t:"有 "+n.nw.length+" 個新應援、"+n.ch.length+" 個應援有異動，去看看",go:a.go,ok:()=>{a.ok();b.ok()}}}else m=n.ch.length?chgMsg(n):newMsg(n);act=()=>{m.ok();const b=document.querySelector(m.go);if(b)b.click()};say(aw&&!nt?m.t:"zzZ… 夢到有"+(n.ch.length?"應援異動":"新應援")+"了…",1)}catch(e){}}
setTimeout(()=>setInterval(pushNews,4000),8000);
refresh();setInterval(()=>{if(!document.hidden)refresh()},3000);document.addEventListener("visibilitychange",()=>{if(!document.hidden)refresh()})}catch(e){}},0);
/* 彩蛋：首頁標題 2.5 秒內連點 7 次，七位成員小人排隊跑過畫面（要有 FPAV 小人圖才會出現） */
(function(){try{const h=document.querySelector(".hero h1");if(!h)return;let n=0,t=0,run=false;const O=["Jin","SUGA","j-hope","RM","Jimin","V","Jungkook"];
h.addEventListener("click",function(){if(run||h.textContent.trim()!=="BTS 應援地圖")return;const now=Date.now();n=now-t>2500?1:n+1;t=now;if(n<7)return;n=0;const F=typeof FPAV!=="undefined"?FPAV:null;if(!F)return;const L=O.filter(m=>F[m]);if(!L.length)return;run=true;
const P={"Jin":[5.8,.46,-6],"SUGA":[5.2,.52,-5],"j-hope":[3.3,.26,-13],"RM":[4.8,.4,-8],"Jimin":[4.2,.3,-11],"V":[4.6,.36,-9],"Jungkook":[3.5,.28,-12]};
/* 節日／紀念日造型：成員生日→派對帽；6/13 出道紀念日→全員派對帽；10/31 萬聖節→女巫帽；12/24–25 聖誕節→聖誕帽；1/1 新年→金皇冠。都用裝置本地日期，其他日子不戴 */
const dn=new Date(),mo=dn.getMonth()+1,dy=dn.getDate(),sv=(b)=>`<svg class="egh" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true">${b}</svg>`,
HT={party:sv('<rect x="4" y="0" width="2" height="1" fill="#ffd23f"/><rect x="4" y="1" width="2" height="2" fill="#ff8fb3"/><rect x="3" y="3" width="4" height="2" fill="#fff"/><rect x="2" y="5" width="6" height="2" fill="#6fb7ff"/><rect x="1" y="7" width="8" height="1" fill="#ffd23f"/>'),
witch:sv('<rect x="4" y="0" width="2" height="1" fill="#7b4fd6"/><rect x="3" y="1" width="4" height="2" fill="#7b4fd6"/><rect x="2" y="3" width="6" height="1" fill="#ffd23f"/><rect x="2" y="4" width="6" height="1" fill="#7b4fd6"/><rect x="0" y="5" width="10" height="1" fill="#7b4fd6"/>'),
santa:sv('<rect x="6" y="0" width="2" height="1" fill="#fff"/><rect x="3" y="1" width="4" height="1" fill="#e0453a"/><rect x="2" y="2" width="6" height="2" fill="#e0453a"/><rect x="1" y="4" width="8" height="1" fill="#fff"/>'),
crown:sv('<rect x="1" y="2" width="2" height="3" fill="#ffd23f"/><rect x="4" y="1" width="2" height="4" fill="#ffd23f"/><rect x="7" y="2" width="2" height="3" fill="#ffd23f"/><rect x="1" y="5" width="8" height="1" fill="#e0a800"/><rect x="4" y="3" width="2" height="1" fill="#e0453a"/>')},
hatOf=m=>{const b=MEMBERS.find(x=>x[0]===m);if(b&&b[1]===mo&&b[2]===dy)return HT.party;if(mo===6&&dy===13)return HT.party;if(mo===10&&dy===31)return HT.witch;if(mo===12&&(dy===24||dy===25))return HT.santa;if(mo===1&&dy===1)return HT.crown;return""};
const ph=Math.random()<.2,cnt=L.length,vw=innerWidth,sp=Math.min(56,(vw-24)/cnt),x0=(vw-52)/2-sp*(cnt-1)/2;
const w=document.createElement("div");w.className="egg";w.setAttribute("aria-hidden","true");w.innerHTML=L.map((m,i)=>`<span class="egr" style="${ph?`--x:${(x0+(cnt-1-i)*sp).toFixed(1)}px;--d:${(3.4+i*.22).toFixed(2)}s`:`--d:${(P[m]||[4])[0]}s`};animation-delay:${(i*.28).toFixed(2)}s"><img src="${F[m]}" alt="" decoding="async" style="--b:${(P[m]||[0,.36])[1]}s;--h:${(P[m]||[0,0,-9])[2]}px;animation-delay:${(i%2*.09).toFixed(2)}s">${hatOf(m).replace("<svg ",`<svg style="--b:${(P[m]||[0,.36])[1]}s;--h:${(P[m]||[0,0,-9])[2]}px;--ad:${(i%2*.09).toFixed(2)}s" `)}</span>`).join("");document.body.appendChild(w);
/* 大多數時候七人直接跑過畫面；約 1/5 機率是隱藏版：跑到定位後站成一排合照，一起跳一下、閃一下相機閃光，停一會兒再淡出 */
let left=cnt;const end=()=>{if(!w.isConnected)return;w.remove();run=false;try{if(localStorage.getItem("egg7")!=="1")localStorage.setItem("egg7","1");badgeSync()}catch(e){}},bye=()=>{if(!w.isConnected)return;w.classList.add("bye");setTimeout(end,700)},pose=()=>{if(!w.isConnected)return;w.classList.add("pose");try{localStorage.setItem("egg7p","1")}catch(e){}const f=document.createElement("div");f.className="egf";document.body.appendChild(f);setTimeout(()=>f.remove(),1300);setTimeout(bye,2800)};
w.querySelectorAll(".egr").forEach(e=>e.addEventListener("animationend",ev=>{if(ev.target!==e||ev.animationName!=="egrun")return;if(!ph){if(--left<=0)end();return}e.classList.add("st");if(--left<=0)setTimeout(pose,350)}));setTimeout(end,ph?16000:10000)})}catch(e){}})();
/* 彩蛋2：長按首頁標題 3 秒，紫色愛心從畫面底部飄上來（ARMY 的「我紫你」），解鎖隱藏徽章「我紫你」；移動手指或放開就取消 */
(function(){try{const h=document.querySelector(".hero h1");if(!h)return;let tm=0,run=false,x0=0,y0=0;const stop=()=>{clearTimeout(tm);tm=0};
const go=()=>{tm=0;if(run)return;run=true;const w=document.createElement("div");w.className="hrt";w.setAttribute("aria-hidden","true");const E=["💜","💜","💜","💜","🫶","✨"],vw=innerWidth;
w.innerHTML=Array.from({length:28},(_,i)=>`<i style="left:${(Math.random()*(vw-24)).toFixed(0)}px;font-size:${(18+Math.random()*22).toFixed(0)}px;--d:${(2.6+Math.random()*1.6).toFixed(2)}s;--w:${(Math.random()*1.4).toFixed(2)}s;--s:${(Math.random()*60-30).toFixed(0)}px">${E[i%E.length]}</i>`).join("");document.body.appendChild(w);try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}
try{localStorage.setItem("egghrt","1");badgeSync()}catch(e){}
setTimeout(()=>w.classList.add("bye"),4300);setTimeout(()=>{w.remove();run=false},5000)};
h.addEventListener("pointerdown",e=>{stop();x0=e.clientX;y0=e.clientY;tm=setTimeout(go,3000)});
h.addEventListener("pointermove",e=>{if(tm&&Math.hypot(e.clientX-x0,e.clientY-y0)>12)stop()});
["pointerup","pointercancel","pointerleave"].forEach(t=>h.addEventListener(t,stop));
h.addEventListener("contextmenu",e=>e.preventDefault())}catch(e){}})();

/* 彩蛋3：路過事件。停在首頁（標題看得到、分頁在前景、七人遊行沒在跑、沒開減少動態）時，每 1.5～3 分鐘隨機演一齣：Jungkook 追 Jimin／V 靠在邊邊睡覺／Jin 抱零食慢慢走。第一次看到解鎖隱藏徽章「路過的小人」。想調頻率改最下面兩個 setTimeout 的毫秒數 */
(function(){try{let busy=false;const rm=matchMedia("(prefers-reduced-motion:reduce)");
(function(){try{if(document.getElementById("skpx"))return;var D={"ck":{"p":{"o":"#7a4a1e","B":"#e0a458","d":"#6b3a1a"},"r":["...oooo...","..oBBBBo..",".oBBBBdBo.","oBBdBBBBBo","oBBBBBdBBo","oBdBBBBBBo","oBBBBdBBBo",".oBBBBBBo.","..oBBdBo..","...oooo..."]},"on":{"p":{"o":"#6b7a8f","W":"#ffffff","k":"#1f3d2b"},"r":["....oo....","...oWWo...","..oWWWWo..",".oWWWWWWo.",".oWWWWWWo.","oWWWWWWWWo","oWWkkkkWWo","oWWkkkkWWo","oWWkkkkWWo",".oooooooo."]},"dg":{"p":{"p":"#ff8fb1","w":"#fff6e0","G":"#8fd16b","s":"#b8873f"},"r":[".pp.......","pppp......","pppp......",".ppsww....","...wwww...","...wwww...","....wwsGG.","......GGGG","......GGGG",".......GG."]},"lf":{"p":{"o":"#b07a00","y":"#ffd23f","k":"#4a2a00","r":"#ff6b6b"},"r":["..oooooo..",".oyyyyyyo.","oyyyyyyyyo","oykkyykkyo","oyyyyyyyyo","oykkkkkkyo","oyyrrrryyo",".oyyyyyyo.","..oooooo..",".........."]},"an":{"p":{"o":"#b07a00","y":"#ffd23f","k":"#4a2a00"},"r":["..oooooo..",".oyyyyyyo.","oykyyyykyo","oyykyykyyo","oyykyykyyo","oyyyyyyyyo","oyyykkyyyo",".oyyyyyyo.","..oooooo..",".........."]}},o=".pxs{display:inline-block;flex:none;width:20px;height:20px;background-size:100% 100%;background-repeat:no-repeat;image-rendering:pixelated}.ske.px{display:flex;gap:2px;top:-24px;margin-left:-10px;font-size:0}.ske.px.sn{margin-left:-32px}";Object.keys(D).forEach(function(k){var p=D[k].p,r="";D[k].r.forEach(function(row,y){var m,re=/([^.])\1*/g;while((m=re.exec(row)))r+='<rect x="'+m.index+'" y="'+y+'" width="'+m[0].length+'" height="1" fill="'+p[m[1]]+'"/>'});o+=".pxs.px"+k+'{background-image:url("data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" shape-rendering="crispEdges">'+r+"</svg>")+'")}'});var st=document.createElement("style");st.id="skpx";st.textContent=o;document.head.appendChild(st)}catch(e){}})();
const r=(m,st,ex)=>`<span class="skr" style="${st}"><img src="${FPAV[m]}" alt="" decoding="async">${ex||""}</span>`;
const K=[["Jimin,Jungkook",()=>r("Jimin","--d:5s",'<b class="ske px"><i class="pxs pxlf"></i></b>')+r("Jungkook","--d:5s;animation-delay:.9s",'<b class="ske px"><i class="pxs pxan"></i></b>'),7000],
["Jin",()=>r("Jin","--d:11s;--b:.7s",'<b class="ske sn px"><i class="pxs pxck"></i><i class="pxs pxon"></i><i class="pxs pxdg"></i></b>'),11500]];
const go=()=>{try{const h=document.querySelector(".hero h1"),F=typeof FPAV!=="undefined"?FPAV:null;
if(F&&h&&h.offsetParent&&h.textContent.trim()==="BTS 應援地圖"&&!document.hidden&&!rm.matches&&!busy&&!document.querySelector(".egg")){
const L=K.filter(k=>k[0].split(",").every(m=>F[m]));if(L.length){const k=L[Math.floor(Math.random()*L.length)];busy=true;
const w=document.createElement("div");w.className="skit";w.setAttribute("aria-hidden","true");w.innerHTML=k[1]();document.body.appendChild(w);
try{if(localStorage.getItem("skit")!=="1")localStorage.setItem("skit","1");badgeSync()}catch(e){}
setTimeout(()=>w.classList.add("bye"),k[2]);setTimeout(()=>{w.remove();busy=false},k[2]+700)}}}catch(e){busy=false}
setTimeout(go,90000+Math.random()*90000)};setTimeout(go,40000+Math.random()*40000)}catch(e){}})();
/* 彩蛋3：6/13（BTS 出道紀念日）當天打開網站，紫色愛心和星星灑滿畫面，並解鎖隱藏徽章「出道紀念日」；每年 6/13 第一次開頁面都會再放一次 */
(function(){try{const d=new Date();if(d.getMonth()!==5||d.getDate()!==13)return;const yk=String(d.getFullYear());if(localStorage.getItem("egg613d")===yk)return;
setTimeout(()=>{try{localStorage.setItem("egg613d",yk);localStorage.setItem("egg613","1")}catch(e){}
try{const w=document.createElement("div");w.className="hrt";w.setAttribute("aria-hidden","true");const E=["💜","★","💜","✦","🎉","💜"],vw=innerWidth;
w.innerHTML=Array.from({length:36},(_,i)=>`<i style="left:${(Math.random()*(vw-24)).toFixed(0)}px;color:#a56bff;font-size:${(16+Math.random()*24).toFixed(0)}px;--d:${(2.8+Math.random()*1.8).toFixed(2)}s;--w:${(Math.random()*1.8).toFixed(2)}s;--s:${(Math.random()*80-40).toFixed(0)}px">${E[i%E.length]}</i>`).join("");document.body.appendChild(w);setTimeout(()=>w.classList.add("bye"),5000);setTimeout(()=>w.remove(),5800)}catch(e){}
try{toast("今天是 6/13，出道紀念日快樂 💜")}catch(e){}try{badgeSync()}catch(e){}},1500)}catch(e){}})();
/* 成員小頭像：把成員名稱對到 IMG/av-1.png～av-7.png（還沒對應的成員會維持純文字標籤） */var FPAV={"Jungkook":"bts/av-1.png","Jimin":"bts/av-5.png","V":"bts/av-4.png","j-hope":"bts/av-6.png","SUGA":"bts/av-7.png","Jin":"bts/av-2.png","RM":"bts/av-3.png"};function bdAv(x,k){const F=typeof FPAV!=="undefined"?FPAV:null;if(!F)return"";const im=a=>`<img src="${a}" alt="" aria-hidden="true" loading="lazy" decoding="async">`,g=x==="BTS",L=g?MEMBERS.map(m=>m[0]).filter(n=>n!=="BTS"&&F[n]):(F[x]?[x]:[]);if(!L.length)return"";const hat=k===0?'<svg class="hat" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="2" height="1" fill="#ffd23f"/><rect x="4" y="1" width="2" height="2" fill="#ff8fb3"/><rect x="3" y="3" width="4" height="2" fill="#fff"/><rect x="2" y="5" width="6" height="2" fill="#6fb7ff"/><rect x="1" y="7" width="8" height="1" fill="#ffd23f"/></svg>':"";return `<span class="mav${g?" grp":""}${k===0?" bd0":""}">${L.map(n=>im(F[n])).join("")}${hat}</span>`} function ftMainAv(m,sh,hb){const s=typeof FPAV!=="undefined"&&FPAV[m];if(!s)return"";const hat=hb?'<svg class="ftmh" viewBox="0 0 10 10" shape-rendering="crispEdges" aria-hidden="true"><rect x="4" y="0" width="2" height="1" fill="#ffd23f"/><rect x="4" y="1" width="2" height="2" fill="#ff8fb3"/><rect x="3" y="3" width="4" height="2" fill="#fff"/><rect x="2" y="5" width="6" height="2" fill="#6fb7ff"/><rect x="1" y="7" width="8" height="1" fill="#ffd23f"/></svg>':"";return `<span class="ftmw${hb?" hb":""}"><img class="ftmav${sh?" shn":""}" src="${s}" alt="" aria-hidden="true" decoding="async">${hat}</span>`} function ftAv(m,on,sh){const s=typeof FPAV!=="undefined"&&FPAV[m];return s?`<img class="ftav${on?(sh?" shn":""):" sil"}" src="${s}" alt="" aria-hidden="true" loading="lazy" decoding="async">`:""}function fpAv(m){return FPAV[m]?`<img class="fpav" src="${FPAV[m]}" alt="" aria-hidden="true" loading="lazy" decoding="async">`:""}try{if(sec==="birthday")members()}catch(e){}
function fpSave(){try{localStorage.setItem("fp-visited",JSON.stringify(FPV))}catch(e){}}
function fpMs(d){const m=d.member;return Array.isArray(m)?m:String(m||"BTS").split(/[、,，\/／&＆]+/).map(x=>x.trim()).filter(Boolean)}
function fpSongs(d){const v=d.song;return(Array.isArray(v)?v:String(v||"").split(/[、，；;\n]+/)).map(x=>String(x).trim()).filter(Boolean)}
function fpSongRow(d){const L=fpSongs(d);if(!L.length)return"";return`<div class="fpsr"><span>相關歌曲</span><span>${L.map(n=>{const x=SONGS.find(y=>String(y.t).trim().toLowerCase()===n.toLowerCase());return x?`<button type="button" class="fpsg" data-fsong="${esc(x.t)}">🎵 ${esc(x.t)} ›</button>`:`<span class="fpsn">🎵 ${esc(n)}</span>`}).join("")}</span></div>`}
function fpBack(x){if(!FOOT_OPEN)return"";const t=String(x.t).trim().toLowerCase(),L=fpL().filter(d=>d&&d.id&&fpSongs(d).some(n=>n.toLowerCase()===t));if(!L.length)return"";return`<b>👣 相關足跡</b>${L.map(d=>`<button type="button" class="fpsg" data-fpid="${esc(d.id)}">${esc(d.title)}${d.city?"・"+esc(d.city):""} ›</button>`).join("")}`}
function fpClosed(d){return /歇業|停業|關閉|搬遷|closed/i.test(d.state||"")}
function fpL(){return typeof FOOTPRINTS!=="undefined"&&Array.isArray(FOOTPRINTS)?FOOTPRINTS:[]}
/* 韓國的足跡多兩顆 Naver／Kakao 地圖按鈕：優先用含韓文的地址，沒有就用地點說明 */
function fpKrMaps(d){if(fpCtOf(d)!=="韓國")return"";const H=/[\uAC00-\uD7AF]/,q=[d.map,d.place].find(x=>x&&H.test(x))||d.map||d.place;if(!q)return"";const e=encodeURIComponent(q);return`<a class="btn fpkr naver" target="_blank" rel="noopener" href="https://map.naver.com/p/search/${e}" title="用 Naver 地圖開啟">Naver</a><a class="btn fpkr kakao" target="_blank" rel="noopener" href="https://map.kakao.com/link/search/${e}" title="用 Kakao 地圖開啟">Kakao</a>`}
/* 營業中／休息中小標：依「營業時間」欄位文字推算，時間用該國當地時區（韓國、日本、台灣）；看不懂的格式就不顯示 */
function fpOpenSt(d){const h=String(d.hours||"");if(!h.trim())return null;const tz={"韓國":"Asia/Seoul","日本":"Asia/Tokyo","台灣":"Asia/Taipei"}[fpCtOf(d)];if(!tz)return null;
let wd,now;try{const p={};new Intl.DateTimeFormat("en-US",{timeZone:tz,weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);wd=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].indexOf(p.weekday);now=(+p.hour%24)*60+(+p.minute);if(wd<0||isNaN(now))return null}catch(e){return null}
const N="一二三四五六日天",ix=c=>{const i=N.indexOf(c);return i>6?6:i},all=()=>new Set([0,1,2,3,4,5,6]);
function days(t){if(/每天|天天|每日|全週|全周|全年無休|毎日/.test(t))return all();const o=new Set();let any=false,r=t;
if(/平日/.test(r)){[0,1,2,3,4].forEach(i=>o.add(i));any=true}if(/假日|週末|周末|例假日/.test(r)){o.add(5);o.add(6);any=true}
r=r.replace(/[週周]?(?:星期)?([一二三四五六日天])\s*[~～\-–—至到]\s*[週周]?(?:星期)?([一二三四五六日天])/g,(m,a,b)=>{let i=ix(a);const e=ix(b);for(let k=0;k<7;k++){o.add(i);if(i===e)break;i=(i+1)%7}any=true;return" "});
r.replace(/(?:[週周]|星期)([一二三四五六日天])/g,(m,a)=>{o.add(ix(a));any=true;return" "});return any?o:null}
const ent=[],closed=new Set();let last=null,whole=false;
h.split(/\n|\r|；|;|，|,/).forEach(seg=>{seg=seg.trim();if(!seg)return;const rg=[];seg.replace(/(\d{1,2})\s*[:：]\s*(\d{2})\s*[~～\-–—至到]\s*(\d{1,2})\s*[:：]\s*(\d{2})/g,(m,a,b,c,e)=>{const s=+a*60+ +b;let t=+c*60+ +e;if(t<=s)t+=1440;rg.push([s,t]);return m});
const dy=days(seg);if(dy)last=dy;
if(/24\s*小時|24\s*hours?|24H/i.test(seg)&&!rg.length){ent.push({days:dy||last||all(),r:[[0,1440]],ex:!!dy});return}
if(rg.length){ent.push({days:dy||last||all(),r:rg,ex:!!(dy||last)});return}
if(/公休|休息|休館|定休|不營業|休業/.test(seg)&&dy)dy.forEach(i=>closed.add(i))});
if(!ent.length)return null;if(closed.has(wd))return"off";const te=ent.filter(e=>e.days.has(wd));if(!te.length)return ent.some(e=>e.ex)?"off":null;
const pv=(wd+6)%7,op=te.some(e=>e.r.some(([a,b])=>now>=a&&now<b))||ent.some(e=>e.days.has(pv)&&e.r.some(([a,b])=>b>1440&&now<b-1440));return op?"open":"rest"}
function fpOpenB(d){return"";if(fpClosed(d)||(d.state&&!/^營業中$/.test(d.state)))return"";const k=fpOpenSt(d);return k&&k!=="open"?`<em class="fph ${k}" title="依營業時間推算，實際以店家公告為準">${{open:"營業中",rest:"休息中",off:"今日公休"}[k]}</em>`:""}
/* 歇業／搬遷／暫停營業的提示條 */
function fpBanner(d){const st=String(d.state||"");if(!fpClosed(d)&&!/暫停/.test(st))return"";const t=/搬遷/.test(st)?"這間店已搬遷，地址可能已經不同":/暫停/.test(st)?"目前暫停營業，出發前請先確認":/歇業|停業|關閉|closed/i.test(st)?"這間店已歇業，無法前往":"這個地點已不開放";return`<div class="fpclosed${/暫停/.test(st)&&!fpClosed(d)?" pause":""}" role="note"><b aria-hidden="true">⚠</b><span>${t}</span></div>`}
/* 自訂造訪日期：存的格式維持 YYYY/M/D */
function fpIso(v){const m=String(v||"").match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);return m?m[1]+"-"+m[2].padStart(2,"0")+"-"+m[3].padStart(2,"0"):""}
function fpTodayIso(){const n=new Date();return n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0")}
/* 標題「中文名(韓文名)」拆成兩行：中文名大、韓文名小字灰色 */
function fpT(t){t=String(t||"");const m=t.match(/^(.+?)\s*[(（]([^()（）]*[\uAC00-\uD7AF\u3040-\u30FF][^()（）]*)[)）]\s*$/);return m?esc(m[1])+'<small class="fpko">'+esc(m[2])+"</small>":esc(t)}
function fpR(){const L=fpL();if(!$("#fpl"))return;
if(window.__fpReady){if(fpCt&&L.length&&!L.some(d=>fpCtOf(d)===fpCt)){fpCt="";fpCity=""}if(fpMem!=="全部"&&!MEMBERS.some(m=>m[0]===fpMem))fpMem="全部"}
const mems=["全部",...MEMBERS.map(m=>m[0])],cats=["全部",...[...new Set(L.filter(d=>!fpCt||fpCtOf(d)===fpCt).map(d=>d.cat).filter(Boolean))]];
if(fpCat!=="全部"&&!cats.includes(fpCat))fpCat="全部";
$("#fpm").innerHTML=MEMBERS.map(m=>m[0]).map(x=>`<button class="chip" aria-pressed="${x===fpMem}" data-fm="${esc(x)}">${esc(x)}</button>`).join("");
$("#fpc").innerHTML=cats.length>2?'<span class="fpq">類別</span>'+cats.map(x=>`<button class="chip" aria-pressed="${x===fpCat}" data-fc="${esc(x)}">${x==="全部"?"全部類別":esc(x)}</button>`).join(""):"";
{const cl2=fpCt?[...new Set(L.filter(d=>fpCtOf(d)===fpCt&&(fpMem==="全部"||fpMs(d).includes(fpMem))).map(d=>d.city).filter(Boolean))]:[];if(fpCity&&!cl2.includes(fpCity))fpCity="";
$("#fpcity").innerHTML=cl2.length>1?'<span class="fpq">城市</span>'+["全部",...cl2].map(x=>`<button class="chip" aria-pressed="${(x==="全部"?"":x)===fpCity}" data-fcity="${esc(x)}">${esc(x)}</button>`).join(""):""}
if(window.__fpReady){try{sessionStorage.setItem("fp-state",JSON.stringify({ct:fpCt,city:fpCity,mem:fpMem,cat:fpCat,only:fpOnly,q:fpQ}))}catch(e){}const q0=$("#fpq");if(q0&&q0.value!==fpQ&&document.activeElement!==q0)q0.value=fpQ}
{const fl=[];if(fpMem!=="全部")fl.push(fpMem);if(fpCat!=="全部")fl.push(fpCat);if(fpCity)fl.push(fpCity);if(fpOnly)fl.push("還沒去過");if(fpQ.trim())fl.push("「"+fpQ.trim()+"」");const fe=$("#fpflt");if(fe){fe.hidden=!fl.length;fe.innerHTML=fl.length?`<span>目前篩選：${fl.map(esc).join("・")}</span><button type="button" id="fpclr" class="chip">清除全部</button>`:""}}
const kw=fpQ.trim().toLowerCase();
const it=L.filter(d=>(fpMem==="全部"||fpMs(d).includes(fpMem))&&(!fpCt||fpCtOf(d)===fpCt)&&(!fpCity||d.city===fpCity)&&(fpCat==="全部"||d.cat===fpCat)&&(!fpOnly||!FPV[d.id])&&(!kw||[d.title,d.place,d.city,d.member,d.desc,d.cat].join(" ").toLowerCase().includes(kw)));
it.sort((a,b)=>(fpClosed(a)-fpClosed(b))||String(b.date||"").localeCompare(String(a.date||"")));
const dn=L.filter(d=>FPV[d.id]).length;
{const cs=L.filter(d=>(!fpCt||fpCtOf(d)===fpCt)&&(fpMem==="全部"||fpMs(d).includes(fpMem))),dd=cs.filter(d=>FPV[d.id]).length,b=$("#fpbar");if(b){b.hidden=!cs.length;const full=cs.length>0&&dd===cs.length;b.innerHTML=`<div class="fpbt"><b>${fpMem!=="全部"?esc(fpMem)+" 的足跡進度":"足跡進度"}</b><span>${dd} / ${cs.length}</span></div><div class="fpbr${full?" full":""}" role="progressbar" aria-valuemin="0" aria-valuemax="${cs.length}" aria-valuenow="${dd}"><i style="width:${cs.length?Math.round(dd/cs.length*100):0}%"></i></div>${full?"<small>🏆 全部走完了！</small>":""}`}}
$("#fpn").textContent=L.length?`${it.length} 個足跡・我去過 ${dn}/${L.length}`:"";
const link=typeof SUBMIT_URL==="string"&&SUBMIT_URL?`<br><a class="btn main" style="margin-top:12px" target="_blank" rel="noopener" href="${esc(SUBMIT_URL)}">我要提供足跡資訊</a>`:"";
const wall=!fpCt&&!kw,emp=L.length?"沒有符合的足跡，換個條件試試":"還沒有收錄足跡，歡迎提供資料"+link;
{const by={};L.filter(d=>fpMem==="全部"||fpMs(d).includes(fpMem)).forEach(d=>{const c=fpCtOf(d);(by[c]=by[c]||[]).push(d)});
const cl=Object.keys(by).sort((a,b)=>by[b].length-by[a].length||a.localeCompare(b));
$("#fpw").innerHTML=cl.length?cl.map(c=>{const n=by[c].length,v=by[c].filter(d=>FPV[d.id]).length;return `<button type="button" class="fpct${v===n?" all":""}" data-fk="${esc(c)}"><span class="fl">${FPX[c]||FPF[c]||"📍"}</span><b>${esc(c)}</b><span class="fs">${n} 個足跡・我去過 ${v}${v===n?" ✔":""}</span></button>`}).join(""):`<div class="empty">${emp}</div>`;
if(wall&&L.length)$("#fpn").textContent=`${cl.length} 個國家・${L.length} 個足跡・我去過 ${dn}`}
$("#fpw").hidden=!wall;$("#fpl").hidden=wall;$("#fpc").hidden=wall;$("#fpcity").hidden=wall;$("#fpback").hidden=wall;$("#fphome").hidden=!wall;
if(!wall&&L.length){const cs=L.filter(d=>(!fpCt||fpCtOf(d)===fpCt)&&(fpMem==="全部"||fpMs(d).includes(fpMem))),dd=cs.filter(d=>FPV[d.id]).length;$("#fpn").textContent=(fpCt?fpCt+"・":"")+`${it.length} 個足跡・我去過 ${dd}/${cs.length}`}
$("#fpl").innerHTML=it.length?it.map(d=>{const v=FPV[d.id];return `<article class="card fpc${v?" done":""}${v&&window.__fpDev===d.id?" dev":""}${fpClosed(d)?" closed":""}" data-id="${esc(d.id)}">${v?`<div class="fpstamp" aria-hidden="true"><span>✔</span><b>已造訪</b>${bgDs(v)?`<i class="fpsd">${esc(bgDs(v))}</i>`:""}</div>`:""}
${d.img?`<div class="pic has"><div class="pf"><img class="pbg" src="${esc(d.img)}" alt="" aria-hidden="true" loading="lazy" decoding="async"><img src="${esc(d.img)}" alt="${esc(d.title)}" loading="lazy" decoding="async"></div><div class="fpcap">${[d.city?esc(d.city):"",d.cat?esc(d.cat):""].filter(Boolean).join(" · ")}</div></div>`:""}
<div class="hd">${fpBanner(d)}<div class="top"><div class="tags">${d.cat&&!d.img?`<span class="pill fpk"><i aria-hidden="true">${({"餐廳":"🍴","景點":"🏞️"})[d.cat]||"📍"}</i><span>${esc(d.cat)}</span></span>`:""}${d.city&&!d.img?`<span class="fpcy">${esc(d.city)}</span>`:""}${d.state&&!/^營業中$/.test(d.state)?`<span class="pill fps${fpClosed(d)?" bad":""}">${esc(d.state)}</span>`:""}</div></div>
<h2>${fpT(d.title)}</h2>${d.date?`<div class="fpd">成員造訪：${esc(String(d.date).replace(/\s*造訪\s*$/,""))}</div>`:""}${d.desc?`<p class="desc">${esc(d.desc)}</p>`:""}</div>
<div class="box">${[["地點",d.place],["營業時間",d.hours],["必點美食",d.must],["出處",d.via],["備註",d.tip]].filter(r=>r[1]&&r[1]!=="—").map(r=>`<div><span class="fpl" data-ic="${({"地點":"📍","營業時間":"🕒","必點美食":"🍽️","出處":"📺","備註":"📝"})[r[0]]||""}">${r[0]}</span><span${(r[0]==="營業時間"||r[0]==="必點美食")?' style="white-space:pre-line"':""}>${esc(r[1])}${r[0]==="營業時間"?fpOpenB(d):""}${r[0]==="地點"&&/[\uAC00-\uD7AF]/.test(r[1])?`<button type="button" class="fpcp" data-cp="${esc(r[1])}">複製</button>`:""}</span></div>`).join("")}${fpSongRow(d)}</div>
<div class="act"><button class="btn ${v?"ok":"main"}" data-fv="${esc(d.id)}">${v?"✔ 我去過了":'<i class="fpi" aria-hidden="true"></i>我去過了'}</button>
${v?`<span class="fpdw"><button type="button" class="btn" data-fdt="${esc(d.id)}">📅 改日期</button><input type="date" class="fpdi" tabindex="-1" aria-hidden="true" data-fdi="${esc(d.id)}" max="${fpTodayIso()}" value="${fpIso(v)}"></span>`:""}
${d.map?`<a class="btn" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(d.map)}">📍 地圖</a>`:""}${fpKrMaps(d)}
${(d.links||[]).map(l=>`<a class="btn" target="_blank" rel="noopener" href="${esc(l.u)}">${esc(l.t)}</a>`).join("")}</div></article>`}).join("")+(it.length<=3&&typeof SUBMIT_URL==="string"&&SUBMIT_URL?`<div class="fpadd"><b>想補充足跡？</b><p>知道成員去過的店家或景點，歡迎提供給我們</p><a class="btn main" target="_blank" rel="noopener" href="${esc(SUBMIT_URL)}">我要提供足跡資訊</a></div>`:""):`<div class="empty">${L.length?"沒有符合的足跡，換個條件試試":"還沒有收錄足跡，歡迎提供資料"+link}</div>`;
try{if(window.I18N)I18N.refresh()}catch(e){}}
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-fpid]");if(!b)return;const d=fpL().find(y=>y.id===b.dataset.fpid);if(!d)return;gos("foot");fpCt=fpCtOf(d);fpMem="全部";fpCat="全部";fpCity="";fpOnly=false;fpQ="";fpR();const el=[...document.querySelectorAll("#fpl .fpc")].find(c=>c.dataset.id===d.id);if(el){el.scrollIntoView({block:"center"});el.classList.add("fpflash");setTimeout(()=>el.classList.remove("fpflash"),1800)}});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-fdt]");if(!b)return;const i=b.parentNode.querySelector("input");if(!i)return;try{i.showPicker()}catch(x){try{i.focus();i.click()}catch(y){}}});
document.addEventListener("change",e=>{const i=e.target;if(!i||!i.matches||!i.matches("[data-fdi]"))return;const id=i.dataset.fdi,m=String(i.value||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);if(!m||!FPV[id])return;if(i.value>fpTodayIso()){toast("日期不能晚於今天");i.value=fpIso(FPV[id]);return}FPV[id]=+m[1]+"/"+ +m[2]+"/"+ +m[3];fpSave();try{badgeSync()}catch(x){}toast("已更新造訪日期");fpR()});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-cp]");if(!b)return;const t=b.dataset.cp,ok=()=>toast("已複製地址"),bad=()=>toast("複製失敗，請長按地址手動複製");if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(ok,bad);else{try{const a=document.createElement("textarea");a.value=t;a.style.cssText="position:fixed;opacity:0";document.body.appendChild(a);a.select();const r=document.execCommand("copy");a.remove();r?ok():bad()}catch(x){bad()}}});
document.addEventListener("click",e=>{const b=e.target.closest&&e.target.closest("[data-fsong]");if(!b)return;const x=SONGS.find(y=>y.t===b.dataset.fsong);if(!x)return;gos("songs");const m=memOf(x);VIEW=m?"m":"a";MEM=m;ALB=albOf(x);SEL=x.t;try{sessionStorage.setItem("song-view",VIEW);localStorage.setItem("song-sel",SEL);document.getElementById("sq").value=""}catch(er){}songsR();window.scrollTo(0,0)});
document.addEventListener("click",e=>{const t=e.target.closest&&e.target.closest("[data-fm],[data-fc],[data-fcity],[data-fv],[data-fk],#fpback,#fpo");if(!t)return;
if(t.dataset.fm!==undefined)fpMem=fpMem===t.dataset.fm?"全部":t.dataset.fm;
else if(t.dataset.fcity!==undefined)fpCity=t.dataset.fcity==="全部"||fpCity===t.dataset.fcity?"":t.dataset.fcity;
else if(t.dataset.fc!==undefined)fpCat=fpCat===t.dataset.fc?"全部":t.dataset.fc;
else if(t.dataset.fv!==undefined){const id=t.dataset.fv;if(FPV[id]){delete FPV[id];toast("已取消")}else{const n=new Date();FPV[id]=n.getFullYear()+"/"+(n.getMonth()+1)+"/"+n.getDate();toast("已記錄這個足跡");window.__fpDev=id;setTimeout(()=>{window.__fpDev=null},1500)}fpSave();try{badgeSync()}catch(e){}}
else if(t.dataset.fk!==undefined){fpCt=t.dataset.fk;fpCity="";fpCat="全部";window.scrollTo(0,0)}
else if(t.id==="fpback"){fpCt="";fpCity="";fpCat="全部";fpQ="";const q=$("#fpq");if(q)q.value="";window.scrollTo(0,0)}
else if(t.id==="fpo")fpOnly=!fpOnly;
fpR()});
document.addEventListener("input",e=>{if(e.target&&e.target.id==="fpq"){fpQ=e.target.value;fpR()}});
/* 足跡也可以從試算表讀取：在 data.js 設定 FOOT_CSV_URL（足跡分頁發布成 CSV 的網址）。欄位：id、成員、類別、名稱、城市、地點、地圖、日期、出處、簡介、備註、連結、圖片、歌曲（選填，歌名要和歌曲頁一模一樣才會變成可點的連結）。讀不到就用 data.js 的 FOOTPRINTS */
function fpParse(t){const R=SheetLoader.csv(t);if(R.length<2)return[];
const M={"id":"id","成員":"member","藝人":"member","類別":"cat","分類":"cat","名稱":"title","店名":"title","景點":"title","國家":"country","國家/地區":"country","地區":"country","城市":"city","地點":"place","地址":"place","地圖":"map","日期":"date","造訪日期":"date","出處":"via","簡介":"desc","備註":"tip","必點美食":"must","必點":"must","推薦餐點":"must","營業時間":"hours","營業日":"hours","開放時間":"hours","營業狀態":"state","狀態":"state","連結":"links","圖片":"img","封面":"img","歌曲":"song","相關歌曲":"song","拍攝歌曲":"song"};
const hd=R[0].map(x=>M[String(x).trim()]||"");const seen=new Set();
const nd=s=>{s=String(s||"").trim();let m;if(m=s.match(/^(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/))return m[1]+"-"+String(m[2]).padStart(2,"0")+"-"+String(m[3]).padStart(2,"0");if(m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/))return m[3]+"-"+String(m[1]).padStart(2,"0")+"-"+String(m[2]).padStart(2,"0");return s};
const mem=s=>{const L=String(s||"").split(/[、,，\/／&＆]+/).map(x=>x.trim()).filter(Boolean).map(x=>{const k=MEMBERS.find(m=>m[0].toLowerCase()===x.toLowerCase());return k?k[0]:x});return L.length?L.join("、"):"BTS"};
return R.slice(1).map((r,i)=>{const o={};hd.forEach((k,j)=>{if(k&&!o[k])o[k]=String(r[j]||"").trim()});
if(!o.title)return null;const d={id:o.id||("fp-"+(o.member||"BTS")+"-"+o.title).replace(/\s+/g,""),member:mem(o.member),title:o.title};
["cat","country","city","place","hours","must","via","desc","tip","img","state","song"].forEach(k=>{if(o[k])d[k]=o[k]});
d.map=o.map||o.place||o.title;const dt=nd(o.date);if(dt)d.date=dt;
d.links=(o.links||"").split(/[\n；]+/).map(x=>x.trim()).filter(Boolean).map(x=>{const k=x.indexOf("|");return k>0?{t:x.slice(0,k).trim(),u:x.slice(k+1).trim()}:{t:"連結",u:x}}).filter(l=>/^https?:\/\//.test(l.u));
return d}).filter(d=>{if(!d||seen.has(d.id))return false;seen.add(d.id);return true})}
function fpSet(L){FOOTPRINTS.length=0;L.forEach(x=>FOOTPRINTS.push(x));try{entSync()}catch(e){}try{if(typeof sec!=="undefined"&&sec==="songs"){const x=SONGS.find(y=>y.t===SEL),e=document.querySelector(".fpbk");if(x&&e)e.innerHTML=fpBack(x)}}catch(e){}if(typeof sec!=="undefined"&&sec==="foot")fpR()}
async function fpLoad(){if(typeof FOOT_CSV_URL!=="string"||!FOOT_CSV_URL)return;
try{const c=localStorage.getItem("foot-cache");if(c){const L=fpParse(c);if(L.length)fpSet(L)}}catch(e){}
try{const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);
const r=await fetch(FOOT_CSV_URL+(FOOT_CSV_URL.includes("?")?"&":"?")+"t="+Date.now(),{signal:ac.signal});clearTimeout(tm);
if(!r.ok)throw 0;const txt=await r.text();const L=fpParse(txt);if(!L.length)throw 0;
try{localStorage.setItem("foot-cache",txt)}catch(e){}fpSet(L)}catch(e){}}
fpLoad();if(sec==="foot"){try{fpR()}catch(e){}}
try{I18N.add("👣 相關足跡","👣 Related footprints","👣 관련 발자취","👣 関連する足跡")}catch(e){}
try{I18N.add("相關歌曲","Related songs","관련 곡","関連曲")}catch(e){}
try{[["新功能／暫未開放","New feature / Not open yet","새 기능 / 아직 열리지 않았어요","新機能／まだ公開前です"],["新功能，暫未開放","New feature, not open yet","새 기능이에요. 아직 열리지 않았어요","新機能です。まだ公開前です"]].forEach(a=>I18N.add(...a))}catch(e){}
try{[["選成員","Pick a member","멤버 선택","メンバーを選ぶ"],["先選要看哪位成員去過的地方，預設是全部。","Pick whose visited places you want to see. The default is everyone.","어느 멤버가 다녀간 곳을 볼지 선택하세요. 기본값은 전체예요.","誰が訪れた場所を見るか選びます。初期設定は全員です。"],["選國家","Pick a country","국가 선택","国を選ぶ"],["點國家進去看那個國家的足跡，進去之後還能再依類別、城市縮小範圍。","Tap a country to see its footprints. Inside, you can narrow down by category and city.","국가를 눌러 그 나라의 발자취를 확인하세요. 안에서 카테고리와 도시로 더 좁힐 수 있어요.","国をタップするとその国の足跡が見られます。中ではカテゴリーや都市でさらに絞り込めます。"],["我去過幾個","How many I've been to","내가 다녀온 곳","行った数"],["這裡會顯示收錄了幾個足跡，以及你已經去過幾個。","Shows how many footprints are listed and how many you've visited.","등록된 발자취 수와 내가 다녀온 곳 수를 보여줘요.","掲載している足跡の数と、あなたが行った数が表示されます。"],["依類別篩選","Filter by category","카테고리로 필터","カテゴリーで絞り込み"],["這排可以左右滑，依類別縮小範圍。","Swipe this row sideways to narrow down by category.","이 줄은 좌우로 밀어 카테고리별로 좁힐 수 있어요.","この列は左右にスワイプして、カテゴリーで絞り込めます。"],["選城市","Pick a city","도시 선택","都市を選ぶ"],["同一個國家裡，再依城市縮小範圍。","Within a country, narrow down further by city.","같은 나라 안에서 도시별로 더 좁혀 보세요.","同じ国の中で、都市でさらに絞り込めます。"],["按下去會先藏起你去過的，只留下還沒去的。","Tap to hide the places you've been and keep only the ones you haven't.","누르면 다녀온 곳은 숨기고 아직 안 간 곳만 보여줘요.","押すと行った場所を隠し、まだ行っていない場所だけが残ります。"],["我去過了","I've been here","다녀왔어요","行ってきた"],["去過就按「我去過了」，會記下日期，也會累積足跡徽章。再按一次可以取消。","Tap “I've been here” once you've visited. It records the date and counts toward footprint badges. Tap again to undo.","다녀왔다면 '다녀왔어요'를 누르세요. 날짜가 기록되고 발자취 배지도 쌓여요. 다시 누르면 취소돼요.","行ったら「行ってきた」を押すと日付が記録され、足跡バッジも貯まります。もう一度押すと取り消せます。"],["地圖與連結","Map and links","지도와 링크","地図とリンク"],["點「地圖」直接用 Google 地圖開啟，有出處連結的也在這裡，會另開新分頁。","Tap “Map” to open it in Google Maps. Source links are here too and open in a new tab.","'지도'를 누르면 구글 지도로 열려요. 출처 링크도 여기 있고 새 탭에서 열려요.","「地図」でGoogleマップが開きます。出典リンクもここにあり、新しいタブで開きます。"],["有新的足跡資訊想提供，或發現資料有誤，點頁尾這兩顆按鈕填表單告訴我們。","Have a new footprint to share, or spotted a mistake? Use the two buttons in the footer to fill in a form.","새 발자취 정보를 제보하거나 오류를 발견했다면 페이지 하단의 두 버튼으로 양식을 작성해 주세요.","新しい足跡情報の提供や誤りの報告は、ページ下部の2つのボタンからフォームで教えてください。"]].forEach(a=>I18N.add(...a))}catch(e){}
try{[["← 全部國家","← All countries","← 전체 국가","← すべての国"],["韓國","South Korea","한국","韓国"],["日本","Japan","일본","日本"],["台灣","Taiwan","대만","台湾"],["美國","USA","미국","アメリカ"],["其他","Other","기타","その他"],["藝人同款足跡","Artist Footprints","아티스트 발자취","アーティストの足跡"],["成員去過的店家與景點，照著他們的足跡走一圈","Places the members have visited — follow their footsteps","멤버들이 다녀간 가게와 명소, 발자취를 따라가 보세요","メンバーが訪れたお店やスポットをたどろう"],["整理成員去過的店家與景點，去過就按「我去過了」留下紀錄","Places the members have been to. Tap “I’ve been” to keep a record","멤버들이 다녀간 곳을 모았어요. 다녀왔다면 ‘다녀왔어요’를 눌러 기록하세요","メンバーが訪れた場所をまとめました。行ったら「行ってきた」を押して記録"],["成員去過的店家與景點","Places the members have visited","멤버들이 다녀간 가게와 명소","メンバーが訪れたお店とスポット"],["搜尋店名、地點、成員","Search place, location or member","가게, 장소, 멤버 검색","店名・場所・メンバーで検索"],["全部成員","All members","전체 멤버","全メンバー"],["全部類別","All categories","전체 카테고리","全カテゴリー"],["只看還沒去過","Not visited yet","아직 안 가 본 곳만","未訪問のみ"],["👣 我去過了","👣 I’ve been here","👣 다녀왔어요","👣 行ってきた"],["我要提供足跡資訊","Submit a footprint","발자취 정보 제공하기","足跡情報を提供する"],["還沒有收錄足跡，歡迎提供資料","No footprints yet — contributions welcome","아직 등록된 발자취가 없어요. 제보를 환영해요","まだ足跡がありません。情報提供お待ちしています"],["沒有符合的足跡，換個條件試試","No matching footprints — try other filters","조건에 맞는 발자취가 없어요","該当する足跡がありません"],["已記錄這個足跡","Footprint saved","발자취를 기록했어요","足跡を記録しました"],["已取消","Removed","취소했어요","取り消しました"],["造訪","visited","방문","訪問"],["已歇業","Closed down","폐업","閉店"],["暫停營業","Temporarily closed","임시 휴업","休業中"],["已搬遷","Relocated","이전","移転"]].forEach(a=>I18N.add(...a))}catch(e){}
try{[["複製","Copy","복사","コピー"],["已複製地址","Address copied","주소를 복사했어요","住所をコピーしました"],["複製失敗，請長按地址手動複製","Copy failed — long-press the address to copy it","복사에 실패했어요. 주소를 길게 눌러 복사하세요","コピーに失敗しました。住所を長押ししてコピーしてください"],["已造訪","Visited","방문함","訪問済み"],["營業中","Open now","영업 중","営業中"],["休息中","Closed now","영업 종료","営業時間外"],["今日公休","Closed today","오늘 휴무","本日定休日"],["📅 改日期","📅 Change date","📅 날짜 변경","📅 日付変更"],["已更新造訪日期","Visit date updated","방문 날짜를 바꿨어요","訪問日を更新しました"],["日期不能晚於今天","The date can’t be in the future","오늘 이후 날짜는 고를 수 없어요","未来の日付は選べません"],["這間店已歇業，無法前往","This place has closed down and can’t be visited","이 가게는 폐업해서 갈 수 없어요","このお店は閉店しているため行けません"],["這間店已搬遷，地址可能已經不同","This place has moved — the address may differ","이 가게는 이전했어요. 주소가 다를 수 있어요","このお店は移転しました。住所が異なる場合があります"],["目前暫停營業，出發前請先確認","Temporarily closed — check before you go","현재 임시 휴업 중이에요. 가기 전에 확인하세요","現在休業中です。出発前にご確認ください"],["這個地點已不開放","This place is no longer open","이 장소는 더 이상 열려 있지 않아요","この場所は現在利用できません"],["成員","Member","멤버","メンバー"],["類別","Category","카테고리","カテゴリー"],["城市","City","도시","都市"],["足跡進度","Footprint progress","발자취 진행도","足跡の進捗"],["🏆 全部走完了！","🏆 All done!","🏆 모두 완료!","🏆 全部達成！"],["想補充足跡？","Know a spot we missed?","빠진 장소를 알고 있나요?","載っていない場所をご存じですか？"],["知道成員去過的店家或景點，歡迎提供給我們","If you know a shop or spot the members have visited, let us know.","멤버들이 다녀간 가게나 명소를 알고 있다면 알려 주세요.","メンバーが訪れたお店やスポットを知っていたら教えてください。"]].forEach(a=>I18N.add(...a))}catch(e){}
/* 足跡徽章翻譯：國家名稱＋「XX走透透」徽章（國家是動態的，所以用迴圈補；新增國家記得在這裡加一列） */
try{const CT=[["韓國","South Korea","한국","韓国"],["日本","Japan","일본","日本"],["台灣","Taiwan","대만","台湾"],["美國","USA","미국","アメリカ"],["英國","UK","영국","イギリス"],["法國","France","프랑스","フランス"],["泰國","Thailand","태국","タイ"],["香港","Hong Kong","홍콩","香港"],["新加坡","Singapore","싱가포르","シンガポール"],["澳洲","Australia","호주","オーストラリア"],["德國","Germany","독일","ドイツ"],["義大利","Italy","이탈리아","イタリア"],["西班牙","Spain","스페인","スペイン"],["加拿大","Canada","캐나다","カナダ"],["越南","Vietnam","베트남","ベトナム"],["菲律賓","Philippines","필리핀","フィリピン"],["印尼","Indonesia","인도네시아","インドネシア"],["馬來西亞","Malaysia","말레이시아","マレーシア"],["中國","China","중국","中国"],["沙烏地阿拉伯","Saudi Arabia","사우디아라비아","サウジアラビア"],["阿拉伯聯合大公國","UAE","아랍에미리트","アラブ首長国連邦"]];
CT.forEach(a=>{I18N.add(a[0],a[1],a[2],a[3]);I18N.add(a[0]+"走透透",a[1]+" complete",a[2]+" 완성",a[3]+"コンプリート");I18N.add("把"+a[0]+"的足跡全部去過","Visit every footprint in "+a[1],a[2]+"의 발자취를 모두 방문",a[3]+"の足跡を全部訪問")});
[["足跡","Footprints","발자취","足跡"],["初次足跡","First footprint","첫 발자취","初めての足跡"],["去過 1 個藝人同款足跡","Visit 1 artist footprint spot","아티스트 발자취 1곳 방문","アーティストの足跡を1か所訪問"],["足跡新星","Footprint rising star","떠오르는 발자취","足跡新星"],["累計去過 5 個藝人同款足跡","Visit 5 artist footprint spots in total","아티스트 발자취 총 5곳 방문","アーティストの足跡を累計5か所訪問"],["足跡達人","Footprint pro","발자취 달인","足跡の達人"],["累計去過 10 個藝人同款足跡","Visit 10 artist footprint spots in total","아티스트 발자취 총 10곳 방문","アーティストの足跡を累計10か所訪問"],["跨國足跡","Across borders","국경을 넘어서","国境を越えて"],["在 2 個不同的國家留下足跡","Leave footprints in 2 different countries","서로 다른 2개 나라에 발자취 남기기","2つの異なる国に足跡を残す"],["足跡制霸","Footprint master","발자취 제패","足跡制覇"],["足跡分類的徽章全部解鎖","Unlock every badge in the Footprints category","발자취 카테고리 배지를 모두 해제","足跡カテゴリのバッジをすべて解除"],["足跡一日遊","One-day footprint tour","하루 발자취 투어","足跡ワンデイツアー"],["同一天去過 3 個足跡","Visit 3 footprint spots in one day","하루에 발자취 3곳 방문","1日に足跡を3か所訪問"]].forEach(a=>I18N.add(a[0],a[1],a[2],a[3]));I18N.refresh()}catch(e){}

;/* 主程式載入完成：讓試算表更新可以重畫畫面 */
try{entSync()}catch(e){}window.__appReady=true;document.documentElement.classList.remove("pre-inner");
