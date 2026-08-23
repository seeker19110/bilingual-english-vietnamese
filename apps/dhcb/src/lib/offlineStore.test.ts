// apps/dhcb/src/lib/offlineStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import {
  enqueueOfflineAction,
  getPendingOfflineActions,
  removeOfflineAction,
  flushOfflineQueue,
} from './offlineStore.js'

describe('offlineStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('enqueues and retrieves offline actions', () => {
    const action = enqueueOfflineAction({
      kind: 'srs_review',
      payload: { wordId: 'w-1', result: 'good' },
    })

    expect(action.id).toBeTruthy()
    const pending = getPendingOfflineActions()
    expect(pending).toHaveLength(1)
    expect(pending[0]?.kind).toBe('srs_review')
  })

  it('removes action by id', () => {
    const a1 = enqueueOfflineAction({ kind: 'srs_review', payload: {} })
    const a2 = enqueueOfflineAction({ kind: 'habit_checkin', payload: {} })

    expect(getPendingOfflineActions()).toHaveLength(2)
    removeOfflineAction(a1.id)

    const remaining = getPendingOfflineActions()
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe(a2.id)
  })

  it('flushes queue with custom handler', async () => {
    enqueueOfflineAction({ kind: 'srs_review', payload: { id: 1 } })
    enqueueOfflineAction({ kind: 'habit_checkin', payload: { id: 2 } })

    const res = await flushOfflineQueue(async (act) => {
      return act.kind === 'srs_review' // simulate only first action succeeds
    })

    expect(res.flushed).toBe(1)
    expect(res.remaining).toBe(1)
  })
})
