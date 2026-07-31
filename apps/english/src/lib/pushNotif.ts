// pushNotif.ts — Đăng ký / hủy Web Push Notification
// Yêu cầu: trình duyệt hỗ trợ serviceWorker + PushManager (Chrome/Edge/Firefox/Safari 16.4+)

const SW_PATH = '/sw.js'

// Kiểm tra trình duyệt có hỗ trợ push không
export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

// Lấy trạng thái quyền thông báo hiện tại
export function getNotifPermission(): NotificationPermission {
  return Notification.permission
}

// Đăng ký SW + subscribe push, gửi subscription lên server.
// remindHour: giờ UTC (0–23) muốn được nhắc học mỗi ngày (server gửi đúng giờ này).
export async function subscribePush(accessToken: string, remindHour?: number): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    // Lấy VAPID public key từ server
    const res = await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'vapid-key' }),
    })
    if (!res.ok) {
      console.warn('[push] Failed to fetch VAPID key:', res.status)
      return false
    }
    const data = (await res.json()) as unknown
    if (!data || typeof data !== 'object' || !('publicKey' in data)) {
      console.warn('[push] Invalid VAPID response')
      return false
    }
    const { publicKey } = data as { publicKey?: unknown }
    if (typeof publicKey !== 'string' || !publicKey) {
      console.warn('[push] VAPID key is invalid')
      return false
    }

    // Đăng ký service worker
    const reg = await navigator.serviceWorker.register(SW_PATH)
    await navigator.serviceWorker.ready

    // Xin quyền thông báo
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    // Subscribe push (Notification.requestPermission đã hỏi ở trên)
    const existing = await reg.pushManager.getSubscription()
    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as unknown as ArrayBuffer,
      }))

    // Gửi subscription lên server (kèm giờ nhắc nếu có)
    const r = await fetch('/api/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ action: 'subscribe', subscription: sub.toJSON(), remindHour }),
    })
    if (!r.ok) {
      console.warn('[push] Failed to subscribe:', r.status)
      return false
    }
    const respData = (await r.json()) as unknown
    if (!respData || typeof respData !== 'object' || !('ok' in respData)) {
      console.warn('[push] Invalid subscribe response')
      return false
    }
    return (respData as { ok?: unknown }).ok === true
  } catch (err) {
    console.warn('[push] đăng ký thất bại:', err)
    return false
  }
}

// Hủy đăng ký push
export async function unsubscribePush(accessToken: string): Promise<boolean> {
  if (!isPushSupported()) return false
  try {
    const reg = await navigator.serviceWorker.getRegistration(SW_PATH)
    const sub = await reg?.pushManager?.getSubscription()
    if (!sub) return true

    await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ action: 'unsubscribe', subscription: sub.toJSON() }),
    })
    await sub.unsubscribe()
    return true
  } catch {
    return false
  }
}

// Chuyển VAPID public key từ base64url sang Uint8Array (PushManager yêu cầu)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}
