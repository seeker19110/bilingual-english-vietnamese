import { describe, it, expect, beforeEach, vi } from 'vitest'

// Chặn import supabase thật (thiếu env trong test) — giống cefrProgress.test.ts.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import {
  EXAM_PASS_PCT,
  scoreExam,
  saveExamAttempt,
  getExamResult,
  isExamPassed,
  getPassedExamLevels,
  buildExam,
  type GrammarExamSource,
} from './cefrExam'
import type { DictEntry } from '../types'
import type { Dialogue } from '../data/dialogues'

const word = (w: string): DictEntry =>
  ({ word: w, vi: `nghĩa ${w}`, ex_en: `${w} example`, ex_vi: `ví dụ ${w}` }) as DictEntry

const dialogue = (id: number): Dialogue => ({
  titleVi: `hội thoại ${id}`,
  titleEn: `dialogue ${id}`,
  lines: [
    { who: 'A', en: `A-en ${id}`, vi: `A-vi ${id}` },
    { who: 'B', en: `B-en ${id}`, vi: `B-vi ${id}` },
    { who: 'A', en: `A2-en ${id}`, vi: `A2-vi ${id}` },
  ],
})

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('scoreExam — ngưỡng đạt ≥70% (theo % làm tròn)', () => {
  it('17/24 = 71% → đạt; 16/24 = 67% → trượt', () => {
    expect(scoreExam(17, 24)).toMatchObject({ pct: 71, passed: true })
    expect(scoreExam(16, 24)).toMatchObject({ pct: 67, passed: false })
  })

  it('đúng 70% tròn → đạt (≥, không phải >)', () => {
    expect(scoreExam(7, 10)).toMatchObject({ pct: 70, passed: true })
    expect(scoreExam(6, 10).passed).toBe(false)
  })

  it('tổng 0 câu → 0%, không đạt', () => {
    expect(scoreExam(0, 0)).toMatchObject({ pct: 0, passed: false })
  })

  it('ngưỡng khớp hằng số EXAM_PASS_PCT', () => {
    expect(Math.round(EXAM_PASS_PCT * 100)).toBe(70)
  })
})

describe('saveExamAttempt — dữ liệu chỉ tốt lên (best/passed/attempts)', () => {
  it('lưu điểm cao nhất, passed = OR, tăng attempts, đồng bộ', async () => {
    const { pushProgress } = await import('./progressSync')

    saveExamAttempt('u1', 'A1', 60) // trượt
    expect(getExamResult('u1', 'A1')).toMatchObject({ passed: false, bestPct: 60, attempts: 1 })
    expect(isExamPassed('u1', 'A1')).toBe(false)

    saveExamAttempt('u1', 'A1', 80) // đạt
    expect(getExamResult('u1', 'A1')).toMatchObject({ passed: true, bestPct: 80, attempts: 2 })
    expect(isExamPassed('u1', 'A1')).toBe(true)

    saveExamAttempt('u1', 'A1', 50) // điểm thấp hơn không làm mất "đã qua"/điểm cao
    expect(getExamResult('u1', 'A1')).toMatchObject({ passed: true, bestPct: 80, attempts: 3 })

    expect(vi.mocked(pushProgress)).toHaveBeenCalledTimes(3)
  })

  it('getPassedExamLevels chỉ gồm cấp đã đạt', () => {
    saveExamAttempt('u1', 'A1', 90)
    saveExamAttempt('u1', 'A2', 40)
    const passed = getPassedExamLevels('u1')
    expect(passed.has('A1')).toBe(true)
    expect(passed.has('A2')).toBe(false)
  })

  it('tách theo user', () => {
    saveExamAttempt('u1', 'A1', 90)
    expect(isExamPassed('u2', 'A1')).toBe(false)
  })
})

describe('buildExam — dựng đề 4 phần từ kho của cấp', () => {
  const words = Array.from({ length: 12 }, (_, i) => word(`w${i}`))
  const grammar: GrammarExamSource[] = Array.from({ length: 12 }, (_, i) => ({
    lessonId: `g${i}`,
    item: { q: `Điền ___ số ${i}`, options: [`a${i}`, `b${i}`, `c${i}`, `d${i}`], answer: 1 },
  }))
  const dialogues = Array.from({ length: 6 }, (_, i) => dialogue(i))
  const learned = new Set(words.map((w) => w.word))

  it('đủ 4 phần đúng số câu (8+8+4+4 = 24) khi kho đủ lớn', () => {
    const qs = buildExam({ isA: true, words, learned, grammar, dialogues })
    const count = (p: string) => qs.filter((q) => q.part === p).length
    expect(count('vocab')).toBe(8)
    expect(count('grammar')).toBe(8)
    expect(count('listening')).toBe(4)
    expect(count('reading')).toBe(4)
    expect(qs.length).toBe(24)
  })

  it('mọi câu có đáp án đúng nằm trong options', () => {
    const qs = buildExam({ isA: true, words, learned, grammar, dialogues })
    for (const q of qs) {
      expect(q.options).toContain(q.correct)
      expect(q.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('câu ngữ pháp mang lessonId để "mở lại bài"', () => {
    const qs = buildExam({ isA: true, words, learned, grammar, dialogues })
    for (const q of qs.filter((x) => x.part === 'grammar')) {
      expect(q.lessonId).toBeTruthy()
    }
  })

  it('câu Nghe có promptKind audio + audioText (ẩn chữ)', () => {
    const qs = buildExam({ isA: true, words, learned, grammar, dialogues })
    for (const q of qs.filter((x) => x.part === 'listening')) {
      expect(q.promptKind).toBe('audio')
      expect(q.audioText).toBeTruthy()
      expect(q.prompt).toBe('')
    }
  })

  it('câu Đọc có passage (hội thoại) để đọc hiểu', () => {
    const qs = buildExam({ isA: true, words, learned, grammar, dialogues })
    for (const q of qs.filter((x) => x.part === 'reading')) {
      expect(q.passage?.lines.length).toBeGreaterThanOrEqual(3)
      expect(q.prompt).toBeTruthy()
    }
  })

  it('chiều B (học tiếng Việt): Nghe phát tiếng Việt, chọn từ tiếng Anh', () => {
    const qs = buildExam({ isA: false, words, learned, grammar, dialogues })
    const listen = qs.find((q) => q.part === 'listening')
    expect(listen?.audioLang).toBe('vi-VN')
  })
})
