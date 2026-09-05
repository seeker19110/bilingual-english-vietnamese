// Test cho pageWorkerRunner — khuôn dùng chung cho domRunner/fetchRunner. Vì là factory
// (taoPageWorkerRunner) nên mỗi test tự tạo worker giả riêng, không cần mock global Worker.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { taoPageWorkerRunner } from './pageWorkerRunner'

type Listener = (e: MessageEvent | Event) => void

class MockWorker {
  sent: unknown[] = []
  terminated = false
  private messageListeners: Listener[] = []
  private errorListeners: Listener[] = []

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
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('taoPageWorkerRunner', () => {
  it('gửi html/code/hanhDong/extra vào worker, gom stdout, trả done', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const onOutput = vi.fn()
    const promise = runner.run('document.title = "x"', {
      html: '<html></html>',
      hanhDong: ['click #nut'],
      onOutput,
      extra: { api: 'weather' },
    })
    const w = workers[0]
    expect(w.sent[0]).toMatchObject({
      type: 'run',
      html: '<html></html>',
      code: 'document.title = "x"',
      hanhDong: ['click #nut'],
      api: 'weather',
    })

    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'stdout', id: 1, text: 'ok' })
    w.emitMessage({ type: 'done', id: 1, durationMs: 5 })

    const result = await promise
    expect(result).toEqual({ output: 'ok', timedOut: false, durationMs: 5 })
  })

  it('hanhDong mặc định rỗng khi không truyền', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise = runner.run('code', { html: '<html></html>' })
    const w = workers[0]
    expect(w.sent[0]).toMatchObject({ hanhDong: [] })
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await promise
  })

  it('bỏ qua thông điệp id khác lượt chạy hiện tại', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise = runner.run('code', { html: '<x/>' })
    const w = workers[0]
    w.emitMessage({ type: 'done', id: 999, durationMs: 1 })
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 8 })
    const result = await promise
    expect(result.durationMs).toBe(8)
  })

  it('lỗi script trả về error, không timeout', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise = runner.run('lỗi cú pháp', { html: '<x/>' })
    const w = workers[0]
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'error', id: 1, message: 'SyntaxError' })
    const result = await promise
    expect(result.error).toBe('SyntaxError')
    expect(result.timedOut).toBe(false)
  })

  it('quá giờ: reset() terminate worker, lượt sau tạo worker mới', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise = runner.run('while(true){}', { html: '<x/>', timeoutMs: 300 })
    const w = workers[0]
    w.emitMessage({ type: 'ready', id: 1 })
    vi.advanceTimersByTime(300)
    const result = await promise
    expect(result.timedOut).toBe(true)
    expect(w.terminated).toBe(true)

    const promise2 = runner.run('code2', { html: '<x/>' })
    const w2 = workers[1]
    expect(w2).not.toBe(w)
    w2.emitMessage({ type: 'ready', id: 2 })
    w2.emitMessage({ type: 'done', id: 2, durationMs: 1 })
    await promise2
  })

  it('busy: lượt chạy thứ hai trả lỗi ngay, không tạo worker mới', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise1 = runner.run('a', { html: '<x/>' })
    const result2 = await runner.run('b', { html: '<x/>' })
    expect(result2.error).toMatch(/Đang có chương trình chạy/)
    expect(workers.length).toBe(1)

    const w = workers[0]
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await promise1
  })

  it('worker báo lỗi tải trả error DOM, dùng câu mặc định khi không có message', async () => {
    const workers: MockWorker[] = []
    const runner = taoPageWorkerRunner(() => {
      const w = new MockWorker()
      workers.push(w)
      return w as unknown as Worker
    })
    const promise = runner.run('a', { html: '<x/>' })
    workers[0].emitError('')
    const result = await promise
    expect(result.error).toMatch(/Không chạy được môi trường DOM: lỗi tải worker/)
  })

  it('reset() gọi được nhiều lần kể cả khi chưa có worker', () => {
    const runner = taoPageWorkerRunner(() => new MockWorker() as unknown as Worker)
    expect(() => runner.reset()).not.toThrow()
  })

  it('worker chỉ tạo một lần cho nhiều lượt chạy liên tiếp (không quá giờ)', async () => {
    const taoWorker = vi.fn(() => new MockWorker() as unknown as Worker)
    const runner = taoPageWorkerRunner(taoWorker)
    const p1 = runner.run('a', { html: '<x/>' })
    const w = taoWorker.mock.results[0].value as unknown as MockWorker
    w.emitMessage({ type: 'ready', id: 1 })
    w.emitMessage({ type: 'done', id: 1, durationMs: 1 })
    await p1

    const p2 = runner.run('b', { html: '<x/>' })
    expect(taoWorker).toHaveBeenCalledTimes(1)
    w.emitMessage({ type: 'ready', id: 2 })
    w.emitMessage({ type: 'done', id: 2, durationMs: 1 })
    await p2
  })
})
