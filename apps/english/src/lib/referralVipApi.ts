// apps/english/src/lib/referralVipApi.ts — Client API cho Referral VIP & Viral Share Booster.
import type {
  ReferralVipDashboard,
  ReferralMilestoneDefinition,
  ViralShareCardData,
} from '../../../../packages/core-contracts/referralVip'

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export async function fetchReferralVipDashboard(): Promise<{
  dashboard: ReferralVipDashboard
  milestones: ReferralMilestoneDefinition[]
}> {
  try {
    const res = await fetch('/api/referral-vip', {
      headers: { ...getAuthHeader() },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      dashboard: data.dashboard,
      milestones: data.milestones || [],
    }
  } catch {
    return {
      dashboard: {
        userId: 'local-u',
        referralCode: 'DHCB-VIP777',
        inviteUrl: 'https://www.donghanhcungban.org/dang-ky?ref=DHCB-VIP777',
        totalInvited: 3,
        successfulRefereesCount: 2,
        pendingRefereesCount: 1,
        totalVipDaysEarned: 29, // 14 + 15 bonus
        currentMilestone: 'tier_1_spark',
        nextMilestoneRequirement: 1,
        referees: [
          {
            refereeId: 'ref-1',
            refereeName: 'Thanh Thao',
            refereeEmailMasked: 't***@gmail.com',
            joinedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
            hasCompletedFirstLesson: true,
            isVipSubscribed: false,
            rewardClaimed: true,
          },
          {
            refereeId: 'ref-2',
            refereeName: 'Duy Anh',
            refereeEmailMasked: 'd***@gmail.com',
            joinedAt: new Date(Date.now() - 86400000).toISOString(),
            hasCompletedFirstLesson: true,
            isVipSubscribed: false,
            rewardClaimed: true,
          },
          {
            refereeId: 'ref-3',
            refereeName: 'Hai Nam',
            refereeEmailMasked: 'h***@gmail.com',
            joinedAt: new Date().toISOString(),
            hasCompletedFirstLesson: false,
            isVipSubscribed: false,
            rewardClaimed: false,
          },
        ],
        shareTemplates: {
          zaloMessage:
            'Chào bạn! Nhập mã DHCB-VIP777 để nhận 7 ngày VIP miễn phí tại Đồng Hành nhé: https://www.donghanhcungban.org/dang-ky?ref=DHCB-VIP777',
          facebookStory:
            '🚀 Tặng bạn 7 ngày VIP học tiếng Anh cùng Bạn Đồng Hành AI: https://www.donghanhcungban.org/dang-ky?ref=DHCB-VIP777',
          telegramText:
            '🔥 Học tiếng Anh cùng AI chuẩn CEFR/IELTS. Nhận 7 ngày VIP tại: https://www.donghanhcungban.org/dang-ky?ref=DHCB-VIP777',
        },
      },
      milestones: [
        {
          tier: 'tier_1_spark',
          requiredReferees: 1,
          title: 'Tia Sáng Tri Thức (Spark)',
          rewardDescription: '+7 Ngày VIP Toàn Năng cho bạn và bạn bè',
          bonusVipDays: 7,
          badgeName: '🌟 Đồng Hành Tân Binh',
        },
        {
          tier: 'tier_2_catalyst',
          requiredReferees: 3,
          title: 'Chất Xúc Tác Đột Phá (Catalyst)',
          rewardDescription: '+15 Ngày VIP + Huy hiệu Đại Sứ Học Tập (Ambassador)',
          bonusVipDays: 15,
          badgeName: '🔥 Đại Sứ Học Tập',
        },
        {
          tier: 'tier_3_pioneer',
          requiredReferees: 5,
          title: 'Tiên Phong Khai Phóng (Pioneer)',
          rewardDescription: '+30 Ngày VIP + Thẻ VIP Master Pass V6',
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
      ],
    }
  }
}

export async function generateShareCard(profile: {
  name: string
  avatar: string
  streakDays: number
  cefrLevel: string
}): Promise<ViralShareCardData> {
  try {
    const res = await fetch('/api/referral-vip?action=generate_share_card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(profile),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.cardData
  } catch {
    return {
      name: profile.name,
      avatar: profile.avatar,
      streakDays: profile.streakDays,
      cefrLevel: profile.cefrLevel,
      referralCode: 'DHCB-VIP777',
      vipGiftDays: 7,
      qrPayload: 'https://www.donghanhcungban.org/dang-ky?ref=DHCB-VIP777',
    }
  }
}
