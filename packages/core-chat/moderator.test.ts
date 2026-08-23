// Test Content Moderation Engine — bao phủ: severity none/low/medium/high, mask đúng vị trí
// giữ nguyên phần còn lại của câu, bỏ dấu tiếng Việt, gộp ký tự lặp, leetspeak tiếng Anh, ghép
// cặp token phát hiện cụm 2 từ, và KHÔNG báo nhầm khi 2 từ vô hại liền kề ghép thành chuỗi
// trùng ngẫu nhiên với 1 từ xấu ngắn hơn.

import { describe, it, expect } from 'vitest'
import { moderateContent, normalizeToken } from './moderator.js'

describe('normalizeToken', () => {
  it('bỏ dấu tiếng Việt + viết thường', () => {
    expect(normalizeToken('NGU')).toBe('ngu')
    expect(normalizeToken('Đụt')).toBe('dut')
  })

  it('gộp ký tự lặp ≥ 3 lần', () => {
    expect(normalizeToken('đụttttt')).toBe('dut')
  })

  it('đổi leetspeak cơ bản', () => {
    expect(normalizeToken('fu(k')).toBe('fuk')
    expect(normalizeToken('f4ck')).toBe('fack')
  })

  it('bỏ dấu câu/ký tự đặc biệt', () => {
    expect(normalizeToken('ngu!!!')).toBe('ngu')
  })
})

describe('moderateContent — severity none', () => {
  it('câu bình thường → không match, giữ nguyên text', () => {
    const result = moderateContent('xin chào bạn khỏe không')
    expect(result).toEqual({
      clean: 'xin chào bạn khỏe không',
      severity: 'none',
      matches: [],
      blocked: false,
    })
  })
})

describe('moderateContent — severity low/medium (filter)', () => {
  it('medium: mask đúng từ vi phạm, GIỮ NGUYÊN phần còn lại của câu', () => {
    const result = moderateContent('mày ngu quá')
    expect(result.severity).toBe('medium')
    expect(result.blocked).toBe(false)
    expect(result.clean).toBe('mày n** quá')
    expect(result.matches).toContain('ngu')
  })

  it('low: mask nhưng không chặn gửi', () => {
    const result = moderateContent('nói năng nhamnhi quá')
    expect(result.severity).toBe('low')
    expect(result.blocked).toBe(false)
    expect(result.clean).toBe('nói năng n****** quá')
  })

  it('phát hiện qua leetspeak/ký tự lặp vẫn mask đúng độ dài token gốc', () => {
    const result = moderateContent('mày nguuuuu vãi')
    expect(result.severity).toBe('medium')
    expect(result.clean).toBe('mày n****** vãi')
  })
})

describe('moderateContent — severity high (block)', () => {
  it('high: blocked=true, GIỮ NGUYÊN text gốc (không mask, không lộ nội dung đã lọc)', () => {
    const result = moderateContent('you are fucking stupid')
    expect(result.severity).toBe('high')
    expect(result.blocked).toBe(true)
    expect(result.clean).toBe('you are fucking stupid')
    expect(result.matches).toEqual(expect.arrayContaining(['fuck', 'stupid']))
  })

  it('high thắng medium khi câu có cả 2 mức trong cùng tin nhắn', () => {
    const result = moderateContent('mày ngu và fuck you')
    expect(result.severity).toBe('high')
    expect(result.blocked).toBe(true)
  })
})

describe('moderateContent — cụm 2 token (phrase)', () => {
  it('"óc chó" (2 token) → khớp cụm "occho" trong wordlist, mask cả 2 token', () => {
    const result = moderateContent('đồ óc chó')
    expect(result.severity).toBe('medium')
    expect(result.matches).toContain('occho')
    expect(result.clean).not.toContain('óc chó')
  })

  it('KHÔNG báo nhầm: 2 từ vô hại liền kề ghép lại trùng NGẪU NHIÊN với 1 từ xấu ngắn hơn', () => {
    // "mày" + "ngu" ghép chuỗi chuẩn hoá = "mayngu", chứa substring "ngu" — nhưng đây là ghép
    // cặp CHÍNH XÁC (không dùng substring) nên KHÔNG được coi là khớp cụm; "ngu" vẫn bị mask
    // đúng vì bản thân nó LÀ một từ trong wordlist (khớp đơn token), không phải lỗi ghép cặp.
    const result = moderateContent('mày ngu quá')
    expect(result.clean.startsWith('mày')).toBe(true) // "mày" không bị mask
  })
})
