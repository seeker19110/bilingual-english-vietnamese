import { z } from 'zod'

export const LifeDomainTypeSchema = z.enum(['learning', 'career', 'work', 'startup', 'life'])
export type LifeDomainType = z.infer<typeof LifeDomainTypeSchema>

export const LifeDomainScoreSchema = z.object({
  domain: LifeDomainTypeSchema,
  score: z.number().min(0).max(100),
  activityCount: z.number().int().min(0),
  momentum: z.enum(['accelerating', 'stable', 'decelerating', 'dormant']),
  keyHighlight: z.string(),
  bottlenecks: z.array(z.string()),
})
export type LifeDomainScore = z.infer<typeof LifeDomainScoreSchema>

export const StrategicRecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(['critical', 'high', 'medium', 'low']),
  sourceDomain: LifeDomainTypeSchema,
  targetDomain: LifeDomainTypeSchema,
  title: z.string(),
  actionPrompt: z.string(),
  expectedSynergyImpact: z.string(),
  estimatedMinutes: z.number().int().min(1),
})
export type StrategicRecommendation = z.infer<typeof StrategicRecommendationSchema>

export const PredictiveGoalHorizonSchema = z.object({
  goalId: z.string(),
  title: z.string(),
  domain: LifeDomainTypeSchema,
  targetDate: z.string(),
  estimatedCompletionDate: z.string(),
  successProbabilityPercent: z.number().min(0).max(100),
  confidenceInterval: z.object({
    optimisticDate: z.string(),
    pessimisticDate: z.string(),
  }),
  criticalPathSteps: z.array(z.string()),
  riskFactors: z.array(z.string()),
  energyAlignmentScore: z.number().min(0).max(100),
})
export type PredictiveGoalHorizon = z.infer<typeof PredictiveGoalHorizonSchema>

export const LifeSynthesisReportSchema = z.object({
  schemaVersion: z.literal('v5.4.0'),
  timestamp: z.string(),
  personId: z.string(),
  timeframe: z.enum(['daily', 'weekly', 'monthly']),
  holisticAlignmentScore: z.number().min(0).max(100),
  lifeSynergyIndex: z.number().min(0).max(100),
  cognitiveResilienceScore: z.number().min(0).max(100),
  domainBreakdown: z.array(LifeDomainScoreSchema),
  predictiveGoals: z.array(PredictiveGoalHorizonSchema),
  highLeverageRecommendations: z.array(StrategicRecommendationSchema),
  synthesisSummaryMarkdown: z.string(),
})
export type LifeSynthesisReport = z.infer<typeof LifeSynthesisReportSchema>
