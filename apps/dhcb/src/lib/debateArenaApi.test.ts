// apps/dhcb/src/lib/debateArenaApi.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createDebateSessionApi,
  evaluateDebateMatchApi,
  fetchDebateTopics,
  submitDebateTurnApi,
} from './debateArenaApi.js'

describe('debateArenaApi Client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.setItem('gsa_session_token_v1', 'fake-token-123')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('fetches debate topics successfully', async () => {
    const mockTopics = [
      {
        topicId: 't1',
        motion: 'AI should replace human judges',
        category: 'technology' as const,
        difficulty: 'advanced_c1' as const,
      },
    ]

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ topics: mockTopics }),
    } as unknown as Response)

    const topics = await fetchDebateTopics()
    expect(topics).toEqual(mockTopics)
  })

  it('throws error when fetching debate topics fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(fetchDebateTopics()).rejects.toThrow('Lỗi tải danh sách chủ đề tranh biện: 500')
  })

  it('creates debate session successfully', async () => {
    const mockSession = {
      sessionId: 's1',
      topicId: 't1',
      status: 'active',
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ session: mockSession }),
    } as unknown as Response)

    const session = await createDebateSessionApi({
      topicId: 't1',
      userStance: 'pro',
      difficulty: 'advanced_c1',
      maxTurns: 3,
    })
    expect(session).toEqual(mockSession)
  })

  it('throws error when creating debate session fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(
      createDebateSessionApi({
        topicId: 't1',
        userStance: 'pro',
        difficulty: 'advanced_c1',
        maxTurns: 3,
      }),
    ).rejects.toThrow('Lỗi khởi tạo phiên tranh biện: 400')
  })

  it('submits debate turn successfully', async () => {
    const mockResult = {
      userTurn: { id: 'u1', content: 'Argument' },
      aiTurn: { id: 'a1', content: 'Rebuttal' },
      session: { sessionId: 's1' },
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResult,
    } as unknown as Response)

    const res = await submitDebateTurnApi({ sessionId: 's1', content: 'Argument' })
    expect(res).toEqual(mockResult)
  })

  it('throws error when submitting debate turn fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 422,
    } as unknown as Response)

    await expect(submitDebateTurnApi({ sessionId: 's1', content: 'Argument' })).rejects.toThrow(
      'Lỗi gửi lượt tranh biện: 422',
    )
  })

  it('evaluates debate match successfully', async () => {
    const mockRubric = {
      overallScore: 8.5,
      logicScore: 9,
      deliveryScore: 8,
    }

    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ rubric: mockRubric }),
    } as unknown as Response)

    const rubric = await evaluateDebateMatchApi('s1')
    expect(rubric).toEqual(mockRubric)
  })

  it('throws error when evaluating debate match fails', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as unknown as Response)

    await expect(evaluateDebateMatchApi('s1')).rejects.toThrow('Lỗi chấm điểm trận tranh biện: 500')
  })
})
