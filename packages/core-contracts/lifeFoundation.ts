// packages/core-contracts/lifeFoundation.ts — Contract cho Life Foundation Domain (V2-17).
// High-impact subdomains: planning, habits, wellbeing, personal growth.
// No generic mega Life Agent — each subdomain has scoped policy.
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const LIFE_FOUNDATION_SCHEMA_VERSION = 1

export const LifePlanTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
export const LifePlanStatusSchema = z.enum(['draft', 'active', 'completed', 'archived'])

export const LifePlanSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    title: z.string().min(1).max(200),
    planType: LifePlanTypeSchema,
    periodStart: z.string().date(),
    periodEnd: z.string().date(),
    status: LifePlanStatusSchema,
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  LIFE_FOUNDATION_SCHEMA_VERSION,
)

export const HabitTypeSchema = z.enum(['build', 'break'])
export const HabitFrequencySchema = z.enum(['daily', 'weekly', 'custom'])

export const HabitSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    title: z.string().min(1).max(200),
    habitType: HabitTypeSchema,
    frequency: HabitFrequencySchema,
    targetCount: z.number().int().positive(),
    currentStreak: z.number().int().nonnegative(),
    bestStreak: z.number().int().nonnegative(),
    isActive: z.boolean(),
    version: z.number().int().positive().optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
  },
  LIFE_FOUNDATION_SCHEMA_VERSION,
)

export const HabitLogSchema = versionedObject(
  {
    id: UuidSchema,
    habitId: UuidSchema,
    personId: UuidSchema,
    loggedAt: z.string().date(),
    count: z.number().int().positive(),
    note: z.string().max(500).optional(),
    createdAt: IsoDateTimeSchema,
  },
  LIFE_FOUNDATION_SCHEMA_VERSION,
)

export const WellbeingCheckSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    moodScore: z.number().int().min(1).max(10),
    energyScore: z.number().int().min(1).max(10),
    stressScore: z.number().int().min(1).max(10),
    notes: z.string().max(2000).optional(),
    checkedAt: IsoDateTimeSchema,
  },
  LIFE_FOUNDATION_SCHEMA_VERSION,
)

export const GrowthAreaSchema = z.enum([
  'health',
  'career',
  'learning',
  'relationships',
  'finances',
  'creativity',
  'spirituality',
  'other',
])

export const GrowthMilestoneSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    area: GrowthAreaSchema,
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    achievedAt: z.string().date().optional(),
    createdAt: IsoDateTimeSchema,
  },
  LIFE_FOUNDATION_SCHEMA_VERSION,
)

export type LifePlan = z.infer<typeof LifePlanSchema>
export type Habit = z.infer<typeof HabitSchema>
export type HabitLog = z.infer<typeof HabitLogSchema>
export type WellbeingCheck = z.infer<typeof WellbeingCheckSchema>
export type GrowthMilestone = z.infer<typeof GrowthMilestoneSchema>
