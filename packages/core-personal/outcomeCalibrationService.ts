// packages/core-personal/outcomeCalibrationService.ts — Động cơ đối soát và hiệu chuẩn quyết định
// Phân tích độ lệch giữa Expected Outcomes và Actual Outcomes để tinh chỉnh trọng số đề xuất của Companion.

import type { Pool } from 'pg'
import { listDecisions } from './decisionLedgerService.js'

export interface DomainCalibrationStat {
  domain: string
  totalDecisions: number
  reviewedDecisions: number
  matchedCount: number
  unmatchedCount: number
  successRate: number // 0.0 -> 1.0
}

export interface CalibrationInsight {
  type: 'positive' | 'warning' | 'info'
  title: string
  detail: string
  domain?: string
}

export interface OutcomeCalibrationReport {
  personId: string
  totalDecisions: number
  decidedCount: number
  reviewedCount: number
  pendingReviewCount: number
  overallSuccessRate: number // 0.0 -> 1.0
  calibrationScore: number // 0 -> 100
  domainStats: DomainCalibrationStat[]
  insights: CalibrationInsight[]
  generatedAt: string
}

export async function calculateOutcomeCalibration(
  pool: Pool,
  personId: string,
): Promise<OutcomeCalibrationReport> {
  const decisions = await listDecisions(pool, personId)

  let decidedCount = 0
  let reviewedCount = 0
  let pendingReviewCount = 0
  let totalMatched = 0
  let totalUnmatched = 0

  const domainMap = new Map<
    string,
    { total: number; reviewed: number; matched: number; unmatched: number }
  >()

  const now = Date.now()

  for (const dec of decisions) {
    const domain = dec.domain || 'general'
    if (!domainMap.has(domain)) {
      domainMap.set(domain, { total: 0, reviewed: 0, matched: 0, unmatched: 0 })
    }
    const stat = domainMap.get(domain)!
    stat.total++

    if (dec.status === 'decided' || dec.status === 'reviewed') {
      decidedCount++
    }

    if (dec.status === 'reviewed') {
      reviewedCount++
      stat.reviewed++
    }

    // Kiểm tra xem có quyết định nào đang chờ review không (có reviewAt trong quá khứ)
    if (dec.status === 'decided' && dec.reviewAt) {
      const reviewTime = new Date(dec.reviewAt).getTime()
      if (reviewTime <= now) {
        pendingReviewCount++
      }
    }

    // Phân tích kết quả thực tế
    if (dec.actualOutcomes && dec.actualOutcomes.length > 0) {
      for (const outcome of dec.actualOutcomes) {
        if (outcome.matchedExpectation) {
          totalMatched++
          stat.matched++
        } else {
          totalUnmatched++
          stat.unmatched++
        }
      }
    }
  }

  const totalObserved = totalMatched + totalUnmatched
  const overallSuccessRate =
    totalObserved > 0 ? Math.round((totalMatched / totalObserved) * 100) / 100 : 1.0

  // Calibration score tính theo tỷ lệ review + độ chính xác
  const reviewCompleteness =
    decidedCount > 0 ? Math.min(1, (reviewedCount + totalObserved) / decidedCount) : 1
  const calibrationScore = Math.round((overallSuccessRate * 0.7 + reviewCompleteness * 0.3) * 100)

  const domainStats: DomainCalibrationStat[] = Array.from(domainMap.entries()).map(
    ([domain, s]) => {
      const dTotalObs = s.matched + s.unmatched
      const dSuccessRate = dTotalObs > 0 ? Math.round((s.matched / dTotalObs) * 100) / 100 : 1.0
      return {
        domain,
        totalDecisions: s.total,
        reviewedDecisions: s.reviewed,
        matchedCount: s.matched,
        unmatchedCount: s.unmatched,
        successRate: dSuccessRate,
      }
    },
  )

  const insights: CalibrationInsight[] = []

  if (pendingReviewCount > 0) {
    insights.push({
      type: 'warning',
      title: 'Quyết định đến hạn đánh giá',
      detail: `Bạn có ${pendingReviewCount} quyết định đã đến hạn kiểm tra kết quả thực tế trong Sổ bộ Quyết định.`,
    })
  }

  if (totalObserved >= 3) {
    if (overallSuccessRate >= 0.8) {
      insights.push({
        type: 'positive',
        title: 'Độ chính xác ra quyết định xuất sắc',
        detail: `Hơn ${Math.round(overallSuccessRate * 100)}% các kết quả thực tế đạt đúng như kỳ vọng ban đầu của bạn.`,
      })
    } else if (overallSuccessRate < 0.5) {
      insights.push({
        type: 'info',
        title: 'Cần hiệu chỉnh giả định',
        detail:
          'Một số quyết định gần đây chưa đạt kỳ vọng. AI sẽ tự động điều chỉnh tăng thời gian dự phòng cho các kế hoạch tương lai.',
      })
    }
  } else {
    insights.push({
      type: 'info',
      title: 'Đang tích lũy dữ liệu đối soát',
      detail:
        'Hãy tiếp tục ghi nhận các quyết định quan trọng để Bạn Đồng Hành học hỏi và tư vấn chính xác hơn.',
    })
  }

  return {
    personId,
    totalDecisions: decisions.length,
    decidedCount,
    reviewedCount,
    pendingReviewCount,
    overallSuccessRate,
    calibrationScore,
    domainStats,
    insights,
    generatedAt: new Date().toISOString(),
  }
}
