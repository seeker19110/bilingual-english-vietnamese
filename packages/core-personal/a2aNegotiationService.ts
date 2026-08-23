// packages/core-personal/a2aNegotiationService.ts — V3 Multi-Agent A2A Negotiation Engine.
import { createHash, randomUUID } from 'node:crypto'
import type { Pool } from 'pg'
import {
  type A2AMessage,
  type A2ANegotiationResult,
  type PeerStudyMatch,
  A2AMessageSchema,
  A2ANegotiationResultSchema,
  A2A_PROTOCOL_VERSION,
} from '@dhcb/core-contracts/a2aProtocol'

// In-memory active negotiations cache
const a2aNegotiationCache = new Map<string, A2ANegotiationResult[]>()

/** Tạo chữ ký số mô phỏng Ed25519 cho thông điệp A2A */
export function signA2APayload(senderDid: string, payload: Record<string, unknown>): string {
  const content = `${senderDid}:${JSON.stringify(payload)}`
  return createHash('sha256').update(content).digest('hex')
}

/** Khởi tạo và ký số một thông điệp A2A gửi đi */
export function createA2AMessage(params: {
  senderDid: string
  recipientDid: string
  senderPersonId: string
  recipientPersonId: string
  purpose: A2AMessage['purpose']
  payload: Record<string, unknown>
  ttlSeconds?: number
}): A2AMessage {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + (params.ttlSeconds || 3600) * 1000)
  const signature = signA2APayload(params.senderDid, params.payload)

  const msg: A2AMessage = {
    messageId: randomUUID(),
    senderDid: params.senderDid,
    recipientDid: params.recipientDid,
    senderPersonId: params.senderPersonId,
    recipientPersonId: params.recipientPersonId,
    purpose: params.purpose,
    payload: params.payload,
    signature,
    timestamp: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    schemaVersion: A2A_PROTOCOL_VERSION,
  }

  return A2AMessageSchema.parse(msg)
}

/** Tiếp nhận và tự động xử lý đàm phán thông điệp A2A từ Agent khác */
export async function processIncomingA2AMessage(
  pool: Pool,
  recipientPersonId: string,
  message: A2AMessage,
): Promise<A2ANegotiationResult> {
  void pool
  const validated = A2AMessageSchema.parse(message)

  // Kiểm tra hạn sử dụng
  if (new Date(validated.expiresAt).getTime() < Date.now()) {
    throw new Error('A2A message has expired')
  }

  const receiptHash = createHash('sha256')
    .update(`${validated.messageId}:${recipientPersonId}:${Date.now()}`)
    .digest('hex')

  let result: A2ANegotiationResult

  if (validated.purpose === 'calendar_arbitration') {
    const proposedSlot =
      typeof validated.payload['proposedWindow'] === 'string'
        ? validated.payload['proposedWindow']
        : new Date(Date.now() + 86400_000).toISOString()

    result = {
      id: randomUUID(),
      messageId: validated.messageId,
      status: 'agreed',
      purpose: 'calendar_arbitration',
      agreedTerms: {
        scheduledSlot: proposedSlot,
        studyDurationMinutes:
          typeof validated.payload['durationMinutes'] === 'number'
            ? validated.payload['durationMinutes']
            : 45,
        disclosureLevel: 'anonymous_zk',
      },
      auditReceiptHash: receiptHash,
      createdAt: new Date().toISOString(),
      schemaVersion: A2A_PROTOCOL_VERSION,
    }
  } else {
    result = {
      id: randomUUID(),
      messageId: validated.messageId,
      status: 'agreed',
      purpose: validated.purpose,
      agreedTerms: {
        skillTopic:
          typeof validated.payload['topic'] === 'string'
            ? validated.payload['topic']
            : 'English Speaking Practice',
        studyDurationMinutes: 30,
        disclosureLevel: 'direct_peer',
      },
      auditReceiptHash: receiptHash,
      createdAt: new Date().toISOString(),
      schemaVersion: A2A_PROTOCOL_VERSION,
    }
  }

  const validatedResult = A2ANegotiationResultSchema.parse(result)

  // Lưu vào cache
  const list = a2aNegotiationCache.get(recipientPersonId) || []
  list.unshift(validatedResult)
  a2aNegotiationCache.set(recipientPersonId, list.slice(0, 20))

  return validatedResult
}

/** Tìm kiếm các đề xuất bạn cùng học (Study Peer) tương thích qua A2A */
export async function discoverPeerStudyMatches(
  pool: Pool,
  personId: string,
): Promise<PeerStudyMatch[]> {
  void pool
  void personId
  // Dữ liệu mẫu minh họa mạng lưới Agent-to-Agent
  return [
    {
      peerPersonId: randomUUID(),
      peerDid: 'did:key:z6MkpTHR9988study',
      peerDisplayName: 'Học viên IELTS Band 7.0+',
      sharedSkill: 'IELTS Speaking & Academic Writing',
      compatibilityScore: 0.94,
      recommendedGoal: 'Luyện đề Speaking Part 3 mô phỏng thực tế 30 phút',
    },
    {
      peerPersonId: randomUUID(),
      peerDid: 'did:key:z6MkpTHR7766tech',
      peerDisplayName: 'Kỹ sư AI / Lập trình viên',
      sharedSkill: 'Technical English & System Design',
      compatibilityScore: 0.89,
      recommendedGoal: 'Trao đổi thuật ngữ kiến trúc microservices bằng tiếng Anh',
    },
  ]
}

/** Lấy danh sách các thỏa thuận A2A hiện có */
export function listActiveA2ANegotiations(personId: string): A2ANegotiationResult[] {
  return a2aNegotiationCache.get(personId) || []
}
