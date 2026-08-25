// fetchWorker — Web Worker chấm bài FETCH (PR-L7e). Song sinh với domWorker, khác đúng một
// chỗ: gọi chayBaiFetch() (async, có fetch giả lập phục vụ dữ liệu thời tiết mẫu) thay vì
// chayBaiDom(). Cùng hàm với cổng CI nên kết quả chấm hai nơi không thể lệch nhau.
//
// Giao thức message giống các worker kia:
//  vào : { type: 'run', id, html, code, hanhDong }
//  ra  : { type: 'ready'|'stdout'|'done'|'error', id, ... }
import { chayBaiFetch, type FetchApi } from '@dhcb/subject-programming/fetchPrelude'

interface RunRequest {
  type: 'run'
  id: number
  html: string
  code: string
  hanhDong: string[]
  /** Bộ dữ liệu API mẫu: bài học P3-U7 (thời tiết, mặc định) hay dự án trục P3 (menu quán). */
  api?: FetchApi
}

const scope = self as unknown as {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null
}

scope.onmessage = (e: MessageEvent<RunRequest>) => {
  const { id, html, code, hanhDong, api } = e.data
  scope.postMessage({ type: 'ready', id })
  const batDau = Date.now()

  void chayBaiFetch(html, code, hanhDong, api).then((r) => {
    if (r.error) {
      scope.postMessage({ type: 'error', id, message: r.error })
      return
    }
    scope.postMessage({ type: 'stdout', id, text: r.output })
    scope.postMessage({ type: 'done', id, durationMs: Date.now() - batDau })
  })
}
