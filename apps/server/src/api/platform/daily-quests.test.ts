// api/daily-quests.test.ts
import { describe, it, expect, vi } from 'vitest'
import handler from './daily-quests.js'

vi.mock('@dhcb/core-auth/security', () => ({
  validateAuth: vi.fn().mockResolvedValue({ userId: 'u-quest-tester' }),
  getCorsHeaders: vi.fn().mockReturnValue({}),
}))

describe('api/daily-quests endpoint', () => {
  it('handles GET daily quests state request', async () => {
    const req = new Request('http://localhost/api/daily-quests', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.state.quests.length).toBe(3)
    expect(data.state.allCompleted).toBe(false)
  })

  it('handles POST update_progress action', async () => {
    const req = new Request('http://localhost/api/daily-quests?action=update_progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: 'vocab_mastery', amount: 5 }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.state.quests[0].currentProgress).toBe(5)
  })

  it('handles POST claim_chest error when not unlocked', async () => {
    const req = new Request('http://localhost/api/daily-quests?action=claim_chest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('handles POST claim_chest success when all quests completed', async () => {
    // Complete all 3 quests
    await handler(
      new Request('http://localhost/api/daily-quests?action=update_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'vocab_mastery', amount: 10 }),
      }),
    )
    await handler(
      new Request('http://localhost/api/daily-quests?action=update_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'pvp_battle', amount: 1 }),
      }),
    )
    await handler(
      new Request('http://localhost/api/daily-quests?action=update_progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'ai_dialogue', amount: 3 }),
      }),
    )

    // Now claim chest
    const req = new Request('http://localhost/api/daily-quests?action=claim_chest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.rewards.streakFreeze).toBe(1)
    expect(data.state.chestState.isClaimed).toBe(true)
  })

  it('handles OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/daily-quests', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unsupported method', async () => {
    const req = new Request('http://localhost/api/daily-quests', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('rejects update_progress missing category', async () => {
    const req = new Request('http://localhost/api/daily-quests?action=update_progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid POST action', async () => {
    const req = new Request('http://localhost/api/daily-quests?action=unknown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid JSON payload on POST', async () => {
    const req = new Request('http://localhost/api/daily-quests?action=update_progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })
})
