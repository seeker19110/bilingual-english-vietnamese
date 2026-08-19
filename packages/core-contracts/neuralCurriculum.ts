// packages/core-contracts/neuralCurriculum.ts — Hợp đồng Lộ trình Vi mô Thần kinh & Mạng lưới Collocations V4.3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const NEURAL_CURRICULUM_VERSION = 'v4.3.0'

export const CollocationTypeSchema = z.enum([
  'verb_noun',
  'adjective_noun',
  'noun_noun',
  'phrasal_verb',
  'idiom',
  'discourse_marker',
])

export type CollocationType = z.infer<typeof CollocationTypeSchema>

export const CefrLevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
export type CefrLevel = z.infer<typeof CefrLevelSchema>

export const CollocationNodeSchema = z
  .object({
    id: UuidSchema,
    phraseEn: z.string().min(1).max(200),
    meaningVi: z.string().min(1).max(300),
    ipa: z.string().max(200).default(''),
    cefrLevel: CefrLevelSchema,
    type: CollocationTypeSchema,
    strength: z.number().min(0).max(100).default(80),
    exampleSentenceEn: z.string().min(1).max(500),
    exampleSentenceVi: z.string().min(1).max(500),
    domain: z.enum(['learning', 'career', 'work', 'startup', 'life']).default('learning'),
    relatedWords: z.array(z.string()).default([]),
  })
  .strict()

export type CollocationNode = z.infer<typeof CollocationNodeSchema>

export const MicroDrillQuestionSchema = z
  .object({
    id: UuidSchema,
    targetCollocationId: UuidSchema,
    promptEn: z.string().min(1),
    promptVi: z.string().min(1),
    options: z.array(z.string()).min(2).max(4),
    correctAnswer: z.string().min(1),
    explanationVi: z.string().max(500),
  })
  .strict()

export type MicroDrillQuestion = z.infer<typeof MicroDrillQuestionSchema>

export const MicroCurriculumModuleSchema = z
  .object({
    moduleId: UuidSchema,
    title: z.string().min(1).max(200),
    targetDomain: z.enum(['learning', 'career', 'work', 'startup', 'life']),
    cefrLevel: CefrLevelSchema,
    gapReason: z.string().min(1).max(300),
    collocations: z.array(CollocationNodeSchema).min(1),
    drills: z.array(MicroDrillQuestionSchema).default([]),
    estimatedMinutes: z.number().int().min(1).max(10).default(2),
    status: z.enum(['ready', 'in_progress', 'mastered']).default('ready'),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .strict()

export type MicroCurriculumModule = z.infer<typeof MicroCurriculumModuleSchema>

export const NeuralCurriculumStateSchema = z
  .object({
    personId: UuidSchema,
    activeModuleId: UuidSchema.optional(),
    modules: z.array(MicroCurriculumModuleSchema).default([]),
    masteryScore: z.number().min(0).max(100).default(0),
    schemaVersion: z.literal(NEURAL_CURRICULUM_VERSION).default(NEURAL_CURRICULUM_VERSION),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  })
  .strict()

export type NeuralCurriculumState = z.infer<typeof NeuralCurriculumStateSchema>
