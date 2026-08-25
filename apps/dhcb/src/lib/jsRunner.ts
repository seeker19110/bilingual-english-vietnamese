// jsRunner — API phía main thread để chạy JavaScript của học viên trong Web Worker (PR-L7b1).
// Song sinh với pythonRunner.ts: cùng hình dạng kết quả, cùng cách ngắt cứng khi quá giờ
// (terminate + tạo lại worker — cách duy nhất dừng vòng lặp vô hạn).
import type { CodeRunResult } from './codeRunResult'

export interface JsRunOptions {
  /** Dữ liệu cho input(): mỗi phần tử là một lần input(). */
  stdinLines?: string[]
  /** Ngắt cứng sau chừng này ms (mặc định 5s — JavaScript không phải tải môi trường nặng). */
  timeoutMs?: number
  /** Gọi mỗi khi có thêm output (cập nhật console trực tiếp). */
  onOutput?: (textSoFar: string) => void
}

const DEFAULT_TIMEOUT_MS = 5_000

let worker: Worker | null = null
let nextRunId = 1
let busy = false

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/jsWorker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

/** Huỷ worker hiện tại (dùng để ngắt vòng lặp vô hạn, và khi rời trang bài học). */
export function resetJsWorker(): void {
  worker?.terminate()
  worker = null
  busy = false
}

export function runJavaScript(code: string, options: JsRunOptions = {}): Promise<CodeRunResult> {
  if (busy) {
    return Promise.resolve({
      output: '',
      error: 'Đang có chương trình chạy — bấm Dừng hoặc chờ xong rồi chạy lại.',
      timedOut: false,
      durationMs: 0,
    })
  }
  busy = true
  const { stdinLines = [], timeoutMs = DEFAULT_TIMEOUT_MS, onOutput } = options
  const id = nextRunId++
  const w = getWorker()

  return new Promise<CodeRunResult>((resolve) => {
    let output = ''
    let timer: ReturnType<typeof setTimeout> | null = null
    const startedAt = Date.now()

    const finish = (result: CodeRunResult) => {
      if (timer) clearTimeout(timer)
      w.removeEventListener('message', onMessage)
      busy = false
      resolve(result)
    }

    const armTimeout = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        resetJsWorker()
        finish({
          output,
          error: `Chương trình chạy quá ${Math.round(timeoutMs / 1000)} giây nên đã bị dừng — kiểm tra xem có vòng lặp không bao giờ kết thúc không.`,
          timedOut: true,
          durationMs: Date.now() - startedAt,
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
        output += msg.text.endsWith('\n') ? msg.text : `${msg.text}\n`
        onOutput?.(output)
      } else if (msg.type === 'done') {
        finish({ output, timedOut: false, durationMs: msg.durationMs })
      } else {
        finish({ output, error: msg.message, timedOut: false, durationMs: Date.now() - startedAt })
      }
    }

    w.addEventListener('message', onMessage)
    w.addEventListener(
      'error',
      (e) => {
        finish({
          output,
          error: `Không chạy được môi trường JavaScript: ${e.message || 'lỗi tải worker'}`,
          timedOut: false,
          durationMs: Date.now() - startedAt,
        })
      },
      { once: true },
    )
    armTimeout()
    w.postMessage({ type: 'run', id, code, stdinLines })
  })
}
