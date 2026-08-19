import { describe, it, expect } from 'vitest'
import {
  BioStreamRecordSchema,
  CircadianLearningWindowSchema,
  WEARABLES_SCHEMA_VERSION,
} from './wearablesIntegration.js'

describe('wearablesIntegration contracts', () => {
  it('validates a wearable biometrics stream record', () => {
    const record = {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      personId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      source: 'apple_health',
      hrvMs: 65.4,
      restingHeartRateBpm: 58,
      sleepQualityScore: 88,
      deepSleepMinutes: 95,
      readinessScore: 92,
      recordedAt: new Date().toISOString(),
      schemaVersion: WEARABLES_SCHEMA_VERSION,
    }

    const parsed = BioStreamRecordSchema.parse(record)
    expect(parsed.source).toBe('apple_health')
    expect(parsed.readinessScore).toBe(92)
  })

  it('validates a circadian learning window calculation', () => {
    const window = {
      personId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      currentCognitiveBand: 'peak_analytical',
      readinessScore: 92,
      goldenWindowStart: '08:30',
      goldenWindowEnd: '11:00',
      recommendedDifficulty: 'advanced',
      adaptationAdvice:
        'Hệ thần kinh đang ở trạng thái hồi phục đỉnh cao (HRV 65ms), lý tưởng cho bài tập ngữ pháp phức tạp và mock test IELTS.',
      evaluatedAt: new Date().toISOString(),
      schemaVersion: WEARABLES_SCHEMA_VERSION,
    }

    const parsed = CircadianLearningWindowSchema.parse(window)
    expect(parsed.currentCognitiveBand).toBe('peak_analytical')
    expect(parsed.recommendedDifficulty).toBe('advanced')
  })
})
