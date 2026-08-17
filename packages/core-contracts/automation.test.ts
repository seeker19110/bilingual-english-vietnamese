import { describe, expect, it } from 'vitest'
import {
  AutomationGrantSchema,
  ActionReceiptSchema,
  AutomationTriggerSchema,
  AutomationBudgetSchema,
  AUTOMATION_SCHEMA_VERSION,
} from './automation.js'

describe('automation contracts', () => {
  const validPersonId = '11111111-1111-4111-8111-111111111111'
  const validGrantId = '22222222-2222-4222-8222-222222222222'
  const validReceiptId = '33333333-3333-4333-8333-333333333333'
  const nowIso = new Date().toISOString()

  describe('AutomationTriggerSchema', () => {
    it('accepts schedule trigger', () => {
      const parsed = AutomationTriggerSchema.parse({
        type: 'schedule',
        cronOrInterval: '0 8 * * *',
      })
      expect(parsed.type).toBe('schedule')
      expect(parsed.cronOrInterval).toBe('0 8 * * *')
    })

    it('accepts event trigger', () => {
      const parsed = AutomationTriggerSchema.parse({
        type: 'event',
        eventType: 'learning.goal_achieved',
      })
      expect(parsed.type).toBe('event')
      expect(parsed.eventType).toBe('learning.goal_achieved')
    })
  })

  describe('AutomationBudgetSchema', () => {
    it('applies defaults for missing fields', () => {
      const parsed = AutomationBudgetSchema.parse({})
      expect(parsed.maxRunsPerHour).toBe(10)
      expect(parsed.maxRunsPerDay).toBe(50)
      expect(parsed.cooldownSeconds).toBe(60)
    })
  })

  describe('AutomationGrantSchema', () => {
    it('validates a correct automation grant', () => {
      const grant = AutomationGrantSchema.parse({
        id: validGrantId,
        personId: validPersonId,
        name: 'Daily vocab reminder',
        capabilityId: 'learning.vocab_reminder',
        action: 'send_reminder',
        targetDomain: 'learning',
        trigger: {
          type: 'schedule',
          cronOrInterval: '0 8 * * *',
        },
        budget: {
          maxRunsPerHour: 2,
          maxRunsPerDay: 5,
          cooldownSeconds: 300,
        },
        status: 'active',
        reviewAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
      })
      expect(grant.status).toBe('active')
      expect(grant.capabilityId).toBe('learning.vocab_reminder')
    })

    it('rejects invalid capabilityId format', () => {
      expect(() =>
        AutomationGrantSchema.parse({
          id: validGrantId,
          personId: validPersonId,
          name: 'Invalid cap',
          capabilityId: 'invalid-capability-no-dot',
          action: 'send_reminder',
          targetDomain: 'learning',
          trigger: { type: 'manual' },
          budget: {},
          status: 'active',
          reviewAt: nowIso,
          createdAt: nowIso,
          updatedAt: nowIso,
          schemaVersion: AUTOMATION_SCHEMA_VERSION,
        }),
      ).toThrow()
    })
  })

  describe('ActionReceiptSchema', () => {
    it('validates an immutable action receipt', () => {
      const receipt = ActionReceiptSchema.parse({
        id: validReceiptId,
        personId: validPersonId,
        grantId: validGrantId,
        capabilityId: 'learning.vocab_reminder',
        action: 'send_reminder',
        idempotencyKey: 'daily-vocab-2026-08-17',
        triggerSource: 'schedule:cron',
        inputPayload: { words: ['apple', 'banana'] },
        executionResult: { delivered: true },
        status: 'success',
        retryCount: 0,
        durationMs: 142,
        createdAt: nowIso,
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
      })
      expect(receipt.status).toBe('success')
      expect(receipt.idempotencyKey).toBe('daily-vocab-2026-08-17')
    })

    it('supports compensated status and error message', () => {
      const receipt = ActionReceiptSchema.parse({
        id: validReceiptId,
        personId: validPersonId,
        grantId: validGrantId,
        capabilityId: 'work.create_task',
        action: 'create_task',
        idempotencyKey: 'task-retry-001',
        triggerSource: 'event:webhook',
        inputPayload: { title: 'Sync document' },
        status: 'compensated',
        retryCount: 3,
        durationMs: 850,
        errorMessage: 'Connection timed out',
        compensationResult: { reverted: true },
        createdAt: nowIso,
        schemaVersion: AUTOMATION_SCHEMA_VERSION,
      })
      expect(receipt.status).toBe('compensated')
      expect(receipt.errorMessage).toBe('Connection timed out')
    })
  })
})
