// domWorker — Web Worker chấm bài DOM (PR-L7d).
//
// Worker không có DOM, nên trang được dựng bằng linkedom — ĐÚNG thư viện mà cổng CI dùng, qua
// ĐÚNG hàm chayBaiDom() của gói nội dung. Nhờ vậy kết quả chấm ở trình duyệt và ở CI không
// thể lệch nhau (mạch Python phải sống chung với khe hở đó: python3 ở CI vs Pyodide ở học viên).
//
// Vì sao không chấm thẳng trong iframe cho "thật" hơn: script của học viên có thể lặp vô hạn,
// và trong Worker thì main thread terminate() được. Iframe chỉ dùng để XEM trang chạy.
//
// Giao thức message giống ba worker kia:
//  vào : { type: 'run', id, html, code, hanhDong }
//  ra  : { type: 'ready'|'stdout'|'done'|'error', id, ... }
import { chayBaiDom } from '@dhcb/subject-programming/domPrelude'

interface RunRequest {
  type: 'run'
  id: number
  html: string
  code: string
  hanhDong: string[]
}

const scope = self as unknown as {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null
}

scope.onmessage = (e: MessageEvent<RunRequest>) => {
  const { id, html, code, hanhDong } = e.data
  scope.postMessage({ type: 'ready', id })
  const batDau = Date.now()

  const r = chayBaiDom(html, code, hanhDong)
  if (r.error) {
    scope.postMessage({ type: 'error', id, message: r.error })
    return
  }
  scope.postMessage({ type: 'stdout', id, text: r.output })
  scope.postMessage({ type: 'done', id, durationMs: Date.now() - batDau })
}
