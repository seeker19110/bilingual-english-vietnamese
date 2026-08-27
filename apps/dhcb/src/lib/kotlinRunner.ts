// kotlinRunner — "Chạy" một bài Kotlin trong trình duyệt (PR-M7).
//
// KHÔNG CẦN WORKER, cùng lý do với gitRunner/bashRunner/swiftRunner: bộ chạy là trình thông
// dịch cây thuần TypeScript, KHÔNG gọi eval và KHÔNG thực thi mã của học viên bằng máy
// JavaScript — nó chỉ duyệt cây cú pháp, và đã có hai trần cứng (số bước + độ dài output) nên
// không thể treo.
//
// Cổng CI gọi CHÍNH hàm chayKotlin() này, nên hai nơi không thể lệch nhau — đúng lý do hiến
// chương M §3.1 chọn TypeScript-trong-Worker thay vì Python-trong-Pyodide.
import { chayKotlin } from '@dhcb/subject-programming/kotlinSim/chayKotlin'
import type { CodeRunResult } from './codeRunResult'

export function runKotlin(code: string): Promise<CodeRunResult> {
  const batDau = Date.now()
  const r = chayKotlin(code)
  return Promise.resolve({
    output: r.output,
    // `error` ở đây là "chương trình không chạy tới cuối" — lỗi cú pháp, dùng null sai cách,
    // hoặc ngoại lệ ném ra mà không ai bắt. Thông điệp đã kèm số dòng và viết bằng tiếng Việt,
    // nên giao diện in thẳng ra là học viên đọc được (bài học rút từ PR-M2: đừng giấu output).
    ...(r.error ? { error: r.error } : {}),
    timedOut: false,
    durationMs: Date.now() - batDau,
  })
}
