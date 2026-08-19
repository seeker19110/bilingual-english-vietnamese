// packages/core-contracts/socraticDiagnostics.ts — Hợp đồng dữ liệu cho Socratic Cognitive Diagnostic Engine V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const SOCRATIC_SCHEMA_VERSION = 'v3.0.0'

export const MisconceptionDomainSchema = z.enum([
  'vietnamese_grammar_interference', // Thói quen tư duy ngữ pháp tiếng Việt (bỏ 'to-be', nhầm từ loại)
  'aspect_vs_tense_confusion', // Nhầm lẫn bản chất thì Hoàn Thành (kết quả/kinh nghiệm) vs Quá Khứ đơn
  'article_and_definiteness', // Quên hoặc dùng sai a/an/the do tiếng Việt không có mạo từ
  'preposition_and_collocation', // Dịch word-by-word giới từ từ tiếng Việt sang tiếng Anh
  'register_and_politeness', // Nhầm lẫn giữa mệnh lệnh trực tiếp và văn phong ngoại giao quốc tế
])

export type MisconceptionDomain = z.infer<typeof MisconceptionDomainSchema>

export const SocraticInquiryStepSchema = z
  .object({
    stepIndex: z.number().int().nonnegative(),
    guidingQuestion: z.string().min(1).max(500),
    expectedMentalConcept: z.string().min(1).max(300),
    hintIfStuck: z.string().min(1).max(300),
  })
  .strict()

export type SocraticInquiryStep = z.infer<typeof SocraticInquiryStepSchema>

export const MentalModelMisconceptionSchema = z
  .object({
    id: z.string().min(1).max(50),
    title: z.string().min(1).max(200),
    domain: MisconceptionDomainSchema,
    surfaceErrorPattern: z.string().min(1).max(300),
    rootCauseAnalysis: z.string().min(1).max(1000),
    inquiryPath: z.array(SocraticInquiryStepSchema).min(1),
    schemaVersion: z.literal(SOCRATIC_SCHEMA_VERSION),
  })
  .strict()

export type MentalModelMisconception = z.infer<typeof MentalModelMisconceptionSchema>

export const SocraticReflectionTurnSchema = z
  .object({
    stepIndex: z.number().int().nonnegative(),
    question: z.string().min(1).max(500),
    learnerAnswer: z.string().min(1).max(1000),
    conceptUnderstood: z.boolean(),
    companionFeedback: z.string().min(1).max(1000),
    timestamp: IsoDateTimeSchema,
  })
  .strict()

export type SocraticReflectionTurn = z.infer<typeof SocraticReflectionTurnSchema>

export const CognitiveBreakthroughRecordSchema = z
  .object({
    id: UuidSchema,
    personId: UuidSchema,
    misconceptionId: z.string().min(1).max(50),
    status: z.enum(['in_progress', 'breakthrough_achieved', 'needs_further_guidance']),
    currentStepIndex: z.number().int().nonnegative(),
    turns: z.array(SocraticReflectionTurnSchema),
    breakthroughSummary: z.string().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    schemaVersion: z.literal(SOCRATIC_SCHEMA_VERSION),
  })
  .strict()

export type CognitiveBreakthroughRecord = z.infer<typeof CognitiveBreakthroughRecordSchema>
