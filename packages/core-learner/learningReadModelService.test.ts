// packages/core-learner/learningReadModelService.test.ts — Unit tests for Learning Domain Read Model Service.
import { describe, expect, it, vi } from 'vitest'
import type { Pool } from 'pg'
import {
  getLearningReadModel,
  formatLearningReadModelForContext,
} from './learningReadModelService.js'

const PERSON_ID = '11111111-1111-4111-8111-111111111111'
const USER_ID = 'user-1'

describe('getLearningReadModel', () => {
  it('builds LearningReadModel accurately from profiles & learning_progress', async () => {
    const mockQuery = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ onboarded: true, goal: 'Luyện thi IELTS', daily_minutes: 20 }],
      })
      .mockResolvedValueOnce({
        rows: [
          {
            settings: { direction: 'A', dailySpeed: 20 },
            placement: { cefr: 'B2' },
            stats: { masteredCount: 300, inProgressCount: 50, dueForReviewCount: 15 },
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      })

    const pool = { query: mockQuery } as unknown as Pool

    const model = await getLearningReadModel(pool, {
      personId: PERSON_ID,
      userId: USER_ID,
      subject: 'english',
    })

    expect(model.personId).toBe(PERSON_ID)
    expect(model.subject).toBe('english')
    expect(model.direction).toBe('A')
    expect(model.currentLevel).toBe('B2')
    expect(model.dailySpeed).toBe(20)
    expect(model.dailyMinutes).toBe(20)
    expect(model.activeGoal).toBe('Luyện thi IELTS')
    expect(model.masterySummary.masteredCount).toBe(300)
    expect(model.srsDueCount).toBe(15)
  })

  it('handles missing progress rows gracefully with sensible defaults', async () => {
    const mockQuery = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const pool = { query: mockQuery } as unknown as Pool

    const model = await getLearningReadModel(pool, {
      personId: PERSON_ID,
      userId: USER_ID,
    })

    expect(model.direction).toBe('A')
    expect(model.currentLevel).toBeNull()
    expect(model.dailySpeed).toBe(10)
    expect(model.onboarded).toBe(false)
  })
})

describe('formatLearningReadModelForContext', () => {
  it('formats context string clearly for Context Engine', () => {
    const text = formatLearningReadModelForContext({
      personId: PERSON_ID,
      subject: 'english',
      direction: 'A',
      currentLevel: 'B1',
      dailySpeed: 10,
      dailyMinutes: 15,
      onboarded: true,
      activeGoal: 'Giao tiếp',
      masterySummary: {
        masteredCount: 100,
        inProgressCount: 20,
        dueForReviewCount: 5,
      },
      recentEvidenceCount: 120,
      srsDueCount: 5,
      updatedAt: '2026-08-17T00:00:00.000Z',
      schemaVersion: 1,
    })

    expect(text).toContain('[Domain: Learning | Subject: english]')
    expect(text).toContain('Level: B1')
    expect(text).toContain('SRS cần ôn: 5 từ')
    expect(text).toContain('Đã thành thạo: 100 từ')
  })
})

