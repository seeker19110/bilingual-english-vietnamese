// packages/core-contracts/intake.ts — Contract cho LUỒNG NGƯỜI MỚI (5 câu ~90 giây).
// Đặc tả: docs/research/luong-nguoi-moi-ho-so-nang-luc-an-2026-08-23.md
//
// Kiến trúc 3 lớp: HỎI (người dùng thấy) → HỒ SƠ ẨN (không thấy) → GỢI Ý (thấy, đúng MỘT việc).
// File này định nghĩa lớp HỎI và lớp GỢI Ý. Lớp giữa cố ý KHÔNG có kiểu xuất ra ngoài — nó không
// được phép rò lên giao diện.

import { z } from 'zod'

export const INTAKE_SCHEMA_VERSION = 1

/** Câu 1 — nhóm tuổi. Dùng lại đúng 4 nhóm nền tảng đã có (migration 0002), không tạo hệ mới. */
export const AgeGroupSchema = z.enum(['nhi_dong', 'thieu_nien', 'thanh_nien', 'nguoi_lon'])
export type AgeGroup = z.infer<typeof AgeGroupSchema>

/** Câu 2 — "Dạo này điều gì chiếm nhiều tâm trí bạn nhất?" */
export const FocusSchema = z.enum([
  'hoc_thi',
  'cong_viec',
  'suc_khoe',
  'tien_bac',
  'quan_he',
  'chua_ro',
])
export type Focus = z.infer<typeof FocusSchema>

/** Câu 5 — "Lần gần nhất bạn tự học xong một thứ mới là khi nào?" (đà học hiện tại) */
export const LearningMomentumSchema = z.enum(['tuan_nay', 'vai_thang', 'lau_roi', 'khong_nho'])
export type LearningMomentum = z.infer<typeof LearningMomentumSchema>

/**
 * Câu trả lời của 5 câu hỏi.
 *
 * MỌI trường đều tuỳ chọn: đặc tả yêu cầu bỏ qua câu nào cũng được, bỏ qua chỉ làm giảm độ tin cậy
 * chứ không chặn luồng. Người bỏ hết 5 câu vẫn vào được app.
 */
export const IntakeAnswersSchema = z
  .object({
    ageGroup: AgeGroupSchema.optional(),
    focus: FocusSchema.optional(),
    /** Câu 3 — "Nếu mỗi ngày có thêm một giờ, bạn dùng vào việc gì?" */
    extraHour: z.string().trim().max(200).optional(),
    /** Câu 4 — "Việc gì bạn làm mà quên mất thời gian?" (tín hiệu năng khiếu tự phát) */
    flowActivity: z.string().trim().max(200).optional(),
    lastLearned: LearningMomentumSchema.optional(),
  })
  .strict()
export type IntakeAnswers = z.infer<typeof IntakeAnswersSchema>

/**
 * Một việc được gợi ý.
 *
 * `why` PHẢI trích lại lời người dùng khi có (đặc tả mục 5.1): "Bạn bảo hay quên thời gian khi
 * vẽ…" chứ không phải "Dựa trên hồ sơ, năng lực sáng tạo của bạn đạt 72/100…". Cùng một suy luận,
 * nhưng cách đầu làm người ta thấy được lắng nghe, cách sau làm người ta thấy bị đo.
 */
export const SuggestionSchema = z
  .object({
    id: z.string().min(1).max(60),
    title: z.string().min(1).max(160),
    why: z.string().min(1).max(400),
  })
  .strict()
export type Suggestion = z.infer<typeof SuggestionSchema>

/**
 * Kết quả trả cho giao diện.
 *
 * Đúng MỘT việc nổi bật + tối đa 2 lựa chọn thu gọn. Ba là trần cứng, không phải giới hạn kỹ
 * thuật: quá 3 mục tiêu cùng lúc thì tỷ lệ hoàn thành sụp.
 *
 * KHÔNG có trường điểm số, thang bậc, hay phần trăm nào ở đây — và không được phép thêm.
 */
export const IntakeResultSchema = z
  .object({
    schemaVersion: z.literal(INTAKE_SCHEMA_VERSION),
    primary: SuggestionSchema,
    alternatives: z.array(SuggestionSchema).max(2),
  })
  .strict()
export type IntakeResult = z.infer<typeof IntakeResultSchema>
