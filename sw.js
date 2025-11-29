/**
 * sw.js - Service Worker for PWA Offline Caching
 * 必须作为独立文件与 index.html 放在同一目录下
 */
const CACHE_NAME = 'lyx-redirect-v1.0.1'; // 每次更新 Service Worker 时，请更新版本号

// 预缓存列表：在安装时缓存所有必要的静态资源
const urlsToCache = [
    '/', // 根目录下的 index.html
    'index.html',
    // 外部资源（CDN）
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
    'https://fonts.gstatic.com/s/inter/v12/UuT_YwI8F8E-gC2c-3zM4Q.woff2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    // 网站 Logo
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
                // 如果缓存中找到，直接返回缓存
                if (response) {
                    return response;
                }
                
                // 缓存中未找到，进行网络请求
                return fetch(event.request);
            })
    );
});
