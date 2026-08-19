// api/avatar-embodiment.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './avatar-embodiment.js'
import * as security from '../packages/core-auth/security.js'

describe('Avatar Embodiment API Handler (/api/avatar-embodiment)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthorized requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)
    const req = new Request('http://localhost/api/avatar-embodiment', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('returns default 3D embodiment configuration and state on GET', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/avatar-embodiment', {
      method: 'GET',
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const responseData = await res.json()
    expect(responseData.success).toBe(true)
    expect(responseData.config.renderMode).toBe('3d_cyber_avatar')
    expect(responseData.state.activeViseme.viseme).toBe('sil')
  })

  it('updates embodiment configuration on POST', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/avatar-embodiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        renderMode: 'live_orb',
        quality: 'medium',
        emissiveAccent: 'purple',
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const responseData = await res.json()
    expect(responseData.success).toBe(true)
    expect(responseData.config.renderMode).toBe('live_orb')
    expect(responseData.config.quality).toBe('medium')
  })
})
