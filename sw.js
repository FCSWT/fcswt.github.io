/* FC 수원호랑이 앱 — 화면 파일을 폰에 저장해 두고 바로 열기 (데이터는 항상 서버에서) */
const CACHE = 'fc-swt-v4';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // 서버 요청(POST)은 건드리지 않음
  const url = new URL(req.url);
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  // 화면 파일·글꼴: 저장본을 바로 주고, 뒤에서 새 버전을 받아 다음 실행에 반영
  e.respondWith(caches.open(CACHE).then(c => c.match(req, { ignoreSearch: url.origin === location.origin }).then(hit => {
    const net = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  })));
});
