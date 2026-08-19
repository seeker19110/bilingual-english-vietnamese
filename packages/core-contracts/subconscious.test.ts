import { describe, it, expect } from 'vitest'
import {
  SubconsciousThoughtLogSchema,
  PreComputedMorningStrategySchema,
  SUBCONSCIOUS_SCHEMA_VERSION,
} from './subconscious.js'

describe('core-contracts: subconscious', () => {
  it('xác thực hợp lệ bản ghi chiến lược đón đầu ngày mới', () => {
    const validStrategy = {
      vitalTasks: ['Học 20 từ vựng IELTS C1', 'Rà soát bài thuyết trình Startup'],
      potentialObstacles: ['Lịch họp buổi chiều có thể bị kéo dài'],
      recommendedMindset: 'Tập trung sâu trong 90 phút đầu ngày',
      targetDomainFocus: 'learning',
    }

    const parsed = PreComputedMorningStrategySchema.parse(validStrategy)
    expect(parsed.vitalTasks.length).toBe(2)
    expect(parsed.targetDomainFocus).toBe('learning')
  })

  it('xác thực hợp lệ nhật ký tư duy ngầm ban đêm', () => {
    const log = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      personId: '550e8400-e29b-41d4-a716-446655440001',
      timestamp: new Date().toISOString(),
      cycleType: 'rem_consolidation',
      triggerSource: 'nightly_cron_scheduler',
      hypothesesEvaluated: [
        {
          hypothesis: 'Kỹ năng phát âm tiếng Anh đang hỗ trợ tốt cho buổi phỏng vấn',
          confidence: 0.92,
          domain: 'career',
          evidenceCount: 3,
          actionProposed: 'Luyện 15 phút Speaking mô phỏng phỏng vấn',
        },
      ],
      graphChanges: {
        nodesCreated: 2,
        edgesRewired: 4,
        redundantItemsPruned: 1,
      },
      preComputedStrategy: {
        vitalTasks: ['Hoàn thành bài tập phát âm Unit 4'],
        potentialObstacles: [],
        recommendedMindset: 'Tự tin và biểu đạt tự nhiên',
        targetDomainFocus: 'learning',
      },
      schemaVersion: SUBCONSCIOUS_SCHEMA_VERSION,
    }

    const parsed = SubconsciousThoughtLogSchema.parse(log)
    expect(parsed.cycleType).toBe('rem_consolidation')
    expect(parsed.hypothesesEvaluated.length).toBe(1)
    expect(parsed.schemaVersion).toBe('v3.0.0')
  })
})
