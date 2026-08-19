import { describe, it, expect } from 'vitest'
import { listShadowingPassages, evaluateShadowingSession } from './echoShadowingService.js'

describe('echoShadowingService', () => {
  it('lists predefined passages', () => {
    const list = listShadowingPassages()
    expect(list.length).toBeGreaterThanOrEqual(3)
    expect(list[0]?.id).toBe('jobs_stanford_commencement')
  })

  it('evaluates a shadowing session with optimal latency', () => {
    const personId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
    const session = evaluateShadowingSession(personId, 'jobs_stanford_commencement', 410, 92)
    expect(session.sessionId).toBeDefined()
    expect(session.overallShadowingBand).toBeGreaterThanOrEqual(8.0)
    expect(session.driftSamples.length).toBe(4)
    expect(session.coachingFeedback).toContain('Phản xạ nhại âm')
  })
})
