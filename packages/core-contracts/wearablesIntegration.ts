// packages/core-contracts/wearablesIntegration.ts — Hợp đồng dữ liệu cho Wearables & Circadian Bio-Adaptive MCP V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const WEARABLES_SCHEMA_VERSION = 'v3.0.0'

export const WearableSourceSchema = z.enum([
  'apple_health',
  'oura_ring',
  'garmin_connect',
  'fitbit',
])

export type WearableSource = z.infer<typeof WearableSourceSchema>

export const BioStreamRecordSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    source: WearableSourceSchema,
    hrvMs: z.number().positive(),
    restingHeartRateBpm: z.number().int().positive(),
    sleepQualityScore: z.number().min(0).max(100),
    deepSleepMinutes: z.number().nonnegative(),
    readinessScore: z.number().min(0).max(100),
    recordedAt: IsoDateTimeSchema,
    schemaVersion: z.literal(WEARABLES_SCHEMA_VERSION),
  })
  .strict()

export type BioStreamRecord = z.infer<typeof BioStreamRecordSchema>

export const CognitiveBandSchema = z.enum([
  'peak_analytical',
  'creative_fluid',
  'maintenance',
  'fatigued_recharge',
])

export type CognitiveBand = z.infer<typeof CognitiveBandSchema>

export const CircadianLearningWindowSchema = z
  .object({
    personId: UuidSchema,
    currentCognitiveBand: CognitiveBandSchema,
    readinessScore: z.number().min(0).max(100),
    goldenWindowStart: z.string().regex(/^\d{2}:\d{2}$/),
    goldenWindowEnd: z.string().regex(/^\d{2}:\d{2}$/),
    recommendedDifficulty: z.enum(['advanced', 'moderate', 'light_listening']),
    adaptationAdvice: z.string().min(1).max(500),
    evaluatedAt: IsoDateTimeSchema,
    schemaVersion: z.literal(WEARABLES_SCHEMA_VERSION),
  })
  .strict()

export type CircadianLearningWindow = z.infer<typeof CircadianLearningWindowSchema>
