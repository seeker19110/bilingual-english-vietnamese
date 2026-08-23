// packages/core-personal/dailyQuestsService.ts — Động cơ Nhiệm Vụ Hàng Ngày & Rương Báu Bí Ẩn (Daily Quests & Streak Vault).
import {
  type QuestCategory,
  type DailyQuestItem,
  type DailyQuestsState,
} from '@dhcb/core-contracts/dailyQuests'

export function generateDailyQuests(
  userId: string,
  dateStr = new Date().toISOString().slice(0, 10),
): DailyQuestsState {
  const quests: DailyQuestItem[] = [
    {
      id: `quest-vocab-${dateStr}`,
      title: 'Khai Phóng Từ Vựng',
      description: 'Hoàn thành ghi nhớ 10 từ vựng mới trong Lộ trình CEFR hôm nay.',
      category: 'vocab_mastery',
      icon: '📚',
      currentProgress: 0,
      targetGoal: 10,
      isCompleted: false,
      rewardExp: 50,
      actionUrl: '/lo-trinh-hoc',
    },
    {
      id: `quest-pvp-${dateStr}`,
      title: 'Đấu Trường Vinh Quang',
      description: 'Tham gia Đấu trường Đối kháng 1v1 và giành tối thiểu 1 chiến thắng.',
      category: 'pvp_battle',
      icon: '⚔️',
      currentProgress: 0,
      targetGoal: 1,
      isCompleted: false,
      rewardExp: 80,
      actionUrl: '/phong-luyen-tap',
    },
    {
      id: `quest-ai-${dateStr}`,
      title: 'Tâm Giao Bạn Đồng Hành',
      description: 'Hội thoại hoặc luyện phản xạ nói cùng Bạn Đồng Hành AI tối thiểu 3 lượt.',
      category: 'ai_dialogue',
      icon: '💬',
      currentProgress: 0,
      targetGoal: 3,
      isCompleted: false,
      rewardExp: 60,
      actionUrl: '/dong-hanh',
    },
  ]

  return {
    userId,
    dateStr,
    quests: quests as [DailyQuestItem, DailyQuestItem, DailyQuestItem],
    completedCount: 0,
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

export function updateQuestProgress(
  state: DailyQuestsState,
  category: QuestCategory,
  progressDelta = 1,
): DailyQuestsState {
  let completedCount = 0

  const updatedQuests = state.quests.map((quest) => {
    if (quest.category === category) {
      const newProgress = Math.min(quest.targetGoal, quest.currentProgress + progressDelta)
      const isCompleted = newProgress >= quest.targetGoal
      if (isCompleted) completedCount++
      return {
        ...quest,
        currentProgress: newProgress,
        isCompleted,
      }
    }
    if (quest.isCompleted) completedCount++
    return quest
  })

  const allCompleted = completedCount === 3
  const isUnlocked = allCompleted

  return {
    ...state,
    quests: updatedQuests as [DailyQuestItem, DailyQuestItem, DailyQuestItem],
    completedCount,
    allCompleted,
    chestState: {
      ...state.chestState,
      isUnlocked,
    },
    updatedAt: new Date().toISOString(),
  }
}

export function claimMysteryChestReward(state: DailyQuestsState): {
  state: DailyQuestsState
  rewards: { streakFreeze: number; bonusExp: number; vipHours: number } | null
} {
  if (!state.chestState.isUnlocked || state.chestState.isClaimed) {
    return { state, rewards: null }
  }

  const rewards = {
    streakFreeze: state.chestState.streakFreezeReward,
    bonusExp: state.chestState.bonusExpReward,
    vipHours: state.chestState.vipTrialHours,
  }

  const updatedState: DailyQuestsState = {
    ...state,
    chestState: {
      ...state.chestState,
      isClaimed: true,
    },
    updatedAt: new Date().toISOString(),
  }

  return { state: updatedState, rewards }
}
