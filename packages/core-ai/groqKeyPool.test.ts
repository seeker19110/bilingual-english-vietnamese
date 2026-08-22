import { describe, it, expect, afterEach } from 'vitest'
import {
  groqKeyPool,
  groqModelPool,
  hasGroqKey,
  isSkippableGroqKeyError,
  nextGroqKeyStartIndex,
  __resetGroqKeyRotationForTests,
} from './groqKeyPool.js'

const OLD_GROQ = process.env.GROQ_API_KEY
const OLD_MODEL = process.env.GROQ_CHAT_MODEL

afterEach(() => {
  __resetGroqKeyRotationForTests()
  if (OLD_GROQ === undefined) delete process.env.GROQ_API_KEY
  else process.env.GROQ_API_KEY = OLD_GROQ
  if (OLD_MODEL === undefined) delete process.env.GROQ_CHAT_MODEL
  else process.env.GROQ_CHAT_MODEL = OLD_MODEL
})

describe('groqKeyPool', () => {
  it('thiếu GROQ_API_KEY → bể rỗng, hasGroqKey() false', () => {
    delete process.env.GROQ_API_KEY
    expect(groqKeyPool()).toEqual([])
    expect(hasGroqKey()).toBe(false)
  })

  it('1 key đơn → bể có đúng 1 phần tử', () => {
    process.env.GROQ_API_KEY = 'gsk_single'
    expect(groqKeyPool()).toEqual(['gsk_single'])
    expect(hasGroqKey()).toBe(true)
  })

  it('nhiều key cách nhau dấu phẩy → tách đúng, bỏ khoảng trắng', () => {
    process.env.GROQ_API_KEY = ' gsk_a , gsk_b ,gsk_c'
    expect(groqKeyPool()).toEqual(['gsk_a', 'gsk_b', 'gsk_c'])
  })

  it('nhiều key cách nhau xuống dòng → tách đúng', () => {
    process.env.GROQ_API_KEY = 'gsk_a\ngsk_b'
    expect(groqKeyPool()).toEqual(['gsk_a', 'gsk_b'])
  })

  it('dấu phẩy thừa/rỗng → lọc bỏ phần tử rỗng', () => {
    process.env.GROQ_API_KEY = 'gsk_a,,gsk_b,'
    expect(groqKeyPool()).toEqual(['gsk_a', 'gsk_b'])
  })
})

describe('isSkippableGroqKeyError', () => {
  it('401 và 429 → true (lỗi do chính key)', () => {
    expect(isSkippableGroqKeyError(401)).toBe(true)
    expect(isSkippableGroqKeyError(429)).toBe(true)
  })

  it('500/400/undefined → false (không liên quan tới key)', () => {
    expect(isSkippableGroqKeyError(500)).toBe(false)
    expect(isSkippableGroqKeyError(400)).toBe(false)
    expect(isSkippableGroqKeyError(undefined)).toBe(false)
  })
})

describe('nextGroqKeyStartIndex', () => {
  it('xoay vòng tăng dần rồi quay lại 0', () => {
    expect(nextGroqKeyStartIndex(3)).toBe(0)
    expect(nextGroqKeyStartIndex(3)).toBe(1)
    expect(nextGroqKeyStartIndex(3)).toBe(2)
    expect(nextGroqKeyStartIndex(3)).toBe(0)
  })

  it('reset test → về lại 0', () => {
    nextGroqKeyStartIndex(2)
    __resetGroqKeyRotationForTests()
    expect(nextGroqKeyStartIndex(2)).toBe(0)
  })
})

describe('groqModelPool', () => {
  it('không có config và không có arg → fallback openai/gpt-oss-120b', () => {
    delete process.env.GROQ_CHAT_MODEL
    expect(groqModelPool()).toEqual(['openai/gpt-oss-120b'])
  })

  it('1 model đơn → mảng 1 phần tử', () => {
    expect(groqModelPool('llama-3.3-70b-versatile')).toEqual(['llama-3.3-70b-versatile'])
  })

  it('nhiều model cách nhau dấu phẩy → tách thành mảng đúng thứ tự, bỏ khoảng trắng', () => {
    const list = groqModelPool('llama-3.3-70b-versatile, openai/gpt-oss-120b, qwen/qwen3.6-27b')
    expect(list).toEqual(['llama-3.3-70b-versatile', 'openai/gpt-oss-120b', 'qwen/qwen3.6-27b'])
  })

  it('nhiều model từ biến môi trường GROQ_CHAT_MODEL → tách đúng', () => {
    process.env.GROQ_CHAT_MODEL = 'llama-3.3-70b-versatile,openai/gpt-oss-120b'
    expect(groqModelPool()).toEqual(['llama-3.3-70b-versatile', 'openai/gpt-oss-120b'])
  })

  it('dấu phẩy thừa hoặc rỗng → lọc bỏ phần tử rỗng', () => {
    expect(groqModelPool('model1,,model2,')).toEqual(['model1', 'model2'])
  })
})
