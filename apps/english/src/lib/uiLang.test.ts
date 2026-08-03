import { describe, it, expect, beforeEach } from 'vitest'
import { getUiLang, setUiLang } from './uiLang'

describe('uiLang — lưu/đọc ngôn ngữ giao diện', () => {
  beforeEach(() => localStorage.clear())

  it('chưa lưu gì → mặc định vi', () => {
    expect(getUiLang()).toBe('vi')
  })

  it('setUiLang rồi getUiLang → đọc lại đúng giá trị đã lưu', () => {
    setUiLang('en')
    expect(getUiLang()).toBe('en')
    setUiLang('vi')
    expect(getUiLang()).toBe('vi')
  })
})
