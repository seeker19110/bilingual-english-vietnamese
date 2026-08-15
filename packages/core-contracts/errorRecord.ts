// packages/core-contracts/errorRecord.ts — Contract cho "Error" (Phase 07 Error Memory,
// docs/phases/07-error-memory.md). 1 LỖI CỤ THỂ học viên mắc phải (câu sai → câu đúng), khác
// Evidence (Evidence chỉ ghi đúng/sai, ErrorRecord ghi CHI TIẾT lỗi để nhắc lại sau — nguyên liệu
// cho "spaced repetition trên lỗi hay mắc" mà curriculum hiện tại CHƯA có).
//
// Đặt tên `ErrorRecord` (không phải `Error`) để tránh đụng `Error` built-in của JS/TS và
// `AppError`/lớp con ở packages/core-errors/appError.ts (Phase 01) — 2 khái niệm khác hẳn nhau:
// `AppError` là lỗi HẠ TẦNG/API (status HTTP), `ErrorRecord` là lỗi NGÔN NGỮ học viên mắc phải.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const ERROR_RECORD_SCHEMA_VERSION = 1

export const ErrorCategorySchema = z.enum([
  'grammar',
  'vocabulary',
  'pronunciation',
  'spelling',
  'other',
])

export const ErrorRecordSchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    // Optional — không phải lỗi nào cũng gắn được với 1 Skill cụ thể (vd lỗi lạc đề, câu quá lan
    // man mà AI chấm chưa phân loại được thuộc kỹ năng nào).
    skillId: UuidSchema.optional(),
    category: ErrorCategorySchema,
    original: z.string().min(1).max(1000),
    corrected: z.string().min(1).max(1000),
    explanation: z.string().min(1).max(1000),
    occurredAt: IsoDateTimeSchema,
  },
  ERROR_RECORD_SCHEMA_VERSION,
)

export type ErrorRecord = z.infer<typeof ErrorRecordSchema>
