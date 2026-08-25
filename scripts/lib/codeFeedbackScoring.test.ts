import { describe, it, expect } from 'vitest'
import {
  extractCodeBlocks,
  codeLineCount,
  leaksSolution,
  isVietnamese,
  scoreFeedback,
  summarize,
  MAX_SNIPPET_LINES,
} from './codeFeedbackScoring.ts'

const fence = (code: string) => '```python\n' + code + '\n```'

describe('extractCodeBlocks / codeLineCount', () => {
  it('lấy đúng nội dung nhiều khối, bỏ nhãn ngôn ngữ', () => {
    const blocks = extractCodeBlocks(`Thử xem: ${fence('a = 1')} rồi ${fence('b = 2')}`)
    expect(blocks.map((b) => b.trim())).toEqual(['a = 1', 'b = 2'])
  })

  it('không có khối nào → mảng rỗng', () => {
    expect(extractCodeBlocks('Bạn thử đọc lại đề nhé?')).toEqual([])
  })

  it('dòng trống và comment thuần KHÔNG tính là dòng code', () => {
    expect(codeLineCount('# chú thích\n\na = 1\n\n# nữa')).toBe(1)
  })
})

describe('leaksSolution', () => {
  it('khối minh hoạ ngắn (≤ MAX_SNIPPET_LINES dòng) là hợp lệ', () => {
    const short = Array.from({ length: MAX_SNIPPET_LINES }, (_, i) => `x${i} = ${i}`).join('\n')
    expect(leaksSolution(`Ví dụ khác đề: ${fence(short)}`)).toBe(false)
  })

  it('khối dài hơn = chép-dán được → vi phạm', () => {
    const long = Array.from({ length: MAX_SNIPPET_LINES + 1 }, (_, i) => `x${i} = ${i}`).join('\n')
    expect(leaksSolution(fence(long))).toBe(true)
  })

  it('văn xuôi thuần không bao giờ bị coi là lộ lời giải', () => {
    expect(leaksSolution('Bạn thử chạy lại với 0 kWh xem dòng nào chạy?')).toBe(false)
  })
})

describe('isVietnamese', () => {
  it('câu tiếng Việt có dấu → true', () => {
    expect(isVietnamese('Bạn thử đọc lại đề bài một lần nữa nhé?')).toBe(true)
  })

  it('câu tiếng Anh → false', () => {
    expect(isVietnamese('Your code looks good but the condition is wrong here.')).toBe(false)
  })

  it('câu quá ngắn → false (không đủ cơ sở kết luận)', () => {
    expect(isVietnamese('Đúng rồi')).toBe(false)
  })
})

describe('scoreFeedback', () => {
  const viHint = 'Bạn thử đọc lại đề xem bài yêu cầu in ra những gì nhé?'

  it('gợi ý Socratic hợp lệ → đạt, không vi phạm', () => {
    expect(scoreFeedback({ kind: 'socratic_hint', text: viHint })).toEqual({
      passed: true,
      violations: [],
    })
  })

  it('gợi ý không có câu hỏi nào → vi phạm đúng tên', () => {
    const s = scoreFeedback({
      kind: 'socratic_hint',
      text: 'Bạn cần dùng câu lệnh if để so sánh số điện đã dùng.',
    })
    expect(s.passed).toBe(false)
    expect(s.violations).toContain('gợi ý Socratic mà không có câu hỏi nào')
  })

  it('giải thích lỗi mà không gọi tên lỗi → vi phạm', () => {
    const s = scoreFeedback({
      kind: 'explain_error',
      text: 'Máy đang báo là bạn dùng một biến chưa được gán giá trị trước đó nhé.',
      errorName: 'NameError',
    })
    expect(s.violations).toContain('không gọi tên lỗi NameError')
  })

  it('gộp nhiều vi phạm cùng lúc (tiếng Anh + lộ lời giải)', () => {
    const long = Array.from({ length: 6 }, (_, i) => `line${i} = ${i}`).join('\n')
    const s = scoreFeedback({ kind: 'review', text: `Here is the fix:\n${fence(long)}` })
    expect(s.passed).toBe(false)
    expect(s.violations).toHaveLength(2)
  })

  it('trả lời rỗng → hỏng, và KHÔNG bị đếm thêm lỗi "không phải tiếng Việt"', () => {
    const s = scoreFeedback({ kind: 'review', text: '   ' })
    expect(s.violations).toEqual(['trả lời rỗng'])
  })
})

describe('summarize', () => {
  it('cộng đúng tỉ lệ đạt và đếm theo loại vi phạm', () => {
    const s = summarize([
      { passed: true, violations: [] },
      { passed: false, violations: ['trả lời rỗng'] },
      { passed: false, violations: ['trả lời rỗng', 'không phải tiếng Việt'] },
    ])
    expect(s).toEqual({
      total: 3,
      passed: 1,
      passRate: 1 / 3,
      byViolation: { 'trả lời rỗng': 2, 'không phải tiếng Việt': 1 },
    })
  })

  it('không có ca nào → passRate 0, không chia cho 0', () => {
    expect(summarize([]).passRate).toBe(0)
  })
})
