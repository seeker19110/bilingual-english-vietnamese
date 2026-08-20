// packages/core-personal/remConsolidationService.ts — Động cơ Hợp nhất Trí nhớ Ngầm Tự trị (Autonomous REM Memory Consolidation Engine)
// Mô phỏng chu trình REM giấc ngủ: Nén ký ức ngày, tính toán suy giảm trí nhớ FSRS và chuẩn bị Morning Briefing đón đầu.

import { randomUUID } from 'node:crypto'

export interface RawDayMemory {
  id: string
  personId: string
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  content: string
  confidence: number
  importance: number // 1 -> 5
  timestamp: number
  isPrivate?: boolean
}

export interface ConsolidatedMemoryBlock {
  id: string
  personId: string
  domain: 'learning' | 'career' | 'work' | 'startup' | 'life'
  title: string
  coreInsights: string[]
  stabilityScore: number // Độ ổn định trí nhớ (theo FSRS S)
  retrievability: number // Khả năng nhớ lại hiện tại (theo FSRS R)
  recommendedReviewDate: string // YYYY-MM-DD
  consolidatedAt: number
}

export interface MorningBriefingDraft {
  personId: string
  greeting: string
  focusAreas: string[]
  suggestedAction: string
  motivationalHook: string
  date: string
}

export interface RemConsolidationReport {
  personId: string
  totalRawMemoriesProcessed: number
  blocksGenerated: number
  consolidatedBlocks: ConsolidatedMemoryBlock[]
  morningBriefing: MorningBriefingDraft
  executionTimeMs: number
}

/** Tính toán độ suy giảm trí nhớ R theo mô hình Ebbinghaus / FSRS: R = e^(-t / S) */
export function calculateRetentionDecay(daysElapsed: number, stabilityS: number): number {
  if (stabilityS <= 0) return 0
  const r = Math.exp(-daysElapsed / stabilityS)
  return Math.round(r * 100) / 100
}

/** Tính toán ngày ôn tập tối ưu tiếp theo khi độ nhớ R giảm xuống ngưỡng 90% (R_target = 0.9) */
export function calculateNextReviewIntervalDays(stabilityS: number, targetR: number = 0.9): number {
  if (stabilityS <= 0) return 1
  // R = e^(-t / S) => ln(R) = -t / S => t = -S * ln(R)
  const interval = -stabilityS * Math.log(targetR)
  return Math.max(1, Math.round(interval))
}

/** Chạy chu trình REM hợp nhất trí nhớ ngầm cho một ngày của học viên */
export function runRemMemoryConsolidation(
  personId: string,
  rawMemories: RawDayMemory[],
  targetDate: string = new Date().toISOString().split('T')[0] || '2026-08-20',
): RemConsolidationReport {
  const startTime = Date.now()

  // 1. Lọc bỏ các thông tin đánh dấu riêng tư
  const eligibleMemories = rawMemories.filter((m) => !m.isPrivate)

  // 2. Gom nhóm ký ức theo Domain
  const domainGroups = new Map<RawDayMemory['domain'], RawDayMemory[]>()
  for (const memory of eligibleMemories) {
    const list = domainGroups.get(memory.domain) || []
    list.push(memory)
    domainGroups.set(memory.domain, list)
  }

  const consolidatedBlocks: ConsolidatedMemoryBlock[] = []
  const focusAreas: string[] = []

  // 3. Nén và trích xuất Core Insights cho từng nhóm
  for (const [domain, items] of domainGroups.entries()) {
    if (items.length === 0) continue

    const avgImportance = items.reduce((acc, it) => acc + it.importance, 0) / items.length
    // Độ ổn định ban đầu tỷ lệ với tầm quan trọng và số lần nhắc lại
    const initialStability = Math.round((avgImportance * 1.5 + items.length * 0.8) * 10) / 10
    const intervalDays = calculateNextReviewIntervalDays(initialStability, 0.9)

    const reviewDate = new Date()
    reviewDate.setDate(reviewDate.getDate() + intervalDays)
    const reviewDateStr = reviewDate.toISOString().split('T')[0] || targetDate

    const coreInsights = items.map((it) => it.content)
    const blockTitle = getDomainBlockTitle(domain, items.length)

    consolidatedBlocks.push({
      id: `blk-${randomUUID()}`,
      personId,
      domain,
      title: blockTitle,
      coreInsights,
      stabilityScore: initialStability,
      retrievability: 1.0, // Vừa nạp nên R = 100%
      recommendedReviewDate: reviewDateStr,
      consolidatedAt: Date.now(),
    })

    focusAreas.push(`${getDomainNameVi(domain)}: ${coreInsights[0] || 'Ôn tập kiến thức'}`)
  }

  // 4. Sinh bản thảo Morning Briefing đón đầu
  const morningBriefing: MorningBriefingDraft = {
    personId,
    greeting: 'Chào buổi sáng! Hệ thống đã củng cố trí nhớ và chuẩn bị lộ trình cho bạn hôm nay.',
    focusAreas: focusAreas.length > 0 ? focusAreas : ['Duy trì nhịp học tập và phát triển cá nhân'],
    suggestedAction:
      consolidatedBlocks.length > 0
        ? `Ôn tập 10 phút về chủ đề: ${consolidatedBlocks[0]?.title}`
        : 'Bắt đầu ngày mới với một bài tập phát âm 5 phút.',
    motivationalHook:
      'Mỗi bước nhỏ đều đưa bạn đến gần hơn với mục tiêu tự chủ ngôn ngữ và sự nghiệp.',
    date: targetDate,
  }

  const executionTimeMs = Math.max(1, Date.now() - startTime)

  return {
    personId,
    totalRawMemoriesProcessed: eligibleMemories.length,
    blocksGenerated: consolidatedBlocks.length,
    consolidatedBlocks,
    morningBriefing,
    executionTimeMs,
  }
}

function getDomainNameVi(domain: RawDayMemory['domain']): string {
  switch (domain) {
    case 'learning':
      return 'Học tập'
    case 'career':
      return 'Sự nghiệp'
    case 'work':
      return 'Công việc'
    case 'startup':
      return 'Khởi nghiệp'
    case 'life':
      return 'Đời sống'
    default:
      return 'Tổng quan'
  }
}

function getDomainBlockTitle(domain: RawDayMemory['domain'], itemCount: number): string {
  switch (domain) {
    case 'learning':
      return `Tổng hợp Kiến thức & Phát âm (${itemCount} điểm chạm)`
    case 'career':
      return `Khoảng cách Kỹ năng & Cơ hội Nghề nghiệp (${itemCount} ghi nhận)`
    case 'work':
      return `Tiến độ Dự án & Hành động Cần làm (${itemCount} nhiệm vụ)`
    case 'startup':
      return `Kiểm chứng Giả thuyết & Khách hàng (${itemCount} ghi chú)`
    case 'life':
      return `Thói quen & Nhịp sinh học (${itemCount} điểm lưu ý)`
    default:
      return `Tổng hợp Trí nhớ (${itemCount} mục)`
  }
}
