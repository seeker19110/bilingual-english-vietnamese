// Test cho sqlRunner — cùng khuôn pythonRunner/jsRunner, khác ở chỗ stdout nối thẳng
// (không tự thêm '\n') và có bước 'loading' cho SQLite.
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

describe('sqlRunner', () => {
  it('chạy thành công: nối output thẳng (không thêm xuống dòng), gọi onOutput', async () => {
    const { runSql } = await import('./sqlRunner')
    const onOutput = vi.fn()
    const promise = runSql('SELECT 1', { onOutput })
    const w = MockWorker.latest()
    expect(w.sent[0]).toMatchObject({ type: 'run', code: 'SELECT 1' })

    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'stdout', id: 1, text: 'a' })
    w.emitMessage({ type: 'stdout', id: 1, text: 'b' })
    w.emitMessage({ type: 'done', id: 1, durationMs: 3 })

    const result = await promise
    expect(result).toEqual({ output: 'ab', timedOut: false, durationMs: 3 })
    expect(onOutput).toHaveBeenCalledWith('ab')
  })

  it('bỏ qua thông điệp id khác lượt chạy hiện tại', async () => {
    const { runSql } = await import('./sqlRunner')
    const promise = runSql('SELECT 1')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'done', id: 999, durationMs: 1 })
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 9 })
    const result = await promise
    expect(result.durationMs).toBe(9)
  })

  it('lỗi truy vấn trả về error, không timeout', async () => {
    const { runSql } = await import('./sqlRunner')
    const promise = runSql('SELECT * FROM khong_ton_tai')
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'error', id: 1, message: 'no such table' })
    const result = await promise
    expect(result.error).toBe('no such table')
    expect(result.timedOut).toBe(false)
  })

  it('quá giờ: terminate worker, trả timedOut, lượt sau tạo worker mới', async () => {
    const { runSql } = await import('./sqlRunner')
    const promise = runSql('SELECT 1', { timeoutMs: 800 })
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    vi.advanceTimersByTime(800)
    const result = await promise
    expect(result.timedOut).toBe(true)
    expect(result.error).toMatch(/quá 1 giây/)
    expect(w.terminated).toBe(true)

    const promise2 = runSql('SELECT 2')
    const w2 = MockWorker.latest()
    expect(w2).not.toBe(w)
    w2.emitMessage({ type: 'ready', id: 2 })
    w2.emitMessage({ type: 'done', id: 2, durationMs: 1 })
    await promise2
  })

  it('đang tải môi trường thì huỷ timer chờ, chỉ đếm giờ sau khi ready', async () => {
    const { runSql } = await import('./sqlRunner')
    const onLoading = vi.fn()
    const promise = runSql('SELECT 1', { onLoading, timeoutMs: 500 })
    const w = MockWorker.latest()
    w.emitMessage({ type: 'loading', id: 1 })
    expect(onLoading).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(1000)
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    const result = await promise
    expect(result.timedOut).toBe(false)
  })

  it('busy: lượt chạy thứ hai trả lỗi ngay', async () => {
    const { runSql } = await import('./sqlRunner')
    const promise1 = runSql('SELECT 1')
    const result2 = await runSql('SELECT 2')
    expect(result2.error).toMatch(/Đang có truy vấn chạy/)
    const w = MockWorker.latest()
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await promise1
  })

  it('worker báo lỗi tải trả error, dùng câu mặc định khi không có message', async () => {
    const { runSql } = await import('./sqlRunner')
    const promise = runSql('SELECT 1')
    const w = MockWorker.latest()
    w.emitError('')
    const result = await promise
    expect(result.error).toMatch(/Không chạy được môi trường SQL: lỗi tải worker/)
  })

  it('resetSqlWorker khi chưa có worker nào không lỗi', async () => {
    const { resetSqlWorker } = await import('./sqlRunner')
    expect(() => resetSqlWorker()).not.toThrow()
  })
})
