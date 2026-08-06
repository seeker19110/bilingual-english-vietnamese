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

import type { VisemeFrame } from './viseme'

const DB_NAME = 'tts-audio-cache'
const STORE = 'audio'
const VERSION = 1
const TTL_MS = 7 * 24 * 60 * 60 * 1000 // giữ 7 ngày

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
    req.onsuccess = () => {
      _db = req.result
      resolve(_db)
    }
    req.onerror = () => reject(req.error)
  })
  return _dbPromise
}

// Đồng bộ TAY với VOICE_VERSION ở api/_lib/googleTts.ts (file đó chỉ chạy server, không import
// được từ code trình duyệt). Mỗi khi bên server bump VOICE_VERSION (đổi/nâng cấp giọng đọc) —
// PHẢI đổi giá trị này theo, không thì cache IndexedDB trên máy người dùng cũ vẫn phát audio
// giọng CŨ tới 7 ngày (TTL) dù server đã có bản ghi mới, vì IndexedDB được tra TRƯỚC khi gọi
// server (xem ensureAudioWithTimeline trong ./tts.ts) — lỗi thật đã xác nhận 2026-08-06.
const AUDIO_CACHE_VERSION = 'chirp3hd-v3'

// Key tra cứu: "version:lang:voice:text"
export function audioCacheKey(text: string, lang: string, voice: string): string {
  return `${AUDIO_CACHE_VERSION}:${lang}:${voice}:${text}`
}

// Một entry trong store. `timeline` thêm ở đợt avatar (viseme timing thật từ /api/tts) —
// KHÔNG cần nâng VERSION vì object store không có schema cố định: entry cũ thiếu trường này chỉ
// đọc ra undefined, nơi gọi tự ước lượng như trước.
interface AudioEntry {
  buffer: ArrayBuffer
  ts: number
  timeline?: VisemeFrame[]
}

// Đọc cả buffer lẫn timeline; trả null nếu không có hoặc đã hết hạn
export async function getAudioEntry(
  key: string,
): Promise<{ buffer: ArrayBuffer; timeline: VisemeFrame[] | null } | null> {
  try {
    const db = await openDb()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => {
        const row = req.result as AudioEntry | undefined
        if (!row) {
          resolve(null)
          return
        }
        // Hết hạn → xoá luôn
        if (Date.now() - row.ts > TTL_MS) {
          void deleteAudioBuffer(key)
          resolve(null)
        } else {
          resolve({ buffer: row.buffer, timeline: row.timeline ?? null })
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

// Đọc ArrayBuffer đã lưu; trả null nếu không có hoặc đã hết hạn
export async function getAudioBuffer(key: string): Promise<ArrayBuffer | null> {
  const entry = await getAudioEntry(key)
  return entry?.buffer ?? null
}

// Lưu ArrayBuffer (kèm timeline khẩu hình nếu server có trả) vào IndexedDB
export async function setAudioBuffer(
  key: string,
  buffer: ArrayBuffer,
  timeline?: VisemeFrame[] | null,
): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const entry: AudioEntry = { buffer, ts: Date.now() }
      if (timeline && timeline.length > 0) entry.timeline = timeline
      const req = tx.objectStore(STORE).put(entry, key)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
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
      tx.onerror = () => resolve()
    })
  } catch {
    /* bỏ qua */
  }
}

// Xoá toàn bộ cache (gọi khi đăng xuất)
export async function clearAudioCache(): Promise<void> {
  try {
    const db = await openDb()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite')
      tx.objectStore(STORE).clear()
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    /* bỏ qua */
  }
}
