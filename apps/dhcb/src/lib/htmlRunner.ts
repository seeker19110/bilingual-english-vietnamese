// htmlRunner — "Chạy" một bài HTML/CSS trong trình duyệt (PR-L7c).
//
// KHÔNG CẦN WORKER, và đây là lý do: trang của bài U4–U5 KHÔNG chứa script (khung xem trang
// dùng iframe với sandbox="" — script bị tắt hoàn toàn), nên không có gì để treo. Việc duy
// nhất ở đây là PHÂN TÍCH cú pháp rồi mô tả cây DOM — chạy tức thì, đồng bộ.
// DOMParser.parseFromString KHÔNG thực thi <script> ngay cả khi học viên viết vào, nên đường
// này an toàn theo thiết kế chứ không nhờ may mắn.
import { moTaCayDom, type ElementLike } from '@dhcb/subject-programming/htmlPrelude'
import type { CodeRunResult } from './codeRunResult'

export function runHtml(code: string): Promise<CodeRunResult> {
  const batDau = Date.now()
  try {
    const doc = new DOMParser().parseFromString(code, 'text/html')
    return Promise.resolve({
      output: moTaCayDom(doc.documentElement as unknown as ElementLike),
      timedOut: false,
      durationMs: Date.now() - batDau,
    })
  } catch (err) {
    return Promise.resolve({
      output: '',
      error: (err as Error).message,
      timedOut: false,
      durationMs: Date.now() - batDau,
    })
  }
}
