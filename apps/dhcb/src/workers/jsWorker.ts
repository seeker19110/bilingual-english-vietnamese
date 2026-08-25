// jsWorker — Web Worker chạy JavaScript của học viên cho môn Lập trình (PR-L7b1).
//
// VÌ SAO WORKER CHỨ KHÔNG PHẢI IFRAME: script trong iframe chạy CÙNG luồng với trang, nên
// một vòng lặp vô hạn (lỗi kinh điển của người mới) sẽ treo cứng cả app và không ngắt được.
// Worker chạy luồng riêng nên main thread terminate() được — đúng cách pythonRunner.ts làm.
// Iframe vẫn sẽ cần cho làn XEM TRANG HTML/CSS/DOM ở PR sau, đó là bài toán khác.
//
// Cách ly: worker không có DOM, không có document/localStorage; code học viên chỉ thấy
// console (đã ghi đè) và các built-in của JavaScript. Không import gì từ app vào đây.
//
// Giao thức message (xem apps/dhcb/src/lib/jsRunner.ts) — cố ý GIỐNG pyodideWorker để
// jsRunner và pythonRunner dùng chung một hình dạng kết quả:
//  vào : { type: 'run', id, code, stdinLines }
//  ra  : { type: 'ready', id }              — bắt đầu chạy code (JS không phải tải môi trường)
//        { type: 'stdout', id, text }       — từng dòng console.log
//        { type: 'done', id, durationMs }
//        { type: 'error', id, message }
import { wrapJavaScript, formatConsoleArgs } from '@dhcb/subject-programming/jsPrelude'

interface RunRequest {
  type: 'run'
  id: number
  code: string
  stdinLines: string[]
}

const scope = self as unknown as {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null
}

scope.onmessage = (e: MessageEvent<RunRequest>) => {
  const { id, code, stdinLines } = e.data
  scope.postMessage({ type: 'ready', id })
  const startedAt = Date.now()

  const say = (...args: unknown[]) => {
    scope.postMessage({ type: 'stdout', id, text: formatConsoleArgs(args) })
  }
  // Ghi đè console để mọi thứ học viên in ra đều đi qua đường của ta (và để bản chạy ở
  // trình duyệt cho ra CÙNG chuỗi với cổng CI node:vm — cùng formatConsoleArgs).
  const consoleShim = { log: say, error: say, warn: say, info: say }

  try {
    // new Function thay cho eval: code chạy trong phạm vi hàm riêng, không thấy biến của
    // worker (id, code, startedAt...) nên không sửa lén được vòng đời chấm bài.
    const run = new Function('console', wrapJavaScript(code, stdinLines))
    run(consoleShim)
    scope.postMessage({ type: 'done', id, durationMs: Date.now() - startedAt })
  } catch (err) {
    const e2 = err as Error
    scope.postMessage({
      type: 'error',
      id,
      message: e2?.message ? `${e2.name ?? 'Lỗi'}: ${e2.message}` : String(err),
    })
  }
}
