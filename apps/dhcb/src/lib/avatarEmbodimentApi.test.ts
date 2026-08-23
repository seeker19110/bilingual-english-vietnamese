// apps/dhcb/src/lib/avatarEmbodimentApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAvatarEmbodiment, updateAvatarEmbodiment } from './avatarEmbodimentApi.js'

describe('avatarEmbodimentApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches avatar embodiment config and state', async () => {
    const mockData = {
      success: true,
      config: { renderMode: '3d_cyber_avatar', quality: 'high' },
      state: { breathPhase: 0.5 },
    }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as unknown as Response)

    const result = await fetchAvatarEmbodiment()
    expect(result.config.renderMode).toBe('3d_cyber_avatar')
    expect(result.state.breathPhase).toBe(0.5)
  })

  it('updates avatar embodiment config via POST', async () => {
    const mockUpdated = {
      success: true,
      config: { renderMode: 'live_orb', quality: 'medium' },
    }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockUpdated,
    } as unknown as Response)

    const updated = await updateAvatarEmbodiment({ renderMode: 'live_orb' })
    expect(updated.renderMode).toBe('live_orb')
  })
})
