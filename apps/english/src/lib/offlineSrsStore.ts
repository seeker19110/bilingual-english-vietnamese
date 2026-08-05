// ──────────────────────────────────────────────────────────────────────────
// OFFLINE SRS STORE — Lưu trữ 2 lớp (IndexedDB + localStorage) cho thẻ SRS FSRS
//
// Giúp duy trì dữ liệu SRS lâu dài ngay cả khi localStorage bị dọn dẹp bởi OS,
// đồng thời lưu vết các lượt reviewSRS phát sinh khi không có kết nối Internet.
// ──────────────────────────────────────────────────────────────────────────

import type { SRSCard, Rating } from './srs'

const DB_NAME = 'gia-su-srs-db'
const STORE_CARDS = 'srs_cards'
const STORE_QUEUE = 'offline_queue'
const DB_VERSION = 1

export interface PendingReview {
  id?: number
  uid: string
  word: string
  rating: Rating
  timestamp: number
}

let _db: IDBDatabase | null = null
let _dbPromise: Promise<IDBDatabase> | null = null

function openSrsDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not supported'))
  }
  if (_db) return Promise.resolve(_db)
  if (_dbPromise) return _dbPromise

  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE_CARDS)) {
        db.createObjectStore(STORE_CARDS) // key = uid
      }
      if (!db.objectStoreNames.contains(STORE_QUEUE)) {
        const queueStore = db.createObjectStore(STORE_QUEUE, {
          keyPath: 'id',
          autoIncrement: true,
        })
        queueStore.createIndex('uid', 'uid', { unique: false })
      }
    }
    req.onsuccess = () => {
      _db = req.result
      resolve(_db)
    }
    req.onerror = () => {
      _dbPromise = null
      reject(req.error)
    }
  })
  return _dbPromise
}

// Lưu dữ liệu SRS snapshot vào IndexedDB theo uid
export async function saveSrsToIndexedDB(
  uid: string,
  data: Record<string, SRSCard>,
): Promise<void> {
  try {
    const db = await openSrsDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_CARDS, 'readwrite')
      const req = tx.objectStore(STORE_CARDS).put(data, uid)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    /* bỏ qua lỗi lưu cache IndexedDB */
  }
}

// Đọc dữ liệu SRS snapshot từ IndexedDB theo uid
export async function loadSrsFromIndexedDB(uid: string): Promise<Record<string, SRSCard> | null> {
  try {
    const db = await openSrsDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_CARDS, 'readonly')
      const req = tx.objectStore(STORE_CARDS).get(uid)
      req.onsuccess = () => {
        const res = req.result as Record<string, SRSCard> | undefined
        resolve(res ?? null)
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

// Đưa 1 lượt review offline vào hàng chờ sync
export async function queueOfflineReview(
  uid: string,
  word: string,
  rating: Rating,
  timestamp = Date.now(),
): Promise<void> {
  try {
    const db = await openSrsDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite')
      const item: PendingReview = { uid, word, rating, timestamp }
      const req = tx.objectStore(STORE_QUEUE).add(item)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    /* bỏ qua */
  }
}

// Lấy danh sách các lượt review chưa sync
export async function getPendingOfflineReviews(uid: string): Promise<PendingReview[]> {
  try {
    const db = await openSrsDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_QUEUE, 'readonly')
      const store = tx.objectStore(STORE_QUEUE)
      const index = store.index('uid')
      const req = index.getAll(uid)
      req.onsuccess = () => {
        const rows = (req.result as PendingReview[]) || []
        resolve(rows)
      }
      req.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

// Xoá các lượt review đã sync thành công khỏi hàng chờ
export async function clearPendingOfflineReviews(uid: string, ids: number[]): Promise<void> {
  if (ids.length === 0) return
  try {
    const db = await openSrsDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_QUEUE, 'readwrite')
      const store = tx.objectStore(STORE_QUEUE)
      for (const id of ids) {
        store.delete(id)
      }
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    /* bỏ qua */
  }
}
