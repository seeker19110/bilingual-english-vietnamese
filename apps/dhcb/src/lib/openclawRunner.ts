// openclawRunner — "Chạy" một bài OpenClaw trong trình duyệt (PR 2/3 khoá OpenClaw).
//
// KHÔNG CẦN WORKER, cùng lý do với gitRunner/hermesRunner: bộ mô phỏng (openclawSim.ts) chỉ
// duyệt một danh sách lệnh HỮU HẠN do học viên gõ — không có vòng lặp, không code học viên
// được thực thi, nên không thể treo. Mọi thứ chạy đồng bộ, tức thì.
//
// Cổng CI gọi CHÍNH hàm chayLenhOpenclaw() này, nên hai nơi không thể lệch nhau (engine thuần
// TypeScript, không phụ thuộc trình duyệt hay Node).
import { chayLenhOpenclaw } from '@dhcb/subject-programming/openclawSim'
import type { CodeRunResult } from './codeRunResult'

export interface OpenclawRunOptions {
  /** Lệnh dựng bối cảnh, chạy trước và KHÔNG in ra (xem openclawSim.chayLenhOpenclaw). */
  lenhChuanBi?: string[]
}

export function runOpenclaw(
  code: string,
  options: OpenclawRunOptions = {},
): Promise<CodeRunResult> {
  const batDau = Date.now()
  const r = chayLenhOpenclaw(code, options.lenhChuanBi ?? [])
  return Promise.resolve({
    output: r.output,
    // Lệnh gõ sai KHÔNG phải "sự cố hệ thống" mà là một phần bài học: output vẫn giữ nguyên
    // dòng `loi: …` để học viên đọc, và trường error cho phép bộ chấm đánh rớt ca đó.
    ...(r.error ? { error: r.error } : {}),
    timedOut: false,
    durationMs: Date.now() - batDau,
  })
}
