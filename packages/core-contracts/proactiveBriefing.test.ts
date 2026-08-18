// packages/core-contracts/proactiveBriefing.test.ts
import { describe, it, expect } from 'vitest'
import {
  ProactiveBriefingSchema,
  ProactiveBriefingRequestSchema,
  type ProactiveBriefing,
} from './proactiveBriefing.js'

describe('ProactiveBriefing Contracts', () => {
  it('validates a valid proactive briefing object', () => {
    const briefing: ProactiveBriefing = {
      id: 'briefing-123',
      personId: '11111111-1111-4111-8111-111111111111',
      type: 'morning',
      greeting: 'Chào buổi sáng! Hãy sẵn sàng cho ngày mới.',
      summary: 'Hôm nay bạn có 5 thẻ SRS cần ôn tập và 2 thói quen cần hoàn thành.',
      actionItems: [
        {
          id: 'act-1',
          domain: 'learning',
          title: 'Ôn tập từ vựng SRS',
          action: 'Hoàn thành 5 thẻ từ vựng đến hạn',
          route: '/on-tap',
          priority: 'urgent',
        },
      ],
      insights: ['Chuỗi học tập của bạn đang đạt 7 ngày liên tiếp.'],
      generatedAt: new Date().toISOString(),
    }

    const parsed = ProactiveBriefingSchema.parse(briefing)
    expect(parsed.id).toBe('briefing-123')
    expect(parsed.actionItems).toHaveLength(1)
  })

  it('rejects invalid briefing items missing required fields', () => {
    const invalid = {
      id: 'briefing-1',
      personId: 'invalid-uuid',
      type: 'morning',
    }
    expect(() => ProactiveBriefingSchema.parse(invalid)).toThrow()
  })

  it('parses request options with optional fields', () => {
    const req = {
      personId: '11111111-1111-4111-8111-111111111111',
      type: 'evening' as const,
      forceRegenerate: true,
    }
    const parsed = ProactiveBriefingRequestSchema.parse(req)
    expect(parsed.type).toBe('evening')
    expect(parsed.forceRegenerate).toBe(true)
  })
})
