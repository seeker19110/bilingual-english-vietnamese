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
  isExamEligible,
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

describe('isExamEligible — điều kiện DỰ THI: ≥70% từ vựng + 100% ngữ pháp', () => {
  it('đủ điều kiện khi ≥70% từ vựng VÀ ngữ pháp xong hết', () => {
    // A1 có 4 từ → 3/4 = 75% ≥ 70%
    const learned = new Set(['apple', 'banana', 'cat'])
    expect(3 / 4).toBeGreaterThanOrEqual(UNLOCK_PCT)
    expect(isExamEligible(A1, BY_ID, learned, A1_ALL_GRAMMAR_DONE)).toBe(true)
  })

  it('CHƯA đủ nếu từ vựng < 70% (dù ngữ pháp xong hết)', () => {
    const learned = new Set(['apple']) // 1/4 = 25%
    expect(isExamEligible(A1, BY_ID, learned, A1_ALL_GRAMMAR_DONE)).toBe(false)
  })

  it('CHƯA đủ nếu ngữ pháp chưa xong hết (dù từ vựng đủ)', () => {
    const learned = new Set(['apple', 'banana', 'cat'])
    expect(isExamEligible(A1, BY_ID, learned, new Set(['g1', 'g2']))).toBe(false) // thiếu g3
  })
})

describe('computeLockedMap — mở khóa cấp sau khi THI ĐẠT cấp trước', () => {
  it('A1 luôn mở; A2 khóa khi chưa thi đạt A1', () => {
    const map = computeLockedMap([A1, A2], new Set())
    expect(map.get('A1')).toBe(false)
    expect(map.get('A2')).toBe(true)
  })

  it('A2 mở khi A1 đã thi đạt', () => {
    const map = computeLockedMap([A1, A2], new Set(['A1']))
    expect(map.get('A2')).toBe(false)
  })
})

describe('computeLockedMapPersisted — grandfather: đã mở thì không khóa lại', () => {
  it('mở khóa A2 và ghi nhớ lại khi vừa thi đạt A1', () => {
    const map = computeLockedMapPersisted('u1', [A1, A2], new Set(['A1']))
    expect(map.get('A2')).toBe(false)
    expect(getUnlockedLevels('u1').has('A2')).toBe(true)
  })

  it('KHÔNG khóa lại A2 dù sau này không còn trong tập thi đạt (grandfather)', () => {
    // Lần 1: A1 thi đạt → A2 mở + ghi nhớ
    computeLockedMapPersisted('u1', [A1, A2], new Set(['A1']))
    expect(computeLockedMap([A1, A2], new Set()).get('A2')).toBe(true) // tính sống: khóa

    // Lần 2: dù examPassed rỗng (vd dữ liệu chưa đồng bộ) → vẫn mở nhờ grandfather
    const persistedMap = computeLockedMapPersisted('u1', [A1, A2], new Set())
    expect(persistedMap.get('A2')).toBe(false)
  })

  it('người dùng cũ đã ở trong et_cefr_unlocked KHÔNG bị khóa lại dù chưa thi', () => {
    // Giả lập người dùng đã mở khóa A2 theo luật CŨ (ghi sẵn vào localStorage).
    localStorage.setItem('et_cefr_unlocked_u1', JSON.stringify(['A1', 'A2']))
    const map = computeLockedMapPersisted('u1', [A1, A2], new Set()) // chưa thi đạt gì
    expect(map.get('A2')).toBe(false) // vẫn mở — chống hồi tố
  })

  it('không ghi/đồng bộ thừa khi trạng thái không đổi giữa 2 lần gọi', () => {
    computeLockedMapPersisted('u1', [A1, A2], new Set(['A1']))
    const afterFirst = [...JSON.parse(localStorage.getItem('et_cefr_unlocked_u1') ?? '[]')].sort()

    const map = computeLockedMapPersisted('u1', [A1, A2], new Set(['A1']))
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
