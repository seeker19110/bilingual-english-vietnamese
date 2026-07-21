// scripts/rank-common-patterns.ts
// Xếp hạng "độ thông dụng" của 100 câu/chủ thể trong public/data/patterns/chunk-*.json
// (1.000 chủ thể × 100 câu = 100.000 câu — trang "Cụm từ") để CHỈ seed trước (npm run
// seed:all) những câu THÔNG DỤNG NHẤT, còn lại tạo audio khi người dùng thực sự bấm nghe
// (cache-on-demand qua /api/tts — vẫn hoạt động bình thường, chỉ chậm hơn 1 chút lần đầu).
//
// Vì sao cần: mỗi câu × 8 giọng mặc định (DEFAULT_SEED_VOICE_IDS) × 2 ngôn ngữ là 16 file
// audio — seed ĐỦ 100.000 câu sẽ ra 1.6 TRIỆU file, quá tốn thời gian/tiền Google TTS. Script
// này KHÔNG bịa "độ thông dụng" — dùng dữ liệu tần suất từ THẬT đã gắn sẵn trong từ điển
// (field "freq", xem scripts/assign-word-freq.ts + docs/research/cai-tien-lo-trinh-hoc.md):
// câu chứa nhiều từ tần suất cao (freq nhỏ = phổ biến) → điểm thấp hơn = thông dụng hơn.
// Từ KHÔNG có trong từ điển (tên riêng, cụm hiếm) bị phạt nặng (UNKNOWN_WORD_PENALTY).
//
// Kết quả ghi vào public/data/patterns/seed-index.json:
//   { "<starter>": [chỉ số câu trong mảng sentences, đã sắp tăng dần] }
// scripts/_lib/patternOrder.ts đọc file này để seed-all.ts biết seed câu nào.
//
// Chạy: npm run rank:patterns   (tùy chọn: TOP_N=30 npm run rank:patterns, mặc định 20/100)

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PATTERN_DIR = path.join(PROJECT_ROOT, 'public/data/patterns')
const DICT_DIR = path.join(PROJECT_ROOT, 'public/data/dictionary')

const TOP_N = Number(process.env.TOP_N) || 20
// Cao hơn freq thật lớn nhất trong từ điển (tối đa quan sát được ~10.000-12.000) — từ không
// có trong từ điển (tên riêng, biệt ngữ hiếm) bị đẩy score lên rất cao → câu bị coi là hiếm.
const UNKNOWN_WORD_PENALTY = 50_000

interface DictEntry {
  word: string
  freq?: number
}
interface Sentence {
  en: string
  vi: string
}
interface Subject {
  starter: string
  category: string
  color: string
  sentences: Sentence[]
}

function loadWordFreq(): Map<string, number> {
  const map = new Map<string, number>()
  const files = fs.readdirSync(DICT_DIR).filter((f) => /^chunk-\d+\.json$/.test(f))
  for (const f of files) {
    const entries = JSON.parse(fs.readFileSync(path.join(DICT_DIR, f), 'utf8')) as DictEntry[]
    for (const e of entries) {
      if (typeof e.freq !== 'number') continue
      const w = e.word.toLowerCase()
      const cur = map.get(w)
      if (cur === undefined || e.freq < cur) map.set(w, e.freq)
    }
  }
  return map
}

// Tách từ tiếng Anh — giữ dấu nháy đơn cho từ rút gọn (I'm, don't) để tra đúng dạng gốc
// nếu từ điển có lưu (thường không, nên phần lớn rơi vào nhánh unknown — chấp nhận được vì
// chỉ ảnh hưởng nhẹ tới điểm trung bình của cả câu).
function tokenize(en: string): string[] {
  return en.toLowerCase().match(/[a-z']+/g) ?? []
}

function scoreSentence(en: string, freq: Map<string, number>): number {
  const words = tokenize(en)
  if (words.length === 0) return UNKNOWN_WORD_PENALTY
  const total = words.reduce((sum, w) => sum + (freq.get(w) ?? UNKNOWN_WORD_PENALTY), 0)
  return total / words.length
}

function main(): void {
  const freq = loadWordFreq()
  console.log(`[rank:patterns] Đã nạp tần suất cho ${freq.size} từ.`)

  const files = fs
    .readdirSync(PATTERN_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()

  const seedIndex: Record<string, number[]> = {}
  let totalSubjects = 0
  const sampleLines: string[] = []

  for (const f of files) {
    const subjects = JSON.parse(fs.readFileSync(path.join(PATTERN_DIR, f), 'utf8')) as Subject[]
    for (const s of subjects) {
      totalSubjects++
      const scored = s.sentences.map((sent, idx) => ({
        idx,
        score: scoreSentence(sent.en, freq),
      }))
      scored.sort((a, b) => a.score - b.score)
      const top = scored.slice(0, TOP_N)
      seedIndex[s.starter] = top.map((x) => x.idx).sort((a, b) => a - b)

      if (sampleLines.length < 20) {
        const preview = top
          .slice(0, 5)
          .map((x) => s.sentences[x.idx]!.en)
          .join(' | ')
        sampleLines.push(`${s.starter}: ${preview}`)
      }
    }
  }

  const outPath = path.join(PATTERN_DIR, 'seed-index.json')
  fs.writeFileSync(outPath, JSON.stringify(seedIndex))

  console.log(
    `[rank:patterns] ✅ Đã ghi ${outPath} — ${totalSubjects} chủ thể, top ${TOP_N}/100 câu` +
      ` mỗi chủ thể (tổng ${totalSubjects * TOP_N}/${totalSubjects * 100} câu sẽ được seed trước).`,
  )
  console.log(`[rank:patterns] Ví dụ 20 chủ thể đầu (5 câu thông dụng nhất mỗi chủ thể):`)
  for (const line of sampleLines) console.log('  ' + line)
}

main()
