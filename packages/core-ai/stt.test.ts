// Test handler /api/stt (packages/core-ai/stt.ts) — mock auth/security/usage/transcribeAudio
// để test OFFLINE. Trọng tâm: giới hạn lượt (checkAndConsumeUsage) và HOÀN lượt khi provider
// STT lỗi (refundUsage) — tương tự nguyên tắc "đường đi của tiền" ở ai.test.ts.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

vi.mock('../core-auth/security', () => ({
  getCorsHeaders: () => ({}),
  SECURITY_HEADERS: {},
  checkRateLimit: async () => true,
  validateAuth: async () => ({ userId: 'user-test' }),
  validateContentType: () => true,
  logSecurityEvent: () => {},
}))
vi.mock('../core-billing/usage', () => ({
  checkAndConsumeUsage: vi.fn(async () => ({ ok: true as const })),
  refundUsage: vi.fn(async () => {}),
}))
vi.mock('./openaiStt', () => ({ transcribeAudio: vi.fn() }))

import handler from './stt'
import * as security from '../core-auth/security'
import { checkAndConsumeUsage, refundUsage } from '../core-billing/usage'
import { transcribeAudio } from './openaiStt'

const mockedConsume = vi.mocked(checkAndConsumeUsage)
const mockedRefund = vi.mocked(refundUsage)
const mockedTranscribe = vi.mocked(transcribeAudio)

function makeRequest(body?: object): Request {
  return new Request('http://localhost/api/stt', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
    body: JSON.stringify(
      body ?? { audio_b64: Buffer.from('audio').toString('base64'), lang: 'en' },
    ),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockedConsume.mockResolvedValue({ ok: true })
  mockedTranscribe.mockResolvedValue('xin chào')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handler /api/stt — cổng vào', () => {
  it('OPTIONS → 204', async () => {
    const res = await handler(new Request('http://localhost/api/stt', { method: 'OPTIONS' }))
    expect(res.status).toBe(204)
  })

  it('GET → 405', async () => {
    const res = await handler(new Request('http://localhost/api/stt', { method: 'GET' }))
    expect(res.status).toBe(405)
  })

  it('Content-Type sai → 415', async () => {
    vi.spyOn(security, 'validateContentType').mockReturnValueOnce(false)
    const res = await handler(makeRequest())
    expect(res.status).toBe(415)
  })

  it('Rate limit vượt quá → 429', async () => {
    vi.spyOn(security, 'checkRateLimit').mockResolvedValueOnce(false)
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
  })

  it('Chưa đăng nhập → 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const res = await handler(makeRequest())
    expect(res.status).toBe(401)
  })

  it('Thiếu audio_b64 → 400', async () => {
    const res = await handler(makeRequest({ audio_b64: '' }))
    expect(res.status).toBe(400)
  })

  it('audio_b64 quá dài → 413', async () => {
    const res = await handler(makeRequest({ audio_b64: 'a'.repeat(9 * 1024 * 1024) }))
    expect(res.status).toBe(413)
  })

  it('audio_b64 không phải base64 hợp lệ → 400', async () => {
    // ký tự '!' không nằm trong bảng base64 hợp lệ
    const res = await handler(makeRequest({ audio_b64: '!!!not-base64!!!' }))
    expect(res.status).toBe(400)
  })

  it('Hết lượt dùng (usage gate) → 429, KHÔNG gọi transcribeAudio', async () => {
    mockedConsume.mockResolvedValueOnce({ ok: false, message: 'Hết lượt hôm nay' })
    const res = await handler(makeRequest())
    expect(res.status).toBe(429)
    expect(mockedTranscribe).not.toHaveBeenCalled()
  })
})

describe('handler /api/stt — luồng nhận diện', () => {
  it('nhận diện thành công → 200 kèm text, KHÔNG hoàn lượt', async () => {
    const res = await handler(makeRequest())
    expect(res.status).toBe(200)
    const data = (await res.json()) as { text: string }
    expect(data.text).toBe('xin chào')
    expect(mockedRefund).not.toHaveBeenCalled()
  })

  it('transcribeAudio ném lỗi → 500 + HOÀN lượt', async () => {
    mockedTranscribe.mockRejectedValueOnce(new Error('Groq STT lỗi (500): boom'))
    const res = await handler(makeRequest())
    expect(res.status).toBe(500)
    expect(mockedRefund).toHaveBeenCalledWith('user-test', 'stt')
    const data = (await res.json()) as { error: string }
    expect(data.error).toMatch(/Không nhận diện được giọng nói/)
  })

  it('lang mặc định "en" khi không truyền', async () => {
    await handler(
      new Request('http://localhost/api/stt', {
        method: 'POST',
        headers: { 'content-type': 'application/json', Authorization: 'Bearer x' },
        body: JSON.stringify({ audio_b64: Buffer.from('audio').toString('base64') }),
      }),
    )
    expect(mockedTranscribe).toHaveBeenCalledWith(expect.anything(), 'audio/webm', 'en')
  })

  it('lang không hợp lệ → 400', async () => {
    const res = await handler(
      makeRequest({ audio_b64: Buffer.from('audio').toString('base64'), lang: 'fr' }),
    )
    expect(res.status).toBe(400)
  })
})
