// packages/core-contracts/dailyQuests.test.ts
import { describe, it, expect } from 'vitest'
import { QuestCategorySchema, DailyQuestItemSchema, DailyQuestsStateSchema } from './dailyQuests.js'

describe('dailyQuests contracts', () => {
  it('validates quest category and item schema', () => {
    expect(QuestCategorySchema.parse('vocab_mastery')).toBe('vocab_mastery')
    expect(QuestCategorySchema.parse('pvp_battle')).toBe('pvp_battle')
    expect(() => QuestCategorySchema.parse('invalid')).toThrow()
    expect(DailyQuestItemSchema.shape.category).toBeDefined()
  })

  it('validates daily quests state schema', () => {
    const state = DailyQuestsStateSchema.parse({
      userId: 'u-456',
      dateStr: '2026-08-20',
      quests: [
        {
          id: 'q-1',
          title: 'Học 10 từ vựng mới',
          description: 'Học và ghi nhớ 10 từ vựng trong lộ trình hôm nay.',
          category: 'vocab_mastery',
          icon: '📚',
          currentProgress: 10,
          targetGoal: 10,
          isCompleted: true,
          rewardExp: 50,
        },
        {
          id: 'q-2',
          title: 'Chiến thắng 1 trận PvP',
          description: 'Tham gia Đấu trường phản xạ và giành chiến thắng 1 trận.',
          category: 'pvp_battle',
          icon: '⚔️',
          currentProgress: 1,
          targetGoal: 1,
          isCompleted: true,
          rewardExp: 80,
        },
        {
          id: 'q-3',
          title: 'Hội thoại AI 3 phút',
          description: 'Luyện nói hoặc chat cùng Bạn Đồng Hành AI tối thiểu 3 lượt.',
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
        isClaimed: false,
        streakFreezeReward: 1,
        bonusExpReward: 200,
        vipTrialHours: 24,
      },
      updatedAt: new Date().toISOString(),
    })
    expect(state.allCompleted).toBe(true)
    expect(state.quests.length).toBe(3)
  })
})
