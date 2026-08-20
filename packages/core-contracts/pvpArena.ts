// packages/core-contracts/pvpArena.ts — Hợp đồng dữ liệu Đấu Trường Đối Kháng 1v1 PvP (Live & Ghost Battles).
import { z } from 'zod'
import { IsoDateTimeSchema } from './shared.js'

export const PvPGameModeSchema = z.enum([
  'vocab_speed_duel', // Đấu phản xạ từ vựng 5s
  'grammar_clash', // Bắt lỗi ngữ pháp cấp tốc
  'toulmin_showdown', // Tranh biện phản xạ mini
])
export type PvPGameMode = z.infer<typeof PvPGameModeSchema>

export const PvPRankTierSchema = z.enum([
  'bronze',
  'silver',
  'gold',
  'platinum',
  'diamond',
  'master',
])
export type PvPRankTier = z.infer<typeof PvPRankTierSchema>

export const PvPPlayerProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  avatar: z.string().min(1).max(50),
  eloRating: z.number().int().min(100).max(4000).default(1000),
  rankTier: PvPRankTierSchema.default('bronze'),
  winStreak: z.number().int().min(0).default(0),
  totalMatches: z.number().int().min(0).default(0),
  wins: z.number().int().min(0).default(0),
  isGhostBot: z.boolean().default(false),
})
export type PvPPlayerProfile = z.infer<typeof PvPPlayerProfileSchema>

export const PvPQuestionItemSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1).max(500),
  subPrompt: z.string().max(500).optional(),
  options: z.array(z.string().min(1)).min(2).max(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().max(1000),
  timeLimitSec: z.number().int().min(3).max(30).default(5),
  cefrLevel: z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']).default('B1'),
})
export type PvPQuestionItem = z.infer<typeof PvPQuestionItemSchema>

export const PvPRoundActionSchema = z.object({
  roundIndex: z.number().int().min(0),
  playerId: z.string().min(1),
  selectedOption: z.number().int().min(0).max(3),
  responseTimeMs: z.number().int().min(0).max(35000),
  isCorrect: z.boolean(),
  pointsEarned: z.number().int().min(0),
})
export type PvPRoundAction = z.infer<typeof PvPRoundActionSchema>

export const PvPMatchStateSchema = z.object({
  matchId: z.string().min(1),
  mode: PvPGameModeSchema,
  player1: PvPPlayerProfileSchema,
  player2: PvPPlayerProfileSchema,
  questions: z.array(PvPQuestionItemSchema).min(1).max(10),
  currentRound: z.number().int().min(0),
  totalRounds: z.number().int().min(1).max(10),
  scores: z.object({
    player1Score: z.number().int().min(0),
    player2Score: z.number().int().min(0),
  }),
  actions: z.array(PvPRoundActionSchema).default([]),
  status: z.enum(['waiting', 'in_progress', 'completed', 'abandoned']),
  winnerId: z.string().nullable().default(null),
  eloChanges: z
    .object({
      player1Delta: z.number().int(),
      player2Delta: z.number().int(),
    })
    .optional(),
  rewardExp: z.number().int().min(0).default(0),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type PvPMatchState = z.infer<typeof PvPMatchStateSchema>

export const PvPLeaderboardEntrySchema = z.object({
  rank: z.number().int().min(1),
  playerId: z.string().min(1),
  name: z.string().min(1),
  avatar: z.string().min(1),
  eloRating: z.number().int().min(100),
  rankTier: PvPRankTierSchema,
  winStreak: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
})
export type PvPLeaderboardEntry = z.infer<typeof PvPLeaderboardEntrySchema>
