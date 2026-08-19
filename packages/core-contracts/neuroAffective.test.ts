import { describe, it, expect } from 'vitest'
import { NeuroAffectiveStateSchema, NEURO_SCHEMA_VERSION } from './neuroAffective.js'

describe('core-contracts: neuroAffective', () => {
  it('xác thực hợp lệ bản ghi trạng thái tập trung sâu Peak Flow', () => {
    const validState = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      personId: '550e8400-e29b-41d4-a716-446655440001',
      timestamp: new Date().toISOString(),
      energyLevel: 'peak_flow',
      stressIndex: 20,
      focusScore: 95,
      bioMetrics: {
        heartRateBpm: 68,
        hrvMs: 65.4,
        stressIndex: 18,
      },
      voiceProsody: {
        speakingRateWpm: 145,
        pitchStability: 0.92,
        emotionalValence: 'positive',
      },
      activeShields: ['mute_notifications', 'focus_timer_lock'],
      recommendedAction: 'Duy trì trạng thái tập trung sâu trong 45 phút tới.',
      schemaVersion: NEURO_SCHEMA_VERSION,
    }

    const parsed = NeuroAffectiveStateSchema.parse(validState)
    expect(parsed.energyLevel).toBe('peak_flow')
    expect(parsed.activeShields.includes('mute_notifications')).toBe(true)
    expect(parsed.schemaVersion).toBe('v3.0.0')
  })

  it('xác thực hợp lệ bản ghi trạng thái mệt mỏi cần phục hồi', () => {
    const fatiguedState = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      personId: '550e8400-e29b-41d4-a716-446655440001',
      timestamp: new Date().toISOString(),
      energyLevel: 'burnout_risk',
      stressIndex: 85,
      focusScore: 35,
      activeShields: ['downscale_difficulty', 'suggest_breathing'],
      recommendedAction: 'Nghỉ ngơi 10 phút và thực hiện bài tập thở sâu.',
      schemaVersion: NEURO_SCHEMA_VERSION,
    }

    const parsed = NeuroAffectiveStateSchema.parse(fatiguedState)
    expect(parsed.energyLevel).toBe('burnout_risk')
    expect(parsed.activeShields.length).toBe(2)
  })
})
