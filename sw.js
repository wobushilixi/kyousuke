/**
 * sw.js - iozz Minimalist Service Worker
 */
const CACHE_NAME = 'iozz-v2.0';
const ASSETS = [
    '/',
    '/index.html',
    'https://img.cdn1.vip/i/6921348cd5a96_1763783820.webp' // 仅缓存 Logo
];

// Install: 立即激活并缓存核心文件
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// Activate: 清理旧缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        )).then(() => self.clients.claim())
    );
});

// Fetch: 极速响应策略 (Stale-While-Revalidate 对于 HTML)
self.addEventListener('fetch', event => {
    // 忽略测速请求
    if (event.request.url.includes('t=')) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // 如果有缓存，先返回缓存（极速）
            const fetchPromise = fetch(event.request).then(networkResponse => {
                // 后台更新缓存
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
                }
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});
