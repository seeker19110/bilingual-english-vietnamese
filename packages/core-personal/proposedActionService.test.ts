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

// Nhánh biên: các tổ hợp authority × riskLevel, not-found, sai trạng thái, insert/update rỗng.
describe('ProposedActionService — nhánh biên proposeAction', () => {
  it('WRITE_INTERNAL + rủi ro low → tự chạy; WRITE_INTERNAL + medium → chờ xác nhận', async () => {
    policies.resolveAuthority.mockResolvedValue('WRITE_INTERNAL')

    const poolLow = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'committed', resolved_at: NOW })] }
      }
      return { rows: [] }
    })
    const low = await proposeAction(poolLow, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'low',
    })
    expect(low.autoExecuted).toBe(true)
    // resolved_at có giá trị → trường decidedAt được điền.
    expect(low.action.decidedAt).toBe(NOW.toISOString())

    const poolMedium = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'pending', risk_level: 'medium' })] }
      }
      return { rows: [] }
    })
    const medium = await proposeAction(poolMedium, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'medium',
    })
    expect(medium.autoExecuted).toBe(false)
    expect(medium.action.status).toBe('pending')
  })

  it('không có policy + rủi ro low + tool không side-effect → vẫn tự chạy', async () => {
    policies.resolveAuthority.mockResolvedValue(null)

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return {
          rows: [
            actionRow({
              capability_id: 'dictionary.lookup',
              action: 'lookup',
              target_domain: 'learning',
              status: 'committed',
            }),
          ],
        }
      }
      return { rows: [] }
    })

    const res = await proposeAction(pool, {
      personId: PERSON,
      capabilityId: 'dictionary.lookup',
      action: 'lookup',
      targetDomain: 'learning',
      payload: { word: 'resilient' },
      riskLevel: 'low',
    })
    expect(res.autoExecuted).toBe(true)
  })

  it('không có policy + tool CÓ side-effect → chờ xác nhận', async () => {
    policies.resolveAuthority.mockResolvedValue(null)

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'pending' })] }
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
    expect(res.autoExecuted).toBe(false)
  })

  it('rủi ro restricted chặn tự chạy dù policy là AUTOMATE', async () => {
    policies.resolveAuthority.mockResolvedValue('AUTOMATE')

    const pool = mockPool(async (sql) => {
      if (sql.includes('insert into personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'pending', risk_level: 'restricted' })] }
      }
      return { rows: [] }
    })

    const res = await proposeAction(pool, {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'restricted',
    })
    expect(res.autoExecuted).toBe(false)
  })

  it('ném NotFoundError khi capabilityId không có trong tool registry', async () => {
    const pool = mockPool(async () => ({ rows: [] }))
    await expect(
      proposeAction(pool, {
        personId: PERSON,
        capabilityId: 'khong.ton.tai',
        action: 'x',
        targetDomain: 'learning',
        payload: {},
        riskLevel: 'low',
      }),
    ).rejects.toThrow("Tool 'khong.ton.tai' không tồn tại trong registry")
  })

  it('ném lỗi khi câu insert không trả về dòng nào (cả 3 nhánh rejected/committed/pending)', async () => {
    const emptyPool = mockPool(async () => ({ rows: [] }))
    const input = {
      personId: PERSON,
      capabilityId: 'learning.update_goal',
      action: 'update_goal',
      targetDomain: 'learning',
      payload: { goal: 'IELTS 7.5' },
      riskLevel: 'low' as const,
    }

    policies.resolveAuthority.mockResolvedValue('DENY')
    await expect(proposeAction(emptyPool, input)).rejects.toThrow(
      'Không thể tạo ProposedAction rejected',
    )

    policies.resolveAuthority.mockResolvedValue('AUTOMATE')
    await expect(proposeAction(emptyPool, input)).rejects.toThrow(
      'Không thể tạo ProposedAction committed',
    )

    policies.resolveAuthority.mockResolvedValue('READ_ONLY')
    await expect(proposeAction(emptyPool, input)).rejects.toThrow(
      'Không thể tạo ProposedAction pending',
    )
  })
})

