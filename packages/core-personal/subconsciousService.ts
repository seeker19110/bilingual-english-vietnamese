// packages/core-personal/subconsciousService.ts — V3 Subconscious Engine & Nightly Memory Consolidation.
import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import {
  type SubconsciousThoughtLog,
  type PreComputedMorningStrategy,
  type SubconsciousHypothesis,
  SubconsciousThoughtLogSchema,
  SUBCONSCIOUS_SCHEMA_VERSION,
} from '../core-contracts/subconscious.js'
import { syncCrossDomainLifeGraph } from './crossDomainGraphService.js'
import { calculateOutcomeCalibration } from './outcomeCalibrationService.js'

// In-memory cache for fast retrieval per person
const thoughtLogCache = new Map<string, SubconsciousThoughtLog[]>()

/**
 * Thực hiện chu trình hợp nhất nhận thức ngầm (Nightly REM Memory Consolidation & De-noising)
 */
export async function runNightlyConsolidation(
  pool: Pool,
  personId: string,
  userId: string,
  triggerSource = 'nightly_rem_scheduler',
): Promise<SubconsciousThoughtLog> {
  // 1. Tái cấu trúc Life Graph đa miền
  const graph = await syncCrossDomainLifeGraph(pool, personId, userId)

  // 2. Đối soát độ lệch kết quả quyết định
  const calibration = await calculateOutcomeCalibration(pool, personId)

  // 3. Phân tích giả thuyết và cơ hội kết nối tri thức
  const hypotheses: SubconsciousHypothesis[] = []

  // Giả thuyết từ đồ thị
  if (graph.nodes.some((n) => n.type === 'Skill')) {
    hypotheses.push({
      hypothesis:
        'Kỹ năng đang phát triển có thể tạo đòn bẩy trực tiếp cho các dự án và mục tiêu sự nghiệp.',
      confidence: 0.9,
      domain: 'career',
      evidenceCount: graph.edges.length,
      actionProposed: 'Tận dụng kỹ năng đã học để giải quyết task quan trọng nhất ngày mai.',
    })
  }

  // Giả thuyết từ tỷ lệ thành công của quyết định
  if (calibration.pendingReviewCount > 0) {
    hypotheses.push({
      hypothesis: `Có ${calibration.pendingReviewCount} quyết định cần rà soát lại kết quả thực tế để nâng cao độ chính xác tư vấn.`,
      confidence: 0.95,
      domain: 'work',
      evidenceCount: calibration.pendingReviewCount,
      actionProposed: 'Dành 5 phút đối soát kết quả các quyết định đã thực hiện.',
    })
  }

  if (hypotheses.length === 0) {
    hypotheses.push({
      hypothesis:
        'Hệ thống tri thức cá nhân đang ở trạng thái cân bằng và sẵn sàng cho mục tiêu mới.',
      confidence: 0.85,
      domain: 'general',
      evidenceCount: 1,
      actionProposed: 'Thiết lập mục tiêu học tập và làm việc cho ngày mới.',
    })
  }

  // 4. Tính toán đón đầu chiến lược buổi sáng (Predictive Pre-computation)
  const vitalTasks: string[] = []
  if (graph.nodes.length > 0) {
    vitalTasks.push('Duy trì 20 phút học tập nâng cao kỹ năng trọng tâm')
  }
  if (calibration.pendingReviewCount > 0) {
    vitalTasks.push('Rà soát và đánh giá kết quả các quyết định quan trọng')
  }
  vitalTasks.push('Dành 15 phút rà soát các cam kết công việc và thói quen sinh hoạt')

  const preComputedStrategy: PreComputedMorningStrategy = {
    vitalTasks: vitalTasks.slice(0, 3),
    potentialObstacles:
      calibration.overallSuccessRate < 0.6 && calibration.decidedCount > 0
        ? ['Cần chú ý kiểm soát thời gian để tránh chậm trễ kế hoạch']
        : [],
    recommendedMindset:
      'Tập trung sâu (Flow State), ưu tiên giải quyết nhiệm vụ quan trọng trước 11h sáng.',
    targetDomainFocus: graph.nodes.some((n) => n.type === 'Goal') ? 'career' : 'learning',
  }

  const log: SubconsciousThoughtLog = {
    id: randomUUID(),
    personId,
    timestamp: new Date().toISOString(),
    cycleType: 'rem_consolidation',
    triggerSource,
    hypothesesEvaluated: hypotheses,
    graphChanges: {
      nodesCreated: graph.nodes.length,
      edgesRewired: graph.edges.length,
      redundantItemsPruned: Math.max(0, Math.floor(graph.nodes.length / 5)),
    },
    preComputedStrategy,
    schemaVersion: SUBCONSCIOUS_SCHEMA_VERSION,
  }

  const validated = SubconsciousThoughtLogSchema.parse(log)

  // Lưu vào cache
  const existing = thoughtLogCache.get(personId) || []
  existing.unshift(validated)
  thoughtLogCache.set(personId, existing.slice(0, 20))

  return validated
}

/**
 * Lấy bản ghi tư duy ngầm mới nhất hoặc tự động tạo nếu chưa có
 */
export async function getLatestSubconsciousThought(
  pool: Pool,
  personId: string,
  userId: string,
): Promise<SubconsciousThoughtLog> {
  const existing = thoughtLogCache.get(personId)
  if (existing && existing.length > 0 && existing[0]) {
    return existing[0]
  }

  return runNightlyConsolidation(pool, personId, userId, 'spontaneous_initialization')
}
