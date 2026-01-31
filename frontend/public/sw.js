const CACHE_VERSION = '1.0.8';
const CACHE_NAME = `enpeak-v${CACHE_VERSION}`;

// 캐시할 정적 리소스 (아이콘, 이미지 등)
const STATIC_CACHE = [
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('SW installing, version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache:', CACHE_NAME);
        return cache.addAll(STATIC_CACHE);
      })
      .catch((error) => {
        console.log('Cache failed:', error);
      })
  );
  self.skipWaiting();
});

// 메시지 리스너 (강제 업데이트용)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    console.log('SW skipWaiting called');
    self.skipWaiting();
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW activating, version:', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first for HTML/JS/CSS, cache first for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // version.json은 항상 네트워크에서 가져옴
  if (url.pathname.includes('version.json')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // HTML, JS, CSS 파일은 항상 네트워크 우선
  const isDocument = event.request.mode === 'navigate';
  const isScript = url.pathname.includes('.js');
  const isStyle = url.pathname.includes('.css');
  const isNextChunk = url.pathname.includes('/_next/');

  if (isDocument || isScript || isStyle || isNextChunk) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 성공하면 캐시 업데이트
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // 네트워크 실패 시 캐시 폴백
          return caches.match(event.request);
        })
    );
    return;
  }

  // 이미지, 폰트 등 정적 리소스는 캐시 우선
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});
