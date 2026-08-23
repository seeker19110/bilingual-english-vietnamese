// ── Spaced Repetition System (SRS) — thuật toán FSRS ──────────────────────
// Mỗi từ được học xong → tự động vào SRS.
// Khi ôn, người dùng đánh giá: Quên / Khó / Nhớ / Dễ
// Hệ thống tính khoảng cách ôn tiếp theo dựa trên đánh giá.
//
// [Nâng cấp 2026-07-16, đề xuất H — thay SM-2 tự viết bằng thư viện `ts-fsrs`
// (mã nguồn mở, MIT, cùng thuật toán Anki đang dùng từ bản 23.10). Nghiên cứu +
// quyết định đánh đổi ở docs/research/sm2-den-fsrs-2026-07-16.md — người dùng
// đã CHỌN "cắt hẳn, đặt lại từ New": mọi thẻ SRS cũ (từ vựng LẪN ngữ pháp, vì
// đề xuất E dùng chung engine này) coi như học lại từ đầu, không cố suy diễn
// lịch sử cũ (app trước đây không lưu log từng lượt ôn nên không thể tái tạo
// chính xác như Anki chuyển đổi engine cho người dùng cũ). Đổi KHO LƯU
// (`srs_${uid}` sang field mới) đồng nghĩa "cắt" tự nhiên — không cần code dọn
// dữ liệu cũ riêng, dữ liệu cũ chỉ đơn giản không còn được đọc đúng field nữa.]
//
// enable_short_term=false: bỏ bước "học trong vài phút" kiểu Anki (mặc định
// FSRS có bước ôn lại sau 1-10 phút) — app học/ôn theo NGÀY, không có màn hình
// nào mở chờ vài phút để ôn lại ngay; tương đương chọn "Ignore learning steps"
// trong cài đặt Anki. Xem docs/research/sm2-den-fsrs-2026-07-16.md.

import { fsrs, createEmptyCard, Rating as FsrsRating } from 'ts-fsrs'
import type { Card as FsrsCard, Grade } from 'ts-fsrs'
import type { DictEntry } from '../types'
import type { Rating, SRSCard } from './srsTypes'
import { pushProgress } from './progressSync'
import { saveSrsToIndexedDB, loadSrsFromIndexedDB, queueOfflineReview } from './offlineSrsStore'

// Kiểu ở `srsTypes.ts` (file chỉ-chứa-kiểu) để cắt chu trình import với `offlineSrsStore.ts`;
// xuất lại ở đây để mọi nơi đang import từ './srs' giữ nguyên.
export type { Rating, SRSCard } from './srsTypes'

const RATING_MAP: Record<Rating, Grade> = {
  again: FsrsRating.Again,
  hard: FsrsRating.Hard,
  good: FsrsRating.Good,
  easy: FsrsRating.Easy,
}

const scheduler = fsrs({ enable_short_term: false })

// Từ ≥3 lần "Quên" SAU KHI đã học được (state Review, đúng ngữ nghĩa FSRS —
// KHÔNG tính lần trượt đầu tiên lúc thẻ còn mới) bị xem là "leech" — tự động
// xếp vào diện cần chú ý (tab Từ khó).
const LEECH_THRESHOLD = 3

// Cap số thẻ ôn mỗi phiên để tránh dồn quá nhiều sau khi nghỉ vài ngày —
// dễ ngợp và bỏ học (theo nghiên cứu Duolingo về lý do bỏ học).
export const SRS_SESSION_CAP = 30

function toStored(card: FsrsCard): SRSCard {
  return {
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: card.last_review ? card.last_review.getTime() : null,
  }
}

const KEY = (uid: string) => `srs_${uid}`
const MS = 86_400_000 // 1 ngày tính bằng ms

// Cache trong bộ nhớ — nguồn sự thật cho PHIÊN hiện tại. localStorage chỉ là lớp
// PERSIST (giữ qua lần tải lại trang). Lý do: trước đây khi `localStorage.setItem`
// ném lỗi hết quota, `save()` nuốt lỗi và KHÔNG có nơi nào giữ lại bản dữ liệu vừa
// ghi — `load()` lần sau đọc lại bản CŨ trong localStorage, coi như mọi lượt ôn vừa
// xong chưa từng xảy ra, rồi còn đẩy bản cũ đó đè lên server qua `pushProgress`. Với
// người học lâu năm (~12k từ ≈ 2MB, sát trần 5MB localStorage) đây là mất dữ liệu
// THẬT, không có tín hiệu báo (audit toàn diện 2026-08-23). Giữ cache ở đây đảm bảo
// `load()` trong cùng phiên luôn thấy đúng bản mới nhất, bất kể `localStorage.setItem`
// có thành công hay không.
const memCache = new Map<string, Record<string, SRSCard>>()

// Chỉ dùng trong test: mỗi test cần bắt đầu sạch, khớp với `localStorage.clear()` ở
// `beforeEach` — nếu không, cache module-level này sẽ giữ dữ liệu rò từ test trước
// sang test sau dù localStorage đã sạch (memCache không tự biết localStorage vừa bị xoá).
export function _resetSrsMemCacheForTests(): void {
  memCache.clear()
}

