// packages/core-contracts/scenarioHolodeck.ts — Hợp đồng dữ liệu cho Scenario Holodeck Engine V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const HOLODECK_SCHEMA_VERSION = 'v3.0.0'

export const ScenarioTypeSchema = z.enum([
  'panel_interview',
  'vc_pitch',
  'ielts_speaking_mock',
  'salary_negotiation',
  'cross_cultural_conflict',
])

export type ScenarioType = z.infer<typeof ScenarioTypeSchema>

export const PersonaRoleSchema = z.enum([
  'tech_lead',
  'cfo_evaluator',
  'hr_director',
  'vc_investor',
  'ielts_examiner',
  'counterpart_negotiator',
  'team_mediator',
])

export type PersonaRole = z.infer<typeof PersonaRoleSchema>

export const HolodeckPersonaSchema = z
  .object({
    id: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
    role: PersonaRoleSchema,
    avatar: z.string().min(1).max(200),
    temperament: z.enum(['supportive', 'skeptical', 'neutral', 'aggressive', 'analytical']),
    speakingStyle: z.string().min(1).max(300),
  })
  .strict()

export type HolodeckPersona = z.infer<typeof HolodeckPersonaSchema>

export const HolodeckTurnSchema = z
  .object({
    turnIndex: z.number().int().nonnegative(),
    speakerType: z.enum(['user', 'persona', 'system_moderator']),
    personaId: z.string().optional(),
    content: z.string().min(1).max(3000),
    audioUrl: z.string().optional(),
    pressureScore: z.number().min(0).max(100),
    timestamp: IsoDateTimeSchema,
    instantFeedback: z
      .object({
        strengths: z.array(z.string()),
        weaknesses: z.array(z.string()),
        suggestedNuance: z.string().optional(),
      })
      .optional(),
  })
  .strict()

export type HolodeckTurn = z.infer<typeof HolodeckTurnSchema>

export const HolodeckRubricScoreSchema = z
  .object({
    fluencyAndCoherence: z.number().min(0).max(9),
    lexicalResource: z.number().min(0).max(9),
    grammaticalRange: z.number().min(0).max(9),
    strategicPersuasion: z.number().min(0).max(9),
    overallBand: z.number().min(0).max(9),
    detailedCritique: z.string().min(1).max(2000),
    recommendedDrills: z.array(z.string()),
  })
  .strict()

export type HolodeckRubricScore = z.infer<typeof HolodeckRubricScoreSchema>

export const HolodeckScenarioSchema = z
  .object({
    id: z.string().min(1).max(50),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    scenarioType: ScenarioTypeSchema,
    difficulty: z.enum(['beginner', 'intermediate', 'advanced', 'expert']),
    personas: z.array(HolodeckPersonaSchema).min(1).max(5),
    initialPrompt: z.string().min(1).max(1000),
    schemaVersion: z.literal(HOLODECK_SCHEMA_VERSION),
  })
  .strict()

export type HolodeckScenario = z.infer<typeof HolodeckScenarioSchema>

export const HolodeckSessionSchema = z
  .object({
    sessionId: UuidSchema,
    personId: UuidSchema,
    scenarioId: z.string().min(1).max(50),
    status: z.enum(['active', 'completed', 'abandoned']),
    currentPressure: z.number().min(0).max(100),
    turns: z.array(HolodeckTurnSchema),
    finalRubric: HolodeckRubricScoreSchema.optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    schemaVersion: z.literal(HOLODECK_SCHEMA_VERSION),
  })
  .strict()

export type HolodeckSession = z.infer<typeof HolodeckSessionSchema>
