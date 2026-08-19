// apps/english/src/lib/memoryPalaceApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchMemoryPalaceState,
  createMemoryPalaceRoomApi,
  verifyLocusRecallApi,
} from './memoryPalaceApi.js'

describe('memoryPalaceApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches memory palace state', async () => {
    const mockState = {
      rooms: [],
      totalMasteredAnchors: 0,
      overallRetentionIndex: 80,
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, state: mockState }),
    } as unknown as Response)

    const res = await fetchMemoryPalaceState()
    expect(res.overallRetentionIndex).toBe(80)
    expect(global.fetch).toHaveBeenCalledWith('/api/memory-palace', expect.any(Object))
  })

  it('creates memory palace room', async () => {
    const mockRoom = {
      id: 'room-1',
      personId: 'user-1',
      name: 'Phòng Mới',
      theme: 'debate_sanctuary',
      description: 'Desc',
      loci: [],
      totalAnchorsCount: 0,
      masteredAnchorsCount: 0,
      averageRetentionRate: 0,
      createdAt: '2026-08-20T06:00:00.000Z',
      updatedAt: '2026-08-20T06:00:00.000Z',
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, room: mockRoom }),
    } as unknown as Response)

    const res = await createMemoryPalaceRoomApi({
      name: 'Phòng Mới',
      theme: 'debate_sanctuary',
    })

    expect(res.name).toBe('Phòng Mới')
  })

  it('verifies locus recall', async () => {
    const mockResult = {
      locusId: 'locus-1',
      isAccurate: true,
      similarityScore: 95,
      feedback: 'Good',
      strengthenedRetention: 90,
      nextRecommendedReviewDate: '2026-08-27T06:00:00.000Z',
    }
    const mockLocus = {
      id: 'locus-1',
      positionIndex: 0,
      label: 'Label',
      spatialCoordinates: { x: 0, y: 0 },
      anchorType: 'visual_monument',
      keyConcept: 'Concept',
      mnemonicStory: 'Story',
      category: 'c1_c2_vocab',
      retentionStrength: 90,
      mastered: true,
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, result: mockResult, updatedLocus: mockLocus }),
    } as unknown as Response)

    const res = await verifyLocusRecallApi({
      roomId: 'room-1',
      locusId: 'locus-1',
      userRecallText: 'Concept text',
    })

    expect(res.result.isAccurate).toBe(true)
    expect(res.updatedLocus.mastered).toBe(true)
  })
})
