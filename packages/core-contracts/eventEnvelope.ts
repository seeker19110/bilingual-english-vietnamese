// packages/core-contracts/eventEnvelope.ts — Contract cho sự kiện nội bộ (Phase 02 mục 5: "Define
// API/event error contracts and idempotency keys"; nền cho Phase 29 Event OS,
// docs/phases/29-event-os.md, chưa có event bus thật để dùng contract này).
//
// `idempotencyKey` là trọng tâm: nguyên tắc kiến trúc #6 MASTER_SPEC.md ("Critical state
// mutations are auditable and idempotent") đòi hỏi nơi XỬ LÝ event phải PHÁT HIỆN được event đã
// xử lý rồi (network retry, worker restart giữa chừng, message queue giao lại...) để không cộng
// dồn 2 lần. Contract này CHỈ định nghĩa hình dạng — việc lưu "đã xử lý key nào" (bảng dedupe/
// cache) thuộc về Phase 29 khi có event bus thật.
//
// Hợp đồng lỗi API (Phase 02 mục 5, phần "error contracts") ĐÃ có ở Phase 01:
// `packages/core-errors/appError.ts` (`AppError`/`toErrorBody`) — không định nghĩa lại ở đây.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const EVENT_ENVELOPE_SCHEMA_VERSION = 1

export const EventEnvelopeSchema = versionedObject(
  {
    id: UuidSchema,
    // Khoá chống xử lý trùng — nơi phát event tự sinh (thường = hash của nguyên nhân gây ra sự
    // kiện, vd "evidence:<evidenceId>:mastery_updated"), KHÁC `id` (mỗi lần phát 1 event mới có
    // `id` mới, nhưng nếu cùng 1 nguyên nhân được phát lại — do retry — `idempotencyKey` phải
    // GIỐNG LẦN TRƯỚC để nơi xử lý nhận ra và bỏ qua).
    idempotencyKey: z.string().min(1).max(200),
    // Loại sự kiện, dạng "domain.action" — vd "mastery.updated", "evidence.recorded".
    type: z.string().regex(/^[a-z]+\.[a-z_]+$/, 'type phải dạng "domain.action"'),
    occurredAt: IsoDateTimeSchema,
    // Nội dung sự kiện — CHƯA ép kiểu cụ thể theo từng `type` ở tầng contract chung này (mỗi
    // loại event có payload khác nhau, vd "mastery.updated" mang theo `Mastery`, "evidence.
    // recorded" mang theo `Evidence`); Phase 29 khi triển khai thật sẽ union theo `type`.
    payload: z.unknown(),
  },
  EVENT_ENVELOPE_SCHEMA_VERSION,
)

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>

/**
 * Bộ nhớ đệm CHỐNG XỬ LÝ TRÙNG tối giản, trong bộ nhớ — kiểm tra 1 `idempotencyKey` đã thấy chưa.
 *
 * CỐ Ý chỉ trong bộ nhớ (mất khi restart) — đủ cho mục đích hiện tại là ĐỊNH NGHĨA HÌNH DẠNG hợp
 * đồng dedupe (Phase 02), CHƯA phải cơ chế dedupe bền vững thật (Phase 29 Event OS sẽ cần lưu
 * Postgres/Redis để sống qua restart). Không dùng cho quyết định liên quan tiền/dữ liệu thật cho
 * tới khi Phase 29 thay bằng bản bền vững.
 */
export function createIdempotencyTracker(): {
  hasSeen: (key: string) => boolean
  markSeen: (key: string) => void
} {
  const seen = new Set<string>()
  return {
    hasSeen: (key) => seen.has(key),
    markSeen: (key) => {
      seen.add(key)
    },
  }
}
