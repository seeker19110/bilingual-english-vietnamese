import { describe, it, expect } from 'vitest'
import {
  EventEnvelopeSchema,
  EVENT_ENVELOPE_SCHEMA_VERSION,
  createIdempotencyTracker,
} from './eventEnvelope.js'

const validEvent = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  idempotencyKey: 'evidence:123e4567-e89b-12d3-a456-426614174001:mastery_updated',
  type: 'mastery.updated',
  occurredAt: '2026-08-15T00:00:00Z',
  payload: { masteryId: '123e4567-e89b-12d3-a456-426614174002', level: 0.7 },
  schemaVersion: EVENT_ENVELOPE_SCHEMA_VERSION,
}

describe('EventEnvelopeSchema', () => {
  it('payload hợp lệ (payload là object bất kỳ) → parse thành công', () => {
    expect(EventEnvelopeSchema.parse(validEvent)).toEqual(validEvent)
  })

  it('payload là mảng/chuỗi/số cũng hợp lệ (z.unknown() — mỗi type tự định hình payload)', () => {
    expect(EventEnvelopeSchema.parse({ ...validEvent, payload: [1, 2, 3] }).payload).toEqual([
      1, 2, 3,
    ])
    expect(EventEnvelopeSchema.parse({ ...validEvent, payload: 'chuỗi' }).payload).toBe('chuỗi')
  })

  it('type sai định dạng (thiếu dấu chấm) → từ chối', () => {
    expect(() => EventEnvelopeSchema.parse({ ...validEvent, type: 'masteryupdated' })).toThrow()
  })

  it('idempotencyKey rỗng → từ chối', () => {
    expect(() => EventEnvelopeSchema.parse({ ...validEvent, idempotencyKey: '' })).toThrow()
  })

  it('field lạ ở gốc envelope → từ chối', () => {
    expect(() => EventEnvelopeSchema.parse({ ...validEvent, retryCount: 1 })).toThrow()
  })
})

describe('createIdempotencyTracker — chặn xử lý event trùng', () => {
  it('key chưa thấy bao giờ → hasSeen false', () => {
    const tracker = createIdempotencyTracker()
    expect(tracker.hasSeen('key-1')).toBe(false)
  })

  it('sau markSeen → hasSeen true cho ĐÚNG key đó', () => {
    const tracker = createIdempotencyTracker()
    tracker.markSeen('key-1')
    expect(tracker.hasSeen('key-1')).toBe(true)
  })

  it('event PHÁT LẠI (network retry) — cùng idempotencyKey → nhận ra trùng, không xử lý 2 lần', () => {
    const tracker = createIdempotencyTracker()
    const key = validEvent.idempotencyKey

    // Lượt xử lý ĐẦU TIÊN.
    expect(tracker.hasSeen(key)).toBe(false)
    tracker.markSeen(key)

    // Lượt "phát lại" do retry — cùng key → nơi gọi phải BỎ QUA, không cộng dồn state 2 lần.
    expect(tracker.hasSeen(key)).toBe(true)
  })

  it('key KHÁC nhau không lẫn vào nhau', () => {
    const tracker = createIdempotencyTracker()
    tracker.markSeen('key-a')
    expect(tracker.hasSeen('key-a')).toBe(true)
    expect(tracker.hasSeen('key-b')).toBe(false)
  })
})
