// packages/core-contracts/referralVip.test.ts
import { describe, it, expect } from 'vitest'
import {
  ReferralMilestoneTierSchema,
  ReferralVipDashboardSchema,
  ViralShareCardDataSchema,
} from './referralVip.js'

describe('referralVip contracts', () => {
  it('validates referral milestone tiers', () => {
    expect(ReferralMilestoneTierSchema.parse('tier_1_spark')).toBe('tier_1_spark')
    expect(ReferralMilestoneTierSchema.parse('tier_4_legend')).toBe('tier_4_legend')
    expect(() => ReferralMilestoneTierSchema.parse('invalid_tier')).toThrow()
  })

  it('validates referral dashboard schema', () => {
    const dashboard = ReferralVipDashboardSchema.parse({
      userId: 'u-123',
      referralCode: 'DHCB888',
      inviteUrl: 'https://www.donghanhcungban.org/dang-ky?ref=DHCB888',
      totalInvited: 5,
      successfulRefereesCount: 3,
      pendingRefereesCount: 2,
      totalVipDaysEarned: 21,
      currentMilestone: 'tier_2_catalyst',
      nextMilestoneRequirement: 2,
      referees: [
        {
          refereeId: 'ref-1',
          refereeName: 'Minh Quan',
          refereeEmailMasked: 'm***@gmail.com',
          joinedAt: new Date().toISOString(),
          hasCompletedFirstLesson: true,
          isVipSubscribed: false,
          rewardClaimed: true,
        },
      ],
      shareTemplates: {
        zaloMessage: 'Học cùng mình nhé!',
        facebookStory: 'Nhận 7 ngày VIP',
        telegramText: 'Học tiếng Anh AI',
      },
    })
    expect(dashboard.referralCode).toBe('DHCB888')
    expect(dashboard.referees.length).toBe(1)
  })

  it('validates viral share card data', () => {
    const shareCard = ViralShareCardDataSchema.parse({
      name: 'Nguyen Van A',
      avatar: '👑',
      streakDays: 45,
      cefrLevel: 'B2',
      referralCode: 'DHCB888',
      vipGiftDays: 7,
      qrPayload: 'https://www.donghanhcungban.org/dang-ky?ref=DHCB888',
    })
    expect(shareCard.streakDays).toBe(45)
    expect(shareCard.vipGiftDays).toBe(7)
  })
})
