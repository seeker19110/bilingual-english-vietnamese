// api/stem-scratchpad.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './stem-scratchpad.js'
import * as security from '../packages/core-auth/security.js'

describe('STEM Scratchpad API Handler (/api/stem-scratchpad)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/stem-scratchpad', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns sample problems on GET with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/stem-scratchpad', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.problems.length).toBeGreaterThan(0)
  })

  it('creates problem and validates algebraic step on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // 1. Create problem
    const createReq = new Request('http://localhost/api/stem-scratchpad?action=create_problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'math',
        title: 'Linear equation test',
        problemStatement: 'Solve 2x + 5 = 15',
        problemLatex: '2x + 5 = 15',
      }),
    })

    const createRes = await handler(createReq)
    expect(createRes.status).toBe(200)
    const probData = await createRes.json()
    expect(probData.success).toBe(true)
    const problemId = probData.problem.id

    // 2. Validate step
    const stepReq = new Request('http://localhost/api/stem-scratchpad?action=validate_step', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problemId,
        latexInput: '2x = 10',
        explanation: 'Subtract 5 from both sides',
      }),
    })

    const stepRes = await handler(stepReq)
    expect(stepRes.status).toBe(200)
    const stepData = await stepRes.json()
    expect(stepData.success).toBe(true)
    expect(stepData.validation.isValid).toBe(true)
  })
})
