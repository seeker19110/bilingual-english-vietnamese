// scripts/assign-word-freq.ts
// Script chạy 1 LẦN trên máy có file wordlist tần suất THẬT để gắn hạng tần suất
// (field "freq") cho từ vựng MỞ RỘNG (public/data/dictionary/chunk-*.json) — xem
// docs/research/cai-tien-lo-trinh-hoc.md mục V3. getCircles() (lib/curriculum.ts)
// dùng freq để sắp phần "Mở rộng" theo tần suất (luật Zipf) thay vì alphabet.
//
// QUAN TRỌNG: KHÔNG tự bịa dữ liệu tần suất — script này CHỈ đọc 1 wordlist THẬT
// bạn cung cấp (ví dụ NGSL — https://www.newgeneralservicelist.com, giấy phép
// CC BY — hoặc SUBTLEX-US cho phần còn lại). Không có wordlist thì KHÔNG chạy được.
//
// Định dạng wordlist hỗ trợ (truyền đường dẫn qua FREQ_LIST) — xem
// api/_lib/wordFreq.ts (parseWordRanks) để biết chi tiết + test:
//   - .txt: mỗi dòng 1 từ, ĐÃ SẮP THEO TẦN SUẤT GIẢM DẦN (dòng 1 = phổ biến nhất).
//   - .csv: có cột "word" và "rank" (dòng đầu là header).
//
// An toàn chạy lại: bỏ qua từ đã có field "freq" (idempotent). Ghi lại file chunk
// NGAY sau khi xử lý xong, không mất tiến độ khi Ctrl+C.
//
// Biến môi trường:
//   FREQ_LIST=đường-dẫn-tới-wordlist   (bắt buộc)
//   DICT_DIR=...                        đổi thư mục chunk (mặc định public/data/dictionary)
//
// Chạy: FREQ_LIST=data/ngsl.txt npm run tag:freq

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import { detectWordFreqFormat, parseWordRanks } from '../api/_lib/wordFreq.ts'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DICT_DIR = process.env.DICT_DIR
  ? path.resolve(PROJECT_ROOT, process.env.DICT_DIR)
  : path.join(PROJECT_ROOT, 'apps/dhcb/public/data/dictionary')

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

function main(): void {
  const listPathArg = process.env.FREQ_LIST
  if (!listPathArg) {
    console.error('❌ Thiếu FREQ_LIST — truyền đường dẫn wordlist tần suất thật (NGSL/SUBTLEX...).')
    console.error('   Ví dụ: FREQ_LIST=data/ngsl.txt npm run tag:freq')
    process.exit(1)
  }
  const listPath = path.resolve(PROJECT_ROOT, listPathArg)
  if (!fs.existsSync(listPath)) {
    console.error(`❌ Không tìm thấy file wordlist: ${listPath}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(listPath, 'utf-8')
  const ranks = parseWordRanks(raw, detectWordFreqFormat(listPath))
  console.log(
    `📋 Đã đọc ${ranks.size} từ có hạng tần suất từ ${path.relative(PROJECT_ROOT, listPath)}`,
  )

  const files = fs
    .readdirSync(DICT_DIR)
    .filter((f) => /^chunk-\d+\.json$/.test(f))
    .sort()
  if (files.length === 0) {
    console.error(`❌ Không tìm thấy chunk-*.json trong ${DICT_DIR}`)
    process.exit(1)
  }

  let totalAssigned = 0
  let totalSkippedAlready = 0
  let totalNotFound = 0

  for (const file of files) {
    const filePath = path.join(DICT_DIR, file)
    const entries = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DictEntry[]
    let fileChanged = false

    for (const e of entries) {
      if (e.freq != null) {
        totalSkippedAlready++
        continue
      }
      const rank = ranks.get(e.word.trim().toLowerCase())
      if (rank != null) {
        e.freq = rank
        totalAssigned++
        fileChanged = true
      } else {
        totalNotFound++
      }
    }

    if (fileChanged) fs.writeFileSync(filePath, JSON.stringify(entries))
  }

  console.log('\n📊 Kết quả:')
  console.log(`   ✅ Gắn freq mới      : ${totalAssigned}`)
  console.log(`   ⏭️  Đã có sẵn         : ${totalSkippedAlready}`)
  console.log(`   ❓ Không có trong wordlist (giữ nguyên, xếp cuối phần Mở rộng): ${totalNotFound}`)
}

main()
