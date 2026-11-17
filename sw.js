// Offline cache for the Hanoi map. Bump VERSION whenever index.html changes.
const VERSION='hanoi-map-2026-11-17b';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
const put=(req,res)=>{if(res&&(res.ok||res.type==='opaque')){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}return res;};
self.addEventListener('fetch',e=>{const req=e.request;if(req.method!=='GET')return;const url=new URL(req.url);
  const font=url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com';
  if(url.origin!==location.origin&&!font)return;
  if(req.mode==='navigate'){
    // the newest page when the network answers within 3 seconds, the saved one otherwise
    e.respondWith(new Promise(resolve=>{let done=false;const cached=()=>caches.match('index.html').then(r=>r||caches.match('./'));
      const t=setTimeout(()=>{if(!done){done=true;cached().then(r=>resolve(r||fetch(req)));}},3000);
      fetch(req).then(res=>{clearTimeout(t);put('index.html',res.clone());if(!done){done=true;resolve(res);}})
        .catch(()=>{clearTimeout(t);if(!done){done=true;cached().then(r=>resolve(r||Response.error()));}});}));
    return;}
  // everything else (icons, fonts): saved copy first, fetched and saved when missing
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>put(req,res))));});
