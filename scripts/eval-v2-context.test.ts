import { describe, it, expect } from 'vitest'
import { buildContextPackage } from '@dhcb/core-personal/contextEngine'

describe('Eval V2 Context', () => {
  it('should include current_request in context', async () => {
    const mockPool = {
      query: async () => ({ rows: [] }),
    } as unknown as Parameters<typeof buildContextPackage>[0]

    const pkg = await buildContextPackage(mockPool, {
      personId: '00000000-0000-0000-0000-000000000000',
      requestId: '12345678-1234-4234-8234-123456789012',
      requestText: 'hello',
      purpose: 'test',
    })

    expect(pkg.items).toHaveLength(1)
    expect(pkg.items[0]!.sourceType).toBe('current_request')
    expect(pkg.items[0]!.content).toBe('hello')
  })
})
