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

// ── Tiện ích so/dịch chuỗi ngày "YYYY-MM-DD" — PHẢI khớp src/lib/date.ts (client)
// để nội dung nhắc học theo ngữ cảnh (② M3, api/_lib/reminderContent.ts) tính
// streak/tuần cùng luật với client. ─────────────────────────────────────────
const MS_DAY = 86_400_000

function dateStrToMs(d: string): number {
  return new Date(`${d}T00:00:00Z`).getTime()
}

// Ngày cách `d` đúng `n` ngày (n âm = lùi về quá khứ).
export function addDays(d: string, n: number): string {
  return new Date(dateStrToMs(d) + n * MS_DAY).toISOString().slice(0, 10)
}

// Thứ 2 (YYYY-MM-DD) của tuần chứa ngày `d` (chuỗi ngày không gắn múi giờ → lấy
// thứ theo mốc UTC nửa đêm, giống src/lib/date.ts weekStartOf).
export function weekStartOf(d: string): string {
  const dow = new Date(dateStrToMs(d)).getUTCDay() // 0 = CN … 6 = T7
  return addDays(d, -((dow + 6) % 7)) // lùi về Thứ 2: T2=0 … CN=6
}
