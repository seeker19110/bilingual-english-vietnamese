// fetchWorker — Web Worker chấm bài FETCH (PR-L7e). Song sinh với domWorker, khác đúng một
// chỗ: gọi chayBaiFetch() (async, có fetch giả lập phục vụ dữ liệu thời tiết mẫu) thay vì
// chayBaiDom(). Cùng hàm với cổng CI nên kết quả chấm hai nơi không thể lệch nhau.
//
// Giao thức message giống các worker kia:
//  vào : { type: 'run', id, html, code, hanhDong }
//  ra  : { type: 'ready'|'stdout'|'done'|'error', id, ... }
import { chayBaiFetch } from '@dhcb/subject-programming/fetchPrelude'

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

  void chayBaiFetch(html, code, hanhDong).then((r) => {
    if (r.error) {
      scope.postMessage({ type: 'error', id, message: r.error })
      return
    }
    scope.postMessage({ type: 'stdout', id, text: r.output })
    scope.postMessage({ type: 'done', id, durationMs: Date.now() - batDau })
  })
}
