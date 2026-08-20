// packages/core-personal/referralVipService.ts — Động cơ Quản lý Tiếp thị Liên kết & Giới thiệu Bạn bè VIP.
import {
  type ReferralMilestoneDefinition,
  type RefereeRecord,
  type ReferralVipDashboard,
  type ViralShareCardData,
} from '../core-contracts/referralVip.js'

export const MILESTONE_TIERS: ReferralMilestoneDefinition[] = [
  {
    tier: 'tier_1_spark',
    requiredReferees: 1,
    title: 'Tia Sáng Tri Thức (Spark)',
    rewardDescription: '+7 Ngày VIP Toàn Năng cho cả bạn và người được mời',
    bonusVipDays: 7,
    badgeName: '🌟 Đồng Hành Tân Binh',
  },
  {
    tier: 'tier_2_catalyst',
    requiredReferees: 3,
    title: 'Chất Xúc Tác Đột Phá (Catalyst)',
    rewardDescription: '+15 Ngày VIP + Mở khóa Huy hiệu Đại Sứ Học Tập (Ambassador)',
    bonusVipDays: 15,
    badgeName: '🔥 Đại Sứ Học Tập',
  },
  {
    tier: 'tier_3_pioneer',
    requiredReferees: 5,
    title: 'Tiên Phong Khai Phóng (Pioneer)',
    rewardDescription: '+30 Ngày VIP + Bộ Công cụ Phân tích Nhận thức Sâu V6',
    bonusVipDays: 30,
    badgeName: '💎 VIP Master Pass',
  },
  {
    tier: 'tier_4_legend',
    requiredReferees: 10,
    title: 'Huyền Thoại Đồng Hành (Legend)',
    rewardDescription: 'Mở Khóa Toàn Quyền Trọn Đời VIP Diamond',
    bonusVipDays: 365,
    badgeName: '👑 Diamond Master',
  },
]

export function getMilestoneDefinitions(): ReferralMilestoneDefinition[] {
  return MILESTONE_TIERS
}

export function calculateReferralStats(referees: RefereeRecord[]) {
  const successfulRefereesCount = referees.filter((r) => r.hasCompletedFirstLesson).length
  const pendingRefereesCount = referees.filter((r) => !r.hasCompletedFirstLesson).length
  const totalInvited = referees.length

  // Tính tổng số ngày VIP đã nhận (mỗi người bạn học xong +7 ngày, cộng thêm bonus mốc)
  let totalVipDaysEarned = successfulRefereesCount * 7

  let currentMilestone: ReferralMilestoneDefinition['tier'] = 'tier_1_spark'
  let nextMilestoneRequirement = 1 - successfulRefereesCount

  for (const m of MILESTONE_TIERS) {
    if (successfulRefereesCount >= m.requiredReferees) {
      currentMilestone = m.tier
      totalVipDaysEarned += m.bonusVipDays
    } else {
      nextMilestoneRequirement = m.requiredReferees - successfulRefereesCount
      break
    }
  }

  if (successfulRefereesCount >= 10) {
    nextMilestoneRequirement = 0
  }

  return {
    totalInvited,
    successfulRefereesCount,
    pendingRefereesCount,
    totalVipDaysEarned,
    currentMilestone,
    nextMilestoneRequirement: Math.max(0, nextMilestoneRequirement),
  }
}

export function generateShareTemplates(referralCode: string, inviteUrl: string) {
  return {
    zaloMessage: `Chào bạn! Mình đang luyện tiếng Anh cùng Bạn Đồng Hành AI tại Đồng Hành. Nhập mã "${referralCode}" hoặc bấm vào link này để nhận ngay 7 ngày VIP miễn phí nhé: ${inviteUrl}`,
    facebookStory: `🚀 Vừa đạt chuỗi học tiếng Anh đỉnh cao với AI! Tặng bạn 7 ngày VIP miễn phí học cùng mình tại: ${inviteUrl} (Mã: ${referralCode})`,
    telegramText: `🔥 Trải nghiệm Gia sư AI siêu chuẩn quốc tế (CEFR A1-C2, IELTS Speaking/Writing)! Nhận ngay 7 ngày VIP miễn phí tại: ${inviteUrl}`,
  }
}

export function buildReferralDashboard(
  userId: string,
  referralCode: string,
  referees: RefereeRecord[] = [],
): ReferralVipDashboard {
  const inviteUrl = `https://www.donghanhcungban.org/dang-ky?ref=${referralCode}`
  const stats = calculateReferralStats(referees)
  const shareTemplates = generateShareTemplates(referralCode, inviteUrl)

  return {
    userId,
    referralCode,
    inviteUrl,
    totalInvited: stats.totalInvited,
    successfulRefereesCount: stats.successfulRefereesCount,
    pendingRefereesCount: stats.pendingRefereesCount,
    totalVipDaysEarned: stats.totalVipDaysEarned,
    currentMilestone: stats.currentMilestone,
    nextMilestoneRequirement: stats.nextMilestoneRequirement,
    referees,
    shareTemplates,
  }
}

export function prepareViralCardData(profile: {
  name: string
  avatar: string
  streakDays: number
  cefrLevel: string
  referralCode: string
}): ViralShareCardData {
  const inviteUrl = `https://www.donghanhcungban.org/dang-ky?ref=${profile.referralCode}`
  return {
    name: profile.name,
    avatar: profile.avatar,
    streakDays: profile.streakDays,
    cefrLevel: profile.cefrLevel,
    referralCode: profile.referralCode,
    vipGiftDays: 7,
    qrPayload: inviteUrl,
  }
}
