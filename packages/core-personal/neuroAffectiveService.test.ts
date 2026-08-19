import { describe, it, expect } from 'vitest'
import type { Pool } from 'pg'
import {
  assessNeuroAffectiveState,
  getLatestNeuroState,
  toggleNeuroShield,
} from './neuroAffectiveService.js'

describe('neuroAffectiveService', () => {
  const personId = '550e8400-e29b-41d4-a716-446655440001'

  it('đánh giá trạng thái Flow State khi chỉ số stress thấp và tập trung cao', async () => {
    const state = await assessNeuroAffectiveState({} as unknown as Pool, personId, {
      manualStressOverride: 20,
    })

    expect(state.energyLevel).toBe('peak_flow')
    expect(state.activeShields.includes('mute_notifications')).toBe(true)
    expect(state.focusScore).toBe(90)
  })

  it('kích hoạt can thiệp phục hồi khi chỉ số stress cao', async () => {
    const state = await assessNeuroAffectiveState({} as unknown as Pool, personId, {
      manualStressOverride: 85,
    })

    expect(state.energyLevel).toBe('burnout_risk')
    expect(state.activeShields.includes('downscale_difficulty')).toBe(true)
    expect(state.activeShields.includes('suggest_breathing')).toBe(true)
  })

  it('bật/tắt lá chắn điều tiết thành công', () => {
    const updated = toggleNeuroShield(personId, 'focus_timer_lock', true)
    expect(updated.activeShields.includes('focus_timer_lock')).toBe(true)

    const disabled = toggleNeuroShield(personId, 'focus_timer_lock', false)
    expect(disabled.activeShields.includes('focus_timer_lock')).toBe(false)
  })

  it('truy xuất trạng thái neuro mới nhất', () => {
    const latest = getLatestNeuroState(personId)
    expect(latest.personId).toBe(personId)
    expect(latest.schemaVersion).toBe('v3.0.0')
  })
})
