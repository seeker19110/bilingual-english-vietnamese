// packages/core-contracts/lifeMilestoneMastery.ts — Contracts cho Life Milestone Mastery & Compassionate Motivation System.
// Tuân thủ 2 Quy ước Tối thượng: TUÂN THỦ PHÁP LUẬT và YÊU THƯƠNG CON NGƯỜI.

import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const LIFE_MILESTONE_MASTERY_SCHEMA_VERSION = 1

export const LifeStageTypeSchema = z.enum([
  'early_childhood_primary', // 6 - 10 tuổi / Cấp 1
  'lower_secondary', // 11 - 14 tuổi / Cấp 2
  'upper_secondary', // 15 - 18 tuổi / Cấp 3 & Tuổi 16-17
  'university_launchpad', // 18 - 23 tuổi / Đại học & Khởi đầu
  'young_professional', // 24 - 28 tuổi / Đi làm & Tình yêu
  'family_builder', // 28 - 38 tuổi / Hôn nhân & Nuôi dạy con
  'prime_leader', // 38 - 50 tuổi / Đỉnh cao sự nghiệp & Mở rộng tài sản
  'sage_legacy', // 50+ tuổi / Trí huệ, Chuyển giao thế hệ & An nhàn
])
export type LifeStageType = z.infer<typeof LifeStageTypeSchema>

export const CapitalCategorySchema = z.enum([
  'human', // Vốn Con người (Trí tuệ, Ngoại ngữ, Kỹ năng)
  'physical', // Vốn Thể chất (Sức khỏe, Năng lượng, Tuổi thọ)
  'social', // Vốn Xã hội & Tình cảm (Hôn nhân, Gia đình, Bạn bè)
  'financial', // Vốn Tài chính (Dòng tiền, Tích sản, Tự do tài chính)
  'moral_legacy', // Vốn Tinh thần & Di sản (Đạo đức, Trí huệ, Phụng sự)
])
export type CapitalCategory = z.infer<typeof CapitalCategorySchema>

export const MilestoneTierSchema = z.enum(['baseline', 'beyond_excellence'])
export type MilestoneTier = z.infer<typeof MilestoneTierSchema>

export const MilestoneBenchmarkItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: CapitalCategorySchema,
  tier: MilestoneTierSchema,
  description: z.string().min(1),
  measurableMetric: z.string().min(1),
})
export type MilestoneBenchmarkItem = z.infer<typeof MilestoneBenchmarkItemSchema>

export const DeathTrapDefenseSchema = z.object({
  trapName: z.string().min(1),
  riskDescription: z.string().min(1),
  consequence: z.string().min(1),
  antidoteStrategy: z.string().min(1),
})
export type DeathTrapDefense = z.infer<typeof DeathTrapDefenseSchema>

export const LifeStageProfileSchema = z.object({
  stage: LifeStageTypeSchema,
  ageRange: z.string().min(1),
  vietnameseTitle: z.string().min(1),
  developmentalCore: z.string().min(1),
  benchmarks: z.array(MilestoneBenchmarkItemSchema),
  deathTraps: z.array(DeathTrapDefenseSchema),
})
export type LifeStageProfile = z.infer<typeof LifeStageProfileSchema>

export const FiveCapitalsAssessmentSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    humanScore: z.number().min(0).max(100),
    physicalScore: z.number().min(0).max(100),
    socialScore: z.number().min(0).max(100),
    financialScore: z.number().min(0).max(100),
    moralLegacyScore: z.number().min(0).max(100),
    overallBalanceScore: z.number().min(0).max(100),
    bottleneckCapital: CapitalCategorySchema,
    createdAt: IsoDateTimeSchema,
  },
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
)
export type FiveCapitalsAssessment = z.infer<typeof FiveCapitalsAssessmentSchema>

export const SupremeComplianceVerdictSchema = z.enum(['approved', 'requires_revision', 'rejected'])
export type SupremeComplianceVerdict = z.infer<typeof SupremeComplianceVerdictSchema>

export const SupremePrincipleComplianceSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    isLegallyCompliant: z.boolean(),
    isCompassionAligned: z.boolean(),
    legalChecklist: z.array(z.string()),
    compassionChecklist: z.array(z.string()),
    flaggedConcerns: z.array(z.string()),
    verdict: SupremeComplianceVerdictSchema,
    explanation: z.string().min(1),
    evaluatedAt: IsoDateTimeSchema,
  },
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
)
export type SupremePrincipleCompliance = z.infer<typeof SupremePrincipleComplianceSchema>

export const DailyLifeOSRoutineSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    stage: LifeStageTypeSchema,
    morningGoldenHour: z.object({
      exerciseMinutes: z.number().int().min(0),
      mindFoodMinutes: z.number().int().min(0),
      top3Priorities: z.array(z.string().min(1)).min(1).max(5),
    }),
    deepWorkMinutes: z.number().int().min(0),
    compassionateAction: z.string().min(1),
    eveningReflection: z.object({
      gratitudeEntries: z.array(z.string().min(1)).min(1),
      microVictories: z.array(z.string().min(1)).min(1),
      bedtimeTarget: z.string().min(1),
    }),
    createdAt: IsoDateTimeSchema,
  },
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
)
export type DailyLifeOSRoutine = z.infer<typeof DailyLifeOSRoutineSchema>

export const MotivationDiagnosticSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    autonomyLevel: z.number().int().min(1).max(10),
    competenceLevel: z.number().int().min(1).max(10),
    relatednessLevel: z.number().int().min(1).max(10),
    dopamineDynamic: z.enum(['tonic_sustainable', 'phasic_scattered']),
    unshakeableBeliefIndex: z.number().min(0).max(100),
    logotherapyWhyReason: z.string().min(1),
    prescribedActionSteps: z.array(z.string().min(1)),
    createdAt: IsoDateTimeSchema,
  },
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
)
export type MotivationDiagnostic = z.infer<typeof MotivationDiagnosticSchema>

export const MicroEvidenceLogSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    actionDescription: z.string().min(1).max(500),
    capitalReinforced: CapitalCategorySchema,
    loggedAt: z.string().date(),
    streakCount: z.number().int().nonnegative(),
    createdAt: IsoDateTimeSchema,
  },
  LIFE_MILESTONE_MASTERY_SCHEMA_VERSION,
)
export type MicroEvidenceLog = z.infer<typeof MicroEvidenceLogSchema>
