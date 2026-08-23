// packages/core-contracts/debateArena.ts — V5 Flagship AI Debate Arena & Socratic Multi-Agent Contracts.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const DebatePersonaRoleSchema = z.enum([
  'affirmative',
  'negative',
  'socratic_moderator',
  'devils_advocate',
])
export type DebatePersonaRole = z.infer<typeof DebatePersonaRoleSchema>

export const DebatePersonaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  avatar: z.string().min(1).max(50),
  role: DebatePersonaRoleSchema,
  stance: z.string().min(1).max(200),
  style: z.enum(['analytical', 'passionate', 'philosophical', 'pragmatic']),
  cefrTargetLevel: z.enum(['B2', 'C1', 'C2']),
})
export type DebatePersona = z.infer<typeof DebatePersonaSchema>

export const LogicalFallacyTypeSchema = z.enum([
  'ad_hominem',
  'strawman',
  'false_dilemma',
  'slippery_slope',
  'circular_reasoning',
  'hasty_generalization',
  'appeal_to_emotion',
  'none',
])
export type LogicalFallacyType = z.infer<typeof LogicalFallacyTypeSchema>

export const ToulminAnalysisSchema = z.object({
  claim: z.string().min(1).max(500),
  evidence: z.string().max(500).optional(),
  warrant: z.string().max(500).optional(),
  rebuttal: z.string().max(500).optional(),
  hasValidStructure: z.boolean(),
})
export type ToulminAnalysis = z.infer<typeof ToulminAnalysisSchema>

export const DebateTurnSchema = z.object({
  id: z.string().min(1),
  speakerId: z.string().min(1),
  speakerName: z.string().min(1),
  speakerRole: z.union([DebatePersonaRoleSchema, z.literal('user')]),
  content: z.string().min(1).max(2000),
  detectedFallacy: LogicalFallacyTypeSchema,
  fallacyExplanation: z.string().max(500).optional(),
  toulmin: ToulminAnalysisSchema.optional(),
  advancedVocabulary: z.array(z.string()).default([]),
  logicScore: z.number().min(0).max(100),
  persuasionScore: z.number().min(0).max(100),
  timestamp: IsoDateTimeSchema,
  // Lượt này do MẪU CỨNG sinh ra vì không gọi được AI (thiếu key / provider lỗi), KHÔNG phải
  // AI thật. Có cờ này để UI nói thật với người học thay vì để họ tưởng đang đấu với AI —
  // trước 2026-08-23 toàn bộ lượt "AI" đều là 1 trong 3 đoạn cứng mà không ai biết.
  isFallback: z.boolean().optional(),
})
export type DebateTurn = z.infer<typeof DebateTurnSchema>

export const DebateSessionConfigSchema = z.object({
  topicId: z.string().min(1),
  motion: z.string().min(1).max(300),
  category: z.enum(['technology', 'economics', 'education', 'philosophy', 'environment']),
  userStance: z.enum(['support', 'oppose']),
  difficulty: z.enum(['intermediate_b2', 'advanced_c1', 'mastery_c2']),
  maxRounds: z.number().int().min(2).max(10).default(4),
})
export type DebateSessionConfig = z.infer<typeof DebateSessionConfigSchema>

export const DebateRubricScoreSchema = z.object({
  toulminStructureScore: z.number().min(0).max(100),
  fallacyAvoidanceScore: z.number().min(0).max(100),
  lexicalResourceScore: z.number().min(0).max(100),
  rebuttalEffectivenessScore: z.number().min(0).max(100),
  overallScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  recommendedPhrases: z.array(z.string()),
})
export type DebateRubricScore = z.infer<typeof DebateRubricScoreSchema>

export const DebateSessionStateSchema = z.object({
  id: z.string().min(1),
  personId: UuidSchema,
  config: DebateSessionConfigSchema,
  personas: z.array(DebatePersonaSchema),
  turns: z.array(DebateTurnSchema),
  currentRound: z.number().int().min(1),
  status: z.enum(['active', 'evaluating', 'completed']),
  finalRubric: DebateRubricScoreSchema.optional(),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type DebateSessionState = z.infer<typeof DebateSessionStateSchema>
