import { describe, expect, it } from 'vitest'
import { LearningReadModelSchema, LEARNING_READ_MODEL_SCHEMA_VERSION } from './learningReadModel.js'

describe('LearningReadModelSchema', () => {
  it('validates a valid learning read model', () => {
    const valid = {
      personId: '11111111-1111-4111-8111-111111111111',
      subject: 'english',
      direction: 'A',
      currentLevel: 'B1',
      dailySpeed: 10,
      dailyMinutes: 15,
      onboarded: true,
      activeGoal: 'Giao tiếp hàng ngày',
      masterySummary: {
        masteredCount: 150,
        inProgressCount: 40,
        dueForReviewCount: 12,
      },
      recentEvidenceCount: 50,
      srsDueCount: 8,
      updatedAt: '2026-08-17T00:00:00.000Z',
      schemaVersion: LEARNING_READ_MODEL_SCHEMA_VERSION,
    }

    const parsed = LearningReadModelSchema.parse(valid)
    expect(parsed.subject).toBe('english')
    expect(parsed.currentLevel).toBe('B1')
    expect(parsed.masterySummary.masteredCount).toBe(150)
  })

  it('allows nullable currentLevel and activeGoal', () => {
    const valid = {
      personId: '11111111-1111-4111-8111-111111111111',
      subject: 'english',
      direction: 'B',
      currentLevel: null,
      dailySpeed: 5,
      dailyMinutes: 0,
      onboarded: false,
      activeGoal: null,
      masterySummary: {
        masteredCount: 0,
        inProgressCount: 0,
        dueForReviewCount: 0,
      },
      recentEvidenceCount: 0,
      srsDueCount: 0,
      updatedAt: '2026-08-17T00:00:00.000Z',
      schemaVersion: LEARNING_READ_MODEL_SCHEMA_VERSION,
    }

    const parsed = LearningReadModelSchema.parse(valid)
    expect(parsed.currentLevel).toBeNull()
    expect(parsed.activeGoal).toBeNull()
  })
})
