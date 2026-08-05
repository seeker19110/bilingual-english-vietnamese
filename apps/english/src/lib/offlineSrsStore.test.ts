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
  shouldFail = false
  failReqError = false
  private storeData: Map<string, Map<unknown, unknown>> = new Map()

  constructor(
    storesMap: Map<string, Map<unknown, unknown>>,
    shouldFail = false,
    failReqError = false,
  ) {
    this.storeData = storesMap
    this.shouldFail = shouldFail
    this.failReqError = failReqError
  }

  objectStore(name: string) {
    const data = this.storeData.get(name) || new Map()
    this.storeData.set(name, data)

    const isFailing = this.shouldFail || this.failReqError

    if (this.shouldFail) {
      setTimeout(() => this.onerror?.(), 0)
    } else {
      setTimeout(() => this.oncomplete?.(), 0)
    }

    return {
      put: (_value: unknown, _key: unknown) => {
        const req = new MockIDBRequest()
        if (isFailing) {
          req.error = new Error('put error')
          setTimeout(() => req.onerror?.(), 0)
        } else {
          data.set(_key, _value)
          setTimeout(() => req.onsuccess?.(), 0)
        }
        return req
      },
      add: (value: { id?: unknown }) => {
        const req = new MockIDBRequest()
        if (isFailing) {
          req.error = new Error('add error')
          setTimeout(() => req.onerror?.(), 0)
        } else {
          const key = value.id || data.size + 1
          value.id = key
          data.set(key, value)
          setTimeout(() => req.onsuccess?.(), 0)
        }
        return req
      },
      get: (key: unknown) => {
        const req = new MockIDBRequest()
        if (isFailing) {
          req.error = new Error('get error')
          setTimeout(() => req.onerror?.(), 0)
        } else {
          req.result = data.get(key)
          setTimeout(() => req.onsuccess?.(), 0)
        }
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
          if (isFailing) {
            req.error = new Error('getAll error')
            setTimeout(() => req.onerror?.(), 0)
          } else {
            const res = Array.from(data.values()).filter((v) => (v as { uid?: string }).uid === uid)
            req.result = res
            setTimeout(() => req.onsuccess?.(), 0)
          }
          return req
        },
      }),
    }
  }
}

class MockIDBDatabase {
  existingStores: string[] = []
  objectStoreNames = {
    contains: (name: string) => this.existingStores.includes(name),
  }
  shouldFailTx = false
  failReqError = false
  private storesMap = new Map<string, Map<unknown, unknown>>()

  createObjectStore(name: string) {
    if (!this.existingStores.includes(name)) this.existingStores.push(name)
    if (!this.storesMap.has(name)) this.storesMap.set(name, new Map())
    return { createIndex: () => {} }
  }

  transaction() {
    return new MockIDBTransaction(this.storesMap, this.shouldFailTx, this.failReqError)
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
    mockDbInstance.shouldFailTx = false
    mockDbInstance.failReqError = false
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

  it('trả về null khi không tìm thấy thẻ SRS cho user', async () => {
    const loaded = await loadSrsFromIndexedDB('non_existent_user')
    expect(loaded).toBeNull()
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

  it('xử lý an toàn khi clearPendingOfflineReviews truyền mảng rỗng', async () => {
    await clearPendingOfflineReviews('user3', [])
    const pending = await getPendingOfflineReviews('user3')
    expect(pending).toBeDefined()
  })

  it('xử lý fail-open khi IndexedDB bị lỗi transaction', async () => {
    mockDbInstance.shouldFailTx = true

    await saveSrsToIndexedDB('fail_user', {})
    const loaded = await loadSrsFromIndexedDB('fail_user')
    expect(loaded).toBeNull()

    await queueOfflineReview('fail_user', 'word', 'good')
    const pending = await getPendingOfflineReviews('fail_user')
    expect(pending).toEqual([])
  })

  it('xử lý onerror trên request trong loadSrsFromIndexedDB và getPendingOfflineReviews', async () => {
    mockDbInstance.failReqError = true

    const loaded = await loadSrsFromIndexedDB('err_user')
    expect(loaded).toBeNull()

    await saveSrsToIndexedDB('err_user', {})
    await queueOfflineReview('err_user', 'word', 'good')

    const pending = await getPendingOfflineReviews('err_user')
    expect(pending).toEqual([])
  })
})
