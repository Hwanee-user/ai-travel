/* 여행AI비서 Service Worker — 오프라인 캐시 */
const CACHE = 'travel-ai-v1';
const ASSETS = [
  '/ai-travel/',
  '/ai-travel/index.html',
  '/ai-travel/manifest.json',
  '/ai-travel/icon-192.png',
  '/ai-travel/icon-512.png',
];

/* 설치: 핵심 파일 캐시 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* 활성화: 구 캐시 정리 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* 요청: 캐시 우선, 없으면 네트워크 */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        /* 성공한 응답은 캐시에 추가 저장 */
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/ai-travel/index.html'));
    })
  );
});
