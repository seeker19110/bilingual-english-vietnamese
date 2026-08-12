// scripts/gen-cefr-c1c2-vocab.ts
// Sinh src/data/cefrC1C2Vocab.json — các VÒNG TỪ VỰNG cho 2 cấp CEFR C1 & C2,
// LẤY TỪ TỪ ĐIỂN ĐÃ GẮN NHÃN (public/data/dictionary/chunk-*.json, field `level`).
//
// Vì sao lấy từ từ điển: 2.357 từ C1/C2 trong từ điển đều ĐÃ CÓ nghĩa tiếng Việt +
// câu ví dụ song ngữ (ex_en/ex_vi) + phiên âm + tần suất — do đã gắn nhãn qua các
// wordlist CEFR chuẩn (Octanove/CEFR-J/Words-CEFR-Dataset, xem data/cefrj + PROGRESS).
// Nhờ đó cấp C1/C2 dùng ĐÚNG từ vựng chuẩn CEFR mà không phải gõ tay lại.
//
// GOM THEO CHỦ ĐỀ: logic gom nhóm (chủ đề/loại từ + cắt vòng/Phần) dùng chung với
// scripts/gen-a1b2-extra-vocab.ts, xem scripts/lib/vocabTopics.ts.
//
// Idempotent: khi đọc key từ vựng nền tảng, BỎ QUA chính các vòng do script này
// sinh (id bắt đầu "cefr-c1-"/"cefr-c2-") → chạy lại nhiều lần cho kết quả như nhau.
//
// Chạy: npx tsx scripts/gen-cefr-c1c2-vocab.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DictEntry } from '../apps/english/src/types.ts'
import { wordKey, buildLevelGroups, POS_FALLBACK_ADVANCED } from './lib/vocabTopics.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'public/data/dictionary')
const CURRICULUM_JSON = path.join(ROOT, 'public/data/curriculum.json')
const OUT = path.join(ROOT, 'apps/english/src/data/cefrC1C2Vocab.json')

const WORDS_PER_CIRCLE = 16
// Trần số vòng mỗi "Phần" (unit): nhóm lớn (vd danh từ nâng cao) cắt thành nhiều
// Phần nhỏ để trang cấp không có unit khổng lồ, dễ học/dễ theo dõi tiến độ.
const MAX_CIRCLES_PER_UNIT = 5
// Lọc nhiễu: vài từ RẤT thông dụng bị nguồn nội suy gắn nhầm nhãn C1/C2 (vd dạng
// biến thể "trying", "standing" hay modal "cannot"). Từ có hạng tần suất < ngưỡng
// này (tức nằm trong nhóm thông dụng nhất) KHÔNG thể là C1/C2 → loại. Từ THIẾU freq
// (hiếm tới mức không có hạng) vẫn giữ.
// [Đo lại 2026-08-12] Ngưỡng này hiện loại 0 từ (không phải "~9 từ" như ghi chú cũ) — các từ
// gắn nhầm đã được sửa nhãn ở những đợt gắn nhãn CEFR sau đó. Giữ lại làm lưới an toàn: nếu
// một đợt gắn nhãn tương lai lại gán C1/C2 cho từ siêu thông dụng, nó sẽ tự chặn. Đo lại bằng
// cách đếm `e.freq != null && e.freq < MIN_FREQ_RANK` trên tập đã lọc `!e.base`.
const MIN_FREQ_RANK = 2000

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
  return (
    dict
      .filter((e) => e.level === level && !foundationKeys.has(wordKey(e.word)))
      // Entry BIẾN THỂ (có base: went, geese…) chỉ để tra cứu — không thành thẻ học
      // riêng trong vòng từ vựng (tránh trùng thẻ với từ gốc trong SRS).
      .filter((e) => !e.base)
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
  )
}

const c1Words = pick('C1')
const c2Words = pick('C2')
const c1 = buildLevelGroups(
  'cefr-c1',
  c1Words,
  WORDS_PER_CIRCLE,
  MAX_CIRCLES_PER_UNIT,
  POS_FALLBACK_ADVANCED,
)
const c2 = buildLevelGroups(
  'cefr-c2',
  c2Words,
  WORDS_PER_CIRCLE,
  MAX_CIRCLES_PER_UNIT,
  POS_FALLBACK_ADVANCED,
)

const out = {
  _note:
    'SINH TỰ ĐỘNG bởi scripts/gen-cefr-c1c2-vocab.ts từ từ điển đã gắn nhãn CEFR. ' +
    'KHÔNG sửa tay — chạy lại script để cập nhật.',
  c1WordCount: c1Words.length,
  c2WordCount: c2Words.length,
  circles: [...c1.circles, ...c2.circles],
  c1Units: c1.units,
  c2Units: c2.units,
}

fs.writeFileSync(OUT, JSON.stringify(out))
const pctC1 = Math.round((c1.topicWordCount / c1Words.length) * 100)
const pctC2 = Math.round((c2.topicWordCount / c2Words.length) * 100)
console.log(
  `✅ cefrC1C2Vocab.json: C1 ${c1Words.length} từ / ${c1.circles.length} vòng / ${c1.units.length} chủ đề (${pctC1}% vào chủ đề) · ` +
    `C2 ${c2Words.length} từ / ${c2.circles.length} vòng / ${c2.units.length} chủ đề (${pctC2}% vào chủ đề)`,
)
