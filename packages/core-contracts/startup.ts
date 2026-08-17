// packages/core-contracts/startup.ts — Contract cho Startup Domain (V2-16).
// Gate Invariant: model-generated market claims NEVER become facts without evidence/provenance.
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const STARTUP_SCHEMA_VERSION = 1

export const VentureStageSchema = z.enum([
  'ideation',
  'validation',
  'mvp',
  'growth',
  'scale',
  'exited',
])

export const VentureSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    name: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    stage: VentureStageSchema,
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  STARTUP_SCHEMA_VERSION,
)

export const ProblemSeveritySchema = z.enum(['critical', 'major', 'minor'])

export const ProblemSchema = versionedObject(
  {
    id: UuidSchema,
    ventureId: UuidSchema,
    personId: UuidSchema,
    statement: z.string().min(1).max(2000),
    customerSegment: z.string().min(1).max(200),
    severity: ProblemSeveritySchema,
    evidenceCount: z.number().int().nonnegative(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  STARTUP_SCHEMA_VERSION,
)

export const HypothesisTypeSchema = z.enum([
  'market',
  'customer',
  'problem',
  'solution',
  'business_model',
])

export const HypothesisStatusSchema = z.enum(['unverified', 'supported', 'refuted', 'pivoted'])

export const HypothesisSchema = versionedObject(
  {
    id: UuidSchema,
    ventureId: UuidSchema,
    personId: UuidSchema,
    statement: z.string().min(1).max(2000),
    hypothesisType: HypothesisTypeSchema,
    status: HypothesisStatusSchema,
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  STARTUP_SCHEMA_VERSION,
)

export const EvidenceTypeSchema = z.enum([
  'interview',
  'survey',
  'analytics',
  'test',
  'revenue',
  'observation',
])

// ValidatedEvidence is DISTINCT from hypothesis — requires provenance to prevent AI hallucination
export const ValidatedEvidenceSchema = versionedObject(
  {
    id: UuidSchema,
    ventureId: UuidSchema,
    hypothesisId: UuidSchema.optional(),
    personId: UuidSchema,
    title: z.string().min(1).max(200),
    evidenceType: EvidenceTypeSchema,
    provenance: z.string().min(1).max(500),
    findings: z.string().min(1).max(5000),
    supportsHypothesis: z.boolean(),
    collectedAt: IsoDateTimeSchema,
    createdAt: IsoDateTimeSchema,
  },
  STARTUP_SCHEMA_VERSION,
)

export type Venture = z.infer<typeof VentureSchema>
export type Problem = z.infer<typeof ProblemSchema>
export type Hypothesis = z.infer<typeof HypothesisSchema>
export type ValidatedEvidence = z.infer<typeof ValidatedEvidenceSchema>
