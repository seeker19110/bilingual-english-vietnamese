// Test weeklyReport — nội dung báo cáo tuần cho "Người thân theo dõi".
// Phần lớn test ở đây kiểm GIỌNG VĂN, không kiểm số học: đó mới là chỗ tính năng này hỏng được.

import { describe, it, expect } from 'vitest'
import {
  buildWeeklyReport,
  classifyWeek,
  pickQuestion,
  renderWeeklyReportHtml,
  renderWeeklyReportText,
} from './weeklyReport.js'
import type { WeeklyReportData } from '@dhcb/core-contracts/companionLink'

function data(over: Partial<WeeklyReportData> = {}): WeeklyReportData {
  return {
    learnerName: 'Na',
    weekStart: '2026-08-24',
    daysStudied: 4,
    weeklyGoalDays: 5,
    streakDays: 9,
    wordsPracticed: 110,
    ...over,
  }
}

// Từ ngữ tuyệt đối không được xuất hiện trong bất kỳ thư nào (luật 3: không trách móc).
const BLAME_WORDS = [
  'bỏ học',
  'bỏ bê',
  'lười',
  'quên học',
  'kém',
  'tệ',
  'thất bại',
  'không chịu',
  'nhắc nhở con',
  'ép',
]

function fullText(d: WeeklyReportData): string {
  const msg = buildWeeklyReport(d)
  return `${msg.subject}\n${renderWeeklyReportText(msg)}`.toLowerCase()
}

describe('classifyWeek', () => {
  it('0 ngày = vắng, 1-2 = thưa, 3-4 = đều, ≥5 = tốt', () => {
    expect(classifyWeek({ daysStudied: 0 })).toBe('absent')
    expect(classifyWeek({ daysStudied: 1 })).toBe('sparse')
    expect(classifyWeek({ daysStudied: 2 })).toBe('sparse')
    expect(classifyWeek({ daysStudied: 3 })).toBe('steady')
    expect(classifyWeek({ daysStudied: 4 })).toBe('steady')
    expect(classifyWeek({ daysStudied: 5 })).toBe('strong')
    expect(classifyWeek({ daysStudied: 7 })).toBe('strong')
  })
})

describe('giọng văn — luật không trách móc', () => {
  it('tuần vắng KHÔNG nêu con số 0 và KHÔNG có từ trách móc', () => {
    const text = fullText(data({ daysStudied: 0, streakDays: 0, wordsPracticed: 0 }))
    for (const w of BLAME_WORDS) expect(text).not.toContain(w)
    expect(text).not.toContain('0 ngày')
    expect(text).toContain('bận')
  })

  it('mọi tình huống đều không có từ trách móc', () => {
    for (const days of [0, 1, 2, 3, 4, 5, 6, 7]) {
      const text = fullText(data({ daysStudied: days }))
      for (const w of BLAME_WORDS) expect(text, `days=${days}, từ="${w}"`).not.toContain(w)
    }
  })

  it('không so sánh với người khác ở bất kỳ tình huống nào', () => {
    for (const days of [0, 3, 7]) {
      const text = fullText(data({ daysStudied: days }))
      for (const w of ['xếp hạng', 'hơn bạn', 'so với các bạn', 'top ', '%  bạn cùng']) {
        expect(text).not.toContain(w)
      }
    }
  })

  it('câu mở luôn nói việc đã làm được TRƯỚC, không nói con số thiếu hụt', () => {
    const msg = buildWeeklyReport(data({ daysStudied: 3, weeklyGoalDays: 7 }))
    expect(msg.opening).not.toContain('chưa đạt')
    expect(msg.opening).not.toContain('thiếu')
  })
})

describe('câu gợi ý để hỏi — luôn có', () => {
  it('mọi tình huống đều có đúng một câu gợi ý, không rỗng', () => {
    for (const days of [0, 1, 4, 7]) {
      const msg = buildWeeklyReport(data({ daysStudied: days }))
      expect(msg.question.trim().length).toBeGreaterThan(10)
    }
  })

  it('có chủ đề tuần thì gợi ý bám chủ đề đó', () => {
    expect(pickQuestion(data({ topicHint: 'đồ ăn' }))).toContain('đồ ăn')
  })

  it('không có chủ đề thì gợi ý theo cấp CEFR', () => {
    expect(pickQuestion(data({ cefrLevel: 'A1' }))).toContain('3 từ')
    expect(pickQuestion(data({ cefrLevel: 'B2' }))).not.toBe(
      pickQuestion(data({ cefrLevel: 'A1' })),
    )
  })

  it('không có cả chủ đề lẫn cấp thì vẫn có câu chung, không rơi vào rỗng', () => {
    expect(pickQuestion(data())).toContain('thú vị nhất')
  })
})

describe('dòng số liệu', () => {
  it('streak 0 KHÔNG được nhắc — nhắc "streak 0" là nhắc về thất bại', () => {
    const msg = buildWeeklyReport(data({ streakDays: 0 }))
    expect(msg.facts.some((f) => f.includes('chuỗi'))).toBe(false)
  })

  it('0 lượt từ vựng thì bỏ dòng đó, không in "0 lượt"', () => {
    const msg = buildWeeklyReport(data({ wordsPracticed: 0 }))
    expect(msg.facts.join(' ')).not.toContain('0 lượt')
  })

  it('tuần vắng thì không có dòng "đã học 0/5 ngày"', () => {
    const msg = buildWeeklyReport(data({ daysStudied: 0, streakDays: 0, wordsPracticed: 0 }))
    expect(msg.facts).toEqual([])
  })

  it('chỉ in % cấp CEFR khi có ĐỦ cả cấp lẫn phần trăm', () => {
    expect(buildWeeklyReport(data({ cefrLevel: 'B1' })).facts.join(' ')).not.toContain('%')
    expect(buildWeeklyReport(data({ cefrLevel: 'B1', cefrPercent: 42 })).facts.join(' ')).toContain(
      '42%',
    )
  })
})

describe('render', () => {
  it('bản chữ có đủ mở — số liệu — gợi ý — khép', () => {
    const msg = buildWeeklyReport(data())
    const text = renderWeeklyReportText(msg)
    expect(text).toContain(msg.opening)
    expect(text).toContain(msg.question)
    expect(text).toContain(msg.closing)
    expect(text).toContain('•')
  })

  it('bản chữ không có dấu "•" mồ côi khi không có dòng số liệu nào', () => {
    const msg = buildWeeklyReport(data({ daysStudied: 0, streakDays: 0, wordsPracticed: 0 }))
    expect(renderWeeklyReportText(msg)).not.toContain('•')
  })

  it('HTML escape tên người học — tên là dữ liệu người dùng tự đặt', () => {
    const msg = buildWeeklyReport(data({ learnerName: '<script>alert(1)</script>' }))
    const html = renderWeeklyReportHtml(msg)
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('HTML escape cả chủ đề tuần (đi vào câu gợi ý)', () => {
    const msg = buildWeeklyReport(data({ topicHint: '"><img src=x onerror=1>' }))
    const html = renderWeeklyReportHtml(msg)
    expect(html).not.toContain('<img src=x')
  })

  it('thư luôn nói rõ người học có thể ngừng chia sẻ bất cứ lúc nào', () => {
    const msg = buildWeeklyReport(data())
    expect(renderWeeklyReportText(msg)).toContain('ngừng chia sẻ bất cứ lúc nào')
    expect(renderWeeklyReportHtml(msg)).toContain('ngừng')
  })
})
