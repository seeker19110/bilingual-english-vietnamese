// api/daily-quests.ts — REST handler cho Nhiệm Vụ Hàng Ngày & Rương Báu Bí Ẩn (Daily Quests & Streak Vault).
import { jsonResponse } from '@dhcb/core-http/http'
import { validateAuth, getCorsHeaders } from '@dhcb/core-auth/security'
import {
  generateDailyQuests,
  updateQuestProgress,
  claimMysteryChestReward,
} from '@dhcb/core-personal/dailyQuestsService'
import { type DailyQuestsState, type QuestCategory } from '@dhcb/core-contracts/dailyQuests'

// In-memory store cho trạng thái nhiệm vụ ngày của users
const userDailyQuestsMap = new Map<string, DailyQuestsState>()

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: getCorsHeaders(req) })
  }

  const auth = await validateAuth(req)
  const userId = auth?.userId || 'u-default'
  const todayStr = new Date().toISOString().slice(0, 10)

  const url = new URL(req.url)
  const action = url.searchParams.get('action')

  // Lấy hoặc khởi tạo nhiệm vụ hôm nay
  let state = userDailyQuestsMap.get(userId)
  if (!state || state.dateStr !== todayStr) {
    state = generateDailyQuests(userId, todayStr)
    userDailyQuestsMap.set(userId, state)
  }

  if (req.method === 'GET') {
    return jsonResponse({ success: true, state }, 200)
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json()

      if (action === 'update_progress') {
        const category: QuestCategory = body.category
        const amount = body.amount || 1
        if (!category) return jsonResponse({ error: 'Missing quest category' }, 400)

        state = updateQuestProgress(state, category, amount)
        userDailyQuestsMap.set(userId, state)
        return jsonResponse({ success: true, state }, 200)
      }

      if (action === 'claim_chest') {
        const { state: updatedState, rewards } = claimMysteryChestReward(state)
        if (!rewards) {
          return jsonResponse({ error: 'Rương chưa thể mở hoặc đã được nhận thưởng hôm nay' }, 400)
        }
        userDailyQuestsMap.set(userId, updatedState)
        return jsonResponse({ success: true, state: updatedState, rewards }, 200)
      }

      return jsonResponse({ error: 'Invalid action parameter' }, 400)
    } catch (err) {
      return jsonResponse({ error: 'Invalid JSON payload', details: String(err) }, 400)
    }
  }

  return jsonResponse({ error: 'Method not allowed' }, 405)
}
