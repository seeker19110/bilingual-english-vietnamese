import { describe, it, expect } from 'vitest'
import {
  AiRequestSchema,
  AiResponseSchema,
  AI_REQUEST_SCHEMA_VERSION,
  AI_RESPONSE_SCHEMA_VERSION,
} from './aiRequest.js'

const validRequest = {
  task: 'chat',
  modelPolicy: 'claude-haiku-4-5-20251001',
  messages: [
    { role: 'system', content: 'Bạn là gia sư' },
    { role: 'user', content: 'Xin chào' },
  ],
  timeoutMs: 30000,
  requestId: 'a1b2c3d4',
  schemaVersion: AI_REQUEST_SCHEMA_VERSION,
}

const validResponse = {
  content: 'Xin chào! Tôi có thể giúp gì cho bạn?',
  provider: 'groq',
  model: 'llama-3.3-70b-versatile',
  latencyMs: 420,
  requestId: 'a1b2c3d4',
  schemaVersion: AI_RESPONSE_SCHEMA_VERSION,
}

describe('AiRequestSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(AiRequestSchema.parse(validRequest)).toEqual(validRequest)
  })

  it('messages rỗng (chưa có hội thoại) → parse thành công', () => {
    expect(AiRequestSchema.parse({ ...validRequest, messages: [] }).messages).toEqual([])
  })

  it('task ngoài 4 giá trị cho phép → từ chối', () => {
    expect(() => AiRequestSchema.parse({ ...validRequest, task: 'translate' })).toThrow()
  })

  it('role trong message ngoài system/user/assistant → từ chối', () => {
    const bad = { ...validRequest, messages: [{ role: 'function', content: 'x' }] }
    expect(() => AiRequestSchema.parse(bad)).toThrow()
  })

  it('timeoutMs <= 0 → từ chối', () => {
    expect(() => AiRequestSchema.parse({ ...validRequest, timeoutMs: 0 })).toThrow()
  })

  it('field lạ (vd client tự gửi apiKey) → từ chối', () => {
    expect(() => AiRequestSchema.parse({ ...validRequest, apiKey: 'sk-xxx' })).toThrow()
  })
})

describe('AiResponseSchema', () => {
  it('payload hợp lệ → parse thành công', () => {
    expect(AiResponseSchema.parse(validResponse)).toEqual(validResponse)
  })

  it('provider ngoài groq/anthropic/gemini → từ chối', () => {
    expect(() => AiResponseSchema.parse({ ...validResponse, provider: 'openai' })).toThrow()
  })

  it('latencyMs âm → từ chối', () => {
    expect(() => AiResponseSchema.parse({ ...validResponse, latencyMs: -1 })).toThrow()
  })

  it('latencyMs = 0 (biên hợp lệ, phản hồi tức thời) → parse thành công', () => {
    expect(AiResponseSchema.parse({ ...validResponse, latencyMs: 0 }).latencyMs).toBe(0)
  })

  it('field lạ → từ chối', () => {
    expect(() => AiResponseSchema.parse({ ...validResponse, tokensUsed: 120 })).toThrow()
  })
})
