// apps/english/src/lib/meshTelemetryApi.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchMeshTelemetry,
  recordLiveSessionMetric,
  resetSessionBudget,
} from './meshTelemetryApi.js'

describe('meshTelemetryApi client library', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('fetches mesh telemetry', async () => {
    const mockRes = {
      success: true,
      telemetry: { accumulatedCostUsd: 0.002, totalTokens: 350 },
      meshStatus: { overallQuality: 98 },
    }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockRes,
    } as unknown as Response)

    const data = await fetchMeshTelemetry()
    expect(data.telemetry.totalTokens).toBe(350)
    expect(data.meshStatus.overallQuality).toBe(98)
  })

  it('records live session metric', async () => {
    const mockTelemetry = { accumulatedCostUsd: 0.003, totalTokens: 800 }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, telemetry: mockTelemetry }),
    } as unknown as Response)

    const updated = await recordLiveSessionMetric({ addedTokens: 450, addedAudioSeconds: 10 })
    expect(updated.totalTokens).toBe(800)
  })

  it('resets session budget', async () => {
    const mockTelemetry = { costCapUsd: 0.5 }
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, telemetry: mockTelemetry }),
    } as unknown as Response)

    const updated = await resetSessionBudget(0.5)
    expect(updated.costCapUsd).toBe(0.5)
  })
})
