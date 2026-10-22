/**
 * LỚP HỌC TƯƠNG TÁC V21 - SERVICE WORKER
 * - Chỉ cache tài nguyên tĩnh (App Shell, thư viện CDN).
 * - Tuyệt đối không cache dữ liệu học sinh / điểm số từ /api/ hoặc script.google.com.
 * - Không lưu vào cache các phản hồi lỗi HTTP (!response.ok).
 */
const CACHE = 'classroom-v21-0-tv-first';
const APP_SHELL = [
  './',
  './index.html'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL)).catch(() => {})
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  // Không bao giờ lưu cache dữ liệu API riêng tư hoặc Google Apps Script
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('script.google.com') ||
    url.hostname.includes('googleusercontent.com')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.ok && response.status === 200 && (url.origin === self.location.origin || url.hostname.includes('cdn.jsdelivr.net'))) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then(cached => cached || caches.match('./index.html'))
      )
  );
});