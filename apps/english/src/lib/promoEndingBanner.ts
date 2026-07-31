// lib/promoEndingBanner.ts — Logic THUẦN (không đụng DOM/localStorage) cho
// PromoEndingBanner: quyết định có nên hiện banner báo trước "sắp hết khuyến mãi
// VIP toàn quyền" hay không. Tách riêng khỏi component để dễ viết test cho các ca
// biên ngày tháng (điểm dễ sai nhất của tính năng này).
import { vnDateStr, MS_DAY } from './date'

// Chỉ báo trước khi còn ≤ 30 ngày tới hạn khuyến mãi — đủ sớm để không gây sốc,
// không quá sớm để khỏi gây phiền cả tháng trời.
export const WARNING_WINDOW_DAYS = 30

// Key localStorage lưu NGÀY (YYYY-MM-DD, giờ Việt Nam) người dùng bấm đóng banner
// lần gần nhất — dùng để chỉ ẩn banner TRONG NGÀY đó, không ẩn vĩnh viễn.
export const PROMO_BANNER_DISMISS_KEY = 'promo_ending_banner_dismissed_at'

// Số ngày còn lại tới `promoUntil` tính từ `now` (làm tròn LÊN — còn vài giờ của
// ngày thứ 30 vẫn tính là "còn 30 ngày", không tụt xuống 29 gây hụt hẫng).
export function daysUntilPromoEnds(promoUntil: string, now: Date): number {
  return Math.ceil((new Date(promoUntil).getTime() - now.getTime()) / MS_DAY)
}

// Có nên hiện banner hay không — hàm thuần, nhận đủ dữ liệu qua tham số để test
// không cần mock localStorage/Date thật.
//
// `dismissedAtDateStr`: ngày (YYYY-MM-DD giờ VN) lần gần nhất user bấm đóng, hoặc
// null nếu chưa từng đóng.
export function shouldShowPromoEndingBanner(
  promoUntil: string | null,
  now: Date,
  dismissedAtDateStr: string | null,
): boolean {
  if (promoUntil === null) return false

  const promoTime = new Date(promoUntil).getTime()
  if (promoTime <= now.getTime()) return false // Đã hết hạn — không phải việc của banner này

  const daysLeft = daysUntilPromoEnds(promoUntil, now)
  if (daysLeft > WARNING_WINDOW_DAYS) return false

  // Đã đóng ĐÚNG HÔM NAY (giờ VN) → khỏi hiện lại; đóng hôm qua trở về trước thì
  // vẫn hiện lại nếu còn trong hạn cảnh báo.
  if (dismissedAtDateStr !== null && dismissedAtDateStr === vnDateStr(now)) return false

  return true
}

// Định dạng ngày dd/mm/yyyy THEO GIỜ VIỆT NAM (nhất quán với vnDateStr() dùng
// chung toàn app) — tránh lệch ngày nếu trình duyệt người xem ở múi giờ khác.
export function formatDateVN(iso: string): string {
  const [y, m, d] = vnDateStr(new Date(iso)).split('-')
  return `${d}/${m}/${y}`
}
