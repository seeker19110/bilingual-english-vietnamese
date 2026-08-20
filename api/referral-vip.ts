// api/referral-vip.ts — REST handler cho Tiếp thị Liên kết & Giới thiệu Bạn bè VIP (Referral VIP Booster).
import { jsonResponse } from './_lib/http.js'
import { validateAuth } from '../packages/core-auth/security.js'
import {
  buildReferralDashboard,
  prepareViralCardData,
  getMilestoneDefinitions,
} from '../packages/core-personal/referralVipService.js'
import { type RefereeRecord } from '../packages/core-contracts/referralVip.js'

// In-memory mock store cho danh sách bạn bè đã mời của user
const userRefereesMap = new Map<string, RefereeRecord[]>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    })
  }

  const auth = await validateAuth(req)
  const userId = auth?.userId || 'u-default'
  const referralCode = `DHCB-${userId.slice(-4).toUpperCase() || '8888'}`

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // Khởi tạo danh sách mẫu nếu user chưa có
  if (!userRefereesMap.has(userId)) {
    userRefereesMap.set(userId, [
      {
        refereeId: 'ref-sample-1',
        refereeName: 'Huyền Trang',
        refereeEmailMasked: 'h***@gmail.com',
        joinedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        hasCompletedFirstLesson: true,
        isVipSubscribed: false,
        rewardClaimed: true,
      },
      {
        refereeId: 'ref-sample-2',
        refereeName: 'Quốc Bảo',
        refereeEmailMasked: 'b***@gmail.com',
        joinedAt: new Date(Date.now() - 86400000).toISOString(),
        hasCompletedFirstLesson: false,
        isVipSubscribed: false,
        rewardClaimed: false,
      },
    ])
  }

  const currentReferees = userRefereesMap.get(userId) || []

  if (req.method === 'GET') {
    if (action === 'milestones') {
      return jsonResponse({ success: true, milestones: getMilestoneDefinitions() }, 200)
    }

    const dashboard = buildReferralDashboard(userId, referralCode, currentReferees)
    return jsonResponse({ success: true, dashboard, milestones: getMilestoneDefinitions() }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'generate_share_card') {
        const cardData = prepareViralCardData({
          name: body.name || 'Người Học Tiên Phong',
          avatar: body.avatar || '🌟',
          streakDays: body.streakDays || 7,
          cefrLevel: body.cefrLevel || 'B2',
          referralCode,
        })
        return jsonResponse({ success: true, cardData }, 200)
      }

      if (action === 'claim_milestone') {
        const { milestoneTier } = body
        // Đánh dấu nhận thưởng mốc
        return jsonResponse(
          {
            success: true,
            message: `Chúc mừng bạn đã mở khóa phần thưởng mốc ${milestoneTier}!`,
            milestoneTier,
          },
          200,
        )
      }

      return jsonResponse({ error: 'Invalid action' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