// Nhánh biên: dữ liệu JSON lệch kiểu, thiếu trường, giá trị 0/null.
describe('getLearningReadModel — nhánh biên', () => {
  function poolWithRows(profileRows: unknown[], progressRows: unknown[]): Pool {
    return {
      query: vi
        .fn()
        .mockResolvedValueOnce({ rows: profileRows })
        .mockResolvedValueOnce({ rows: progressRows }),
    } as unknown as Pool
  }

  it('settings/placement sai kiểu hoặc thiếu khoá → lùi về mặc định A và null', async () => {
    const model = await getLearningReadModel(
      poolWithRows(
        [{ onboarded: true, goal: null, daily_minutes: null }],
        [
          {
            settings: { direction: 'Z' },
            placement: { cefr: 'Z9' },
            stats: null,
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      ),
      { personId: PERSON_ID, userId: USER_ID },
    )

    expect(model.direction).toBe('A')
    expect(model.currentLevel).toBeNull()
    expect(model.activeGoal).toBeNull()
    expect(model.dailyMinutes).toBe(15)
    expect(model.masterySummary.masteredCount).toBe(0)
  })

  it('settings/placement là chuỗi (không phải object) → vẫn dùng mặc định', async () => {
    const model = await getLearningReadModel(
      poolWithRows(
        [{ onboarded: false, goal: null, daily_minutes: 30 }],
        [
          {
            settings: 'khong-phai-object',
            placement: 'khong-phai-object',
            stats: 'khong-phai-object',
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      ),
      { personId: PERSON_ID, userId: USER_ID },
    )

    expect(model.direction).toBe('A')
    expect(model.currentLevel).toBeNull()
    expect(model.dailySpeed).toBe(10)
    expect(model.dailyMinutes).toBe(30)
  })

  it('dailySpeed không phải số → lùi về 10; chiều B được nhận diện', async () => {
    const model = await getLearningReadModel(
      poolWithRows(
        [{ onboarded: true, goal: 'Giao tiếp', daily_minutes: 20 }],
        [
          {
            settings: { direction: 'B', dailySpeed: 'nhanh' },
            placement: { cefr: 'A1' },
            stats: { masteredCount: 10, inProgressCount: 2, dueForReviewCount: 4 },
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      ),
      { personId: PERSON_ID, userId: USER_ID },
    )

    expect(model.dailySpeed).toBe(10)
    expect(model.direction).toBe('B')
    // Không có srsDueCount riêng → lấy theo dueForReviewCount.
    expect(model.srsDueCount).toBe(4)
    expect(model.recentEvidenceCount).toBe(12)
  })

  it('có srsDueCount riêng thì ưu tiên giá trị đó', async () => {
    const model = await getLearningReadModel(
      poolWithRows(
        [{ onboarded: true, goal: 'Giao tiếp', daily_minutes: 20 }],
        [
          {
            settings: { dailySpeed: 5 },
            placement: {},
            stats: { srsDueCount: 7, dueForReviewCount: 3 },
            updated_at: new Date('2026-08-17T00:00:00Z'),
          },
        ],
      ),
      { personId: PERSON_ID, userId: USER_ID },
    )

    expect(model.srsDueCount).toBe(7)
    expect(model.dailySpeed).toBe(5)
  })

  it('thiếu updated_at → dùng thời điểm hiện tại', async () => {
    const model = await getLearningReadModel(
      poolWithRows(
        [{ onboarded: true, goal: 'Giao tiếp', daily_minutes: 20 }],
        [{ settings: {}, placement: {}, stats: {}, updated_at: null }],
      ),
      { personId: PERSON_ID, userId: USER_ID },
    )

    expect(new Date(model.updatedAt).getTime()).toBeGreaterThan(0)
  })
})

describe('formatLearningReadModelForContext — nhánh biên', () => {
  const base = {
    personId: PERSON_ID,
    subject: 'english' as const,
    direction: 'B' as const,
    currentLevel: null,
    dailySpeed: 10,
    dailyMinutes: 15,
    onboarded: false,
    activeGoal: null,
    masterySummary: { masteredCount: 0, inProgressCount: 0, dueForReviewCount: 0 },
    recentEvidenceCount: 0,
    srsDueCount: 0,
    updatedAt: '2026-08-17T00:00:00.000Z',
    schemaVersion: 1,
  }

  it('người học mới (chưa có level/goal/SRS) → chỉ 4 phần cơ bản, chiều VI -> EN', () => {
    const text = formatLearningReadModelForContext(base)
    expect(text).toContain('Level: Chưa xác định')
    expect(text).toContain('Direction: VI -> EN')
    expect(text).not.toContain('Mục tiêu:')
    expect(text).not.toContain('SRS cần ôn')
    expect(text).not.toContain('Đã thành thạo')
    // 4 phần cơ bản, nhưng phần đầu tự nó đã chứa dấu " | " nên tách ra 5 mảnh.
    expect(text.split(' | ').length).toBe(5)
  })
})
