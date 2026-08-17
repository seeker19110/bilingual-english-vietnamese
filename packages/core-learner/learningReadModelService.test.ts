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
