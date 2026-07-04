// scripts/tag-word-frequency.ts
// Gắn HẠNG TẦN SUẤT (freq) cho từ vựng trong public/data/dictionary/chunk-*.json — dùng để
// sắp phần "Mở rộng" của lộ trình học theo tần suất TĂNG DẦN (từ thông dụng trước), đúng
// luật Zipf, thay vì giữ nguyên alphabet (V3, docs/research/cai-tien-lo-trinh-hoc.md).
//
// KHÔNG cần API key / mạng — đây là tra cứu OFFLINE thuần túy (khác scripts/tag-cefr-levels.ts
// cần gọi AI), nên an toàn chạy lại bất cứ lúc nào, không tốn quota/chi phí.
//
// Nguồn tần suất: SUBTLEX-US (gói npm `subtlex-word-frequencies`, giấy phép ISC) — 74.286 từ
// xếp theo tần suất xuất hiện trong phụ đề phim tiếng Anh (Brysbaert & New, 2009), một chuẩn
// tần suất được dùng rộng rãi trong nghiên cứu tâm lý ngôn ngữ. (Đã tìm NGSL — New General
// Service List, CC BY — nhưng không có gói npm hay nguồn tải trực tiếp ổn định trong môi
// trường chạy script; SUBTLEX-US một mình đã phủ liên tục từ thông dụng nhất tới hiếm nhất
// nên vẫn đáp ứng đúng mục tiêu sắp theo tần suất — đã trao đổi với người dùng, xem PROGRESS.md.)
//
// freq = HẠNG (1 = thông dụng nhất), KHÔNG phải số đếm thô — hạng ổn định hơn khi so sánh
// giữa các từ (số đếm thô chênh lệch cực lớn ở đầu bảng, vd "you" ~2.1 triệu lần).
//
// An toàn chạy lại (idempotent): ghi đè freq cho MỌI từ có trong SUBTLEX-US; từ không có
// trong SUBTLEX-US giữ nguyên freq cũ nếu có (thực tế hiếm xảy ra vì SUBTLEX-US phủ hầu hết
// từ tiếng Anh thông dụng, kể cả từ điển mở rộng ~10.000 từ của app).
//
// Chạy: npm run tag:freq

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

// `subtlex-word-frequencies` không có type khai báo (@types) — nạp bằng createRequire
// (CommonJS require) thay vì `import` ESM để khỏi cần JSON import assertion, rồi cast type tay.
const require = createRequire(import.meta.url)
const subtlex = require('subtlex-word-frequencies') as Array<{ word: string; count: number }>

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'public/data/dictionary')

interface DictEntry {
  word: string
  pos: string
  vi: string
  ex_en: string
  ex_vi: string
  ipa_en?: string
  ipa_vi?: string
  level?: string
  freq?: number
}

// Sắp lại theo count giảm dần cho chắc (không phụ thuộc thứ tự có sẵn trong gói) rồi đánh
// hạng 1-based. Trùng khoá sau khi hạ chữ thường (vd "I"/"i") → giữ hạng THẤP NHẤT (thông
// dụng nhất) vì đã sort giảm dần từ đầu nên gặp trước = hạng thấp hơn.
const sorted = [...subtlex].sort((a, b) => b.count - a.count)
const rankByWord = new Map<string, number>()
sorted.forEach((entry, i) => {
  const key = entry.word.toLowerCase()
  if (!rankByWord.has(key)) rankByWord.set(key, i + 1)
})

function main(): void {
  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  if (files.length === 0) {
    console.error(`❌ Không tìm thấy chunk-*.json trong ${DICT_DIR}`)
    process.exit(1)
  }

  console.log(
    `🚀 Gắn hạng tần suất SUBTLEX-US (${rankByWord.size.toLocaleString()} từ) cho ${files.length} chunk`,
  )

  let totalTagged = 0
  let totalNotFound = 0

  for (const file of files) {
    const filePath = path.join(DICT_DIR, file)
    const entries = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DictEntry[]
    let changed = false

    for (const e of entries) {
      const rank = rankByWord.get(e.word.toLowerCase())
      if (rank != null) {
        if (e.freq !== rank) {
          e.freq = rank
          changed = true
        }
        totalTagged++
      } else {
        totalNotFound++
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(entries))
      console.log(`  ✅ ${file}: đã ghi lại`)
    } else {
      console.log(`  ⏭️  ${file}: không đổi`)
    }
  }

  console.log(
    `\n✅ Xong: ${totalTagged.toLocaleString()} từ có freq, ${totalNotFound.toLocaleString()} từ không có trong SUBTLEX-US.`,
  )
}

main()
