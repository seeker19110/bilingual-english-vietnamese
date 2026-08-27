// specializations/stageUnits.ts — CẦU NỐI giữa BẢN ĐỒ HƯỚNG và BÀI HỌC THẬT.
//
// Bản đồ hướng (`registry.ts`) nói "chặng web-s1 dạy những gì"; dòng bài học 8 bước
// (`lessons/`) mới là chỗ học viên gõ code. Hai tầng cố ý tách nhau: bản đồ phủ đủ 13 hướng
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
}

/** Unit của một chặng; mảng RỖNG nghĩa là chặng chưa có bài (giao diện phải nói rõ điều đó). */
export function unitsOfStage(stageId: string): string[] {
  return SPEC_STAGE_UNITS[stageId.trim().toLowerCase()] ?? []
}

/** Hướng này đã có bài học thật ở chặng nào chưa — dùng để gắn nhãn "đã có bài" ở danh sách. */
export function specHasLessons(specId: SpecializationId): boolean {
  return Object.keys(SPEC_STAGE_UNITS).some((k) => k.startsWith(`${specId}-`))
}
