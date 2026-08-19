// packages/core-contracts/metacognitiveReflection.ts — V5 Flagship Metacognitive Reflection & Socratic Journal Contracts.
import { z } from 'zod'
import { IsoDateTimeSchema } from './shared.js'

export const CognitiveBiasTypeSchema = z.enum([
  'dunning_kruger',
  'confirmation_bias',
  'sunk_cost',
  'imposter_syndrome',
  'overconfidence',
  'analysis_paralysis',
  'status_quo_bias',
  'none',
])
export type CognitiveBiasType = z.infer<typeof CognitiveBiasTypeSchema>

export const IdentifiedBiasSchema = z.object({
  biasType: CognitiveBiasTypeSchema,
  biasName: z.string().min(1),
  explanation: z.string().min(1),
  antidotePrompt: z.string().min(1),
  severity: z.enum(['low', 'moderate', 'high']),
})
export type IdentifiedBias = z.infer<typeof IdentifiedBiasSchema>

export const MetacognitiveReflectionSchema = z.object({
  id: z.string().min(1),
  personId: z.string().min(1),
  title: z.string().min(1).max(200),
  domain: z.enum(['learning', 'career', 'work', 'startup', 'life']),
  reflectionPrompt: z.string().min(1).max(500),
  userReflection: z.string().min(1).max(4000),
  ahaMoments: z.array(z.string()).default([]),
  identifiedBiases: z.array(IdentifiedBiasSchema).default([]),
  metacognitiveIndex: z.number().min(0).max(100),
  growthMindsetScore: z.number().min(0).max(100),
  socraticFollowUps: z.array(z.string()).default([]),
  actionCommitment: z.string().max(500).optional(),
  createdAt: IsoDateTimeSchema,
})
export type MetacognitiveReflection = z.infer<typeof MetacognitiveReflectionSchema>

export const SocraticDailyPromptSchema = z.object({
  id: z.string().min(1),
  domain: z.enum(['learning', 'career', 'work', 'startup', 'life']),
  theme: z.string().min(1),
  promptText: z.string().min(1),
  deepDivingQuestion: z.string().min(1),
  contextAnchor: z.string().optional(),
})
export type SocraticDailyPrompt = z.infer<typeof SocraticDailyPromptSchema>

export const MetacognitiveSummarySchema = z.object({
  overallAwarenessIndex: z.number().min(0).max(100),
  totalReflectionsCount: z.number().int().min(0),
  topDetectedBiases: z.array(CognitiveBiasTypeSchema),
  mindsetTrend: z.enum(['accelerating', 'stable', 'needs_reflection']),
  recentAhaMoments: z.array(z.string()),
})
export type MetacognitiveSummary = z.infer<typeof MetacognitiveSummarySchema>