function load(uid: string): Record<string, SRSCard> {
  const cached = memCache.get(uid)
  if (cached) return cached
  let data: Record<string, SRSCard> = {}
  try {
    const raw = localStorage.getItem(KEY(uid))
    if (raw) data = JSON.parse(raw)
  } catch {
    /* localStorage lỗi hoặc JSON hỏng — coi như chưa có dữ liệu */
  }
  memCache.set(uid, data)
  return data
}

function save(uid: string, data: Record<string, SRSCard>) {
  memCache.set(uid, data)
  try {
    localStorage.setItem(KEY(uid), JSON.stringify(data))
  } catch {
    /* hết quota localStorage — dữ liệu vẫn đúng trong memCache cho phiên này;
       IndexedDB dự phòng ở dưới cho lần tải lại sau */
  }
  void saveSrsToIndexedDB(uid, data)
}

// Khôi phục dữ liệu SRS từ IndexedDB nếu localStorage rỗng (ví dụ bị OS xóa)
export async function syncSrsFromIndexedDB(uid: string): Promise<Record<string, SRSCard>> {
  const current = load(uid)
  if (Object.keys(current).length > 0) return current
  const fromIdb = await loadSrsFromIndexedDB(uid)
  if (fromIdb && Object.keys(fromIdb).length > 0) {
    memCache.set(uid, fromIdb)
    try {
      localStorage.setItem(KEY(uid), JSON.stringify(fromIdb))
    } catch {
      /* bỏ qua — memCache đã có bản đúng cho phiên này */
    }
    return fromIdb
  }
  return current
}

// Từ MỚI học đến hạn ôn sau 4 GIỜ (không phải ngay lập tức): ôn cùng ngày buổi
// tối vẫn giữ spacing ngắn đầu tiên, nhưng badge "Ôn SRS" không nhảy số NGAY khi
// vừa học xong batch — tránh cảm giác "vừa xong đã nợ" (E4, xem
// docs/research/cai-tien-trai-nghiem-hoc-2026-07-11.md). Chỉ ảnh hưởng thẻ TẠO MỚI.
// Quyết định UX này ĐỘC LẬP với thuật toán bên dưới (SM-2 trước đây / FSRS bây giờ).
export const NEW_CARD_DELAY_MS = 4 * 3_600_000

// Thêm từ vào SRS khi đánh dấu "đã thuộc" — due = +4h để ôn lại trong ngày
export function addToSRS(uid: string, word: string) {
  const data = load(uid)
  const key = word.toLowerCase()
  if (!data[key]) {
    const now = Date.now()
    const card = createEmptyCard(new Date(now))
    data[key] = { ...toStored(card), due: now + NEW_CARD_DELAY_MS }
    save(uid, data)
    pushProgress(uid) // đồng bộ lịch ôn lên Supabase
  }
}

// Từ "đã biết sẵn" qua test-out (nút "Tôi đã biết vòng này" — quiz ≥90% đúng)
// vào SRS với interval DÀI HƠN addToSRS() thường (mặc định 7 ngày): người dùng
// đã CHỨNG MINH thuộc từ qua quiz nên không cần ôn ngay hôm nay như từ mới học
// lần đầu. Chạy 1 lượt 'good' ảo qua FSRS để có stability/difficulty hợp lý
// (không tự bịa số) rồi ghi đè `due` theo `intervalDays` yêu cầu.
const KNOWN_INTERVAL_DAYS = 7
export function addToSRSKnown(uid: string, word: string, intervalDays = KNOWN_INTERVAL_DAYS) {
  const data = load(uid)
  const key = word.toLowerCase()
  if (!data[key]) {
    const now = Date.now()
    const empty = createEmptyCard(new Date(now))
    const { card } = scheduler.next(empty, new Date(now), FsrsRating.Good)
    data[key] = { ...toStored(card), due: now + intervalDays * MS }
    save(uid, data)
    pushProgress(uid) // đồng bộ lịch ôn lên Supabase
  }
}

// Cập nhật lịch ôn sau khi người dùng đánh giá 1 thẻ
export function reviewWord(uid: string, word: string, rating: Rating) {
  const data = load(uid)
  const key = word.toLowerCase()
  const now = Date.now()
  const existing: SRSCard = data[key] ?? toStored(createEmptyCard(new Date(now)))
  const { card } = scheduler.next(existing, new Date(now), RATING_MAP[rating])
  const stored = toStored(card)
  // 'again' (Quên): hẹn ôn lại NGAY trong phiên này (due = bây giờ) — đúng như gợi ý UI
  // "Quên → ôn sớm" và để SRSReview tải lại thẻ này cho người dùng drill tới khi nhớ.
  // Quyết định UX riêng của app, ĐỘC LẬP với lịch FSRS tự tính cho 'again'.
  if (rating === 'again') stored.due = now
  data[key] = stored
  save(uid, data)
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    void queueOfflineReview(uid, word, rating, now)
  }
  pushProgress(uid) // đồng bộ lịch ôn lên Supabase
}

