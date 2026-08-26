// packages/core-examplan/examPlan.ts — LẬP LỊCH NGƯỢC TỪ NGÀY THI.
//
// Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md (mục 5).
//
// VÌ SAO KHÔNG CÓ AI Ở ĐÂY: lập lịch là bài toán tất định, kiểm chứng được bằng test. Đưa AI vào
// thì mỗi lần mở app ra một lịch khác nhau (người học mất niềm tin) và tốn token cho việc số học.
// Cùng quyết định đã chốt cho engine chấm: không có AI trong luồng chấm/lập lịch.
//
// VÌ SAO CẦN LỚP NÀY khi đã có FSRS: FSRS lập lịch để giữ khả năng nhớ ở mức `request_retention`
// VÔ THỜI HẠN. Ôn thi thì khác — chỉ cần nhớ ĐÚNG VÀO NGÀY X. Lớp này quy đổi khoảng cách tới
// ngày thi thành (a) khối lượng mỗi ngày và (b) mức retention nên đặt cho FSRS.
//
// Toàn bộ hàm THUẦN: không DB, không mạng, không `Date.now()` ẩn — mọi mốc thời gian đi vào qua
// tham số để test tái lập được. Dùng chung client lẫn server.

import { addDays } from '@dhcb/core-db/date'

export interface ExamPlanInput {
  /** 'YYYY-MM-DD' theo giờ Việt Nam (vnDateStr) — KHÔNG dùng ngày UTC. */
  today: string
  examDate: string
  /** Tổng số mục phải nắm (từ vựng + điểm ngữ pháp) trong phạm vi kỳ thi. */
  scopeItems: number
  masteredItems: number
  /** Số thẻ SRS đến hạn hôm nay — nợ cũ, luôn được trả trước việc học mới. */
  dueToday: number
  /** Trần mỗi ngày người học tự đặt (mặc định theo tốc độ 5/10/20 đã chọn ở Hồ sơ). */
  dailyCapItems: number
  /** Thứ trong tuần xin nghỉ: 0 = chủ nhật … 6 = thứ bảy (khớp Date#getUTCDay). */
  restDays: number[]
}

export type ExamPhase = 'build' | 'consolidate' | 'taper'
export type Feasibility = 'comfortable' | 'tight' | 'not-feasible'

export interface ExamPlanOutput {
  daysLeft: number
  effectiveDaysLeft: number
  todayNewItems: number
  todayReviewItems: number
  phase: ExamPhase
  feasibility: Feasibility
  /** Chỉ khác null khi `not-feasible`: số mục nên CẮT khỏi phạm vi để kịp. */
  suggestedScopeCut: number | null
  /** Truyền cho FSRS (`request_retention`). */
  requestRetention: number
}

/** Ngày thi đã qua → kế hoạch hết hiệu lực; nơi gọi chuyển trạng thái sang `expired`. */
export class ExamDatePassedError extends Error {
  constructor() {
    super('Ngày thi đã qua')
    this.name = 'ExamDatePassedError'
  }
}

// Mốc chia giai đoạn, tính bằng số ngày LỊCH còn lại (không trừ ngày nghỉ — cảm nhận "còn mấy
// ngày nữa thi" của người học là ngày lịch).
const CONSOLIDATE_FROM_DAYS = 14
const TAPER_FROM_DAYS = 3

// FSRS `request_retention` theo giai đoạn. Càng gần ngày thi càng dày lịch ôn, để thẻ "vừa đủ
// nhớ" được kéo về TRƯỚC ngày thi thay vì rơi vào sau đó.
const RETENTION_BY_PHASE: Record<ExamPhase, number> = {
  build: 0.9,
  consolidate: 0.93,
  taper: 0.95,
}

const MS_DAY = 86_400_000

function dayDiff(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime()
  const b = new Date(`${to}T00:00:00Z`).getTime()
  return Math.round((b - a) / MS_DAY)
}

export function phaseOf(daysLeft: number): ExamPhase {
  if (daysLeft <= TAPER_FROM_DAYS) return 'taper'
  if (daysLeft <= CONSOLIDATE_FROM_DAYS) return 'consolidate'
  return 'build'
}

/**
 * Số ngày HỌC ĐƯỢC từ hôm nay tới ngày thi (tính cả hai đầu), đã trừ ngày nghỉ trong tuần.
 *
 * Luôn ≥ 1: ngày thi vẫn còn buổi sáng để ôn, và quan trọng hơn — không bao giờ chia cho 0.
 * Người học chọn nghỉ cả 7 ngày trong tuần cũng không làm hỏng phép chia (nơi gọi tự cảnh báo
 * cấu hình vô lý bằng `hasNoStudyDay`).
 */
export function effectiveDaysLeft(today: string, examDate: string, restDays: number[]): number {
  const rest = new Set(restDays)
  const total = dayDiff(today, examDate)
  let count = 0
  for (let i = 0; i <= total; i++) {
    const d = addDays(today, i)
    if (!rest.has(new Date(`${d}T00:00:00Z`).getUTCDay())) count++
  }
  return Math.max(1, count)
}

/** Người học đã chọn nghỉ mọi ngày trong tuần — cấu hình vô lý, giao diện phải nói ra. */
export function hasNoStudyDay(restDays: number[]): boolean {
  return new Set(restDays).size >= 7
}

export function buildExamPlan(input: ExamPlanInput): ExamPlanOutput {
  const daysLeft = dayDiff(input.today, input.examDate)
  if (daysLeft < 0) throw new ExamDatePassedError()

  const phase = phaseOf(daysLeft)
  const effective = effectiveDaysLeft(input.today, input.examDate, input.restDays)

  // Nợ cũ trả trước: ôn luôn được ưu tiên hơn học mới, và không vượt trần ngày.
  const todayReviewItems = Math.min(Math.max(0, input.dueToday), Math.max(0, input.dailyCapItems))
  const roomForNew = Math.max(0, input.dailyCapItems - todayReviewItems)

  const remaining = Math.max(0, input.scopeItems - input.masteredItems)
  const neededPerDay = Math.ceil(remaining / effective)

  // Giai đoạn taper (T-3 → T-0): KHÔNG thêm mục mới. Nhồi kiến thức mới sát ngày thi làm hỏng cả
  // phần đã thuộc — đây là quyết định sư phạm, không phải tối ưu số học.
  const todayNewItems = phase === 'taper' ? 0 : Math.min(neededPerDay, roomForNew)

  const feasibility = judgeFeasibility(neededPerDay, roomForNew, remaining)
  const suggestedScopeCut =
    feasibility === 'not-feasible' ? Math.max(0, remaining - roomForNew * effective) : null

  return {
    daysLeft,
    effectiveDaysLeft: effective,
    todayNewItems,
    todayReviewItems,
    phase,
    feasibility,
    suggestedScopeCut,
    requestRetention: RETENTION_BY_PHASE[phase],
  }
}

// Ngưỡng "sát nút": cần dùng trên 80% chỗ trống mỗi ngày thì coi là căng — còn chỗ nhưng chỉ cần
// ốm một hôm là trượt kế hoạch, người học nên biết trước.
const TIGHT_RATIO = 0.8

function judgeFeasibility(
  neededPerDay: number,
  roomForNew: number,
  remaining: number,
): Feasibility {
  if (remaining === 0) return 'comfortable'
  if (neededPerDay > roomForNew) return 'not-feasible'
  if (roomForNew > 0 && neededPerDay / roomForNew >= TIGHT_RATIO) return 'tight'
  return 'comfortable'
}
