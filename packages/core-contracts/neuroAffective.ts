// packages/core-contracts/neuroAffective.ts — Hợp đồng dữ liệu cho Neuro-Affective Engine V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const NEURO_SCHEMA_VERSION = 'v3.0.0'

export const EnergyLevelSchema = z.enum([
  'peak_flow',
  'productive',
  'fatigued',
  'burnout_risk',
  'restorative',
])

export type EnergyLevel = z.infer<typeof EnergyLevelSchema>

export const ActiveShieldSchema = z.enum([
  'mute_notifications',
  'downscale_difficulty',
  'suggest_breathing',
  'extend_deadlines',
  'focus_timer_lock',
])

export type ActiveShield = z.infer<typeof ActiveShieldSchema>

export const BioMetricsSchema = z
  .object({
    heartRateBpm: z.number().int().positive().optional(),
    hrvMs: z.number().positive().optional(),
    sleepQualityScore: z.number().min(0).max(100).optional(),
    stressIndex: z.number().min(0).max(100).optional(),
  })
  .strict()

export type BioMetrics = z.infer<typeof BioMetricsSchema>

export const VoiceProsodyMetricsSchema = z
  .object({
    speakingRateWpm: z.number().nonnegative(),
    pitchStability: z.number().min(0).max(1),
    emotionalValence: z.enum(['positive', 'neutral', 'stressed', 'exhausted']),
  })
  .strict()

export type VoiceProsodyMetrics = z.infer<typeof VoiceProsodyMetricsSchema>

export const NeuroAffectiveStateSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    timestamp: IsoDateTimeSchema,
    energyLevel: EnergyLevelSchema,
    stressIndex: z.number().min(0).max(100),
    focusScore: z.number().min(0).max(100),
    bioMetrics: BioMetricsSchema.optional(),
    voiceProsody: VoiceProsodyMetricsSchema.optional(),
    activeShields: z.array(ActiveShieldSchema),
    recommendedAction: z.string().min(1).max(500),
    schemaVersion: z.literal(NEURO_SCHEMA_VERSION),
  })
  .strict()

export type NeuroAffectiveState = z.infer<typeof NeuroAffectiveStateSchema>