// Lấy các từ đến hạn ôn hôm nay.
// `limit`: cap số thẻ trả về (mặc định không cap — dùng cho đếm badge/thống kê),
// ưu tiên thẻ quá hạn LÂU NHẤT rồi tới độ khó (difficulty) CAO NHẤT trước, tránh
// cảm giác ngợp khi danh sách due dồn lại sau vài ngày nghỉ (chỉ áp khi gọi có
// limit, ví dụ phiên ôn thật trong SRSReview).
export function getDueWords(uid: string, words: DictEntry[], limit?: number): DictEntry[] {
  const data = load(uid)
  const now = Date.now()
  const due = words.filter((w) => {
    const c = data[w.word.toLowerCase()]
    return c && c.due <= now
  })
  if (limit == null) return due
  const sorted = [...due].sort((a, b) => {
    const ca = data[a.word.toLowerCase()]!
    const cb = data[b.word.toLowerCase()]!
    return ca.due - cb.due || cb.difficulty - ca.difficulty
  })
  return sorted.slice(0, limit)
}

// Từ bị đánh "Quên" ≥3 lần SAU KHI đã học được — tự động coi là "leech", cần
// chú ý thêm (tab Từ khó).
export function getLeechWords(uid: string, words: DictEntry[]): DictEntry[] {
  const data = load(uid)
  return words.filter((w) => (data[w.word.toLowerCase()]?.lapses ?? 0) >= LEECH_THRESHOLD)
}

// Thống kê SRS của user — CHỈ TỪ VỰNG (loại thẻ `grammar:*`, dùng chung 1 kho FSRS
// nhưng không phải "từ"). Trước đây đếm cả thẻ ngữ pháp vào đây, khiến Dashboard/push
// notification hiện "N từ cần ôn" bị phồng lên tới 78 (số bài ngữ pháp), lệch với tab
// "Ôn SRS" (vốn đã lọc đúng theo `allWordsPool`) — audit toàn diện 2026-08-23.
export function getSRSStats(uid: string): { total: number; due: number } {
  const data = load(uid)
  const now = Date.now()
  const entries = Object.entries(data)
    .filter(([key]) => !key.startsWith('grammar:'))
    .map(([, card]) => card)
  return {
    total: entries.length,
    due: entries.filter((c) => c.due <= now).length,
  }
}

// Ngày ôn tiếp theo của 1 từ (null nếu chưa trong SRS)
export function getNextReview(uid: string, word: string): Date | null {
  const data = load(uid)
  const card = data[word.toLowerCase()]
  return card ? new Date(card.due) : null
}

// ── Ngữ pháp: dùng CHUNG kho FSRS này (đề xuất E,
// docs/research/danh-gia-tien-trien-hoc-2026-07-07.md — "spacing áp cho mọi loại kiến thức,
// không riêng từ vựng"). Tiền tố `grammar:` để khoá KHÔNG đụng namespace với từ tiếng Anh
// (word) đang lưu trong cùng 1 kho `srs_${uid}`.
// LƯU Ý (audit 2026-08-12): addToSRS()/reviewWord() hạ chữ thường TOÀN BỘ khoá trước khi ghi
// (`word.toLowerCase()`), nên khoá ĐỌC ở đây cũng phải hạ chữ thường — nếu không, một lessonId
// có chữ hoa sẽ được GHI dưới khoá `grammar:a1-be` nhưng ĐỌC dưới `grammar:A1-Be` → bài đó
// không bao giờ đến hạn ôn, hỏng im lặng. Hiện cả 78 lessonId đều chữ thường nên dữ liệu đã
// lưu KHÔNG đổi; đây là chặn sẵn cho lessonId thêm sau này.
const grammarKey = (lessonId: string) => `grammar:${lessonId.toLowerCase()}`

// Vào vòng ôn khi 1 bài ngữ pháp được đánh dấu "đã học xong" (gọi từ markGrammarDone).
export function addGrammarToSRS(uid: string, lessonId: string) {
  addToSRS(uid, grammarKey(lessonId))
}

// Cập nhật lịch ôn sau khi trả lời 1 câu quiz ngữ pháp — đúng → 'good', sai → 'again'
// (suy ra tự động từ đúng/sai, không hỏi người dùng tự đánh giá như thẻ từ vựng).
export function reviewGrammar(uid: string, lessonId: string, rating: Rating) {
  reviewWord(uid, grammarKey(lessonId), rating)
}

// Các bài ngữ pháp đến hạn ôn trong số `lessonIds` đã học xong — cùng thứ tự ưu tiên
// (quá hạn lâu nhất trước) như getDueWords.
export function getDueGrammarLessonIds(uid: string, lessonIds: string[], limit?: number): string[] {
  const data = load(uid)
  const now = Date.now()
  const due = lessonIds.filter((id) => {
    const c = data[grammarKey(id)]
    return c && c.due <= now
  })
  if (limit == null) return due
  const sorted = [...due].sort((a, b) => {
    const ca = data[grammarKey(a)]!
    const cb = data[grammarKey(b)]!
    return ca.due - cb.due || cb.difficulty - ca.difficulty
  })
  return sorted.slice(0, limit)
}
