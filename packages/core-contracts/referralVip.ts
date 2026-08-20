// packages/core-contracts/referralVip.ts — Hợp đồng dữ liệu Tiếp thị Liên kết & Giới thiệu Bạn bè VIP (Referral VIP Booster).
import { z } from 'zod'
import { IsoDateTimeSchema } from './shared.js'

export const ReferralMilestoneTierSchema = z.enum([
  'tier_1_spark', // 1 bạn: +7 ngày VIP
  'tier_2_catalyst', // 3 bạn: +15 ngày VIP + Huy hiệu Ambassador
  'tier_3_pioneer', // 5 bạn: +30 ngày VIP + VIP Master Pass
  'tier_4_legend', // 10 bạn: Gói VIP Diamond Trọn đời
])
export type ReferralMilestoneTier = z.infer<typeof ReferralMilestoneTierSchema>

export const ReferralMilestoneDefinitionSchema = z.object({
  tier: ReferralMilestoneTierSchema,
  requiredReferees: z.number().int().min(1),
  title: z.string().min(1),
  rewardDescription: z.string().min(1),
  bonusVipDays: z.number().int().min(0),
  badgeName: z.string().optional(),
})
export type ReferralMilestoneDefinition = z.infer<typeof ReferralMilestoneDefinitionSchema>

export const RefereeRecordSchema = z.object({
  refereeId: z.string().min(1),
  refereeName: z.string().min(1),
  refereeEmailMasked: z.string().min(1),
  joinedAt: IsoDateTimeSchema,
  hasCompletedFirstLesson: z.boolean(),
  isVipSubscribed: z.boolean().default(false),
  rewardClaimed: z.boolean().default(false),
})
export type RefereeRecord = z.infer<typeof RefereeRecordSchema>

export const ReferralVipDashboardSchema = z.object({
  userId: z.string().min(1),
  referralCode: z.string().min(3).max(20),
  inviteUrl: z.string().url(),
  totalInvited: z.number().int().min(0),
  successfulRefereesCount: z.number().int().min(0),
  pendingRefereesCount: z.number().int().min(0),
  totalVipDaysEarned: z.number().int().min(0),
  currentMilestone: ReferralMilestoneTierSchema.default('tier_1_spark'),
  nextMilestoneRequirement: z.number().int().min(0),
  referees: z.array(RefereeRecordSchema).default([]),
  shareTemplates: z.object({
    zaloMessage: z.string(),
    facebookStory: z.string(),
    telegramText: z.string(),
  }),
})
export type ReferralVipDashboard = z.infer<typeof ReferralVipDashboardSchema>

export const ViralShareCardDataSchema = z.object({
  name: z.string().min(1),
  avatar: z.string().min(1),
  streakDays: z.number().int().min(0),
  cefrLevel: z.string().min(1),
  referralCode: z.string().min(1),
  vipGiftDays: z.number().int().min(1).default(7),
  qrPayload: z.string().min(1),
})
export type ViralShareCardData = z.infer<typeof ViralShareCardDataSchema>
