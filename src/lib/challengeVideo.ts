// src/lib/challengeVideo.ts — Kho VIDEO challenge cục bộ bằng IndexedDB THÔ (không thư viện,
// giữ ngân sách bundle — docs/research/thu-thach-challenge-30-ngay.md mục 4.1).
//
// Nguyên tắc: video CHỈ nằm trên máy người dùng (không upload — chi phí 0, riêng tư
// tối đa); transcript + feedback mới là dữ liệu chính (đồng bộ Supabase ở lib/challenge.ts).
// Vì là tính năng PHỤ TRỢ, mọi hàm ở đây bắt lỗi (máy không có IndexedDB, hết quota,
// chế độ riêng tư Safari…) và trả null/false/[] ÊM ÁI — không bao giờ throw vỡ luồng nộp challenge.
//
// Khóa bản ghi: `${uid}_${dateStr}` với dateStr dạng YYYY-MM-DD (giờ VN — vnDateStr).
// Chính sách dọn dẹp (giữ video ngày 1 + 7 video gần nhất) do lib/challenge.ts TÍNH
// (getKeepDates) rồi gọi pruneChallengeVideos ở đây — file này chỉ biết lưu/xóa.

const DB_NAME = 'et_challenge_videos'
const DB_VERSION = 1
const STORE = 'videos'
// dateStr luôn dài đúng 10 ký tự (YYYY-MM-DD) — dùng để tách ngày ra khỏi khóa
// `${uid}_${dateStr}` mà không sợ uid có chứa dấu gạch dưới.
const DATE_STR_LEN = 10

// Giá trị lưu trong store (khóa out-of-line = `${uid}_${dateStr}`).
interface StoredVideo {
  blob: Blob
  mime: string
  savedAt: number // Date.now() lúc lưu — phòng khi cần debug/dọn theo tuổi sau này
}

function videoKey(uid: string, dateStr: string): string {
  return `${uid}_${dateStr}`
}

// Bọc IDBRequest thành Promise cho dễ dùng async/await.
function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB request failed'))
  })
}

// Mở (tạo nếu chưa có) database. Trả null khi máy không hỗ trợ / bị chặn.
function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null)
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE) // khóa out-of-line, truyền lúc put()
        }
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null) // bị chặn (private mode…) → coi như không có kho
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

// Chạy 1 thao tác trên object store rồi LUÔN đóng db; mọi lỗi → giá trị fallback.
async function withStore<T>(
  mode: IDBTransactionMode,
  fallback: T,
  fn: (store: IDBObjectStore) => Promise<T>,
): Promise<T> {
  const db = await openDb()
  if (!db) return fallback
  try {
    const result = await fn(db.transaction(STORE, mode).objectStore(STORE))
    return result
  } catch {
    return fallback // hết quota / transaction abort / dữ liệu hỏng → êm ái
  } finally {
    db.close()
  }
}

// Lưu (ghi đè) video của 1 ngày. Trả false khi lưu không được (hết quota, không
// hỗ trợ…) — UI có thể nhắc "tải video về máy" thay vì chặn luồng nộp.
export function saveChallengeVideo(
  uid: string,
  dateStr: string,
  blob: Blob,
  mime: string,
): Promise<boolean> {
  const value: StoredVideo = { blob, mime, savedAt: Date.now() }
  return withStore('readwrite', false, async (store) => {
    await reqToPromise(store.put(value, videoKey(uid, dateStr)))
    return true
  })
}

// Đọc video của 1 ngày. null = không có / không đọc được.
export function getChallengeVideo(
  uid: string,
  dateStr: string,
): Promise<{ blob: Blob; mime: string } | null> {
  return withStore<{ blob: Blob; mime: string } | null>('readonly', null, async (store) => {
    const raw = (await reqToPromise(store.get(videoKey(uid, dateStr)))) as StoredVideo | undefined
    if (!raw || !(raw.blob instanceof Blob)) return null
    return { blob: raw.blob, mime: typeof raw.mime === 'string' ? raw.mime : raw.blob.type }
  })
}

// Xóa video của 1 ngày. Trả false khi thao tác không thực hiện được.
export function deleteChallengeVideo(uid: string, dateStr: string): Promise<boolean> {
  return withStore('readwrite', false, async (store) => {
    await reqToPromise(store.delete(videoKey(uid, dateStr)))
    return true
  })
}

// Liệt kê các NGÀY (YYYY-MM-DD) đang có video của uid này. [] khi lỗi/không có.
export function listChallengeVideoKeys(uid: string): Promise<string[]> {
  return withStore<string[]>('readonly', [], async (store) => {
    const keys = await reqToPromise(store.getAllKeys())
    const prefix = `${uid}_`
    return keys
      .filter((k): k is string => typeof k === 'string' && k.startsWith(prefix))
      .map((k) => k.slice(-DATE_STR_LEN)) // phần đuôi cố định 10 ký tự = dateStr
  })
}

// Dọn kho: xóa MỌI video của uid KHÔNG nằm trong keepDates (chính sách "ngày 1 +
// 7 video gần nhất" do lib/challenge.ts tính qua getKeepDates). Trả số video đã xóa
// (0 khi không có gì để xóa hoặc khi kho không truy cập được).
export async function pruneChallengeVideos(uid: string, keepDates: string[]): Promise<number> {
  const dates = await listChallengeVideoKeys(uid)
  const keep = new Set(keepDates)
  const toDelete = dates.filter((d) => !keep.has(d))
  let deleted = 0
  for (const d of toDelete) {
    if (await deleteChallengeVideo(uid, d)) deleted++
  }
  return deleted
}
