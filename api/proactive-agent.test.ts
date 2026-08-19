// api/proactive-agent.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './proactive-agent.js'
import * as security from '../packages/core-auth/security.js'

describe('Proactive Agent API Handler (/api/proactive-agent)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/proactive-agent', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns proactive agent state on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request(
      'http://localhost/api/proactive-agent?circadianEnergy=90&stressIndex=25',
      {
        method: 'GET',
      },
    )

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.state).toBeDefined()
    expect(data.state.autoPilotPlans.length).toBeGreaterThan(0)
  })

  it('executes action on POST with action=execute_action', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/proactive-agent?action=execute_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nudgeId: 'nudge-test-1',
        actionPayload: {
          id: 'act-test-1',
          label: 'Luyện tập ngay',
          actionType: 'start_micro_drill',
          targetUrl: '/dong-hanh',
        },
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.result.success).toBe(true)
  })

  it('updates configuration on POST with action=update_config', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/proactive-agent?action=update_config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: {
          nudgeFrequency: 'gentle',
        },
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.config.nudgeFrequency).toBe('gentle')
  })
})
