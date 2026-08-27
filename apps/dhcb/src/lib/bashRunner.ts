// bashRunner — "Chạy" một bài dòng lệnh trong trình duyệt (PR-M1).
//
// KHÔNG CẦN WORKER, cùng lý do với gitRunner: bộ mô phỏng (bashSim.ts) không thực thi code của
// học viên, chỉ duyệt một cây lệnh HỮU HẠN, và đã có sẵn hai trần cứng (số lệnh + độ dài
// output) nên không thể treo. Mọi thứ chạy đồng bộ, tức thì — không phải tải môi trường nặng.
//
// Cổng CI gọi CHÍNH hàm chayBash() này, nên hai nơi không thể lệch nhau (engine thuần
// TypeScript, không phụ thuộc trình duyệt hay Node) — đúng lý do hiến chương M §3.1 chọn
// TypeScript-trong-Worker thay vì Python-trong-Pyodide.
import { chayBash } from '@dhcb/subject-programming/bashSim'
import type { CodeRunResult } from './codeRunResult'

export interface BashRunOptions {
  /** Lệnh dựng bối cảnh, chạy trước và KHÔNG in ra (xem bashSim.chayBash). */
  lenhChuanBi?: string[]
}

export function runBash(code: string, options: BashRunOptions = {}): Promise<CodeRunResult> {
  const batDau = Date.now()
  const r = chayBash(code, options.lenhChuanBi ?? [])
  return Promise.resolve({
    output: r.output,
    // Mã thoát khác 0 KHÔNG phải "sự cố hệ thống" mà là một phần bài học (chính $? là thứ
    // tầng 1 dạy): output vẫn giữ nguyên thông báo để học viên đọc, còn trường error cho phép
    // bộ chấm đánh rớt ca đó.
    ...(r.error ? { error: r.error } : {}),
    timedOut: false,
    durationMs: Date.now() - batDau,
  })
}
