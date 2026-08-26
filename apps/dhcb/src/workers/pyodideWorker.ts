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
  /** Workspace nhiều file (PR-L6b): path → nội dung. Được ghi ra hệ thống file trong bộ
   *  nhớ của Pyodide TRƯỚC khi chạy `code`, nên `import logic` của học viên hoạt động thật. */
  files?: Record<string, string>
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

// Dựng workspace nhiều file trong FS bộ nhớ của Pyodide rồi chuyển thư mục làm việc vào đó.
// Ba việc BẮT BUỘC vì worker sống qua nhiều lượt chạy (chấm nhiều ca liên tiếp):
//   1. xoá sạch file cũ  — lượt trước để lại don_hang.csv thì lượt sau chấm sai;
//   2. gỡ module đã import — Python nhớ bản cũ trong sys.modules, sửa logic.py sẽ không ăn;
//   3. os.chdir vào thư mục — để open("don_hang.csv") của học viên nằm trong workspace.
const PREL_WORKSPACE = `
import json, os, pathlib, shutil, sys, importlib

_dhcb_dir = "/home/pyodide/dhcb_ws"
_dhcb_p = pathlib.Path(_dhcb_dir)
# Rời khỏi thư mục TRƯỚC khi xoá: lượt chạy trước đã chdir vào đây, xoá thư mục đang đứng
# thì Pyodide báo "Resource busy" và cả lượt chấm hỏng.
os.chdir("/home/pyodide")
if _dhcb_p.exists():
    shutil.rmtree(_dhcb_p)
_dhcb_p.mkdir(parents=True, exist_ok=True)

_dhcb_map = json.loads(_dhcb_files_json)
for _name, _content in _dhcb_map.items():
    _dhcb_f = _dhcb_p / _name
    # Ten co dau "/" nghia la mot GOI Python (vd fastapi/__init__.py) — phai tao thu muc cha
    # truoc, neu khong Python bao khong tim thay duong dan va ca luot cham hong.
    _dhcb_f.parent.mkdir(parents=True, exist_ok=True)
    _dhcb_f.write_text(_content, encoding="utf-8")
    if _name.endswith(".py"):
        sys.modules.pop(_name[:-3], None)
        sys.modules.pop(_name.split("/")[0], None)

if _dhcb_dir in sys.path:
    sys.path.remove(_dhcb_dir)
sys.path.insert(0, _dhcb_dir)
importlib.invalidate_caches()
os.chdir(_dhcb_dir)
`

scope.onmessage = (e: MessageEvent<RunRequest>) => {
  const msg = e.data
  if (msg.type !== 'run') return
  void (async () => {
    const { id, code, stdinLines, files } = msg
    try {
      if (!pyodidePromise) scope.postMessage({ type: 'loading', id })
      const pyodide = await getPyodide()
      scope.postMessage({ type: 'ready', id })
      pyodide.setStdout({ batched: (text) => scope.postMessage({ type: 'stdout', id, text }) })
      pyodide.setStderr({ batched: (text) => scope.postMessage({ type: 'stdout', id, text }) })
      pyodide.globals.set('_dhcb_stdin_lines', stdinLines)
      const start = Date.now()
      await pyodide.runPythonAsync(PREL_INPUT)
      if (files && Object.keys(files).length > 0) {
        // Truyền qua JSON string: đơn giản và không phụ thuộc cách Pyodide bọc object JS.
        pyodide.globals.set('_dhcb_files_json', JSON.stringify(files))
        await pyodide.runPythonAsync(PREL_WORKSPACE)
      }
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
