// Test cho jsRunner — song sinh với pythonRunner nhưng không có bước 'loading'.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

type Listener = (e: MessageEvent | Event) => void

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

describe('jsRunner', () => {
  it('chạy thành công: gom stdout, gọi onOutput, trả done', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const onOutput = vi.fn()
    const promise = runJavaScript('console.log(1)', { onOutput })
    const w = MockWorker.latest()
    expect(w.sent[0]).toMatchObject({ type: 'run', code: 'console.log(1)' })

    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'stdout', id: 1, text: '1' })
    // Dòng đã có sẵn '\n' thì không được thêm nữa (nhánh còn lại của endsWith).
    w.emitMessage({ type: 'stdout', id: 1, text: '2\n' })
    w.emitMessage({ type: 'done', id: 1, durationMs: 10 })

    const result = await promise
    expect(result).toEqual({ output: '1\n2\n', timedOut: false, durationMs: 10 })
    expect(onOutput).toHaveBeenCalledWith('1\n')
  })

  it('bỏ qua thông điệp id khác lượt chạy hiện tại', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const promise = runJavaScript('x')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'done', id: 999, durationMs: 1 })
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 7 })
    const result = await promise
    expect(result.durationMs).toBe(7)
  })

  it('lỗi JS trả về error, không timeout', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const promise = runJavaScript('throw new Error("x")')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'error', id: 1, message: 'x is not defined' })
    const result = await promise
    expect(result.error).toBe('x is not defined')
    expect(result.timedOut).toBe(false)
  })

  it('quá giờ: terminate worker, trả timedOut, lượt sau tạo worker mới', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const promise = runJavaScript('while(true){}', { timeoutMs: 500 })
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    vi.advanceTimersByTime(500)
    const result = await promise
    expect(result.timedOut).toBe(true)
    expect(w.terminated).toBe(true)

    const promise2 = runJavaScript('console.log(2)')
    const w2 = MockWorker.latest()
    expect(w2).not.toBe(w)
    w2.emitMessage({ type: 'ready', id: 2 })
    w2.emitMessage({ type: 'done', id: 2, durationMs: 1 })
    await promise2
  })

  it('busy: lượt chạy thứ hai trả lỗi ngay', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const promise1 = runJavaScript('a')
    const result2 = await runJavaScript('b')
    expect(result2.error).toMatch(/Đang có chương trình chạy/)
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await promise1
  })

  it('worker báo lỗi tải trả error, dùng câu mặc định khi không có message', async () => {
    const { runJavaScript } = await import('./jsRunner')
    const promise = runJavaScript('a')
    const w = MockWorker.latest()
    w.emitError('')
    const result = await promise
    expect(result.error).toMatch(/lỗi tải worker/)
  })

  it('resetJsWorker khi chưa có worker nào không lỗi', async () => {
    const { resetJsWorker } = await import('./jsRunner')
    expect(() => resetJsWorker()).not.toThrow()
  })
})
