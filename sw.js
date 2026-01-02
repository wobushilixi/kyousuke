/**
 * sw.js - iozz Minimalist v4.0
 * 强制更新版本号以应用新UI
 */
const CACHE_NAME = 'iozz-v4.0-minimal';
const ASSETS = [
    '/',
    '/index.html',
    'https://img.cdn1.vip/i/6921348cd5a96_1763783820.webp'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // 忽略测速请求
    if (event.request.url.includes('t=')) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            // 总是尝试在后台更新 HTML
            const networkFetch = fetch(event.request).then(resp => {
                if (resp.ok) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return resp;
            }).catch(() => cached);
            
            return cached || networkFetch;
        })
    );
});
