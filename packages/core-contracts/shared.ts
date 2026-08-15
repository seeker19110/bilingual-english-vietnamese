// packages/core-contracts/shared.ts — Kiểu nguyên tử dùng chung giữa nhiều contract, GHÉP THEO
// đúng khái niệm đã có thật trong app (không bịa mới) để domain model mới khớp với dữ liệu hiện
// có, tránh 2 bộ "cấp độ"/"chiều học" song song lệch nhau:
//   - `Direction` khớp `apps/english/src/types.ts` ('A' = học tiếng Anh, 'B' = học tiếng Việt).
//   - `CefrLevel` khớp `CefrWordLevel` cùng file (nhãn CEFR gắn cho 12.168 từ trong từ điển).

import { z } from 'zod'

export const DirectionSchema = z.enum(['A', 'B'])
export type ContractDirection = z.infer<typeof DirectionSchema>

export const CefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
export type ContractCefrLevel = z.infer<typeof CefrLevelSchema>

// Thời điểm dạng chuỗi ISO 8601 — dùng cho MỌI trường *At trong các contract, để tất cả entity
// tuần tự hoá/giải tuần tự hoá qua JSON (API, event, lưu DB dạng jsonb) theo đúng 1 định dạng.
export const IsoDateTimeSchema = z.iso.datetime()

export const UuidSchema = z.uuid()
