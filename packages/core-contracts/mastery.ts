// packages/core-contracts/mastery.ts — Contract cho "Mastery" (Phase 08 Mastery Engine,
// docs/phases/08-mastery-engine.md). Trạng thái THÀNH THẠO hiện tại của 1 learner với 1 skill —
// kết quả TÍCH LUỸ từ nhiều Evidence theo thời gian (nguyên tắc #2 MASTER_SPEC.md: Evidence đi
// TRƯỚC, Mastery chỉ được đổi SAU khi có Evidence — không engine nào được ghi thẳng vào Mastery).
//
// `dueAt` (optional) là điểm nối sang Phase 19 Adaptive SRS — thời điểm nên ôn lại theo mô hình
// quên lãng, tương tự cơ chế SRS hiện có (`apps/english/src/lib/srs.ts`) nhưng áp cho cả SKILL,
// không chỉ từng từ vựng đơn lẻ.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const MASTERY_SCHEMA_VERSION = 1

export const MasterySchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    skillId: UuidSchema,
    // Mức thành thạo 0 (chưa biết) – 1 (thành thạo hoàn toàn).
    level: z.number().min(0).max(1),
    // Độ tin cậy của con số `level` — càng nhiều Evidence quan sát được thì confidence càng cao;
    // KHÁC `level` (2 trục độc lập: "giỏi tới đâu" vs "chắc chắn tới đâu về con số đó").
    confidence: z.number().min(0).max(1),
    lastReviewedAt: IsoDateTimeSchema,
    dueAt: IsoDateTimeSchema.optional(),
    updatedAt: IsoDateTimeSchema,
  },
  MASTERY_SCHEMA_VERSION,
)

export type Mastery = z.infer<typeof MasterySchema>
