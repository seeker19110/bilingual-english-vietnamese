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

  it('handles stabilityS <= 0 in decay and interval calculations', () => {
    expect(calculateRetentionDecay(5, 0)).toBe(0)
    expect(calculateRetentionDecay(5, -1)).toBe(0)
    expect(calculateNextReviewIntervalDays(0)).toBe(1)
    expect(calculateNextReviewIntervalDays(-5)).toBe(1)
  })

  it('handles empty memories with default morning briefing values and default targetDate', () => {
    const report = runRemMemoryConsolidation('user-empty', [])
    expect(report.totalRawMemoriesProcessed).toBe(0)
    expect(report.blocksGenerated).toBe(0)
    expect(report.morningBriefing.focusAreas).toEqual([
      'Duy trì nhịp học tập và phát triển cá nhân',
    ])
    expect(report.morningBriefing.suggestedAction).toBe(
      'Bắt đầu ngày mới với một bài tập phát âm 5 phút.',
    )
  })

  it('covers all 5 domain titles and names (work, startup, life)', () => {
    const memories: RawDayMemory[] = [
      {
        id: 'm-work',
        personId: 'u1',
        domain: 'work',
        content: 'Hoàn thành Sprint 2',
        confidence: 1,
        importance: 4,
        timestamp: Date.now(),
      },
      {
        id: 'm-startup',
        personId: 'u1',
        domain: 'startup',
        content: 'Phỏng vấn 3 khách hàng',
        confidence: 1,
        importance: 5,
        timestamp: Date.now(),
      },
      {
        id: 'm-life',
        personId: 'u1',
        domain: 'life',
        content: 'Ngủ đủ 8 tiếng',
        confidence: 1,
        importance: 3,
        timestamp: Date.now(),
      },
    ]

    const report = runRemMemoryConsolidation('u1', memories)
    expect(report.blocksGenerated).toBe(3)
    const titles = report.consolidatedBlocks.map((b) => b.title)
    expect(titles.some((t) => t.includes('Tiến độ Dự án'))).toBe(true)
    expect(titles.some((t) => t.includes('Kiểm chứng Giả thuyết'))).toBe(true)
    expect(titles.some((t) => t.includes('Thói quen & Nhịp sinh học'))).toBe(true)
  })
})
