// packages/core-contracts/automation.ts — Contract cho V2-18 Approved Automation (Wave F).
// Enforces explicit grants, trigger types, budgets, state lifecycle, retries/compensation, and immutable receipts.
import { z } from 'zod'
import { versionedObject } from './version.js'
import { IsoDateTimeSchema, UuidSchema } from './shared.js'

export const AUTOMATION_SCHEMA_VERSION = 1

export const AutomationTriggerTypeSchema = z.enum(['schedule', 'event', 'manual'])

export const AutomationTriggerSchema = z.object({
  type: AutomationTriggerTypeSchema,
  cronOrInterval: z.string().max(100).optional(),
  eventType: z.string().max(100).optional(),
})

export const AutomationBudgetSchema = z.object({
  maxRunsPerHour: z.number().int().positive().default(10),
  maxRunsPerDay: z.number().int().positive().default(50),
  cooldownSeconds: z.number().int().nonnegative().default(60),
  costBudgetCents: z.number().int().positive().optional(),
})

export const AutomationCompensationSchema = z.object({
  toolId: z.string().regex(/^[a-z_]+\.[a-z_]+$/, 'toolId phải có dạng "domain.action"'),
  payload: z.record(z.string(), z.unknown()).optional(),
})

export const AutomationGrantStatusSchema = z.enum(['active', 'paused', 'revoked', 'expired'])

export const AutomationGrantSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    name: z.string().min(1).max(200),
    description: z.string().max(1000).optional(),
    capabilityId: z
      .string()
      .regex(/^[a-z_]+\.[a-z_]+$/, 'capabilityId phải có dạng "domain.action"'),
    action: z.string().min(1).max(200),
    targetDomain: z.string().min(1).max(100),
    trigger: AutomationTriggerSchema,
    budget: AutomationBudgetSchema,
    compensation: AutomationCompensationSchema.optional(),
    status: AutomationGrantStatusSchema,
    version: z.number().int().positive().optional(),
    reviewAt: IsoDateTimeSchema,
    expiresAt: IsoDateTimeSchema.optional(),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    revokedAt: IsoDateTimeSchema.optional(),
  },
  AUTOMATION_SCHEMA_VERSION,
)

export const ActionReceiptStatusSchema = z.enum(['success', 'failed', 'compensated'])

export const ActionReceiptSchema = versionedObject(
  {
    id: UuidSchema,
    personId: UuidSchema,
    grantId: UuidSchema,
    capabilityId: z.string().min(1).max(200),
    action: z.string().min(1).max(200),
    idempotencyKey: z.string().min(1).max(200),
    triggerSource: z.string().min(1).max(100),
    inputPayload: z.unknown(),
    executionResult: z.unknown().optional(),
    status: ActionReceiptStatusSchema,
    retryCount: z.number().int().nonnegative().default(0),
    durationMs: z.number().int().nonnegative(),
    errorMessage: z.string().max(2000).optional(),
    compensationResult: z.unknown().optional(),
    createdAt: IsoDateTimeSchema,
  },
  AUTOMATION_SCHEMA_VERSION,
)

export type AutomationTrigger = z.infer<typeof AutomationTriggerSchema>
export type AutomationBudget = z.infer<typeof AutomationBudgetSchema>
export type AutomationCompensation = z.infer<typeof AutomationCompensationSchema>
export type AutomationGrantStatus = z.infer<typeof AutomationGrantStatusSchema>
export type AutomationGrant = z.infer<typeof AutomationGrantSchema>
export type ActionReceiptStatus = z.infer<typeof ActionReceiptStatusSchema>
export type ActionReceipt = z.infer<typeof ActionReceiptSchema>
