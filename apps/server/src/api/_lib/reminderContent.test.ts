import { describe, it, expect } from 'vitest'
import {
  pickReminderMessage,
  computeStreakAtRisk,
  computeWeeklyDaysDone,
  type ReminderContext,
} from './reminderContent'

const baseCtx: ReminderContext = {
  streakDaysAtRisk: 0,
  srsDue: 0,
  weeklyGoal: 5,
  weeklyDaysDone: 0,
  challengeActive: false,
}

describe('pickReminderMessage — mức độ ưu tiên', () => {
  it('streak sắp mất → ưu tiên CAO NHẤT, thắng cả SRS/tuần/challenge', () => {
    const msg = pickReminderMessage({
      ...baseCtx,
      streakDaysAtRisk: 7,
      srsDue: 10,
      weeklyDaysDone: 4,
      challengeActive: true,
    })
    expect(msg.title).toContain('mất chuỗi')
    expect(msg.body).toContain('7')
  })

  it('không có streak nhưng có SRS đến hạn → ưu tiên SRS', () => {
    const msg = pickReminderMessage({ ...baseCtx, srsDue: 12, challengeActive: true })
    expect(msg.title).toContain('ôn')
    expect(msg.body).toContain('12')
  })

  it('không streak, không SRS, còn đúng 1 ngày là đạt mục tiêu tuần → nhắc mục tiêu tuần', () => {
    const msg = pickReminderMessage({
      ...baseCtx,
      weeklyGoal: 5,
      weeklyDaysDone: 4,
      challengeActive: true,
    })
    expect(msg.title).toContain('mục tiêu tuần')
    expect(msg.body).toContain('1')
  })

  it('còn ≥2 ngày mới đạt mục tiêu tuần → CHƯA đủ gần, rơi xuống challenge/chung chung', () => {
    const msg = pickReminderMessage({
      ...baseCtx,
      weeklyGoal: 5,
      weeklyDaysDone: 2,
      challengeActive: true,
    })
    expect(msg.title).not.toContain('mục tiêu tuần')
    expect(msg.url).toBe('/challenge')
  })

  it('đã đạt/vượt mục tiêu tuần rồi (weeklyLeft ≤ 0) → không nhắc mục tiêu tuần nữa', () => {
    const msg = pickReminderMessage({ ...baseCtx, weeklyGoal: 5, weeklyDaysDone: 5 })
    expect(msg.title).not.toContain('mục tiêu tuần')
  })

  it('không có gì đặc biệt, có tham gia challenge → nhắc challenge', () => {
    const msg = pickReminderMessage({ ...baseCtx, challengeActive: true })
    expect(msg.url).toBe('/challenge')
  })

  it('không có gì cả → fallback chung chung (giữ nguyên nội dung cũ)', () => {
    const msg = pickReminderMessage(baseCtx)
    expect(msg.url).toBe('/')
    expect(msg.title).toContain('Tới giờ học')
  })
})

describe('computeStreakAtRisk', () => {
  it('có hoạt động liên tục 5 ngày trước hôm nay → streak 5', () => {
    const active = new Set(['2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15'])
    expect(computeStreakAtRisk(active, '2026-07-16')).toBe(5)
  })

  it('lỡ 1 ngày giữa chừng (KHÔNG áp vé nghỉ) → streak dừng ở ngày đứt', () => {
    const active = new Set(['2026-07-13', '2026-07-14']) // thiếu 2026-07-15 (hôm qua)
    expect(computeStreakAtRisk(active, '2026-07-16')).toBe(0)
  })

  it('không có hoạt động gần đây → 0', () => {
    expect(computeStreakAtRisk(new Set(), '2026-07-16')).toBe(0)
  })
})

describe('computeWeeklyDaysDone', () => {
  it('đếm đúng số ngày có hoạt động từ Thứ 2 tuần này tới HÔM QUA (không tính hôm nay)', () => {
    // 2026-07-16 là Thứ 5 → tuần từ Thứ 2 2026-07-13.
    const active = new Set(['2026-07-13', '2026-07-14', '2026-07-16']) // 16 là HÔM NAY — không tính
    expect(computeWeeklyDaysDone(active, '2026-07-16')).toBe(2)
  })

  it('ngày của TUẦN TRƯỚC không tính vào tuần này', () => {
    const active = new Set(['2026-07-12']) // Chủ nhật tuần trước
    expect(computeWeeklyDaysDone(active, '2026-07-16')).toBe(0)
  })

  it('chưa có hoạt động nào trong tuần → 0', () => {
    expect(computeWeeklyDaysDone(new Set(), '2026-07-16')).toBe(0)
  })
})
