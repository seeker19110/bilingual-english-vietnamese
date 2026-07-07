import { describe, it, expect, beforeEach, vi } from 'vitest'

// Chặn import supabase thật (thiếu env trong test) — giống srs.test.ts/vocab.test.ts.
vi.mock('./progressSync', () => ({ pushProgress: vi.fn() }))

import {
  UNLOCK_PCT,
  getDoneGrammar,
  markGrammarDone,
  unmarkGrammarDone,
  isGrammarDone,
  getViewedDialogues,
  markDialogueViewed,
  dialogueKey,
  circleDoneCount,
  unitVocabCounts,
  levelVocabCounts,
  unitGrammarCounts,
  levelGrammarCounts,
  computeLockedMap,
  computeLockedMapPersisted,
  getUnlockedLevels,
  findNextStep,
} from './cefrProgress'
import type { CefrLevel, CefrUnit, GrammarLesson } from '../data/cefr'
import type { Circle } from '../data/curriculum'
import type { DictEntry } from '../types'

// ── Dữ liệu giả nhỏ gọn để test logic thuần ─────────────────────────────
const word = (w: string): DictEntry => ({ word: w, vi: `nghĩa ${w}` }) as DictEntry

const circle = (id: string, words: string[]): Circle => ({
  id,
  titleVi: id,
  titleEn: id,
  emoji: '📚',
  words: words.map(word),
  sentences: [],
})

const lesson = (id: string): GrammarLesson => ({
  id,
  titleVi: id,
  titleEn: id,
  structure: 'S + V',
  explainVi: 'giải thích',
  examples: [],
})

const unit = (id: string, grammarIds: string[], circleIds: string[]): CefrUnit => ({
  id,
  titleVi: id,
  titleEn: id,
  emoji: '🧩',
  grammar: grammarIds.map(lesson),
  vocabCircleIds: circleIds,
})

const level = (id: CefrLevel['id'], units: CefrUnit[]): CefrLevel => ({
  id,
  titleVi: id,
  titleEn: id,
  subtitleVi: '',
  goalVi: '',
  accent: 'emerald',
  canDo: [],
  units,
})

const BY_ID: Record<string, Circle> = {
  c1: circle('c1', ['apple', 'banana']),
  c2: circle('c2', ['cat', 'dog']),
  c3: circle('c3', ['egg', 'fish']),
}

const A1 = level('A1', [unit('u1', ['g1', 'g2'], ['c1']), unit('u2', ['g3'], ['c2'])])
const A2 = level('A2', [unit('u3', ['g4'], ['c3'])])

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

describe('đánh dấu bài ngữ pháp đã học', () => {
  it('mặc định rỗng, mark/unmark hoạt động và tách theo user', () => {
    expect(getDoneGrammar('u1').size).toBe(0)
    markGrammarDone('u1', 'g1')
    expect(isGrammarDone('u1', 'g1')).toBe(true)
    expect(isGrammarDone('u2', 'g1')).toBe(false)
    unmarkGrammarDone('u1', 'g1')
    expect(isGrammarDone('u1', 'g1')).toBe(false)
  })

  it('chịu được dữ liệu hỏng trong localStorage', () => {
    localStorage.setItem('et_cefr_grammar_u1', '{oops')
    expect(getDoneGrammar('u1').size).toBe(0)
  })
})

describe('hội thoại đã xem', () => {
  it('mark rồi đọc lại theo khóa owner:titleEn', () => {
    markDialogueViewed('u1', 'a1-greetings', 'Morning greeting')
    expect(getViewedDialogues('u1').has(dialogueKey('a1-greetings', 'Morning greeting'))).toBe(true)
    expect(getViewedDialogues('u2').size).toBe(0)
  })

  it('xem lại hội thoại đã xem → không đẩy đồng bộ thừa', async () => {
    const { pushProgress } = await import('./progressSync')
    markDialogueViewed('u1', 'a1-greetings', 'Morning greeting')
    markDialogueViewed('u1', 'a1-greetings', 'Morning greeting')
    expect(getViewedDialogues('u1').size).toBe(1)
    expect(vi.mocked(pushProgress)).toHaveBeenCalledTimes(1)
  })
})

describe('đồng bộ Supabase khi đánh dấu', () => {
  it('mark/unmark bài ngữ pháp đều gọi pushProgress', async () => {
    const { pushProgress } = await import('./progressSync')
    markGrammarDone('u1', 'g1')
    unmarkGrammarDone('u1', 'g1')
    expect(vi.mocked(pushProgress)).toHaveBeenCalledTimes(2)
  })
})

