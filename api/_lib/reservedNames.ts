// api/_lib/reservedNames.ts — Chặn tên hiển thị dễ gây nhầm là admin/CSKH của app (Phần B,
// docs/research/dac-ta-admin-dashboard-2026-07-25.md).
//
// Vì sao cần: người dùng thấy tên "Admin", "CSKH En-Vi", "Quản trị viên"... trong bảng xếp
// hạng (nickname công khai, xem api/leaderboard.ts) hoặc tên hiển thị khác dễ tưởng đó là
// nhân viên thật → bị lừa hoặc hoang mang. Chặn từ lúc đăng ký rẻ hơn nhiều so với xử lý
// hậu quả.
//
// Cách so khớp: chuẩn hoá chữ thường + bỏ dấu tiếng Việt + gộp ký tự không phải chữ/số thành
// khoảng trắng, rồi so khớp THEO CỤM TỪ NGUYÊN VẸN (đệm khoảng trắng 2 đầu) — giống hệt cách
// `normalizeForProfanityCheck`/`containsProfanity` ở api/_lib/leaderboard.ts đã làm cho lọc từ
// bậy, tái dùng đúng pattern đã có thay vì bịa cách mới. Tránh false positive kiểu tên chứa
// chuỗi con trùng ngẫu nhiên (vd không chặn nhầm "Adam" vì chứa "dm").

// Danh sách khởi điểm theo đặc tả — mỗi mục là 1 CỤM TỪ đã chuẩn hoá (chữ thường, không dấu,
// khoảng trắng đơn) để so khớp nguyên cụm.
const RESERVED_NAME_PHRASES = [
  'admin',
  'administrator',
  'quan tri',
  'quan tri vien',
  'ban quan tri',
  'moderator',
  'mod',
  'cskh',
  'cham soc khach hang',
  'support',
  'ho tro',
  'official',
  'chinh thuc',
  'system',
  'he thong',
  'staff',
  'nhan vien',
  'donghanhcungban', // trùng tên miền/thương hiệu app
]

// Bỏ dấu tiếng Việt — giống hệt stripDiacritics() ở api/_lib/leaderboard.ts.
function stripDiacritics(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
}

// Chuẩn hoá về chữ thường, bỏ dấu, gộp mọi ký tự không phải chữ/số thành 1 khoảng trắng — GIỮ
// khoảng trắng (không xoá hẳn) để so khớp theo CỤM NGUYÊN VẸN ở dưới, tránh dương tính giả.
function normalizeForReservedCheck(s: string): string {
  return stripDiacritics(s.toLowerCase())
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// RegExp so khớp cụm đã chuẩn hoá theo ranh giới khoảng trắng — dùng trên CHUỖI ĐÃ CHUẨN HOÁ
// (qua normalizeForReservedCheck), không dùng trực tiếp trên chuỗi gốc (chưa bỏ dấu/hạ chữ).
export const RESERVED_NAME_PATTERNS: RegExp[] = RESERVED_NAME_PHRASES.map(
  (phrase) => new RegExp(`(?:^| )${phrase}(?:$| )`),
)

/**
 * Kiểm tra tên hiển thị có khớp 1 cụm từ bị cấm không (không phân biệt hoa/thường, có dấu/không
 * dấu, khớp theo CỤM chứ không phải substring bừa bãi).
 */
export function isReservedName(name: string): boolean {
  const normalized = ` ${normalizeForReservedCheck(name)} `
  return RESERVED_NAME_PATTERNS.some((pattern) => pattern.test(normalized))
}
