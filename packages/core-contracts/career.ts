// packages/core-contracts/career.ts — Contract cho Career Domain (V2-13).
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const CAREER_SCHEMA_VERSION = 1

export const CareerProfileSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    targetRole: z.string().min(1).max(200),
    currentTitle: z.string().max(200).optional(),
    yearsOfExperience: z.number().int().nonnegative(),
    industry: z.string().max(200).optional(),
    targetSalaryMin: z.number().nonnegative().optional(),
    targetSalaryMax: z.number().nonnegative().optional(),
    currency: z.string().default('VND'),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export const CareerExperienceSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    company: z.string().min(1).max(200),
    role: z.string().min(1).max(200),
    startDate: z.string().min(1).max(50),
    endDate: z.string().max(50).optional(),
    isCurrent: z.boolean().default(false),
    achievements: z.array(z.string().min(1).max(500)),
    createdAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export const CareerGoalStatusSchema = z.enum(['active', 'completed', 'paused', 'abandoned'])

export const CareerGoalSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    targetTitle: z.string().min(1).max(200),
    targetCompanyType: z.string().max(200).optional(),
    timeframe: z.string().max(100).optional(),
    status: CareerGoalStatusSchema,
    skillsRequired: z.array(z.string().min(1).max(100)),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export const SkillGapItemSchema = z
  .object({
    skill: z.string().min(1).max(100),
    requiredLevel: z.string().min(1).max(50),
    currentMastery: z.string().nullable(),
    isFulfilled: z.boolean(),
  })
  .strict()

export const CareerSkillGapAnalysisSchema = versionedObject(
  {
    personId: UuidSchema,
    goalId: UuidSchema,
    targetTitle: z.string().min(1).max(200),
    gaps: z.array(SkillGapItemSchema),
    analyzedAt: IsoDateTimeSchema,
  },
  CAREER_SCHEMA_VERSION,
)

export type CareerProfile = z.infer<typeof CareerProfileSchema>
export type CareerExperience = z.infer<typeof CareerExperienceSchema>
export type CareerGoal = z.infer<typeof CareerGoalSchema>
export type CareerSkillGapAnalysis = z.infer<typeof CareerSkillGapAnalysisSchema>
