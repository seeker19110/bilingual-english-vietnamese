// packages/core-contracts/contextPackage.ts — Contract cho "ContextPackage" (V2-02). Field suy từ
// `02-SYSTEM-ARCHITECTURE.md` mục 14 "Context Builder" — mô tả QUY TRÌNH chọn (selection order +
// lọc permission/purpose/sensitivity/freshness/token budget), CHƯA có shape field cụ thể trong
// tài liệu. Đây là 1 trong 8 gap contract cần owner tham gia thiết kế thêm (xem
// `V2-02-CONTRACT-DIFF.md` mục 3/4) — bản này là ĐỀ XUẤT đầu tiên bám sát đúng quy trình đã mô tả.
//
// "Context Builder là security boundary, không chỉ prompt utility... Mỗi item đưa vào AI context
// có provenance internally available để audit" (mục 14) — mỗi `ContextItem` PHẢI có `provenance`,
// không được bỏ trống.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'
import { SensitivitySchema } from './personalFact.js'

export const CONTEXT_PACKAGE_SCHEMA_VERSION = 1

// Đúng thứ tự "Selection order" liệt kê ở mục 14 — dùng làm enum để mỗi item khai rõ nó thuộc
// bước chọn nào, phục vụ audit/debug ("tại sao item này lọt vào context").
export const ContextItemSourceSchema = z.enum([
  'current_request',
  'active_goal_or_project',
  'authoritative_domain_state',
  'user_declared_fact',
  'validated_derived_memory',
  'recent_episodic_context',
])

const ContextItemSchema = z
  .object({
    sourceType: ContextItemSourceSchema,
    sourceId: UuidSchema,
    // Nội dung item đã được lọc/rút gọn để đưa vào prompt — KHÔNG phải bản sao thô của record
    // gốc (mục 6 Knowledge Fabric: "Không mặc định lưu bản sao raw ... nếu adapter có thể truy
    // xuất tại nguồn"). `sourceId` đủ để trace lại record gốc khi cần audit đầy đủ.
    content: z.string().min(1).max(4000),
    provenance: z.string().min(1).max(200),
    sensitivity: SensitivitySchema,
    tokenEstimate: z.number().int().nonnegative(),
  })
  .strict()

export const ContextPackageSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    requestId: z.string().min(1).max(100),
    items: z.array(ContextItemSchema),
    tokenBudget: z.number().int().positive(),
    tokenUsed: z.number().int().nonnegative(),
    createdAt: IsoDateTimeSchema,
  },
  CONTEXT_PACKAGE_SCHEMA_VERSION,
).refine((pkg) => pkg.tokenUsed <= pkg.tokenBudget, {
  message: 'tokenUsed không được vượt tokenBudget (mục 14: "token budget" là ràng buộc cứng)',
})

export type ContextPackage = z.infer<typeof ContextPackageSchema>
