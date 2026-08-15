// packages/core-contracts/workflow.ts — Contract cho "Workflow" (Phase 11 Workflow OS,
// docs/phases/11-workflow-os.md). 1 instance của state machine bền vững — nguyên tắc kiến trúc
// #6 MASTER_SPEC.md: "Critical state mutations are auditable and idempotent". `retries` phục vụ
// đúng nhu cầu "retries, timeouts, compensation" mà Phase 11 liệt kê.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const WORKFLOW_SCHEMA_VERSION = 1

export const WorkflowSchema = versionedObject(
  {
    id: UuidSchema,
    // Loại workflow, vd "onboarding", "assessment_session" — tự do (chưa đủ workflow thật để
    // ép enum, xem chú thích tương tự ở goal.ts#label).
    kind: z.string().min(1).max(100),
    // Trạng thái hiện tại trong state machine của riêng `kind` đó — mỗi kind tự định nghĩa tập
    // trạng thái hợp lệ ở lớp NGHIỆP VỤ (Phase 11), contract này chỉ đòi không rỗng.
    state: z.string().min(1).max(100),
    learnerId: UuidSchema,
    retries: z.number().int().nonnegative(),
    startedAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  WORKFLOW_SCHEMA_VERSION,
)

export type Workflow = z.infer<typeof WorkflowSchema>
