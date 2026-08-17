import { describe, it, expect } from 'vitest'
import { resolveAuthority } from '../packages/core-personal/policyService.js'

describe('Eval V2 Permissions', () => {
  it('should resolve DENY', async () => {
    const mockPool = {
      query: async () => ({ rows: [{ authority: 'DENY' }] }),
    } as any
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBe('DENY')
  })

  it('should resolve null if no policy found', async () => {
    const mockPool = {
      query: async () => ({ rows: [] }),
    } as any
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBeNull()
  })

  it('should parse authority correctly', async () => {
    const mockPool = {
      query: async () => ({ rows: [{ authority: 'EXECUTE_WITH_CONFIRMATION' }] }),
    } as any
    const auth = await resolveAuthority(mockPool, '123', 'sub', 'act', 'scope')
    expect(auth).toBe('EXECUTE_WITH_CONFIRMATION')
  })
})
