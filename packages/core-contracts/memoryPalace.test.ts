// packages/core-contracts/memoryPalace.test.ts
import { describe, it, expect } from 'vitest'
import {
  MemoryPalaceRoomSchema,
  LocusAnchorSchema,
  LocusRecallResultSchema,
  MemoryPalaceStateSchema,
} from './memoryPalace.js'

describe('MemoryPalace Contracts', () => {
  it('validates a valid LocusAnchor payload', () => {
    const locus = {
      id: 'loc-1',
      positionIndex: 0,
      label: 'Tượng Nhân Sư Cổng Thư Viện',
      spatialCoordinates: { x: 10, y: 20, z: 0 },
      anchorType: 'visual_monument',
      keyConcept: 'Ephemeral (adj) - Phù du, chóng tàn',
      mnemonicStory: 'Bức tượng Nhân Sư cầm bông hoa phù du nở rộ rồi tan biến trong sương sớm.',
      category: 'c1_c2_vocab',
      retentionStrength: 85,
      mastered: true,
    }

    const parsed = LocusAnchorSchema.parse(locus)
    expect(parsed.id).toBe('loc-1')
    expect(parsed.anchorType).toBe('visual_monument')
    expect(parsed.retentionStrength).toBe(85)
  })

  it('validates a MemoryPalaceRoom and State', () => {
    const room = {
      id: 'room-1',
      personId: 'user-1',
      name: 'Thư Viện Tri Thức C1/C2',
      theme: 'knowledge_library',
      description: 'Không gian tĩnh lặng lưu giữ 500 từ vựng học thuật đỉnh cao.',
      loci: [],
      totalAnchorsCount: 0,
      masteredAnchorsCount: 0,
      averageRetentionRate: 0,
      createdAt: '2026-08-20T06:00:00.000Z',
      updatedAt: '2026-08-20T06:00:00.000Z',
    }

    const state = {
      rooms: [room],
      totalMasteredAnchors: 0,
      overallRetentionIndex: 75,
      activeRoomId: 'room-1',
    }

    const parsedRoom = MemoryPalaceRoomSchema.parse(room)
    expect(parsedRoom.id).toBe('room-1')

    const parsedState = MemoryPalaceStateSchema.parse(state)
    expect(parsedState.rooms).toHaveLength(1)
    expect(parsedState.rooms[0]?.theme).toBe('knowledge_library')
  })

  it('validates LocusRecallResult', () => {
    const result = {
      locusId: 'loc-1',
      isAccurate: true,
      similarityScore: 92,
      feedback: 'Bạn nhớ chính xác ý nghĩa và hình ảnh gợi nhớ của từ vựng!',
      strengthenedRetention: 95,
      nextRecommendedReviewDate: '2026-08-27T06:00:00.000Z',
    }

    const parsed = LocusRecallResultSchema.parse(result)
    expect(parsed.isAccurate).toBe(true)
    expect(parsed.similarityScore).toBe(92)
  })
})
