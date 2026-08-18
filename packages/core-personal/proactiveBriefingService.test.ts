// packages/core-personal/proactiveBriefingService.test.ts
import { describe, it, expect } from 'vitest'
import { generateProactiveBriefing, resolveBriefingType } from './proactiveBriefingService.js'

describe('ProactiveBriefingService', () => {
  it('resolves morning type before 17:00 and evening after 17:00', () => {
    const morningDate = new Date('2026-08-18T09:00:00')
    const eveningDate = new Date('2026-08-18T19:00:00')

    expect(resolveBriefingType(undefined, morningDate)).toBe('morning')
    expect(resolveBriefingType(undefined, eveningDate)).toBe('evening')
    expect(resolveBriefingType('evening', morningDate)).toBe('evening')
  })

  it('generates a morning proactive briefing with action items and insights', async () => {
    const personId = '00000000-0000-0000-0000-000000000001'
    const morningDate = new Date('2026-08-18T08:30:00')

    const briefing = await generateProactiveBriefing(null, personId, { now: morningDate })

    expect(briefing.personId).toBe(personId)
    expect(briefing.type).toBe('morning')
    expect(briefing.greeting).toContain('☀️ Chào buổi sáng')
    expect(briefing.actionItems.length).toBeGreaterThanOrEqual(2)
    expect(briefing.actionItems.some((i) => i.domain === 'learning')).toBe(true)
    expect(briefing.actionItems.some((i) => i.domain === 'life')).toBe(true)
  })

  it('generates an evening proactive briefing with evening reflection', async () => {
    const personId = '00000000-0000-0000-0000-000000000001'
    const eveningDate = new Date('2026-08-18T20:00:00')

    const briefing = await generateProactiveBriefing(null, personId, { now: eveningDate })

    expect(briefing.type).toBe('evening')
    expect(briefing.greeting).toContain('🌙 Chào buổi tối')
    expect(briefing.actionItems.some((i) => i.domain === 'life')).toBe(true)
  })
})
