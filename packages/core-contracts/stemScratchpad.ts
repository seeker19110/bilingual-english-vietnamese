// packages/core-contracts/stemScratchpad.ts — V5 Flagship STEM Interactive Scratchpad Contracts.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const StemSubjectTypeSchema = z.enum(['math', 'physics', 'chemistry', 'biology'])
export type StemSubjectType = z.infer<typeof StemSubjectTypeSchema>

export const ScratchpadStepValidationSchema = z.object({
  isValid: z.boolean(),
  errorType: z
    .enum(['none', 'sign_error', 'arithmetic_error', 'unbalanced_equation', 'logic_gap'])
    .default('none'),
  feedback: z.string().min(1).max(500),
  suggestedCorrection: z.string().max(500).optional(),
  confidence: z.number().min(0).max(1),
})
export type ScratchpadStepValidation = z.infer<typeof ScratchpadStepValidationSchema>

export const ScratchpadStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  latexInput: z.string().min(1).max(1000),
  explanation: z.string().max(1000).optional(),
  validation: ScratchpadStepValidationSchema.optional(),
  createdAt: IsoDateTimeSchema,
})
export type ScratchpadStep = z.infer<typeof ScratchpadStepSchema>

export const StemProblemStateSchema = z.object({
  id: z.string().min(1),
  personId: UuidSchema,
  subject: StemSubjectTypeSchema,
  title: z.string().min(1).max(200),
  problemStatement: z.string().min(1).max(2000),
  problemLatex: z.string().max(1000).optional(),
  steps: z.array(ScratchpadStepSchema),
  isSolved: z.boolean(),
  hintsUsed: z.number().int().min(0).default(0),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type StemProblemState = z.infer<typeof StemProblemStateSchema>
