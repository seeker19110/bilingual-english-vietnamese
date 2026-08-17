import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Pool } from 'pg'
import { ConflictError } from '../core-errors/appError.js'
import {
  proposeAction,
  confirmAction,
  rejectAction,
  listProposedActions,
} from './proposedActionService.js'

const PERSON = '11111111-1111-4111-8111-111111111111'
const ACTION_ID = '22222222-2222-4222-8222-222222222222'
const NOW = new Date('2026-08-17T00:00:00Z')

const policies = vi.hoisted(() => ({
  resolveAuthority: vi.fn(),
}))
vi.mock('./policyService.js', () => ({
  resolveAuthority: (...a: unknown[]) => policies.resolveAuthority(...a),
}))

function actionRow(over: Record<string, unknown> = {}) {
  return {
    id: ACTION_ID,
    person_id: PERSON,
    capability_id: 'learning.update_goal',
    action: 'update_goal',
    target_domain: 'learning',
    payload: { goal: 'IELTS 7.5' },
    risk_level: 'low',
    status: 'pending',
    version: 1,
    created_at: NOW,
    resolved_at: null,
    resolved_by: null,
    execution_result: null,
    ...over,
  }
}

function mockPool(
  queryFn: (sql: string, params?: unknown[]) => Promise<{ rows?: unknown[]; rowCount?: number }>,
): Pool {
  const client = {
    query: vi.fn(queryFn),
    release: vi.fn(),
  }
  return {
    query: vi.fn(queryFn),
    connect: vi.fn().mockResolvedValue(client),
  } as unknown as Pool
}

beforeEach(() => {
  vi.clearAllMocks()
  policies.resolveAuthority.mockResolvedValue(null)
})

describe('ProposedActionService - proposeAction', () => {
  it('rejects proposal immediately and records audit when policy is DENY', async () => {
    policies.resolveAuthority.mockResolvedValue('DENY')

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'rejected', resolved_by: 'policy:deny' })] }
      }
      return { rows: [] }
    })

    const res = await proposeAction(pool, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'low',
    })

    expect(res.action.status).toBe('rejected')
    expect(res.autoExecuted).toBe(false)
  })

  it('auto-executes and commits when policy is AUTOMATE', async () => {
    policies.resolveAuthority.mockResolvedValue('AUTOMATE')

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return {
          rows: [
            actionRow({
              status: 'committed',
              resolved_by: 'system:automate',
              execution_result: { status: 'ok' },
            }),
          ],
        }
      }
      return { rows: [] }
    })

    const res = await proposeAction(pool, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'low',
    })

    expect(res.action.status).toBe('committed')
    expect(res.autoExecuted).toBe(true)
  })

  it('leaves proposal pending confirmation for high risk action', async () => {
    policies.resolveAuthority.mockResolvedValue('AUTOMATE')

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'pending', risk_level: 'high' })] }
      }
      return { rows: [] }
    })

    const res = await proposeAction(pool, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'high', // High risk prevents auto-execution even if policy is AUTOMATE
    })

    expect(res.action.status).toBe('pending')
    expect(res.autoExecuted).toBe(false)
  })
})

describe('ProposedActionService - confirmAction & rejectAction', () => {
  it('confirms and executes pending action with optimistic lock', async () => {
    const pool = mockPool(async (sql) => {
      if (sql.includes('select') && sql.includes('for update')) {
        return { rows: [actionRow({ status: 'pending', version: 1 })] }
      }
      if (sql.includes('update personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'committed', version: 2, resolved_by: 'user:123' })] }
      }
      return { rows: [] }
    })

    const action = await confirmAction(pool, PERSON, ACTION_ID, 1, 'user:123')
    expect(action.status).toBe('committed')
  })

  it('throws ConflictError on optimistic lock version mismatch', async () => {
    const pool = mockPool(async () => ({
      rows: [actionRow({ status: 'pending', version: 2 })],
    }))

    await expect(confirmAction(pool, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      ConflictError,
    )
  })

  it('rejects action successfully', async () => {
    const pool = mockPool(async (sql) => {
      if (sql.includes('select') && sql.includes('for update')) {
        return { rows: [actionRow({ status: 'pending', version: 1 })] }
      }
      if (sql.includes('update personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'rejected', version: 2, resolved_by: 'user:123' })] }
      }
      return { rows: [] }
    })

    const action = await rejectAction(pool, PERSON, ACTION_ID, 1, 'user:123', 'Not desired')
    expect(action.status).toBe('rejected')
  })
})

describe('ProposedActionService - listProposedActions', () => {
  it('lists actions with filtering', async () => {
    const pool = mockPool(async () => ({
      rows: [actionRow()],
    }))

    const list = await listProposedActions(pool, PERSON, { status: 'pending' })
    expect(list.length).toBe(1)
    expect(list[0]?.id).toBe(ACTION_ID)
  })
})
