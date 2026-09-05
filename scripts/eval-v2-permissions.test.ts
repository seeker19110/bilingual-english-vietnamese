import { describe, it, expect } from 'vitest'
import { resolveAuthority } from '@dhcb/core-personal/policyService'

describe('Eval V2 Permissions', () => {
  it('should resolve DENY', async () => {
    const mockPool = {
      query: async () => ({ rows: [{ authority: 'DENY' }] }),
    } as unknown as Parameters<typeof resolveAuthority>[0]
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBe('DENY')
  })

  it('should resolve null if no policy found', async () => {
    const mockPool = {
      query: async () => ({ rows: [] }),
    } as unknown as Parameters<typeof resolveAuthority>[0]
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBeNull()
  })

  it('should parse authority correctly', async () => {
    const mockPool = {
      query: async () => ({ rows: [{ authority: 'EXECUTE_WITH_CONFIRMATION' }] }),
    } as unknown as Parameters<typeof resolveAuthority>[0]
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBe('EXECUTE_WITH_CONFIRMATION')
  })
})
