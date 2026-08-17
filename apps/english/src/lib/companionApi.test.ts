import { describe, it, expect, afterEach, vi } from 'vitest'

vi.mock('@core/authHeader', () => ({
  getAuthHeader: vi.fn(async () => ({ Authorization: 'Bearer test-token' })),
}))

import {
  sendCompanionMessage,
  listProposedActions,
  confirmProposedAction,
  rejectProposedAction,
} from './companionApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

const MOCK_COMPANION_RESPONSE = {
  reply: 'Xin chào! Tôi có thể giúp gì cho bạn?',
  intent: 'general_conversation',
  targetDomain: 'learning',
  contextPackage: {
    schemaVersion: 1,
    requestId: '11111111-1111-4111-8111-111111111111',
    personId: '22222222-2222-4222-8222-222222222222',
    domain: 'learning',
    purpose: 'companion_conversation',
    tokenBudget: 4000,
    tokenUsed: 150,
    items: [],
    truncated: false,
    createdAt: new Date().toISOString(),
  },
  proposedActions: [],
  executionSummary: {
    plannedSteps: 0,
    executedSteps: 0,
    pendingConfirmationSteps: 0,
    rejectedSteps: 0,
  },
}

describe('companionApi', () => {
  describe('sendCompanionMessage', () => {
    it('gửi message thành công và nhận response', async () => {
      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toBe('/api/companion')
        expect(init?.method).toBe('POST')
        expect(JSON.parse(init?.body as string)).toEqual({ message: 'Xin chào' })
        return new Response(JSON.stringify(MOCK_COMPANION_RESPONSE), { status: 200 })
      })
      vi.stubGlobal('fetch', fetchMock)

      const res = await sendCompanionMessage({ message: 'Xin chào' })
      expect(res.reply).toBe(MOCK_COMPANION_RESPONSE.reply)
      expect(res.intent).toBe('general_conversation')
    })

    it('báo lỗi khi API trả lỗi 401/500', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })),
      )

      await expect(sendCompanionMessage({ message: 'test' })).rejects.toThrow('Unauthorized')
    })
  })

  describe('listProposedActions', () => {
    it('lấy danh sách actions thành công', async () => {
      const mockActions = [
        {
          schemaVersion: 1,
          id: '33333333-3333-4333-8333-333333333333',
          personId: '22222222-2222-4222-8222-222222222222',
          capabilityId: 'learning.update_goal',
          action: 'Đặt mục tiêu IELTS 7.0',
          targetDomain: 'learning',
          payload: { goal: 'ielts_7' },
          riskLevel: 'medium',
          status: 'pending',
          version: 1,
          createdAt: new Date().toISOString(),
        },
      ]

      const fetchMock = vi.fn(async (url: string) => {
        expect(url).toContain('/api/proposed-actions?status=pending')
        return new Response(JSON.stringify({ actions: mockActions }), { status: 200 })
      })
      vi.stubGlobal('fetch', fetchMock)

      const actions = await listProposedActions('pending')
      expect(actions).toHaveLength(1)
      expect(actions[0].action).toBe('Đặt mục tiêu IELTS 7.0')
    })
  })

  describe('confirmProposedAction & rejectProposedAction', () => {
    it('confirm gọi PATCH với action=confirm', async () => {
      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toBe('/api/proposed-actions')
        expect(init?.method).toBe('PATCH')
        const body = JSON.parse(init?.body as string)
        expect(body.action).toBe('confirm')
        expect(body.id).toBe('action-123')
        expect(body.expectedVersion).toBe(1)
        return new Response(JSON.stringify({ action: { id: 'action-123', status: 'confirmed' } }), {
          status: 200,
        })
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await confirmProposedAction('action-123', 1)
      expect(result.action.status).toBe('confirmed')
    })

    it('reject gọi PATCH với action=reject và reason', async () => {
      const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
        expect(url).toBe('/api/proposed-actions')
        expect(init?.method).toBe('PATCH')
        const body = JSON.parse(init?.body as string)
        expect(body.action).toBe('reject')
        expect(body.reason).toBe('Không muốn')
        return new Response(JSON.stringify({ action: { id: 'action-123', status: 'rejected' } }), {
          status: 200,
        })
      })
      vi.stubGlobal('fetch', fetchMock)

      const result = await rejectProposedAction('action-123', 1, 'Không muốn')
      expect(result.action.status).toBe('rejected')
    })
  })
})
