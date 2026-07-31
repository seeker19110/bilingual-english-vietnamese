import { describe, it, expect } from 'vitest'
import { buildEvaluationShareContent, buildChallengeShareContent } from './shareContent'
import type { EvaluationResult } from '../types'

const mkEvaluation = (overrides: Partial<EvaluationResult['scores']> = {}): EvaluationResult => ({
  scores: { fluency: 7, lexical: 6.5, grammar: 8, overall: 7.2, ...overrides },
  errors: [],
  strengths: [],
  suggestions: [],
  encouragement: '',
})

describe('buildEvaluationShareContent', () => {
  it('trả về title + lines đủ khi có đủ điểm (chiều A)', () => {
    const r = buildEvaluationShareContent(mkEvaluation({ pronunciation: 8.5 }), true)
    expect(r.title).toContain('7.2')
    expect(r.lines).toHaveLength(4)
    expect(r.lines.some((l) => l.includes('Phát âm'))).toBe(true)
  })

  it('bỏ qua êm dòng pronunciation khi thiếu (Chat không có audio)', () => {
    const r = buildEvaluationShareContent(mkEvaluation(), true)
    expect(r.lines).toHaveLength(3)
    expect(r.lines.some((l) => l.includes('Phát âm'))).toBe(false)
  })

  it('dùng tiếng Anh khi isA=false', () => {
    const r = buildEvaluationShareContent(mkEvaluation(), false)
    expect(r.title).toContain('Conversation score')
    expect(r.lines[0]).toContain('Fluency')
  })

  it('không crash khi scores thiếu field / undefined, vẫn ra nội dung hợp lý', () => {
    const broken = {
      errors: [],
      strengths: [],
      suggestions: [],
      encouragement: '',
    } as unknown as EvaluationResult
    const r = buildEvaluationShareContent(broken, true)
    expect(r.title).toContain('0/9')
    expect(r.lines).toEqual([])
  })
})

describe('buildChallengeShareContent', () => {
  it('trả về title + pace khi có đủ dữ liệu', () => {
    const r = buildChallengeShareContent({ count: 5, firstWpm: 80, lastWpm: 110 }, true)
    expect(r.title).toBe('Tổng kết tuần: 5/7 ngày')
    expect(r.lines[0]).toContain('80 → 110')
  })

  it('streak = 0 / null không crash, vẫn ra nội dung hợp lý', () => {
    const r = buildChallengeShareContent(null, true)
    expect(r.title).toBe('Tổng kết tuần: 0/7 ngày')
    expect(r.lines.length).toBeGreaterThan(0)
  })

  it('count=0 kèm wpm=0 vẫn không crash, không thêm dòng pace rỗng', () => {
    const r = buildChallengeShareContent({ count: 0, firstWpm: 0, lastWpm: 0 }, false)
    expect(r.title).toBe('Week recap: 0/7 days')
    expect(r.lines.some((l) => l.includes('Pace'))).toBe(false)
  })

  it('dùng tiếng Anh khi isA=false', () => {
    const r = buildChallengeShareContent({ count: 3, firstWpm: 90, lastWpm: 95 }, false)
    expect(r.title).toBe('Week recap: 3/7 days')
    expect(r.lines[0]).toContain('words/min')
  })
})
