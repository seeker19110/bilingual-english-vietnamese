// sqlRunner — API phía main thread để chạy SQL trong Web Worker sql.js (PR-L7b2).
// Anh em với pythonRunner/jsRunner: cùng hình dạng kết quả, cùng cách ngắt cứng khi quá giờ.
import type { CodeRunResult } from './codeRunResult'

export interface SqlRunOptions {
  /** Ngắt cứng sau chừng này ms, tính SAU khi SQLite đã nạp xong. */
  timeoutMs?: number
  onOutput?: (textSoFar: string) => void
  /** Gọi khi bắt đầu tải SQLite lần đầu (~648KB) — để UI hiện "đang tải môi trường". */
  onLoading?: () => void
}

const DEFAULT_TIMEOUT_MS = 10_000

let worker: Worker | null = null
let nextRunId = 1
let busy = false

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/sqlWorker.ts', import.meta.url), { type: 'module' })
  }
  return worker
}

export function resetSqlWorker(): void {
  worker?.terminate()
  worker = null
  busy = false
}

export function runSql(code: string, options: SqlRunOptions = {}): Promise<CodeRunResult> {
  if (busy) {
    return Promise.resolve({
      output: '',
      error: 'Đang có truy vấn chạy — chờ xong rồi chạy lại.',
      timedOut: false,
      durationMs: 0,
    })
  }
  busy = true
  const { timeoutMs = DEFAULT_TIMEOUT_MS, onOutput, onLoading } = options
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
        resetSqlWorker()
        finish({
          output,
          error: `Truy vấn chạy quá ${Math.round(timeoutMs / 1000)} giây nên đã bị dừng.`,
          timedOut: true,
          durationMs: Date.now() - startedAt,
        })
      }, timeoutMs)
    }

    const onMessage = (e: MessageEvent) => {
      const msg = e.data as
        | { type: 'loading'; id: number }
        | { type: 'ready'; id: number }
        | { type: 'stdout'; id: number; text: string }
        | { type: 'done'; id: number; durationMs: number }
        | { type: 'error'; id: number; message: string }
      if (msg.id !== id) return
      if (msg.type === 'loading') {
        onLoading?.()
        // Đang tải SQLite — chưa tính giờ chạy truy vấn.
        if (timer) clearTimeout(timer)
        timer = null
      } else if (msg.type === 'ready') {
        armTimeout()
      } else if (msg.type === 'stdout') {
        output += msg.text
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
          error: `Không chạy được môi trường SQL: ${e.message || 'lỗi tải worker'}`,
          timedOut: false,
          durationMs: Date.now() - startedAt,
        })
      },
      { once: true },
    )
    armTimeout()
    w.postMessage({ type: 'run', id, code })
  })
}
