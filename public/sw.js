// Service Worker — xử lý web push notification nhắc học mỗi ngày
// File này ở public/ để Vite serve tại gốc: /sw.js

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
      tag: 'daily-reminder',         // ghi đè notification cũ nếu chưa đọc
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
