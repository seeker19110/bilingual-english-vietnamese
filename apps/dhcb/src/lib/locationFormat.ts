// apps/dhcb/src/lib/locationFormat.ts — Đổi số liệu thô của tính năng "Đi chung" thành chữ mà
// người đang vừa đi vừa liếc điện thoại đọc được ngay. Tách khỏi component để test được và để
// bản đồ, danh sách, cảnh báo lạc luôn nói CÙNG một kiểu (mét vs km, "vừa xong" vs "2 phút
// trước") — trước đây mỗi chỗ tự định dạng một kiểu là nguồn gây khó hiểu.

/** Khoảng cách: dưới 1 km đọc theo mét (làm tròn), từ 1 km trở lên đọc theo km 1 chữ số thập phân. */
export function formatDistance(meters: number): string {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

/** Lần cập nhật vị trí gần nhất. `null` = người này chưa từng chia sẻ trong chuyến. */
export function formatAgo(iso: string | null): string {
  if (!iso) return 'chưa chia sẻ'
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  // Dưới 15 giây coi như đang chạy thật — hiện "vừa xong" đỡ nhảy số liên tục gây nhiễu mắt.
  if (seconds < 15) return 'vừa xong'
  if (seconds < 60) return `${seconds} giây trước`
  if (seconds < 3600) return `${Math.round(seconds / 60)} phút trước`
  return `${Math.round(seconds / 3600)} giờ trước`
}

/** Thời gian còn lại của chuyến — mọi chuyến đều có hạn, không có chế độ vĩnh viễn. */
export function formatRemaining(expiresAt: string): string {
  const minutes = Math.round((new Date(expiresAt).getTime() - Date.now()) / 60000)
  if (minutes <= 0) return 'đã hết hạn'
  if (minutes < 60) return `còn ${minutes} phút`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `còn ${hours} giờ` : `còn ${hours} giờ ${rest} phút`
}
