// scripts/gen-cefr-c1c2-vocab.ts
// Sinh src/data/cefrC1C2Vocab.json — các VÒNG TỪ VỰNG cho 2 cấp CEFR C1 & C2,
// LẤY TỪ TỪ ĐIỂN ĐÃ GẮN NHÃN (public/data/dictionary/chunk-*.json, field `level`).
//
// Vì sao lấy từ từ điển: 2.357 từ C1/C2 trong từ điển đều ĐÃ CÓ nghĩa tiếng Việt +
// câu ví dụ song ngữ (ex_en/ex_vi) + phiên âm + tần suất — do đã gắn nhãn qua các
// wordlist CEFR chuẩn (Octanove/CEFR-J/Words-CEFR-Dataset, xem data/cefrj + PROGRESS).
// Nhờ đó cấp C1/C2 dùng ĐÚNG từ vựng chuẩn CEFR mà không phải gõ tay lại.
//
// Cách gom: bỏ các từ đã có trong phần NỀN TẢNG thủ công (A1–B2, để không trùng),
// sắp theo TẦN SUẤT (freq tăng dần = thông dụng học trước, đúng luật Zipf), rồi
// cắt thành các "vòng" WORDS_PER_CIRCLE từ. Các vòng lại chia thành nhóm
// CIRCLES_PER_UNIT để gán cho từng "Phần" (unit) của cấp trong src/data/cefr.ts.
//
// Idempotent: khi đọc key từ vựng nền tảng, BỎ QUA chính các vòng do script này
// sinh (id bắt đầu "cefr-c1-"/"cefr-c2-") → chạy lại nhiều lần cho kết quả như nhau.
//
// Chạy: npx tsx scripts/gen-cefr-c1c2-vocab.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DictEntry } from '../src/types.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'public/data/dictionary')
const CURRICULUM_JSON = path.join(ROOT, 'public/data/curriculum.json')
const OUT = path.join(ROOT, 'src/data/cefrC1C2Vocab.json')

const WORDS_PER_CIRCLE = 16
const CIRCLES_PER_UNIT = 7
// Lọc nhiễu: vài từ RẤT thông dụng bị nguồn nội suy gắn nhầm nhãn C1/C2 (vd dạng
// biến thể "trying", "standing" hay modal "cannot"). Từ có hạng tần suất < ngưỡng
// này (tức nằm trong nhóm thông dụng nhất) KHÔNG thể là C1/C2 → loại. Từ THIẾU freq
// (hiếm tới mức không có hạng) vẫn giữ. Chỉ bỏ ~9 từ, phần còn lại đúng nâng cao.
const MIN_FREQ_RANK = 2000

const wordKey = (s: string) => s.trim().toLowerCase()

// ── 1. Nạp toàn bộ từ điển ────────────────────────────────────────────────
let dict: DictEntry[] = []
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  if (fs.existsSync(f)) dict = dict.concat(JSON.parse(fs.readFileSync(f, 'utf8')))
}

// ── 2. Tập từ đã có trong phần nền tảng thủ công (A1–B2) để KHỬ TRÙNG ──────
// Đọc từ curriculum.json hiện có nhưng BỎ QUA các vòng do chính script này sinh
// (id "cefr-c1-*"/"cefr-c2-*") → tái chạy không tự loại bỏ từ của mình.
const foundationKeys = new Set<string>()
if (fs.existsSync(CURRICULUM_JSON)) {
  const circles = JSON.parse(fs.readFileSync(CURRICULUM_JSON, 'utf8')) as {
    id: string
    words: { word: string }[]
  }[]
  for (const c of circles) {
    if (c.id.startsWith('cefr-c1-') || c.id.startsWith('cefr-c2-')) continue
    for (const w of c.words) foundationKeys.add(wordKey(w.word))
  }
}

// ── 3. Lọc từ C1/C2, khử trùng, sắp theo tần suất ─────────────────────────
function pick(level: 'C1' | 'C2'): DictEntry[] {
  const seen = new Set<string>()
  return dict
    .filter((e) => e.level === level && !foundationKeys.has(wordKey(e.word)))
    .filter((e) => e.freq == null || e.freq >= MIN_FREQ_RANK) // bỏ từ quá thông dụng (gắn nhầm)
    .filter((e) => {
      const k = wordKey(e.word)
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .sort((a, b) => {
      // freq nhỏ = thông dụng hơn, học trước; thiếu freq xếp sau cùng.
      if (a.freq == null && b.freq == null) return 0
      if (a.freq == null) return 1
      if (b.freq == null) return -1
      return a.freq - b.freq
    })
}

// Emoji xoay vòng cho các vòng từ vựng (chỉ để trang trí, không mang nghĩa).
const EMOJIS = ['📘', '📙', '📗', '📕', '📓', '📔', '🧠', '💡', '🔤', '✨']

// Cắt danh sách từ thành các "vòng" WORDS_PER_CIRCLE từ.
function toCircles(words: DictEntry[], level: 'C1' | 'C2') {
  const circles: {
    id: string
    titleVi: string
    titleEn: string
    emoji: string
    words: DictEntry[]
    sentences: never[]
  }[] = []
  for (let i = 0; i < words.length; i += WORDS_PER_CIRCLE) {
    const n = circles.length + 1
    circles.push({
      id: `cefr-${level.toLowerCase()}-${n}`,
      titleVi: `${level} · Từ vựng nâng cao ${n}`,
      titleEn: `${level} · Advanced vocab ${n}`,
      emoji: EMOJIS[(n - 1) % EMOJIS.length] as string,
      words: words.slice(i, i + WORDS_PER_CIRCLE),
      sentences: [], // phần nâng cao dùng câu ví dụ sẵn trong từng từ (giống "Mở rộng")
    })
  }
  return circles
}

// Chia mảng id vòng thành các NHÓM CIRCLES_PER_UNIT (mỗi nhóm = 1 "Phần"/unit).
function groupIds(ids: string[]): string[][] {
  const groups: string[][] = []
  for (let i = 0; i < ids.length; i += CIRCLES_PER_UNIT) {
    groups.push(ids.slice(i, i + CIRCLES_PER_UNIT))
  }
  return groups
}

const c1Words = pick('C1')
const c2Words = pick('C2')
const c1Circles = toCircles(c1Words, 'C1')
const c2Circles = toCircles(c2Words, 'C2')

const out = {
  _note:
    'SINH TỰ ĐỘNG bởi scripts/gen-cefr-c1c2-vocab.ts từ từ điển đã gắn nhãn CEFR. ' +
    'KHÔNG sửa tay — chạy lại script để cập nhật.',
  c1WordCount: c1Words.length,
  c2WordCount: c2Words.length,
  circles: [...c1Circles, ...c2Circles],
  c1UnitCircleIds: groupIds(c1Circles.map((c) => c.id)),
  c2UnitCircleIds: groupIds(c2Circles.map((c) => c.id)),
}

fs.writeFileSync(OUT, JSON.stringify(out))
console.log(
  `✅ cefrC1C2Vocab.json: C1 ${c1Words.length} từ / ${c1Circles.length} vòng / ${out.c1UnitCircleIds.length} nhóm · ` +
    `C2 ${c2Words.length} từ / ${c2Circles.length} vòng / ${out.c2UnitCircleIds.length} nhóm`,
)
