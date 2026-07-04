// date.ts — Ngày "hôm nay" THEO GIỜ VIỆT NAM (Asia/Ho_Chi_Minh, UTC+7, không DST).
//
// VẤN ĐỀ (audit 2026-07-03): stats.ts/storage.ts trước đây dùng
// `new Date().toISOString().slice(0, 10)` — luôn trả NGÀY UTC, khiến ranh giới
// "ngày mới" thực chất là 7h sáng giờ Việt Nam thay vì nửa đêm. Người dùng học
// lúc 0h–7h sáng bị tính nhầm sang ngày hôm trước (lượt dùng/streak lệch).
//
// Việt Nam không có giờ mùa hè (DST) → offset +7h luôn đúng, không cần thư viện
// timezone ngoài.
const VN_OFFSET_MS = 7 * 60 * 60 * 1000

// Ngày (YYYY-MM-DD) theo giờ Việt Nam của thời điểm `d` (mặc định: hiện tại).
export function vnDateStr(d: Date = new Date()): string {
  return new Date(d.getTime() + VN_OFFSET_MS).toISOString().slice(0, 10)
}

// Thứ trong tuần (0 = Chủ nhật … 6 = Thứ bảy) THEO GIỜ VIỆT NAM của thời điểm `d`.
// Dùng .getUTCDay() trên thời điểm đã dịch +7h — cùng cách tính với vnDateStr() — để
// nhãn "thứ" trên biểu đồ luôn khớp với ngày (YYYY-MM-DD) hiển thị, bất kể múi giờ của
// trình duyệt người xem là gì. Nếu dùng d.getDay() (thứ theo giờ LOCAL của trình duyệt)
// thì người xem ở múi giờ khác VN có thể thấy nhãn thứ lệch 1 ngày so với ngày thực tế.
export function vnDayOfWeek(d: Date = new Date()): number {
  return new Date(d.getTime() + VN_OFFSET_MS).getUTCDay()
}
