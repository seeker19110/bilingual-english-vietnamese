import { describe, it, expect } from 'vitest'
import {
  A2AMessageSchema,
  A2ANegotiationResultSchema,
  A2A_PROTOCOL_VERSION,
} from './a2aProtocol.js'

describe('core-contracts: a2aProtocol', () => {
  it('xác thực hợp lệ thông điệp đàm phán Agent-to-Agent', () => {
    const msg = {
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      senderDid: 'did:key:z6MkpTHR123',
      recipientDid: 'did:key:z6MkpTHR456',
      senderPersonId: '550e8400-e29b-41d4-a716-446655440001',
      recipientPersonId: '550e8400-e29b-41d4-a716-446655440002',
      purpose: 'calendar_arbitration',
      payload: {
        proposedWindow: '2026-08-20T14:00:00Z',
        durationMinutes: 45,
      },
      signature: 'ed25519_sig_abc1234567890def',
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      schemaVersion: A2A_PROTOCOL_VERSION,
    }

    const parsed = A2AMessageSchema.parse(msg)
    expect(parsed.purpose).toBe('calendar_arbitration')
    expect(parsed.schemaVersion).toBe('v3.0.0')
  })

  it('xác thực hợp lệ kết quả thỏa thuận đàm phán A2A', () => {
    const res = {
      id: '550e8400-e29b-41d4-a716-446655440010',
      messageId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'agreed',
      purpose: 'study_partner_handshake',
      agreedTerms: {
        skillTopic: 'IELTS Speaking Part 2 Practice',
        studyDurationMinutes: 30,
        disclosureLevel: 'anonymous_zk',
      },
      auditReceiptHash: 'hash_99a88b77c66d55e44f33',
      createdAt: new Date().toISOString(),
      schemaVersion: A2A_PROTOCOL_VERSION,
    }

    const parsed = A2ANegotiationResultSchema.parse(res)
    expect(parsed.status).toBe('agreed')
    expect(parsed.agreedTerms.disclosureLevel).toBe('anonymous_zk')
  })
})
