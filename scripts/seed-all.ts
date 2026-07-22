// scripts/seed-all.ts
// Công cụ seed audio (phát âm + TTS câu) có BÁO CÁO TIẾN ĐỘ + MENU chọn việc, GỘP LUÔN
// việc đồng bộ audio cache cũ (đang nằm local VPS) lên Cloudflare R2 — trước đây tách
// riêng ở scripts/sync-storage-to-r2.ts (đã gộp vào đây 2026-07-20, xem mục "s" ở menu).
//
// [2026-07-20] 2 thay đổi mặc định (theo yêu cầu: "mặc định lưu trên R2 nếu seed mới" +
// "thống kê cả ở R2"):
//   - `STORAGE_DRIVER` mặc định = 'r2' nếu `.env`/shell chưa set gì — audio MỚI seed tự
//     lên Cloudflare R2, không cần nhớ prefix `STORAGE_DRIVER=r2` mỗi lần chạy. Vẫn tôn
//     trọng nếu bạn set `STORAGE_DRIVER=local` rõ ràng (vd test tay trên máy dev).
//   - Báo cáo giờ có thêm mục "☁️ THỰC TẾ TRÊN CLOUDFLARE R2" — đếm object THẬT trên R2
//     (ListObjectsV2, không qua DB/ổ đĩa) vì ổ đĩa local có thể đã xóa sau khi đồng bộ,
//     không còn đối chiếu qua walkMp3 được nữa. Tự bỏ qua nếu chưa cấu hình đủ biến R2_*.
//
// Khi chạy `npm run seed:all`:
//   1. Kiểm tra DB (+ R2 nếu đã cấu hình) → báo cáo bao nhiêu % mỗi nhóm đã seed xong.
//   2. Hiện menu: seed riêng 1 nhóm · seed tất cả · đồng bộ audio local → R2 · thoát.
//   3. Sau mỗi lần seed, kiểm tra lại + hiện menu mới (lặp đến khi bạn thoát).
//
// Các nhóm seed nội dung (theo thứ tự ưu tiên client cần):
//   - pron          Phát âm từ điển (pronunciations)
//   - curriculum    Câu + ví dụ giáo trình nền tảng (/learn)
//   - cefr          Ví dụ ngữ pháp CEFR (Roadmap)
//   - lessons-early Hội thoại 50 bài đầu (Luyện nói)
//   - patterns      Câu mẫu trang Cụm từ
//   - lessons-rest  Hội thoại các bài còn lại
//
// Cờ / biến môi trường (SEED nội dung):
//   --check  (CHECK=1)       Chỉ in báo cáo rồi thoát (không seed, không menu).
//   --verify (VERIFY=1)      Kiểm tra KỸ DB: đối chiếu 2 chiều (thiếu / thừa / lệch đường dẫn).
//   --clean-orphans          (kèm --verify) Xoá bản ghi + file THỪA (orphan) phát hiện được —
//                             mặc định CHỈ XEM TRƯỚC, thêm --yes để xoá thật. Vd sau đợt đổi
//                             tên giọng: female2/male2.mp3 không còn dùng nữa, chiếm dung
//                             lượng oan → npm run seed:all -- --verify --clean-orphans --yes
//   --all    (SEED_ALL=1/YES=1) Seed tất cả ngay, không hỏi menu (dùng cho CI/cron).
//   --force  (FORCE=1)       Tạo lại + ghi đè cả audio đã có (dùng chung cho cả seed VÀ sync R2).
//   LIMIT=20                 Giới hạn số tác vụ mỗi nhóm (debug).
//   VERIFY_DECRYPT=20        (kèm --verify) Tải + giải mã thử 20 file để chắc dùng được.
//   WORDS_FILE=...           Đọc danh sách từ cần phát âm từ file (retry lỗi).
//
// Cờ / biến môi trường (ĐỒNG BỘ audio local → R2 — cần STORAGE_DRIVER=r2):
//   --sync-r2  (SYNC_R2=1)   Chạy đồng bộ ngay, không hỏi menu (dùng cho CI/cron).
//   --dry-run  (DRY_RUN=1)   (kèm --sync-r2) Chỉ ĐẾM, không tải lên R2/ghi DB.
//   BUCKET=tts-cache         (kèm --sync-r2) Chỉ 1 bucket (tts-cache | pronunciations).
//
// Cờ / biến môi trường (KIỂM TRA + DỌN file local đã đồng bộ R2 — trước ở
// scripts/verify-r2-sync.ts riêng, gộp vào đây 2026-07-20):
//   --verify-r2                Đối chiếu ổ đĩa VPS ↔ R2 thật (không đọc DB), in báo cáo.
//   --skip-size-check           (kèm --verify-r2) Chỉ kiểm tra CÓ MẶT, bỏ qua so kích thước.
//   --delete-verified           (kèm --verify-r2) Xem trước sẽ xoá bao nhiêu file local đã
//                                khớp R2 (CHƯA xoá gì — cần thêm --yes mới xoá thật).
//   --yes                       (kèm --delete-verified) Xác nhận xoá THẬT, từng file, chỉ
//                                file đã xác nhận khớp R2 — file thiếu/lệch luôn được giữ lại.
//
// Chạy: npm run seed:all   ·   Báo cáo: npm run seed:all -- --check   ·   Kiểm tra kỹ: npm run seed:all -- --verify
// Đồng bộ R2: STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run  (rồi bỏ --dry-run)
// Xoá local đã an toàn: npm run seed:all -- --verify-r2 --delete-verified (xem trước) rồi --yes
//
// 📖 Hướng dẫn chi tiết (báo cáo / remap / verify / R2): docs/seed-guide.md

import * as crypto from 'node:crypto'
import * as dotenv from 'dotenv'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as readline from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import cliProgress from 'cli-progress'
import { S3Client, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3'
import {
  generateAudioFromGoogle,
  hasGoogleTtsKey,
  probeApiKeys,
  setActiveKeyPool,
  VOICE_IDS,
  VOICE_VERSION,
  DEFAULT_SEED_VOICE_IDS,
  type Lang,
  type VoiceId,
} from '../api/_lib/googleTts.ts'
import { CEFR_LEVELS } from '../src/data/cefr.ts'
import { encryptAudio, decryptAudio } from '../api/_lib/ttsCrypto.ts'
import { saveAudio } from '../api/_lib/fileStorage.ts'
import type { QueryResultRow } from 'pg'
import { getPgPool } from '../api/_lib/pgPool.ts'
import { FOUNDATION } from '../src/data/curriculum.ts'
import { CHALLENGE_TOPICS } from '../src/data/challengeTopics.ts'
import {
  loadSubjectsInDisplayOrder,
  loadPatternSeedIndex,
  PREF_VOICE_IDS,
} from './_lib/patternOrder.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })

// Mặc định lưu audio MỚI seed lên Cloudflare R2 — không cần nhớ prefix
// `STORAGE_DRIVER=r2` mỗi lần chạy. Chỉ áp khi `.env`/shell CHƯA set gì (tôn trọng
// lựa chọn rõ ràng của người dùng, vd STORAGE_DRIVER=local để test tay trên máy dev).
if (!process.env.STORAGE_DRIVER) process.env.STORAGE_DRIVER = 'r2'

// ── Cấu hình ────────────────────────────────────────────────────────────────
// Pronunciations chỉ seed trước 8 giọng mặc định (4 nữ + 4 nam phổ biến nhất) — 6 giọng
// còn lại trong số 14 giọng hiện có (xem api/_lib/googleTts.ts) không seed trước, tự tạo
// lúc người dùng chủ động chọn.
const PRON_VOICE_IDS: VoiceId[] = DEFAULT_SEED_VOICE_IDS

const BATCH_SIZE = 50 // số tác vụ song song
const DELAY_MS = 0 // không cần delay
const RETRY_DELAY_MS = 5000 // nghỉ giữa vòng retry
const MAX_ROUNDS = 100
// Rate limit thích nghi — tự điều chỉnh theo lượng req thực của window trước:
//   429 xuất hiện  → nghỉ 60s, limit 180
//   req >= 180     → nghỉ 60s, limit 180
//   req < 180      → chạy liên tục (không nghỉ)
const RATE_LIMIT_DEFAULT = 180 // limit mặc định khi bắt đầu
const BASE_URL = process.env.BASE_URL || ''
const FORCE = process.argv.includes('--force') || process.env.FORCE === '1'
const CHECK_ONLY = process.argv.includes('--check') || process.env.CHECK === '1'
const VERIFY_ONLY = process.argv.includes('--verify') || process.env.VERIFY === '1'
// Xoá THẬT các bản ghi + file dư thừa (orphan) phát hiện được lúc --verify — mặc định
// (không có --yes) chỉ XEM TRƯỚC, không xoá gì. Dùng chung --yes với luồng sync R2 cũ.
const CLEAN_ORPHANS = process.argv.includes('--clean-orphans')
const SEED_ALL_FLAG =
  process.argv.includes('--all') || process.env.SEED_ALL === '1' || process.env.YES === '1'
const SYNC_R2_FLAG = process.argv.includes('--sync-r2') || process.env.SYNC_R2 === '1'
const SYNC_DRY_RUN = process.argv.includes('--dry-run') || process.env.DRY_RUN === '1'
const SYNC_ONLY_BUCKET = process.env.BUCKET || ''
const SYNC_BATCH_SIZE = 15 // upload song song mỗi đợt — vừa phải, tránh dồn ép R2 API
// Thư mục gốc chứa file local — phải khớp api/_lib/fileStorage.ts (getUploadsRoot).
const SYNC_UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads')
const VERIFY_R2_FLAG = process.argv.includes('--verify-r2')
const VERIFY_SKIP_SIZE_CHECK = process.argv.includes('--skip-size-check')
const VERIFY_DELETE_VERIFIED = process.argv.includes('--delete-verified')
const VERIFY_CONFIRM_YES = process.argv.includes('--yes')

const PRON_ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/seed-errors.json')
const PATTERN_ERRORS_FILE = path.join(PROJECT_ROOT, 'scripts/prefetch-tts-errors.json')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

// ── Nhóm (category) ─────────────────────────────────────────────────────────
type CatId =
  'pron' | 'curriculum' | 'cefr' | 'lessons-early' | 'patterns' | 'lessons-rest' | 'challenge'

// Thứ tự seed khi chạy --all (menu chọn riêng từng nhóm không phụ thuộc thứ tự này).
// "Cụm từ" đặt CUỐI CÙNG vì số lượng lớn nhất (~313k câu) — ưu tiên seed xong các nhóm
// nhỏ hơn (CEFR, hội thoại...) trước để có kết quả sớm, tránh dồn hết quota/thời gian
// vào 1 nhóm ngay từ đầu.
const CATEGORIES: { id: CatId; label: string }[] = [
  { id: 'pron', label: 'Phát âm từ điển (pronunciations)' },
  { id: 'curriculum', label: 'Câu + ví dụ giáo trình nền tảng (/learn)' },
  { id: 'cefr', label: 'Ví dụ ngữ pháp CEFR (Roadmap)' },
  { id: 'lessons-early', label: 'Hội thoại 50 bài đầu (Luyện nói)' },
  { id: 'lessons-rest', label: 'Hội thoại các bài còn lại' },
  { id: 'challenge', label: 'Câu mẫu Challenge 30 ngày' },
  { id: 'patterns', label: 'Câu mẫu trang Cụm từ' },
]

// ── Kiểu dữ liệu ────────────────────────────────────────────────────────────
interface PronTask {
  type: 'pron'
  cat: 'pron'
  word: string
  voice: VoiceId
}
interface PatternTask {
  type: 'pattern'
  cat: CatId
  text: string
  lang: Lang
  voice: VoiceId
}
type AnyTask = PronTask | PatternTask

// Tách thành các nhánh literal riêng để TypeScript narrow đúng về nhánh 'error'
// (gộp 'ok'|'skip'|'remapped' vào 1 nhánh khiến else không suy ra được .message).
type TaskResult =
  | { status: 'ok' }
  | { status: 'skip' }
  | { status: 'remapped' }
  | { status: 'error'; message: string }

// ── Hash cho pattern cache — phải khớp hoàn toàn với api/tts.ts ─────────────
// Hash đúng (mới): có VOICE_VERSION — dùng cho mọi entry mới
function hashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice + VOICE_VERSION)
    .digest('hex')
    .slice(0, 32)
}
// Hash cũ (sai): thiếu VOICE_VERSION — dùng để tìm entry đã seed trước đây (từ hồi
// VOICE_VERSION chưa tồn tại, trước cả đợt đổi tên giọng bên dưới).
function oldHashText(text: string, lang: Lang, voice: VoiceId): string {
  return crypto
    .createHash('sha256')
    .update(text + lang + voice)
    .digest('hex')
    .slice(0, 32)
}

