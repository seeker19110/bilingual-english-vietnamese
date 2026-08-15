// packages/core-contracts/learner.ts — Contract cho "Learner" (Phase 03 Learner OS,
// docs/phases/03-learner-os.md). Hồ sơ học viên trong kiến trúc OS mới — KHÁC bảng
// `learning_progress`/`profiles` hiện có trong Postgres (chưa đổi schema DB ở Phase 02 này, xem
// docs/phases/02-contract-os.md mục 1 "Define canonical schemas" — bước ĐỊNH NGHĨA HÌNH DẠNG đi
// trước, Phase 03 mới quyết cách lưu/migrate dữ liệu thật).
//
// Field lấy đúng khái niệm đã có: `direction`/`cefrLevel` khớp `Direction`/`CefrWordLevel` ở
// `apps/english/src/types.ts`; `dailySpeed` khớp `DailySpeed` (5/10/20 từ/ngày) ở
// `apps/english/src/lib/curriculum.ts`.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { DirectionSchema, CefrLevelSchema, IsoDateTimeSchema, UuidSchema } from './shared.js'

export const LEARNER_SCHEMA_VERSION = 1

export const DailySpeedSchema = z.union([z.literal(5), z.literal(10), z.literal(20)])

export const LearnerSchema = versionedObject(
  {
    id: UuidSchema,
    userId: UuidSchema,
    direction: DirectionSchema,
    currentLevel: CefrLevelSchema,
    dailySpeed: DailySpeedSchema,
    // Mặc định 'Asia/Ho_Chi_Minh' — sản phẩm phục vụ người học Việt Nam trước tiên (CLAUDE.md
    // mục 1), nhưng để field TỰ DO (không enum cứng) vì chiều B phục vụ người nước ngoài học
    // tiếng Việt, có thể ở múi giờ khác.
    timezone: z.string().min(1),
    createdAt: IsoDateTimeSchema,
  },
  LEARNER_SCHEMA_VERSION,
)

export type Learner = z.infer<typeof LearnerSchema>
