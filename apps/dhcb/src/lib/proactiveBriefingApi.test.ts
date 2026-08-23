// apps/dhcb/src/lib/proactiveBriefingApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchProactiveBriefing } from './proactiveBriefingApi.js'

describe('proactiveBriefingApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls GET /api/proactive-briefing and returns briefing object', async () => {
    const mockBriefing = {
      id: 'b-1',
      type: 'morning',
      greeting: 'Chào buổi sáng!',
      actionItems: [],
    }

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ briefing: mockBriefing }),
    })

    const res = await fetchProactiveBriefing('morning')
    expect(globalThis.fetch).toHaveBeenCalledWith('/api/proactive-briefing?type=morning')
    expect(res.greeting).toBe('Chào buổi sáng!')
  })
})