// ── Đổi tên giọng 2026-07-21: 'female'/'male'/'female2'/'male2' → tên thật Chirp3-HD
// ('Kore'/'Puck'/'Aoede'/'Charon') + VOICE_VERSION 'chirp3hd-v2' → 'chirp3hd-v3'. Âm thanh
// SINH RA GIỐNG HỆT (cùng 1 giọng Google, chỉ đổi định danh trong app) — nên có thể "gắn
// nhãn lại" cache cũ dưới tên/hash MỚI thay vì gọi lại Google TTS tốn tiền.
const OLD_VOICE_VERSION = 'chirp3hd-v2'
const OLD_VOICE_ALIAS: Partial<Record<VoiceId, string>> = {
  Kore: 'female',
  Puck: 'male',
  Aoede: 'female2',
  Charon: 'male2',
}
// Hash theo lược đồ tên giọng CŨ (trước đợt đổi tên 2026-07-21) — null nếu voice này
// không tồn tại trước đợt đổi tên (10 giọng mới hoàn toàn, không có tiền thân).
function legacyVoiceNameHash(text: string, lang: Lang, voice: VoiceId): string | null {
  const oldVoiceName = OLD_VOICE_ALIAS[voice]
  if (!oldVoiceName) return null
  return crypto
    .createHash('sha256')
    .update(text + lang + oldVoiceName + OLD_VOICE_VERSION)
    .digest('hex')
    .slice(0, 32)
}

// ── Load dữ liệu ────────────────────────────────────────────────────────────
// Thứ tự ưu tiên seed TTS cache:
//   1. Curriculum sentences + examples  → /learn chạy ngay cho user đầu tiên
//   2. CEFR grammar examples            → Roadmap tab (/learn)
//   3. Lesson turns (50 bài đầu)        → Luyện nói beginner instant
//   4. Pattern sentences                → Cụm từ page
//   5. Lesson turns còn lại             → cache dần, ít urgent hơn
//   6. Câu mẫu Challenge 30 ngày        → trang /challenge, ít urgent nhất
//
// Lesson turns: mỗi turn chỉ seed ĐÚNG 1 giọng (voiceA hoặc voiceB) thay vì cả 4.
// Giống logic Lessons.tsx — speakerAGender/speakerBGender quyết định giọng từng nhân vật,
// nếu cùng giới thì B dùng giọng variant2 (female2/male2) để phân biệt.
// Kết quả: ~5,900 tasks thay vì ~160,000 (giảm 96%).
function loadPatternTasks(): PatternTask[] {
  const tasks: PatternTask[] = []
  const seen = new Set<string>()

  // voices: cho phép giới hạn giọng theo nhóm (vd. patterns chỉ cần female/male).
  const add = (rawText: string, lang: Lang, cat: CatId, voices: readonly VoiceId[] = VOICE_IDS) => {
    const text = rawText.trim()
    if (!text) return
    for (const voice of voices) {
      const key = `${text}|${lang}|${voice}`
      if (seen.has(key)) continue // bỏ qua giọng đã thêm, KHÔNG return (return sẽ rớt các giọng còn lại)
      seen.add(key)
      tasks.push({ type: 'pattern', cat, text, lang, voice })
    }
  }

  // ── Ưu tiên 1: curriculum (câu thông dụng + ví dụ từng từ) ────────────────
  // Phát qua KaraokeText/getVoicePref → chỉ 2 giọng female/male (xem PREF_VOICE_IDS).
  for (const circle of FOUNDATION) {
    for (const { en } of circle.sentences) add(en, 'en-US', 'curriculum', PREF_VOICE_IDS)
    for (const entry of circle.words) {
      if (entry.ex_en) add(entry.ex_en, 'en-US', 'curriculum', PREF_VOICE_IDS)
      if (entry.ex_vi) add(entry.ex_vi, 'vi-VN', 'curriculum', PREF_VOICE_IDS)
    }
  }

  // ── Ưu tiên 2: CEFR grammar examples → Roadmap tab ────────────────────────
  // Cũng phát qua KaraokeText/getVoicePref → chỉ 2 giọng female/male.
  for (const level of CEFR_LEVELS) {
    for (const unit of level.units) {
      for (const lesson of unit.grammar) {
        for (const { en, vi } of lesson.examples) {
          add(en, 'en-US', 'cefr', PREF_VOICE_IDS)
          add(vi, 'vi-VN', 'cefr', PREF_VOICE_IDS)
        }
      }
    }
  }

  // ── Ưu tiên 3 & 5: lesson turns — giọng đúng per nhân vật ─────────────────
  // Giống Lessons.tsx: voiceA = giới tính A; voiceB = variant2 nếu cùng giới, giọng kia nếu khác
  const lessonDir = path.join(PROJECT_ROOT, 'public/data/lessons')
  const lessonFiles = fs
    .readdirSync(lessonDir)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  let lessonCount = 0
  const laterLessonTasks: PatternTask[] = []

  type LessonRaw = {
    speakerAGender?: 'female' | 'male' | null
    speakerBGender?: 'female' | 'male' | null
    turns?: Array<{ speaker: string; en: string; vi: string }>
  }

  // Khớp đúng logic phân giọng ở client (src/pages/Lessons.tsx LessonView, src/components/
  // CefrLessonViews.tsx DialogueView): A lấy giọng ĐẦU của giới mình, B lấy giọng ĐẦU của
  // giới B — trừ khi B cùng giới với A thì lấy giọng THỨ 2 để 2 nhân vật luôn khác giọng.
  const FEMALE_VOICES: VoiceId[] = ['Kore', 'Aoede']
  const MALE_VOICES: VoiceId[] = ['Puck', 'Charon']
  const voicesOfGender = (g: 'female' | 'male') => (g === 'female' ? FEMALE_VOICES : MALE_VOICES)

  for (const file of lessonFiles) {
    const chunks = JSON.parse(fs.readFileSync(path.join(lessonDir, file), 'utf8')) as LessonRaw[]
    for (const lesson of chunks) {
      const gA = lesson.speakerAGender ?? 'female'
      const gB = lesson.speakerBGender ?? 'male'
      const voiceA: VoiceId = voicesOfGender(gA)[0]!
      const voiceB: VoiceId = gB === gA ? voicesOfGender(gB)[1]! : voicesOfGender(gB)[0]!

      const isEarly = lessonCount < 50
      const cat: CatId = isEarly ? 'lessons-early' : 'lessons-rest'
      const bucket = isEarly ? tasks : laterLessonTasks
      for (const turn of lesson.turns ?? []) {
        const voice = turn.speaker === 'A' ? voiceA : voiceB
        if (turn.en) {
          const text = turn.en.trim()
          if (!text) continue
          const key = `${text}|en-US|${voice}`
          if (!seen.has(key)) {
            seen.add(key)
            bucket.push({ type: 'pattern', cat, text, lang: 'en-US', voice })
          }
        }
        if (turn.vi) {
          const text = turn.vi.trim()
          if (!text) continue
          const key = `${text}|vi-VN|${voice}`
          if (!seen.has(key)) {
            seen.add(key)
            bucket.push({ type: 'pattern', cat, text, lang: 'vi-VN', voice })
          }
        }
      }
      lessonCount++
    }
  }

  // ── Ưu tiên 4: pattern sentences (Cụm từ page) — PHỔ BIẾN NHẤT TRƯỚC ────────
  // Ba điều chỉnh để seed đúng cái app thật sự dùng, trước tiên:
  //   • Chỉ 8 giọng mặc định (PREF_VOICE_IDS = DEFAULT_SEED_VOICE_IDS): trang Cụm từ
  //     dùng global voice pref, có thể là bất kỳ giọng nào trong 14 — nhưng chỉ seed
  //     trước 8 giọng phổ biến, 6 giọng còn lại tạo động khi user chọn.
  //   • Thứ tự hiển thị (loadSubjectsInDisplayOrder): I am, You are, We are, He is...
  //     lên trước; chủ thể hiếm seed sau → nếu seed dở dang vẫn có sẵn câu hay gặp nhất.
  //   • CHỈ seed câu THÔNG DỤNG NHẤT trong mỗi chủ thể (top N/100, xem seed-index.json —
  //     ghi bởi `npm run rank:patterns`, xếp hạng theo tần suất từ THẬT trong từ điển).
  //     1.000 chủ thể × 100 câu × 8 giọng × 2 ngôn ngữ = 1,6 TRIỆU file nếu seed hết — quá
  //     tốn. Câu KHÔNG nằm trong seed-index vẫn hoạt động bình thường, chỉ tự tạo audio
  //     (chậm hơn 1 chút) ở lần người dùng THỰC SỰ bấm nghe (cache-on-demand qua /api/tts).
  //     Chưa chạy rank:patterns lần nào (seed-index.json chưa tồn tại) → fallback seed ĐỦ
  //     100 câu/chủ thể như trước (an toàn, không vỡ hành vi cũ).
  const patternDir = path.join(PROJECT_ROOT, 'public/data/patterns')
  const patternSeedIndex = loadPatternSeedIndex(patternDir)
  if (!patternSeedIndex) {
    console.warn(
      '[seed-all] Chưa có public/data/patterns/seed-index.json (chạy `npm run rank:patterns`' +
        ' trước để chỉ seed câu thông dụng) — tạm seed ĐỦ 100 câu/chủ thể như cũ.',
    )
  }
  for (const subject of loadSubjectsInDisplayOrder(patternDir)) {
    const seedIdx = patternSeedIndex?.[subject.starter]
    const seedSet = seedIdx ? new Set(seedIdx) : null
    subject.sentences.forEach(({ en, vi }, idx) => {
      if (seedSet && !seedSet.has(idx)) return // câu không thông dụng — để cache-on-demand
      add(en, 'en-US', 'patterns', PREF_VOICE_IDS)
      add(vi, 'vi-VN', 'patterns', PREF_VOICE_IDS)
    })
  }

  // ── Ưu tiên 5: lesson turns còn lại ────────────────────────────────────────
  tasks.push(...laterLessonTasks)

  // ── Ưu tiên 6: câu mẫu Challenge 30 ngày (trang /challenge) — chỉ female/male ─
  for (const t of CHALLENGE_TOPICS) {
    for (const s of t.sampleEn) add(s, 'en-US', 'challenge', PREF_VOICE_IDS)
    for (const s of t.sampleVi) add(s, 'vi-VN', 'challenge', PREF_VOICE_IDS)
  }

  return tasks
}

