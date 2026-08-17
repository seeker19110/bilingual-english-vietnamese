// packages/core-contracts/decisionRecord.ts — Contract cho "DecisionRecord" (V2-02). Hình thức
// hoá đúng interface đã có sẵn ở `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 8
// "Decision Ledger" thành Zod schema — không tự thiết kế lại field.
//
// "Decision Ledger không ghi toàn bộ chat. Nó lưu decision artifact có cấu trúc và provenance"
// (mục 8) — `assumptions`/`evidence` dùng `EvidenceRef` (id trỏ tới nguồn, không copy nội dung
// thô vào đây, tránh trùng lặp dữ liệu với Evidence engine của Learning domain hoặc nguồn khác).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const DECISION_RECORD_SCHEMA_VERSION = 1

export const DecisionStatusSchema = z.enum([
  'open',
  'decided',
  'review_due',
  'reviewed',
  'superseded',
])

// `EvidenceRef` — tham chiếu tới 1 nguồn bằng chứng, không phải bản sao nội dung. `sourceType` tự
// do (vd "learning_evidence", "personal_fact", "external_document") vì Decision Ledger có thể
// tham chiếu bằng chứng từ BẤT KỲ domain nào, không riêng Learning.
export const EvidenceRefSchema = z
  .object({
    sourceType: z.string().min(1).max(100),
    sourceId: UuidSchema,
    note: z.string().max(500).optional(),
  })
  .strict()

const OptionSchema = z
  .object({
    id: z.string().min(1).max(100),
    summary: z.string().min(1).max(500),
  })
  .strict()

const OutcomeExpectationSchema = z
  .object({
    description: z.string().min(1).max(500),
    expectedBy: IsoDateTimeSchema.optional(),
  })
  .strict()

const OutcomeObservationSchema = z
  .object({
    description: z.string().min(1).max(500),
    observedAt: IsoDateTimeSchema,
    matchedExpectation: z.boolean(),
  })
  .strict()

export const DecisionRecordSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    problem: z.string().min(1).max(1000),
    domain: z.string().min(1).max(100).optional(),
    options: z.array(OptionSchema).min(1),
    assumptions: z.array(EvidenceRefSchema),
    evidence: z.array(EvidenceRefSchema),
    tradeoffs: z.array(z.string().min(1).max(500)),
    selectedOptionId: z.string().min(1).max(100).optional(),
    rationale: z.string().max(2000).optional(),
    expectedOutcomes: z.array(OutcomeExpectationSchema),
    actualOutcomes: z.array(OutcomeObservationSchema).optional(),
    status: DecisionStatusSchema,
    reviewAt: IsoDateTimeSchema.optional(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
  },
  DECISION_RECORD_SCHEMA_VERSION,
)

export type DecisionRecord = z.infer<typeof DecisionRecordSchema>
