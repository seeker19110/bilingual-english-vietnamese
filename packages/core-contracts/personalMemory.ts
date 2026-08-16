// packages/core-contracts/personalMemory.ts — Contract cho "MemoryRecord" V2-02 (Personal
// Knowledge Fabric, `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 6), KHÁC `MemorySchema`
// ở `memory.ts` (Phase 21 "Memory OS" v1 — bộ nhớ tutor gắn với 1 learner/domain học tập cụ
// thể, frozen). Đặt tên file `personalMemory.ts` (không phải `memory.ts` đã bị v1 chiếm) và type
// `MemoryRecord` (không phải `Memory`) để không nhầm 2 khái niệm — quyết định ở
// `docs/architecture-v2/V2-02-CONTRACT-DIFF.md` mục 2.2 và 4.
//
// So với v1 Memory, MemoryRecord thêm đúng những gì mục 6 kiến trúc đòi: provenance,
// sensitivity, retention, và kết quả bước cuối "Memory candidate pipeline" (mục 6:
// `ACCEPT | MERGE | REJECT | ASK_USER | EXPIRE`) — record ĐÃ tồn tại trong hệ thống nghĩa là đã
// qua pipeline và ở trạng thái `accepted`/`merged` (2 outcome duy nhất khiến record được LƯU;
// `rejected`/`expired` không tạo record mới, chỉ đổi trạng thái record cũ).

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'
import { SensitivitySchema } from './personalFact.js'

export const PERSONAL_MEMORY_SCHEMA_VERSION = 1

export const MemoryNamespaceSchema = z.enum([
  'semantic',
  'episodic',
  'preference',
  'commitment',
  'domain',
])
export type MemoryNamespace = z.infer<typeof MemoryNamespaceSchema>

export const MemoryRecordStatusSchema = z.enum(['accepted', 'merged', 'expired'])

export const MemoryRecordSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    namespace: MemoryNamespaceSchema,
    content: z.string().min(1).max(2000),
    provenance: z.string().min(1).max(200),
    sensitivity: SensitivitySchema,
    status: MemoryRecordStatusSchema,
    // Chỉ record đã `merged` mới có nguồn gốc từ 1 record khác — trace được lịch sử hợp nhất.
    mergedFromId: UuidSchema.optional(),
    createdAt: IsoDateTimeSchema,
    // Retention — hạn giữ dữ liệu, KHÁC `expiresAt` ở PersonalFact (đó là hạn hiệu lực của 1
    // fact; đây là hạn PHẢI XOÁ theo chính sách retention, có thể ngắn hơn nhiều so với thời
    // gian fact còn "đúng").
    retainUntil: IsoDateTimeSchema.optional(),
  },
  PERSONAL_MEMORY_SCHEMA_VERSION,
)

export type MemoryRecord = z.infer<typeof MemoryRecordSchema>
