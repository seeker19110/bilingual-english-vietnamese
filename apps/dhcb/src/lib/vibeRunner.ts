// vibeRunner — "Chạy" một bài của khoá Vibe Code trong trình duyệt (đặc tả
// docs/specs/2026-08-31-khoa-vibe-code.md).
//
// KHÔNG CẦN WORKER, cùng lý do với gitRunner/hermesRunner: bộ mô phỏng (vibeSim.ts) chỉ
// duyệt một danh sách lệnh HỮU HẠN do học viên gõ — không có vòng lặp, không code học viên
// được thực thi, nên không thể treo. Mọi thứ chạy đồng bộ, tức thì.
//
// Cổng CI gọi CHÍNH hàm chayLenhVibe() này, nên hai nơi không thể lệch nhau (engine thuần
// TypeScript, không phụ thuộc trình duyệt hay Node).
import { chayLenhVibe } from '@dhcb/subject-programming/vibeSim'
import type { CodeRunResult } from './codeRunResult'

export interface VibeRunOptions {
  /** Lệnh dựng bối cảnh, chạy trước và KHÔNG in ra (xem vibeSim.chayLenhVibe). */
  lenhChuanBi?: string[]
}

export function runVibe(code: string, options: VibeRunOptions = {}): Promise<CodeRunResult> {
  const batDau = Date.now()
  const r = chayLenhVibe(code, options.lenhChuanBi ?? [])
  return Promise.resolve({
    output: r.output,
    // Lệnh gõ sai KHÔNG phải "sự cố hệ thống" mà là một phần bài học: output vẫn giữ nguyên
    // dòng `loi: …` để học viên đọc, và trường error cho phép bộ chấm đánh rớt ca đó.
    ...(r.error ? { error: r.error } : {}),
    timedOut: false,
    durationMs: Date.now() - batDau,
  })
}
