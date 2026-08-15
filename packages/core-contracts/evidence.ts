// packages/core-contracts/evidence.ts — Contract cho "Evidence" (Phase 06 Evidence Engine,
// docs/phases/06-evidence-engine.md). 1 quan sát THẬT (đúng/sai 1 lần) làm căn cứ cập nhật
// Mastery — nguyên tắc kiến trúc #2 của MASTER_SPEC.md: "Evidence precedes state changes"
// (không được đổi Mastery mà không có Evidence đứng sau). `source` liệt kê đúng các luồng SINH
// RA quan sát hiện có trong app (chat/writing/speaking đã có trong `CallMode` ở
// apps/english/src/lib/ai.ts; srs_review khớp `apps/english/src/lib/srs.ts`).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const EVIDENCE_SCHEMA_VERSION = 1

export const EvidenceSourceSchema = z.enum([
  'chat',
  'writing',
  'speaking',
  'srs_review',
  'exam',
  'challenge',
])

export const EvidenceSchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    skillId: UuidSchema,
    source: EvidenceSourceSchema,
    // true = học viên làm ĐÚNG quan sát này (vd trả lời SRS đúng, không mắc lỗi ngữ pháp đó
    // trong câu vừa nói) — nguyên liệu thô cho Mastery Engine (Phase 08) tính điểm.
    correct: z.boolean(),
    // Điểm liên tục 0–1 khi có (vd điểm phát âm) — optional vì nhiều nguồn evidence chỉ có
    // đúng/sai nhị phân (vd SRS review), không phải lúc nào cũng đo được điểm liên tục.
    rawScore: z.number().min(0).max(1).optional(),
    sessionId: UuidSchema.optional(),
    observedAt: IsoDateTimeSchema,
  },
  EVIDENCE_SCHEMA_VERSION,
)

export type Evidence = z.infer<typeof EvidenceSchema>