describe('ProposedActionService — nhánh biên confirm/reject/list', () => {
  it('confirmAction ném NotFoundError khi không có bản ghi', async () => {
    const pool = mockPool(async () => ({ rows: [] }))
    await expect(confirmAction(pool, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'Không tìm thấy ProposedAction',
    )
  })

  it('confirmAction từ chối khi action đã rời trạng thái pending', async () => {
    const pool = mockPool(async () => ({ rows: [actionRow({ status: 'committed', version: 1 })] }))
    await expect(confirmAction(pool, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'ProposedAction không ở trạng thái pending (status=committed)',
    )
  })

  it('confirmAction ném lỗi khi câu update không trả dòng nào', async () => {
    const pool = mockPool(async (sql) => {
      if (sql.includes('select') && sql.includes('for update')) {
        return { rows: [actionRow({ status: 'pending', version: 1 })] }
      }
      return { rows: [] }
    })
    await expect(confirmAction(pool, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'Không thể cập nhật ProposedAction confirm',
    )
  })

  it('rejectAction: not-found, sai version, sai trạng thái, update rỗng', async () => {
    const notFound = mockPool(async () => ({ rows: [] }))
    await expect(rejectAction(notFound, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'Không tìm thấy ProposedAction',
    )

    const wrongVersion = mockPool(async () => ({
      rows: [actionRow({ status: 'pending', version: 5 })],
    }))
    await expect(rejectAction(wrongVersion, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      ConflictError,
    )

    const wrongStatus = mockPool(async () => ({
      rows: [actionRow({ status: 'rejected', version: 1 })],
    }))
    await expect(rejectAction(wrongStatus, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'ProposedAction không ở trạng thái pending (status=rejected)',
    )

    const emptyUpdate = mockPool(async (sql) => {
      if (sql.includes('select') && sql.includes('for update')) {
        return { rows: [actionRow({ status: 'pending', version: 1 })] }
      }
      return { rows: [] }
    })
    await expect(rejectAction(emptyUpdate, PERSON, ACTION_ID, 1, 'user:123')).rejects.toThrow(
      'Không thể cập nhật ProposedAction reject',
    )
  })

  it('rejectAction không truyền reason → ghi lý do mặc định user_rejected', async () => {
    const calls: Array<{ sql: string; params?: unknown[] }> = []
    const pool = mockPool(async (sql, params) => {
      calls.push({ sql, params })
      if (sql.includes('select') && sql.includes('for update')) {
        return { rows: [actionRow({ status: 'pending', version: 1 })] }
      }
      if (sql.includes('update personal.proposed_actions')) {
        return { rows: [actionRow({ status: 'rejected', version: 2 })] }
      }
      return { rows: [] }
    })

    await rejectAction(pool, PERSON, ACTION_ID, 1, 'user:123')
    const updateCall = calls.find((c) => c.sql.includes('update personal.proposed_actions'))
    expect(updateCall?.params?.[1]).toBe(JSON.stringify({ reason: 'user_rejected' }))
  })

  it('listProposedActions không truyền options → limit mặc định 50, không lọc status', async () => {
    let captured: { sql: string; params?: unknown[] } | undefined
    const pool = mockPool(async (sql, params) => {
      captured = { sql, params }
      return { rows: [] }
    })

    expect(await listProposedActions(pool, PERSON)).toEqual([])
    expect(captured?.sql).not.toContain('status =')
    expect(captured?.params).toEqual([PERSON, 50])
  })

  it('listProposedActions kẹp limit vào khoảng 1..100', async () => {
    let captured: unknown[] | undefined
    const pool = mockPool(async (_sql, params) => {
      captured = params
      return { rows: [] }
    })

    await listProposedActions(pool, PERSON, { limit: 500 })
    expect(captured?.[1]).toBe(100)

    await listProposedActions(pool, PERSON, { limit: -3 })
    expect(captured?.[1]).toBe(1)
  })
})
