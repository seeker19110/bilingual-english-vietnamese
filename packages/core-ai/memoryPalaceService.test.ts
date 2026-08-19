// packages/core-ai/memoryPalaceService.test.ts
import { describe, it, expect } from 'vitest'
import { MemoryPalaceService } from './memoryPalaceService.js'

describe('MemoryPalaceService', () => {
  it('creates a memory palace room with default loci templates', () => {
    const room = MemoryPalaceService.createMemoryPalaceRoom('user-1', {
      name: 'Thư Viện Tri Thức Anh Ngữ',
      theme: 'knowledge_library',
    })

    expect(room.personId).toBe('user-1')
    expect(room.theme).toBe('knowledge_library')
    expect(room.loci.length).toBeGreaterThan(0)
    expect(room.totalAnchorsCount).toBe(room.loci.length)
    expect(room.averageRetentionRate).toBeGreaterThan(0)
  })

  it('verifies locus recall with accurate answer', () => {
    const room = MemoryPalaceService.createMemoryPalaceRoom('user-1', {
      name: 'Phòng Thí Nghiệm STEM',
      theme: 'stem_laboratory',
    })
    const locus = room.loci[0]!

    const result = MemoryPalaceService.verifyLocusRecall(locus, locus.keyConcept)
    expect(result.locusId).toBe(locus.id)
    expect(result.isAccurate).toBe(true)
    expect(result.similarityScore).toBeGreaterThan(50)
  })

  it('handles inaccurate recall feedback gracefully', () => {
    const room = MemoryPalaceService.createMemoryPalaceRoom('user-1', {
      name: 'Vườn Thiền',
      theme: 'zen_garden',
    })
    const locus = room.loci[0]!

    const result = MemoryPalaceService.verifyLocusRecall(locus, 'không nhớ gì')
    expect(result.locusId).toBe(locus.id)
    expect(result.feedback).toContain(locus.mnemonicStory)
  })
})
