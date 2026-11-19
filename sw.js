// שומר את האפליקציה בטלפון. data/index.json תמיד מנסה קודם מהרשת (כדי לקבל סיפורים חדשים),
// כל השאר: מהזיכרון מיד, ומתעדכן ברקע כשיש אינטרנט.
const CACHE = "boker-1795129148";
const CORE = ["./", "index.html", "manifest.json", "icon-180.png", "icon-512.png", "data/index.json",
  "fonts/heebo-he-400.woff2", "fonts/heebo-he-500.woff2", "fonts/heebo-he-700.woff2", "fonts/heebo-he-900.woff2",
  "fonts/heebo-la-400.woff2", "fonts/heebo-la-500.woff2", "fonts/heebo-la-700.woff2", "fonts/heebo-la-900.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  // שומרים את המטמון הקודם (סיפורים ותמונות) ומעבירים אותו לגרסה החדשה
  e.waitUntil((async () => {
    const keys = await caches.keys(), cur = await caches.open(CACHE);
    for (const k of keys) if (k !== CACHE) {
      const old = await caches.open(k);
      for (const req of await old.keys()) { if (!(await cur.match(req))) { const r = await old.match(req); if (r) await cur.put(req, r); } }
      await caches.delete(k);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const key = req.mode === "navigate" ? "index.html" : url.pathname.replace(/^.*?\/boker\//, "").replace(/^\//, "") || "index.html";
  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(key, { ignoreSearch: true }) || await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => { if (res && res.ok) cache.put(key, res.clone()); return res; });
    if (key === "data/index.json" || key === "index.html") return net.catch(() => cached);
    if (cached) { net.catch(() => {}); return cached; }
    return net;
  }));
});
