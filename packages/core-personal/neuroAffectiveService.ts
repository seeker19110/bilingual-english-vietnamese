// packages/core-personal/neuroAffectiveService.ts — V3 Neuro-Affective Flow & Bio-Adaptive Engine.
import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import {
  type NeuroAffectiveState,
  type ActiveShield,
  type EnergyLevel,
  type BioMetrics,
  type VoiceProsodyMetrics,
  NeuroAffectiveStateSchema,
  NEURO_SCHEMA_VERSION,
} from '@dhcb/core-contracts/neuroAffective'

// In-memory cache for latest neuro state per person
const neuroStateCache = new Map<string, NeuroAffectiveState>()

export async function assessNeuroAffectiveState(
  _pool: Pool,
  personId: string,
  params?: {
    bioMetrics?: BioMetrics
    voiceProsody?: VoiceProsodyMetrics
    manualStressOverride?: number
  },
): Promise<NeuroAffectiveState> {
  void _pool

  let stressIndex = params?.manualStressOverride ?? params?.bioMetrics?.stressIndex ?? 30
  let focusScore = 75
  let energyLevel: EnergyLevel = 'productive'
  const activeShields: ActiveShield[] = []
  let recommendedAction = 'Tiến hành theo lộ trình học tập và làm việc thông thường.'

  if (params?.voiceProsody?.emotionalValence === 'stressed') {
    stressIndex = Math.max(stressIndex, 70)
  } else if (params?.voiceProsody?.emotionalValence === 'exhausted') {
    stressIndex = Math.max(stressIndex, 80)
  }

  if (stressIndex >= 75) {
    energyLevel = 'burnout_risk'
    focusScore = 35
    activeShields.push('downscale_difficulty', 'suggest_breathing')
    recommendedAction =
      'Phát hiện dấu hiệu mệt mỏi cao. AI tự động chuyển sang chế độ trò chuyện thư giãn và giảm độ khó bài tập.'
  } else if (stressIndex <= 30 && focusScore >= 70) {
    energyLevel = 'peak_flow'
    focusScore = 90
    activeShields.push('mute_notifications', 'focus_timer_lock')
    recommendedAction =
      'Bạn đang ở trạng thái tập trung sâu (Flow State). AI đã kích hoạt lá chắn chặn thông báo gây xao nhãng.'
  } else if (stressIndex > 50) {
    energyLevel = 'fatigued'
    focusScore = 55
    activeShields.push('suggest_breathing')
    recommendedAction = 'Nên dành 5 phút nghỉ giải lao sau phiên làm việc này.'
  }

  const state: NeuroAffectiveState = {
    id: randomUUID(),
    personId,
    timestamp: new Date().toISOString(),
    energyLevel,
    stressIndex,
    focusScore,
    bioMetrics: params?.bioMetrics,
    voiceProsody: params?.voiceProsody,
    activeShields,
    recommendedAction,
    schemaVersion: NEURO_SCHEMA_VERSION,
  }

  const validated = NeuroAffectiveStateSchema.parse(state)
  neuroStateCache.set(personId, validated)
  return validated
}

export function getLatestNeuroState(personId: string): NeuroAffectiveState {
  const existing = neuroStateCache.get(personId)
  if (existing) return existing

  const defaultState: NeuroAffectiveState = {
    id: randomUUID(),
    personId,
    timestamp: new Date().toISOString(),
    energyLevel: 'productive',
    stressIndex: 25,
    focusScore: 80,
    activeShields: [],
    recommendedAction: 'Trạng thái năng lượng ổn định. Sẵn sàng cho các mục tiêu thử thách.',
    schemaVersion: NEURO_SCHEMA_VERSION,
  }

  const validated = NeuroAffectiveStateSchema.parse(defaultState)
  neuroStateCache.set(personId, validated)
  return validated
}

export function toggleNeuroShield(
  personId: string,
  shield: ActiveShield,
  enabled: boolean,
): NeuroAffectiveState {
  const current = getLatestNeuroState(personId)
  const shieldsSet = new Set(current.activeShields)

  if (enabled) {
    shieldsSet.add(shield)
  } else {
    shieldsSet.delete(shield)
  }

  const updated: NeuroAffectiveState = {
    ...current,
    activeShields: Array.from(shieldsSet),
    timestamp: new Date().toISOString(),
  }

  const validated = NeuroAffectiveStateSchema.parse(updated)
  neuroStateCache.set(personId, validated)
  return validated
}
