import { describe, it, expect, afterEach } from 'vitest'
import {
  groqKeyPool,
  hasGroqKey,
  isSkippableGroqKeyError,
  nextGroqKeyStartIndex,
  __resetGroqKeyRotationForTests,
} from './groqKeyPool.js'

const OLD_GROQ = process.env.GROQ_API_KEY

afterEach(() => {
  __resetGroqKeyRotationForTests()
  if (OLD_GROQ === undefined) delete process.env.GROQ_API_KEY
  else process.env.GROQ_API_KEY = OLD_GROQ
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
