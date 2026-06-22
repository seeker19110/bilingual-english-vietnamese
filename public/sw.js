// Service Worker — PWA caching + web push notification nhắc học mỗi ngày
// Chiến lược cache:
//  - Tài nguyên tĩnh (JS/CSS/font/ảnh): cache-first (lấy cache trước, cập nhật ngầm).
//  - Điều hướng trang (HTML) và API (/api/...): luôn ưu tiên mạng, KHÔNG cache.
const CACHE = 'gia-su-ai-v1'

// Khi cài bản mới: kích hoạt ngay, không chờ tab cũ đóng.
self.addEventListener('install', () => self.skipWaiting())

// Khi kích hoạt: xoá cache phiên bản cũ rồi giành quyền điều khiển mọi tab.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Chỉ xử lý GET cùng origin; còn lại để trình duyệt lo (POST, API bên thứ ba...).
  if (request.method !== 'GET' || url.origin !== self.location.origin) return

  // KHÔNG đụng vào API: cần dữ liệu mới + quyền đăng nhập.
  if (url.pathname.startsWith('/api/')) return

  // Điều hướng trang (HTML): network-first, fallback về cache khi offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match('/'))),
    )
    return
  }

  // Tài nguyên tĩnh: cache-first + cập nhật ngầm (stale-while-revalidate).
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return res
        })
        .catch(() => cached)
      return cached || network
    }),
  )
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
