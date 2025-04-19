
const cacheName = 'cache-v1';

// 📝 사전 캐싱할 리소스 목록
const precacheResources = ['/', '/index.html'];

// ✅ 서비스워커 설치 시 캐시 설정
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(precacheResources);
    })
  );
});

// ✅ fetch 요청 가로채기 → 캐시 있으면 반환
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse; // 캐시된 데이터 반환
      }
      return fetch(event.request); // 없으면 네트워크로
    })
  );
});
