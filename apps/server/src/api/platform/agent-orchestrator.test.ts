// api/agent-orchestrator.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './agent-orchestrator.js'
import * as security from '@dhcb/core-auth/security'

// Handler đã chuyển state sang platform.feature_state — mock bằng Map in-memory (hành vi giống
// hệt Map cấp module cũ: state sống suốt file test), theo đúng khuôn pvp-arena.test.ts.
const featureStore = new Map<string, unknown>()
vi.mock('@dhcb/core-db/featureState', () => ({
  getFeatureState: vi.fn(async (u: string, f: string) => featureStore.get(u + '|' + f) ?? null),
  setFeatureState: vi.fn(async (u: string, f: string, st: unknown) => {
    featureStore.set(u + '|' + f, st)
  }),
}))

describe('Agent Orchestrator API Handler (/api/agent-orchestrator)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/agent-orchestrator', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('orchestrates and creates an agent session on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/agent-orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionTitle: 'Lập Kế Hoạch Đột Phá IELTS 8.0',
        primaryRole: 'socratic_mentor',
        userGoalDescription: 'Phân tích điểm nghẽn và xây dựng chiến lược học 3 tháng',
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.session.schemaVersion).toBe('v5.5.0')
    expect(data.session.primaryRole).toBe('socratic_mentor')
    expect(data.session.steps).toHaveLength(5)
  })

  it('fetches sessions on GET', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/agent-orchestrator', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.sessions)).toBe(true)
  })

  it('handles OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/agent-orchestrator', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unsupported method', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '22222222-2222-4222-8222-222222222222',
    })
    const req = new Request('http://localhost/api/agent-orchestrator', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('rejects POST missing required fields', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '22222222-2222-4222-8222-222222222222',
    })
    const req = new Request('http://localhost/api/agent-orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionTitle: 'Thiếu trường' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects POST invalid role', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '22222222-2222-4222-8222-222222222222',
    })
    const req = new Request('http://localhost/api/agent-orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionTitle: 'Test',
        primaryRole: 'not_a_real_role',
        userGoalDescription: 'Mô tả',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toContain('Invalid role')
  })

  it('finds a specific session by sessionId on GET, and 404s for unknown id', async () => {
    const userId = '33333333-3333-4333-8333-333333333333'
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({ userId })
    const createReq = new Request('http://localhost/api/agent-orchestrator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionTitle: 'Phiên tra cứu',
        primaryRole: 'code_architect',
        userGoalDescription: 'Mô tả mục tiêu',
      }),
    })
    const createRes = await handler(createReq)
    const created = await createRes.json()
    const sessionId = created.session.sessionId

    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({ userId })
    const foundReq = new Request(`http://localhost/api/agent-orchestrator?sessionId=${sessionId}`, {
      method: 'GET',
    })
    const foundRes = await handler(foundReq)
    expect(foundRes.status).toBe(200)
    const foundData = await foundRes.json()
    expect(foundData.session.sessionId).toBe(sessionId)

    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({ userId })
    const notFoundReq = new Request(
      'http://localhost/api/agent-orchestrator?sessionId=does-not-exist',
      { method: 'GET' },
    )
    const notFoundRes = await handler(notFoundReq)
    expect(notFoundRes.status).toBe(404)
  })
})
