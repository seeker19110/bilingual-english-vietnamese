import { describe, it, expect, beforeEach, vi } from 'vitest'

import {
  getActivity7Days,
  getWeekTotal,
  getActivityCalendar,
  getWritingProgress,
  getCefrProgress,
} from './stats'
import { vnDateStr } from './date'
import { saveWritingSub } from './storage'
import type { WritingSubmission } from '../types'
import type { CefrLevel } from '../data/cefr'
import type { Circle } from '../data/curriculum'

const today = vnDateStr
const usageKey = (uid: string, date: string) => `et_usage_${uid}_${date}`

describe('stats — hoạt động theo ngày', () => {
  beforeEach(() => localStorage.clear())

  it('mảng 7 ngày, ngày cuối là hôm nay', () => {
    const days = getActivity7Days('u1')
    expect(days).toHaveLength(7)
    expect(days[6].date).toBe(today())
  })

  // BUG-5: ngày CHỈ học từ vựng (learnCount > 0) phải tính là "có hoạt động" để
  // khớp với getStreak() — nếu không, biểu đồ Dashboard hiện trống dù streak vẫn cộng.
  it('ngày chỉ học từ vựng vẫn được tính là có hoạt động', () => {
    localStorage.setItem(
      usageKey('u1', today()),
      JSON.stringify({
        date: today(),
        chatCount: 0,
        writingCount: 0,
        speakingCount: 0,
        sttCount: 0,
        learnCount: 3,
      }),
    )
    const days = getActivity7Days('u1')
    expect(days[6].count).toBe(3)
    expect(days[6].active).toBe(true)
    expect(getWeekTotal('u1')).toBe(3)
  })

  it('ngày không có hoạt động → count 0, active false', () => {
    const days = getActivity7Days('u1')
    expect(days[6].count).toBe(0)
    expect(days[6].active).toBe(false)
  })

  // readUsage() bắt lỗi khi JSON trong localStorage hỏng — không được crash.
  it('dữ liệu usage JSON hỏng → coi như không có hoạt động (không crash)', () => {
    localStorage.setItem(usageKey('u1', today()), '{bad json')
    const days = getActivity7Days('u1')
    expect(days[6].count).toBe(0)
    expect(days[6].active).toBe(false)
  })
})

describe('stats — getActivityCalendar (heatmap)', () => {
  beforeEach(() => localStorage.clear())

  it('trả về đủ totalDays ngày, ngày cuối là hôm nay, tính đúng activeDays/bestDay', () => {
    localStorage.setItem(
      usageKey('u1', today()),
      JSON.stringify({
        date: today(),
        chatCount: 5,
        writingCount: 0,
        speakingCount: 0,
        sttCount: 0,
        learnCount: 0,
      }),
    )
    const cal = getActivityCalendar('u1', 10)
    expect(cal.days).toHaveLength(10)
    expect(cal.days[9].date).toBe(today())
    expect(cal.activeDays).toBe(1)
    expect(cal.bestDay).toBe(5)
    expect(cal.firstColumn).toBeGreaterThanOrEqual(0)
    expect(cal.firstColumn).toBeLessThanOrEqual(6)
  })

  it('mặc định totalDays = 35, không hoạt động nào → bestDay = 0', () => {
    const cal = getActivityCalendar('u1')
    expect(cal.days).toHaveLength(35)
    expect(cal.activeDays).toBe(0)
    expect(cal.bestDay).toBe(0)
  })
})

describe('stats — getWritingProgress (điểm IELTS ước lượng theo thời gian)', () => {
  beforeEach(() => localStorage.clear())

  const makeSub = (id: string, overall: number, submittedAt: number): WritingSubmission => ({
    id,
    userId: 'u1',
    prompt: 'Test prompt',
    text: 'Test text',
    submittedAt,
    feedback: JSON.stringify({
      scores: {
        task_response: overall,
        coherence: overall,
        lexical: overall,
        grammar: overall,
        overall,
      },
    }),
  })

  it('chưa có bài viết nào → giá trị rỗng mặc định', () => {
    const p = getWritingProgress('u1')
    expect(p).toEqual({
      history: [],
      count: 0,
      latest: null,
      best: null,
      avg: null,
      components: null,
    })
  })

  it('có nhiều bài đã chấm → sắp theo thời gian tăng dần, tính avg/best/latest đúng', () => {
    saveWritingSub(makeSub('s1', 6, 1000))
    saveWritingSub(makeSub('s2', 8, 3000))
    saveWritingSub(makeSub('s3', 7, 2000))
    const p = getWritingProgress('u1')
    expect(p.count).toBe(3)
    expect(p.history.map((h) => h.overall)).toEqual([6, 7, 8]) // cũ → mới
    expect(p.latest).toBe(8) // bài mới nhất (submittedAt=3000)
    expect(p.best).toBe(8)
    expect(p.avg).toBe(7) // (6+7+8)/3 = 7
    expect(p.components).toEqual({ task_response: 7, coherence: 7, lexical: 7, grammar: 7 })
  })

  it('bài chưa có feedback (chưa chấm) → bị loại khỏi kết quả', () => {
    saveWritingSub({
      id: 's1',
      userId: 'u1',
      prompt: 'p',
      text: 't',
      submittedAt: 1000,
      feedback: undefined,
    } as WritingSubmission)
    const p = getWritingProgress('u1')
    expect(p.count).toBe(0)
  })

  it('feedback là JSON hỏng → bị loại khỏi kết quả, không crash', () => {
    saveWritingSub({
      id: 's1',
      userId: 'u1',
      prompt: 'p',
      text: 't',
      submittedAt: 1000,
      feedback: '{bad json',
    } as WritingSubmission)
    const p = getWritingProgress('u1')
    expect(p.count).toBe(0)
  })
})

describe('stats — getCefrProgress (% hoàn thành theo cấp CEFR)', () => {
  const word = (w: string) => ({ word: w, pos: 'n', vi: 'x', ex_en: 'x', ex_vi: 'x' })
  const circle: Circle = {
    id: 'c1',
    titleVi: 'Vòng 1',
    titleEn: 'Circle 1',
    emoji: '🔤',
    words: [word('cat'), word('dog'), word('Bird')],
    sentences: [],
  } as unknown as Circle
  const level: CefrLevel = {
    id: 'A1',
    titleVi: 'Cấp A1',
    titleEn: 'Level A1',
    subtitleVi: '',
    goalVi: '',
    accent: 'emerald',
    canDo: [],
    units: [
      {
        id: 'u1',
        titleVi: '',
        titleEn: '',
        emoji: '',
        grammar: [{ id: 'g1' } as unknown, { id: 'g2' } as unknown] as never,
        vocabCircleIds: ['c1', 'missing-id'], // 'missing-id' phải bị bỏ qua an toàn
      },
    ],
  } as unknown as CefrLevel

  it('tính đúng doneWords/pct từ tập từ đã thuộc, bỏ qua circleId không tồn tại', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('cefr.json')) return Promise.resolve({ json: async () => [level] })
        return Promise.resolve({ json: async () => [circle] })
      }),
    )
    const learned = new Set(['cat', 'bird']) // 'bird' khớp không phân biệt hoa/thường với 'Bird'
    const result = await getCefrProgress(learned)
    const a1 = result.find((r) => r.id === 'A1')!
    expect(a1.totalWords).toBe(3)
    expect(a1.doneWords).toBe(2)
    expect(a1.pct).toBe(67) // round(2/3*100)
    expect(a1.grammarCount).toBe(2)
    vi.unstubAllGlobals()
  })
})
