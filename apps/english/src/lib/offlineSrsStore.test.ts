import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { SRSRecord } from './srs'

// Setup in-memory mock IndexedDB for testing
class MockIDBRequest {
  result: unknown = null
  error: unknown = null
  onsuccess: (() => void) | null = null
  onerror: (() => void) | null = null
  onupgradeneeded: (() => void) | null = null
}

class MockIDBTransaction {
  objectStoreNames = ['srs_cards', 'offline_queue']
  oncomplete: (() => void) | null = null
  onerror: (() => void) | null = null
  private storeData: Map<string, Map<unknown, unknown>> = new Map()

  constructor(storesMap: Map<string, Map<unknown, unknown>>) {
    this.storeData = storesMap
  }

  objectStore(name: string) {
    const data = this.storeData.get(name) || new Map()
    this.storeData.set(name, data)
    setTimeout(() => this.oncomplete?.(), 0)

    return {
      put: (value: unknown, key: unknown) => {
        data.set(key, value)
        const req = new MockIDBRequest()
        setTimeout(() => req.onsuccess?.(), 0)
        return req
      },
      add: (value: { id?: unknown }) => {
        const key = value.id || data.size + 1
        value.id = key
        data.set(key, value)
        const req = new MockIDBRequest()
        setTimeout(() => req.onsuccess?.(), 0)
        return req
      },
      get: (key: unknown) => {
        const req = new MockIDBRequest()
        req.result = data.get(key)
        setTimeout(() => req.onsuccess?.(), 0)
        return req
      },
      delete: (key: unknown) => {
        data.delete(key)
        const req = new MockIDBRequest()
        setTimeout(() => req.onsuccess?.(), 0)
        return req
      },
      index: () => ({
        getAll: (uid: string) => {
          const req = new MockIDBRequest()
          const res = Array.from(data.values()).filter((v) => (v as { uid?: string }).uid === uid)
          req.result = res
          setTimeout(() => req.onsuccess?.(), 0)
          return req
        },
      }),
    }
  }
}

class MockIDBDatabase {
  objectStoreNames = {
    contains: (name: string) => name === 'srs_cards' || name === 'offline_queue',
  }
  private storesMap = new Map<string, Map<unknown, unknown>>()

  createObjectStore(name: string) {
    if (!this.storesMap.has(name)) this.storesMap.set(name, new Map())
    return { createIndex: () => {} }
  }

  transaction() {
    return new MockIDBTransaction(this.storesMap)
  }
}

const mockDbInstance = new MockIDBDatabase()

// Inject global indexedDB mock
if (typeof globalThis.indexedDB === 'undefined') {
  Object.defineProperty(globalThis, 'indexedDB', {
    value: {
      open: () => {
        const req = new MockIDBRequest()
        req.result = mockDbInstance
        setTimeout(() => {
          req.onupgradeneeded?.()
          req.onsuccess?.()
        }, 0)
        return req
      },
    },
    writable: true,
  })
}

import {
  saveSrsToIndexedDB,
  loadSrsFromIndexedDB,
  queueOfflineReview,
  getPendingOfflineReviews,
  clearPendingOfflineReviews,
} from './offlineSrsStore'

describe('offlineSrsStore — IndexedDB dual layer & offline queue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('lưu và khôi phục dữ liệu SRS thẻ từ IndexedDB', async () => {
    const mockCards: SRSRecord = {
      apple: {
        due: 1000,
        stability: 1,
        difficulty: 1,
        elapsed_days: 0,
        scheduled_days: 1,
        reps: 1,
        lapses: 0,
        state: 1,
        last_review: 500,
      },
    }

    await saveSrsToIndexedDB('user1', mockCards)
    const loaded = await loadSrsFromIndexedDB('user1')
    expect(loaded).toEqual(mockCards)
  })

  it('lưu hàng chờ review offline và lấy danh sách chưa sync', async () => {
    await queueOfflineReview('user2', 'banana', 'good', 123456)
    await queueOfflineReview('user2', 'cherry', 'again', 123457)

    const pending = await getPendingOfflineReviews('user2')
    expect(pending.length).toBeGreaterThanOrEqual(2)
    expect(pending.some((p) => p.word === 'banana' && p.rating === 'good')).toBe(true)
    expect(pending.some((p) => p.word === 'cherry' && p.rating === 'again')).toBe(true)
  })

  it('xoá các lượt review offline đã sync thành công', async () => {
    await queueOfflineReview('user3', 'orange', 'easy', 200000)
    const pendingBefore = await getPendingOfflineReviews('user3')
    const ids = pendingBefore.map((p) => p.id!).filter(Boolean)

    await clearPendingOfflineReviews('user3', ids)
    const pendingAfter = await getPendingOfflineReviews('user3')
    expect(pendingAfter.length).toBe(0)
  })
})
