// specializations/stageUnits.ts — CẦU NỐI giữa BẢN ĐỒ HƯỚNG và BÀI HỌC THẬT.
//
// Bản đồ hướng (`registry.ts`) nói "chặng web-s1 dạy những gì"; dòng bài học 8 bước
// (`lessons/`) mới là chỗ học viên gõ code. Hai tầng cố ý tách nhau: bản đồ phủ đủ 14 hướng
// từ ngày đầu, còn nội dung soạn dần từng chặng. File này ghi lại chặng nào ĐÃ có bài, để
// giao diện hiện nút "Vào học" đúng chỗ thay vì hứa suông ở cả 52 chặng.
//
// Luật: chỉ thêm một dòng vào đây KHI unit đã có bài thật — test `stageUnits.test.ts` kiểm
// chéo với curriculum và với `lessons.ts`, nên khai sai là CI đỏ chứ không phải trang trắng.
import type { SpecializationId } from './types.js'

/** Các unit trong dòng bài học 8 bước thuộc về một chặng của hướng. */
export const SPEC_STAGE_UNITS: Record<string, string[]> = {
  // Hướng Web, chặng S1 — soạn 2026-08-27 (3 unit).
  'web-s1': ['p6-u16', 'p6-u17', 'p6-u18'],
  // Hướng Kiến trúc, chặng S1 — soạn 2026-08-27 (3 unit).
  'architecture-s1': ['p6-u19', 'p6-u20', 'p6-u21'],
  // Hướng Web, chặng S4 — soạn 2026-08-27 (3 unit). Đặc tả:
  // `docs/specs/2026-08-27-chang-s4-13-huong.md`.
  'web-s4': ['p6-u22', 'p6-u23', 'p6-u24'],
  // Hướng Backend, chặng S1 — soạn 2026-08-27 (3 unit). Dải `p6-u61…p6-u93` dành cho S1 của
  // 11 hướng còn lại; đặc tả: `docs/specs/2026-08-27-dai-ma-unit-s1-cac-huong-con-lai.md`.
  'backend-s1': ['p6-u61', 'p6-u62', 'p6-u63'],
  // Hướng AI, chặng S1 — soạn 2026-08-31. p6-u1 đã có TỪ TRƯỚC (module m1 gọi mô hình + m2
  // RAG); p6-u64/u65 khép nốt module m3 (đánh giá tự động) + m4 (an toàn & chi phí) của
  // `specializations/ai.ts`.
  'ai-s1': ['p6-u1', 'p6-u64', 'p6-u65'],
  // 4 chặng RIÊNG của lộ trình "Kỹ Sư Trưởng AI", giai đoạn P5 "Tầm trưởng" — soạn 2026-08-31
  // (đợt 4). Không phải hướng chuyên sâu — xem `learningPaths/pathStages.ts`. Đặc tả:
  // `docs/specs/2026-08-31-dot-4-p5-tam-truong.md`.
  'principal-s1': ['p6-u94', 'p6-u95'],
  'principal-s2': ['p6-u96', 'p6-u97'],
  'principal-s3': ['p6-u98', 'p6-u99'],
  'principal-s4': ['p6-u100', 'p6-u101'],
  // Hướng Dữ liệu, chặng S1 — soạn 2026-08-31 (3 unit, 4 module: p6-u66 = m1, p6-u67 = m2,
  // p6-u68 gộp m3+m4 — đúng tiền lệ web-s1 gộp module khi hợp lý).
  'data-s1': ['p6-u66', 'p6-u67', 'p6-u68'],
  // Hướng Backend, chặng S2 — soạn 2026-08-31 (3 unit, 4 module: p6-u102 = m1, p6-u103 = m2,
  // p6-u104 gộp m3+m4 — đúng tiền lệ web-s1 gộp module khi hợp lý).
  'backend-s2': ['p6-u102', 'p6-u103', 'p6-u104'],
  // Hướng Backend, chặng S3 — soạn 2026-08-31 (3 unit, 4 module: p6-u105 = m1, p6-u106 = m2,
  // p6-u107 gộp m3+m4 — đúng tiền lệ web-s1 gộp module khi hợp lý).
  'backend-s3': ['p6-u105', 'p6-u106', 'p6-u107'],
  // Hướng Backend, chặng S4 — soạn 2026-08-31 (3 unit, 4 module: p6-u108 = m1, p6-u109 = m2,
  // p6-u110 gộp m3+m4 — đúng tiền lệ web-s1 gộp module khi hợp lý).
  'backend-s4': ['p6-u108', 'p6-u109', 'p6-u110'],
  // Hướng Web, chặng S2 — soạn 2026-08-31 (3 unit, 5 module: p6-u111 = m1, p6-u112 gộp
  // m2+m3 (CSDL quan hệ + Xác thực & phiên), p6-u113 gộp m4+m5 (tải dữ liệu client + deploy)).
  'web-s2': ['p6-u111', 'p6-u112', 'p6-u113'],
  // Hướng Web, chặng S3 — soạn 2026-08-31 (3 unit, 5 module: p6-u114 = m1, p6-u115 gộp
  // m2+m4 (render + kiến trúc — cả hai là quyết định CẤU TRÚC lớn), p6-u116 gộp m3+m5
  // (kiểm thử + bảo mật — cả hai là gác CHẤT LƯỢNG/AN TOÀN trước khi release)).
  'web-s3': ['p6-u114', 'p6-u115', 'p6-u116'],
  // Hướng Kiến trúc, chặng S2 — soạn 2026-08-31 (3 unit, 4 module: p6-u117 = m1 (mô hình hoá
  // miền), p6-u118 = m2 (hợp đồng kiểm được), p6-u119 gộp m3+m4 (tiến hoá không phá + dữ liệu
  // là phần khó đổi nhất — cả hai cùng trả lời "đổi hợp đồng đã có người dùng thế nào cho an
  // toàn"). Đúng tiền lệ web-s1/backend-s2 gộp module khi hợp lý.
  'architecture-s2': ['p6-u117', 'p6-u118', 'p6-u119'],
}

/** Unit của một chặng; mảng RỖNG nghĩa là chặng chưa có bài (giao diện phải nói rõ điều đó). */
export function unitsOfStage(stageId: string): string[] {
  return SPEC_STAGE_UNITS[stageId.trim().toLowerCase()] ?? []
}

/** Hướng này đã có bài học thật ở chặng nào chưa — dùng để gắn nhãn "đã có bài" ở danh sách. */
export function specHasLessons(specId: SpecializationId): boolean {
  return Object.keys(SPEC_STAGE_UNITS).some((k) => k.startsWith(`${specId}-`))
}
