import { describe, it, expect, vi, beforeEach } from 'vitest'

// callClaude() gọi getAuthHeader() (đụng supabase) — mock để test chạy OFFLINE.
vi.mock('@core/authHeader', () => ({ getAuthHeader: vi.fn().mockResolvedValue({}) }))
vi.mock('./errorTracking', () => ({ captureException: vi.fn().mockResolvedValue(undefined) }))

import { callClaude } from './ai'
import { captureException } from './errorTracking'

describe('callClaude — xử lý lỗi thân thiện (song ngữ, không phơi lỗi kỹ thuật ra UI)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('trả về text khi phản hồi đúng định dạng', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: 'Hello!' }] }),
    }) as unknown as typeof fetch
    const text = await callClaude([], 'system')
    expect(text).toBe('Hello!')
  })

  it('fetch ném lỗi mạng → thông điệp song ngữ thân thiện, không phải "Failed to fetch"', async () => {
    global.fetch = vi
      .fn()
      .mockRejectedValue(new TypeError('Failed to fetch')) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow(/Không kết nối được máy chủ/)
    expect(captureException).toHaveBeenCalled()
  })

  it('server trả lỗi CÓ message (vd hết lượt) → GIỮ NGUYÊN message đó (đã thân thiện sẵn)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: () => Promise.resolve({ error: { message: 'Bạn đã dùng hết lượt hôm nay.' } }),
    }) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow('Bạn đã dùng hết lượt hôm nay.')
  })

  it('server trả lỗi KHÔNG có message → thông điệp chung, không lộ status thô', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow(/Không kết nối được máy chủ/)
  })

  it('phản hồi 200 nhưng thiếu field "content" → thông điệp thân thiện, KHÔNG phải "Invalid API response: missing content"', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    }) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow(/Phản hồi từ AI bị lỗi định dạng/)
    expect(captureException).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'missing content' }),
      { where: 'callClaude' },
    )
  })

  it('content là mảng rỗng → thông điệp thân thiện', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [] }),
    }) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow(/Phản hồi từ AI bị lỗi định dạng/)
  })

  it('text không phải string → thông điệp thân thiện', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: [{ text: 123 }] }),
    }) as unknown as typeof fetch
    await expect(callClaude([], 'system')).rejects.toThrow(/Phản hồi từ AI bị lỗi định dạng/)
  })
})
