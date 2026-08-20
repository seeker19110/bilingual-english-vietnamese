// packages/core-personal/cognitiveLoadRegulator.ts — Bộ Tự Động Điều Tiết Tải Nhận Thức & Trạng Thái Dòng Chảy (Cognitive Load & Flow State Engine)
// Dựa trên lý thuyết Flow State (Mihaly Csikszentmihalyi) & Cognitive Load Theory (Sweller)

export interface CognitiveTelemetrySample {
  responseLatencyMs: number // Thời gian suy nghĩ trước khi trả lời
  revisionCount: number // Số lần gõ rồi xóa/chỉnh sửa câu
  hesitationPauses: number // Số đoạn ngắt quãng > 2 giây khi nói/viết
  errorRateRecent: number // Tỷ lệ sai sót trong 5 câu gần nhất (0.0 -> 1.0)
  targetDifficulty: number // 1 -> 10
}

export type CognitiveState = 'flow' | 'overload' | 'anxiety' | 'boredom' | 'relaxed'

export interface CognitiveLoadAssessment {
  cognitiveLoadIndex: number // 0.0 -> 1.0 (0.0: rất nhàn rỗi, 1.0: quá tải nghiêm trọng)
  state: CognitiveState
  flowScore: number // 0.0 -> 1.0 (Mức độ chìm đắm trong trạng thái tối ưu)
  recommendedIntervention: {
    action: 'maintain' | 'simplify' | 'scaffold_hint' | 'increase_challenge' | 'micro_break'
    rationale: string
    suggestedDifficultyDelta: number // -2, -1, 0, +1, +2
  }
}

/** Tính toán chỉ số tải nhận thức Cognitive Load Index (CLI) từ các chỉ số vi hành vi (Micro-behaviors) */
export function calculateCognitiveLoadIndex(sample: CognitiveTelemetrySample): number {
  // Chuẩn hóa response latency (chuẩn 1.5s -> 8s)
  const normLatency = Math.min(1.0, Math.max(0.0, (sample.responseLatencyMs - 1500) / 6500))
  // Chuẩn hóa revision count (0 -> 4 lần)
  const normRevisions = Math.min(1.0, sample.revisionCount / 4)
  // Chuẩn hóa hesitation pauses (0 -> 3 lần)
  const normPauses = Math.min(1.0, sample.hesitationPauses / 3)
  // Error rate
  const normError = Math.min(1.0, sample.errorRateRecent)

  // Trọng số kết hợp
  const rawCli = normLatency * 0.3 + normRevisions * 0.25 + normPauses * 0.2 + normError * 0.25
  return Math.min(1.0, Math.max(0.0, Math.round(rawCli * 100) / 100))
}

/** Đánh giá trạng thái nhận thức và đề xuất can thiệp Sư phạm để bảo vệ Trạng thái Dòng chảy (Flow State) */
export function assessCognitiveState(sample: CognitiveTelemetrySample): CognitiveLoadAssessment {
  const cli = calculateCognitiveLoadIndex(sample)

  // Đánh giá trạng thái
  let state: CognitiveState
  let flowScore: number
  let action: CognitiveLoadAssessment['recommendedIntervention']['action']
  let rationale: string
  let suggestedDifficultyDelta: number

  if (cli >= 0.75) {
    state = sample.errorRateRecent > 0.6 ? 'overload' : 'anxiety'
    flowScore = 0.25
    if (sample.hesitationPauses >= 3 || sample.errorRateRecent >= 0.8) {
      action = 'micro_break'
      rationale =
        'Phát hiện dấu hiệu mệt mỏi nhận thức hoặc căng thẳng cao. Đề xuất nghỉ 30 giây thư giãn.'
      suggestedDifficultyDelta = -2
    } else {
      action = 'scaffold_hint'
      rationale =
        'Học viên đang gặp khó khăn với cấu trúc hiện tại. Cung cấp gợi ý gợi mở Socratic và giảm tải độ khó.'
      suggestedDifficultyDelta = -1
    }
  } else if (cli <= 0.25) {
    state = sample.errorRateRecent < 0.1 ? 'boredom' : 'relaxed'
    flowScore = 0.5
    action = 'increase_challenge'
    rationale =
      'Tốc độ phản xạ rất nhanh và độ chính xác tuyệt đối. Tăng độ khó bài tập để kích thích thử thách mới.'
    suggestedDifficultyDelta = +1
  } else {
    state = 'flow'
    // Flow Score cao nhất khi CLI ở vùng cân bằng lý tưởng [0.4, 0.6]
    flowScore = Math.round((1.0 - Math.abs(cli - 0.5) * 1.5) * 100) / 100
    action = 'maintain'
    rationale =
      'Học viên đang ở trạng thái dòng chảy (Flow State) tối ưu giữa kỹ năng và độ khó thử thách.'
    suggestedDifficultyDelta = 0
  }

  return {
    cognitiveLoadIndex: cli,
    state,
    flowScore: Math.min(1.0, Math.max(0.0, flowScore)),
    recommendedIntervention: {
      action,
      rationale,
      suggestedDifficultyDelta,
    },
  }
}
