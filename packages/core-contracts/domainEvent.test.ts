// packages/core-contracts/domainEvent.test.ts — Test NGẮN cho alias `DomainEvent`.
//
// KHÔNG lặp lại test hành vi validate (đã cover đủ ở `eventEnvelope.test.ts`) — ở đây chỉ xác
// nhận alias TRỎ ĐÚNG chỗ (cùng schema, cùng version).

import { describe, it, expect } from 'vitest'
import { DomainEventSchema, DOMAIN_EVENT_SCHEMA_VERSION } from './domainEvent.js'
import { EventEnvelopeSchema, EVENT_ENVELOPE_SCHEMA_VERSION } from './eventEnvelope.js'

const validDomainEvent = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  idempotencyKey: 'evidence:123e4567-e89b-12d3-a456-426614174001:mastery_updated',
  type: 'mastery.updated',
  occurredAt: '2026-08-15T00:00:00Z',
  payload: { masteryId: '123e4567-e89b-12d3-a456-426614174002', level: 0.7 },
  schemaVersion: DOMAIN_EVENT_SCHEMA_VERSION,
}

describe('DomainEvent (alias của EventEnvelope)', () => {
  it('DomainEventSchema parse payload hợp lệ → thành công', () => {
    expect(DomainEventSchema.parse(validDomainEvent)).toEqual(validDomainEvent)
  })

  it('DOMAIN_EVENT_SCHEMA_VERSION === EVENT_ENVELOPE_SCHEMA_VERSION (không lệch version)', () => {
    expect(DOMAIN_EVENT_SCHEMA_VERSION).toBe(EVENT_ENVELOPE_SCHEMA_VERSION)
  })

  it('DomainEventSchema === EventEnvelopeSchema (cùng object, không phải bản copy)', () => {
    expect(DomainEventSchema).toBe(EventEnvelopeSchema)
  })
})
