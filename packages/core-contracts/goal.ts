// packages/core-contracts/goal.ts — Contract cho "Goal" (Phase 03 Learner OS). Mục tiêu học của
// 1 learner — hình thức hoá `goal: string` tự do đã có ở `OnboardingData`
// (apps/dhcb/src/lib/onboarding.ts) thành dữ liệu có kiểm, để engine Diagnostic/Curriculum
// (Phase 09/17) dùng được thay vì đọc chuỗi tự do.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const GOAL_SCHEMA_VERSION = 1

export const GoalStatusSchema = z.enum(['active', 'completed', 'abandoned'])

export const GoalSchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    // Nhãn tự do (giống `goal: string` cũ ở OnboardingData) — chưa ép enum cứng vì Phase 03
    // chưa định nghĩa đủ danh sách mục tiêu chuẩn hoá; ép sớm dễ sai, để dành phase đó quyết.
    label: z.string().min(1).max(200),
    targetMinutesPerDay: z.number().int().positive(),
    targetDate: IsoDateTimeSchema.optional(),
    status: GoalStatusSchema,
    createdAt: IsoDateTimeSchema,
  },
  GOAL_SCHEMA_VERSION,
)

export type Goal = z.infer<typeof GoalSchema>
