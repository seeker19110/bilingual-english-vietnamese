// api/stem-scratchpad.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './stem-scratchpad.js'
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

  it('handles OPTIONS request with 204', async () => {
    const res = await handler(
      new Request('http://localhost/api/stem-scratchpad', { method: 'OPTIONS' }),
    )
    expect(res.status).toBe(204)
  })

  it('handles GET specific problemId (found and not found)', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // Not found
    const notFoundRes = await handler(
      new Request('http://localhost/api/stem-scratchpad?problemId=nonexistent', { method: 'GET' }),
    )
    expect(notFoundRes.status).toBe(404)

    // Create problem
    const createReq = new Request('http://localhost/api/stem-scratchpad?action=create_problem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'math',
        title: 'Equation',
        problemStatement: '2x = 10',
      }),
    })
    const createRes = await handler(createReq)
    const { problem } = await createRes.json()

    // Found
    const foundRes = await handler(
      new Request(`http://localhost/api/stem-scratchpad?problemId=${problem.id}`, {
        method: 'GET',
      }),
    )
    expect(foundRes.status).toBe(200)
  })

  it('validates missing fields and actions on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValue({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    // Missing create fields
    const badCreate = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=create_problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(badCreate.status).toBe(400)

    // Missing latexInput in validate_step
    const badStep = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=validate_step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(badStep.status).toBe(400)

    // Validate step with fallback problem creation and solving condition
    const solvedStep = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=validate_step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latexInput: 'x = 5', explanation: 'Final answer' }),
      }),
    )
    expect(solvedStep.status).toBe(200)
    const solvedData = await solvedStep.json()
    expect(solvedData.isSolved).toBe(true)

    // Get hint (not found vs found)
    const notFoundHint = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=get_hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: 'ghost' }),
      }),
    )
    expect(notFoundHint.status).toBe(404)

    const foundHint = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=get_hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: solvedData.problem.id }),
      }),
    )
    expect(foundHint.status).toBe(200)

    // Invalid action
    const badAction = await handler(
      new Request('http://localhost/api/stem-scratchpad?action=fake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )
    expect(badAction.status).toBe(400)

    // Method not allowed
    const badMethod = await handler(
      new Request('http://localhost/api/stem-scratchpad', { method: 'PATCH' }),
    )
    expect(badMethod.status).toBe(405)
  })
})
