// packages/core-contracts/lifeGoal.ts — Contract cho "Goal" V2-02 (Life Graph node, KHÔNG phải
// `GoalSchema` ở `goal.ts` — đó là mục tiêu luyện tập hàng ngày của 1 learner, Phase 03 English
// Tutor OS v1, frozen). Đặt tên `LifeGoal` để tránh trùng tên `Goal` trong cùng package
// `core-contracts/` — quyết định (a) ở `docs/architecture-v2/V2-02-CONTRACT-DIFF.md` mục 2.1 và
// 4: đổi tên bên V2-02, GIỮ NGUYÊN `goal.ts` (v1) không đổi, không phá contract Learning đang
// chạy production.
//
// LifeGoal là 1 NODE trong Life Graph (`lifeGraph.ts`, type='Goal') — field ở đây bổ sung thêm
// những gì riêng của Goal mà LifeGraphNode chung không có (status lifecycle, ngày mục tiêu),
// XUYÊN DOMAIN (không giới hạn trong 1 domain học tập như v1 Goal).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const LIFE_GOAL_SCHEMA_VERSION = 1

export const LifeGoalStatusSchema = z.enum(['active', 'achieved', 'abandoned', 'blocked'])

export const LifeGoalSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    // Trỏ tới LifeGraphNode tương ứng (type='Goal') — LifeGoal là DỮ LIỆU CHI TIẾT của 1 node,
    // không phải chính node đó (node giữ id/label/type chung, LifeGoal giữ phần đặc thù Goal).
    nodeId: UuidSchema,
    label: z.string().min(1).max(200),
    status: LifeGoalStatusSchema,
    targetDate: IsoDateTimeSchema.optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  LIFE_GOAL_SCHEMA_VERSION,
)

export type LifeGoal = z.infer<typeof LifeGoalSchema>
