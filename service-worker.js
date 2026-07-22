/* Network-first service worker with cache fallback. The website does not depend on it. */
var CACHE = 'kasai-foundation-cross-browser-20260723-v2';
var CORE = [
  './', 'index.html', 'zaidan.html', 'kasaishi.html', 'teikan.html',
  'hyousyou.html', 'youtube.html', 'member.html', 'news.html', 'contact.html',
  'disclosure.html', 'privacy.html', 'sitepolicy.html', 'english.html', '404.html',
  'assets/cross-browser.css?v=20260723-crossbrowser-2',
  'assets/compatibility.css?v=20260723-crossbrowser-2',
  'assets/polyfills.js?v=20260723-crossbrowser-2',
  'assets/site.js?v=20260723-crossbrowser-2',
  'assets/ultimate-color.js?v=20260723-crossbrowser-2',
  'assets/member-form.js?v=20260723-crossbrowser-2',
  'assets/contact-form.js?v=20260723-crossbrowser-2',
  'assets/foundation-emblem.png', 'assets/kasai-character-premium.png',
  'assets/washi-texture.png', 'assets/asanoha.svg', 'assets/favicon.png',
  'assets/favicon.ico', 'assets/icon-192.png', 'assets/icon-512.png',
  'assets/og-image.png', 'manifest.webmanifest', 'browserconfig.xml'
];

self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(CORE); })
      ['catch'](function () { return undefined; })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        return key !== CACHE ? caches['delete'](key) : Promise.resolve(false);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var request = event.request;
  if (request.method !== 'GET') return;
  if (request.cache === 'only-if-cached' && request.mode !== 'same-origin') return;
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then(function (response) {
      if (response && response.ok) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { return cache.put(request, copy); });
      }
      return response;
    })['catch'](function () {
      return caches.match(request, { ignoreSearch: true }).then(function (cached) {
        if (cached) return cached;
        if (request.mode === 'navigate') return caches.match('404.html');
        return new Response('', { status: 504, statusText: 'Offline' });
      });
    })
  );
});
