// packages/core-contracts/activity.ts — Contract cho "Activity" (Phase 11 Workflow OS liên quan,
// docs/phases/11-workflow-os.md + Final learning loop ở MASTER_SPEC.md: "... → Tutor → Evidence
// → ..."). 1 LƯỢT học cụ thể (1 phiên chat, 1 bài viết, 1 lượt ôn SRS) — nguồn phát sinh Evidence.
// `kind`/`mode` khớp `CallMode` đã có ở `apps/dhcb/src/lib/ai.ts` ('chat'|'writing'|'speaking'),
// mở rộng thêm 'srs_review'/'lesson' cho 2 luồng không gọi AI trực tiếp.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const ACTIVITY_SCHEMA_VERSION = 1

export const ActivityKindSchema = z.enum(['chat', 'writing', 'speaking', 'srs_review', 'lesson'])

export const ActivitySchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    // Optional — chat tự do không gắn với 1 Lesson cụ thể nào.
    lessonId: UuidSchema.optional(),
    kind: ActivityKindSchema,
    startedAt: IsoDateTimeSchema,
    // Optional — hoạt động có thể đang DIỄN RA (chưa completedAt) tại thời điểm ghi.
    completedAt: IsoDateTimeSchema.optional(),
  },
  ACTIVITY_SCHEMA_VERSION,
)

export type Activity = z.infer<typeof ActivitySchema>
