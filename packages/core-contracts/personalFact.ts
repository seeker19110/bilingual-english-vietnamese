// packages/core-contracts/personalFact.ts — Contract cho "PersonalFact" (V2-02). Hình thức hoá
// đúng interface đã có sẵn ở `docs/architecture-v2/02-SYSTEM-ARCHITECTURE.md` mục 4 "Personal
// World Model" thành Zod schema — KHÔNG tự thiết kế lại field, chỉ chuyển đổi kiểu.
//
// Rules từ tài liệu kiến trúc (mục 4, PHẢI giữ khi engine Wave B dùng contract này):
//   - `user_declared` thường có confidence 1 nhưng vẫn có thể supersede;
//   - derived inference KHÔNG được tự ghi đè user declaration;
//   - fact nhạy cảm không tự động cross-domain;
//   - confidence thấp có thể chỉ tồn tại như candidate;
//   - timestamp không phải provenance (không suy ra "đáng tin" chỉ vì mới).
// Contract này CHỈ định nghĩa hình dạng — enforce các rule trên là việc của domain engine
// Wave B (V2-03), không phải của Zod schema.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const PERSONAL_FACT_SCHEMA_VERSION = 1

export const FactOriginSchema = z.enum(['user_declared', 'observed', 'derived', 'imported'])
export type FactOrigin = z.infer<typeof FactOriginSchema>

export const SensitivitySchema = z.enum(['public', 'personal', 'sensitive', 'restricted'])
export type Sensitivity = z.infer<typeof SensitivitySchema>

export const FactSourceSchema = z
  .object({
    type: z.string().min(1).max(100),
    id: z.string().min(1).max(200).optional(),
    occurredAt: IsoDateTimeSchema.optional(),
  })
  .strict()

export const PersonalFactSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    namespace: z.string().min(1).max(100),
    key: z.string().min(1).max(200),
    // `value` cố ý `unknown` — mỗi namespace/key tự định nghĩa kiểu giá trị của mình (giống
    // `payload` ở `eventEnvelope.ts`); ép kiểu cụ thể ở tầng contract chung này sẽ chặn mọi
    // namespace mới phải sửa lại contract lõi.
    value: z.unknown(),
    origin: FactOriginSchema,
    confidence: z.number().min(0).max(1),
    source: FactSourceSchema,
    sensitivity: SensitivitySchema,
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    lastConfirmedAt: IsoDateTimeSchema.optional(),
    expiresAt: IsoDateTimeSchema.optional(),
    // Trỏ tới `id` của PersonalFact bị thay thế — supersede là APPEND, không phải UPDATE/DELETE
    // (giữ lịch sử để audit "trước đây từng tin gì" — đúng mục 18 `02-SYSTEM-ARCHITECTURE.md`).
    supersedes: UuidSchema.optional(),
  },
  PERSONAL_FACT_SCHEMA_VERSION,
)

export type PersonalFact = z.infer<typeof PersonalFactSchema>