function loadPronTasks(wordsFile?: string): PronTask[] {
  let words: string[]
  if (wordsFile) {
    // Retry từ file lỗi (seed-errors.json)
    const raw = JSON.parse(fs.readFileSync(wordsFile, 'utf-8')) as unknown[]
    words = raw.map((item) =>
      (typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase(),
    )
  } else {
    // Đọc từ public/data/dictionary/chunk-*.json
    const dir = path.join(PROJECT_ROOT, 'public/data/dictionary')
    const files = fs
      .readdirSync(dir)
      .filter((f) => /^chunk-\d+\.json$/.test(f))
      .sort()
    words = []
    for (const file of files) {
      const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as unknown[]
      for (const item of raw) {
        words.push(
          (typeof item === 'string' ? item : (item as { word: string }).word).toLowerCase(),
        )
      }
    }
  }
  // Curriculum words lên đầu → /learn hoạt động instant cho mọi user mới
  const curriculumWords = new Set(
    FOUNDATION.flatMap((c) => c.words.map((w) => w.word.toLowerCase())),
  )
  const tasks: PronTask[] = []
  const seen = new Set<string>()
  for (const word of words) {
    // Pronunciations chỉ cần 2 giọng (female/male) — female2/male2 dành cho TTS hội thoại
    for (const voice of PRON_VOICE_IDS) {
      const key = `${word}:${voice}`
      if (seen.has(key)) continue
      seen.add(key)
      tasks.push({ type: 'pron', cat: 'pron', word, voice })
    }
  }
  tasks.sort((a, b) => {
    const aHigh = curriculumWords.has(a.word) ? 0 : 1
    const bHigh = curriculumWords.has(b.word) ? 0 : 1
    return aHigh - bHigh
  })
  return tasks
}

// ── Đồng bộ audio local → Cloudflare R2 ─────────────────────────────────────
// Đẩy audio đang nằm trên ổ đĩa VPS (STORAGE_DRIVER=local, thư mục UPLOADS_DIR) lên
// Cloudflare R2 + TÁI TẠO dòng Postgres tương ứng (tts_cache/pronunciations). Gộp vào
// đây (trước ở scripts/sync-storage-to-r2.ts riêng, xóa 2026-07-20) vì cùng mục đích
// "đưa audio cache vào trạng thái sẵn sàng cho client" như phần seed nội dung ở trên.
//
// ⚠️ Nguồn dữ liệu là Ổ ĐĨA, không phải DB: quyết định 2026-07-19 ("bỏ qua migrate dữ
// liệu người dùng cũ") khiến Postgres tự host bắt đầu từ schema RỖNG dù uploads/ trên
// VPS vẫn còn audio cache từ trước cutover. Script quét ổ đĩa trực tiếp, suy ra
// (hash/lang/voice) hoặc (word/voice) từ TÊN FILE, rồi INSERT/UPDATE dòng DB.
//
// An toàn chạy lại nhiều lần: file đã có dòng DB trỏ R2 (không phải /uploads/) → bỏ
// qua, trừ khi --force. File local KHÔNG bị xóa sau khi đồng bộ.
type R2Bucket = 'tts-cache' | 'pronunciations'

function resolveSyncBuckets(): R2Bucket[] {
  const list = (SYNC_ONLY_BUCKET ? [SYNC_ONLY_BUCKET] : ['tts-cache', 'pronunciations']).filter(
    (b): b is R2Bucket => b === 'tts-cache' || b === 'pronunciations',
  )
  if (list.length === 0) {
    console.error(
      `❌ BUCKET không hợp lệ: ${SYNC_ONLY_BUCKET} (chỉ nhận tts-cache | pronunciations)`,
    )
    process.exit(1)
  }
  return list
}

// Quét đệ quy tìm mọi file .mp3 dưới 1 thư mục (đường dẫn TƯƠNG ĐỐI so với gốc). Gom vào
// `out` DÙNG CHUNG QUA THAM CHIẾU (không spread mảng con vào .push()) — với hàng chục nghìn
// file, `out.push(...bigArray)` tràn giới hạn số đối số của V8 (RangeError).
async function walkMp3(root: string, dir = '', out: string[] = []): Promise<string[]> {
  const full = path.join(root, dir)
  if (!fs.existsSync(full)) return out
  const entries = await fs.promises.readdir(full, { withFileTypes: true })
  for (const entry of entries) {
    const rel = dir ? `${dir}/${entry.name}` : entry.name
    if (entry.isDirectory()) await walkMp3(root, rel, out)
    else if (entry.isFile() && entry.name.endsWith('.mp3')) out.push(rel)
  }
  return out
}

// tts-cache: <lang>/<voice>/<hash>.mp3 — 3 phần cố định, suy trực tiếp từ đường dẫn.
function parseTtsCacheKey(key: string): { lang: string; voice: string; hash: string } | null {
  const parts = key.split('/')
  if (parts.length !== 3) return null
  const [lang, voice, file] = parts
  if (!lang || !voice || !file?.endsWith('.mp3')) return null
  return { lang, voice, hash: file.slice(0, -'.mp3'.length) }
}

// pronunciations: <word-encoded>-<voice>.mp3 — khớp suffix dài nhất trước
// (female2/male2 trước female/male) để tránh cắt nhầm từ có gạch nối kết thúc trùng ký tự.
const VOICE_SUFFIXES = [...VOICE_IDS].sort((a, b) => b.length - a.length)
function parsePronunciationKey(key: string): { word: string; voice: VoiceId } | null {
  if (!key.endsWith('.mp3')) return null
  const base = key.slice(0, -'.mp3'.length)
  for (const voice of VOICE_SUFFIXES) {
    const suffix = `-${voice}`
    if (base.endsWith(suffix)) {
      const encodedWord = base.slice(0, -suffix.length)
      if (!encodedWord) continue
      try {
        return { word: decodeURIComponent(encodedWord), voice }
      } catch {
        return null // encodeURIComponent lỗi (hiếm) — bỏ qua file này
      }
    }
  }
  return null
}

interface SyncCounters {
  skip: number
  uploaded: number
  parseError: number
  errors: number
}

const seenSyncErrorMessages = new Set<string>()
function logSyncSampleError(message: string): void {
  const key = message.slice(0, 100)
  if (seenSyncErrorMessages.has(key)) return
  seenSyncErrorMessages.add(key)
  if (seenSyncErrorMessages.size > 8) return
  process.stdout.write(`\n🔎 Mẫu lỗi mới: ${message.slice(0, 300)}\n`)
}

async function syncTtsCacheFile(key: string, counters: SyncCounters, samples: string[]) {
  const parsed = parseTtsCacheKey(key)
  if (!parsed) {
    counters.parseError++
    if (samples.length < 5) samples.push(key)
    return
  }
  const pool = getPgPool()
  if (!FORCE) {
    const { rows } = await pool.query<{ audio_url: string }>(
      'select audio_url from public.tts_cache where hash = $1',
      [parsed.hash],
    )
    if (rows[0] && !rows[0].audio_url.includes('/uploads/')) {
      counters.skip++
      return
    }
  }
  if (SYNC_DRY_RUN) {
    counters.uploaded++
    return
  }
  try {
    const localPath = path.join(SYNC_UPLOADS_ROOT, 'tts-cache', key)
    const buf = await fs.promises.readFile(localPath)
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const audioUrl = await saveAudio('tts-cache', key, arrayBuffer)
    await pool.query(
      `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
       values ($1, $2, $3, $4, now())
       on conflict (hash) do update set audio_url = excluded.audio_url, last_accessed_at = now()`,
      [parsed.hash, parsed.lang, parsed.voice, audioUrl],
    )
    counters.uploaded++
  } catch (err) {
    counters.errors++
    const message = err instanceof Error ? err.message : String(err)
    logSyncSampleError(message)
    if (samples.length < 5) samples.push(`${key} → ${message}`)
  }
}

async function syncPronunciationFile(key: string, counters: SyncCounters, samples: string[]) {
  const parsed = parsePronunciationKey(key)
  if (!parsed) {
    counters.parseError++
    if (samples.length < 5) samples.push(key)
    return
  }
  const pool = getPgPool()
  if (!FORCE) {
    const { rows } = await pool.query<{ audio_url: string }>(
      'select audio_url from public.pronunciations where word = $1 and voice = $2',
      [parsed.word, parsed.voice],
    )
    if (rows[0] && !rows[0].audio_url.includes('/uploads/')) {
      counters.skip++
      return
    }
  }
  if (SYNC_DRY_RUN) {
    counters.uploaded++
    return
  }
  try {
    const localPath = path.join(SYNC_UPLOADS_ROOT, 'pronunciations', key)
    const buf = await fs.promises.readFile(localPath)
    const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
    const audioUrl = await saveAudio('pronunciations', key, arrayBuffer)
    // voice_version = VOICE_VERSION hiện tại — GIẢ ĐỊNH (không xác nhận được từ tên
    // file), chấp nhận được vì hằng số này hiếm đổi.
    await pool.query(
      `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
       values ($1, $2, $3, 'en-US', $4, now())
       on conflict (word, voice) do update set audio_url = excluded.audio_url, last_accessed_at = now()`,
      [parsed.word, parsed.voice, audioUrl, VOICE_VERSION],
    )
    counters.uploaded++
  } catch (err) {
    counters.errors++
    const message = err instanceof Error ? err.message : String(err)
    logSyncSampleError(message)
    if (samples.length < 5) samples.push(`${key} → ${message}`)
  }
}

async function syncR2Bucket(bucket: R2Bucket): Promise<SyncCounters> {
  process.stdout.write(`\n📤 Bucket "${bucket}" — đang quét ổ đĩa...`)
  const files = await walkMp3(path.join(SYNC_UPLOADS_ROOT, bucket))
  console.log(` ${files.length.toLocaleString('vi-VN')} file .mp3`)

  const counters: SyncCounters = { skip: 0, uploaded: 0, parseError: 0, errors: 0 }
  const samples: string[] = []
  const syncFile = bucket === 'tts-cache' ? syncTtsCacheFile : syncPronunciationFile

  const bar = new cliProgress.SingleBar(
    {
      format: `  |{bar}| {percentage}% | {value}/{total} | ⏭{skip} ${SYNC_DRY_RUN ? 'sẽ tải' : '↑'}{uploaded} ⚠{parseError} ✗{errors}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(files.length, 0, { ...counters })

  for (let i = 0; i < files.length; i += SYNC_BATCH_SIZE) {
    await Promise.all(
      files.slice(i, i + SYNC_BATCH_SIZE).map((f) => syncFile(f, counters, samples)),
    )
    bar.update(Math.min(i + SYNC_BATCH_SIZE, files.length), { ...counters })
  }
  bar.stop()

  console.log(
    `  ⏭ Đã ở R2: ${counters.skip}  ${SYNC_DRY_RUN ? 'sẽ tải' : '↑ Đã tải lên'}: ${counters.uploaded}  ⚠ Tên file lạ (bỏ qua): ${counters.parseError}  ✗ Lỗi: ${counters.errors}`,
  )
  if (samples.length > 0) {
    console.log('     Ví dụ (tên lạ/lỗi):')
    for (const s of samples) console.log(`       • ${s}`)
  }
  return counters
}

async function runR2Sync(): Promise<void> {
  const missing = [
    'DATABASE_URL',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_BASE_URL',
  ].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    return
  }
  if (process.env.STORAGE_DRIVER !== 'r2') {
    console.error(
      '❌ Cần STORAGE_DRIVER=r2 khi chạy đồng bộ (saveAudio() mới upload lên R2) — vd:\n' +
        '   STORAGE_DRIVER=r2 npm run seed:all -- --sync-r2 --dry-run',
    )
    return
  }

  console.log(
    '🔄 Quét ổ đĩa VPS → đẩy audio lên Cloudflare R2 + tái tạo dòng DB' +
      (SYNC_DRY_RUN ? ' (DRY-RUN: chỉ đếm)' : '') +
      (FORCE ? ' (FORCE: ghi đè cả dòng đã ở R2)' : ''),
  )
  console.log(`📁 Thư mục nguồn: ${SYNC_UPLOADS_ROOT}`)

  const buckets = resolveSyncBuckets()
  const totals: SyncCounters = { skip: 0, uploaded: 0, parseError: 0, errors: 0 }
  for (const bucket of buckets) {
    const c = await syncR2Bucket(bucket)
    totals.skip += c.skip
    totals.uploaded += c.uploaded
    totals.parseError += c.parseError
    totals.errors += c.errors
  }

  console.log('\n──────────────────────────────────────────────')
  console.log(
    `📦 TỔNG: ⏭ đã ở R2 ${totals.skip}  ${SYNC_DRY_RUN ? 'sẽ tải' : '↑ đã tải lên'} ${totals.uploaded}  ⚠ tên lạ ${totals.parseError}  ✗ lỗi ${totals.errors}`,
  )
  if (SYNC_DRY_RUN) {
    console.log('ℹ️  Đây là DRY-RUN — chưa tải/ghi gì. Bỏ --dry-run để chạy thật.')
  } else if (totals.errors === 0) {
    console.log('✅ Mọi audio trên ổ đĩa đã có dòng DB trỏ về R2.')
  }
}

// ── Kiểm tra ổ đĩa ↔ R2 THẬT (không qua DB) + tuỳ chọn dọn file local đã an toàn ────
// Khác runR2Sync() (đối chiếu qua audio_url trong DB), hàm này liệt kê TRỰC TIẾP object
// trên R2 (ListObjectsV2) rồi so với file trên ổ đĩa — bắt được cả trường hợp DB đã trỏ
// R2 nhưng file thật ra chưa lên/bị hỏng. Chỉ dùng để XÁC NHẬN trước khi xoá local lấy
// lại dung lượng — KHÔNG đụng gì tới nội dung R2/DB.
function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Thiếu R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY trong .env')
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
}

// Liệt kê TOÀN BỘ key trong bucket R2 (phân trang 1000 key/lần) → Map<key, size byte>.
async function listAllR2Objects(): Promise<Map<string, number>> {
  const r2Bucket = process.env.R2_BUCKET
  if (!r2Bucket) throw new Error('Thiếu R2_BUCKET trong .env')
  const client = getR2Client()
  const result = new Map<string, number>()
  let continuationToken: string | undefined
  let pages = 0
  process.stdout.write('📥 Đang liệt kê object trên R2...')
  do {
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: r2Bucket, ContinuationToken: continuationToken }),
    )
    for (const obj of res.Contents ?? []) {
      if (obj.Key) result.set(obj.Key, obj.Size ?? -1)
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
    pages++
    if (pages % 20 === 0)
      process.stdout.write(
        `\r📥 Đang liệt kê object trên R2... ${result.size.toLocaleString('vi-VN')} object`,
      )
  } while (continuationToken)
  console.log(`\r📥 R2 hiện có ${result.size.toLocaleString('vi-VN')} object.                    `)
  return result
}

// Xoá file audio thật (local hoặc R2) ứng với 1 audio_url — tự nhận diện driver theo URL
// (R2_PUBLIC_BASE_URL khớp tiền tố → R2, ngược lại → local dưới UPLOADS_DIR).
async function deleteStoredFile(audioUrl: string): Promise<void> {
  const r2Base = (process.env.R2_PUBLIC_BASE_URL || '').replace(/\/$/, '')
  if (r2Base && audioUrl.startsWith(r2Base + '/')) {
    const bucket = process.env.R2_BUCKET
    if (!bucket) throw new Error('Thiếu R2_BUCKET trong .env')
    const key = audioUrl.slice(r2Base.length + 1)
    await getR2Client().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    return
  }
  const marker = '/uploads/'
  const idx = audioUrl.indexOf(marker)
  if (idx === -1) throw new Error(`Không nhận diện được đường dẫn lưu trữ: ${audioUrl}`)
  const relative = audioUrl.slice(idx + marker.length)
  await fs.promises.unlink(path.join(SYNC_UPLOADS_ROOT, relative))
}

// Xoá THẬT các bản ghi + file dư thừa (orphan) phát hiện ở verifyDb() — mặc định (không có
// --yes) CHỈ XEM TRƯỚC, không xoá gì. CHỈ xoá file nếu KHÔNG có bản ghi nào khác (còn nằm
// trong tập kỳ vọng) đang trỏ tới CÙNG audio_url — trường hợp remap giọng mới DÙNG LẠI
// audio_url của giọng cũ (xem OLD_VOICE_ALIAS) thì xoá file sẽ làm hỏng cả bản ghi đang
// dùng thật, nên những trường hợp đó chỉ xoá bản ghi DB thừa, GIỮ NGUYÊN file.
async function cleanOrphans(
  ttsOrphans: { hash: string; audio_url: string }[],
  pronOrphansList: { word: string; voice: string; audio_url: string }[],
  activeAudioUrls: Set<string>,
): Promise<void> {
  const pool = getPgPool()
  const totalCandidates = ttsOrphans.length + pronOrphansList.length
  if (totalCandidates === 0) {
    console.log('\n✨ Không có bản ghi dư thừa nào để dọn.')
    return
  }

  const fileDeletable = [...ttsOrphans, ...pronOrphansList].filter(
    (r) => !activeAudioUrls.has(r.audio_url),
  ).length

  if (!VERIFY_CONFIRM_YES) {
    console.log(
      `\n👀 XEM TRƯỚC (--clean-orphans): sẽ xoá ${totalCandidates} bản ghi DB` +
        ` (${fileDeletable} kèm xoá file thật — ${totalCandidates - fileDeletable} bản ghi` +
        ` còn lại dùng CHUNG file với bản ghi đang hoạt động nên GIỮ LẠI file, chỉ xoá bản` +
        ` ghi thừa). Thêm --yes để xoá thật (vd: npm run seed:all -- --verify --clean-orphans --yes).`,
    )
    return
  }

  console.log(`\n🗑️  Đang xoá ${totalCandidates} bản ghi dư thừa (--yes đã bật)...`)
  let filesDeleted = 0
  let fileErrors = 0
  let rowsDeleted = 0

  for (const r of ttsOrphans) {
    if (!activeAudioUrls.has(r.audio_url)) {
      try {
        await deleteStoredFile(r.audio_url)
        filesDeleted++
      } catch (err) {
        fileErrors++
        console.error(
          `❌ Không xoá được file ${r.audio_url}: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }
    await pool.query('delete from public.tts_cache where hash = $1', [r.hash])
    rowsDeleted++
  }
  for (const r of pronOrphansList) {
    if (!activeAudioUrls.has(r.audio_url)) {
      try {
        await deleteStoredFile(r.audio_url)
        filesDeleted++
      } catch (err) {
        fileErrors++
        console.error(
          `❌ Không xoá được file ${r.audio_url}: ${err instanceof Error ? err.message : String(err)}`,
        )
      }
    }
    await pool.query('delete from public.pronunciations where word = $1 and voice = $2', [
      r.word,
      r.voice,
    ])
    rowsDeleted++
  }

  console.log(
    `✅ Đã xoá ${rowsDeleted} bản ghi DB, ${filesDeleted} file` +
      (fileErrors ? `, ❌ ${fileErrors} file lỗi (xem log ở trên).` : '.'),
  )
}

interface VerifyLocalFile {
  bucket: R2Bucket
  rel: string
  fullPath: string
  r2Key: string
}

async function runVerifyR2(): Promise<void> {
  if (VERIFY_DELETE_VERIFIED && !VERIFY_CONFIRM_YES) {
    console.log('ℹ️  Chế độ XEM TRƯỚC (--delete-verified không kèm --yes) — sẽ KHÔNG xoá gì.\n')
  }

  const r2Objects = await listAllR2Objects()

  const localFiles: VerifyLocalFile[] = []
  for (const bucket of ['tts-cache', 'pronunciations'] as R2Bucket[]) {
    const rels = await walkMp3(path.join(SYNC_UPLOADS_ROOT, bucket))
    for (const rel of rels) {
      localFiles.push({
        bucket,
        rel,
        fullPath: path.join(SYNC_UPLOADS_ROOT, bucket, rel),
        r2Key: `${bucket}/${rel}`,
      })
    }
  }
  console.log(
    `📁 Ổ đĩa VPS có ${localFiles.length.toLocaleString('vi-VN')} file .mp3 (2 thư mục cộng lại).\n`,
  )

  const missing: VerifyLocalFile[] = []
  const sizeMismatch: VerifyLocalFile[] = []
  const verified: VerifyLocalFile[] = []

  const bar = new cliProgress.SingleBar(
    { format: '  |{bar}| {percentage}% | {value}/{total}', hideCursor: true },
    cliProgress.Presets.shades_classic,
  )
  bar.start(localFiles.length, 0)

  for (let i = 0; i < localFiles.length; i++) {
    const f = localFiles[i]!
    const r2Size = r2Objects.get(f.r2Key)
    if (r2Size === undefined) {
      missing.push(f)
    } else if (!VERIFY_SKIP_SIZE_CHECK) {
      const localSize = (await fs.promises.stat(f.fullPath)).size
      if (localSize !== r2Size) sizeMismatch.push(f)
      else verified.push(f)
    } else {
      verified.push(f)
    }
    if (i % 500 === 0) bar.update(i)
  }
  bar.update(localFiles.length)
  bar.stop()

  console.log('\n──────────────────────────────────────────────')
  console.log(`✅ Khớp R2 (an toàn): ${verified.length.toLocaleString('vi-VN')}`)
  console.log(`❌ THIẾU trên R2: ${missing.length.toLocaleString('vi-VN')}`)
  console.log(`⚠️  Kích thước LỆCH: ${sizeMismatch.length.toLocaleString('vi-VN')}`)

  if (missing.length > 0) {
    console.log('\n   Ví dụ file thiếu trên R2:')
    for (const f of missing.slice(0, 10)) console.log(`     • ${f.r2Key}`)
  }
  if (sizeMismatch.length > 0) {
    console.log('\n   Ví dụ file lệch kích thước:')
    for (const f of sizeMismatch.slice(0, 10)) console.log(`     • ${f.r2Key}`)
  }

  const allSafe = missing.length === 0 && sizeMismatch.length === 0
  if (allSafe) {
    console.log('\n🎉 TOÀN BỘ file local đã có bản khớp trên R2 — an toàn để xoá local.')
  } else {
    console.log(
      `\n⛔ CHƯA an toàn xoá toàn bộ — còn ${missing.length + sizeMismatch.length} file chưa khớp R2.` +
        ' Chạy lại đồng bộ (menu "s" hoặc --sync-r2, không cần --force) rồi verify lại.',
    )
  }

  if (!VERIFY_DELETE_VERIFIED) {
    console.log(
      '\nℹ️  Muốn xoá file local đã xác nhận khớp R2: thêm --delete-verified (xem trước) rồi --yes (xoá thật).',
    )
    return
  }

  // Chỉ xoá TỪNG FILE đã verified — file missing/mismatch luôn được GIỮ LẠI dù dùng --delete-verified.
  if (verified.length === 0) {
    console.log('\nℹ️  Không có file nào để xoá (0 file đã xác nhận khớp R2).')
    return
  }
  if (!VERIFY_CONFIRM_YES) {
    console.log(
      `\n👀 XEM TRƯỚC: sẽ xoá ${verified.length.toLocaleString('vi-VN')} file local đã khớp R2 (chưa xoá — thêm --yes để xoá thật).`,
    )
    return
  }

  console.log(
    `\n🗑️  Đang xoá ${verified.length.toLocaleString('vi-VN')} file local đã xác nhận khớp R2...`,
  )
  let deleted = 0
  let deleteErrors = 0
  const delBar = new cliProgress.SingleBar(
    { format: '  |{bar}| {percentage}% | {value}/{total}', hideCursor: true },
    cliProgress.Presets.shades_classic,
  )
  delBar.start(verified.length, 0)
  for (let i = 0; i < verified.length; i++) {
    const f = verified[i]!
    try {
      await fs.promises.unlink(f.fullPath)
      deleted++
    } catch (err) {
      deleteErrors++
      console.error(
        `\n❌ Không xoá được ${f.fullPath}: ${err instanceof Error ? err.message : String(err)}`,
      )
    }
    if (i % 500 === 0) delBar.update(i)
  }
  delBar.update(verified.length)
  delBar.stop()
  console.log(
    `\n✅ Đã xoá ${deleted.toLocaleString('vi-VN')} file. ${deleteErrors > 0 ? `❌ Lỗi: ${deleteErrors}` : ''}`,
  )
  console.log('ℹ️  Chạy `du -sh uploads/` để xem dung lượng đã giải phóng.')
}

// ── Xử lý 1 tác vụ ──────────────────────────────────────────────────────────
async function processTask(task: AnyTask): Promise<TaskResult> {
  const pool = getPgPool()

  try {
    if (task.type === 'pron') {
      const { word, voice } = task

      // Trước khi gọi Google TTS: thử remap từ cache cũ dưới TÊN GIỌNG CŨ (đợt đổi tên
      // 2026-07-21: female→Kore, male→Puck...) — audio KHÔNG mã hoá (khác tts_cache) nên
      // chỉ cần copy nguyên audio_url sang dòng mới, không cần tải/upload lại gì cả.
      if (!FORCE) {
        const oldVoiceName = OLD_VOICE_ALIAS[voice]
        if (oldVoiceName) {
          const { rows: oldRows } = await pool.query<{ audio_url: string }>(
            'select audio_url from public.pronunciations where word = $1 and voice = $2',
            [word, oldVoiceName],
          )
          const oldAudioUrl = oldRows[0]?.audio_url
          if (oldAudioUrl) {
            await pool.query(
              `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
               values ($1, $2, $3, 'en-US', $4, now())
               on conflict (word, voice) do update set
                 audio_url = excluded.audio_url, voice_version = excluded.voice_version,
                 last_accessed_at = now()`,
              [word, voice, oldAudioUrl, VOICE_VERSION],
            )
            return { status: 'remapped' }
          }
        }
      }

      const audioBuffer = await generateAudioFromGoogle(word, voice, 'en-US')
      // encodeURIComponent — GIỐNG HỆT api/pronunciation.ts (API thật) — để hỗ trợ từ
      // có dấu (café, naïve...) trong URL, dù key thô vẫn hợp lệ với R2/local.
      const fileName = `${encodeURIComponent(word)}-${voice}.mp3`
      const audioUrl = await saveAudio('pronunciations', fileName, audioBuffer, BASE_URL)
      await pool.query(
        `insert into public.pronunciations (word, voice, audio_url, lang, voice_version, last_accessed_at)
         values ($1, $2, $3, 'en-US', $4, now())
         on conflict (word, voice) do update set
           audio_url = excluded.audio_url, voice_version = excluded.voice_version,
           last_accessed_at = now()`,
        [word, voice, audioUrl, VOICE_VERSION],
      )
      return { status: 'ok' }
    }

    // pattern task
    const { text, lang, voice } = task
    const hash = hashText(text, lang, voice)

    if (!FORCE) {
      const { rows } = await pool.query('select audio_url from public.tts_cache where hash = $1', [
        hash,
      ])
      if (rows.length > 0) return { status: 'skip' }
    }

    // Trước khi gọi Google TTS: thử remap từ cache cũ, theo 2 lược đồ hash cũ (thử lần
    // lượt, dừng ở lược đồ đầu tiên tìm thấy):
    //   1. Thiếu hẳn VOICE_VERSION (từ hồi khái niệm này chưa tồn tại)
    //   2. Đúng VOICE_VERSION cũ NHƯNG tên giọng cũ (đợt đổi tên 2026-07-21:
    //      female/male/female2/male2 → Kore/Puck/Aoede/Charon — CÙNG 1 giọng Google,
    //      chỉ đổi định danh trong app)
    // Nếu có → tải về → giải mã bằng hash cũ → re-encrypt bằng hash mới → upload.
    // Không tốn API quota, chỉ tốn băng thông Storage.
    if (!FORCE) {
      const legacyHashes = [
        oldHashText(text, lang, voice),
        legacyVoiceNameHash(text, lang, voice),
      ].filter((h): h is string => h !== null)

      for (const oldHash of legacyHashes) {
        const { rows: oldRows } = await pool.query<{ audio_url: string }>(
          'select audio_url from public.tts_cache where hash = $1',
          [oldHash],
        )
        const oldCached = oldRows[0]
        if (!oldCached?.audio_url) continue
        try {
          const res = await fetch(oldCached.audio_url)
          if (res.ok) {
            const plain = await decryptAudio(await res.arrayBuffer(), oldHash)
            const newCipher = await encryptAudio(plain, hash)
            const fileName = `${lang}/${voice}/${hash}.mp3`
            const audioUrl = await saveAudio('tts-cache', fileName, newCipher, BASE_URL)
            await pool.query(
              `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
               values ($1, $2, $3, $4, now())
               on conflict (hash) do update set
                 audio_url = excluded.audio_url, last_accessed_at = now()`,
              [hash, lang, voice, audioUrl],
            )
            return { status: 'remapped' }
          }
        } catch {
          // Remap thất bại (file hỏng, mạng lỗi...) → thử lược đồ kế tiếp / generate mới bên dưới
        }
      }
    }

    const audioBuffer = await generateAudioFromGoogle(text, voice, lang)
    const encrypted = await encryptAudio(audioBuffer, hash)
    const fileName = `${lang}/${voice}/${hash}.mp3`
    const audioUrl = await saveAudio('tts-cache', fileName, encrypted, BASE_URL)
    await pool.query(
      `insert into public.tts_cache (hash, lang, voice, audio_url, last_accessed_at)
       values ($1, $2, $3, $4, now())
       on conflict (hash) do update set
         audio_url = excluded.audio_url, last_accessed_at = now()`,
      [hash, lang, voice, audioUrl],
    )
    return { status: 'ok' }
  } catch (err) {
    return { status: 'error', message: err instanceof Error ? err.message : String(err) }
  }
}

// In ra MẪU lỗi thật ngay khi gặp (chỉ lần đầu mỗi loại) — trước đây script chỉ đếm số
// lỗi, không bao giờ lộ ra LÝ DO lỗi (kể cả file lỗi cuối cùng cũng chỉ lưu từ/câu, không
// lưu message), nên không ai đoán được là hết quota (429), lỗi mạng hay lỗi Storage/DB.
const seenErrorMessages = new Set<string>()
function logSampleError(message: string): void {
  const key = message.slice(0, 80)
  if (seenErrorMessages.has(key)) return
  seenErrorMessages.add(key)
  if (seenErrorMessages.size > 8) return // đủ mẫu, tránh spam nếu có nhiều loại lỗi khác nhau
  process.stdout.write(`\n🔎 Mẫu lỗi mới: ${message.slice(0, 200)}\n`)
}

// Trạng thái rate limit thích nghi — dùng chung trong 1 pass
interface RateState {
  limit: number // ngưỡng req hiện tại
  pauseMs: number // thời gian nghỉ hiện tại
  count: number // đếm req trong window hiện tại
  has429: boolean // window hiện tại có gặp lỗi 429 không
}

function nextRateState(prevReqs: number, prev429: boolean): { limit: number; pauseMs: number } {
  if (prev429) return { limit: 180, pauseMs: 62000 } // 429 → nghỉ 62s
  if (prevReqs >= 180) return { limit: 180, pauseMs: 62000 } // đầy window → nghỉ 62s
  return { limit: 180, pauseMs: 0 } // chưa đầy → liên tục
}

// ── Chạy 1 batch tác vụ + cập nhật progress bar ─────────────────────────────
async function runBatch(
  tasks: AnyTask[],
  failed: Array<{ task: AnyTask; message: string }>,
  counters: { ok: number; remapped: number; skip: number; errors: number },
  bar: cliProgress.SingleBar,
  processed: { value: number },
  total: number,
  rate: RateState,
): Promise<void> {
  const results = await Promise.all(tasks.map((t) => processTask(t)))
  let newReqs = 0
  results.forEach((result, idx) => {
    if (result.status === 'ok') {
      counters.ok++
      newReqs++
    } // gọi Google TTS → tính rate
    else if (result.status === 'remapped')
      counters.remapped++ // re-encrypt, không tốn API
    else if (result.status === 'skip') counters.skip++
    else {
      counters.errors++
      newReqs++
      if (result.message.includes('429')) rate.has429 = true
      logSampleError(result.message)
      failed.push({ task: tasks[idx]!, message: result.message }) // idx khớp tasks nên có
    }
  })
  rate.count += newReqs
  processed.value = Math.min(processed.value + tasks.length, total)
  bar.update(processed.value, { ...counters })
  if (DELAY_MS > 0) await sleep(DELAY_MS)
  // Kiểm tra ngưỡng rate limit
  if (rate.count >= rate.limit) {
    const prevReqs = rate.count
    const prev429 = rate.has429
    const next = nextRateState(prevReqs, prev429)
    rate.count = 0
    rate.has429 = false
    rate.limit = next.limit
    rate.pauseMs = next.pauseMs
    bar.stop()
    process.stdout.write(
      `\n⏸  ${prevReqs} req${prev429 ? ' [429!]' : ''} → nghỉ ${next.pauseMs / 1000}s, limit tiếp=${next.limit}\n`,
    )
    await sleep(next.pauseMs)
    bar.start(total, processed.value, { ...counters })
  }
}

// ── Chạy 1 pass trên 1 danh sách tác vụ (có thanh tiến độ) ───────────────────
async function runPass(
  tasks: AnyTask[],
  label: string,
): Promise<Array<{ task: AnyTask; message: string }>> {
  const total = tasks.length
  console.log(`\n${label} — ${total} tác vụ`)

  const bar = new cliProgress.SingleBar(
    {
      format:
        'Tiến độ |{bar}| {percentage}% | {value}/{total} | ✓{ok} ↺{remapped} ⏭{skip} ✗{errors}',
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic,
  )
  bar.start(total, 0, { ok: 0, remapped: 0, skip: 0, errors: 0 })

  const counters = { ok: 0, remapped: 0, skip: 0, errors: 0 }
  const processed = { value: 0 }
  const rate: RateState = { limit: RATE_LIMIT_DEFAULT, pauseMs: 0, count: 0, has429: false }
  const failed: Array<{ task: AnyTask; message: string }> = []

  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    await runBatch(tasks.slice(i, i + BATCH_SIZE), failed, counters, bar, processed, total, rate)
  }

  bar.stop()
  console.log(
    `   ✓ OK: ${counters.ok}  ↺ Remap: ${counters.remapped}  ⏭ Skip: ${counters.skip}  ✗ Lỗi: ${failed.length}`,
  )
  return failed
}

// ── Seed 1 danh sách: pass đầu + các vòng retry cho tới khi hết/ngừng giảm ───
async function seedWithRetry(tasks: AnyTask[], baseLabel: string): Promise<AnyTask[]> {
  if (tasks.length === 0) return []
  let failed = await runPass(tasks, `🟢 ${baseLabel} — Vòng 1`)
  let remaining = failed.map((f) => f.task)
  let prevErr = Infinity

  for (let round = 2; round <= MAX_ROUNDS && remaining.length > 0; round++) {
    if (remaining.length >= prevErr) {
      console.log(`\n⛔ Lỗi không giảm (${remaining.length}) — dừng retry.`)
      break
    }
    prevErr = remaining.length
    console.log(`\n⏳ Nghỉ ${RETRY_DELAY_MS / 1000}s...`)
    await sleep(RETRY_DELAY_MS)
    failed = await runPass(remaining, `🔄 ${baseLabel} — Vòng ${round} (còn ${remaining.length})`)
    remaining = failed.map((f) => f.task)
  }
  return remaining
}

// ── Đọc TẤT CẢ dòng 1 bảng (phân trang ỔN ĐỊNH theo khóa) ───────────────────
// Postgres tự host — phân trang bằng LIMIT/OFFSET vẫn cần ORDER BY theo khóa DUY
// NHẤT (orderCols) để thứ tự trang ổn định giữa các lần gọi:
//   • tts_cache       → ['hash']          (primary key)
//   • pronunciations  → ['word','voice']  (unique (word,voice))
// Không có ORDER BY ổn định → các trang có thể CHỒNG/LỌT dòng ngẫu nhiên → số
// dòng gom vào Set đổi mỗi lần chạy → báo cáo (và --verify) nhảy số.
async function fetchAllRows<T extends QueryResultRow>(
  table: string,
  columns: string,
  orderCols: string[],
): Promise<T[]> {
  const pool = getPgPool()
  const PAGE = 1000
  const out: T[] = []
  const orderBy = orderCols.join(', ')
  for (let offset = 0; ; offset += PAGE) {
    const { rows } = await pool.query<T>(
      `select ${columns} from public.${table} order by ${orderBy} limit ${PAGE} offset ${offset}`,
    )
    if (rows.length === 0) break
    out.push(...rows)
    if (rows.length < PAGE) break
  }
  return out
}

// ── Kiểm tra DB → tính done/total/remaining cho từng nhóm ────────────────────
interface CatStat {
  id: CatId
  label: string
  total: number
  done: number
  remaining: AnyTask[]
}

async function audit(allByCat: Map<CatId, AnyTask[]>): Promise<CatStat[]> {
  process.stdout.write('🔎 Đang kiểm tra DB (pronunciations + tts_cache)...')

  // Tập đã có trên DB
  const pronRows = await fetchAllRows<{ word: string; voice: string }>(
    'pronunciations',
    'word, voice',
    ['word', 'voice'],
  )
  const donePron = new Set(pronRows.map((r) => `${r.word}:${r.voice}`))
  const ttsRows = await fetchAllRows<{ hash: string }>('tts_cache', 'hash', ['hash'])
  const doneHash = new Set(ttsRows.map((r) => r.hash))

  process.stdout.write(` xong (${donePron.size} phát âm, ${doneHash.size} câu TTS)\n`)

  const isDone = (t: AnyTask): boolean =>
    t.type === 'pron'
      ? donePron.has(`${t.word}:${t.voice}`)
      : doneHash.has(hashText(t.text, t.lang, t.voice))

  const stats: CatStat[] = []
  for (const { id, label } of CATEGORIES) {
    const tasks = allByCat.get(id) ?? []
    const done = tasks.reduce((n, t) => n + (isDone(t) ? 1 : 0), 0)
    // FORCE: seed lại tất cả; bình thường: chỉ seed tác vụ chưa có
    const remaining = FORCE ? tasks.slice() : tasks.filter((t) => !isDone(t))
    stats.push({ id, label, total: tasks.length, done, remaining })
  }
  return stats
}

// ── In báo cáo tiến độ ──────────────────────────────────────────────────────
function bar10(pct: number): string {
  const filled = Math.round((pct / 100) * 10)
  return '▓'.repeat(filled) + '░'.repeat(10 - filled)
}

function printReport(stats: CatStat[]): void {
  let grandTotal = 0,
    grandDone = 0
  const labelWidth = Math.max(...CATEGORIES.map((c) => c.label.length))

  console.log('\n📊 BÁO CÁO TIẾN ĐỘ SEED (sẵn sàng cho client)')
  console.log('─'.repeat(labelWidth + 34))
  for (const s of stats) {
    grandTotal += s.total
    grandDone += s.done
    const pct = s.total === 0 ? 100 : (s.done / s.total) * 100
    const tag = s.total === 0 ? '∅' : pct >= 100 ? '✅' : '⏳'
    const counts = `${s.done}/${s.total}`.padStart(13)
    console.log(
      `  ${tag} ${s.label.padEnd(labelWidth)}  ${counts}  ${bar10(pct)} ${pct.toFixed(1).padStart(5)}%`,
    )
  }
  console.log('─'.repeat(labelWidth + 34))
  const gPct = grandTotal === 0 ? 100 : (grandDone / grandTotal) * 100
  const gCounts = `${grandDone}/${grandTotal}`.padStart(13)
  console.log(
    `  📦 ${'TỔNG CỘNG'.padEnd(labelWidth)}  ${gCounts}  ${bar10(gPct)} ${gPct.toFixed(1).padStart(5)}%`,
  )
  if (gPct >= 100)
    console.log('\n🎉 Tất cả đã seed xong — client dùng được ngay, không cần gọi TTS realtime.')
  else
    console.log(`\nℹ️  Còn ${(grandTotal - grandDone).toLocaleString('vi-VN')} tác vụ chưa seed.`)
}

// ── Thống kê THẬT trên Cloudflare R2 (đếm object thật, không qua DB/ổ đĩa) ──────
// Khác báo cáo ở trên (đếm DÒNG DB, tin audio_url là đúng): hàm này liệt kê TRỰC TIẾP
// object trên R2 — cần khi ổ đĩa local đã xóa (không còn đối chiếu được qua walkMp3 nữa),
// muốn biết THẬT SỰ đang có bao nhiêu file trên R2. Mỗi object là 1 key duy nhất trong
// Map (listAllR2Objects) nên không đếm trùng.
let cachedR2Counts: Record<string, number> | null = null
async function getR2Counts(forceRefresh = false): Promise<Record<string, number> | null> {
  if (cachedR2Counts && !forceRefresh) return cachedR2Counts
  const missing = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET'].filter(
    (k) => !process.env[k],
  )
  if (missing.length > 0) return null // R2 chưa cấu hình đủ — bỏ qua, không phải lỗi
  try {
    const objects = await listAllR2Objects()
    const counts: Record<string, number> = {}
    for (const key of objects.keys()) {
      const bucket = key.split('/')[0] ?? 'khác'
      counts[bucket] = (counts[bucket] ?? 0) + 1
    }
    cachedR2Counts = counts
    return counts
  } catch (err) {
    console.error(
      `⚠️  Không lấy được thống kê R2: ${err instanceof Error ? err.message : String(err)}`,
    )
    return null
  }
}

