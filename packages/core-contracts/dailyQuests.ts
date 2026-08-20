// packages/core-contracts/dailyQuests.ts — Hợp đồng dữ liệu Nhiệm Vụ Hàng Ngày & Rương Báu Bí Ẩn (Daily Quests & Streak Vault).
import { z } from 'zod'
import { IsoDateTimeSchema } from './shared.js'

export const QuestCategorySchema = z.enum([
  'vocab_mastery', // Học từ vựng mới
  'pvp_battle', // Tham gia đấu trường PvP
  'ai_dialogue', // Hội thoại cùng AI
  'grammar_drill', // Hoàn thành bài tập ngữ pháp
])
export type QuestCategory = z.infer<typeof QuestCategorySchema>

export const DailyQuestItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(150),
  description: z.string().min(1).max(300),
  category: QuestCategorySchema,
  icon: z.string().min(1).max(50),
  currentProgress: z.number().int().min(0),
  targetGoal: z.number().int().min(1),
  isCompleted: z.boolean(),
  rewardExp: z.number().int().min(1),
  actionUrl: z.string().optional(),
})
export type DailyQuestItem = z.infer<typeof DailyQuestItemSchema>

export const MysteryChestStateSchema = z.object({
  isUnlocked: z.boolean(),
  isClaimed: z.boolean(),
  streakFreezeReward: z.number().int().min(0).default(1),
  bonusExpReward: z.number().int().min(0).default(200),
  vipTrialHours: z.number().int().min(0).default(24),
})
export type MysteryChestState = z.infer<typeof MysteryChestStateSchema>

export const DailyQuestsStateSchema = z.object({
  userId: z.string().min(1),
  dateStr: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  quests: z.array(DailyQuestItemSchema).length(3),
  completedCount: z.number().int().min(0).max(3),
  allCompleted: z.boolean(),
  chestState: MysteryChestStateSchema,
  updatedAt: IsoDateTimeSchema,
})
export type DailyQuestsState = z.infer<typeof DailyQuestsStateSchema>
