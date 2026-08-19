// packages/core-contracts/echoShadowing.ts — Hợp đồng dữ liệu cho Real-Time Echo Shadowing Engine V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const SHADOWING_SCHEMA_VERSION = 'v3.0.0'

export const ShadowingDifficultySchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'native_fast',
])

export type ShadowingDifficulty = z.infer<typeof ShadowingDifficultySchema>

export const ShadowingPassageSchema = z
  .object({
    id: z.string().min(1).max(50),
    title: z.string().min(1).max(200),
    targetText: z.string().min(1).max(1000),
    speakerAccent: z.enum(['us_standard', 'uk_rp', 'australian']),
    audioUrl: z.string().min(1).max(300),
    bpmPacing: z.number().int().positive(),
    syllableCount: z.number().int().positive(),
    difficulty: ShadowingDifficultySchema,
    schemaVersion: z.literal(SHADOWING_SCHEMA_VERSION),
  })
  .strict()

export type ShadowingPassage = z.infer<typeof ShadowingPassageSchema>

export const AcousticDriftSampleSchema = z
  .object({
    timeOffsetMs: z.number().nonnegative(),
    driftLatencyMs: z.number().nonnegative(),
    phonemeMatchScore: z.number().min(0).max(100),
  })
  .strict()

export type AcousticDriftSample = z.infer<typeof AcousticDriftSampleSchema>

export const ShadowingSessionSchema = z
  .object({
    sessionId: UuidSchema,
    personId: UuidSchema,
    passageId: z.string().min(1).max(50),
    averageDriftLatencyMs: z.number().nonnegative(),
    rhythmSyncScore: z.number().min(0).max(100),
    fluencyScore: z.number().min(0).max(100),
    overallShadowingBand: z.number().min(0).max(9.0),
    driftSamples: z.array(AcousticDriftSampleSchema),
    coachingFeedback: z.string().min(1).max(1000),
    createdAt: IsoDateTimeSchema,
    schemaVersion: z.literal(SHADOWING_SCHEMA_VERSION),
  })
  .strict()

export type ShadowingSession = z.infer<typeof ShadowingSessionSchema>
