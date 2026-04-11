// TeeLibrary Service Worker
const CACHE = 'teelibrary-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      // addAll selže, pokud kterékoli aktivum chybí → použijeme Promise.all s individuálním catch
      Promise.all(
        ASSETS.map((url) =>
          c.add(url).catch(() => console.warn('SW cache skip:', url))
        )
      )
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;

  // Firebase / Google requesty nikdy necachujeme — vždy čerstvé
  if (
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('googleapis.com') ||
    request.url.includes('gstatic.com/firebasejs')
  ) {
    return; // necháme projít do sítě
  }

  // Network-first pro HTML, aby se změny v appce projevily hned
  if (request.mode === 'navigate' || request.destination === 'document') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Cache-first pro statická aktiva
  e.respondWith(
    caches.match(request).then((r) => r || fetch(request))
  );
});
