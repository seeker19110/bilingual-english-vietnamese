import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { readJsonBody, validateBody } from './validation'

describe('readJsonBody', () => {
  it('parse JSON hợp lệ', async () => {
    const req = new Request('http://x', { method: 'POST', body: JSON.stringify({ a: 1 }) })
    const result = await readJsonBody(req)
    expect(result).toEqual({ ok: true, raw: { a: 1 } })
  })

  it('trả lỗi 400 khi body không phải JSON', async () => {
    const req = new Request('http://x', { method: 'POST', body: 'not json' })
    const result = await readJsonBody(req)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.status).toBe(400)
    }
  })
})

describe('validateBody', () => {
  const schema = z.object({
    audio_b64: z
      .string({ error: 'Thiếu audio_b64' })
      .trim()
      .min(1, 'Thiếu audio_b64')
      .refine((v) => v.length <= 5, {
        error: 'Đoạn ghi âm quá dài',
        params: { status: 413 },
      }),
  })

  it('trả data khi hợp lệ', () => {
    const result = validateBody(schema, { audio_b64: 'abc' })
    expect(result).toEqual({ ok: true, data: { audio_b64: 'abc' } })
  })

  it('trả 400 (mặc định) khi thiếu field', () => {
    const result = validateBody(schema, {})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({ status: 400, message: 'Thiếu audio_b64' })
    }
  })

  it('đọc status tùy chỉnh từ refine (413 quá lớn)', () => {
    const result = validateBody(schema, { audio_b64: 'abcdef' })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual({ status: 413, message: 'Đoạn ghi âm quá dài' })
    }
  })
})
