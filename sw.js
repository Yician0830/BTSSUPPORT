/* 離線快取：頁面與程式檔「先連網、逾時就用快取」；圖片、字型、地圖函式庫「有快取就先用」。
   更新網站內容後，把下面的 VER 改一個值，舊快取就會被清掉。 */
const VER="v25",CORE="core-"+VER,RUN="run-"+VER;
const FILES=["./","index.html","data.js","i18n.js","manifest.json","icon-192.png","icon-512.png"];
/* 選用檔（專輯封面等）：檔案還沒放上去也不會讓安裝失敗。新增封面可以加在這裡，沒加的封面會在第一次看到時自動存起來。 */
const OPT=["IMG/IMG_1293.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CORE).then(c=>c.addAll(FILES).then(()=>Promise.all(OPT.map(f=>c.add(f).catch(()=>{}))))).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CORE&&n!==RUN).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
const put=(name,req,res)=>{if(res&&(res.ok||res.type==="opaque"))caches.open(name).then(c=>c.put(req,res.clone()));return res};
function netFirst(req,name,ms){return new Promise(ok=>{let done=false;
const fall=()=>caches.match(req,{ignoreSearch:true}).then(r=>{if(r&&!done){done=true;ok(r)}});
const t=setTimeout(fall,ms);
fetch(req).then(r=>{clearTimeout(t);if(!done){done=true;ok(put(name,req,r))}else put(name,req,r)}).catch(()=>{clearTimeout(t);fall().then(()=>{if(!done){done=true;ok(Response.error())}})})})}
function cacheFirst(req){return caches.match(req).then(h=>h||fetch(req).then(r=>put(RUN,req,r)))}
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
if(u.origin===location.origin){
if(r.mode==="navigate"||/\.(html|js|json)$/.test(u.pathname)||u.pathname.endsWith("/")){e.respondWith(netFirst(r,CORE,3500));return}
e.respondWith(cacheFirst(r));return}
if(/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)$/.test(u.hostname)){e.respondWith(cacheFirst(r))}
/* Google 試算表與地圖圖磚不經過 Service Worker：試算表內容由頁面自己存在 localStorage */});
