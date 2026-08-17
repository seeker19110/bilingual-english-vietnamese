// packages/core-contracts/crossDomainGraph.ts — Contract cho Cross-Domain Life Graph (V2-14).
// Liên kết Career, Learning và Personal vào Life Graph mà không vi phạm ranh giới bảng.
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'
import { LifeGraphNodeSchema, LifeGraphEdgeSchema } from './lifeGraph.js'

export const CROSS_DOMAIN_GRAPH_SCHEMA_VERSION = 1

export const CrossDomainSyncSummarySchema = z
  .object({
    careerGoalsProcessed: z.number().int().nonnegative(),
    skillsMapped: z.number().int().nonnegative(),
    nodesCreatedOrUpdated: z.number().int().nonnegative(),
    edgesCreatedOrUpdated: z.number().int().nonnegative(),
    learningMasteryAligned: z.number().int().nonnegative(),
  })
  .strict()

export const CrossDomainGraphProjectionSchema = versionedObject(
  {
    personId: UuidSchema,
    nodes: z.array(LifeGraphNodeSchema),
    edges: z.array(LifeGraphEdgeSchema),
    syncSummary: CrossDomainSyncSummarySchema,
    syncedAt: IsoDateTimeSchema,
  },
  CROSS_DOMAIN_GRAPH_SCHEMA_VERSION,
)

export type CrossDomainSyncSummary = z.infer<typeof CrossDomainSyncSummarySchema>
export type CrossDomainGraphProjection = z.infer<typeof CrossDomainGraphProjectionSchema>
