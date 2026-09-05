// api/memory-palace.test.ts — test cho handler Cung điện Trí nhớ Không gian (Method of Loci).
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './memory-palace.js'
import * as security from '@dhcb/core-auth/security'

// State đã chuyển sang platform.feature_state — mock bằng Map in-memory, theo đúng khuôn
// debate-arena.test.ts / stem-scratchpad.test.ts (state sống suốt file test).
const featureStore = new Map<string, unknown>()
vi.mock('@dhcb/core-db/featureState', () => ({
  getFeatureState: vi.fn(async (u: string, f: string) => featureStore.get(u + '|' + f) ?? null),
  setFeatureState: vi.fn(async (u: string, f: string, st: unknown) => {
    featureStore.set(u + '|' + f, st)
  }),
}))

const USER = '11111111-1111-4111-8111-111111111111'

function authOk() {
  vi.spyOn(security, 'validateAuth').mockResolvedValue({ userId: USER })
}

describe('Memory Palace API Handler (/api/memory-palace)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    featureStore.clear()
  })

  it('handles OPTIONS request with 204', async () => {
    const res = await handler(
      new Request('http://localhost/api/memory-palace', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const res = await handler(new Request('http://localhost/api/memory-palace', { method: 'GET' }))
    expect(res.status).toBe(401)
  })

  it('GET tự tạo phòng mặc định khi chưa có state, trả về tổng quan', async () => {
    authOk()
    const res = await handler(new Request('http://localhost/api/memory-palace', { method: 'GET' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.state.rooms.length).toBe(1)
    expect(data.state.activeRoomId).toBe(data.state.rooms[0].id)
  })

  it('GET dùng lại rooms đã có trong state (không tạo phòng mặc định lần 2)', async () => {
    authOk()
    await handler(new Request('http://localhost/api/memory-palace', { method: 'GET' }))
    const res2 = await handler(new Request('http://localhost/api/memory-palace', { method: 'GET' }))
    const data2 = await res2.json()
    expect(data2.state.rooms.length).toBe(1)
  })

  it('POST create_room: thiếu name/theme trả 400', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(res.status).toBe(400)
  })

  it('POST create_room: thành công thêm phòng mới', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Phòng Từ Vựng C1',
          theme: 'knowledge_library',
          description: 'Ghi nhớ từ vựng nâng cao',
          initialConcepts: ['ubiquitous', 'ephemeral'],
        }),
      }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.room.name).toBe('Phòng Từ Vựng C1')
  })

  it('POST verify_recall: thiếu tham số trả 400', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=verify_recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: 'r1' }),
      }),
    )
    expect(res.status).toBe(400)
  })

  it('POST verify_recall: room not found trả 404', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=verify_recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: 'ghost', locusId: 'l1', userRecallText: 'abc' }),
      }),
    )
    expect(res.status).toBe(404)
  })

  it('POST verify_recall: locus not found trả 404', async () => {
    authOk()
    // Tạo phòng mặc định trước (có sẵn loci từ createMemoryPalaceRoom)
    const getRes = await handler(
      new Request('http://localhost/api/memory-palace', { method: 'GET' }),
    )
    const { state } = await getRes.json()
    const roomId = state.rooms[0].id

    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=verify_recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, locusId: 'ghost-locus', userRecallText: 'abc' }),
      }),
    )
    expect(res.status).toBe(404)
  })

  it('POST verify_recall: nhớ đúng (isAccurate true) đánh dấu mastered', async () => {
    authOk()
    const getRes = await handler(
      new Request('http://localhost/api/memory-palace', { method: 'GET' }),
    )
    const { state } = await getRes.json()
    const room = state.rooms[0]
    const roomId = room.id
    const locus = room.loci[0]

    // Dùng CHÍNH keyConcept của locus làm câu trả lời → khớp 100% token, chắc chắn isAccurate=true
    // (verifyLocusRecall tính similarityRatio theo số token của keyConcept xuất hiện trong câu trả lời).
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=verify_recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, locusId: locus.id, userRecallText: locus.keyConcept }),
      }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.result.isAccurate).toBe(true)
    expect(data.updatedLocus.mastered).toBe(true)
  })

  it('GET với rooms rỗng (đã có state nhưng mảng rỗng) → overallRetentionIndex mặc định 80', async () => {
    featureStore.set(USER + '|memory_palace', [])
    authOk()
    const res = await handler(new Request('http://localhost/api/memory-palace', { method: 'GET' }))
    const data = await res.json()
    expect(data.state.overallRetentionIndex).toBe(80)
    expect(data.state.activeRoomId).toBeUndefined()
  })

  it('POST verify_recall: nhớ sai (isAccurate false) không đánh dấu mastered', async () => {
    authOk()
    const createRes = await handler(
      new Request('http://localhost/api/memory-palace?action=create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Phòng nhớ sai',
          theme: 'knowledge_library',
          initialConcepts: [
            {
              keyConcept: 'Perseverance (n) - Sự kiên trì bền bỉ',
              mnemonicStory: 'Một người leo núi không bao giờ bỏ cuộc giữa bão tuyết.',
              category: 'c1_c2_vocab',
            },
          ],
        }),
      }),
    )
    const created = await createRes.json()
    const roomId = created.room.id
    const locusId = created.room.loci[0].id

    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=verify_recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, locusId, userRecallText: 'hoàn toàn sai bét' }),
      }),
    )
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.result.isAccurate).toBe(false)
    expect(data.updatedLocus.mastered).toBe(false)
  })

  it('POST action không xác định trả 400', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=unknown_action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(res.status).toBe(400)
  })

  it('POST ném lỗi KHÔNG PHẢI Error (nhánh else của err instanceof Error) trả 500', async () => {
    authOk()
    // req.json() ném một GIÁ TRỊ không phải Error (chuỗi thường) để phủ nhánh `String(err)`
    // trong `err instanceof Error ? err.message : String(err)` — JSON.parse thật luôn ném
    // SyntaxError (là Error), nên nhánh này không đạt được bằng body hỏng thông thường.
    const fakeReq = {
      method: 'POST',
      url: 'http://localhost/api/memory-palace?action=create_room',
      json: () => Promise.reject('lỗi dạng chuỗi không phải Error'),
    } as unknown as Request
    const res = await handler(fakeReq)
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.details).toBe('lỗi dạng chuỗi không phải Error')
  })

  it('POST body JSON hỏng trả 500 (nhánh catch)', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace?action=create_room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{invalid-json',
      }),
    )
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe('Failed to process request')
  })

  it('method không được hỗ trợ trả 405', async () => {
    authOk()
    const res = await handler(
      new Request('http://localhost/api/memory-palace', { method: 'DELETE' }),
    )
    expect(res.status).toBe(405)
  })
})
