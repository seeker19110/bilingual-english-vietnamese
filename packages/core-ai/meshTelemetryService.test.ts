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

  it('handles empty connections and various degraded/critical mesh health statuses', () => {
    // Empty
    expect(MeshTelemetryService.evaluateMeshHealth([]).meshStatus).toBe('optimal')

    // Healthy (latency > 150, loss <= 5)
    const healthy = MeshTelemetryService.evaluateMeshHealth([
      {
        peerId: 'p1',
        role: 'audio_streamer',
        latencyMs: 160,
        p95LatencyMs: 180,
        packetsSent: 100,
        packetsLost: 0,
        lossRatePercent: 0,
        jitterMs: 10,
        qualityScore: 80,
        status: 'connected',
        lastHeartbeat: new Date().toISOString(),
      },
    ])
    expect(healthy.meshStatus).toBe('healthy')

    // Degraded (latency > 150, loss > 5 -> score = 100 - 20 - 30 = 50)
    const degraded = MeshTelemetryService.evaluateMeshHealth([
      {
        peerId: 'p2',
        role: 'audio_streamer',
        latencyMs: 200,
        p95LatencyMs: 250,
        packetsSent: 100,
        packetsLost: 6,
        lossRatePercent: 6,
        jitterMs: 10,
        qualityScore: 50,
        status: 'connected',
        lastHeartbeat: new Date().toISOString(),
      },
    ])
    expect(degraded.meshStatus).toBe('degraded')

    // Critical (latency > 300, loss > 5, jitter > 30)
    const critical = MeshTelemetryService.evaluateMeshHealth([
      {
        peerId: 'p3',
        role: 'audio_streamer',
        latencyMs: 400,
        p95LatencyMs: 500,
        packetsSent: 100,
        packetsLost: 15,
        lossRatePercent: 15,
        jitterMs: 45,
        qualityScore: 10,
        status: 'connected',
        lastHeartbeat: new Date().toISOString(),
      },
    ])
    expect(critical.meshStatus).toBe('critical')
  })

  it('handles budget warning without throttle and default values in telemetry', () => {
    const defaultTelemetry = MeshTelemetryService.createDefaultSessionTelemetry({
      sessionId: 's-def',
      personId: 'p-def',
    })
    expect(defaultTelemetry.costCapUsd).toBe(0.1)

    // Track cost with warning only (80% of $0.1 = $0.08)
    const warning = MeshTelemetryService.trackLiveSessionCost({
      current: defaultTelemetry,
      addedTokens: 280000, // ~ $0.084 on gemini_live
      addedAudioSeconds: 0,
      provider: 'gemini_live',
    })
    expect(warning.budgetWarning).toBe(true)
    expect(warning.isThrottled).toBe(false)
  })
})
