// packages/core-contracts/memory.ts — Contract cho "Memory" (Phase 21 Memory OS,
// docs/phases/21-memory-os.md). 1 mục trong bộ nhớ dài/ngắn hạn của tutor về 1 learner. `kind`
// khớp đúng 6 loại bộ nhớ liệt kê trong MASTER_SPEC.md ("Memory OS: working/episodic/semantic/
// error/preference/progress memory and retrieval") — CHƯA có engine nào ghi/đọc thật, đây thuần
// là hình dạng hợp đồng cho Phase 21 dùng.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const MEMORY_SCHEMA_VERSION = 1

export const MemoryKindSchema = z.enum([
  'working',
  'episodic',
  'semantic',
  'error',
  'preference',
  'progress',
])

export const MemorySchema = versionedObject(
  {
    id: UuidSchema,
    learnerId: UuidSchema,
    kind: MemoryKindSchema,
    content: z.string().min(1).max(2000),
    createdAt: IsoDateTimeSchema,
    // Chỉ 'working' memory (ngữ cảnh tạm trong 1 phiên) mới có hạn — 5 loại còn lại lưu lâu dài.
    expiresAt: IsoDateTimeSchema.optional(),
  },
  MEMORY_SCHEMA_VERSION,
)

export type Memory = z.infer<typeof MemorySchema>
