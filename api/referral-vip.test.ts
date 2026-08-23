// api/referral-vip.test.ts
import { describe, it, expect, vi } from 'vitest'
import handler from './referral-vip.js'

vi.mock('@dhcb/core-auth/security', () => ({
  validateAuth: vi.fn().mockResolvedValue({ userId: 'u-vip-999' }),
  getCorsHeaders: vi.fn().mockReturnValue({}),
}))

describe('api/referral-vip endpoint', () => {
  it('handles GET dashboard request', async () => {
    const req = new Request('http://localhost/api/referral-vip', { method: 'GET' })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.dashboard.referralCode).toBeDefined()
    expect(data.milestones.length).toBe(4)
  })

  it('handles GET milestones action', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=milestones', {
      method: 'GET',
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.milestones[0].tier).toBe('tier_1_spark')
  })

  it('handles POST generate_share_card action', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=generate_share_card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Nguyen Van A',
        avatar: '🦁',
        streakDays: 30,
        cefrLevel: 'C1',
      }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.cardData.name).toBe('Nguyen Van A')
    expect(data.cardData.vipGiftDays).toBe(7)
  })

  it('handles POST claim_milestone action', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=claim_milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ milestoneTier: 'tier_1_spark' }),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.success).toBe(true)
    expect(data.milestoneTier).toBe('tier_1_spark')
  })

  it('handles OPTIONS preflight', async () => {
    const req = new Request('http://localhost/api/referral-vip', { method: 'OPTIONS' })
    const res = await handler(req)
    expect(res.status).toBe(204)
  })

  it('rejects unsupported method', async () => {
    const req = new Request('http://localhost/api/referral-vip', { method: 'DELETE' })
    const res = await handler(req)
    expect(res.status).toBe(405)
  })

  it('rejects invalid POST action', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=unknown_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid action')
  })

  it('rejects invalid JSON payload on POST', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=generate_share_card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not valid json',
    })
    const res = await handler(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid JSON payload')
  })

  it('uses default card values when generate_share_card body omits fields', async () => {
    const req = new Request('http://localhost/api/referral-vip?action=generate_share_card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.cardData.name).toBe('Người Học Tiên Phong')
  })
})
