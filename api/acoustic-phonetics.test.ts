import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from './acoustic-phonetics.js'
import * as security from '../packages/core-auth/security.js'

describe('api/acoustic-phonetics', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects unauthenticated requests with 401', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce(null)

    const req = new Request('http://localhost/api/acoustic-phonetics', {
      method: 'POST',
      body: JSON.stringify({ targetSentence: 'Hello world' }),
    })

    const res = await handler(req)
    expect(res.status).toBe(401)
  })

  it('analyzes sentence acoustics and returns GOP report with 200', async () => {
    vi.spyOn(security, 'validateAuth').mockResolvedValueOnce({
      userId: '11111111-1111-4111-8111-111111111111',
    })

    const req = new Request('http://localhost/api/acoustic-phonetics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetSentence: 'Think outside the box',
        spokenTranscript: 'Tink outside the box',
        pcmAudioLengthMs: 2200,
      }),
    })

    const res = await handler(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.overallGopScore).toBeDefined()
    expect(data.phonemes.length).toBeGreaterThan(0)
    expect(data.schemaVersion).toBe('v4.0.0')
  })
})
