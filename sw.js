// Dimsum offline support.
// The app page is fetched fresh when online (so updates arrive straight away) and served from the cache when offline.
// Fonts and the on-device face finder are cached the first time they are used. Claude API calls are never cached.
const SHELL = "dimsum-shell-v1";
const RUNTIME = "dimsum-runtime-v1";
const SHELL_FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
const RUNTIME_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net", "storage.googleapis.com"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== RUNTIME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)); }

async function pageFirstFromNetwork(request) {
  const cache = await caches.open(SHELL);
  try {
    const fresh = await Promise.race([fetch(request), timeout(5000)]);
    if (fresh && fresh.ok) cache.put("index.html", fresh.clone());
    return fresh;
  } catch {
    return (await cache.match("index.html")) || (await cache.match("./")) || Response.error();
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) cache.put(request, res.clone());
  return res;
}

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname === "api.anthropic.com") return;

  if (req.mode === "navigate" && url.origin === self.location.origin) {
    event.respondWith(pageFirstFromNetwork(req));
    return;
  }
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req, SHELL));
    return;
  }
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    event.respondWith(cacheFirst(req, RUNTIME));
  }
});
