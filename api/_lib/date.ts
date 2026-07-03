// date.ts — Ngày "hôm nay" THEO GIỜ VIỆT NAM (Asia/Ho_Chi_Minh, UTC+7, không DST).
//
// VẤN ĐỀ (audit 2026-07-03): usage.ts/push.ts/dictionary.ts trước đây dùng
// `new Date().toISOString().slice(0, 10)` — luôn trả NGÀY UTC, khiến ranh giới
// "ngày mới" (reset lượt dùng, đổi từ vựng hôm nay...) thực chất là 7h sáng giờ
// Việt Nam thay vì nửa đêm. PHẢI khớp với src/lib/date.ts (client) để lượt
// dùng/"từ vựng hôm nay" hiển thị đồng nhất giữa client và server.
//
// Việt Nam không có giờ mùa hè (DST) → offset +7h luôn đúng, không cần thư viện
// timezone ngoài.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000

// Ngày (YYYY-MM-DD) theo giờ Việt Nam của thời điểm `d` (mặc định: hiện tại).
export function vnDateStr(d: Date = new Date()): string {
  return new Date(d.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}
