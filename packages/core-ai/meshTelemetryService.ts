// packages/core-ai/meshTelemetryService.ts — Động cơ Quản lý Mạng lưới & Telemetry Chi phí V4.4.
import {
  MeshPeerConnection,
  RealtimeSessionTelemetry,
  AiProviderType,
  MESH_TELEMETRY_VERSION,
} from '@dhcb/core-contracts/meshTelemetry'

export const PROVIDER_UNIT_RATES_USD: Record<
  AiProviderType,
  { per1kTokens: number; perAudioMin: number }
> = {
  gemini_live: { per1kTokens: 0.0003, perAudioMin: 0.002 },
  elevenlabs_tts: { per1kTokens: 0.0015, perAudioMin: 0.008 },
  whisper_stt: { per1kTokens: 0.0001, perAudioMin: 0.001 },
  groq_llama: { per1kTokens: 0.0002, perAudioMin: 0.0 },
  openai_realtime: { per1kTokens: 0.005, perAudioMin: 0.02 },
  edge_onnx: { per1kTokens: 0.0, perAudioMin: 0.0 }, // Hoàn toàn miễn phí trên thiết bị người dùng
}

export class MeshTelemetryService {
  /**
   * Đánh giá chất lượng mạng lưới WebSocket Mesh và tính toán Quality Score
   */
  static evaluateMeshHealth(connections: MeshPeerConnection[]): {
    overallQuality: number
    meshStatus: 'optimal' | 'healthy' | 'degraded' | 'critical'
    averageLatencyMs: number
  } {
    if (connections.length === 0) {
      return { overallQuality: 100, meshStatus: 'optimal', averageLatencyMs: 0 }
    }

    const totalLatency = connections.reduce((acc, c) => acc + c.latencyMs, 0)
    const avgLatency = Math.round(totalLatency / connections.length)

    let scoreSum = 0
    connections.forEach((c) => {
      let nodeScore = 100
      if (c.latencyMs > 300) nodeScore -= 40
      else if (c.latencyMs > 150) nodeScore -= 20
      if (c.lossRatePercent > 5) nodeScore -= 30
      if (c.jitterMs > 30) nodeScore -= 20
      scoreSum += Math.max(0, nodeScore)
    })

    const overallQuality = Math.round(scoreSum / connections.length)
    let meshStatus: 'optimal' | 'healthy' | 'degraded' | 'critical' = 'optimal'

    if (overallQuality < 40) meshStatus = 'critical'
    else if (overallQuality < 75) meshStatus = 'degraded'
    else if (overallQuality < 90) meshStatus = 'healthy'

    return { overallQuality, meshStatus, averageLatencyMs: avgLatency }
  }

  /**
   * Tính toán và ghi nhận chi phí thời gian thực cho phiên đàm thoại
   */
  static trackLiveSessionCost(params: {
    current: RealtimeSessionTelemetry
    addedTokens: number
    addedAudioSeconds: number
    provider: AiProviderType
    latencyMs?: number
  }): RealtimeSessionTelemetry {
    const { current, addedTokens, addedAudioSeconds, provider, latencyMs = 50 } = params
    const rates = PROVIDER_UNIT_RATES_USD[provider] || PROVIDER_UNIT_RATES_USD.gemini_live

    const tokenCost = (addedTokens / 1000) * rates.per1kTokens
    const audioCost = (addedAudioSeconds / 60) * rates.perAudioMin
    const deltaCost = tokenCost + audioCost

    const newAccumulatedCost = current.accumulatedCostUsd + deltaCost
    const newTotalTokens = current.totalTokens + addedTokens
    const newDuration = current.durationSeconds + addedAudioSeconds
    const newAudioMins = current.audioMinutes + addedAudioSeconds / 60

    const budgetWarning = newAccumulatedCost >= current.costCapUsd * 0.8
    const isThrottled = newAccumulatedCost >= current.costCapUsd

    let qualityTier = current.qualityTier
    if (isThrottled) {
      qualityTier = 'economy_edge'
    }

    return {
      ...current,
      durationSeconds: Math.round(newDuration),
      audioMinutes: Math.round(newAudioMins * 100) / 100,
      totalTokens: newTotalTokens,
      accumulatedCostUsd: Math.round(newAccumulatedCost * 100000) / 100000,
      budgetWarning,
      isThrottled,
      currentLatencyMs: latencyMs,
      qualityTier,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Tạo telemetry mặc định cho phiên mới
   */
  static createDefaultSessionTelemetry(params: {
    sessionId: string
    personId: string
    costCapUsd?: number
  }): RealtimeSessionTelemetry {
    const now = new Date().toISOString()
    return {
      sessionId: params.sessionId,
      personId: params.personId,
      startTime: now,
      durationSeconds: 0,
      activeProviders: ['gemini_live'],
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      audioMinutes: 0,
      accumulatedCostUsd: 0,
      costCapUsd: params.costCapUsd || 0.1,
      budgetWarning: false,
      isThrottled: false,
      currentLatencyMs: 45,
      qualityTier: 'ultra_low_latency',
      schemaVersion: MESH_TELEMETRY_VERSION,
      updatedAt: now,
    }
  }
}
