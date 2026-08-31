// hermesRunner — "Chạy" một bài Hermes Agent trong trình duyệt (PR 2/4 khoá Hermes).
//
// KHÔNG CẦN WORKER, cùng lý do với gitRunner: bộ mô phỏng (hermesSim.ts) chỉ duyệt một danh
// sách lệnh HỮU HẠN do học viên gõ — không có vòng lặp, không code học viên được thực thi,
// nên không thể treo. Mọi thứ chạy đồng bộ, tức thì.
//
// Cổng CI gọi CHÍNH hàm chayLenhHermes() này, nên hai nơi không thể lệch nhau (engine thuần
// TypeScript, không phụ thuộc trình duyệt hay Node).
import { chayLenhHermes } from '@dhcb/subject-programming/hermesSim'
import type { CodeRunResult } from './codeRunResult'

export interface HermesRunOptions {
  /** Lệnh dựng bối cảnh, chạy trước và KHÔNG in ra (xem hermesSim.chayLenhHermes). */
  lenhChuanBi?: string[]
}

export function runHermes(code: string, options: HermesRunOptions = {}): Promise<CodeRunResult> {
  const batDau = Date.now()
  const r = chayLenhHermes(code, options.lenhChuanBi ?? [])
  return Promise.resolve({
    output: r.output,
    // Lệnh gõ sai KHÔNG phải "sự cố hệ thống" mà là một phần bài học: output vẫn giữ nguyên
    // dòng `loi: …` để học viên đọc, và trường error cho phép bộ chấm đánh rớt ca đó.
    ...(r.error ? { error: r.error } : {}),
    timedOut: false,
    durationMs: Date.now() - batDau,
  })
}
