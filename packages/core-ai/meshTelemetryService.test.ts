// packages/core-ai/meshTelemetryService.test.ts
import { describe, it, expect } from 'vitest'
import { MeshTelemetryService } from './meshTelemetryService.js'

describe('MeshTelemetryService', () => {
  it('evaluates mesh health and computes quality score', () => {
    const connections = [
      {
        peerId: 'edge-sin-01',
        role: 'audio_streamer' as const,
        latencyMs: 45,
        p95LatencyMs: 60,
        packetsSent: 500,
        packetsLost: 0,
        lossRatePercent: 0,
        jitterMs: 3,
        qualityScore: 100,
        status: 'connected' as const,
        lastHeartbeat: new Date().toISOString(),
      },
    ]

    const health = MeshTelemetryService.evaluateMeshHealth(connections)
    expect(health.meshStatus).toBe('optimal')
    expect(health.overallQuality).toBe(100)
    expect(health.averageLatencyMs).toBe(45)
  })

  it('tracks live session cost and triggers budget warning and throttle', () => {
    const initial = MeshTelemetryService.createDefaultSessionTelemetry({
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      costCapUsd: 0.01,
    })

    const updated = MeshTelemetryService.trackLiveSessionCost({
      current: initial,
      addedTokens: 20000,
      addedAudioSeconds: 240,
      provider: 'elevenlabs_tts',
      latencyMs: 65,
    })

    expect(updated.accumulatedCostUsd).toBeGreaterThan(0)
    expect(updated.isThrottled).toBe(true)
    expect(updated.qualityTier).toBe('economy_edge')
  })
})
