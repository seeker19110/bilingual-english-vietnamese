import { describe, it, expect } from 'vitest'
import {
  type RawDayMemory,
  calculateRetentionDecay,
  calculateNextReviewIntervalDays,
  runRemMemoryConsolidation,
} from './remConsolidationService'

describe('remConsolidationService (Autonomous REM Memory Consolidation)', () => {
  it('calculates memory retention decay using FSRS exponential formula', () => {
    // Stability S = 10 days, after 0 days -> R = 1.0
    expect(calculateRetentionDecay(0, 10)).toBe(1.0)
    // After 10 days -> R = e^(-1) ~ 0.37
    expect(calculateRetentionDecay(10, 10)).toBeCloseTo(0.37, 2)
  })

  it('calculates next review interval days accurately for target 90% retention', () => {
    const interval = calculateNextReviewIntervalDays(10, 0.9)
    // t = -10 * ln(0.9) ~ 1.05 -> 1 day
    expect(interval).toBeGreaterThanOrEqual(1)
  })

  it('filters private memories and consolidates raw items into structured blocks', () => {
    const sampleMemories: RawDayMemory[] = [
      {
        id: 'mem-1',
        personId: 'user-1',
        domain: 'learning',
        content: 'Nhầm lẫn âm /θ/ thành /t/ trong từ think',
        confidence: 0.95,
        importance: 4,
        timestamp: Date.now(),
      },
      {
        id: 'mem-2',
        personId: 'user-1',
        domain: 'learning',
        content: 'Học 10 từ vựng chủ đề Machine Learning',
        confidence: 0.9,
        importance: 3,
        timestamp: Date.now(),
      },
      {
        id: 'mem-3',
        personId: 'user-1',
        domain: 'career',
        content: 'Cần bổ sung chứng chỉ AWS Solutions Architect',
        confidence: 0.92,
        importance: 5,
        timestamp: Date.now(),
      },
      {
        id: 'mem-4-private',
        personId: 'user-1',
        domain: 'life',
        content: 'Bí mật cá nhân',
        confidence: 0.8,
        importance: 1,
        timestamp: Date.now(),
        isPrivate: true, // Should be ignored by REM consolidation
      },
    ]

    const report = runRemMemoryConsolidation('user-1', sampleMemories, '2026-08-21')

    expect(report.totalRawMemoriesProcessed).toBe(3)
    expect(report.blocksGenerated).toBe(2) // 1 learning block, 1 career block
    expect(report.consolidatedBlocks.some((b) => b.domain === 'learning')).toBe(true)
    expect(report.consolidatedBlocks.some((b) => b.domain === 'career')).toBe(true)
    expect(report.morningBriefing.focusAreas.length).toBeGreaterThan(0)
    expect(report.morningBriefing.suggestedAction).toContain('Tổng hợp')
  })
})