describe('đếm tiến độ từ vựng / ngữ pháp', () => {
  it('circleDoneCount so khớp cả nguyên dạng lẫn chữ thường', () => {
    const c = circle('x', ['Apple', 'banana'])
    expect(circleDoneCount(c, new Set(['apple']))).toBe(1)
    expect(circleDoneCount(c, new Set(['Apple', 'banana']))).toBe(2)
  })

  it('unitVocabCounts bỏ qua id vòng không tồn tại', () => {
    const u = unit('u', [], ['c1', 'missing'])
    expect(unitVocabCounts(u, BY_ID, new Set(['apple']))).toEqual({ done: 1, total: 2 })
  })

  it('levelVocabCounts cộng dồn các unit', () => {
    expect(levelVocabCounts(A1, BY_ID, new Set(['apple', 'cat']))).toEqual({ done: 2, total: 4 })
  })

  it('đếm ngữ pháp theo Set bài đã xong', () => {
    const done = new Set(['g1', 'g3'])
    expect(unitGrammarCounts(A1.units[0]!, done)).toEqual({ done: 1, total: 2 })
    expect(levelGrammarCounts(A1, done)).toEqual({ done: 2, total: 3 })
  })
})

// A1 có 3 bài ngữ pháp: g1, g2 (unit u1) + g3 (unit u2).
const A1_ALL_GRAMMAR_DONE = new Set(['g1', 'g2', 'g3'])

