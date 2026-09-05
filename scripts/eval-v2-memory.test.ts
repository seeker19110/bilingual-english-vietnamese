import { describe, it, expect } from 'vitest'
import { evaluateMemoryCandidate, type MemoryCandidate } from '@dhcb/core-personal/memoryService'

describe('Eval V2 Memory', () => {
  const createMockRunner = (rows: unknown[]) =>
    ({
      query: async () => ({ rows, rowCount: rows.length, command: '', oid: 0, fields: [] }),
    }) as unknown as Parameters<typeof evaluateMemoryCandidate>[0]

  it('should REJECT when confidence < 0.6', async () => {
    const runner = createMockRunner([])
    const candidate: MemoryCandidate = {
      namespace: 'semantic',
      content: 'I live in Paris',
      provenance: 'derived',
      sensitivity: 'personal',
      confidence: 0.5,
    }
    const result = await evaluateMemoryCandidate(runner, 'person-123', candidate)
    expect(result.outcome).toBe('REJECT')
  })

  it('should ASK_USER when 0.6 <= confidence < 0.8', async () => {
    const runner = createMockRunner([])
    const candidate: MemoryCandidate = {
      namespace: 'semantic',
      content: 'I live in Paris',
      provenance: 'derived',
      sensitivity: 'personal',
      confidence: 0.7,
    }
    const result = await evaluateMemoryCandidate(runner, 'person-123', candidate)
    expect(result.outcome).toBe('ASK_USER')
  })

  it('should REJECT restricted with non-user_declared provenance', async () => {
    const runner = createMockRunner([])
    const candidate: MemoryCandidate = {
      namespace: 'semantic',
      content: 'Secret',
      provenance: 'derived',
      sensitivity: 'restricted',
      confidence: 0.9,
    }
    const result = await evaluateMemoryCandidate(runner, 'person-123', candidate)
    expect(result.outcome).toBe('REJECT')
  })
})
