// pythonRunner — API phía main thread để chạy Python trong Web Worker Pyodide (PR-L2).
// Chịu trách nhiệm: vòng đời worker, timeout cứng (terminate + tạo lại worker — cách duy
// nhất ngắt vòng lặp vô hạn trong WASM), gom stdout theo dòng.

export interface PythonRunResult {
  /** Toàn bộ output đã in (stdout + stderr, theo thứ tự). */
  output: string
  /** Thông điệp lỗi Python (traceback rút gọn) — undefined nếu chạy sạch. */
  error?: string
  /** true nếu bị ngắt vì quá thời gian cho phép. */
  timedOut: boolean
  durationMs: number
}

export interface PythonRunOptions {
  /** Dữ liệu cho input(): mỗi phần tử là một lần input(). */
  stdinLines?: string[]
  /** Ngắt cứng sau chừng này ms (mặc định 10s — tính SAU khi Pyodide đã nạp xong). */
  timeoutMs?: number
  /** Gọi mỗi khi có thêm output (cập nhật console trực tiếp). */
  onOutput?: (textSoFar: string) => void
  /** Gọi khi bắt đầu tải Pyodide lần đầu (~13MB) — để UI hiện "đang tải môi trường". */
  onLoading?: () => void
  /** Workspace nhiều file (PR-L6b): path → nội dung, ghi vào FS Pyodide trước khi chạy. */
  files?: Record<string, string>
}

const DEFAULT_TIMEOUT_MS = 10_000

let worker: Worker | null = null
let nextRunId = 1
// Mỗi lượt chạy một lời hứa; worker xử lý tuần tự nên chỉ cần map theo id.
let busy = false

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL('../workers/pyodideWorker.ts', import.meta.url), {
      // Worker module — Vite yêu cầu ở dev; Pyodide nạp động bên trong worker.
      type: 'module',
    })
  }
  return worker
}

/** Huỷ worker hiện tại (mất môi trường Python đã nạp — lần chạy sau tải lại). */
export function resetPythonWorker(): void {
  worker?.terminate()
  worker = null
  busy = false
}

/**
 * Chạy một đoạn Python. Tuần tự hoá: nếu đang có lượt chạy khác thì báo lỗi ngay
 * (UI phải disable nút Chạy khi đang chạy — đây là lưới an toàn, không phải hàng đợi).
 */
export function runPython(code: string, options: PythonRunOptions = {}): Promise<PythonRunResult> {
  if (busy) {
    return Promise.resolve({
      output: '',
      error: 'Đang có chương trình chạy — bấm Dừng hoặc chờ xong rồi chạy lại.',
      timedOut: false,
      durationMs: 0,
    })
  }
  busy = true
  const { stdinLines = [], timeoutMs = DEFAULT_TIMEOUT_MS, onOutput, onLoading, files } = options
  const id = nextRunId++
  const w = getWorker()

  return new Promise<PythonRunResult>((resolve) => {
    let output = ''
    let timer: ReturnType<typeof setTimeout> | null = null
    const startedAt = Date.now()

    const finish = (result: PythonRunResult) => {
      if (timer) clearTimeout(timer)
      w.removeEventListener('message', onMessage)
      busy = false
      resolve(result)
    }

    const armTimeout = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        // Ngắt cứng: terminate là cách duy nhất dừng vòng lặp vô hạn trong worker.
        resetPythonWorker()
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
        | { type: 'loading'; id: number }
        | { type: 'ready'; id: number }
        | { type: 'stdout'; id: number; text: string }
        | { type: 'done'; id: number; durationMs: number }
        | { type: 'error'; id: number; message: string }
      if (msg.id !== id) return
      if (msg.type === 'loading') {
        onLoading?.()
        // Đang tải môi trường (~13MB, mạng chậm có thể >10s) — chưa tính giờ chạy code.
        if (timer) clearTimeout(timer)
        timer = null
      } else if (msg.type === 'ready') {
        // Môi trường xong, code học viên BẮT ĐẦU chạy — giờ mới đếm timeout thật.
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
          error: `Không chạy được môi trường Python: ${e.message || 'lỗi tải worker'}`,
          timedOut: false,
          durationMs: Date.now() - startedAt,
        })
      },
      { once: true },
    )
    armTimeout()
    w.postMessage({ type: 'run', id, code, stdinLines, files })
  })
}
