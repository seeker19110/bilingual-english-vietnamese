import { describe, it, expect } from 'vitest'
import {
  syncWearableBiometrics,
  calculateCircadianLearningWindow,
} from './wearablesIntegrationService.js'

describe('wearablesIntegrationService', () => {
  it('syncs biometric stream and computes readiness score', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const record = syncWearableBiometrics(personId, 'apple_health', 72, 54, 92, 110)
    expect(record.personId).toBe(personId)
    expect(record.readinessScore).toBeGreaterThanOrEqual(85)
  })

  it('calculates circadian learning window based on bio readiness', () => {
    const personId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
    syncWearableBiometrics(personId, 'oura_ring', 75, 52, 95, 120)

    const window = calculateCircadianLearningWindow(personId)
    expect(window.currentCognitiveBand).toBe('peak_analytical')
    expect(window.goldenWindowStart).toBe('08:30')
    expect(window.goldenWindowEnd).toBe('11:30')
    expect(window.recommendedDifficulty).toBe('advanced')
  })
})
