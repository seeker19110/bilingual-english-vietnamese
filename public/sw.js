// Service Worker — PWA caching + web push notification nhắc học mỗi ngày
// Chiến lược cache:
//  - Tài nguyên app-shell (JS/CSS/font/ảnh): cache-first + cập nhật ngầm (SWR).
//  - Dữ liệu tĩnh /data/*.json: SWR nhưng lưu ở cache RIÊNG (DATA_CACHE) KHÔNG bị xoá
//    mỗi lần deploy → 15MB tải dần (xem src/lib/dataPrecache.ts) không phải tải lại.
//  - /data/manifest.json: LUÔN ưu tiên mạng (để client phát hiện bản mới), fallback cache.
//  - Điều hướng trang (HTML) và API (/api/...): luôn ưu tiên mạng.
const SHELL_CACHE = 'gia-su-shell-v2'  // bump khi đổi chiến lược cache app-shell
const DATA_CACHE = 'gia-su-data'        // tên ỔN ĐỊNH — phải khớp src/lib/dataPrecache.ts
const KEEP = [SHELL_CACHE, DATA_CACHE]

// Khi cài bản mới: kích hoạt ngay, không chờ tab cũ đóng.
self.addEventListener('install', () => self.skipWaiting())

// Khi kích hoạt: xoá cache CŨ (GIỮ lại DATA_CACHE bền) rồi giành quyền điều khiển mọi tab.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !KEEP.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Cache-first + cập nhật ngầm (stale-while-revalidate) vào cache `cacheName`.
function staleWhileRevalidate(request, cacheName) {
  return caches.match(request).then((cached) => {
    const network = fetch(request)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone()
          caches.open(cacheName).then((c) => c.put(request, copy))
        }
        return res
      })
      .catch(() => cached || new Response('Offline', { status: 503 }))
    return cached || network
  })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Chỉ xử lý GET cùng origin; còn lại để trình duyệt lo (POST, API bên thứ ba...).
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // KHÔNG đụng vào API: cần dữ liệu mới + quyền đăng nhập.
  if (url.pathname.startsWith('/api/')) return

  // manifest.json: ưu tiên mạng (phát hiện bản mới), fallback cache khi offline.
  if (url.pathname === '/data/manifest.json') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } }))
      ),
    )
    return
  }

  // Điều hướng trang (HTML): network-first, fallback về cache khi offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match('/').then((root) => root || new Response('Offline', { status: 503 })))
      ),
    )
    return
  }

  // Dữ liệu tĩnh /data/: SWR vào cache RIÊNG (bền qua deploy).
  if (url.pathname.startsWith('/data/')) {
    event.respondWith(staleWhileRevalidate(request, DATA_CACHE))
    return
  }

  // Còn lại (app-shell JS/CSS/ảnh): SWR vào cache shell.
  event.respondWith(staleWhileRevalidate(request, SHELL_CACHE))
})

// ── Web Push: nhắc học mỗi ngày ───────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'AI Gia sư tiếng Anh'
  const body  = data.body  || 'Đừng quên luyện tập hôm nay nhé! 🔥'
  const icon  = data.icon  || '/favicon.ico'
  const url   = data.url   || '/'

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      data: { url },
      tag: 'daily-reminder',   // ghi đè notification cũ nếu chưa đọc
      renotify: false,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes(url) && 'focus' in client) return client.focus()
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
