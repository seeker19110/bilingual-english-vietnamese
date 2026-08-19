// packages/core-contracts/meshTelemetry.ts — Hợp đồng Mạng lưới WebSocket Phân tán & Telemetry Chi phí V4.4.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const MESH_TELEMETRY_VERSION = 'v4.4.0'

export const MeshNodeRoleSchema = z.enum([
  'relay_hub',
  'audio_streamer',
  'avatar_animator',
  'action_canvas_sync',
  'edge_node',
])

export type MeshNodeRole = z.infer<typeof MeshNodeRoleSchema>

export const MeshPeerConnectionSchema = z
  .object({
    peerId: z.string().min(1),
    role: MeshNodeRoleSchema,
    latencyMs: z.number().min(0).max(10000).default(50),
    p95LatencyMs: z.number().min(0).max(10000).default(75),
    packetsSent: z.number().int().min(0).default(0),
    packetsLost: z.number().int().min(0).default(0),
    lossRatePercent: z.number().min(0).max(100).default(0),
    jitterMs: z.number().min(0).max(1000).default(5),
    qualityScore: z.number().min(0).max(100).default(98),
    status: z.enum(['connected', 'reconnecting', 'degraded', 'disconnected']).default('connected'),
    lastHeartbeat: IsoDateTimeSchema,
  })
  .strict()

export type MeshPeerConnection = z.infer<typeof MeshPeerConnectionSchema>

export const AiProviderTypeSchema = z.enum([
  'gemini_live',
  'elevenlabs_tts',
  'whisper_stt',
  'groq_llama',
  'openai_realtime',
  'edge_onnx',
])

export type AiProviderType = z.infer<typeof AiProviderTypeSchema>

export const RealtimeSessionTelemetrySchema = z
  .object({
    sessionId: UuidSchema,
    personId: UuidSchema,
    startTime: IsoDateTimeSchema,
    durationSeconds: z.number().min(0).default(0),
    activeProviders: z.array(AiProviderTypeSchema).default(['gemini_live']),
    totalPromptTokens: z.number().int().min(0).default(0),
    totalCompletionTokens: z.number().int().min(0).default(0),
    totalTokens: z.number().int().min(0).default(0),
    audioMinutes: z.number().min(0).default(0),
    accumulatedCostUsd: z.number().min(0).default(0),
    costCapUsd: z.number().min(0).default(0.1), // 10 cents budget cap mặc định cho 1 phiên
    budgetWarning: z.boolean().default(false),
    isThrottled: z.boolean().default(false),
    currentLatencyMs: z.number().min(0).default(50),
    qualityTier: z
      .enum(['ultra_low_latency', 'standard_balanced', 'economy_edge'])
      .default('ultra_low_latency'),
    schemaVersion: z.literal(MESH_TELEMETRY_VERSION).default(MESH_TELEMETRY_VERSION),
    updatedAt: IsoDateTimeSchema,
  })
  .strict()

export type RealtimeSessionTelemetry = z.infer<typeof RealtimeSessionTelemetrySchema>
