// packages/core-contracts/meshTelemetry.test.ts
import { describe, it, expect } from 'vitest'
import {
  MESH_TELEMETRY_VERSION,
  MeshNodeRoleSchema,
  MeshPeerConnectionSchema,
  RealtimeSessionTelemetrySchema,
} from './meshTelemetry.js'

describe('Mesh & Telemetry Contracts (V4.4)', () => {
  it('validates node roles', () => {
    expect(MeshNodeRoleSchema.parse('audio_streamer')).toBe('audio_streamer')
    expect(MeshNodeRoleSchema.parse('avatar_animator')).toBe('avatar_animator')
    expect(() => MeshNodeRoleSchema.parse('invalid')).toThrow()
  })

  it('validates a MeshPeerConnection', () => {
    const peer = {
      peerId: 'edge-tokyo-01',
      role: 'audio_streamer',
      latencyMs: 42,
      p95LatencyMs: 65,
      packetsSent: 1200,
      packetsLost: 2,
      lossRatePercent: 0.16,
      jitterMs: 4,
      qualityScore: 99,
      status: 'connected',
      lastHeartbeat: new Date().toISOString(),
    }

    const parsed = MeshPeerConnectionSchema.parse(peer)
    expect(parsed.peerId).toBe('edge-tokyo-01')
    expect(parsed.qualityScore).toBe(99)
  })

  it('validates RealtimeSessionTelemetrySchema', () => {
    const session = {
      sessionId: '11111111-1111-4111-8111-111111111111',
      personId: '22222222-2222-4222-8222-222222222222',
      startTime: new Date().toISOString(),
      durationSeconds: 180,
      activeProviders: ['gemini_live', 'elevenlabs_tts'],
      totalPromptTokens: 450,
      totalCompletionTokens: 210,
      totalTokens: 660,
      audioMinutes: 3.0,
      accumulatedCostUsd: 0.0034,
      costCapUsd: 0.1,
      budgetWarning: false,
      isThrottled: false,
      currentLatencyMs: 48,
      qualityTier: 'ultra_low_latency',
      schemaVersion: MESH_TELEMETRY_VERSION,
      updatedAt: new Date().toISOString(),
    }

    const parsed = RealtimeSessionTelemetrySchema.parse(session)
    expect(parsed.accumulatedCostUsd).toBe(0.0034)
    expect(parsed.schemaVersion).toBe('v4.4.0')
  })
})
