/**
 * sw.js - Service Worker for PWA Offline Caching
 * 必须作为独立文件与 index.html 放在同一目录下
 */
const CACHE_NAME = 'lyx-redirect-v1.0.2'; // 请更新版本号以触发新的缓存

// 预缓存列表
const urlsToCache = [
    '/', 
    'index.html',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
    'https://fonts.gstatic.com/s/inter/v12/UuT_YwI8F8E-gC2c-3zM4Q.woff2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    'https://img.cdn1.vip/i/6921348cd5a96_1763783820.webp',
];

// 安装阶段：缓存静态文件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })));
            })
    );
});

// 激活阶段：清理旧版本缓存
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 抓取阶段：缓存优先策略 (Cache-First)
self.addEventListener('fetch', event => {
    // 忽略统计脚本和测速请求 (带有 ?t= 的请求)
    if (event.request.url.includes('umami.is') || event.request.url.includes('t=')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
