// packages/core-contracts/domainEvent.ts — Alias CÓ CHỦ ĐÍCH cho `EventEnvelopeSchema`.
//
// KHÔNG PHẢI contract riêng. Roadmap V2-02 (Personal OS Core) gọi khái niệm này là "DomainEvent",
// nhưng đối chiếu ở `docs/architecture-v2/V2-02-CONTRACT-DIFF.md` mục 2.4 cho thấy DomainEvent
// (V2-02) và EventEnvelope (v1, Phase 02 — `./eventEnvelope.ts`) là CÙNG 1 khái niệm: không có
// field nào V2-02 cần mà EventEnvelope chưa có. Kết luận của tài liệu đó (mục 4, câu hỏi 3):
// "KHÔNG tạo DomainEvent mới — dùng thẳng EventEnvelope đã có, đổi/thêm alias export
// DomainEvent = EventEnvelope nếu cần khớp tên gọi trong roadmap."
//
// File này CHỈ re-export dưới tên "DomainEvent" để code viết theo roadmap V2 gọi đúng tên mà
// không cần định nghĩa lại schema. Nếu về sau DomainEvent thật sự cần field khác EventEnvelope
// (vd. field riêng theo domain), lúc đó mới tách thành contract độc lập — KHÔNG tách sớm khi
// chưa có nhu cầu thật.
//
// Cố ý KHÔNG re-export `createIdempotencyTracker()` — đó là helper runtime (bộ nhớ đệm dedupe),
// không thuộc phần "hình dạng hợp đồng". Ai cần dùng thì import trực tiếp từ `./eventEnvelope.js`.

export {
  EventEnvelopeSchema as DomainEventSchema,
  EVENT_ENVELOPE_SCHEMA_VERSION as DOMAIN_EVENT_SCHEMA_VERSION,
} from './eventEnvelope.js'

export type { EventEnvelope as DomainEvent } from './eventEnvelope.js'
