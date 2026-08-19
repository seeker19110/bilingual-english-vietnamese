// packages/core-contracts/workplaceErrorHarvester.ts — Hợp đồng dữ liệu cho Workplace Error Harvester & Auto-SRS V3.
import { z } from 'zod'
import { CefrLevelSchema, IsoDateTimeSchema, UuidSchema } from './shared.js'

export const WORKPLACE_HARVESTER_SCHEMA_VERSION = 'v3.0.0'

export const HarvestedSourceTypeSchema = z.enum([
  'email',
  'slack_chat',
  'screen_ocr',
  'meeting_transcript',
  'document_draft',
])

export type HarvestedSourceType = z.infer<typeof HarvestedSourceTypeSchema>

export const ErrorCategorySchema = z.enum([
  'l1_literal_translation',
  'awkward_collocation',
  'tense_inconsistency',
  'diplomatic_tone_mismatch',
  'preposition_misuse',
])

export type ErrorCategory = z.infer<typeof ErrorCategorySchema>

export const HarvestedMistakeSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    sourceType: HarvestedSourceTypeSchema,
    originalContextSnippet: z.string().min(1).max(1000),
    detectedMistake: z.string().min(1).max(300),
    nativeAlternative: z.string().min(1).max(300),
    explanationVi: z.string().min(1).max(1000),
    errorCategory: ErrorCategorySchema,
    cefrLevel: CefrLevelSchema,
    urgency: z.enum(['critical', 'moderate', 'polish']),
    harvestedAt: IsoDateTimeSchema,
    convertedToSrs: z.boolean(),
  })
  .strict()

export type HarvestedMistake = z.infer<typeof HarvestedMistakeSchema>

export const AutoSrsCardSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    mistakeId: UuidSchema,
    frontPrompt: z.string().min(1).max(500),
    backAnswer: z.string().min(1).max(500),
    contextSentence: z.string().min(1).max(500),
    drillType: z.enum(['fill_blank', 'rephrase', 'pronunciation_shadowing']),
    cefrLevel: CefrLevelSchema,
    repetitionIntervalDays: z.number().int().nonnegative(),
    nextReviewDate: IsoDateTimeSchema,
    createdAt: IsoDateTimeSchema,
    schemaVersion: z.literal(WORKPLACE_HARVESTER_SCHEMA_VERSION),
  })
  .strict()

export type AutoSrsCard = z.infer<typeof AutoSrsCardSchema>
