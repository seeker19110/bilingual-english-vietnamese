// scripts/gen-a1b2-extra-vocab.ts
// Sinh src/data/cefrA1B2ExtraVocab.json — các VÒNG TỪ VỰNG "Mở rộng" bổ sung cho
// 4 cấp CEFR A1/A2/B1/B2, LẤY TỪ TỪ ĐIỂN ĐÃ GẮN NHÃN
// (public/data/dictionary/chunk-*.json, field `level`).
//
// VÌ SAO CẦN SCRIPT NÀY: lộ trình A1–B2 vốn có phần "nền tảng" soạn tay
// (src/data/curriculum.ts, ~1.523 từ) đi kèm bài ngữ pháp. Nhưng từ điển có tới
// ~8.163 từ đã gắn nhãn A1–B2 — phần CÒN LẠI (~6.169 từ) trước đây bị dồn hết vào
// mục "Mở rộng" KHÔNG gắn cấp (chỉ hiện ở trang C2) → học xong A1–B2 nền tảng,
// người học không thấy hết từ vựng đã gắn nhãn đúng cấp của mình.
//
// Script này bổ sung các từ đó vào ĐÚNG trang cấp của chúng, dưới dạng 1 (hoặc vài)
// "Phần" (unit) TỪ VỰNG MỞ RỘNG ở cuối mỗi cấp — giống hệt cách C1/C2 đã làm
// (xem gen-cefr-c1c2-vocab.ts). Logic gom nhóm theo chủ đề dùng chung
// (scripts/lib/vocabTopics.ts).
//
// Idempotent: khi đọc key từ vựng nền tảng để khử trùng, BỎ QUA chính các vòng do
// script này sinh (id bắt đầu "cefr-a1-"/"cefr-a2-"/"cefr-b1-"/"cefr-b2-") → chạy
// lại nhiều lần cho kết quả như nhau.
//
// Chạy: npx tsx scripts/gen-a1b2-extra-vocab.ts   (an toàn để chạy lại — ghi đè)

import * as fs from 'node:fs'
import { writeJsonPretty } from '../lib/writeJson.ts'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DictEntry } from '../../apps/dhcb/src/types.ts'
import { wordKey, buildLevelGroups } from '../lib/vocabTopics.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = path.join(ROOT, 'apps/dhcb/public/data/dictionary')
const CURRICULUM_JSON = path.join(ROOT, 'apps/dhcb/public/data/curriculum.json')
const OUT = path.join(ROOT, 'apps/dhcb/src/data/cefrA1B2ExtraVocab.json')

const WORDS_PER_CIRCLE = 20 // = DAILY_GOAL (src/lib/curriculum.ts), khớp cỡ vòng nền tảng A1–B2
const MAX_CIRCLES_PER_UNIT = 5
const OWN_ID_PREFIXES = ['cefr-a1-', 'cefr-a2-', 'cefr-b1-', 'cefr-b2-']

type Level = 'A1' | 'A2' | 'B1' | 'B2'

// ── 1. Nạp toàn bộ từ điển ────────────────────────────────────────────────
let dict: DictEntry[] = []
for (let i = 0; i < 10; i++) {
  const f = path.join(DICT_DIR, `chunk-${String(i).padStart(3, '0')}.json`)
  if (fs.existsSync(f)) dict = dict.concat(JSON.parse(fs.readFileSync(f, 'utf8')))
}

// ── 2. Tập từ đã có trong lộ trình (nền tảng thủ công + vòng C1/C2 tự sinh) để
// KHỬ TRÙNG — BỎ QUA chính các vòng do script này sinh (để tái chạy idempotent).
const foundationKeys = new Set<string>()
if (fs.existsSync(CURRICULUM_JSON)) {
  const circles = JSON.parse(fs.readFileSync(CURRICULUM_JSON, 'utf8')) as {
    id: string
    words: { word: string }[]
  }[]
  for (const c of circles) {
    if (OWN_ID_PREFIXES.some((p) => c.id.startsWith(p))) continue
    for (const w of c.words) foundationKeys.add(wordKey(w.word))
  }
}

// ── 3. Lọc từ theo cấp, khử trùng, sắp theo tần suất ───────────────────────
// Khác C1/C2: KHÔNG lọc theo MIN_FREQ_RANK — từ A1–B2 vốn dĩ đã thông dụng, hạng
// tần suất thấp là bình thường (không phải dấu hiệu gắn nhầm nhãn).
function pick(level: Level): DictEntry[] {
  const seen = new Set<string>()
  return (
    dict
      .filter((e) => e.level === level && !foundationKeys.has(wordKey(e.word)))
      // Entry BIẾN THỂ (có base: went, geese…) chỉ để tra cứu — không thành thẻ học
      // riêng trong vòng từ vựng (tránh trùng thẻ với từ gốc trong SRS).
      .filter((e) => !e.base)
      .filter((e) => {
        const k = wordKey(e.word)
        if (seen.has(k)) return false
        seen.add(k)
        return true
      })
      .sort((a, b) => {
        if (a.freq == null && b.freq == null) return 0
        if (a.freq == null) return 1
        if (b.freq == null) return -1
        return a.freq - b.freq
      })
  )
}

const LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2']
const perLevel = LEVELS.map((lv) => {
  const words = pick(lv)
  const built = buildLevelGroups(
    `cefr-${lv.toLowerCase()}`,
    words,
    WORDS_PER_CIRCLE,
    MAX_CIRCLES_PER_UNIT,
  )
  return { lv, words, ...built }
})

const out = {
  _note:
    'SINH TỰ ĐỘNG bởi scripts/gen-a1b2-extra-vocab.ts từ từ điển đã gắn nhãn CEFR. ' +
    'KHÔNG sửa tay — chạy lại script để cập nhật.',
  a1WordCount: perLevel[0]!.words.length,
  a2WordCount: perLevel[1]!.words.length,
  b1WordCount: perLevel[2]!.words.length,
  b2WordCount: perLevel[3]!.words.length,
  circles: perLevel.flatMap((p) => p.circles),
  a1Units: perLevel[0]!.units,
  a2Units: perLevel[1]!.units,
  b1Units: perLevel[2]!.units,
  b2Units: perLevel[3]!.units,
}

await writeJsonPretty(OUT, out)
console.log(
  perLevel
    .map((p) => {
      const pctTopic =
        p.words.length > 0 ? Math.round((p.topicWordCount / p.words.length) * 100) : 0
      return `${p.lv} ${p.words.length} từ / ${p.circles.length} vòng / ${p.units.length} chủ đề (${pctTopic}% vào chủ đề)`
    })
    .join(' · '),
)
