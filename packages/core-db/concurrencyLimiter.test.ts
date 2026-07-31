import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { withConcurrencyLimit } from './concurrencyLimiter'

const ENV_KEY = 'AI_CONCURRENCY_TESTKEY'

describe('withConcurrencyLimit', () => {
  const originalValue = process.env[ENV_KEY]

  beforeEach(() => {
    delete process.env[ENV_KEY]
  })
  afterEach(() => {
    if (originalValue === undefined) delete process.env[ENV_KEY]
    else process.env[ENV_KEY] = originalValue
  })

  it('không cấu hình biến môi trường → chạy ngay, không chờ (giữ nguyên hành vi cũ)', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withConcurrencyLimit('testkey', fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('đặt giới hạn = 1 → lời gọi thứ 2 phải CHỜ lời gọi 1 xong mới bắt đầu', async () => {
    process.env[ENV_KEY] = '1'

    let firstStarted = false
    let firstResolve!: () => void
    const firstDone = new Promise<void>((resolve) => (firstResolve = resolve))

    const order: string[] = []

    const p1 = withConcurrencyLimit('testkey', async () => {
      firstStarted = true
      order.push('1-start')
      await firstDone
      order.push('1-end')
      return 1
    })

    // Đợi 1 tick để đảm bảo lời gọi 1 đã thực sự bắt đầu chạy trước khi gọi lời gọi 2.
    await new Promise((r) => setTimeout(r, 0))
    expect(firstStarted).toBe(true)

    let secondStarted = false
    const p2 = withConcurrencyLimit('testkey', async () => {
      secondStarted = true
      order.push('2-start')
      return 2
    })

    // Lời gọi 2 CHƯA được chạy vì giới hạn = 1 và lời gọi 1 chưa xong.
    await new Promise((r) => setTimeout(r, 0))
    expect(secondStarted).toBe(false)

    firstResolve()
    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1).toBe(1)
    expect(r2).toBe(2)
    expect(order).toEqual(['1-start', '1-end', '2-start'])
  })

  it('lỗi ở 1 lời gọi không làm kẹt hàng đợi — lời gọi sau vẫn chạy được', async () => {
    process.env[ENV_KEY] = '1'

    await expect(
      withConcurrencyLimit('testkey', async () => {
        throw new Error('lỗi giả lập')
      }),
    ).rejects.toThrow('lỗi giả lập')

    const result = await withConcurrencyLimit('testkey', async () => 'sau lỗi vẫn chạy được')
    expect(result).toBe('sau lỗi vẫn chạy được')
  })
})
