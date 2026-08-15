import { describe, it, expect } from 'vitest'
import { ActivitySchema, ACTIVITY_SCHEMA_VERSION } from './activity.js'

const validActivity = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  learnerId: '123e4567-e89b-12d3-a456-426614174001',
  kind: 'chat',
  startedAt: '2026-08-15T00:00:00Z',
  schemaVersion: ACTIVITY_SCHEMA_VERSION,
}

describe('ActivitySchema', () => {
  it('hoạt động đang diễn ra (không lessonId/completedAt) → parse thành công', () => {
    expect(ActivitySchema.parse(validActivity)).toEqual(validActivity)
  })

  it('hoạt động đã xong, gắn với 1 lesson → parse thành công', () => {
    const finished = {
      ...validActivity,
      kind: 'lesson',
      lessonId: '123e4567-e89b-12d3-a456-426614174002',
      completedAt: '2026-08-15T00:10:00Z',
    }
    expect(ActivitySchema.parse(finished)).toEqual(finished)
  })

  it('kind ngoài 5 giá trị cho phép → từ chối', () => {
    expect(() => ActivitySchema.parse({ ...validActivity, kind: 'exam' })).toThrow()
  })

  it('field lạ → từ chối', () => {
    expect(() => ActivitySchema.parse({ ...validActivity, durationSec: 120 })).toThrow()
  })
})
