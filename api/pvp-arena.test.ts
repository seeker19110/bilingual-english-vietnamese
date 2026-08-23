// api/pvp-arena.test.ts
import { describe, it, expect, vi } from 'vitest'
import handler from './pvp-arena.js'

vi.mock('@dhcb/core-auth/security', () => ({
  validateAuth: vi.fn().mockResolvedValue({ userId: 'u-test-123' }),
  getCorsHeaders: vi.fn().mockReturnValue({}),
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

  it('handles OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/pvp-arena', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unsupported method', async () => {
    const req = new Request('http://localhost/api/pvp-arena', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('rejects get_match without matchId', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=get_match', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('404s get_match for unknown matchId', async () => {
    const req = new Request(
      'http://localhost/api/pvp-arena?action=get_match&matchId=does-not-exist',
      { method: 'GET' },
    )
    const res = await handler(req)
    expect(res.status).toBe(404)
  })

  it('finds an existing match via get_match', async () => {
    const makeReq = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'vocab_speed_duel' }),
    })
    const makeRes = await handler(makeReq)
    const makeData = await makeRes.json()
    const matchId = makeData.match.matchId

    const req = new Request(`http://localhost/api/pvp-arena?action=get_match&matchId=${matchId}`, {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.match.matchId).toBe(matchId)
  })

  it('rejects submit_round missing required parameters', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=submit_round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects submit_round for unknown matchId', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=submit_round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        matchId: 'does-not-exist',
        roundIndex: 0,
        selectedOption: 0,
        responseTimeMs: 1000,
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(404)
  })

  it('rejects submit_round with invalid roundIndex', async () => {
    const makeReq = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'vocab_speed_duel' }),
    })
    const makeRes = await handler(makeReq)
    const makeData = await makeRes.json()
    const matchId = makeData.match.matchId

    const req = new Request('http://localhost/api/pvp-arena?action=submit_round', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, roundIndex: 999, selectedOption: 0, responseTimeMs: 1000 }),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('completes the match after the final round', async () => {
    const makeReq = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: 'vocab_speed_duel' }),
    })
    const makeRes = await handler(makeReq)
    const makeData = await makeRes.json()
    const { matchId, totalRounds, questions } = makeData.match

    let lastData: { isMatchCompleted?: boolean } = {}
    for (let i = 0; i < totalRounds; i++) {
      const submitReq = new Request('http://localhost/api/pvp-arena?action=submit_round', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          roundIndex: i,
          selectedOption: questions[i].correctIndex,
          responseTimeMs: 1200,
        }),
      })
      const submitRes = await handler(submitReq)
      lastData = await submitRes.json()
    }
    expect(lastData.isMatchCompleted).toBe(true)
  })

  it('rejects invalid POST action', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=unknown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })

  it('rejects invalid JSON payload on POST', async () => {
    const req = new Request('http://localhost/api/pvp-arena?action=matchmake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
  })
})
