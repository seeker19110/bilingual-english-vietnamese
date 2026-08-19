import { describe, it, expect } from 'vitest'
import type { Pool } from 'pg'
import {
  createA2AMessage,
  processIncomingA2AMessage,
  discoverPeerStudyMatches,
  listActiveA2ANegotiations,
} from './a2aNegotiationService.js'

describe('a2aNegotiationService', () => {
  it('tạo và ký số thành công thông điệp A2A', () => {
    const msg = createA2AMessage({
      senderDid: 'did:key:sender1',
      recipientDid: 'did:key:recip1',
      senderPersonId: '550e8400-e29b-41d4-a716-446655440001',
      recipientPersonId: '550e8400-e29b-41d4-a716-446655440002',
      purpose: 'calendar_arbitration',
      payload: { proposedWindow: '2026-08-21T10:00:00Z', durationMinutes: 30 },
    })

    expect(msg.messageId).toBeDefined()
    expect(msg.signature).toBeDefined()
    expect(msg.schemaVersion).toBe('v3.0.0')
  })

  it('xử lý đàm phán thông điệp A2A thành công', async () => {
    const recipientId = '550e8400-e29b-41d4-a716-446655440002'
    const msg = createA2AMessage({
      senderDid: 'did:key:sender1',
      recipientDid: 'did:key:recip1',
      senderPersonId: '550e8400-e29b-41d4-a716-446655440001',
      recipientPersonId: recipientId,
      purpose: 'study_partner_handshake',
      payload: { topic: 'IELTS Speaking' },
    })

    const result = await processIncomingA2AMessage({} as unknown as Pool, recipientId, msg)

    expect(result.status).toBe('agreed')
    expect(result.auditReceiptHash).toBeDefined()

    const activeList = listActiveA2ANegotiations(recipientId)
    expect(activeList.length).toBeGreaterThan(0)
  })

  it('tìm kiếm các đề xuất bạn cùng học tương thích', async () => {
    const matches = await discoverPeerStudyMatches(
      {} as unknown as Pool,
      '550e8400-e29b-41d4-a716-446655440001',
    )
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0]?.compatibilityScore).toBeGreaterThan(0.8)
  })
})
