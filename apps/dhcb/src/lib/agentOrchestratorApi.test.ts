import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAgentSessions, createAutonomousAgentSession } from './agentOrchestratorApi'

describe('agentOrchestratorApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches agent sessions successfully', async () => {
    localStorage.setItem('gsa_session_token_v1', 'mock-token')
    const mockSessions = [
      {
        sessionId: 'sess-1',
        primaryRole: 'code_architect',
        status: 'completed',
      },
    ]

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, sessions: mockSessions }),
    } as unknown as Response)

    const sessions = await fetchAgentSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].primaryRole).toBe('code_architect')
  })

  it('creates autonomous agent session successfully', async () => {
    const mockSession = {
      sessionId: 'sess-2',
      primaryRole: 'socratic_mentor',
      status: 'completed',
      steps: [],
    }

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, session: mockSession }),
    } as unknown as Response)

    const session = await createAutonomousAgentSession({
      sessionTitle: 'Test Session',
      primaryRole: 'socratic_mentor',
      userGoalDescription: 'Test Goal',
    })

    expect(session.sessionId).toBe('sess-2')
    expect(session.primaryRole).toBe('socratic_mentor')
  })

  it('throws error when creating session fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 400,
    } as unknown as Response)

    await expect(
      createAutonomousAgentSession({
        sessionTitle: 'Test',
        primaryRole: 'socratic_mentor',
        userGoalDescription: 'Test',
      }),
    ).rejects.toThrow('Lỗi khởi tạo phiên Agent tự trị: 400')
  })
})
