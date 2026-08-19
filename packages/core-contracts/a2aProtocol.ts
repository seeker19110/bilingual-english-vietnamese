// packages/core-contracts/a2aProtocol.ts — Hợp đồng giao thức Agent-to-Agent (A2A) V3.
import { z } from 'zod'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const A2A_PROTOCOL_VERSION = 'v3.0.0'

export const A2APurposeSchema = z.enum([
  'calendar_arbitration',
  'skill_opportunity_match',
  'study_partner_handshake',
  'peer_review',
])

export type A2APurpose = z.infer<typeof A2APurposeSchema>

export const A2AMessageSchema = z
  .object({
    messageId: UuidSchema,
    senderDid: z.string().min(5).max(200), // e.g. did:key:z6MkpTHR...
    recipientDid: z.string().min(5).max(200),
    senderPersonId: UuidSchema,
    recipientPersonId: UuidSchema,
    purpose: A2APurposeSchema,
    payload: z.record(z.string(), z.unknown()),
    signature: z.string().min(10).max(500),
    timestamp: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema,
    schemaVersion: z.literal(A2A_PROTOCOL_VERSION),
  })
  .strict()

export type A2AMessage = z.infer<typeof A2AMessageSchema>

export const A2ANegotiationResultSchema = z
  .object({
    id: UuidSchema,
    messageId: UuidSchema,
    status: z.enum(['agreed', 'counter_proposed', 'rejected', 'pending_consent']),
    purpose: A2APurposeSchema,
    agreedTerms: z
      .object({
        scheduledSlot: IsoDateTimeSchema.optional(),
        skillTopic: z.string().max(200).optional(),
        studyDurationMinutes: z.number().int().positive().optional(),
        disclosureLevel: z.enum(['public', 'anonymous_zk', 'direct_peer']),
      })
      .strict(),
    counterProposal: z.record(z.string(), z.unknown()).optional(),
    auditReceiptHash: z.string().min(16),
    createdAt: IsoDateTimeSchema,
    schemaVersion: z.literal(A2A_PROTOCOL_VERSION),
  })
  .strict()

export type A2ANegotiationResult = z.infer<typeof A2ANegotiationResultSchema>

export const PeerStudyMatchSchema = z
  .object({
    peerPersonId: UuidSchema,
    peerDid: z.string(),
    peerDisplayName: z.string(),
    sharedSkill: z.string(),
    compatibilityScore: z.number().min(0).max(1),
    recommendedGoal: z.string(),
  })
  .strict()

export type PeerStudyMatch = z.infer<typeof PeerStudyMatchSchema>