function printR2Report(r2Counts: Record<string, number> | null): void {
  if (!r2Counts) return // R2 chưa cấu hình trong .env — im lặng bỏ qua
  const total = Object.values(r2Counts).reduce((s, n) => s + n, 0)
  console.log('\n☁️  THỰC TẾ TRÊN CLOUDFLARE R2 (đếm object thật, không qua DB)')
  for (const [bucket, n] of Object.entries(r2Counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  • ${bucket}: ${n.toLocaleString('vi-VN')} file`)
  }
  console.log(`  📦 TỔNG trên R2: ${total.toLocaleString('vi-VN')} file`)
}

// ── KIỂM TRA KỸ DB: đối chiếu dữ liệu đã seed với tập KỲ VỌNG ────────────────
// Khác `audit()` (chỉ đếm có/thiếu). Hàm này đối chiếu HAI CHIỀU vì đã seed rất nhiều:
//   • Chiều thiếu : câu kỳ vọng nào CHƯA có trong DB (theo nhóm).
//   • Chiều thừa  : bản ghi nào trong DB KHÔNG còn nằm trong tập kỳ vọng
//                   (vd. female2/male2 của Cụm từ đã bỏ, hoặc VOICE_VERSION cũ) → "orphan".
//   • Nhất quán   : audio_url có đúng dạng `${lang}/${voice}/${hash}.mp3` không.
//   • (tùy chọn)  : VERIFY_DECRYPT=N → tải + giải mã thử N file để chắc dùng được thật.
async function verifyDb(allByCat: Map<CatId, AnyTask[]>): Promise<void> {
  console.log('\n🔬 KIỂM TRA KỸ DB — đối chiếu hash kỳ vọng với dữ liệu đã seed')

  // 1) Tập KỲ VỌNG: hash TTS (kèm VOICE_VERSION) + key phát âm
  const expectedTts = new Set<string>() // hash câu TTS kỳ vọng
  const expectedPron = new Set<string>() // `word:voice` phát âm kỳ vọng
  for (const { id } of CATEGORIES) {
    for (const t of allByCat.get(id) ?? []) {
      if (t.type === 'pron') expectedPron.add(`${t.word}:${t.voice}`)
      else expectedTts.add(hashText(t.text, t.lang, t.voice))
    }
  }

  // 2) Đọc DB (phân trang đầy đủ)
  process.stdout.write('   Đang đọc DB...')
  const ttsRows = await fetchAllRows<{
    hash: string
    lang: string
    voice: string
    audio_url: string
  }>('tts_cache', 'hash, lang, voice, audio_url', ['hash'])
  const pronRows = await fetchAllRows<{ word: string; voice: string; audio_url: string }>(
    'pronunciations',
    'word, voice, audio_url',
    ['word', 'voice'],
  )
  const dbHash = new Set(ttsRows.map((r) => r.hash))
  console.log(` xong (${ttsRows.length} câu TTS, ${pronRows.length} phát âm)`)

  // 3) Chiều THIẾU — theo nhóm
  const labelWidth = Math.max(...CATEGORIES.map((c) => c.label.length))
  console.log('\n📋 Câu kỳ vọng đã có trong DB chưa (theo nhóm):')
  let totalMissing = 0
  for (const { id, label } of CATEGORIES) {
    if (id === 'pron') continue
    const tasks = (allByCat.get(id) ?? []).filter((t): t is PatternTask => t.type === 'pattern')
    let present = 0,
      missing = 0
    for (const t of tasks) dbHash.has(hashText(t.text, t.lang, t.voice)) ? present++ : missing++
    totalMissing += missing
    const tag = tasks.length === 0 ? '∅' : missing === 0 ? '✅' : '⚠️'
    console.log(
      `  ${tag} ${label.padEnd(labelWidth)}  có ${present}/${tasks.length}  thiếu ${missing}`,
    )
  }
  // phát âm
  let pronPresent = 0
  for (const r of pronRows) if (expectedPron.has(`${r.word}:${r.voice}`)) pronPresent++
  console.log(
    `  ${pronPresent === expectedPron.size ? '✅' : '⚠️'} ${'Phát âm (pron)'.padEnd(labelWidth)}  có ${pronPresent}/${expectedPron.size}  thiếu ${expectedPron.size - pronPresent}`,
  )

  // 4) Chiều THỪA — orphan (DB có nhưng không còn kỳ vọng)
  const orphans = ttsRows.filter((r) => !expectedTts.has(r.hash))
  const orphanByVoice = new Map<string, number>()
  for (const r of orphans) {
    const k = `${r.lang}/${r.voice}`
    orphanByVoice.set(k, (orphanByVoice.get(k) ?? 0) + 1)
  }
  console.log(
    `\n🧹 Bản ghi tts_cache KHÔNG còn trong tập kỳ vọng: ${orphans.length}/${ttsRows.length}`,
  )
  if (orphans.length > 0) {
    for (const [k, n] of [...orphanByVoice.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     • ${k}: ${n}`)
    }
    console.log(
      '     (thường là female2/male2 đã bỏ ở curriculum/cefr/Cụm từ, hoặc VOICE_VERSION cũ — có thể xóa cho gọn)',
    )
  }

  // 4b) Chiều THỪA ở pronunciations (giống mục 4 nhưng cho bảng phát âm — trước đây
  // chỉ tts_cache có kiểm tra này, pronunciations bị bỏ sót). Ca điển hình sau đợt đổi
  // tên giọng 2026-07-21: dòng voice='female2'/'male2' còn sót lại (chưa từng remap vì
  // pronunciations trước giờ chỉ seed 2 giọng female/male, không có female2/male2) — vẫn
  // chiếm chỗ trên Storage dù app hiện tại không bao giờ đọc tới.
  const pronOrphans = pronRows.filter((r) => !expectedPron.has(`${r.word}:${r.voice}`))
  const pronOrphanByVoice = new Map<string, number>()
  for (const r of pronOrphans) {
    pronOrphanByVoice.set(r.voice, (pronOrphanByVoice.get(r.voice) ?? 0) + 1)
  }
  console.log(
    `\n🧹 Bản ghi pronunciations KHÔNG còn trong tập kỳ vọng: ${pronOrphans.length}/${pronRows.length}`,
  )
  if (pronOrphans.length > 0) {
    for (const [voice, n] of [...pronOrphanByVoice.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`     • ${voice}: ${n}`)
    }
    console.log(
      '     (thường là female2/male2 đã đổi tên (đợt 2026-07-21) — an toàn để xóa, app không còn đọc tới)',
    )
  }

  if (CLEAN_ORPHANS) {
    const activeAudioUrls = new Set<string>([
      ...ttsRows.filter((r) => expectedTts.has(r.hash)).map((r) => r.audio_url),
      ...pronRows.filter((r) => expectedPron.has(`${r.word}:${r.voice}`)).map((r) => r.audio_url),
    ])
    await cleanOrphans(orphans, pronOrphans, activeAudioUrls)
  }

  // 5) Nhất quán đường dẫn: audio_url phải chứa `${lang}/${voice}/${hash}.mp3`
  let pathBad = 0
  const badSample: string[] = []
  for (const r of ttsRows) {
    if (!r.audio_url || !r.audio_url.includes(`${r.lang}/${r.voice}/${r.hash}.mp3`)) {
      pathBad++
      if (badSample.length < 5) badSample.push(r.hash)
    }
  }
  console.log(
    `\n🔗 audio_url khớp lang/voice/hash: ${ttsRows.length - pathBad}/${ttsRows.length}` +
      (pathBad ? `  (✗ ${pathBad} lệch, vd: ${badSample.join(', ')})` : ' ✅'),
  )

  // 6) (tùy chọn) Giải mã thử N file để chắc dùng được — VERIFY_DECRYPT=20
  const sampleN = process.env.VERIFY_DECRYPT ? parseInt(process.env.VERIFY_DECRYPT, 10) : 0
  if (sampleN > 0) {
    // ⚠️ Ở STORAGE_DRIVER=local, audio_url thường là đường dẫn TƯƠNG ĐỐI
    // ('/uploads/...') khi seed/generate không đặt BASE_URL. Node `fetch` KHÔNG
    // nhận URL tương đối → phải ghép base, nếu không sẽ fail HẾT ngay ở bước tải
    // (chưa tới giải mã). Base lấy theo: VERIFY_BASE_URL > BASE_URL > VITE_SITE_URL.
    const verifyBase = (
      process.env.VERIFY_BASE_URL ||
      process.env.BASE_URL ||
      process.env.VITE_SITE_URL ||
      ''
    )
      .trim()
      .replace(/\/$/, '')
    const toAbsolute = (u: string): string =>
      /^https?:\/\//i.test(u)
        ? u
        : verifyBase
          ? `${verifyBase}${u.startsWith('/') ? '' : '/'}${u}`
          : u

    const pick = ttsRows.filter((r) => expectedTts.has(r.hash)).slice(0, sampleN)
    let okDec = 0
    const reasons = new Map<string, number>() // gom LÝ DO fail để biết hỏng ở khâu nào
    const samples: string[] = []
    for (const r of pick) {
      try {
        const url = toAbsolute(r.audio_url)
        if (!/^https?:\/\//i.test(url))
          throw new Error('URL_TƯƠNG_ĐỐI (đặt VERIFY_BASE_URL=https://...)')
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP_${res.status}`)
        const buf = await res.arrayBuffer()
        if (buf.byteLength < 32)
          throw new Error(`BODY_NGẮN_${buf.byteLength}B (có thể là trang lỗi, không phải audio)`)
        await decryptAudio(buf, r.hash) // giải mã bằng khoá suy từ hash
        okDec++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        const label = msg.split(/[:\n]/)[0]?.trim().slice(0, 40) || 'lỗi không rõ' // gom theo nhãn đầu
        reasons.set(label, (reasons.get(label) ?? 0) + 1)
        if (samples.length < 3) samples.push(`${r.audio_url.slice(0, 70)} → ${msg.slice(0, 90)}`)
      }
    }
    const failDec = pick.length - okDec
    console.log(`\n🔓 Giải mã thử ${pick.length} file (mẫu): ✓ ${okDec}  ✗ ${failDec}`)
    if (failDec > 0) {
      for (const [k, n] of [...reasons.entries()].sort((a, b) => b[1] - a[1]))
        console.log(`     • ${k}: ${n}`)
      for (const s of samples) console.log(`     ↳ ${s}`)
      console.log(
        '     Gợi ý: URL_TƯƠNG_ĐỐI / "Failed to parse URL" → đặt VERIFY_BASE_URL (vd domain production);',
      )
      console.log(
        '            HTTP_4xx/5xx → file chưa có trên Storage/Nginx; OperationError → sai master key hoặc file hỏng.',
      )
    }
  }

  // 7) Kết luận
  console.log('─'.repeat(labelWidth + 30))
  if (totalMissing === 0 && pathBad === 0) {
    console.log(
      '✅ DB KHỚP tập kỳ vọng: mọi câu cần thiết đã có, đường dẫn đúng.' +
        (orphans.length || pronOrphans.length
          ? ` (còn ${orphans.length + pronOrphans.length} bản ghi thừa có thể dọn: ${orphans.length} tts_cache + ${pronOrphans.length} pronunciations)`
          : ''),
    )
  } else {
    console.log(
      `⚠️  Chưa khớp: thiếu ${totalMissing} câu kỳ vọng` +
        (pathBad ? `, ${pathBad} đường dẫn lệch` : '') +
        `. Chạy \`npm run seed:all -- --all\` để bù.`,
    )
  }
}

// ── Ghi/xóa file lỗi sau khi seed ───────────────────────────────────────────
function writeErrorFiles(remaining: AnyTask[]): void {
  const pronLeft = remaining.filter((t): t is PronTask => t.type === 'pron')
  const patternLeft = remaining.filter((t): t is PatternTask => t.type === 'pattern')

  if (pronLeft.length > 0) {
    const words = [...new Set(pronLeft.map((t) => t.word))]
    fs.writeFileSync(PRON_ERRORS_FILE, JSON.stringify(words, null, 2))
    console.log(`⚠️  ${pronLeft.length} phát âm lỗi → scripts/seed-errors.json`)
  } else if (fs.existsSync(PRON_ERRORS_FILE)) fs.unlinkSync(PRON_ERRORS_FILE)

  if (patternLeft.length > 0) {
    const errors = patternLeft.map((t) => ({ text: t.text, lang: t.lang, voice: t.voice }))
    fs.writeFileSync(PATTERN_ERRORS_FILE, JSON.stringify(errors, null, 2))
    console.log(`⚠️  ${patternLeft.length} câu TTS lỗi → scripts/prefetch-tts-errors.json`)
  } else if (fs.existsSync(PATTERN_ERRORS_FILE)) fs.unlinkSync(PATTERN_ERRORS_FILE)
}

// ── Seed nhiều nhóm rồi báo kết quả ─────────────────────────────────────────
async function seedCategories(stats: CatStat[], picked: CatId[]): Promise<void> {
  const tasks = picked.flatMap((id) => stats.find((s) => s.id === id)?.remaining ?? [])
  if (tasks.length === 0) {
    console.log('\n✅ Các nhóm đã chọn không còn gì để seed.')
    return
  }
  const label =
    picked.length === CATEGORIES.length
      ? 'Seed TẤT CẢ'
      : `Seed ${picked.map((id) => CATEGORIES.find((c) => c.id === id)?.label).join(' + ')}`
  console.log(`\n🚀 ${label} — ${tasks.length} tác vụ${FORCE ? ' (FORCE: ghi đè)' : ''}`)
  const remaining = await seedWithRetry(tasks, label)
  writeErrorFiles(remaining)
  if (remaining.length === 0) console.log('\n🎉 Hoàn thành — không còn lỗi.')
  else console.log(`\n⚠️  Còn ${remaining.length} tác vụ chưa xong (xem file lỗi ở trên).`)
}

// ── Menu tương tác ──────────────────────────────────────────────────────────
async function interactiveMenu(allByCat: Map<CatId, AnyTask[]>): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  try {
    for (;;) {
      const stats = await audit(allByCat)
      printReport(stats)
      printR2Report(await getR2Counts())

      const pending = stats.filter((s) => s.remaining.length > 0)
      if (pending.length === 0 && !FORCE) {
        console.log('\n✨ Mọi nhóm nội dung đã seed đủ.')
      }

      console.log('\n── Chọn việc tiếp theo ──')
      stats.forEach((s, i) => {
        const left = s.remaining.length
        const mark = left === 0 ? '✔ đã đủ' : `còn ${left.toLocaleString('vi-VN')}`
        console.log(`  ${i + 1}) ${s.label}  (${mark})`)
      })
      console.log('  a) Seed TẤT CẢ nhóm còn thiếu')
      console.log('  s) Đồng bộ audio local → Cloudflare R2 (cần STORAGE_DRIVER=r2)')
      console.log('  v) Kiểm tra ổ đĩa ↔ R2 thật + xoá local đã an toàn (--yes mới xoá)')
      console.log('  r) Làm mới báo cáo')
      console.log('  q) Thoát')

      const ans = (await rl.question('\nNhập lựa chọn (số / a / s / v / r / q): '))
        .trim()
        .toLowerCase()

      if (ans === 'q' || ans === '') {
        console.log('👋 Thoát.')
        return
      }
      if (ans === 'r') continue
      if (ans === 's') {
        await runR2Sync()
        continue
      }
      if (ans === 'v') {
        await runVerifyR2()
        continue
      }
      if (ans === 'a') {
        await seedCategories(
          stats,
          CATEGORIES.map((c) => c.id),
        )
        continue
      }
      const n = parseInt(ans, 10)
      if (Number.isInteger(n) && n >= 1 && n <= stats.length) {
        await seedCategories(stats, [stats[n - 1]!.id])
      } else {
        console.log('❓ Lựa chọn không hợp lệ.')
      }
    }
  } finally {
    rl.close()
  }
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // 2 chế độ R2 không cần key TTS (không gọi Google) — tách trước các check khác.
  if (SYNC_R2_FLAG) {
    await runR2Sync()
    return
  }
  if (VERIFY_R2_FLAG) {
    await runVerifyR2()
    return
  }

  const missing = ['DATABASE_URL', 'TTS_ENCRYPTION_MASTER_KEY'].filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(`❌ Thiếu biến môi trường: ${missing.join(', ')}`)
    process.exit(1)
  }
  if (!hasGoogleTtsKey()) {
    console.error('❌ Thiếu biến môi trường: GOOGLE_TTS_API_KEY hoặc GOOGLE_TTS_API_KEYS')
    process.exit(1)
  }

  const wordsFile = process.env.WORDS_FILE
    ? path.resolve(PROJECT_ROOT, process.env.WORDS_FILE)
    : undefined
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : Infinity

  // Gom toàn bộ tác vụ theo nhóm (LIMIT cắt bớt mỗi nhóm khi debug)
  const allByCat = new Map<CatId, AnyTask[]>()
  for (const { id } of CATEGORIES) allByCat.set(id, [])
  allByCat.set('pron', loadPronTasks(wordsFile).slice(0, limit))
  for (const t of loadPatternTasks()) allByCat.get(t.cat)!.push(t)
  if (Number.isFinite(limit)) {
    for (const { id } of CATEGORIES) {
      if (id === 'pron') continue
      allByCat.set(id, allByCat.get(id)!.slice(0, limit))
    }
  }

  // ── Chế độ chỉ xem báo cáo ────────────────────────────────────────────────
  if (CHECK_ONLY) {
    printReport(await audit(allByCat))
    printR2Report(await getR2Counts())
    return
  }

  // ── Chế độ kiểm tra kỹ DB (đối chiếu 2 chiều, không seed) ──────────────────
  if (VERIFY_ONLY) {
    await verifyDb(allByCat)
    return
  }

  // ── Probe key TTS: chỉ xoay vòng qua key CÒN DÙNG ĐƯỢC lúc này ─────────────
  // Quota Google TTS có thể đã cạn từ lần seed trước trong ngày — probe trước (1 request
  // nhỏ/key) để loại luôn key đã cạn, tránh phí hàng loạt request 429 vào key đó suốt lượt chạy.
  console.log('🔑 Kiểm tra key TTS còn dùng được...')
  const { working, total } = await probeApiKeys()
  if (working.length === 0) {
    console.error(
      '❌ Không key GOOGLE_TTS nào dùng được lúc này (có thể tất cả đã hết quota) — thử lại sau.',
    )
    process.exit(1)
  }
  setActiveKeyPool(working)
  console.log(
    working.length === total.length
      ? `   ✓ ${working.length}/${total.length} key dùng được — xoay vòng đủ cả bể.`
      : `   ⚠️  ${working.length}/${total.length} key dùng được — ${total.length - working.length} key đã cạn quota, tạm loại khỏi vòng xoay lượt chạy này.`,
  )

  // ── Chế độ seed tất cả không hỏi (CI/cron) ────────────────────────────────
  if (SEED_ALL_FLAG) {
    const stats = await audit(allByCat)
    printReport(stats)
    await seedCategories(
      stats,
      CATEGORIES.map((c) => c.id),
    )
    // In lại báo cáo cuối để biết đã 100% chưa
    printReport(await audit(allByCat))
    printR2Report(await getR2Counts(true)) // làm mới — vừa upload thêm audio mới
    return
  }

  // ── Không có TTY (không gõ được) mà không kèm cờ → in báo cáo + hướng dẫn ──
  if (!process.stdin.isTTY) {
    printReport(await audit(allByCat))
    printR2Report(await getR2Counts())
    console.log('\nℹ️  Không có bàn phím tương tác. Chạy `npm run seed:all -- --all` để seed hết,')
    console.log('   hoặc `npm run seed:all -- --check` để chỉ xem báo cáo.')
    return
  }

  // ── Mặc định: menu tương tác ──────────────────────────────────────────────
  console.log('🔊 seed:all — báo cáo tiến độ + chọn việc (phát âm + TTS câu)')
  await interactiveMenu(allByCat)
}

main().catch((err) => {
  console.error('❌ Lỗi:', err)
  process.exit(1)
})
