// apps/english/src/lib/edgeAi/edgeModelStorage.ts — Lưu trữ nhị phân bền vững cho Edge AI Models
// Sử dụng Origin Private File System (OPFS) làm tầng ưu tiên, tự động fallback sang IndexedDB.

const DB_NAME = 'dhcb_edge_ai_models'
const DB_VERSION = 1
const STORE_NAME = 'models'

interface ModelCacheRecord {
  modelId: string
  version: string
  buffer: ArrayBuffer
  sizeBytes: number
  cachedAt: number
}

// In-memory fallback khi cả OPFS và IndexedDB không khả dụng (vd: test environment)
const memoryModelStore = new Map<string, ModelCacheRecord>()

/** Kiểm tra hỗ trợ Origin Private File System (OPFS) */
export function isOpfsSupported(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.storage !== 'undefined' &&
    typeof navigator.storage.getDirectory === 'function'
  )
}

/** Mở kết nối IndexedDB */
function openIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'))
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'modelId' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/** Lưu trữ trọng số mô hình hoặc rules dataset vào bộ nhớ bền vững */
export async function saveModelWeights(
  modelId: string,
  version: string,
  data: ArrayBuffer | Uint8Array,
): Promise<boolean> {
  let buffer: ArrayBuffer
  if (data instanceof ArrayBuffer) {
    buffer = data
  } else {
    const copy = new Uint8Array(data.byteLength)
    copy.set(new Uint8Array(data.buffer, data.byteOffset, data.byteLength))
    buffer = copy.buffer
  }
  const sizeBytes = buffer.byteLength
  const cachedAt = Date.now()

  // 1. Thử ghi qua OPFS nếu hỗ trợ
  if (isOpfsSupported()) {
    try {
      const rootDir = await navigator.storage.getDirectory()
      const modelsDir = await rootDir.getDirectoryHandle('edge_models', { create: true })
      const fileName = `${modelId}_${version}.bin`
      const fileHandle = await modelsDir.getFileHandle(fileName, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(buffer)
      await writable.close()
      return true
    } catch {
      // Fallback sang IndexedDB
    }
  }

  // 2. Fallback sang IndexedDB
  try {
    const db = await openIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const record: ModelCacheRecord = {
        modelId: `${modelId}_${version}`,
        version,
        buffer,
        sizeBytes,
        cachedAt,
      }
      const req = store.put(record)
      req.onsuccess = () => resolve(true)
      req.onerror = () => reject(req.error)
    })
  } catch {
    // 3. Fallback sang In-Memory Map
    memoryModelStore.set(`${modelId}_${version}`, {
      modelId: `${modelId}_${version}`,
      version,
      buffer,
      sizeBytes,
      cachedAt,
    })
    return true
  }
}

/** Tải trọng số mô hình đã lưu từ bộ nhớ cục bộ */
export async function loadModelWeights(
  modelId: string,
  version: string,
): Promise<ArrayBuffer | null> {
  const key = `${modelId}_${version}`

  // 1. Thử đọc từ OPFS
  if (isOpfsSupported()) {
    try {
      const rootDir = await navigator.storage.getDirectory()
      const modelsDir = await rootDir.getDirectoryHandle('edge_models', { create: false })
      const fileName = `${key}.bin`
      const fileHandle = await modelsDir.getFileHandle(fileName, { create: false })
      const file = await fileHandle.getFile()
      return await file.arrayBuffer()
    } catch {
      // Fallback
    }
  }

  // 2. Thử đọc từ IndexedDB
  try {
    const db = await openIndexedDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(key)
      req.onsuccess = () => {
        const record = req.result as ModelCacheRecord | undefined
        resolve(record ? record.buffer : null)
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    // 3. Đọc từ In-Memory Map
    const inMem = memoryModelStore.get(key)
    return inMem ? inMem.buffer : null
  }
}

/** Kiểm tra mô hình đã được cache cục bộ chưa */
export async function checkModelCached(modelId: string, version: string): Promise<boolean> {
  const data = await loadModelWeights(modelId, version)
  return data !== null && data.byteLength > 0
}

/** Xóa toàn bộ hoặc một mô hình khỏi bộ nhớ đệm */
export async function purgeModelCache(modelId?: string): Promise<void> {
  // 1. Dọn OPFS
  if (isOpfsSupported()) {
    try {
      const rootDir = await navigator.storage.getDirectory()
      if (modelId) {
        const modelsDir = await rootDir.getDirectoryHandle('edge_models', { create: false })
        await modelsDir.removeEntry(`${modelId}.bin`)
      } else {
        await rootDir.removeEntry('edge_models', { recursive: true })
      }
    } catch {
      // Ignore cleanup error
    }
  }

  // 2. Dọn IndexedDB
  try {
    const db = await openIndexedDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    if (modelId) {
      store.delete(modelId)
    } else {
      store.clear()
    }
  } catch {
    // Ignore
  }

  // 3. Dọn In-memory
  if (modelId) {
    memoryModelStore.delete(modelId)
  } else {
    memoryModelStore.clear()
  }
}
