// apps/english/src/lib/dailyQuestsApi.ts — Client API cho Daily Quests & Streak Vault.
import type {
  DailyQuestsState,
  QuestCategory,
} from '../../../../packages/core-contracts/dailyQuests'

function getAuthHeader(): Record<string, string> {
  try {
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export async function fetchDailyQuests(): Promise<DailyQuestsState> {
  try {
    const res = await fetch('/api/daily-quests', {
      headers: { ...getAuthHeader() },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.state
  } catch {
    const todayStr = new Date().toISOString().slice(0, 10)
    return {
      userId: 'local-u',
      dateStr: todayStr,
      quests: [
        {
          id: `q-1-${todayStr}`,
          title: 'Khai Phóng Từ Vựng',
          description: 'Hoàn thành ghi nhớ 10 từ vựng mới trong Lộ trình CEFR hôm nay.',
          category: 'vocab_mastery',
          icon: '📚',
          currentProgress: 4,
          targetGoal: 10,
          isCompleted: false,
          rewardExp: 50,
          actionUrl: '/lo-trinh-hoc',
        },
        {
          id: `q-2-${todayStr}`,
          title: 'Đấu Trường Vinh Quang',
          description: 'Tham gia Đấu trường Đối kháng 1v1 và giành tối thiểu 1 chiến thắng.',
          category: 'pvp_battle',
          icon: '⚔️',
          currentProgress: 1,
          targetGoal: 1,
          isCompleted: true,
          rewardExp: 80,
          actionUrl: '/phong-luyen-tap',
        },
        {
          id: `q-3-${todayStr}`,
          title: 'Tâm Giao Bạn Đồng Hành',
          description: 'Hội thoại hoặc luyện phản xạ nói cùng Bạn Đồng Hành AI tối thiểu 3 lượt.',
          category: 'ai_dialogue',
          icon: '💬',
          currentProgress: 2,
          targetGoal: 3,
          isCompleted: false,
          rewardExp: 60,
          actionUrl: '/dong-hanh',
        },
      ],
      completedCount: 1,
      allCompleted: false,
      chestState: {
        isUnlocked: false,
        isClaimed: false,
        streakFreezeReward: 1,
        bonusExpReward: 200,
        vipTrialHours: 24,
      },
      updatedAt: new Date().toISOString(),
    }
  }
}

export async function updateQuestProgress(
  category: QuestCategory,
  amount = 1,
): Promise<DailyQuestsState> {
  try {
    const res = await fetch('/api/daily-quests?action=update_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ category, amount }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return data.state
  } catch {
    return await fetchDailyQuests()
  }
}

export async function claimMysteryChest(): Promise<{
  state: DailyQuestsState
  rewards: { streakFreeze: number; bonusExp: number; vipHours: number }
}> {
  try {
    const res = await fetch('/api/daily-quests?action=claim_chest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({}),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return {
      state: data.state,
      rewards: data.rewards,
    }
  } catch {
    return {
      state: {
        userId: 'local-u',
        dateStr: new Date().toISOString().slice(0, 10),
        quests: [
          {
            id: '1',
            title: 'Từ vựng',
            description: '',
            category: 'vocab_mastery',
            icon: '📚',
            currentProgress: 10,
            targetGoal: 10,
            isCompleted: true,
            rewardExp: 50,
          },
          {
            id: '2',
            title: 'PvP',
            description: '',
            category: 'pvp_battle',
            icon: '⚔️',
            currentProgress: 1,
            targetGoal: 1,
            isCompleted: true,
            rewardExp: 80,
          },
          {
            id: '3',
            title: 'Hội thoại',
            description: '',
            category: 'ai_dialogue',
            icon: '💬',
            currentProgress: 3,
            targetGoal: 3,
            isCompleted: true,
            rewardExp: 60,
          },
        ],
        completedCount: 3,
        allCompleted: true,
        chestState: {
          isUnlocked: true,
          isClaimed: true,
          streakFreezeReward: 1,
          bonusExpReward: 200,
          vipTrialHours: 24,
        },
        updatedAt: new Date().toISOString(),
      },
      rewards: { streakFreeze: 1, bonusExp: 200, vipHours: 24 },
    }
  }
}
