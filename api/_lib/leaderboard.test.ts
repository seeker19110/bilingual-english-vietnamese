import { describe, it, expect } from 'vitest'
import {
  currentWeekRange,
  pointsFromUsageRow,
  pointsFromUsageRows,
  pointsFromChallengeCount,
  computeWeeklyPoints,
  rankEntries,
  validateNickname,
  containsProfanity,
  LEAGUE_POINTS,
  type WeeklyUsageRow,
  type LeagueEntry,
} from './leaderboard'

describe('currentWeekRange', () => {
  it('trả về Thứ 2 → Chủ nhật chứa ngày truyền vào', () => {
    // 2026-07-16 là Thứ 5
    expect(currentWeekRange('2026-07-16')).toEqual({ start: '2026-07-13', end: '2026-07-19' })
  })

  it('đúng ca biên: ngày là Thứ 2 → tuần bắt đầu ngay hôm đó', () => {
    expect(currentWeekRange('2026-07-13')).toEqual({ start: '2026-07-13', end: '2026-07-19' })
  })

  it('đúng ca biên: ngày là Chủ nhật → tuần vẫn của tuần đó (không nhảy sang tuần sau)', () => {
    expect(currentWeekRange('2026-07-19')).toEqual({ start: '2026-07-13', end: '2026-07-19' })
  })
})

describe('pointsFromUsageRow / pointsFromUsageRows', () => {
  it('1 điểm/learn_count + 5 điểm/phiên chat+viết+nói', () => {
    const row: WeeklyUsageRow = {
      learn_count: 10,
      chat_count: 2,
      writing_count: 1,
      speaking_count: 1,
    }
    // 10*1 + (2+1+1)*5 = 10 + 20 = 30
    expect(pointsFromUsageRow(row)).toBe(30)
  })

  it('cột null (chưa có dữ liệu ngày đó) tính như 0, không NaN/lỗi', () => {
    const row: WeeklyUsageRow = {
      learn_count: null,
      chat_count: null,
      writing_count: null,
      speaking_count: null,
    }
    expect(pointsFromUsageRow(row)).toBe(0)
  })

  it('cộng dồn nhiều ngày trong tuần', () => {
    const rows: WeeklyUsageRow[] = [
      { learn_count: 5, chat_count: 1, writing_count: 0, speaking_count: 0 },
      { learn_count: 3, chat_count: 0, writing_count: 1, speaking_count: 0 },
    ]
    // ngày 1: 5 + 5 = 10; ngày 2: 3 + 5 = 8 → tổng 18
    expect(pointsFromUsageRows(rows)).toBe(18)
  })

  it('mảng rỗng (chưa học ngày nào trong tuần) → 0 điểm', () => {
    expect(pointsFromUsageRows([])).toBe(0)
  })
})

describe('pointsFromChallengeCount / computeWeeklyPoints', () => {
  it('15 điểm mỗi challenge đã nộp', () => {
    expect(pointsFromChallengeCount(3)).toBe(45)
    expect(pointsFromChallengeCount(0)).toBe(0)
  })

  it('computeWeeklyPoints gộp usage + challenge', () => {
    const rows: WeeklyUsageRow[] = [
      { learn_count: 2, chat_count: 1, writing_count: 0, speaking_count: 0 },
    ]
    // usage: 2 + 5 = 7; challenge: 2*15 = 30 → tổng 37
    expect(computeWeeklyPoints(rows, 2)).toBe(37)
  })

  it('hằng số điểm khớp đặc tả (1/5/15)', () => {
    expect(LEAGUE_POINTS).toEqual({ learnOrReview: 1, session: 5, challenge: 15 })
  })
})

describe('rankEntries', () => {
  it('sắp giảm dần theo điểm, hạng 1 là điểm cao nhất', () => {
    const entries: LeagueEntry[] = [
      { userId: 'a', nickname: 'A', points: 10 },
      { userId: 'b', nickname: 'B', points: 30 },
      { userId: 'c', nickname: 'C', points: 20 },
    ]
    const ranked = rankEntries(entries)
    expect(ranked.map((e) => e.userId)).toEqual(['b', 'c', 'a'])
    expect(ranked.map((e) => e.rank)).toEqual([1, 2, 3])
  })

  it('đồng điểm nhận CÙNG hạng (dense rank), người sau nhảy đúng số hạng đã dùng', () => {
    const entries: LeagueEntry[] = [
      { userId: 'a', nickname: 'A', points: 20 },
      { userId: 'b', nickname: 'B', points: 20 },
      { userId: 'c', nickname: 'C', points: 10 },
    ]
    const ranked = rankEntries(entries)
    const byId = Object.fromEntries(ranked.map((e) => [e.userId, e.rank]))
    expect(byId.a).toBe(1)
    expect(byId.b).toBe(1)
    expect(byId.c).toBe(2)
  })

  it('mảng rỗng → trả mảng rỗng', () => {
    expect(rankEntries([])).toEqual([])
  })
})

describe('validateNickname', () => {
  it('chấp nhận biệt danh hợp lệ, trim khoảng trắng thừa', () => {
    const result = validateNickname('  Minh   Anh  ')
    expect(result).toEqual({ ok: true, nickname: 'Minh Anh' })
  })

  it('cho phép tiếng Việt có dấu', () => {
    expect(validateNickname('Bé Sữa 2010')).toEqual({ ok: true, nickname: 'Bé Sữa 2010' })
  })

  it('từ chối ngắn hơn 3 ký tự', () => {
    const result = validateNickname('AB')
    expect(result.ok).toBe(false)
  })

  it('từ chối dài hơn 20 ký tự', () => {
    const result = validateNickname('a'.repeat(21))
    expect(result.ok).toBe(false)
  })

  it('đúng ca biên: đúng 3 và đúng 20 ký tự đều hợp lệ', () => {
    expect(validateNickname('abc').ok).toBe(true)
    expect(validateNickname('a'.repeat(20)).ok).toBe(true)
  })

  it('từ chối ký tự đặc biệt (emoji, dấu câu)', () => {
    expect(validateNickname('nick@name').ok).toBe(false)
    expect(validateNickname('nick🔥name').ok).toBe(false)
  })

  it('từ chối biệt danh chứa từ bậy', () => {
    expect(validateNickname('thang ngu si').ok).toBe(false)
    expect(validateNickname('fuck you now').ok).toBe(false)
  })
})

describe('containsProfanity — không dương tính giả với từ vô hại chứa chuỗi con', () => {
  it('"Adam" không bị chặn dù chứa chuỗi con "dm"', () => {
    expect(containsProfanity('Adam')).toBe(false)
  })

  it('"Vladimir" không bị chặn dù chứa chuỗi con "vl"', () => {
    expect(containsProfanity('Vladimir')).toBe(false)
  })

  it('"vl" đứng riêng 1 từ thì bị chặn', () => {
    expect(containsProfanity('vl 123')).toBe(true)
  })

  it('phát hiện được khi gõ không dấu', () => {
    expect(containsProfanity('thang ngu')).toBe(true)
  })
})
