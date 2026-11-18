// שומר את כל האפליקציה בטלפון. כשיש אינטרנט, מעדכן ברקע תוכן חדש.
// בכל עדכון תוכן: להעלות את המספר בשורה הבאה.
const CACHE = "boker-v3";
const FILES = [
  "./", "index.html", "content.js", "stories.js", "stories2.js", "manifest.json", "icon-180.png", "icon-512.png",
  "fonts/heebo-he-400.woff2", "fonts/heebo-he-500.woff2", "fonts/heebo-he-700.woff2", "fonts/heebo-he-900.woff2",
  "fonts/heebo-la-400.woff2", "fonts/heebo-la-500.woff2", "fonts/heebo-la-700.woff2", "fonts/heebo-la-900.woff2",
  "img/alexandria.jpg", "img/btc-gpu.jpg", "img/btc-hero.jpg", "img/btc-satoshi.jpg",
  "img/jordan-arena.jpg", "img/jordan-baseball.jpg", "img/jordan-hero.jpg", "img/marcus.jpg",
  "img/money.jpg", "img/nike-hero.jpg", "img/nike-kobe.jpg", "img/nike-waffle.jpg",
  "img/nokia.jpg", "img/tulips.jpg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const key = req.mode === "navigate" ? "index.html" : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
