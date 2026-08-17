// packages/core-chat/wordlist-vi.ts — Từ tiếng Việt không văn minh, phân loại theo mức độ
// nghiêm trọng. So khớp theo TỪNG TOKEN sau khi CHUẨN HOÁ (bỏ dấu, viết thường, gộp ký tự lặp,
// bỏ khoảng trắng/dấu câu — xem moderator.ts#normalizeToken) nên liệt kê ở đây dùng dạng ĐÃ BỎ
// DẤU VÀ BỎ KHOẢNG TRẮNG (cụm nhiều từ viết liền, vd "óc chó" → "occho").
//
// Danh sách MINH HOẠ, đủ để test + vận hành ban đầu — mở rộng khi phát hiện lọt lưới thực tế,
// không cần đổi code, chỉ thêm từ vào đúng mức severity.

export const VI_WORDS: Record<'high' | 'medium' | 'low', string[]> = {
  // Tục tĩu nặng, lăng mạ nhân phẩm nghiêm trọng.
  high: ['dcm', 'dmm', 'clmm', 'vcl', 'djtme', 'djt', 'cave'],
  // Xúc phạm, chửi bới rõ ràng nhưng không thuộc nhóm nặng nhất.
  medium: ['ngu', 'ngudot', 'occho', 'sucvat', 'docho', 'thangcho', 'concho'],
  // Nhẹ, khó coi nhưng không thô tục.
  low: ['nhamnhi', 'vodung', 'dongu'],
}
