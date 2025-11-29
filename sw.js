/**
 * sw.js - Service Worker for PWA Offline Caching
 * 缓存策略: 优先从缓存读取 (Cache-First)
 */
const CACHE_NAME = 'lyx-redirect-v1.0.0';

// 预缓存列表：在安装时缓存所有必要的静态资源
const urlsToCache = [
    '/', // 根目录下的 index.html
    'index.html',
    // 外部资源（CDN）
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css',
    // 字体文件 (防止 FOUC)
    'https://fonts.gstatic.com/s/inter/v12/UuT_YwI8F8E-gC2c-3zM4Q.woff2',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
    // 网站 Logo (替换为您自己的 Logo URL)
    'https://img.cdn1.vip/i/6921348cd5a96_1763783820.webp',
];

// 安装阶段：缓存静态文件
self.addEventListener('install', event => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Caching shell assets:', urlsToCache);
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })));
            })
    );
});

// 激活阶段：清理旧版本缓存
self.addEventListener('activate', event => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 抓取阶段：缓存优先策略
self.addEventListener('fetch', event => {
    // 忽略 Umami 等统计脚本，避免干扰
    if (event.request.url.includes('umami.is')) {
        return;
    }
    
    // 忽略测速请求 (带有 ?t= 时间戳的请求)
    if (event.request.url.includes('t=')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 1. 如果缓存中找到，直接返回缓存
                if (response) {
                    console.log('[SW] Cache hit for:', event.request.url);
                    return response;
                }
                
                // 2. 缓存中未找到，进行网络请求
                console.log('[SW] Fetching from network:', event.request.url);
                return fetch(event.request);
            })
            .catch(error => {
                // 如果网络和缓存都失败 (例如离线且缓存中没有)，可以在这里返回一个离线提示页面
                console.error('[SW] Fetch failed:', error);
                // return caches.match('/offline.html'); // 如果你创建了离线页面
            })
    );
});