describe('computeLockedMap — luật mở khóa ≥70% từ vựng + 100% ngữ pháp cấp trước', () => {
  it('A1 luôn mở; A2 khóa khi A1 chưa đạt ngưỡng nào cả', () => {
    const map = computeLockedMap([A1, A2], BY_ID, new Set(), new Set())
    expect(map.get('A1')).toBe(false)
    expect(map.get('A2')).toBe(true)
  })

  it('A2 mở khi từ vựng A1 đạt ≥ UNLOCK_PCT VÀ ngữ pháp A1 xong 100%', () => {
    // A1 có 4 từ → cần ceil(4 × 0.7) = 3 từ để đạt 75% ≥ 70%
    const learned = new Set(['apple', 'banana', 'cat'])
    const map = computeLockedMap([A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)
    expect(3 / 4).toBeGreaterThanOrEqual(UNLOCK_PCT)
    expect(map.get('A2')).toBe(false)
  })

  it('A2 VẪN khóa nếu từ vựng A1 đủ 70% nhưng ngữ pháp A1 chưa xong hết', () => {
    const learned = new Set(['apple', 'banana', 'cat'])
    const map = computeLockedMap([A1, A2], BY_ID, learned, new Set(['g1', 'g2'])) // thiếu g3
    expect(map.get('A2')).toBe(true)
  })

  it('A2 VẪN khóa nếu ngữ pháp A1 xong hết nhưng từ vựng A1 chưa đủ 70%', () => {
    const learned = new Set(['apple']) // 1/4 = 25% < 70%
    const map = computeLockedMap([A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)
    expect(map.get('A2')).toBe(true)
  })
})

describe('computeLockedMapPersisted — grandfather: đã mở thì không khóa lại', () => {
  it('mở khóa A2 và ghi nhớ lại khi đạt ngưỡng lần đầu', () => {
    const learned = new Set(['apple', 'banana', 'cat'])
    const map = computeLockedMapPersisted('u1', [A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)
    expect(map.get('A2')).toBe(false)
    expect(getUnlockedLevels('u1').has('A2')).toBe(true)
  })

  it('KHÔNG khóa lại A2 dù tổng từ vựng A1 tăng lên sau này (thêm từ mới)', () => {
    // Lần 1: học đủ để mở khóa A2 với A1 nhỏ (4 từ)
    const learned = new Set(['apple', 'banana', 'cat'])
    computeLockedMapPersisted('u1', [A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)

    // Lần 2: A1 được thêm nhiều từ mới (giả lập tăng từ vựng) → % tụt dưới 70%
    const biggerA1: CefrLevel = {
      ...A1,
      units: [unit('u1', [], ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9', 'c10'])],
    }
    const biggerById = {
      ...BY_ID,
      c5: circle('c5', ['x1', 'x2']),
      c6: circle('c6', ['x3', 'x4']),
      c7: circle('c7', ['x5', 'x6']),
      c8: circle('c8', ['x7', 'x8']),
      c9: circle('c9', ['x9', 'x10']),
      c10: circle('c10', ['x11', 'x12']),
    }
    const liveMap = computeLockedMap([biggerA1, A2], biggerById, learned, new Set())
    expect(liveMap.get('A2')).toBe(true) // % tụt dưới ngưỡng nếu tính sống

    const persistedMap = computeLockedMapPersisted(
      'u1',
      [biggerA1, A2],
      biggerById,
      learned,
      new Set(),
    )
    expect(persistedMap.get('A2')).toBe(false) // vẫn mở nhờ grandfather
  })

  it('không ghi/đồng bộ thừa khi trạng thái không đổi giữa 2 lần gọi', () => {
    const learned = new Set(['apple', 'banana', 'cat'])
    computeLockedMapPersisted('u1', [A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)
    const afterFirst = [...JSON.parse(localStorage.getItem('et_cefr_unlocked_u1') ?? '[]')].sort()

    const map = computeLockedMapPersisted('u1', [A1, A2], BY_ID, learned, A1_ALL_GRAMMAR_DONE)
    const afterSecond = [...JSON.parse(localStorage.getItem('et_cefr_unlocked_u1') ?? '[]')].sort()

    expect(map.get('A2')).toBe(false)
    expect(afterSecond).toEqual(afterFirst) // lần gọi thứ 2 không đổi trạng thái đã lưu
  })
})

describe('findNextStep — xen kẽ từ vựng ↔ ngữ pháp trong 1 unit, theo unit', () => {
  it('chưa học gì → vòng từ vựng đầu tiên của unit 1', () => {
    const step = findNextStep(A1, BY_ID, new Set(), new Set())
    expect(step).toMatchObject({ unitIndex: 0, kind: 'vocab', circleId: 'c1' })
  })

  it('xong vòng từ vựng đầu (chỉ 1 vòng trong unit) → sang ngữ pháp bài 1', () => {
    const step = findNextStep(A1, BY_ID, new Set(['apple', 'banana']), new Set())
    expect(step).toMatchObject({ unitIndex: 0, kind: 'grammar', lessonId: 'g1' })
  })

  it('xong cả unit 1 → sang unit 2', () => {
    const learned = new Set(['apple', 'banana'])
    const done = new Set(['g1', 'g2'])
    const step = findNextStep(A1, BY_ID, learned, done)
    expect(step).toMatchObject({ unitIndex: 1, kind: 'vocab', circleId: 'c2' })
  })

  it('hoàn thành hết → null', () => {
    const learned = new Set(['apple', 'banana', 'cat', 'dog'])
    const done = new Set(['g1', 'g2', 'g3'])
    expect(findNextStep(A1, BY_ID, learned, done)).toBeNull()
  })

  it('unit có NHIỀU vòng từ vựng: xen kẽ vòng 1 → bài 1 → vòng 2 → bài 2 (không bắt xong hết từ vựng mới tới ngữ pháp)', () => {
    const byId: Record<string, Circle> = {
      cA: circle('cA', ['apple']),
      cB: circle('cB', ['banana']),
    }
    const multi = level('A1', [unit('u1', ['g1', 'g2'], ['cA', 'cB'])])

    // Chưa học gì → vòng cA trước (thứ tự j=0)
    expect(findNextStep(multi, byId, new Set(), new Set())).toMatchObject({
      kind: 'vocab',
      circleId: 'cA',
    })

    // Xong vòng cA → sang bài g1 (KHÔNG nhảy thẳng qua vòng cB — đúng interleaving)
    expect(findNextStep(multi, byId, new Set(['apple']), new Set())).toMatchObject({
      kind: 'grammar',
      lessonId: 'g1',
    })

    // Xong cA + g1 → tới vòng cB (thứ tự j=1)
    expect(findNextStep(multi, byId, new Set(['apple']), new Set(['g1']))).toMatchObject({
      kind: 'vocab',
      circleId: 'cB',
    })

    // Xong cA + cB + g1 → tới bài g2
    expect(findNextStep(multi, byId, new Set(['apple', 'banana']), new Set(['g1']))).toMatchObject({
      kind: 'grammar',
      lessonId: 'g2',
    })
  })
})
