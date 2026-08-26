// packages/core-location/geo.ts — Toán học vị trí thuần tuý (không đụng DB, dễ test).

/** Bán kính Trái Đất trung bình (mét) — dùng cho công thức haversine. */
const EARTH_RADIUS_M = 6_371_000

/** Lưới làm tròn của chế độ kín đáo 'approx': ~0.005° ≈ 500m ở vĩ độ Việt Nam. */
export const APPROX_GRID_DEG = 0.005

export interface LatLng {
  lat: number
  lng: number
}

/** Khoảng cách đường chim bay giữa 2 toạ độ, tính bằng MÉT (haversine). */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)))
}

/**
 * Làm tròn toạ độ về lưới ~500m — chế độ 'approx' cho người muốn bạn bè biết "đang ở khu nào"
 * mà không lộ chính xác chỗ đứng. Làm tròn PHÍA SERVER để toạ độ thật không bao giờ rời máy chủ
 * tới người khác (client vẫn gửi toạ độ thật để tự tính khoảng cách của chính mình).
 */
export function coarsen(point: LatLng): LatLng {
  const round = (v: number) => Math.round(v / APPROX_GRID_DEG) * APPROX_GRID_DEG
  // Làm tròn 6 chữ số thập phân để tránh sai số dấu phẩy động kiểu 10.005000000000001.
  return { lat: Number(round(point.lat).toFixed(6)), lng: Number(round(point.lng).toFixed(6)) }
}

/** Tâm nhóm (trung bình cộng) — dùng làm mốc khi chuyến chưa đặt điểm hẹn. */
export function groupCenter(points: LatLng[]): LatLng | null {
  if (points.length === 0) return null
  const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lng: acc.lng + p.lng }), {
    lat: 0,
    lng: 0,
  })
  return { lat: sum.lat / points.length, lng: sum.lng / points.length }
}

/**
 * Ai đang "đi lạc": khoảng cách tới mốc (điểm hẹn nếu có, không thì tâm nhóm) vượt ngưỡng.
 * Trả về danh sách kèm khoảng cách để UI hiển thị "cách nhóm 420m".
 */
export function findStragglers(
  members: { userId: string; position: LatLng | null }[],
  anchor: LatLng | null,
  radiusM: number,
): { userId: string; distanceM: number }[] {
  if (!anchor) return []
  const out: { userId: string; distanceM: number }[] = []
  for (const m of members) {
    if (!m.position) continue
    const d = distanceMeters(m.position, anchor)
    if (d > radiusM) out.push({ userId: m.userId, distanceM: Math.round(d) })
  }
  return out.sort((a, b) => b.distanceM - a.distanceM)
}

/**
 * Có đáng gửi vị trí mới lên server không? Tiết kiệm pin + băng thông: chỉ gửi khi đã di chuyển
 * đủ xa HOẶC đã quá lâu kể từ lần gửi trước (nhịp tim để bạn bè biết mình còn online).
 */
export function shouldSendUpdate(
  previous: { point: LatLng; sentAtMs: number } | null,
  next: LatLng,
  nowMs: number,
  minDistanceM = 20,
  maxIntervalMs = 30_000,
): boolean {
  if (!previous) return true
  if (nowMs - previous.sentAtMs >= maxIntervalMs) return true
  return distanceMeters(previous.point, next) >= minDistanceM
}
