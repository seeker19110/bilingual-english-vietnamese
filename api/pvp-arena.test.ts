// api/pvp-arena.test.ts
import { describe, it, expect, vi } from 'vitest'
import handler from './pvp-arena.js'

vi.mock('../packages/core-auth/security.js', () => ({
  validateAuth: vi.fn().mockResolvedValue({ userId: 'u-test-123' }),
}))

describe('api/pvp-arena endpoint', () => {
  it('handles GET request returning user profile and leaderboard', async () => {
    const req = new Request('http://localhost/api/pvp-arena', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.profile.eloRating).toBeDefined()
    expect(data.leaderboard.length).toBeGreaterThan(0)
  })

  it('handles GET leaderboard action specifically', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=leaderboard', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.leaderboard[0].rank).toBe(1)
  })

  it('handles POST matchmake action and creates match with questions', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 'vocab_speed_duel',
        playerProfile: {
          id: 'u-test-123',
          name: 'Player Test',
          avatar: '🦁',
          eloRating: 1300,
          rankTier: 'gold',
          winStreak: 1,
          totalMatches: 4,
          wins: 3,
          isGhostBot: false,
        },
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.match.matchId).toBeDefined()
    expect(data.match.questions.length).toBe(5)
    expect(data.match.player2.isGhostBot).toBe(true)
  })

  it('handles POST submit_round action and computes points', async () => {
    // 1. First matchmake
    const makeReq = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'vocab_speed_duel' }),
    })
    const makeRes = await handler(makeReq)
    const makeData = await makeRes.json()
    const matchId = makeData.match.matchId

    // 2. Submit round 0
    const submitReq = new Request('http://localhost/api/pvp-arena?action=submit_round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId,
        roundIndex: 0,
        selectedOption: makeData.match.questions[0].correctIndex,
        responseTimeMs: 1500,
      }),
    })
    const submitRes = await handler(submitReq)
    expect(submitRes.status).toBe(200)
    const submitData = await submitRes.json()
    expect(submitData.success).toBe(true)
    expect(submitData.p1Action.isCorrect).toBe(true)
    expect(submitData.p1Action.pointsEarned).toBeGreaterThan(100)
    expect(submitData.p2Action).toBeDefined()
  })
})
