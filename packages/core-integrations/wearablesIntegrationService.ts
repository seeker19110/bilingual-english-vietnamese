// packages/core-integrations/wearablesIntegrationService.ts — V3 Wearables & Circadian Bio-Adaptive MCP Service.
import { randomUUID } from 'node:crypto'
import {
  type WearableSource,
  type BioStreamRecord,
  type CircadianLearningWindow,
  WEARABLES_SCHEMA_VERSION,
} from '../core-contracts/wearablesIntegration.js'

const bioStreamStore = new Map<string, BioStreamRecord>()

export function syncWearableBiometrics(
  personId: string,
  source: WearableSource = 'apple_health',
  hrvMs: number = 68,
  restingHeartRateBpm: number = 56,
  sleepQualityScore: number = 90,
  deepSleepMinutes: number = 105,
): BioStreamRecord {
  const hrvScore = Math.min(100, Math.max(0, ((hrvMs - 20) / 60) * 100))
  const hrScore = Math.min(100, Math.max(0, ((100 - restingHeartRateBpm) / 50) * 100))

  const readinessScore = Math.min(
    100,
    Math.round(hrvScore * 0.4 + sleepQualityScore * 0.4 + hrScore * 0.2),
  )

  const record: BioStreamRecord = {
    id: randomUUID(),
    personId,
    source,
    hrvMs,
    restingHeartRateBpm,
    sleepQualityScore,
    deepSleepMinutes,
    readinessScore,
    recordedAt: new Date().toISOString(),
    schemaVersion: WEARABLES_SCHEMA_VERSION,
  }

  bioStreamStore.set(personId, record)
  return record
}

export function getLatestBioStream(personId: string): BioStreamRecord {
  const existing = bioStreamStore.get(personId)
  if (!existing) {
    return syncWearableBiometrics(personId)
  }
  return existing
}

export function calculateCircadianLearningWindow(personId: string): CircadianLearningWindow {
  const bio = getLatestBioStream(personId)
  const now = new Date()

  let currentCognitiveBand: CircadianLearningWindow['currentCognitiveBand'] = 'peak_analytical'
  let recommendedDifficulty: CircadianLearningWindow['recommendedDifficulty'] = 'advanced'
  let adaptationAdvice = ''

  if (bio.readinessScore >= 80) {
    currentCognitiveBand = 'peak_analytical'
    recommendedDifficulty = 'advanced'
    adaptationAdvice = `Trạng thái sinh học đỉnh cao (HRV ${bio.hrvMs}ms, Readiness ${bio.readinessScore}/100). Đây là khung giờ vàng để học ngữ pháp nâng cao, mock test IELTS hoặc phản biện kịch bản Holodeck.`
  } else if (bio.readinessScore >= 60) {
    currentCognitiveBand = 'creative_fluid'
    recommendedDifficulty = 'moderate'
    adaptationAdvice = `Mức độ năng lượng ổn định. Thích hợp cho luyện Shadowing, đọc truyện song ngữ và mở rộng vốn từ theo chủ đề.`
  } else {
    currentCognitiveBand = 'fatigued_recharge'
    recommendedDifficulty = 'light_listening'
    adaptationAdvice = `Chỉ số phục hồi thấp (HRV ${bio.hrvMs}ms). Khuyến nghị nghe podcast nhẹ nhàng hoặc thực hiện bài tập thở hồi phục trước khi học.`
  }

  return {
    personId,
    currentCognitiveBand,
    readinessScore: bio.readinessScore,
    goldenWindowStart: '08:30',
    goldenWindowEnd: '11:30',
    recommendedDifficulty,
    adaptationAdvice,
    evaluatedAt: now.toISOString(),
    schemaVersion: WEARABLES_SCHEMA_VERSION,
  }
}
