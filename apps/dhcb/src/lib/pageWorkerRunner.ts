// pageWorkerRunner — Khuôn chung cho các bộ chạy "trang + script trong Worker" (PR-L7e).
//
// Bài DOM (PR-L7d) và bài FETCH (PR-L7e) chạy y hệt nhau ở phía main thread: gửi
// {html, code, hanhDong} vào một Web Worker, gom output, ngắt cứng (terminate + tạo lại
// worker) khi quá giờ. Khác nhau đúng MỘT chỗ: file worker nào. Nên phần dùng chung viết
// một lần ở đây; domRunner/fetchRunner chỉ còn là lời gọi taoPageWorkerRunner().
import type { CodeRunResult } from './codeRunResult'

export interface PageRunOptions {
  /** Trang HTML có sẵn của bài — script của học viên tác động lên trang này. */
  html: string
  /** Chuỗi hành động người dùng: 'click #nut', 'dien #o = giá trị' (xem domPrelude.ts). */
  hanhDong?: string[]
  timeoutMs?: number
  onOutput?: (textSoFar: string) => void
  onLoading?: () => void
}

export interface PageWorkerRunner {
  run(code: string, options: PageRunOptions): Promise<CodeRunResult>
  reset(): void
}

const DEFAULT_TIMEOUT_MS = 5_000

/**
 * Tạo một bộ chạy độc lập (worker + hàng đợi riêng) quanh hàm tạo Worker được đưa vào.
 * `taoWorker` phải gọi `new Worker(new URL('...', import.meta.url))` NGAY TẠI chỗ gọi —
 * Vite chỉ nhận diện worker khi URL là literal, không đi qua biến.
 */
export function taoPageWorkerRunner(taoWorker: () => Worker): PageWorkerRunner {
  let worker: Worker | null = null
  let nextRunId = 1
  let busy = false

  function getWorker(): Worker {
    if (!worker) worker = taoWorker()
    return worker
  }

  function reset(): void {
    worker?.terminate()
    worker = null
    busy = false
  }

  function run(code: string, options: PageRunOptions): Promise<CodeRunResult> {
    if (busy) {
      return Promise.resolve({
        output: '',
        error: 'Đang có chương trình chạy — chờ xong rồi chạy lại.',
        timedOut: false,
        durationMs: 0,
      })
    }
    busy = true
    const { html, hanhDong = [], timeoutMs = DEFAULT_TIMEOUT_MS, onOutput } = options
    const id = nextRunId++
    const w = getWorker()

    return new Promise<CodeRunResult>((resolve) => {
      let output = ''
      let timer: ReturnType<typeof setTimeout> | null = null
      const batDau = Date.now()

      const finish = (result: CodeRunResult) => {
        if (timer) clearTimeout(timer)
        w.removeEventListener('message', onMessage)
        busy = false
        resolve(result)
      }

      const armTimeout = () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          reset()
          finish({
            output,
            error: `Chương trình chạy quá ${Math.round(timeoutMs / 1000)} giây nên đã bị dừng — kiểm tra xem có vòng lặp không bao giờ kết thúc không.`,
            timedOut: true,
            durationMs: Date.now() - batDau,
          })
        }, timeoutMs)
      }

      const onMessage = (e: MessageEvent) => {
        const msg = e.data as
          | { type: 'ready'; id: number }
          | { type: 'stdout'; id: number; text: string }
          | { type: 'done'; id: number; durationMs: number }
          | { type: 'error'; id: number; message: string }
        if (msg.id !== id) return
        if (msg.type === 'ready') {
          armTimeout()
        } else if (msg.type === 'stdout') {
          output += msg.text
          onOutput?.(output)
        } else if (msg.type === 'done') {
          finish({ output, timedOut: false, durationMs: msg.durationMs })
        } else {
          finish({ output, error: msg.message, timedOut: false, durationMs: Date.now() - batDau })
        }
      }

      w.addEventListener('message', onMessage)
      w.addEventListener(
        'error',
        (e) => {
          finish({
            output,
            error: `Không chạy được môi trường DOM: ${e.message || 'lỗi tải worker'}`,
            timedOut: false,
            durationMs: Date.now() - batDau,
          })
        },
        { once: true },
      )
      armTimeout()
      w.postMessage({ type: 'run', id, html, code, hanhDong })
    })
  }

  return { run, reset }
}
