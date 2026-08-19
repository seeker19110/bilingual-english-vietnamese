// packages/core-contracts/memoryPalace.ts — V5 Flagship Spatial Memory Palace & Multi-Sensory Loci Anchors Contracts.
import { z } from 'zod'
import { IsoDateTimeSchema } from './shared.js'

export const MemoryPalaceThemeSchema = z.enum([
  'knowledge_library',
  'debate_sanctuary',
  'philosophical_atrium',
  'stem_laboratory',
  'zen_garden',
])
export type MemoryPalaceTheme = z.infer<typeof MemoryPalaceThemeSchema>

export const SensoryAnchorTypeSchema = z.enum([
  'visual_monument',
  'auditory_echo',
  'tactile_relic',
  'narrative_symbol',
])
export type SensoryAnchorType = z.infer<typeof SensoryAnchorTypeSchema>

export const LocusAnchorSchema = z.object({
  id: z.string().min(1),
  positionIndex: z.number().int().min(0),
  label: z.string().min(1).max(100),
  spatialCoordinates: z.object({
    x: z.number(),
    y: z.number(),
    z: z.number().optional(),
  }),
  anchorType: SensoryAnchorTypeSchema,
  keyConcept: z.string().min(1).max(200),
  mnemonicStory: z.string().min(1).max(1000),
  category: z.enum(['c1_c2_vocab', 'stem_formula', 'argument_fallacy', 'life_wisdom']),
  retentionStrength: z.number().min(0).max(100),
  lastRecalledAt: IsoDateTimeSchema.optional(),
  mastered: z.boolean().default(false),
})
export type LocusAnchor = z.infer<typeof LocusAnchorSchema>

export const MemoryPalaceRoomSchema = z.object({
  id: z.string().min(1),
  personId: z.string().min(1),
  name: z.string().min(1).max(100),
  theme: MemoryPalaceThemeSchema,
  description: z.string().min(1).max(500),
  ambientAudioPrompt: z.string().optional(),
  loci: z.array(LocusAnchorSchema).default([]),
  totalAnchorsCount: z.number().int().min(0),
  masteredAnchorsCount: z.number().int().min(0),
  averageRetentionRate: z.number().min(0).max(100),
  createdAt: IsoDateTimeSchema,
  updatedAt: IsoDateTimeSchema,
})
export type MemoryPalaceRoom = z.infer<typeof MemoryPalaceRoomSchema>

export const LocusRecallResultSchema = z.object({
  locusId: z.string().min(1),
  isAccurate: z.boolean(),
  similarityScore: z.number().min(0).max(100),
  feedback: z.string().min(1),
  strengthenedRetention: z.number().min(0).max(100),
  nextRecommendedReviewDate: IsoDateTimeSchema,
})
export type LocusRecallResult = z.infer<typeof LocusRecallResultSchema>

export const MemoryPalaceStateSchema = z.object({
  rooms: z.array(MemoryPalaceRoomSchema),
  totalMasteredAnchors: z.number().int().min(0),
  overallRetentionIndex: z.number().min(0).max(100),
  activeRoomId: z.string().optional(),
})
export type MemoryPalaceState = z.infer<typeof MemoryPalaceStateSchema>
