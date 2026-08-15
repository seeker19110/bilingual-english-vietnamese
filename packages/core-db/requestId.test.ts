import { describe, it, expect } from 'vitest'
import { createRequestId } from './requestId.js'

describe('createRequestId', () => {
  it('trả về chuỗi 8 ký tự', () => {
    expect(createRequestId()).toHaveLength(8)
  })

  it('chỉ gồm ký tự hex (khớp phần đầu UUID v4)', () => {
    expect(createRequestId()).toMatch(/^[0-9a-f]{8}$/)
  })

  it('2 lần gọi liên tiếp trả về giá trị KHÁC nhau', () => {
    const a = createRequestId()
    const b = createRequestId()
    expect(a).not.toBe(b)
  })

  it('gọi nhiều lần không trùng nhau (xác suất trùng cực thấp)', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => createRequestId()))
    expect(ids.size).toBe(1000)
  })
})
