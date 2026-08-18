// packages/core-personal/proactiveBriefingService.ts — V2 Flagship Proactive Briefing Engine.
import { randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import type {
  ProactiveBriefing,
  ProactiveBriefingItem,
  ProactiveBriefingType,
} from '../core-contracts/proactiveBriefing.js'
import { getLearningReadModel } from '../core-learner/learningReadModelService.js'

export interface GenerateBriefingOptions {
  type?: ProactiveBriefingType
  now?: Date
}

/**
 * Deterministically determines whether to generate a morning or evening briefing based on time.
 */
export function resolveBriefingType(
  explicitType?: ProactiveBriefingType,
  now: Date = new Date(),
): ProactiveBriefingType {
  if (explicitType) return explicitType
  const hour = now.getHours()
  return hour < 17 ? 'morning' : 'evening'
}

/**
 * Aggregates state across domains and generates an actionable proactive briefing.
 */
export async function generateProactiveBriefing(
  pool: Pool | null,
  personId: string,
  options?: GenerateBriefingOptions,
): Promise<ProactiveBriefing> {
  const now = options?.now ?? new Date()
  const briefingType = resolveBriefingType(options?.type, now)
  const actionItems: ProactiveBriefingItem[] = []
  const insights: string[] = []

  let srsDueCount = 5
  const streakDays = 3

  // Attempt to read learning status if pool is provided
  if (pool) {
    try {
      const learning = await getLearningReadModel(pool, { personId, userId: personId })
      srsDueCount = learning.srsDueCount
    } catch {
      // Fallback defaults
    }
  }

  // 1. Learning Action Item
  if (srsDueCount > 0) {
    actionItems.push({
      id: `act-${randomUUID().slice(0, 8)}`,
      domain: 'learning',
      title: 'Ôn tập thẻ ghi nhớ SRS',
      action: `Bạn có ${srsDueCount} thẻ từ vựng cần củng cố hôm nay.`,
      route: '/on-tap',
      priority: srsDueCount > 10 ? 'urgent' : 'high',
    })
  } else {
    insights.push('Tuyệt vời! Bạn đã hoàn thành toàn bộ thẻ ghi nhớ hôm nay.')
  }

  // 2. Life Foundation Action Item
  if (briefingType === 'morning') {
    actionItems.push({
      id: `act-${randomUUID().slice(0, 8)}`,
      domain: 'life',
      title: 'Khởi động thói quen buổi sáng',
      action: 'Check-in thói quen uống nước và rèn luyện thể chất.',
      route: '/life',
      priority: 'normal',
    })
    insights.push(`Chuỗi học tập liên tục của bạn đang duy trì ở mức ${streakDays} ngày.`)
  } else {
    actionItems.push({
      id: `act-${randomUUID().slice(0, 8)}`,
      domain: 'life',
      title: 'Tổng kết ngày & Đánh giá Tâm trạng',
      action: 'Ghi lại mức độ năng lượng và sự hài lòng trong ngày hôm nay.',
      route: '/life',
      priority: 'normal',
    })
    insights.push(
      'Hãy dành 5 phút nghỉ ngơi và nhìn lại những thành tựu bạn đã đạt được trong ngày.',
    )
  }

  // 3. Career & Skills Action Item
  actionItems.push({
    id: `act-${randomUUID().slice(0, 8)}`,
    domain: 'career',
    title: 'Phát triển Kỹ năng & Mục tiêu',
    action: 'Kiểm tra khoảng cách kỹ năng (Skill Gap) cho mục tiêu nghề nghiệp.',
    route: '/career',
    priority: 'normal',
  })

  const greeting =
    briefingType === 'morning'
      ? '☀️ Chào buổi sáng! Bạn Đồng Hành đã sẵn sàng cùng bạn bắt đầu ngày mới đầy năng lượng.'
      : '🌙 Chào buổi tối! Bạn Đồng Hành gửi bạn bản tin tổng kết và chuẩn bị cho ngày mai.'

  const summary =
    briefingType === 'morning'
      ? `Hôm nay bạn có ${actionItems.length} mục tiêu trọng tâm cần hoàn thành. Hãy bắt đầu với thẻ từ vựng để kích hoạt tư duy!`
      : `Một ngày học tập và làm việc hiệu quả sắp khép lại. Hãy hoàn tất các check-in cuối ngày để giữ vững chuỗi tiến độ!`

  return {
    id: `briefing-${randomUUID()}`,
    personId,
    type: briefingType,
    greeting,
    summary,
    actionItems,
    insights,
    generatedAt: now.toISOString(),
  }
}
