// packages/core-contracts/examPlan.ts — Contract "Kế hoạch ôn thi".
//
// Đặc tả: docs/research/dac-ta-che-do-on-thi-2026-08-26.md

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const EXAM_PLAN_SCHEMA_VERSION = 1

/**
 * Mở thêm kỳ thi là quyết định SẢN PHẨM (mục 3 đặc tả), không phải thêm chuỗi.
 *
 * - `vao10-english` — chiều A (người Việt học tiếng Anh): thi vào lớp 10 môn Tiếng Anh.
 * - `vsl-b1` — chiều B (người nước ngoài học tiếng Việt): chứng chỉ tiếng Việt bậc 3 (B1) theo
 *   Khung năng lực tiếng Việt dùng cho người nước ngoài (Thông tư 17/2015/TT-BGDĐT).
 *
 * ⚠️ Giới hạn ĐÃ BIẾT của `vsl-b1`, nói thẳng chứ không giấu: phạm vi ôn hiện dùng lại chính bộ
 * cặp từ Anh–Việt A1–B1 của app (học ngược chiều), vì repo chưa có bộ từ vựng tiếng Việt phân
 * bậc riêng. Bậc hiển thị vì vậy là bậc CEFR của phía tiếng Anh, KHÔNG phải bậc tiếng Việt thật.
 * Trang `/on-thi` nói rõ điều này cho người học. Gỡ giới hạn = soạn bộ từ tiếng Việt phân bậc,
 * là một đợt NỘI DUNG riêng (xem nợ kỹ thuật trong PROGRESS.md).
 */
export const ExamKindSchema = z.enum(['vao10-english', 'vsl-b1'])
export type ExamKind = z.infer<typeof ExamKindSchema>

export const ExamPlanStatusSchema = z.enum(['active', 'expired', 'archived'])

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải dạng YYYY-MM-DD')

export const ExamPlanSchema = versionedObject(
  {
    id: UuidSchema,
    userId: UuidSchema,
    examKind: ExamKindSchema,
    examDate: DateStringSchema,
    /** Người học tự ghi ('7 điểm'). Không dùng để chấm bất cứ thứ gì. */
    targetLabel: z.string().max(60).optional(),
    scopeItems: z.number().int().min(0),
    dailyCapItems: z.number().int().min(0).max(200),
    /** 0 = chủ nhật … 6 = thứ bảy. */
    restDays: z.array(z.number().int().min(0).max(6)).max(7),
    status: ExamPlanStatusSchema,
    createdAt: IsoDateTimeSchema,
  },
  EXAM_PLAN_SCHEMA_VERSION,
)
export type ExamPlan = z.infer<typeof ExamPlanSchema>

/**
 * Body tạo kế hoạch. `userId` KHÔNG có ở đây — luôn suy từ token.
 *
 * `scopeItems` do CLIENT tính rồi gửi lên, không phải server tự tính: dữ liệu từ vựng/CEFR nằm ở
 * `apps/dhcb/src/data` (client), server không có bản sao. Con số này chỉ để HIỂN THỊ và chia
 * khối lượng — không cấp quyền, không tính tiền — nên client tính là chấp nhận được; nếu sau này
 * nó ảnh hưởng tới quyền/hạn mức thì phải chuyển về server (luật "không tin client", mục 4.2).
 */
export const CreateExamPlanSchema = z
  .object({
    examKind: ExamKindSchema,
    examDate: DateStringSchema,
    scopeItems: z.number().int().min(0).max(100_000),
    targetLabel: z.string().trim().max(60).optional(),
    dailyCapItems: z.number().int().min(1).max(200).optional(),
    restDays: z.array(z.number().int().min(0).max(6)).max(7).optional(),
  })
  .strict()
export type CreateExamPlanInput = z.infer<typeof CreateExamPlanSchema>
