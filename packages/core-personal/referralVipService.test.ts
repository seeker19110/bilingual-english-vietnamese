// packages/core-personal/referralVipService.test.ts
import { describe, it, expect } from 'vitest'
import {
  getMilestoneDefinitions,
  calculateReferralStats,
  generateShareTemplates,
  buildReferralDashboard,
  prepareViralCardData,
} from './referralVipService.js'
import { type RefereeRecord } from '../core-contracts/referralVip.js'

describe('referralVipService (Referral VIP & Social Booster Engine)', () => {
  it('returns structured milestone definitions', () => {
    const milestones = getMilestoneDefinitions()
    expect(milestones.length).toBe(4)
    expect(milestones[0]!.requiredReferees).toBe(1)
    expect(milestones[3]!.requiredReferees).toBe(10)
  })

  it('calculates accurate referral stats and milestone progression', () => {
    const referees: RefereeRecord[] = [
      {
        refereeId: 'r-1',
        refereeName: 'User 1',
        refereeEmailMasked: 'u1***@gmail.com',
        joinedAt: new Date().toISOString(),
        hasCompletedFirstLesson: true,
        isVipSubscribed: false,
        rewardClaimed: true,
      },
      {
        refereeId: 'r-2',
        refereeName: 'User 2',
        refereeEmailMasked: 'u2***@gmail.com',
        joinedAt: new Date().toISOString(),
        hasCompletedFirstLesson: true,
        isVipSubscribed: false,
        rewardClaimed: true,
      },
      {
        refereeId: 'r-3',
        refereeName: 'User 3',
        refereeEmailMasked: 'u3***@gmail.com',
        joinedAt: new Date().toISOString(),
        hasCompletedFirstLesson: false,
        isVipSubscribed: false,
        rewardClaimed: false,
      },
    ]

    const stats = calculateReferralStats(referees)
    expect(stats.totalInvited).toBe(3)
    expect(stats.successfulRefereesCount).toBe(2)
    expect(stats.pendingRefereesCount).toBe(1)
    expect(stats.currentMilestone).toBe('tier_1_spark')
    expect(stats.nextMilestoneRequirement).toBe(1) // Needs 1 more for tier_2 (3 total)
  })

  it('generates share message templates with code and URL', () => {
    const templates = generateShareTemplates(
      'VIP999',
      'https://www.donghanhcungban.org/dang-ky?ref=VIP999',
    )
    expect(templates.zaloMessage).toContain('VIP999')
    expect(templates.facebookStory).toContain('7 ngày VIP')
    expect(templates.telegramText).toContain('https://www.donghanhcungban.org')
  })

  it('builds full referral dashboard object', () => {
    const dashboard = buildReferralDashboard('u-1', 'MYREF123', [])
    expect(dashboard.userId).toBe('u-1')
    expect(dashboard.referralCode).toBe('MYREF123')
    expect(dashboard.inviteUrl).toContain('MYREF123')
    expect(dashboard.shareTemplates.zaloMessage).toBeDefined()
  })

  it('prepares viral share card data', () => {
    const cardData = prepareViralCardData({
      name: 'Minh Tu',
      avatar: '🌟',
      streakDays: 30,
      cefrLevel: 'C1',
      referralCode: 'MINHTU2026',
    })
    expect(cardData.name).toBe('Minh Tu')
    expect(cardData.vipGiftDays).toBe(7)
    expect(cardData.qrPayload).toContain('MINHTU2026')
  })
})
