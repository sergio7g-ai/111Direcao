const CACHE_NAME = "orienta-te-direcao-v4";
const APP_SHELL = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png",
  "./assets/pioneer-compass.png", "./assets/pioneer-fish.png",
  "./assets/pioneer-axe.png", "./assets/pioneer-drop.png",
  "./assets/header.webp", "./assets/footer.webp",
  "./assets/pdf-header.jpg", "./assets/pdf-footer.jpg", "./assets/pdf-compass.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if(event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if(url.origin !== location.origin) return;
  if(event.request.mode === "navigate" || url.pathname.endsWith("/index.html")) {
    event.respondWith(
      caches.match("./index.html").then(cached => {
        const network = fetch(event.request).then(response => {
          if(response.ok) caches.open(CACHE_NAME).then(c=>c.put("./index.html", response.clone()));
          return response;
        }).catch(()=>cached);
        return cached || network;
      })
    );
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok){ const copy=response.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request,copy)); }
    return response;
  }).catch(()=>caches.match("./index.html"))));
});
