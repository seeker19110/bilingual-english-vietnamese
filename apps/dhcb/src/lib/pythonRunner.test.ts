// Test cho pythonRunner — giả lập Worker bằng MockWorker để kiểm hành vi thật:
// gửi đúng thông điệp, gom stdout, ngắt cứng khi quá giờ, dọn dẹp khi lỗi/xong.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

type Listener = (e: MessageEvent | Event) => void

/** Worker giả: ghi lại message đã gửi, cho phép test tự bắn sự kiện 'message'/'error'. */
class MockWorker {
  static instances: MockWorker[] = []
  sent: unknown[] = []
  terminated = false
  private messageListeners: Listener[] = []
  private errorListeners: Listener[] = []

  constructor() {
    MockWorker.instances.push(this)
  }

  postMessage(data: unknown) {
    this.sent.push(data)
  }

  addEventListener(type: string, cb: Listener) {
    if (type === 'message') this.messageListeners.push(cb)
    else if (type === 'error') this.errorListeners.push(cb)
  }

  removeEventListener(type: string, cb: Listener) {
    if (type === 'message') this.messageListeners = this.messageListeners.filter((l) => l !== cb)
    else if (type === 'error') this.errorListeners = this.errorListeners.filter((l) => l !== cb)
  }

  terminate() {
    this.terminated = true
  }

  emitMessage(data: unknown) {
    this.messageListeners.forEach((l) => l({ data } as MessageEvent))
  }

  emitError(message: string) {
    this.errorListeners.forEach((l) => l({ message } as unknown as Event))
  }

  static latest(): MockWorker {
    return MockWorker.instances[MockWorker.instances.length - 1]
  }
}

beforeEach(() => {
  vi.useFakeTimers()
  MockWorker.instances = []
  vi.stubGlobal('Worker', MockWorker as unknown as typeof Worker)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.resetModules()
})

describe('pythonRunner', () => {
  it('chạy thành công: gom stdout, gọi onOutput, trả done', async () => {
    const { runPython } = await import('./pythonRunner')
    const onOutput = vi.fn()
    const promise = runPython('print(1)', { onOutput })
    const w = MockWorker.latest()
    expect(w.sent[0]).toMatchObject({ type: 'run', code: 'print(1)' })

    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'stdout', id: 1, text: 'hello' })
    w.emitMessage({ type: 'stdout', id: 1, text: 'world\n' })
    w.emitMessage({ type: 'done', id: 1, durationMs: 42 })

    const result = await promise
    expect(result).toEqual({ output: 'hello\nworld\n', timedOut: false, durationMs: 42 })
    expect(onOutput).toHaveBeenCalledWith('hello\n')
    expect(onOutput).toHaveBeenCalledWith('hello\nworld\n')
  })

  it('bỏ qua thông điệp có id khác lượt chạy hiện tại', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise = runPython('print(1)')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 999 }) // id sai, không được armTimeout thật
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 999, durationMs: 1 }) // bị bỏ qua
    w.emitMessage({ type: 'done', id: 1, durationMs: 5 })
    const result = await promise
    expect(result.durationMs).toBe(5)
  })

  it('lỗi Python trả về error, không timeout', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise = runPython('1/0')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'error', id: 1, message: 'ZeroDivisionError' })
    const result = await promise
    expect(result.error).toBe('ZeroDivisionError')
    expect(result.timedOut).toBe(false)
  })

  it('quá giờ: terminate worker, trả timedOut, worker sau đó được tạo lại', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise = runPython('while True: pass', { timeoutMs: 1000 })
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    vi.advanceTimersByTime(1000)
    const result = await promise
    expect(result.timedOut).toBe(true)
    expect(result.error).toMatch(/quá 1 giây/)
    expect(w.terminated).toBe(true)

    // Lượt chạy sau tạo worker MỚI (worker cũ đã bị huỷ).
    const promise2 = runPython('print(2)')
    const w2 = MockWorker.latest()
    expect(w2).not.toBe(w)
    w2.emitMessage({ type: 'ready', id: 2 })
    w2.emitMessage({ type: 'done', id: 2, durationMs: 1 })
    await promise2
  })

  it('đang tải môi trường (loading) thì huỷ timer chờ, chỉ đếm giờ sau khi ready', async () => {
    const { runPython } = await import('./pythonRunner')
    const onLoading = vi.fn()
    const promise = runPython('print(1)', { onLoading, timeoutMs: 1000 })
    const w = MockWorker.latest()
    w.emitMessage({ type: 'loading', id: 1 })
    expect(onLoading).toHaveBeenCalledTimes(1)
    // Vượt quá timeoutMs mà chưa 'ready' thì KHÔNG bị ngắt vì timer đã bị clear ở 'loading'.
    vi.advanceTimersByTime(2000)
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 3 })
    const result = await promise
    expect(result.timedOut).toBe(false)
  })

  it('busy: lượt chạy thứ hai khi đang chạy trả lỗi ngay, không tạo worker mới', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise1 = runPython('print(1)')
    const countBefore = MockWorker.instances.length
    const result2 = await runPython('print(2)')
    expect(result2.error).toMatch(/Đang có chương trình chạy/)
    expect(MockWorker.instances.length).toBe(countBefore)

    // dọn cho xong lượt 1 để không rò rỉ sang test khác
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await promise1
  })

  it('worker báo lỗi tải (sự kiện error của chính Worker) trả error, không timeout', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise = runPython('print(1)')
    const w = MockWorker.latest()
    w.emitError('lỗi mạng')
    const result = await promise
    expect(result.error).toMatch(/Không chạy được môi trường Python: lỗi mạng/)
    expect(result.timedOut).toBe(false)
  })

  it('sự kiện error không có message dùng câu mặc định', async () => {
    const { runPython } = await import('./pythonRunner')
    const promise = runPython('print(1)')
    const w = MockWorker.latest()
    w.emitError('')
    const result = await promise
    expect(result.error).toMatch(/lỗi tải worker/)
  })

  it('resetPythonWorker khi chưa có worker nào không lỗi', async () => {
    const { resetPythonWorker } = await import('./pythonRunner')
    expect(() => resetPythonWorker()).not.toThrow()
  })
})
