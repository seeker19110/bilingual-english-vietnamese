// packages/core-personal/dailyQuestsService.test.ts
import { describe, it, expect } from 'vitest'
import {
  generateDailyQuests,
  updateQuestProgress,
  claimMysteryChestReward,
} from './dailyQuestsService.js'

describe('dailyQuestsService (Daily Quests & Streak Vault Engine)', () => {
  it('generates 3 balanced daily quests for user', () => {
    const state = generateDailyQuests('u-888', '2026-08-20')
    expect(state.userId).toBe('u-888')
    expect(state.dateStr).toBe('2026-08-20')
    expect(state.quests.length).toBe(3)
    expect(state.completedCount).toBe(0)
    expect(state.allCompleted).toBe(false)
    expect(state.chestState.isUnlocked).toBe(false)
    expect(state.chestState.isClaimed).toBe(false)
  })

  it('updates progress and unlocks chest when all quests completed', () => {
    let state = generateDailyQuests('u-888', '2026-08-20')

    // 1. Complete vocab quest (10 words)
    state = updateQuestProgress(state, 'vocab_mastery', 10)
    expect(state.quests[0]!.isCompleted).toBe(true)
    expect(state.completedCount).toBe(1)
    expect(state.chestState.isUnlocked).toBe(false)

    // 2. Complete pvp quest (1 battle)
    state = updateQuestProgress(state, 'pvp_battle', 1)
    expect(state.quests[1]!.isCompleted).toBe(true)
    expect(state.completedCount).toBe(2)
    expect(state.chestState.isUnlocked).toBe(false)

    // 3. Complete dialogue quest (3 turns)
    state = updateQuestProgress(state, 'ai_dialogue', 3)
    expect(state.quests[2]!.isCompleted).toBe(true)
    expect(state.completedCount).toBe(3)
    expect(state.allCompleted).toBe(true)
    expect(state.chestState.isUnlocked).toBe(true)
  })

  it('claims mystery chest rewards and prevents double claim', () => {
    let state = generateDailyQuests('u-888', '2026-08-20')
    state = updateQuestProgress(state, 'vocab_mastery', 10)
    state = updateQuestProgress(state, 'pvp_battle', 1)
    state = updateQuestProgress(state, 'ai_dialogue', 3)

    // First claim: successful
    const { state: claimedState, rewards } = claimMysteryChestReward(state)
    expect(claimedState.chestState.isClaimed).toBe(true)
    expect(rewards).not.toBeNull()
    expect(rewards?.streakFreeze).toBe(1)
    expect(rewards?.bonusExp).toBe(200)

    // Second claim: blocked
    const { rewards: secondRewards } = claimMysteryChestReward(claimedState)
    expect(secondRewards).toBeNull()
  })
})
