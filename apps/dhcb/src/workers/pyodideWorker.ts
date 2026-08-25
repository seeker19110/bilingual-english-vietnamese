// pyodideWorker — Web Worker chạy Python bằng Pyodide (WASM) cho môn Lập trình (PR-L2).
//
// Worker MODULE (Vite dev không hỗ trợ classic worker) — Pyodide nạp lúc chạy bằng
// dynamic import bản ESM tự host /pyodide/pyodide.mjs (copy vào dist/pyodide/ ở
// vite.config.ts, @vite-ignore để Vite không bundle). Không nạp gì cho tới message
// "run" đầu tiên (lazy ~13MB).
//
// Giao thức message (xem apps/dhcb/src/lib/pythonRunner.ts):
//  vào : { type: 'run', id, code, stdinLines }
//  ra  : { type: 'loading', id }               — bắt đầu tải Pyodide lần đầu
//        { type: 'stdout', id, text }          — từng dòng print
//        { type: 'done', id, durationMs }      — chạy xong bình thường
//        { type: 'error', id, message }        — lỗi Python (traceback rút gọn) / lỗi nạp
//
// Vòng lặp vô hạn KHÔNG xử lý ở đây được (worker bận) — main thread tự terminate()
// worker khi quá timeout (pythonRunner.ts).

// Kiểu tối thiểu của Pyodide mà worker dùng — tránh `any` mà không cần import type từ
// gói pyodide (module được nạp động lúc chạy, không qua bundler).
interface PyodideLike {
  setStdout(options: { batched: (text: string) => void }): void
  setStderr(options: { batched: (text: string) => void }): void
  globals: { set(name: string, value: unknown): void }
  runPythonAsync(code: string): Promise<unknown>
}

interface RunRequest {
  type: 'run'
  id: number
  code: string
  /** Các dòng người học điền sẵn cho input() — đọc tuần tự, hết thì báo lỗi rõ ràng. */
  stdinLines: string[]
}

const scope = self as unknown as {
  postMessage(msg: unknown): void
  onmessage: ((e: MessageEvent<RunRequest>) => void) | null
  location: { origin: string }
}

let pyodidePromise: Promise<PyodideLike> | null = null

function getPyodide(): Promise<PyodideLike> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      const mod = (await import(
        /* @vite-ignore */ `${scope.location.origin}/pyodide/pyodide.mjs`
      )) as { loadPyodide(options: { indexURL: string }): Promise<PyodideLike> }
      return mod.loadPyodide({ indexURL: `${scope.location.origin}/pyodide/` })
    })()
  }
  return pyodidePromise
}

// Chuẩn bị input(): thay builtins.input bằng hàm đọc tuần tự từ danh sách dòng đã điền
// sẵn (Pyodide không có stdin tương tác). Echo lại "câu hỏi + câu trả lời" ra stdout để
// màn hình giống chạy thật trên máy tính.
const PREL_INPUT = `
import builtins

def _dhcb_make_input(lines):
    it = iter(lines)
    def _input(prompt=""):
        try:
            value = next(it)
        except StopIteration:
            raise EOFError(
                "Chuong trinh goi input() nhung o 'Du lieu nhap' da het dong — "
                "hay dien du du lieu (moi dong mot lan input)."
            )
        print(f"{prompt}{value}")
        return value
    builtins.input = _input

_dhcb_make_input(_dhcb_stdin_lines)
del _dhcb_make_input
`

scope.onmessage = (e: MessageEvent<RunRequest>) => {
  const msg = e.data
  if (msg.type !== 'run') return
  void (async () => {
    const { id, code, stdinLines } = msg
    try {
      if (!pyodidePromise) scope.postMessage({ type: 'loading', id })
      const pyodide = await getPyodide()
      scope.postMessage({ type: 'ready', id })
      pyodide.setStdout({ batched: (text) => scope.postMessage({ type: 'stdout', id, text }) })
      pyodide.setStderr({ batched: (text) => scope.postMessage({ type: 'stdout', id, text }) })
      pyodide.globals.set('_dhcb_stdin_lines', stdinLines)
      const start = Date.now()
      await pyodide.runPythonAsync(PREL_INPUT)
      await pyodide.runPythonAsync(code)
      scope.postMessage({ type: 'done', id, durationMs: Date.now() - start })
    } catch (err) {
      scope.postMessage({ type: 'error', id, message: shortenTraceback(err) })
    }
  })()
}

// Traceback Pyodide dài và lộ khung nội bộ — giữ phần từ dòng lỗi của <exec> trở đi
// (chính là code của học viên) cho dễ đọc.
function shortenTraceback(err: unknown): string {
  const full = err instanceof Error ? err.message : String(err)
  const lines = full.split('\n')
  const execIdx = lines.findIndex((l) => l.includes('<exec>'))
  const kept = execIdx >= 0 ? lines.slice(execIdx) : lines.slice(-6)
  return kept.join('\n').trim() || 'Lỗi không xác định khi chạy Python'
}
