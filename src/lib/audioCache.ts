// ──────────────────────────────────────────────────────────────────────────
// AUDIO CACHE — lưu audio đã giải mã vào IndexedDB (persistent)
//
// Tại sao IndexedDB thay vì memory Map?
//   - Tồn tại qua các lần mở/đóng tab — không cần tải lại từ đầu
//   - Không chiếm RAM liên tục (trình duyệt quản lý bộ nhớ)
//   - Tự động dọn sau 7 ngày để không chiếm ổ đĩa mãi
//
// Mỗi entry: { buffer: ArrayBuffer, ts: number }
//   buffer = audio MP3 đã giải mã AES-256-GCM (sẵn sàng phát, không cần mã hoá lại)
//   ts     = Unix timestamp lúc lưu (ms) — dùng để dọn entry cũ
// ──────────────────────────────────────────────────────────────────────────

const DB_NAME = 'tts-audio-cache'
const STORE   = 'audio'
const VERSION = 1
const TTL_MS  = 7 * 24 * 60 * 60 * 1000 // giữ 7 ngày

let _db: IDBDatabase | null = null
let _dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db)
  if (_dbPromise) return _dbPromise

  _dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE)
    }
    req.onsuccess = () => { _db = req.result; resolve(_db) }
    req.onerror   = () => reject(req.error)
  })
  return _dbPromise
}

// Key tra cứu: "lang:voice:text"
export function audioCacheKey(text: string, lang: string, voice: string): string {
  return `${lang}:${voice}:${text}`
}

// Đọc ArrayBuffer đã lưu; trả null nếu không có hoặc đã hết hạn
export async function getAudioBuffer(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx  = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => {
        const row = req.result as { buffer: ArrayBuffer; ts: number } | undefined
        if (!row) { resolve(null); return }
        // Hết hạn → xoá luôn
        if (Date.now() - row.ts > TTL_MS) {
          void deleteAudioBuffer(key)
          resolve(null)
        } else {
          resolve(row.buffer)
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

// Lưu ArrayBuffer vào IndexedDB
export async function setAudioBuffer(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE, 'readwrite')
      const req = tx.objectStore(STORE).put({ buffer, ts: Date.now() }, key)
      req.onsuccess = () => resolve()
      req.onerror   = () => reject(req.error)
    })
  } catch {
    // Lỗi ghi cache (hết dung lượng, chế độ ẩn danh nghiêm ngặt...) → bỏ qua
  }
}

async function deleteAudioBuffer(key: string): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).delete(key)
      tx.oncomplete = () => resolve()
      tx.onerror    = () => resolve()
    })
  } catch { /* bỏ qua */ }
}

// Xoá toàn bộ cache (gọi khi đăng xuất)
export async function clearAudioCache(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).clear()
      tx.oncomplete = () => resolve()
      tx.onerror    = () => resolve()
    })
  } catch { /* bỏ qua */ }
}
