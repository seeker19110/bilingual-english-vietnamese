// Service worker tối giản — giúp app cài được lên màn hình chính (PWA) và
// mở nhanh hơn khi quay lại. Chiến lược:
//  - Tài nguyên tĩnh (JS/CSS/font/ảnh): cache-first (lấy cache trước, có mạng thì cập nhật ngầm).
//  - Điều hướng trang (HTML) và các lệnh gọi API (/api/...): luôn ưu tiên mạng,
//    KHÔNG cache để tránh trả dữ liệu cũ / nội dung cần đăng nhập.
const CACHE = 'gia-su-ai-v1'

// Khi cài bản service worker mới: kích hoạt ngay, không chờ tab cũ đóng.
self.addEventListener('install', () => self.skipWaiting())

// Khi kích hoạt: xoá các cache phiên bản cũ rồi giành quyền điều khiển mọi tab.
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
