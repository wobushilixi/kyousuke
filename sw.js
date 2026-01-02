/**
 * sw.js - iozz Service Worker v2.1 (UI Update)
 */
const CACHE_NAME = 'iozz-v2.1'; // 升级版本号以强制更新缓存
const ASSETS = [
    '/',
    '/index.html',
    'https://img.cdn1.vip/i/6921348cd5a96_1763783820.webp'
];

// Install
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activate - 清理旧版本 (v2.0)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        )).then(() => self.clients.claim())
    );
});

// Fetch - Stale-While-Revalidate
self.addEventListener('fetch', event => {
    if (event.request.url.includes('t=')) return; // 忽略测速请求

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request).then(networkResponse => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return networkResponse;
            }).catch(() => cachedResponse); // 离线时如果fetch失败，返回缓存
            return cachedResponse || fetchPromise;
        })
    );
});
