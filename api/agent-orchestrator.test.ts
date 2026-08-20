// api/agent-orchestrator.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './agent-orchestrator.js'
import * as security from '../packages/core-auth/security.js'

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
})
